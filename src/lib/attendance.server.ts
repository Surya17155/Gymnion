import { google } from 'googleapis';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { DateTime } from 'luxon';

/**
 * Appends attendance data to Google Sheets.
 * Requirements:
 * - Each GYM has a separate sheet (tab) named after the Gym Name.
 * - Data: Date, Member Name, Email, Phone, Check-in Time, Check-out Time.
 * - Chips-like representation: Check-in (Green/Text), Check-out (Red/Text).
 */
export async function syncAttendanceToGoogleSheets(params: {
  gymId: string;
  memberId: string;
  checkInAt: string;
  checkOutAt?: string | null;
}) {
  const { gymId, memberId, checkInAt, checkOutAt } = params;

  // 1. Check for Google credentials
  const serviceAccountJson = process.env['GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON'];
  const spreadsheetId = '1Eid3e2UkCCakxO4237L5XHVft4A78XeWeucGtqA5PnY';

  if (!serviceAccountJson) {
    console.warn('GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON missing. Skipping sync.');
    return;
  }

  try {
    const credentials = JSON.parse(serviceAccountJson);

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
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // 4. Prepare data
    // Use IST (Indian Standard Time) for chips and display
    const dtIn = DateTime.fromISO(checkInAt).setZone('Asia/Kolkata');
    const dateStr = dtIn.toFormat('dd/MM/yyyy');
    const monthYear = dtIn.toFormat('MMMM yyyy');
    const checkInTime = dtIn.toFormat('hh:mm a');
    const checkOutTime = checkOutAt 
      ? DateTime.fromISO(checkOutAt).setZone('Asia/Kolkata').toFormat('hh:mm a')
      : '-';

    const sheetName = gym.name.substring(0, 100); // Sheet names have limits

    // 5. Ensure sheet for the gym exists
    try {
      const response = await sheets.spreadsheets.get({ spreadsheetId });
      const sheetExists = response.data.sheets?.some(s => s.properties?.title === sheetName);

      if (!sheetExists) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: { title: sheetName }
                }
              }
            ]
          }
        });

        // Add header row to new sheet
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: `${sheetName}!A1:H1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [
              ['Date', 'Month-Year', 'Member Name', 'Email', 'Phone', 'Check-in (Green)', 'Check-out (Red)', 'Status']
            ]
          }
        });
        
        // Basic formatting for headers could be added here, but appending is safer for now.
      }
    } catch (err) {
      console.error('Error checking/creating sheet:', err);
    }

    // 6. Sync logic
    if (checkOutAt) {
      const range = `${sheetName}!A:H`;
      const rows = await sheets.spreadsheets.values.get({ spreadsheetId, range });
      const values = rows.data.values || [];
      
      let rowIndex = -1;
      // Search from bottom for the most recent check-in for this user today that lacks a check-out
      for (let i = values.length - 1; i >= 0; i--) {
        const row = values[i];
        if (!row || row.length < 4) continue;
        const [rowDate, , , rowEmail] = row;
        const rowOutTime = row[6] || '-';

        if (rowDate === dateStr && rowEmail === member.email && (rowOutTime === '-' || rowOutTime === '')) {
          rowIndex = i + 1;
          break;
        }
      }

      if (rowIndex !== -1) {
        // Update check-out time and status
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!G${rowIndex}:H${rowIndex}`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [[checkOutTime, 'Completed']]
          }
        });
        return;
      }
    }

    // Default: Append new row for check-in
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:H`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          [dateStr, monthYear, member.full_name, member.email, member.phone, checkInTime, checkOutTime, checkOutAt ? 'Completed' : 'Inside']
        ]
      }
    });

  } catch (error) {
    console.error('Failed to sync to Google Sheets:', error);
  }
}

/**
 * Exports all attendance for a gym to Google Sheets.
 * Called manually by Admin.
 */
export async function exportGymAttendanceToSheets(gymId: string) {
  const serviceAccountJson = process.env['GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON'];
  const spreadsheetId = '1Eid3e2UkCCakxO4237L5XHVft4A78XeWeucGtqA5PnY';

  if (!serviceAccountJson) throw new Error('Google Sheets configuration missing');
  
  const credentials = JSON.parse(serviceAccountJson);

  // 1. Fetch data
  const { data: gym } = await supabaseAdmin.from('gyms').select('name').eq('id', gymId).single();
  const { data: attendance } = await supabaseAdmin
    .from('attendance')
    .select('*, members(full_name, email, phone)')
    .eq('gym_id', gymId)
    .order('check_in_at', { ascending: true });

  if (!gym) throw new Error('Gym not found');
  if (!attendance || attendance.length === 0) return { message: 'No attendance data to export' };

  // 2. Auth
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const sheetName = `Export - ${gym.name}`.substring(0, 100);

  // 3. Create or Clear Sheet
  const response = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetExists = response.data.sheets?.some(s => s.properties?.title === sheetName);

  if (!sheetExists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: sheetName } } }]
      }
    });
  } else {
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetName}!A:H`,
    });
  }

  // 4. Prepare values
  const headers = ['Date', 'Month-Year', 'Member Name', 'Email', 'Phone', 'Check-in', 'Check-out', 'Status'];
  const rows = attendance.map(a => {
    const dtIn = DateTime.fromISO(a.check_in_at).setZone('Asia/Kolkata');
    const dtOut = a.check_out_at ? DateTime.fromISO(a.check_out_at).setZone('Asia/Kolkata') : null;
    
    return [
      dtIn.toFormat('dd/MM/yyyy'),
      dtIn.toFormat('MMMM yyyy'),
      (a.members as any)?.full_name || '-',
      (a.members as any)?.email || '-',
      (a.members as any)?.phone || '-',
      dtIn.toFormat('hh:mm a'),
      dtOut ? dtOut.toFormat('hh:mm a') : '-',
      a.check_out_at ? 'Completed' : 'Inside'
    ];
  });

  // 5. Write
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [headers, ...rows]
    }
  });

  return { success: true, sheetName };
}
