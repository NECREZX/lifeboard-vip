/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserSettings, ThemeColor } from '../types';

export interface ThemePreset {
  id: ThemeColor | string;
  label: string;
  hex: string;
  description?: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'coral', label: 'Coral Sunset', hex: '#FF7777', description: 'Warna orisinal aplikasi' },
  { id: 'sakura', label: 'Sakura Pink', hex: '#EC4899', description: 'Pink cerah & energik' },
  { id: 'emerald', label: 'Emerald Mint', hex: '#10B981', description: 'Hijau segar menyejukkan' },
  { id: 'blue', label: 'Ocean Blue', hex: '#3B82F6', description: 'Biru laut modern' },
  { id: 'indigo', label: 'Royal Indigo', hex: '#6366F1', description: 'Indigo elegan & futuristik' },
  { id: 'amber', label: 'Sunset Amber', hex: '#F59E0B', description: 'Kuning keemasan hangat' },
  { id: 'violet', label: 'Purple Gem', hex: '#8B5CF6', description: 'Ungu mewah & kreatif' },
  { id: 'rose', label: 'Rose Wine', hex: '#F43F5E', description: 'Mawar merah karismatik' },
  { id: 'classic', label: 'Dark Obsidian', hex: '#0F172A', description: 'Hitam elegan minimalis' },
];

/**
 * Returns the resolved hexadecimal color code based on user settings.
 */
export function getEffectiveThemeColor(settings?: Partial<UserSettings> | null): string {
  if (!settings) return '#FF7777';
  
  if (settings.themeColor === 'custom' && settings.customAccentColor) {
    return normalizeHexColor(settings.customAccentColor);
  }
  
  if (settings.customAccentColor && settings.themeColor !== 'indigo') {
    return normalizeHexColor(settings.customAccentColor);
  }

  switch (settings.themeColor) {
    case 'emerald': return '#10B981';
    case 'amber': return '#F59E0B';
    case 'rose': return '#F43F5E';
    case 'classic': return '#0F172A';
    case 'indigo': return '#6366F1';
    default:
      return settings.customAccentColor ? normalizeHexColor(settings.customAccentColor) : '#FF7777';
  }
}

/**
 * Returns high-contrast text/icon color (#0f172a or #ffffff) based on background luminance.
 */
export function getThemeContrastColor(hexColor: string): string {
  try {
    const hex = normalizeHexColor(hexColor).replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    // Standard YIQ perceived brightness
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 170 ? '#0f172a' : '#ffffff';
  } catch {
    return '#ffffff';
  }
}

/**
 * Normalizes input hex string into valid 6-character '#RRGGBB'
 */
export function normalizeHexColor(input: string): string {
  if (!input) return '#FF7777';
  let clean = input.trim();
  if (!clean.startsWith('#')) clean = `#${clean}`;
  
  const raw = clean.replace('#', '');
  if (raw.length === 3) {
    return `#${raw[0]}${raw[0]}${raw[1]}${raw[1]}${raw[2]}${raw[2]}`;
  }
  if (raw.length >= 6) {
    return `#${raw.substring(0, 6)}`;
  }
  return clean;
}
