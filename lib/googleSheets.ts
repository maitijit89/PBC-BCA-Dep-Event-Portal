import { google } from 'googleapis';
import { SheetRowData, TrackerStats } from './types';

// In-memory fallback storage in case Google Sheets is temporarily unreachable
const inMemoryRegistrations: SheetRowData[] = [];

// Idempotency cache to prevent payment replay attacks (VULN-02)
const processedPaymentIds = new Set<string>();

// 15-second in-memory TTL cache to prevent Google Sheets DoS / Quota Exhaustion (VULN-04)
let cachedStats: TrackerStats | null = null;
let lastCacheTime = 0;
const STATS_CACHE_TTL = 15 * 1000; // 15 seconds

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

    // Cache invalidation & idempotency registration
    processedPaymentIds.add(data.paymentId.trim().toLowerCase());
    cachedStats = null;

    console.log(`✅ Appended registration #${data.ticketId} to Google Sheet successfully.`);
    return { success: true, mode: 'google_sheets' };
  } catch (error) {
    console.error('❌ Error appending row to Google Sheets:', error);
    // Even if Google Sheets fails, preserve in in-memory list to not block the user's payment completion
    inMemoryRegistrations.push(data);
    processedPaymentIds.add(data.paymentId.trim().toLowerCase());
    cachedStats = null;
    return { success: false, mode: 'fallback' };
  }
}

/**
 * Idempotency check: Verifies if a Razorpay payment ID has already been recorded
 * in memory or Google Sheets to prevent payment replay attacks (VULN-02).
 */
export async function isPaymentAlreadyRecorded(paymentId: string): Promise<boolean> {
  if (!paymentId) return false;
  const cleanId = paymentId.trim().toLowerCase();

  // 1. Check in-memory sets & store
  if (processedPaymentIds.has(cleanId)) return true;
  if (inMemoryRegistrations.some((r) => r.paymentId.trim().toLowerCase() === cleanId)) {
    return true;
  }

  // 2. Query Google Sheets Column I (Payment ID)
  try {
    const client = getGoogleSheetsClient();
    if (!client) return false;

    const { sheets, sheetId } = client;
    const sheetTabName = process.env.GOOGLE_SHEET_NAME || 'Sheet1';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetTabName}!I2:I`,
    });

    const rows = response.data.values || [];
    for (const row of rows) {
      if (!Array.isArray(row) || !row[0]) continue;
      const existingPaymentId = String(row[0]).trim().toLowerCase().replace(/^'/, '');
      if (existingPaymentId === cleanId) {
        processedPaymentIds.add(cleanId);
        return true;
      }
    }
    return false;
  } catch (err) {
    console.error('❌ Error checking payment idempotency in Google Sheets:', err);
    return false;
  }
}

/**
 * Retrieves existing registration details by paymentId for idempotent re-queries.
 */
export async function getRegistrationByPaymentId(paymentId: string): Promise<SheetRowData | null> {
  if (!paymentId) return null;
  const cleanId = paymentId.trim().toLowerCase();

  const memoryMatch = inMemoryRegistrations.find((r) => r.paymentId.trim().toLowerCase() === cleanId);
  if (memoryMatch) return memoryMatch;

  try {
    const client = getGoogleSheetsClient();
    if (!client) return null;

    const { sheets, sheetId } = client;
    const sheetTabName = process.env.GOOGLE_SHEET_NAME || 'Sheet1';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetTabName}!A2:J`,
    });

    const rows = response.data.values || [];
    for (const row of rows) {
      if (!Array.isArray(row) || row.length < 9) continue;
      const rowPaymentId = String(row[8] || '').trim().toLowerCase().replace(/^'/, '');
      if (rowPaymentId === cleanId) {
        return {
          timestamp: String(row[0] || ''),
          ticketId: String(row[1] || '').replace(/^'/, ''),
          name: String(row[2] || '').replace(/^'/, ''),
          email: String(row[3] || '').replace(/^'/, ''),
          phone: String(row[4] || '').replace(/^'/, ''),
          age: String(row[5] || '').replace(/^'/, ''),
          semester: String(row[6] || '') as SheetRowData['semester'],
          amountPaid: Number(String(row[7]).replace(/[^\d.]/g, '')) || 0,
          paymentId: String(row[8] || '').replace(/^'/, ''),
          status: (row[9] ? String(row[9]).trim().toUpperCase() : 'PAID') as SheetRowData['status'],
        };
      }
    }
    return null;
  } catch (err) {
    console.error('❌ Error fetching registration by payment ID:', err);
    return null;
  }
}

/**
 * Fetches the event collection stats from Google Sheet with a 15-second TTL cache (VULN-04).
 */
export async function getEventStatsFromSheet(): Promise<TrackerStats> {
  const defaultTargetGoal = Number(process.env.NEXT_PUBLIC_COLLECTION_GOAL) || 30000;
  const getISTTime = () => new Date().toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Return from in-memory cache if fresh (prevents Google Sheets quota exhaustion)
  if (cachedStats && (Date.now() - lastCacheTime < STATS_CACHE_TTL)) {
    return cachedStats;
  }

  try {
    const client = getGoogleSheetsClient();
    const sheetTabName = process.env.GOOGLE_SHEET_NAME || 'Sheet1';

    if (!client) {
      const totalCollected = inMemoryRegistrations.reduce((acc, row) => acc + (Number(row.amountPaid) || 0), 0);
      const result: TrackerStats = {
        totalCollected,
        totalRegistrations: inMemoryRegistrations.length,
        targetGoal: defaultTargetGoal,
        lastUpdated: getISTTime(),
      };
      cachedStats = result;
      lastCacheTime = Date.now();
      return result;
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

    const freshStats: TrackerStats = {
      totalCollected,
      totalRegistrations,
      targetGoal: defaultTargetGoal,
      lastUpdated: getISTTime(),
    };
    cachedStats = freshStats;
    lastCacheTime = Date.now();
    return freshStats;
  } catch (error) {
    console.error('❌ Error fetching stats from Google Sheets:', error);
    const totalCollected = inMemoryRegistrations.reduce((acc, row) => acc + (Number(row.amountPaid) || 0), 0);
    const fallbackStats: TrackerStats = {
      totalCollected,
      totalRegistrations: inMemoryRegistrations.length,
      targetGoal: defaultTargetGoal,
      lastUpdated: getISTTime(),
    };
    cachedStats = fallbackStats;
    lastCacheTime = Date.now();
    return fallbackStats;
  }
}

/**
 * Searches for a registered ticket pass by 6-digit ID, 10-digit phone, or email.
 */
export async function lookupRegistrationInSheet(
  query: string
): Promise<SheetRowData | null> {
  const cleanQuery = query.trim().toLowerCase().replace(/['"`]/g, '');
  if (!cleanQuery) return null;

  // First, check in-memory registrations
  const memoryMatch = inMemoryRegistrations.find(
    (reg) =>
      reg.ticketId.toLowerCase() === cleanQuery ||
      reg.phone.toLowerCase() === cleanQuery ||
      reg.email.toLowerCase() === cleanQuery
  );
  if (memoryMatch) return memoryMatch;

  try {
    const client = getGoogleSheetsClient();
    if (!client) return null;

    const { sheets, sheetId } = client;
    const sheetTabName = process.env.GOOGLE_SHEET_NAME || 'Sheet1';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetTabName}!A2:J`,
    });

    const rows = response.data.values || [];
    for (const row of rows) {
      if (!Array.isArray(row) || row.length < 9) continue;
      const ticketId = String(row[1] || '').trim().toLowerCase().replace(/^'/, '');
      const email = String(row[3] || '').trim().toLowerCase().replace(/^'/, '');
      const phone = String(row[4] || '').trim().toLowerCase().replace(/^'/, '');

      if (ticketId === cleanQuery || phone === cleanQuery || email === cleanQuery) {
        return {
          timestamp: String(row[0] || ''),
          ticketId: String(row[1] || '').replace(/^'/, ''),
          name: String(row[2] || '').replace(/^'/, ''),
          email: String(row[3] || '').replace(/^'/, ''),
          phone: String(row[4] || '').replace(/^'/, ''),
          age: String(row[5] || '').replace(/^'/, ''),
          semester: String(row[6] || '') as SheetRowData['semester'],
          amountPaid: Number(String(row[7]).replace(/[^\d.]/g, '')) || 0,
          paymentId: String(row[8] || '').replace(/^'/, ''),
          status: (row[9] ? String(row[9]).trim().toUpperCase() : 'PAID') as SheetRowData['status'],
        };
      }
    }
    return null;
  } catch (err) {
    console.error('❌ Error looking up ticket in Google Sheets:', err);
    return null;
  }
}
