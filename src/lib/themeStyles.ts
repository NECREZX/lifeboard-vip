/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserSettings, CardRadius } from '../types';

export type ClayColorTone = 'purple' | 'blue' | 'emerald' | 'amber' | 'rose' | 'teal' | 'indigo';

export const CLAY_PALETTE: ClayColorTone[] = [
  'indigo',
  'emerald',
  'purple',
  'blue',
  'amber',
  'rose',
  'teal',
];

/**
 * Returns dynamic border radius classes strictly adhering to settings.cardRadius:
 * - 'sharp': 'rounded-none' for every element
 * - 'rounded': standard curves (cards rounded-2xl, buttons rounded-xl, pills rounded-lg)
 * - 'extra': maximum curves (cards rounded-3xl, buttons rounded-2xl, pills rounded-full)
 */
export function getRadiusClass(
  type: 'card' | 'enclosing' | 'button' | 'pill' | 'input' | 'icon' | 'modal',
  radius?: CardRadius
): string {
  if (radius === 'sharp') {
    return 'rounded-none';
  }

  if (radius === 'extra') {
    switch (type) {
      case 'enclosing':
        return 'rounded-t-[48px] sm:rounded-t-[56px] rounded-b-none';
      case 'card':
      case 'modal':
        return 'rounded-3xl';
      case 'button':
      case 'input':
      case 'icon':
        return 'rounded-2xl';
      case 'pill':
        return 'rounded-full';
      default:
        return 'rounded-2xl';
    }
  }

  // Default: 'rounded'
  switch (type) {
    case 'enclosing':
      return 'rounded-t-[40px] sm:rounded-t-[40px] rounded-b-none';
    case 'card':
    case 'modal':
      return 'rounded-2xl';
    case 'button':
    case 'input':
    case 'icon':
      return 'rounded-xl';
    case 'pill':
      return 'rounded-lg';
    default:
      return 'rounded-xl';
  }
}

/**
 * Returns unified card classes based on uiStyle, cardStyle, cardRadius, and optional clay color tone.
 */
export function getCardStyleClass(
  settings?: Partial<UserSettings>,
  colorTone?: ClayColorTone
): string {
  const uiStyle = settings?.uiStyle || 'modern';
  const cardRadius = settings?.cardRadius || 'rounded';
  const cardStyle = settings?.cardStyle || 'shadowed';
  const radius = getRadiusClass('card', cardRadius);

  if (uiStyle === 'clay') {
    if (colorTone) {
      return `clay-card-${colorTone} ${radius}`;
    }
    return `clay-card ${radius}`;
  }

  if (uiStyle === 'glass') {
    return `glass-panel ${radius}`;
  }

  if (uiStyle === 'minimal') {
    return `bg-white dark:bg-slate-900 border-0 border-b border-slate-200 dark:border-slate-800 shadow-none ${radius}`;
  }

  // Modern Slate (default)
  let cls = `bg-white dark:bg-slate-900 ${radius} `;
  if (cardStyle === 'bordered') {
    cls += 'border-2 border-slate-300 dark:border-slate-700 shadow-none';
  } else if (cardStyle === 'shadowed') {
    cls += 'border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]';
  } else {
    cls += 'border border-slate-200/90 dark:border-slate-800/80 shadow-none';
  }
  return cls;
}

/**
 * Returns panel container classes (for filter tabbars, search bars container, etc.)
 */
export function getPanelStyleClass(settings?: Partial<UserSettings>): string {
  const uiStyle = settings?.uiStyle || 'modern';
  const cardRadius = settings?.cardRadius || 'rounded';
  const cardStyle = settings?.cardStyle || 'shadowed';
  const radius = getRadiusClass('card', cardRadius);

  if (uiStyle === 'clay') {
    return `clay-panel ${radius}`;
  }

  if (uiStyle === 'glass') {
    return `glass-panel ${radius}`;
  }

  if (uiStyle === 'minimal') {
    return `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-none ${radius}`;
  }

  // Modern Slate
  let cls = `bg-white dark:bg-slate-900 ${radius} `;
  if (cardStyle === 'bordered') {
    cls += 'border-2 border-slate-300 dark:border-slate-700 shadow-none';
  } else if (cardStyle === 'shadowed') {
    cls += 'border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]';
  } else {
    cls += 'border border-slate-200/90 dark:border-slate-800 shadow-none';
  }
  return cls;
}

/**
 * Returns filter selector card classes (e.g., Dompet, Tanggal, Kategori, Periode cards)
 * In clay theme, gives colorful matte 3D clay cards when a tone is passed!
 */
export function getFilterCardClass(
  settings?: Partial<UserSettings>,
  colorTone?: ClayColorTone
): string {
  const uiStyle = settings?.uiStyle || 'modern';
  const cardRadius = settings?.cardRadius || 'rounded';
  const cardStyle = settings?.cardStyle || 'shadowed';
  const radius = getRadiusClass('card', cardRadius);

  if (uiStyle === 'clay') {
    if (colorTone) {
      return `clay-card-${colorTone} ${radius}`;
    }
    return `clay-card ${radius}`;
  }

  if (uiStyle === 'glass') {
    return `glass-panel ${radius}`;
  }

  if (uiStyle === 'minimal') {
    return `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-none ${radius}`;
  }

  // Modern Slate
  let cls = `bg-white dark:bg-slate-900 ${radius} `;
  if (cardStyle === 'bordered') {
    cls += 'border-2 border-slate-300 dark:border-slate-700 shadow-none';
  } else if (cardStyle === 'shadowed') {
    cls += 'border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]';
  } else {
    cls += 'border border-slate-200/90 dark:border-slate-800 shadow-none';
  }
  return cls;
}

/**
 * Returns filter selector button classes (e.g. Wallet Selector or Status selector in Budgets / Savings / Activities)
 */
export function getFilterButtonClass(
  settings?: Partial<UserSettings>,
  colorTone?: ClayColorTone
): string {
  const uiStyle = settings?.uiStyle || 'modern';
  const cardRadius = settings?.cardRadius || 'rounded';
  const cardStyle = settings?.cardStyle || 'shadowed';
  const radius = getRadiusClass('button', cardRadius);

  if (uiStyle === 'clay') {
    if (colorTone) {
      return `clay-card-${colorTone} relative flex items-center justify-between gap-1.5 px-3 py-2 ${radius} min-w-0 transition-all cursor-pointer`;
    }
    return `clay-button relative flex items-center justify-between gap-1.5 px-3 py-2 ${radius} min-w-0 transition-all cursor-pointer text-slate-800 dark:text-slate-100`;
  }

  if (uiStyle === 'glass') {
    return `relative flex items-center justify-between gap-1.5 px-3 py-2 ${radius} transition-all min-w-0 overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/60 dark:border-slate-700/60 shadow-xs text-slate-800 dark:text-slate-100`;
  }

  if (uiStyle === 'minimal') {
    return `relative flex items-center justify-between gap-1.5 px-3 py-2 ${radius} transition-all min-w-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-none text-slate-800 dark:text-slate-100`;
  }

  // Modern Slate
  let cls = `relative flex items-center justify-between gap-1.5 px-3 py-2 ${radius} transition-all min-w-0 overflow-hidden bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 `;
  if (cardStyle === 'bordered') {
    cls += 'border-2 border-slate-300 dark:border-slate-700 shadow-none';
  } else if (cardStyle === 'shadowed') {
    cls += 'border border-slate-200/80 dark:border-slate-800 shadow-xs';
  } else {
    cls += 'border border-slate-200/90 dark:border-slate-800 shadow-none';
  }
  return cls;
}

/**
 * Returns input element styling respecting theme and cardRadius.
 */
export function getInputClass(settings?: Partial<UserSettings>): string {
  const uiStyle = settings?.uiStyle || 'modern';
  const cardRadius = settings?.cardRadius || 'rounded';
  const radius = getRadiusClass('input', cardRadius);

  if (uiStyle === 'clay') {
    return `clay-input ${radius} text-slate-800 dark:text-slate-100`;
  }

  if (uiStyle === 'glass') {
    return `glass-input ${radius} text-slate-800 dark:text-slate-100`;
  }

  if (uiStyle === 'minimal') {
    return `bg-transparent border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 ${radius}`;
  }

  return `bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-100 ${radius}`;
}

/**
 * Returns segmented tab item styling for filter bars (e.g. Semua, Pendapatan, Pengeluaran, Transfer)
 */
export function getSegmentedTabClass(
  settings?: Partial<UserSettings>,
  isActive: boolean = false,
  colorTone?: ClayColorTone
): string {
  const uiStyle = settings?.uiStyle || 'modern';
  const cardRadius = settings?.cardRadius || 'rounded';
  const radius = getRadiusClass('pill', cardRadius);

  if (uiStyle === 'clay') {
    if (isActive) {
      if (colorTone) {
        return `clay-pill-${colorTone} font-bold ${radius} transition-all duration-150`;
      }
      return `clay-button bg-indigo-50 dark:bg-indigo-950/60 font-bold text-indigo-700 dark:text-indigo-300 ${radius} transition-all duration-150`;
    }
    return `clay-button text-slate-600 dark:text-slate-400 font-medium ${radius} transition-all duration-150`;
  }

  if (uiStyle === 'glass') {
    if (isActive) {
      return `bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xs ${radius} transition-all duration-150`;
    }
    return `text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-slate-800/40 ${radius} transition-all duration-150`;
  }

  if (uiStyle === 'minimal') {
    if (isActive) {
      return `bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold ${radius} transition-all duration-150`;
    }
    return `text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800/50 ${radius} transition-all duration-150`;
  }

  // Modern Slate
  if (isActive) {
    return `bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xs ${radius} transition-all duration-150`;
  }
  return `text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${radius} transition-all duration-150`;
}

/**
 * Returns generic button styling (e.g. Next/Prev month, action buttons)
 */
export function getButtonClass(
  settings?: Partial<UserSettings>,
  variant: 'default' | 'primary' | 'danger' | 'ghost' = 'default'
): string {
  const uiStyle = settings?.uiStyle || 'modern';
  const cardRadius = settings?.cardRadius || 'rounded';
  const radius = getRadiusClass('button', cardRadius);

  if (uiStyle === 'clay') {
    if (variant === 'danger') {
      return `clay-pill-rose font-bold ${radius} transition-all active:scale-95 cursor-pointer`;
    }
    if (variant === 'primary') {
      return `clay-pill-indigo font-bold ${radius} transition-all active:scale-95 cursor-pointer`;
    }
    return `clay-button text-slate-700 dark:text-slate-200 ${radius} transition-all active:scale-95 cursor-pointer`;
  }

  if (uiStyle === 'glass') {
    if (variant === 'danger') {
      return `bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 ${radius} font-bold transition-all active:scale-95 cursor-pointer`;
    }
    if (variant === 'primary') {
      return `bg-indigo-600 text-white shadow-xs ${radius} font-bold transition-all active:scale-95 cursor-pointer`;
    }
    return `bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-800 border border-white/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 ${radius} transition-all active:scale-95 cursor-pointer`;
  }

  if (uiStyle === 'minimal') {
    if (variant === 'danger') {
      return `bg-rose-500 text-white ${radius} font-bold transition-all active:scale-95 cursor-pointer`;
    }
    if (variant === 'primary') {
      return `bg-slate-900 dark:bg-white text-white dark:text-slate-900 ${radius} font-bold transition-all active:scale-95 cursor-pointer`;
    }
    return `hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 ${radius} transition-all active:scale-95 cursor-pointer`;
  }

  // Modern Slate
  if (variant === 'danger') {
    return `bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 ${radius} font-bold transition-all active:scale-95 cursor-pointer`;
  }
  if (variant === 'primary') {
    return `bg-indigo-600 hover:bg-indigo-700 text-white ${radius} font-bold shadow-xs transition-all active:scale-95 cursor-pointer`;
  }
  return `bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 ${radius} transition-all active:scale-95 cursor-pointer`;
}
