import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { DateTime } from 'luxon';
import { createSheetsClient } from './google-sheets.server';

const SPREADSHEET_ID = '1Eid3e2UkCCakxO4237L5XHVft4A78XeWeucGtqA5PnY';

/**
 * Appends attendance data to Google Sheets.
 * - Each GYM has a separate sheet (tab) named after the Gym Name.
 * - Data: Date, Month-Year, Member Name, Email, Phone, Check-in, Check-out, Status.
 */
export async function syncAttendanceToGoogleSheets(params: {
  gymId: string;
  memberId: string;
  checkInAt: string;
  checkOutAt?: string | null;
}) {
  const { gymId, memberId, checkInAt, checkOutAt } = params;

  const serviceAccountJson = process.env['GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON'];
  if (!serviceAccountJson) {
    console.warn('GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON missing. Attendance sync is disabled.');
    return;
  }

  try {
    const [{ data: member }, { data: gym }] = await Promise.all([
      supabaseAdmin.from('members').select('full_name, email, phone').eq('id', memberId).single(),
      supabaseAdmin.from('gyms').select('name').eq('id', gymId).single(),
    ]);

    if (!member || !gym) {
      console.error('Member or Gym not found for sync');
      return;
    }

    const sheets = await createSheetsClient(serviceAccountJson, SPREADSHEET_ID);

    const dtIn = DateTime.fromISO(checkInAt as string).setZone('Asia/Kolkata');
    const dateStr = dtIn.toFormat('dd/MM/yyyy');
    const monthYear = dtIn.toFormat('MMMM yyyy');
    const checkInTime = dtIn.toFormat('hh:mm a');
    const checkOutTime = checkOutAt
      ? DateTime.fromISO(checkOutAt as string).setZone('Asia/Kolkata').toFormat('hh:mm a')
      : '-';

    const sheetName = gym.name.substring(0, 100);

    // Ensure the gym's sheet exists
    try {
      const titles = await sheets.listSheetTitles();
      if (!titles.includes(sheetName)) {
        await sheets.addSheet(sheetName);
        await sheets.append(`${sheetName}!A1:H1`, [
          ['Date', 'Month-Year', 'Member Name', 'Email', 'Phone', 'Check-in', 'Check-out', 'Status'],
        ]);
      }
    } catch (err) {
      console.error('Error checking/creating sheet:', err);
    }

    if (checkOutAt) {
      const values = await sheets.getValues(`${sheetName}!A:H`);
      let rowIndex = -1;
      for (let i = values.length - 1; i >= 0; i--) {
        const row = values[i];
        if (!row || row.length < 4) continue;
        const rowDate = row[0];
        const rowEmail = row[3];
        const rowOutTime = row[6] || '-';
        if (rowDate === dateStr && rowEmail === member.email && (rowOutTime === '-' || rowOutTime === '')) {
          rowIndex = i + 1;
          break;
        }
      }

      if (rowIndex !== -1) {
        await sheets.update(`${sheetName}!G${rowIndex}:H${rowIndex}`, [[checkOutTime, 'Completed']]);
        return;
      }
    }

    await sheets.append(`${sheetName}!A:H`, [
      [
        dateStr,
        monthYear,
        member.full_name,
        member.email,
        member.phone,
        checkInTime,
        checkOutTime,
        checkOutAt ? 'Completed' : 'Inside',
      ],
    ]);
  } catch (error) {
    console.error('Failed to sync to Google Sheets:', error);
  }
}

