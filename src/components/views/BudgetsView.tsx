/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trash2, AlertTriangle, Edit2, PlusCircle } from 'lucide-react';
import { Budget, Category, Transaction, Wallet } from '../../types';
import { IconRenderer } from '../IconRenderer';
import { formatIDR } from '../../lib/formatters';

interface BudgetsViewProps {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  wallets: Wallet[];
  getCardClasses: () => string;
  handleDeleteBudget: (id: string) => void;
  onEdit: (budget: Budget) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  categories,
  transactions,
  wallets,
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

  const filteredBudgets = budgets.filter((b) => {
    const matchesMonth = b.month === selectedMonth;
    const matchesWallet = selectedWalletId === 'all' || b.walletId === selectedWalletId;
    return matchesMonth && matchesWallet;
  });

  const totalBudgeted = filteredBudgets.reduce((sum, b) => sum + b.limitAmount, 0);
  const totalSpend = filteredBudgets.reduce((sum, b) => {
    const categorySpend = transactions
      .filter((t) => {
        const isExpense = t.type === 'pengeluaran';
        const isSameCategory = t.categoryId === b.categoryId;
        const isSameMonth = t.date.startsWith(b.month);
        const isSameWallet = !b.walletId || t.walletId === b.walletId;
        return isExpense && isSameCategory && isSameMonth && isSameWallet;
      })
      .reduce((s, t) => s + t.amount, 0);
    return sum + categorySpend;
  }, 0);

  const overBudgetCount = filteredBudgets.filter((b) => {
    const categorySpend = transactions
      .filter((t) => {
        const isExpense = t.type === 'pengeluaran';
        const isSameCategory = t.categoryId === b.categoryId;
        const isSameMonth = t.date.startsWith(b.month);
        const isSameWallet = !b.walletId || t.walletId === b.walletId;
        return isExpense && isSameCategory && isSameMonth && isSameWallet;
      })
      .reduce((s, t) => s + t.amount, 0);
    return categorySpend > b.limitAmount;
  }).length;

  return (
    <div className="flex flex-col gap-5" id="view-budgeting">
      {/* Header & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">Budgeting</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Wallet Selector Dropdown */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 px-3.5 py-1.5 rounded-xl shadow-sm self-start sm:self-auto">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Dompet:</span>
            <select
              value={selectedWalletId}
              onChange={(e) => setSelectedWalletId(e.target.value)}
              className="text-xs font-bold bg-transparent border-none text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer p-0"
            >
              <option value="all">Semua Dompet</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 px-3.5 py-1.5 rounded-xl shadow-sm self-start sm:self-auto">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Periode:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-bold bg-transparent border-none text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer p-0"
            />
          </div>
        </div>
      </div>

      {/* Month Summary Card */}
      {filteredBudgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-900/60">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Anggaran ({getIndonesianMonthName(selectedMonth)})</span>
            <span className="text-sm font-black text-slate-700 dark:text-slate-300 mt-1">{formatIDR(totalBudgeted)}</span>
          </div>
          <div className="flex flex-col border-t sm:border-t-0 sm:border-l border-slate-200/60 dark:border-slate-800/60 pt-2 sm:pt-0 sm:pl-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Terpakai</span>
            <span className="text-sm font-black text-slate-700 dark:text-slate-300 mt-1">{formatIDR(totalSpend)}</span>
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
            const currentSpend = transactions
              .filter((t) => {
                const isExpense = t.type === 'pengeluaran';
                const isSameCategory = t.categoryId === b.categoryId;
                const isSameMonth = t.date.startsWith(b.month);
                const isSameWallet = !b.walletId || t.walletId === b.walletId;
                return isExpense && isSameCategory && isSameMonth && isSameWallet;
              })
              .reduce((sum, t) => sum + t.amount, 0);

            const pct = Math.min((currentSpend / b.limitAmount) * 100, 100);
            const isOver = currentSpend > b.limitAmount;
            const remaining = b.limitAmount - currentSpend;

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
                        {b.walletId && (
                          <>
                            <span className="text-[10px] text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-wide">
                              {wallets.find((w) => w.id === b.walletId)?.name || 'Dompet'}
                            </span>
                          </>
                        )}
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
