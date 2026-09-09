/**
 * Timezone and Date utilities for Indian Standard Time (IST - Asia/Kolkata, UTC+5:30)
 */

/**
 * Get current date string in IST formatted as YYYY-MM-DD
 * @param {Date} dateObj 
 * @returns {string} e.g. "2026-09-09"
 */
export const getISTDateString = (dateObj = new Date()) => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(dateObj);
};

/**
 * Get current time parts in IST (hour 0-23, minute 0-59, second 0-59)
 * @param {Date} dateObj 
 * @returns {{ hour: number, minute: number, second: number }}
 */
export const getISTTimeParts = (dateObj = new Date()) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const parts = formatter.formatToParts(dateObj);
  const map = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }
  return {
    hour: parseInt(map.hour, 10) % 24,
    minute: parseInt(map.minute, 10),
    second: parseInt(map.second, 10)
  };
};

/**
 * Construct 7:30 PM IST Date object for a given YYYY-MM-DD date string
 * @param {string} dateStr Format YYYY-MM-DD
 * @returns {Date}
 */
export const getISTAutoCheckoutDate = (dateStr) => {
  const parsed = new Date(`${dateStr}T19:30:00+05:30`);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  const [year, month, day] = dateStr.split('-').map(Number);
  // Fallback: 19:30 IST is 14:00 UTC
  return new Date(Date.UTC(year, month - 1, day, 14, 0, 0, 0));
};

/**
 * Calculate human readable working hours (e.g. "8h 45m")
 * @param {Date|string} checkIn 
 * @param {Date|string} checkOut 
 * @returns {string}
 */
export const calculateWorkingHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return '0h 0m';
  const diffMs = new Date(checkOut) - new Date(checkIn);
  if (diffMs <= 0) return '0h 0m';
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};
