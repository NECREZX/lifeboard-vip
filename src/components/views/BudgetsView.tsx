/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { Trash2, AlertTriangle, Edit2, ChevronDown, Layers, Wallet as WalletIcon, ShieldCheck, ShieldAlert, PieChart, AlertCircle, ArrowUpRight, CheckCircle2, X, Receipt, Search } from 'lucide-react';
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
  onAdd?: () => void;
  settings?: any;
  handleDeleteTransaction?: (id: string) => void;
  onEditTransaction?: (transaction: Transaction) => void;
}

// Helper for consistent badge and threshold calculation
// Rule: < 70% = green, 70% - 99% = yellow, >= 100% = red
const getBudgetStatus = (spend: number, limit: number) => {
  if (limit <= 0) {
    return {
      pctText: '0%',
      status: 'green' as const,
      isOver: false,
      remaining: 0,
      pctValue: 0,
    };
  }
  const rawPct = (spend / limit) * 100;
  const isOver = spend >= limit;
  const remaining = limit - spend;

  if (isOver) {
    const rounded = Math.round(rawPct);
    return {
      pctText: `${rounded}%`,
      status: 'red' as const,
      isOver: true,
      remaining,
      pctValue: 100,
    };
  }

  // Under limit: never display 100% if remaining > 0 (e.g. 99.58% -> 99%)
  const displayVal = Math.min(Math.floor(rawPct), 99);
  const status = rawPct >= 70 ? ('yellow' as const) : ('green' as const);

  return {
    pctText: `${displayVal}%`,
    status,
    isOver: false,
    remaining,
    pctValue: rawPct,
  };
};

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  categories,
  transactions,
  wallets,
  uiStyle,
  getCardClasses,
  handleDeleteBudget,
  onEdit,
  settings,
  handleDeleteTransaction,
  onEditTransaction
}) => {
  const isEn = settings?.language === 'en';

  const [selectedMonth, setSelectedMonth] = React.useState<string>(() => {
    return new Date().toISOString().slice(0, 7); // "YYYY-MM"
  });

  const [selectedWalletId, setSelectedWalletId] = React.useState<string>('all');
  const [inspectingModal, setInspectingModal] = React.useState<{
    title: string;
    transactions: Transaction[];
  } | null>(null);
  const [modalSearchQuery, setModalSearchQuery] = React.useState<string>('');
  const [canScrollDown, setCanScrollDown] = React.useState<boolean>(false);
  const [activeSummaryTab, setActiveSummaryTab] = React.useState<'global' | 'specific'>('global');
  const modalListRef = React.useRef<HTMLDivElement>(null);

  const checkModalScroll = React.useCallback(() => {
    if (!modalListRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = modalListRef.current;
    // Show arrow if remaining scroll distance is greater than 12px
    setCanScrollDown(scrollHeight - scrollTop - clientHeight > 12);
  }, []);

  const openInspectingModal = (title: string, txs: Transaction[]) => {
    setModalSearchQuery('');
    setInspectingModal({ title, transactions: txs });
  };

  const filteredModalTransactions = React.useMemo(() => {
    if (!inspectingModal) return [];
    if (!modalSearchQuery.trim()) return inspectingModal.transactions;
    const q = modalSearchQuery.toLowerCase();
    return inspectingModal.transactions.filter(t => {
      const cat = categories.find(c => c.id === t.categoryId)?.name?.toLowerCase() || '';
      const wal = wallets.find(w => w.id === t.walletId)?.name?.toLowerCase() || '';
      const desc = (t.description || '').toLowerCase();
      const amountStr = t.amount.toString();
      return desc.includes(q) || cat.includes(q) || wal.includes(q) || amountStr.includes(q);
    });
  }, [inspectingModal, modalSearchQuery, categories, wallets]);

  React.useEffect(() => {
    if (inspectingModal) {
      const timer = setTimeout(() => {
        checkModalScroll();
      }, 60);
      window.addEventListener('resize', checkModalScroll);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', checkModalScroll);
      };
    } else {
      setCanScrollDown(false);
    }
  }, [inspectingModal, filteredModalTransactions, checkModalScroll]);

  const getIndonesianMonthName = (monthStr: string) => {
    if (!monthStr) return '';
    const parts = monthStr.split('-');
    if (parts.length < 2) return monthStr;
    const [year, month] = parts;
    const months = isEn
      ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      : ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
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

  // Calculate spending for each budget rule
  const getBudgetSpend = (b: Budget) => {
    return transactions
      .filter((t) => {
        const isExpense = t.type === 'pengeluaran';
        const isSameCategory = (!b.categoryId || b.categoryId === 'all') ? true : (t.categoryId === b.categoryId);
        const isSameMonth = isTransactionInMonth(t.date, b.month);
        const isSameWallet = (!b.walletId || b.walletId === 'all')
          ? true
          : (t.walletId === b.walletId);
        return isExpense && isSameCategory && isSameMonth && isSameWallet;
      })
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  };

  // Specific vs Global Budget separation
  const grandTotalBudgets = filteredBudgets.filter(b => (!b.categoryId || b.categoryId === 'all') && (!b.walletId || b.walletId === 'all'));
  const specificBudgets = filteredBudgets.filter(b => !((!b.categoryId || b.categoryId === 'all') && (!b.walletId || b.walletId === 'all')));

  const hasGrandTotal = grandTotalBudgets.length > 0;
  const hasSpecific = specificBudgets.length > 0;
  const grandTotalBudget = grandTotalBudgets[0];

  // 1. Calculation for Specific Budgets (Pos Spesifik)
  const totalSpecificBudgeted = specificBudgets.reduce((sum, b) => sum + b.limitAmount, 0);
  const coveredSpecificTransactions = transactions.filter((t) => {
    if (t.type !== 'pengeluaran' || !isTransactionInMonth(t.date, selectedMonth)) return false;
    if (selectedWalletId !== 'all' && t.walletId !== selectedWalletId) return false;
    return specificBudgets.some((b) => {
      const matchCat = (!b.categoryId || b.categoryId === 'all') || t.categoryId === b.categoryId;
      const matchWal = (!b.walletId || b.walletId === 'all') || t.walletId === b.walletId;
      return matchCat && matchWal;
    });
  });
  const specificSpend = coveredSpecificTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const specificStatus = getBudgetStatus(specificSpend, totalSpecificBudgeted);

  // 2. Calculation for Grand Total Budget (Semua Dompet & Semua Kategori)
  const grandTotalLimit = grandTotalBudgets.reduce((sum, b) => sum + b.limitAmount, 0);
  const allExpenseTransactions = transactions.filter((t) => {
    if (t.type !== 'pengeluaran' || !isTransactionInMonth(t.date, selectedMonth)) return false;
    if (selectedWalletId !== 'all' && t.walletId !== selectedWalletId) return false;
    return true;
  });
  const grandTotalSpend = allExpenseTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const grandStatus = getBudgetStatus(grandTotalSpend, grandTotalLimit);

  const currentWalletName = selectedWalletId === 'all'
    ? (isEn ? 'All Wallets' : 'Seluruh Dompet')
    : (wallets.find(w => w.id === selectedWalletId)?.name || 'Dompet Terpilih');

  return (
    <div className="flex flex-col gap-5" id="view-budgeting">
      {/* Filter Selectors */}
      <div className="flex items-center justify-end w-full">
        <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          {/* Wallet Selector Dropdown */}
          <div className={`relative flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl transition-all min-w-0 overflow-hidden ${
            uiStyle === 'glass'
              ? 'glass-input'
              : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-sm'
          }`}>
            <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">
              {isEn ? 'Wallet:' : 'Dompet:'}
            </span>
            <div className="relative flex items-center min-w-0 flex-1 justify-end">
              <select
                value={selectedWalletId}
                onChange={(e) => setSelectedWalletId(e.target.value)}
                className="text-[11px] sm:text-xs font-bold bg-transparent border-none text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer py-0 pl-1 pr-4 min-w-0 w-full truncate text-right appearance-none"
              >
                <option value="all">{isEn ? 'All' : 'Semua'}</option>
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
            <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">
              {isEn ? 'Period:' : 'Periode:'}
            </span>
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

      {/* Unified Summary Card */}
      {(hasGrandTotal || hasSpecific) && (() => {
        const effectiveTab = (hasGrandTotal && !hasSpecific) 
          ? 'global' 
          : (!hasGrandTotal && hasSpecific) 
            ? 'specific' 
            : activeSummaryTab;
        const isGlobal = effectiveTab === 'global';

        const currLimit = isGlobal ? grandTotalLimit : totalSpecificBudgeted;
        const currSpend = isGlobal ? grandTotalSpend : specificSpend;
        const currTxs = isGlobal ? allExpenseTransactions : coveredSpecificTransactions;
        const currStatus = isGlobal ? grandStatus : specificStatus;
        const modalTitle = isGlobal
          ? (isEn ? 'Global Budget' : 'Anggaran Total Bulanan')
          : (isEn ? 'Specific Budgets' : 'Pos Anggaran Spesifik');

        return (
          <div className={getCardClasses() + " p-4 sm:p-5 relative overflow-hidden"}>
            {/* Header: Tab Switcher (if both exist) or Title + Status Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              {hasGrandTotal && hasSpecific ? (
                <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => setActiveSummaryTab('global')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      effectiveTab === 'global'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {isEn ? 'Global Budget' : 'Anggaran Global'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSummaryTab('specific')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      effectiveTab === 'specific'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {isEn ? 'Specific Budget' : 'Anggaran Spesifik'}
                  </button>
                </div>
              ) : (
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {hasGrandTotal 
                    ? (isEn ? 'Global Budget' : 'Anggaran Global') 
                    : (isEn ? 'Specific Budget' : 'Anggaran Spesifik')}
                </span>
              )}

              {/* Status Badge */}
              {currStatus.status === 'red' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{currStatus.pctText} {isEn ? 'Over' : 'Melebihi'}</span>
                </span>
              ) : currStatus.status === 'yellow' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 shrink-0">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>{currStatus.pctText} {isEn ? 'used' : 'terpakai'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>{currStatus.pctText} {isEn ? 'used' : 'terpakai'}</span>
                </span>
              )}
            </div>

            {/* Content: Limit + Terpakai + Sisa */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 items-center">
              {/* Total Limit */}
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block">
                  {isEn ? 'Total Limit' : 'Batas Total'}
                </span>
                <div className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white mt-0.5 truncate">
                  {formatIDR(currLimit)}
                </div>
              </div>

              {/* Terpakai */}
              <div className="flex flex-col justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 min-w-0">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {isEn ? 'Spent' : 'Terpakai'}
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5 truncate">
                  {formatIDR(currSpend)}
                </span>
              </div>

              {/* Sisa */}
              <div className="flex flex-col justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 min-w-0">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {currStatus.isOver ? (isEn ? 'Overspent' : 'Kelebihan') : (isEn ? 'Remaining' : 'Sisa')}
                </span>
                <span className={`text-sm sm:text-base font-bold mt-0.5 truncate ${currStatus.isOver ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {currStatus.isOver ? `-${formatIDR(Math.abs(currStatus.remaining))}` : formatIDR(currStatus.remaining)}
                </span>
              </div>
            </div>

            {/* Mini Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3.5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  currStatus.status === 'red' ? 'bg-rose-500' : currStatus.status === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${currStatus.pctValue}%` }}
              />
            </div>

            {/* Action Row: Rincian Transaksi */}
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2.5 mt-3.5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => openInspectingModal(modalTitle, currTxs)}
                className="flex-1 flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <span>{isEn ? 'Transaction Details' : 'Rincian Transaksi'}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-extrabold border border-slate-200/60 dark:border-slate-700">
                    {currTxs.length}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  <span>{isEn ? 'View Details' : 'Lihat Rincian'}</span>
                  <ChevronDown className="w-3.5 h-3.5 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        );
      })()}

      {/* Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBudgets.length === 0 ? (
          <div className={getCardClasses() + " p-8 text-center flex flex-col items-center justify-center col-span-full border-dashed py-12"}>
            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center mb-3.5 shadow-sm">
              <span className="text-xl">📅</span>
            </div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {isEn ? 'No Budgets Created' : 'Belum Ada Anggaran'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
              {isEn
                ? `You have not set any spending budget limits for ${getIndonesianMonthName(selectedMonth)}. Tap the (+) button on the bottom navigation bar to create a budget.`
                : `Anda belum menentukan batas anggaran pengeluaran untuk bulan ${getIndonesianMonthName(selectedMonth)}. Gunakan tombol (+) pada bilah navigasi bawah untuk menambahkan anggaran.`}
            </p>
          </div>
        ) : (
          filteredBudgets.map((b) => {
            const isAllCat = !b.categoryId || b.categoryId === 'all';
            const isAllWal = !b.walletId || b.walletId === 'all';

            const cat = categories.find((c) => c.id === b.categoryId);
            const matchingTxs = transactions.filter((t) => {
              const isExpense = t.type === 'pengeluaran';
              const isSameCategory = (!b.categoryId || b.categoryId === 'all') ? true : (t.categoryId === b.categoryId);
              const isSameMonth = isTransactionInMonth(t.date, b.month);
              const isSameWallet = (!b.walletId || b.walletId === 'all') ? true : (t.walletId === b.walletId);
              return isExpense && isSameCategory && isSameMonth && isSameWallet;
            });
            const currentSpend = matchingTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
            const targetWallet = wallets.find((w) => w.id === b.walletId);
            const itemStatus = getBudgetStatus(currentSpend, b.limitAmount);
            const walletName = !isAllWal
              ? (targetWallet?.name || 'Dompet')
              : (isEn ? 'All Wallets' : 'Semua Dompet');

            // Category title
            const categoryTitle = isAllCat
              ? (isEn ? 'All Categories' : 'Semua Kategori')
              : (cat?.name || (isEn ? 'Deleted Category' : 'Kategori Terhapus'));

            // Scope classification badge
            let scopeLabel = '';
            let scopeClass = '';
            if (isAllWal && isAllCat) {
              scopeLabel = isEn ? 'All Expenses' : 'Total Belanja';
              scopeClass = 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/40';
            } else if (!isAllWal && isAllCat) {
              scopeLabel = isEn ? 'Wallet' : 'Dompet';
              scopeClass = 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/40';
            } else if (isAllWal && !isAllCat) {
              scopeLabel = isEn ? 'Category' : 'Kategori';
              scopeClass = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40';
            } else {
              scopeLabel = isEn ? 'Specific' : 'Spesifik';
              scopeClass = 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40';
            }

            return (
              <div key={b.id} className={`${getCardClasses()} p-4 sm:p-5 flex flex-col justify-between gap-3.5 relative overflow-hidden transition-all duration-200`}>
                {/* Header Row: Category, Wallet & Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                      style={{ 
                        backgroundColor: isAllCat 
                          ? (!isAllWal ? `${targetWallet?.color || '#3b82f6'}20` : '#8b5cf620')
                          : `${cat?.color || '#3b82f6'}20` 
                      }}
                    >
                      {isAllCat ? (
                        !isAllWal && targetWallet?.icon ? (
                          <IconRenderer name={targetWallet.icon} className="w-5 h-5" style={{ color: targetWallet.color || '#3b82f6' }} />
                        ) : isAllWal ? (
                          <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        ) : (
                          <WalletIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        )
                      ) : (
                        cat?.icon && <IconRenderer name={cat.icon} className="w-5 h-5" style={{ color: cat.color }} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{categoryTitle}</h4>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border shrink-0 ${scopeClass}`}>
                          {scopeLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 font-semibold truncate">
                        <span>{getIndonesianMonthName(b.month)}</span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="font-bold text-indigo-500 dark:text-indigo-400 truncate">
                          {walletName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onEdit(b)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      title={isEn ? "Edit" : "Ubah"}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBudget(b.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      title={isEn ? "Delete" : "Hapus"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Middle Content: Progress & Numbers */}
                <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px]">
                      {isEn ? 'Counted Expenses:' : 'Terpakai saat ini:'}
                    </span>
                    <span className={`font-mono font-bold text-xs sm:text-sm ${itemStatus.isOver ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                      {formatIDR(currentSpend)} <span className="text-slate-400 font-normal">/ {formatIDR(b.limitAmount)}</span>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200/80 dark:bg-slate-700/80 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        itemStatus.status === 'red' ? 'bg-rose-500' : itemStatus.status === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${itemStatus.pctValue}%` }}
                    />
                  </div>

                  {/* Remaining & Percentage */}
                  <div className="flex items-center justify-between mt-1.5 text-[10px] font-bold text-slate-400">
                    <span className={itemStatus.isOver ? 'text-rose-500' : itemStatus.status === 'yellow' ? 'text-amber-600 dark:text-amber-400' : ''}>
                      {itemStatus.isOver ? (isEn ? 'OVER LIMIT!' : 'MELEBIHI LIMIT!') : `${isEn ? 'Sisa:' : 'Sisa:'} ${formatIDR(itemStatus.remaining)}`}
                    </span>
                    <span className={itemStatus.status === 'red' ? 'text-rose-500' : itemStatus.status === 'yellow' ? 'text-amber-600 dark:text-amber-400' : ''}>
                      {itemStatus.pctText}
                    </span>
                  </div>
                </div>

                {/* Action Row: Rincian Transaksi (Persis Konsep Menu Tabungan) */}
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2.5 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => openInspectingModal(
                      `${categoryTitle} (${walletName})`,
                      matchingTxs
                    )}
                    className="flex-1 flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <span>{isEn ? 'Transaction Details' : 'Rincian Transaksi'}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-extrabold border border-slate-200/60 dark:border-slate-700">
                        {matchingTxs.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      <span>{isEn ? 'View Details' : 'Lihat Rincian'}</span>
                      <ChevronDown className="w-3.5 h-3.5 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Inspecting Transactions Modal (Portaled to document.body to prevent any bottom nav clipping or z-index collisions) */}
      {inspectingModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setInspectingModal(null);
              setModalSearchQuery('');
            }
          }}
        >
          <div className={`relative w-full max-w-lg mx-auto rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[78vh] sm:h-[560px] max-h-[85vh] sm:max-h-[80vh] border-t sm:border border-slate-200/90 dark:border-slate-800 ${
            uiStyle === 'glass'
              ? 'glass-card'
              : 'bg-white dark:bg-slate-900'
          }`}>
            {/* Mobile Sheet Drag Indicator */}
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

            {/* Header */}
            <div className="px-4 sm:px-5 pt-3 sm:pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">
                    {isEn ? 'Counted Expenses Detail' : 'Rincian Transaksi Terpakai'}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    {inspectingModal.transactions.length} trx
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {inspectingModal.title} • {getIndonesianMonthName(selectedMonth)}
                </p>
              </div>
            </div>

            {/* Quick Search for when there are multiple transactions */}
            {inspectingModal.transactions.length > 2 && (
              <div className="px-4 sm:px-5 pt-2.5 pb-1 shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    placeholder={isEn ? "Search transaction, wallet, or category..." : "Cari transaksi, dompet, atau kategori..."}
                    className="w-full pl-8 pr-8 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {modalSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setModalSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {modalSearchQuery && (
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 pl-1">
                    {isEn
                      ? `Showing ${filteredModalTransactions.length} of ${inspectingModal.transactions.length} trx`
                      : `Menampilkan ${filteredModalTransactions.length} dari ${inspectingModal.transactions.length} trx`}
                  </div>
                )}
              </div>
            )}

            {/* High-Efficiency Compact Transactions List */}
            <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
              <div 
                ref={modalListRef}
                onScroll={checkModalScroll}
                className="flex-1 overflow-y-auto min-h-0 px-3 sm:px-4 py-2 flex flex-col gap-2 overscroll-contain scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {filteredModalTransactions.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-medium">
                    {modalSearchQuery
                      ? (isEn ? 'No transactions match your search.' : 'Tidak ada transaksi yang cocok dengan pencarian.')
                      : (isEn ? 'No expense transactions recorded yet for this budget.' : 'Belum ada transaksi pengeluaran tercatat untuk anggaran ini.')
                    }
                  </div>
                ) : (
                  filteredModalTransactions.map((tx) => {
                    const txCat = categories.find(c => c.id === tx.categoryId);
                    const txWal = wallets.find(w => w.id === tx.walletId);

                    return (
                      <div
                        key={tx.id}
                        className="h-[60px] px-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 flex items-center justify-between gap-3 transition shrink-0 shadow-2xs"
                      >
                        {/* Left Side: Category Icon + Description & Info */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                            style={{ backgroundColor: `${txCat?.color || '#ef4444'}18` }}
                          >
                            {txCat?.icon ? (
                              <IconRenderer name={txCat.icon} className="w-4 h-4" style={{ color: txCat.color }} />
                            ) : (
                              <Receipt className="w-4 h-4 text-rose-500" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1 flex flex-col justify-center">
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate leading-snug">
                              {tx.description || (isEn ? 'Expense' : 'Pengeluaran')}
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate flex items-center gap-1.5 mt-0.5 leading-none">
                              <span className="shrink-0">{new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                              <span className="shrink-0">•</span>
                              <span className="text-indigo-600 dark:text-indigo-400 font-semibold truncate max-w-[100px]">{txWal?.name || 'Dompet'}</span>
                              <span className="shrink-0">•</span>
                              <span className="truncate">{txCat?.name || 'Kategori'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right Side: Amount & Inline Action Buttons */}
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="text-xs sm:text-sm font-mono font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                            -{formatIDR(tx.amount)}
                          </span>
                          <div className="flex items-center gap-0.5 shrink-0">
                            {onEditTransaction && (
                              <button
                                type="button"
                                onClick={() => {
                                  setInspectingModal(null);
                                  setModalSearchQuery('');
                                  onEditTransaction(tx);
                                }}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition"
                                title={isEn ? "Edit" : "Ubah"}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {handleDeleteTransaction && (
                              <button
                                type="button"
                                onClick={() => {
                                  handleDeleteTransaction(tx.id);
                                  setInspectingModal(prev => prev ? {
                                    ...prev,
                                    transactions: prev.transactions.filter(t => t.id !== tx.id)
                                  } : null);
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition"
                                title={isEn ? "Delete" : "Hapus"}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Footer Summary with Close Button and Centered Scroll Down Arrow */}
            <div className="relative px-4 sm:px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom,20px))] sm:pb-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs shrink-0 bg-slate-50/70 dark:bg-slate-900/70">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                  {isEn ? 'Total Counted Spent' : 'Total Terpakai'}
                </span>
                <span className="font-mono font-bold text-sm text-rose-600 dark:text-rose-400">
                  {formatIDR(inspectingModal.transactions.reduce((s, t) => s + (Number(t.amount) || 0), 0))}
                </span>
              </div>

              {/* Tanda Panah ke Bawah Sejajar di Tengah Footer */}
              {canScrollDown && (
                <button
                  type="button"
                  onClick={() => {
                    if (modalListRef.current) {
                      modalListRef.current.scrollBy({ top: 180, behavior: 'smooth' });
                    }
                  }}
                  className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-slate-200/90 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300/60 dark:border-slate-700 shadow-2xs transition cursor-pointer"
                  title={isEn ? "Scroll down for more" : "Masih ada transaksi di bawah"}
                  aria-label="Scroll ke bawah"
                >
                  <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setInspectingModal(null);
                  setModalSearchQuery('');
                }}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition shadow-xs"
              >
                {isEn ? 'Close' : 'Tutup'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

