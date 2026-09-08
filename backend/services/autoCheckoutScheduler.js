import Attendance from '../models/Attendance.js';

/**
 * Calculate working hours string (e.g., "8h 53m")
 */
const calculateWorkingHours = (checkIn, checkOut) => {
  const diffMs = new Date(checkOut) - new Date(checkIn);
  if (diffMs <= 0) return '0h 0m';
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

/**
 * Helper to get current local date string (YYYY-MM-DD)
 */
const getLocalDateString = (dateObj = new Date()) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Process auto check-out for any employees who are checked in ('Present')
 * and haven't checked out by 7:30 PM (19:30 local time).
 */
export const processAutoCheckout = async () => {
  try {
    const now = new Date();
    const localDateStr = getLocalDateString(now);

    // Find all attendance records currently 'Present' (without checkOut time)
    const recordsToCheckout = await Attendance.find({
      status: 'Present',
      checkOut: null
    });

    if (!recordsToCheckout || recordsToCheckout.length === 0) {
      return { updatedCount: 0, message: 'No pending check-outs found.' };
    }

    let updatedCount = 0;

    for (const record of recordsToCheckout) {
      const isPastDate = record.date < localDateStr;
      const isToday = record.date === localDateStr;
      const isPast730PM = now.getHours() > 19 || (now.getHours() === 19 && now.getMinutes() >= 30);

      if (isPastDate || (isToday && isPast730PM)) {
        const [year, month, day] = record.date.split('-').map(Number);
        let autoCheckoutTime = new Date(year, month - 1, day, 19, 30, 0, 0);

        // Fallback: If checkIn occurred after 7:30 PM, set checkout time to checkIn or now
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
      console.log(`[AutoCheckout] Automatically checked out ${updatedCount} employee(s) at 7:30 PM.`);
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
  // Run once immediately on server startup
  processAutoCheckout();

  // Run every 2 minutes (120,000 ms)
  setInterval(() => {
    processAutoCheckout();
  }, 2 * 60 * 1000);

  console.log('[AutoCheckout Scheduler] Initialized. Monitoring active check-ins for 7:30 PM auto checkout.');
};
