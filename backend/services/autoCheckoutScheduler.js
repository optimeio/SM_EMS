import Attendance from '../models/Attendance.js';
import {
  getISTDateString,
  getISTTimeParts,
  getISTAutoCheckoutDate,
  calculateWorkingHours
} from '../utils/dateUtils.js';

/**
 * Process auto check-out for any employees who are checked in
 * and haven't checked out by 7:30 PM IST (Asia/Kolkata timezone).
 */
export const processAutoCheckout = async () => {
  try {
    const now = new Date();
    const currentISTDate = getISTDateString(now);
    const { hour, minute } = getISTTimeParts(now);
    const isPast730PM = hour > 19 || (hour === 19 && minute >= 30);

    // Find all attendance records without checkOut time
    const recordsToCheckout = await Attendance.find({
      checkOut: null,
      $or: [
        { status: 'Present' },
        { status: { $exists: false } }
      ]
    });

    if (!recordsToCheckout || recordsToCheckout.length === 0) {
      return { updatedCount: 0, message: 'No pending check-outs found.' };
    }

    let updatedCount = 0;

    for (const record of recordsToCheckout) {
      const recordDate = record.date;
      const isPastDate = recordDate < currentISTDate;
      const isToday = recordDate === currentISTDate;

      if (isPastDate || (isToday && isPast730PM)) {
        let autoCheckoutTime = getISTAutoCheckoutDate(recordDate);

        // Fallback: If checkIn occurred after 7:30 PM IST, set checkout time to checkIn
        if (record.checkIn && new Date(record.checkIn) > autoCheckoutTime) {
          autoCheckoutTime = new Date(record.checkIn);
        }

        record.checkOut = autoCheckoutTime;
        record.workingHours = calculateWorkingHours(record.checkIn, autoCheckoutTime);
        record.status = 'Checked Out';
        record.isAutoCheckedOut = true;
        record.checkOutNotes = 'Auto checked out at 7:30 PM';

        await record.save();
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      console.log(`[AutoCheckout] Automatically checked out ${updatedCount} employee(s) (IST schedule).`);
    }

    return { updatedCount, message: `Successfully auto checked out ${updatedCount} employee(s).` };
  } catch (error) {
    console.error('[AutoCheckout Error]:', error);
    return { updatedCount: 0, error: error.message };
  }
};

/**
 * Initialize periodic auto-checkout scheduler running every 2 minutes
 */
export const initAutoCheckoutScheduler = () => {
  // Run once immediately on server startup to catch any unclosed past records
  processAutoCheckout();

  // Run every 2 minutes (120,000 ms)
  setInterval(() => {
    processAutoCheckout();
  }, 2 * 60 * 1000);

  console.log('[AutoCheckout Scheduler] Initialized. Monitoring active check-ins for 7:30 PM IST auto checkout.');
};
