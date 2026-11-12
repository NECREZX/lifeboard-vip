/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const formatIDR = (num: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(num);
};

export const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getLocalMonthString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Format timestamp / date for notifications showing:
 * Hari, Tanggal Bulan Tahun • Jam:Menit WIB
 * Example ID: "Kamis, 12 November 2026 • 15:18 WIB"
 * Example EN: "Thursday, 12 November 2026 • 15:18"
 */
export const formatNotificationDateTime = (
  dateInput?: string | number | Date,
  notifId?: string,
  lang: string = 'id'
): string => {
  let targetDate: Date | null = null;

  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    targetDate = dateInput;
  } else if (typeof dateInput === 'number' && !isNaN(dateInput) && dateInput > 0) {
    targetDate = new Date(dateInput);
  } else if (typeof dateInput === 'string' && dateInput.trim()) {
    const trimmed = dateInput.trim();
    const lower = trimmed.toLowerCase();
    
    // If it's a legacy placeholder like "baru saja" or "just now"
    if (lower === 'baru saja' || lower === 'just now') {
      if (notifId && notifId.startsWith('n-')) {
        const rawTs = parseInt(notifId.slice(2), 10);
        if (!isNaN(rawTs) && rawTs > 1600000000000) {
          targetDate = new Date(rawTs);
        }
      }
    } else {
      // Try parsing if it's already an ISO or parseable date string
      const parsed = new Date(trimmed);
      if (!isNaN(parsed.getTime())) {
        targetDate = parsed;
      } else if (trimmed.includes('202') && (trimmed.includes(':') || trimmed.includes('WIB'))) {
        // Already formatted
        return trimmed;
      }
    }
  }

  // Fallback to notifId if targetDate is still null
  if (!targetDate && notifId && notifId.startsWith('n-')) {
    const rawTs = parseInt(notifId.slice(2), 10);
    if (!isNaN(rawTs) && rawTs > 1600000000000) {
      targetDate = new Date(rawTs);
    }
  }

  // Final fallback to current time
  if (!targetDate || isNaN(targetDate.getTime())) {
    targetDate = new Date();
  }

  const isEn = lang === 'en';
  const locale = isEn ? 'en-US' : 'id-ID';

  const datePart = targetDate.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const hours = String(targetDate.getHours()).padStart(2, '0');
  const minutes = String(targetDate.getMinutes()).padStart(2, '0');
  const timePart = `${hours}:${minutes}`;

  return isEn ? `${datePart} • ${timePart}` : `${datePart} • ${timePart} WIB`;
};


