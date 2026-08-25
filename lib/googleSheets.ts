import { google } from 'googleapis';
import { SheetRowData, TrackerStats } from './types';

// In-memory fallback storage in case Google Sheets is temporarily unreachable
const inMemoryRegistrations: SheetRowData[] = [];

/**
 * Initializes and returns a Google Sheets API client using a Service Account
 */
export function getGoogleSheetsClient() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!clientEmail || !privateKey || !sheetId) {
    console.warn(
      '⚠️ Google Sheets credentials (GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID) are missing or incomplete. Using fallback storage for now.'
    );
    return null;
  }

  // Handle escaped newlines or surrounding quotes in the private key
  privateKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email: clientEmail.trim(),
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  return { sheets, sheetId };
}

/**
 * Sanitizes user input to prevent CSV / Spreadsheet Formula Injection (=, +, -, @)
 */
function sanitizeForSheet(value: string | number): string | number {
  if (typeof value === 'number') return value;
  const str = String(value ?? '').trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

/**
 * Appends a new verified registration row to the Google Sheet.
 * Expected Columns: [Timestamp, 6-Digit ID, Name, Email, Phone, Age, Semester, Amount Paid, Payment ID, Status]
 */
export async function appendRegistrationToSheet(data: SheetRowData): Promise<{ success: boolean; mode: 'google_sheets' | 'fallback' }> {
  try {
    const client = getGoogleSheetsClient();
    const sheetTabName = process.env.GOOGLE_SHEET_NAME || 'Sheet1';

    if (!client) {
      // Add to local fallback storage
      inMemoryRegistrations.push(data);
      console.log('✅ Stored registration in fallback store:', data);
      return { success: true, mode: 'fallback' };
    }

    const { sheets, sheetId } = client;

    const rowValues = [
      data.timestamp,
      sanitizeForSheet(data.ticketId),
      sanitizeForSheet(data.name),
      sanitizeForSheet(data.email),
      sanitizeForSheet(data.phone),
      sanitizeForSheet(data.age),
      sanitizeForSheet(data.semester),
      data.amountPaid,
      sanitizeForSheet(data.paymentId),
      sanitizeForSheet(data.status),
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${sheetTabName}!A:J`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowValues],
      },
    });

    console.log(`✅ Appended registration #${data.ticketId} to Google Sheet successfully.`);
    return { success: true, mode: 'google_sheets' };
  } catch (error) {
    console.error('❌ Error appending row to Google Sheets:', error);
    // Even if Google Sheets fails, preserve in in-memory list to not block the user's payment completion
    inMemoryRegistrations.push(data);
    return { success: false, mode: 'fallback' };
  }
}

/**
 * Fetches the event collection stats from Google Sheet:
 * Computes the total money collected (sum of Amount Paid / Column H) and participant count.
 */
export async function getEventStatsFromSheet(): Promise<TrackerStats> {
  const defaultTargetGoal = Number(process.env.NEXT_PUBLIC_COLLECTION_GOAL) || 30000;
  const getISTTime = () => new Date().toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  try {
    const client = getGoogleSheetsClient();
    const sheetTabName = process.env.GOOGLE_SHEET_NAME || 'Sheet1';

    if (!client) {
      const totalCollected = inMemoryRegistrations.reduce((acc, row) => acc + (Number(row.amountPaid) || 0), 0);
      return {
        totalCollected,
        totalRegistrations: inMemoryRegistrations.length,
        targetGoal: defaultTargetGoal,
        lastUpdated: getISTTime(),
      };
    }

    const { sheets, sheetId } = client;

    // Fetch column A to J
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetTabName}!A2:J`,
    });

    const rows = response.data.values || [];
    let totalCollected = 0;
    let totalRegistrations = 0;

    rows.forEach((row) => {
      if (!Array.isArray(row) || row.length < 8) return;
      // Column H is index 7 (Amount Paid)
      const amount = parseFloat(String(row[7]).replace(/[^\d.]/g, ''));
      const status = row[9] ? String(row[9]).trim().toUpperCase() : 'PAID';

      if (!isNaN(amount) && status !== 'REFUNDED' && status !== 'FAILED') {
        totalCollected += amount;
        totalRegistrations += 1;
      }
    });

    return {
      totalCollected,
      totalRegistrations,
      targetGoal: defaultTargetGoal,
      lastUpdated: getISTTime(),
    };
  } catch (error) {
    console.error('❌ Error fetching stats from Google Sheets:', error);
    const totalCollected = inMemoryRegistrations.reduce((acc, row) => acc + (Number(row.amountPaid) || 0), 0);
    return {
      totalCollected,
      totalRegistrations: inMemoryRegistrations.length,
      targetGoal: defaultTargetGoal,
      lastUpdated: getISTTime(),
    };
  }
}
