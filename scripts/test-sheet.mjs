import { google } from 'googleapis';
import fs from 'fs';

// Read .env.local manually
const envContent = fs.readFileSync('.env.local', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let key = match[1].trim();
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    envVars[key] = val;
  }
});

async function testSheetConnection() {
  const clientEmail = envVars.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = envVars.GOOGLE_PRIVATE_KEY;
  const sheetId = envVars.GOOGLE_SHEET_ID;

  console.log('Testing Google Sheet Connection...');
  console.log('Client Email:', clientEmail);
  console.log('Sheet ID:', sheetId);

  if (!clientEmail || !privateKey || !sheetId) {
    console.error('Missing credentials');
    return;
  }

  privateKey = privateKey.replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email: clientEmail.trim(),
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const res = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });
    console.log('🎉 CONNECTION SUCCESSFUL!');
    console.log('Spreadsheet Title:', res.data.properties?.title);
    console.log('Tabs / Sheets Found:', res.data.sheets?.map(s => s.properties?.title));

    // Ensure Header Row is initialized if empty
    const sheetTabName = envVars.GOOGLE_SHEET_NAME || 'Sheet1';
    const rowsRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetTabName}!A1:J1`,
    });

    if (!rowsRes.data.values || rowsRes.data.values.length === 0 || !rowsRes.data.values[0][0]) {
      console.log('Initializing column headers in', sheetTabName, '...');
      const headers = [
        'Timestamp',
        '6-Digit ID',
        'Name',
        'Email',
        'Phone',
        'Age',
        'Semester',
        'Amount Paid',
        'Payment ID',
        'Status',
      ];
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${sheetTabName}!A1:J1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [headers],
        },
      });
      console.log('✅ Headers created automatically in Row 1!');
    } else {
      console.log('✅ Headers already present in Row 1:', rowsRes.data.values[0]);
    }
  } catch (err) {
    console.error('❌ Connection Failed:', err.message);
    if (err.message && (err.message.includes('403') || err.message.includes('PERMISSION_DENIED') || err.message.includes('caller does not have permission'))) {
      console.log('\n👉 PLEASE SHARE YOUR GOOGLE SHEET:');
      console.log('   1. Open: https://docs.google.com/spreadsheets/d/' + sheetId + '/edit');
      console.log('   2. Click SHARE in top-right corner');
      console.log('   3. Add: ' + clientEmail);
      console.log('   4. Set role to: EDITOR');
      console.log('   5. Click Share\n');
    }
  }
}

testSheetConnection();
