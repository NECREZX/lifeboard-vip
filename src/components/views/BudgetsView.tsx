/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trash2, AlertTriangle, Edit2, PlusCircle, ChevronDown } from 'lucide-react';
import { Budget, Category, Transaction, Wallet } from '../../types';
import { IconRenderer } from '../IconRenderer';
import { formatIDR } from '../../lib/formatters';

interface BudgetsViewProps {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  wallets: Wallet[];
  uiStyle?: string;
  getCardClasses: () => string;
  handleDeleteBudget: (id: string) => void;
  onEdit: (budget: Budget) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  categories,
  transactions,
  wallets,
  uiStyle,
  getCardClasses,
  handleDeleteBudget,
  onEdit
}) => {
  const [selectedMonth, setSelectedMonth] = React.useState<string>(() => {
    return new Date().toISOString().slice(0, 7); // "YYYY-MM"
  });

  const [selectedWalletId, setSelectedWalletId] = React.useState<string>('all');

  const getIndonesianMonthName = (monthStr: string) => {
    if (!monthStr) return '';
    const parts = monthStr.split('-');
    if (parts.length < 2) return monthStr;
    const [year, month] = parts;
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthIndex = parseInt(month, 10) - 1;
    return `${months[monthIndex] || ''} ${year}`;
  };

  const isTransactionInMonth = (txDate: string, targetMonth: string) => {
    if (!txDate || !targetMonth) return false;
    if (txDate.startsWith(targetMonth)) return true;
    try {
      const d = new Date(txDate);
      if (!isNaN(d.getTime())) {
        return d.toISOString().slice(0, 7) === targetMonth;
      }
    } catch {
      // ignore
    }
    return false;
  };

  const filteredBudgets = budgets.filter((b) => {
    const matchesMonth = b.month === selectedMonth;
    const matchesWallet =
      selectedWalletId === 'all' ||
      !b.walletId ||
      b.walletId === 'all' ||
      b.walletId === selectedWalletId;
    return matchesMonth && matchesWallet;
  });

  const getBudgetSpend = (b: Budget) => {
    return transactions
      .filter((t) => {
        const isExpense = t.type === 'pengeluaran';
        const isSameCategory = t.categoryId === b.categoryId;
        const isSameMonth = isTransactionInMonth(t.date, b.month);
        const isSameWallet =
          (!b.walletId || b.walletId === 'all')
            ? (selectedWalletId === 'all' || t.walletId === selectedWalletId)
            : (t.walletId === b.walletId);
        return isExpense && isSameCategory && isSameMonth && isSameWallet;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const totalBudgeted = filteredBudgets.reduce((sum, b) => sum + b.limitAmount, 0);
  const totalSpend = filteredBudgets.reduce((sum, b) => sum + getBudgetSpend(b), 0);
  const overBudgetCount = filteredBudgets.filter((b) => getBudgetSpend(b) > b.limitAmount).length;

  return (
    <div className="flex flex-col gap-6" id="view-budgeting">
      {/* Filter Selectors */}
      <div className="flex sm:justify-end gap-2.5 mb-2">
        <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          {/* Wallet Selector Dropdown */}
          <div className={`relative flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl transition-all min-w-0 overflow-hidden ${
            uiStyle === 'glass'
              ? 'glass-input'
              : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-sm'
          }`}>
            <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">Dompet:</span>
            <div className="relative flex items-center min-w-0 flex-1 justify-end">
              <select
                value={selectedWalletId}
                onChange={(e) => setSelectedWalletId(e.target.value)}
                className="text-[11px] sm:text-xs font-bold bg-transparent border-none text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer py-0 pl-1 pr-4 min-w-0 w-full truncate text-right appearance-none"
              >
                <option value="all">Semua</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none absolute right-0 shrink-0" />
            </div>
          </div>

          {/* Period Selector */}
          <div className={`relative flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl transition-all min-w-0 overflow-hidden ${
            uiStyle === 'glass'
              ? 'glass-input'
              : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-sm'
          }`}>
            <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">Periode:</span>
            <div className="relative flex items-center min-w-0 flex-1 justify-end">
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 truncate text-right pr-4 block">
                {getIndonesianMonthName(selectedMonth)}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none absolute right-0 shrink-0" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Month Summary Card */}
      {filteredBudgets.length > 0 && (
        <div className={getCardClasses() + " p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 relative overflow-hidden"}>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Anggaran ({getIndonesianMonthName(selectedMonth)})</span>
            <span className="text-lg font-black text-slate-800 dark:text-slate-200 mt-1">{formatIDR(totalBudgeted)}</span>
          </div>
          <div className="flex flex-col border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800/60 pt-3 sm:pt-0 sm:pl-5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Terpakai</span>
            <span className="text-lg font-black text-slate-800 dark:text-slate-200 mt-1">{formatIDR(totalSpend)}</span>
          </div>
        </div>
      )}

      {/* Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBudgets.length === 0 ? (
          <div className={getCardClasses() + " p-8 text-center flex flex-col items-center justify-center col-span-full border-dashed py-12"}>
            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center mb-3.5 shadow-sm">
              <span className="text-xl">📅</span>
            </div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum Ada Anggaran</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
              Anda belum menentukan batas anggaran pengeluaran untuk bulan <span className="font-semibold text-slate-600 dark:text-slate-400">{getIndonesianMonthName(selectedMonth)}</span>.
            </p>
          </div>
        ) : (
          filteredBudgets.map((b) => {
            const cat = categories.find((c) => c.id === b.categoryId);
            const currentSpend = getBudgetSpend(b);

            const pct = Math.min((currentSpend / b.limitAmount) * 100, 100);
            const isOver = currentSpend > b.limitAmount;
            const remaining = b.limitAmount - currentSpend;
            const walletName = b.walletId && b.walletId !== 'all'
              ? wallets.find((w) => w.id === b.walletId)?.name
              : 'Semua Dompet';

            return (
              <div key={b.id} className={getCardClasses() + " p-5 flex flex-col justify-between min-h-[160px] relative"}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                      style={{ backgroundColor: `${cat?.color || '#3b82f6'}20` }}
                    >
                      {cat?.icon && <IconRenderer name={cat.icon} className="w-5 h-5" style={{ color: cat.color }} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{cat?.name || 'Kategori Terhapus'}</h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-slate-400 font-semibold">Bulan: {getIndonesianMonthName(b.month)}</span>
                        <span className="text-[10px] text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-wide">
                          {walletName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => onEdit(b)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteBudget(b.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="my-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-500">Pemakaian Anggaran</span>
                    <span className={`font-mono font-bold ${isOver ? 'text-rose-500' : 'text-slate-800 dark:text-slate-200'}`}>
                      {formatIDR(currentSpend)} / {formatIDR(b.limitAmount)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${isOver ? 'bg-rose-500' : pct > 85 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isOver ? 'text-rose-500' : 'text-slate-400'}`}>
                      {isOver ? 'MELEBIHI LIMIT!' : `Sisa: ${formatIDR(remaining)}`}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{pct.toFixed(0)}%</span>
                  </div>
                </div>

                {isOver && (
                  <div className="mt-1 flex items-center gap-1.5 text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-2 py-1 rounded-lg border border-rose-100 dark:border-rose-900/50">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Peringatan Overbudget</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
