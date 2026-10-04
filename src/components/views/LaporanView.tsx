/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, ArrowUpCircle, ArrowDownCircle, ArrowRightLeft,
  TrendingDown, TrendingUp, Tag, PlusCircle, ArrowRight, Filter, 
  Calendar, CheckCircle2, ChevronDown, ChevronUp, Sparkles, PieChart, Home, BarChart3, Wallet as WalletIcon
} from 'lucide-react';
import { Transaction, Category, IncomeSource, Wallet, UserSettings } from '../../types';
import { IconRenderer } from '../IconRenderer';
import { formatIDR } from '../../lib/formatters';
import { Breadcrumb } from '../Breadcrumb';
import { CategoryBarChart, SourceBarChart, TransferBarChart } from '../InteractiveCharts';

interface LaporanViewProps {
  transactions: Transaction[];
  categories: Category[];
  sources: IncomeSource[];
  wallets: Wallet[];
  settings: UserSettings;
  setActiveTab: (tab: string) => void;
  onAddTransaction: (type: 'pengeluaran' | 'pemasukan') => void;
  getCardClasses: () => string;
  getAccentBg: () => string;
}

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const MONTH_SHORT_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

export function LaporanView({
  transactions,
  categories,
  sources,
  wallets,
  settings,
  setActiveTab,
  onAddTransaction,
  getCardClasses,
  getAccentBg
}: LaporanViewProps) {
  // Current date defaults
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1); // 1-12
  const [selectedType, setSelectedType] = useState<'pengeluaran' | 'pemasukan' | 'transfer'>('pengeluaran');
  const [showAllRankings, setShowAllRankings] = useState<boolean>(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [showAllMonthTx, setShowAllMonthTx] = useState<boolean>(false);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
    setSelectedCategoryFilter(null);
    setShowAllMonthTx(false);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
    setSelectedCategoryFilter(null);
    setShowAllMonthTx(false);
  };

  // String prefix for selected month: "YYYY-MM"
  const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const currentMonthName = MONTH_NAMES_ID[selectedMonth - 1];

  // Helper for previous & next month short labels
  const prevMonthIdx = selectedMonth === 1 ? 11 : selectedMonth - 2;
  const prevYearLabel = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
  const prevMonthLabel = `${MONTH_SHORT_ID[prevMonthIdx]} ${prevYearLabel}`;

  const nextMonthIdx = selectedMonth === 12 ? 0 : selectedMonth;
  const nextYearLabel = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
  const nextMonthLabel = `${MONTH_SHORT_ID[nextMonthIdx]} ${nextYearLabel}`;

  // Filter transactions for the selected month and type
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (!t.date || !t.date.startsWith(monthKey)) return false;
      return t.type === selectedType;
    });
  }, [transactions, monthKey, selectedType]);

  // Total nominal for the month
  const totalAmount = useMemo(() => {
    return monthTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const totalMonthAdminFees = useMemo(() => {
    return transactions
      .filter(t => t.date && t.date.startsWith(monthKey) && t.type === 'transfer' && t.adminFee)
      .reduce((sum, t) => sum + (t.adminFee || 0), 0);
  }, [transactions, monthKey]);

  // Total Income & Expense for the selected month to compute net balance
  const monthTotalIncome = useMemo(() => {
    return transactions
      .filter(t => t.date && t.date.startsWith(monthKey) && t.type === 'pemasukan')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, monthKey]);

  const monthTotalExpense = useMemo(() => {
    return transactions
      .filter(t => t.date && t.date.startsWith(monthKey) && t.type === 'pengeluaran')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, monthKey]);

  const monthNetBalance = monthTotalIncome - monthTotalExpense;

  // Group by category (pengeluaran), source (pemasukan), or transfer route (transfer)
  const rankedItems = useMemo(() => {
    if (selectedType === 'pengeluaran') {
      const grouped: { [key: string]: { id: string; amount: number; count: number } } = {};
      monthTransactions.forEach(t => {
        const catId = t.categoryId || 'unknown';
        if (!grouped[catId]) {
          grouped[catId] = { id: catId, amount: 0, count: 0 };
        }
        grouped[catId].amount += t.amount;
        grouped[catId].count += 1;
      });

      return Object.values(grouped)
        .map(g => {
          const cat = categories.find(c => c.id === g.id);
          const percentage = totalAmount > 0 ? Math.round((g.amount / totalAmount) * 100) : 0;
          return {
            id: g.id,
            name: cat ? cat.name : 'Lainnya',
            icon: cat ? cat.icon : 'Tag',
            color: cat ? cat.color : '#64748b',
            amount: g.amount,
            count: g.count,
            percentage
          };
        })
        .sort((a, b) => b.amount - a.amount);
    } else if (selectedType === 'pemasukan') {
      const grouped: { [key: string]: { id: string; amount: number; count: number } } = {};
      monthTransactions.forEach(t => {
        const srcId = t.sourceId || 'unknown';
        if (!grouped[srcId]) {
          grouped[srcId] = { id: srcId, amount: 0, count: 0 };
        }
        grouped[srcId].amount += t.amount;
        grouped[srcId].count += 1;
      });

      return Object.values(grouped)
        .map(g => {
          const src = sources.find(s => s.id === g.id);
          const percentage = totalAmount > 0 ? Math.round((g.amount / totalAmount) * 100) : 0;
          return {
            id: g.id,
            name: src ? src.name : 'Lainnya',
            icon: src ? src.icon : 'Briefcase',
            color: src ? src.color : '#10b981',
            amount: g.amount,
            count: g.count,
            percentage
          };
        })
        .sort((a, b) => b.amount - a.amount);
    } else {
      // transfer
      const grouped: { [key: string]: { id: string; amount: number; count: number; adminFee: number } } = {};
      monthTransactions.forEach(t => {
        const key = `${t.walletId || 'unknown'}:::${t.toWalletId || 'unknown'}`;
        if (!grouped[key]) {
          grouped[key] = { id: key, amount: 0, count: 0, adminFee: 0 };
        }
        grouped[key].amount += t.amount;
        grouped[key].count += 1;
        if (t.adminFee) grouped[key].adminFee += t.adminFee;
      });

      return Object.values(grouped)
        .map(g => {
          const [fromId, toId] = g.id.split(':::');
          const fromW = wallets.find(w => w.id === fromId || w.name.toLowerCase() === String(fromId).toLowerCase());
          const toW = wallets.find(w => w.id === toId || w.name.toLowerCase() === String(toId).toLowerCase());
          const fromName = fromW ? fromW.name : (fromId !== 'unknown' ? fromId : (wallets[0]?.name || 'Dompet Utama'));
          const toName = toW ? toW.name : (toId !== 'unknown' ? toId : (wallets[1]?.name || 'Livin Mandiri'));
          const name = `${fromName} ➜ ${toName}`;
          const percentage = totalAmount > 0 ? Math.round((g.amount / totalAmount) * 100) : 0;
          return {
            id: g.id,
            name,
            icon: 'ArrowRightLeft',
            color: '#0284c7',
            amount: g.amount,
            count: g.count,
            percentage,
            adminFee: g.adminFee
          };
        })
        .sort((a, b) => b.amount - a.amount);
    }
  }, [monthTransactions, selectedType, categories, sources, wallets, totalAmount]);

  // Filtered detailed transactions if user clicked a specific category/source/transfer route
  const detailedTransactions = useMemo(() => {
    if (!selectedCategoryFilter) return monthTransactions;
    return monthTransactions.filter(t => {
      if (selectedType === 'pengeluaran') {
        return t.categoryId === selectedCategoryFilter;
      } else if (selectedType === 'pemasukan') {
        return t.sourceId === selectedCategoryFilter;
      } else {
        const key = `${t.walletId}-${t.toWalletId || 'unknown'}`;
        return key === selectedCategoryFilter;
      }
    });
  }, [monthTransactions, selectedCategoryFilter, selectedType]);

  const displayedTransactions = useMemo(() => {
    if (showAllMonthTx) return detailedTransactions;
    return detailedTransactions.slice(0, 5);
  }, [detailedTransactions, showAllMonthTx]);

  // Strictly Top 3 categories/sources
  const displayedRankings = rankedItems.slice(0, 3);

  // Card styling tokens based on settings
  const btnRadius = settings?.cardRadius === 'sharp' ? 'rounded-none' : settings?.cardRadius === 'extra' ? 'rounded-2xl' : 'rounded-xl';
  const innerCardRadius = settings?.cardRadius === 'sharp' ? 'rounded-none' : settings?.cardRadius === 'extra' ? 'rounded-2xl' : 'rounded-xl';

  return (
    <div className="flex flex-col gap-4 pb-32">
      <Breadcrumb 
        items={[
          { label: 'Dashboard', onClick: () => setActiveTab('dashboard') },
          { label: 'Laporan Keuangan' }
        ]} 
      />
      
      {/* 1. Top Main Control Card */}
      {/* Wraps: Month Ruler/Slider, Pengeluaran/Pendapatan Tabs, and Total Summary */}
      <div className={`${getCardClasses()} p-4 sm:p-6 space-y-4`}>
        
        {/* Month Selector Ruler Tape */}
        <div className={`flex items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2 sm:p-2.5 ${innerCardRadius} border border-slate-200/80 dark:border-slate-800 select-none`}>
          {/* Left button */}
          <button
            type="button"
            onClick={handlePrevMonth}
            className={`w-8 h-8 sm:w-9 sm:h-9 ${btnRadius} bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-colors cursor-pointer shrink-0`}
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Center Ruler / Scale */}
          <div className="flex-1 flex flex-col items-center justify-center overflow-hidden px-2">
            {/* Top Indicator notch */}
            <div className="w-0.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full mb-1" />

            {/* Month labels */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
              <span 
                onClick={handlePrevMonth}
                className="text-slate-400 dark:text-slate-500 text-[11px] sm:text-xs font-medium cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors truncate max-w-[70px] sm:max-w-none text-center"
              >
                {prevMonthLabel}
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight">
                {MONTH_SHORT_ID[selectedMonth - 1]} {selectedYear}
              </span>
              <span 
                onClick={handleNextMonth}
                className="text-slate-400 dark:text-slate-500 text-[11px] sm:text-xs font-medium cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors truncate max-w-[70px] sm:max-w-none text-center"
              >
                {nextMonthLabel}
              </span>
            </div>

            {/* Ruler Ticks Simulation */}
            <div className="flex items-end justify-center gap-1 sm:gap-1.5 mt-1.5 pt-1 border-t border-slate-200 dark:border-slate-700/80 w-full max-w-[220px]">
              <div className="w-0.5 h-1 bg-slate-300 dark:bg-slate-600" />
              <div className="w-0.5 h-1.5 bg-slate-300 dark:bg-slate-600" />
              <div className="w-0.5 h-1 bg-slate-300 dark:bg-slate-600" />
              <div className="w-0.5 h-1 bg-slate-300 dark:bg-slate-600" />
              {/* Active Center Red/Theme Notch */}
              <div className="w-1 h-3 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
              <div className="w-0.5 h-1 bg-slate-300 dark:bg-slate-600" />
              <div className="w-0.5 h-1 bg-slate-300 dark:bg-slate-600" />
              <div className="w-0.5 h-1.5 bg-slate-300 dark:bg-slate-600" />
              <div className="w-0.5 h-1 bg-slate-300 dark:bg-slate-600" />
            </div>
          </div>

          {/* Right button */}
          <button
            type="button"
            onClick={handleNextMonth}
            className={`w-8 h-8 sm:w-9 sm:h-9 ${btnRadius} bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-colors cursor-pointer shrink-0`}
            title="Bulan Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Control Tabs: Pengeluaran / Transfer / Pendapatan */}
        <div className={`grid grid-cols-3 p-1 ${innerCardRadius} bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 select-none`}>
          <button
            type="button"
            onClick={() => {
              if (selectedType === 'pengeluaran') return;
              setSelectedType('pengeluaran');
              setSelectedCategoryFilter(null);
              setShowAllMonthTx(false);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 ${btnRadius} font-bold text-xs border transition-colors duration-150 cursor-pointer ${
              selectedType === 'pengeluaran'
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 shadow-xs border-rose-200/80 dark:border-rose-900/50'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors shrink-0 ${
              selectedType === 'pengeluaran' 
                ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
              <ArrowUpCircle className="w-3 h-3" />
            </div>
            <span className="truncate">Pengeluaran</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (selectedType === 'transfer') return;
              setSelectedType('transfer');
              setSelectedCategoryFilter(null);
              setShowAllMonthTx(false);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 ${btnRadius} font-bold text-xs border transition-colors duration-150 cursor-pointer ${
              selectedType === 'transfer'
                ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 shadow-xs border-sky-200/80 dark:border-sky-900/50'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors shrink-0 ${
              selectedType === 'transfer' 
                ? 'bg-sky-100 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
              <ArrowRightLeft className="w-3 h-3" />
            </div>
            <span className="truncate">Transfer</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (selectedType === 'pemasukan') return;
              setSelectedType('pemasukan');
              setSelectedCategoryFilter(null);
              setShowAllMonthTx(false);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 ${btnRadius} font-bold text-xs border transition-colors duration-150 cursor-pointer ${
              selectedType === 'pemasukan'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shadow-xs border-emerald-200/80 dark:border-emerald-900/50'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors shrink-0 ${
              selectedType === 'pemasukan' 
                ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
              <ArrowDownCircle className="w-3 h-3" />
            </div>
            <span className="truncate">Pendapatan</span>
          </button>
        </div>

        {/* Summary Row */}
        <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 block">
              {selectedType === 'pengeluaran' ? 'Total Pengeluaran' : selectedType === 'pemasukan' ? 'Total Pendapatan' : 'Total Transfer'}
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500">
              {monthTransactions.length} transaksi {selectedType === 'transfer' ? (
                <span className="text-amber-500 dark:text-amber-400 font-bold ml-1">• Admin {formatIDR(totalMonthAdminFees || 0)}</span>
              ) : ` di ${currentMonthName} ${selectedYear}`}
            </span>
          </div>

          <div className="text-right">
            <span className={`font-mono font-black text-xl sm:text-2xl tracking-tight block ${
              selectedType === 'pengeluaran' 
                ? 'text-rose-600 dark:text-rose-400' 
                : selectedType === 'pemasukan' 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-sky-600 dark:text-sky-400'
            }`}>
              {formatIDR(totalAmount)}
            </span>
          </div>
        </div>

      </div>

      {/* 2. Card Simpel Total Saldo Akhir */}
      <div className={`${getCardClasses()} p-4 sm:p-5 flex items-center justify-between gap-4`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 sm:w-11 sm:h-11 ${btnRadius} flex items-center justify-center shrink-0 shadow-xs ${
            monthNetBalance > 0 
              ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400' 
              : monthNetBalance < 0 
              ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
          }`}>
            {monthNetBalance > 0 ? (
              <TrendingUp className="w-5 h-5" />
            ) : monthNetBalance < 0 ? (
              <TrendingDown className="w-5 h-5" />
            ) : (
              <WalletIcon className="w-5 h-5" />
            )}
          </div>

          <div className="min-w-0">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug truncate">
              Total Saldo Akhir
            </h4>
            <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium truncate">
              Periode {currentMonthName} {selectedYear}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className={`text-lg sm:text-2xl font-black font-mono tracking-tight block ${
            monthNetBalance > 0 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : monthNetBalance < 0 
              ? 'text-rose-600 dark:text-rose-400' 
              : 'text-slate-700 dark:text-slate-300'
          }`}>
            {monthNetBalance > 0 
              ? `+${formatIDR(monthNetBalance)}` 
              : monthNetBalance < 0 
              ? `-${formatIDR(Math.abs(monthNetBalance))}` 
              : formatIDR(0)}
          </span>
        </div>
      </div>

      {/* 3. Visualisasi Grafik Chart Bulanan (Sesuai Bulan & Tipe yang Dipilih) */}
      <div className={`${getCardClasses()} p-4 sm:p-6 space-y-4`}>
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 ${btnRadius} flex items-center justify-center ${
              selectedType === 'pengeluaran' 
                ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400' 
                : selectedType === 'pemasukan'
                ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400'
                : 'bg-sky-100 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400'
            }`}>
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight">
                {selectedType === 'pengeluaran' ? 'Grafik Alokasi Pengeluaran' : selectedType === 'pemasukan' ? 'Grafik Sumber Pendapatan' : 'Grafik Transfer & Biaya Admin'}
              </h4>
              <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium">
                Periode {currentMonthName} {selectedYear}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full pt-1">
          {monthTransactions.length === 0 ? (
            <div className={`p-8 text-center ${innerCardRadius} border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center gap-2`}>
              <PieChart className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                Belum ada transaksi {selectedType === 'pengeluaran' ? 'pengeluaran' : selectedType === 'pemasukan' ? 'pendapatan' : 'transfer'} di bulan {currentMonthName} {selectedYear}
              </p>
            </div>
          ) : (
            <div className="w-full">
              {selectedType === 'pengeluaran' ? (
                <CategoryBarChart 
                  transactions={transactions} 
                  categories={categories} 
                  month={selectedMonth} 
                  year={selectedYear} 
                />
              ) : selectedType === 'pemasukan' ? (
                <SourceBarChart 
                  transactions={transactions} 
                  sources={sources} 
                  month={selectedMonth} 
                  year={selectedYear} 
                />
              ) : (
                <TransferBarChart 
                  transactions={transactions} 
                  month={selectedMonth} 
                  year={selectedYear} 
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Top 3 Categories / Sources / Transfer Routes Section */}
      <div className="space-y-3 pt-6 sm:pt-8">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg tracking-tight">
            {selectedType === 'pengeluaran' ? 'Kategori Pengeluaran Tertinggi' : selectedType === 'pemasukan' ? 'Sumber Pendapatan Tertinggi' : 'Rute Transfer Antar Dompet'}
          </h3>
        </div>

        {/* Card Table of Top Categories/Sources/Transfers */}
        {rankedItems.length === 0 ? (
          <div key={`empty-${selectedType}`} className={`${getCardClasses()} p-8 text-center space-y-3`}>
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <PieChart className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
                Belum ada transaksi {selectedType === 'pengeluaran' ? 'pengeluaran' : selectedType === 'pemasukan' ? 'pendapatan' : 'transfer'} di bulan {currentMonthName} {selectedYear}
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                Transaksi yang Anda catat pada menu transaksi untuk bulan ini akan otomatis dianalisis dan diranking di sini.
              </p>
            </div>
            {selectedType !== 'transfer' && (
              <button
                type="button"
                onClick={() => onAddTransaction(selectedType)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm active:scale-95 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Catat {selectedType === 'pengeluaran' ? 'Pengeluaran' : 'Pendapatan'} Sekarang</span>
              </button>
            )}
          </div>
        ) : (
          <div key={`rankings-${selectedType}`} className={`${getCardClasses()} divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden`}>
            {displayedRankings.map((item, idx) => {
              const isSelected = selectedCategoryFilter === item.id;
              
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedCategoryFilter(prev => prev === item.id ? null : item.id);
                    setShowAllMonthTx(false);
                  }}
                  className={`p-4 sm:p-5 flex flex-col gap-2.5 transition-colors cursor-pointer group ${
                    isSelected 
                      ? 'bg-slate-50/90 dark:bg-slate-800/50' 
                      : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                  }`}
                  title="Klik untuk filter transaksi kategori ini di bawah"
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Left: Icon Badge & Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs relative"
                        style={{ backgroundColor: item.color }}
                      >
                        <IconRenderer name={item.icon} className="w-5 h-5 text-white" />
                        
                        {/* Rank Badge */}
                        <span className={`absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs ${
                          idx === 0 
                            ? 'bg-amber-400 text-amber-950' 
                            : idx === 1 
                            ? 'bg-slate-300 text-slate-800' 
                            : 'bg-amber-600 text-white'
                        }`}>
                          {idx + 1}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug truncate">
                          {item.name}
                        </h4>
                        <span className={`font-mono font-black text-sm sm:text-base block ${
                          selectedType === 'pengeluaran' 
                            ? 'text-rose-600 dark:text-rose-400' 
                            : selectedType === 'pemasukan' 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : 'text-sky-600 dark:text-sky-400'
                        }`}>
                          {formatIDR(item.amount)}
                        </span>
                      </div>
                    </div>

                    {/* Right: Percent & Arrow */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                        {item.percentage}% <span className="font-normal text-slate-400 text-[11px]">dari total</span>
                      </span>
                      
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                        isSelected 
                          ? 'bg-emerald-500 text-white rotate-90' 
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60'
                      }`}>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Progress Bar (Lightweight, snappy) */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-[width] duration-200 ease-out" 
                      style={{ 
                        width: `${Math.min(100, Math.max(item.percentage, 3))}%`,
                        backgroundColor: item.color 
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Detailed Transactions breakdown for the month */}
      {monthTransactions.length > 0 && (
        <div className="space-y-3 pt-6 sm:pt-8">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg tracking-tight">
              Rincian Transaksi {selectedType === 'pengeluaran' ? 'Pengeluaran' : selectedType === 'pemasukan' ? 'Pendapatan' : 'Transfer'}
            </h3>

            <div className="flex items-center gap-2">
              {selectedCategoryFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryFilter(null);
                    setShowAllMonthTx(false);
                  }}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer mr-1"
                >
                  Hapus Filter
                </button>
              )}

              {detailedTransactions.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAllMonthTx(prev => !prev)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer select-none"
                >
                  <span>{showAllMonthTx ? 'Ringkaskan' : 'Lihat Semua'}</span>
                  {showAllMonthTx ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          <div key={`tx-list-${selectedType}`} className={`${getCardClasses()} divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden`}>
            {displayedTransactions.map((tx) => {
              const cat = categories.find(c => c.id === tx.categoryId);
              const src = sources.find(s => s.id === tx.sourceId);
              const wallet = wallets.find(w => w.id === tx.walletId);
              const toWallet = wallets.find(w => w.id === tx.toWalletId);

              const itemColor = selectedType === 'pengeluaran' ? (cat?.color || '#ef4444') : selectedType === 'pemasukan' ? (src?.color || '#10b981') : '#0284c7';
              const itemIcon = selectedType === 'pengeluaran' ? (cat?.icon || 'Tag') : selectedType === 'pemasukan' ? (src?.icon || 'Briefcase') : 'ArrowRightLeft';
              const itemName = selectedType === 'pengeluaran' ? (cat?.name || 'Tanpa Kategori') : selectedType === 'pemasukan' ? (src?.name || 'Tanpa Sumber') : `${wallet?.name || 'Dompet'} → ${toWallet?.name || 'Dompet'}`;

              return (
                <div key={tx.id} className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-3xs"
                      style={{ backgroundColor: itemColor }}
                    >
                      <IconRenderer name={itemIcon} className="w-4 h-4 text-white" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                          {tx.description || (selectedType === 'transfer' ? itemName : (cat?.name || src?.name))}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {selectedType === 'transfer' ? 'Transfer' : itemName}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                        <span>{tx.date}</span>
                        {selectedType === 'transfer' ? (
                          <>
                            <span>•</span>
                            <span className="text-sky-600 dark:text-sky-400 font-semibold">{itemName}</span>
                            <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">(Admin {formatIDR(tx.adminFee || 0)})</span>
                          </>
                        ) : wallet && (
                          <>
                            <span>•</span>
                            <span>{wallet.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`font-mono font-bold text-xs sm:text-sm ${
                      selectedType === 'pengeluaran' ? 'text-rose-600 dark:text-rose-400' : selectedType === 'pemasukan' ? 'text-emerald-600 dark:text-emerald-400' : 'text-sky-600 dark:text-sky-400'
                    }`}>
                      {selectedType === 'pengeluaran' ? '-' : selectedType === 'pemasukan' ? '+' : ''} {formatIDR(tx.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
