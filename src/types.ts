/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Wallet {
  id: string;
  name: string;
  initialBalance: number;
  currentBalance?: number; // optional for backward compatibility
  icon: string;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface IncomeSource {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export type TransactionType = 'pemasukan' | 'pengeluaran';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string; // YYYY-MM-DD
  walletId: string;
  categoryId?: string; // Only for 'pengeluaran'
  sourceId?: string; // Only for 'pemasukan'
}

export interface Saving {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  color: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  limitAmount: number;
  month: string; // YYYY-MM
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  deadline: string; // YYYY-MM-DD
  status: 'pending' | 'completed';
}

export interface Wishlist {
  id: string;
  title: string;
  isPurchased: boolean;
  month: string; // YYYY-MM
  price?: number;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string; // ISO string or time label
  isRead: boolean;
  type: 'info' | 'warning' | 'success';
}

export type UIStyle = 'modern' | 'minimal' | 'glass';
export type CardStyle = 'flat' | 'bordered' | 'shadowed';
export type CardRadius = 'sharp' | 'rounded' | 'extra';
export type TableStyle = 'compact' | 'spacious' | 'striped';
export type FontStyle = 'sans' | 'mono' | 'serif' | 'jakarta' | 'grotesk' | 'ios' | 'neobrutalism' | 'pixel';
export type ThemeColor = 'classic' | 'emerald' | 'amber' | 'indigo' | 'rose';

export interface UserProfile {
  name: string;
  avatar: string;
}

export interface UserSettings {
  uiStyle: UIStyle;
  cardStyle: CardStyle;
  cardRadius: CardRadius;
  tableStyle: TableStyle;
  fontStyle: FontStyle;
  themeColor: ThemeColor;
  isDarkMode: boolean;
}
