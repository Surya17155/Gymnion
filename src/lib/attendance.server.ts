import { google } from 'googleapis';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

/**
 * Appends attendance data to Google Sheets.
 * Requirements:
 * - Each year has a separate sheet (tab) named after the year (e.g., "2026").
 * - Data: Date, Name, Email, Phone, Check-in Time, Check-out Time.
 * - Only the admin's member data is linked to Google Sheets with the gym name.
 */
export async function syncAttendanceToGoogleSheets(params: {
  gymId: string;
  memberId: string;
  checkInAt: string;
  checkOutAt?: string | null;
}) {
  const { gymId, memberId, checkInAt, checkOutAt } = params;

  // 1. Check for Google credentials
  const clientEmail = process.env['GOOGLE_CLIENT_EMAIL'];
  const privateKey = process.env['GOOGLE_PRIVATE_KEY']?.replace(/\\n/g, '\n');
  const spreadsheetId = process.env['GOOGLE_SHEET_ID'];

  if (!clientEmail || !privateKey || !spreadsheetId) {
    console.warn('Google Sheets credentials missing. Skipping sync.');
    return;
  }

  try {
    // 2. Fetch member and gym details
    const [{ data: member }, { data: gym }] = await Promise.all([
      supabaseAdmin
        .from('members')
        .select('full_name, email, phone')
        .eq('id', memberId)
        .single(),
      supabaseAdmin
        .from('gyms')
        .select('name')
        .eq('id', gymId)
        .single()
    ]);

    if (!member || !gym) {
      console.error('Member or Gym not found for sync');
      return;
    }

    // 3. Initialize Google Auth
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // 4. Prepare data
    const dateObj = new Date(checkInAt);
    const year = dateObj.getFullYear().toString();
    const dateStr = dateObj.toLocaleDateString('en-IN'); // DD/MM/YYYY
    const checkInTime = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const checkOutTime = checkOutAt 
      ? new Date(checkOutAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      : '-';

    // 5. Ensure sheet for the year exists
    try {
      const response = await sheets.spreadsheets.get({ spreadsheetId });
      const sheetExists = response.data.sheets?.some(s => s.properties?.title === year);

      if (!sheetExists) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: { title: year }
                }
              }
            ]
          }
        });

        // Add header row to new sheet
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: `${year}!A1:G1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [
              ['Date', 'Gym Name', 'Member Name', 'Email', 'Phone', 'Check-in Time', 'Check-out Time']
            ]
          }
        });
      }
    } catch (err) {
      console.error('Error checking/creating sheet:', err);
    }

    // 6. Sync logic
    if (checkOutAt) {
      const range = `${year}!A:G`;
      const rows = await sheets.spreadsheets.values.get({ spreadsheetId, range });
      const values = rows.data.values || [];
      
      let rowIndex = -1;
      for (let i = values.length - 1; i >= 0; i--) {
        const row = values[i];
        if (!row || row.length < 4) continue;
        const [rowDate, , , rowEmail] = row;
        const rowInTime = row[5] || '-';
        const rowOutTime = row[6] || '-';

        // Check if this is the correct date, member, and it's the MOST RECENT entry for this member today
        // We match by date and email, and ensure we haven't already filled the checkout for THIS specific session
        if (rowDate === dateStr && rowEmail === member.email && rowOutTime === '-') {
          rowIndex = i + 1;
          break;
        }
      }

      if (rowIndex !== -1) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${year}!G${rowIndex}`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [[checkOutTime]]
          }
        });
        return;
      }
    }

    // Default: Append new row
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${year}!A:G`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          [dateStr, gym.name, member.full_name, member.email, member.phone, checkInTime, checkOutTime]
        ]
      }
    });

  } catch (error) {
    console.error('Failed to sync to Google Sheets:', error);
  }
}

