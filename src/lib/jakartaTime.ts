/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utility to get accurate Jakarta / WIB (GMT+7) date and time information.
 * Ensures consistent behavior whether running on local machines, mobile devices,
 * or Vercel serverless / edge environments.
 */
export interface JakartaDateInfo {
  year: number;
  month: number; // 1 to 12
  day: number;
  hours: number;
  minutes: number;
  monthStr: string; // "YYYY-MM"
  dateStr: string; // "YYYY-MM-DD"
  isLastDayOfMonth: boolean;
  lastDayOfMonth: number;
  daysRemainingInMonth: number;
  monthNameIndo: string;
  monthNameEn: string;
  formattedWibTime: string;
}

const INDO_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const EN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const getJakartaDateInfo = (): JakartaDateInfo => {
  const now = new Date();
  
  // Format using Asia/Jakarta (WIB - GMT+7)
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const partMap: Record<string, string> = {};
  parts.forEach((p) => {
    partMap[p.type] = p.value;
  });

  const year = parseInt(partMap.year || `${now.getUTCFullYear()}`, 10);
  const month = parseInt(partMap.month || `${now.getUTCMonth() + 1}`, 10);
  const day = parseInt(partMap.day || `${now.getUTCDate()}`, 10);
  const hours = parseInt(partMap.hour || '0', 10);
  const minutes = parseInt(partMap.minute || '0', 10);

  // Day 0 of next month in JS date gives the last day of the current month
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  const isLastDayOfMonth = day === lastDayOfMonth;
  const daysRemainingInMonth = Math.max(0, lastDayOfMonth - day);

  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const monthNameIndo = INDO_MONTHS[month - 1] || '';
  const monthNameEn = EN_MONTHS[month - 1] || '';

  const formattedWibTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} WIB`;

  return {
    year,
    month,
    day,
    hours,
    minutes,
    monthStr,
    dateStr,
    isLastDayOfMonth,
    lastDayOfMonth,
    daysRemainingInMonth,
    monthNameIndo,
    monthNameEn,
    formattedWibTime,
  };
};

export const getIndoMonthName = (monthNumber: number): string => {
  return INDO_MONTHS[monthNumber - 1] || '';
};

export const formatMonthLabel = (monthStr: string, isEn = false): string => {
  const [y, m] = monthStr.split('-');
  const monthIdx = parseInt(m, 10) - 1;
  const monthName = isEn ? EN_MONTHS[monthIdx] : INDO_MONTHS[monthIdx];
  return `${monthName || monthStr} ${y || ''}`.trim();
};
