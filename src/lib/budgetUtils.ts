/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Budget, Category, Wallet } from '../types';

export const isAllCategoriesBudget = (b: Budget): boolean => {
  if (b.categoryIds && b.categoryIds.length > 0) {
    return b.categoryIds.includes('all');
  }
  return !b.categoryId || b.categoryId === 'all';
};

export const isAllWalletsBudget = (b: Budget): boolean => {
  if (b.walletIds && b.walletIds.length > 0) {
    return b.walletIds.includes('all');
  }
  return !b.walletId || b.walletId === 'all';
};

export const isCategoryMatch = (b: Budget, categoryId?: string): boolean => {
  if (!categoryId) return false;
  if (isAllCategoriesBudget(b)) return true;

  if (b.categoryIds && b.categoryIds.length > 0) {
    return b.categoryIds.includes(categoryId);
  }

  if (b.categoryId) {
    if (b.categoryId.includes(',')) {
      return b.categoryId.split(',').map(s => s.trim()).includes(categoryId);
    }
    return b.categoryId === categoryId;
  }

  return true;
};

export const isWalletMatch = (b: Budget, walletId?: string): boolean => {
  if (!walletId) return false;
  if (isAllWalletsBudget(b)) return true;

  if (b.walletIds && b.walletIds.length > 0) {
    return b.walletIds.includes(walletId);
  }

  if (b.walletId) {
    if (b.walletId.includes(',')) {
      return b.walletId.split(',').map(s => s.trim()).includes(walletId);
    }
    return b.walletId === walletId;
  }

  return true;
};

export const getBudgetCategories = (b: Budget, allCategories: Category[]): Category[] => {
  if (isAllCategoriesBudget(b)) return [];

  if (b.categoryIds && b.categoryIds.length > 0) {
    return allCategories.filter(c => b.categoryIds?.includes(c.id));
  }

  if (b.categoryId && b.categoryId !== 'all') {
    const ids = b.categoryId.split(',').map(s => s.trim());
    return allCategories.filter(c => ids.includes(c.id));
  }

  return [];
};

export const getBudgetWallets = (b: Budget, allWallets: Wallet[]): Wallet[] => {
  if (isAllWalletsBudget(b)) return [];

  if (b.walletIds && b.walletIds.length > 0) {
    return allWallets.filter(w => b.walletIds?.includes(w.id));
  }

  if (b.walletId && b.walletId !== 'all') {
    const ids = b.walletId.split(',').map(s => s.trim());
    return allWallets.filter(w => ids.includes(w.id));
  }

  return [];
};

export const getBudgetCategoryLabel = (b: Budget, allCategories: Category[], isEn = false): string => {
  if (isAllCategoriesBudget(b)) {
    return isEn ? 'All Categories' : 'Semua Kategori';
  }
  const cats = getBudgetCategories(b, allCategories);
  if (cats.length === 0) return isEn ? 'Uncategorized' : 'Kategori Terhapus';
  if (cats.length === 1) return cats[0].name;
  return cats.map(c => c.name).join(', ');
};

export const getBudgetWalletLabel = (b: Budget, allWallets: Wallet[], isEn = false): string => {
  if (isAllWalletsBudget(b)) {
    return isEn ? 'All Wallets' : 'Semua Dompet';
  }
  const wals = getBudgetWallets(b, allWallets);
  if (wals.length === 0) return isEn ? 'Wallet' : 'Dompet';
  if (wals.length === 1) return wals[0].name;
  return wals.map(w => w.name).join(', ');
};
