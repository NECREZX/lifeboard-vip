/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Wallet, Category, IncomeSource, Transaction, Saving, Budget, Activity, Wishlist, NotificationItem } from './types';

export const DEFAULT_WALLETS: Wallet[] = [
  { id: 'w-1', name: 'Dompet Utama', initialBalance: 0, icon: 'Wallet', color: '#10b981' }
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'c-1', name: 'Makanan & Minuman', icon: 'Utensils', color: '#ef4444' },
  { id: 'c-2', name: 'Transportasi', icon: 'Car', color: '#3b82f6' },
  { id: 'c-3', name: 'Hiburan & Santai', icon: 'Coffee', color: '#f59e0b' },
  { id: 'c-4', name: 'Tagihan & Listrik', icon: 'Zap', color: '#14b8a6' },
  { id: 'c-5', name: 'Belanja Barang', icon: 'ShoppingBag', color: '#ec4899' }
];

export const DEFAULT_SOURCES: IncomeSource[] = [
  { id: 's-1', name: 'Gaji Bulanan', icon: 'Briefcase', color: '#10b981' },
  { id: 's-2', name: 'Proyek Freelance', icon: 'Laptop', color: '#06b6d4' },
  { id: 's-3', name: 'Investasi', icon: 'TrendingUp', color: '#eab308' }
];

export const DEFAULT_TRANSACTIONS: Transaction[] = [];

export const DEFAULT_BUDGETS: Budget[] = [];

export const DEFAULT_SAVINGS: Saving[] = [];

export const DEFAULT_ACTIVITIES: Activity[] = [];

export const DEFAULT_WISHLISTS: Wishlist[] = [];

export const DEFAULT_NOTIFICATIONS: NotificationItem[] = [];

