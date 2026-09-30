/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, Filter, Trash2, Edit2, Eye, PlusCircle, X, Calendar, 
  Wallet as WalletIcon, Tag, RotateCcw, SlidersHorizontal, ChevronUp, 
  ChevronDown, ArrowRight, TrendingUp, TrendingDown, ArrowLeftRight,
  Clock, Hash, FileText, CheckCircle2, ChevronLeft, ChevronRight, CalendarDays
} from 'lucide-react';
import { Transaction, Wallet, Category, IncomeSource } from '../../types';
import { IconRenderer } from '../IconRenderer';
import { formatIDR } from '../../lib/formatters';

interface TransactionsViewProps {
  transactions: Transaction[];
  wallets: Wallet[];
  categories: Category[];
  sources: IncomeSource[];
  uiStyle?: string;
  txTypeFilter: 'semua' | 'pemasukan' | 'pengeluaran' | 'transfer';
  setTxTypeFilter: (val: 'semua' | 'pemasukan' | 'pengeluaran' | 'transfer') => void;
  txCategoryFilter: string;
  setTxCategoryFilter: (val: string) => void;
  txWalletFilter: string;
  setTxWalletFilter: (val: string) => void;
  txSearch: string;
  setTxSearch: (val: string) => void;
  txDateFilter: string;
  setTxDateFilter: (val: string) => void;
  txMonthFilter: string;
  setTxMonthFilter: (val: string) => void;
  txYearFilter: string;
  setTxYearFilter: (val: string) => void;
  showAllTransactions: boolean;
  setShowAllTransactions: (val: boolean) => void;
  filteredTransactions: Transaction[];
  getCardClasses: () => string;
  getAccentBg: () => string;
  getTableClasses: () => string;
  getTableRowPadding: () => string;
  getTableRowClasses: (index: number) => string;
  handleDeleteTransaction: (id: string) => void;
  onAdd?: (type?: any) => void;
  onEdit: (tx: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  wallets,
  categories,
  sources,
  uiStyle,
  txTypeFilter,
  setTxTypeFilter,
  txCategoryFilter,
  setTxCategoryFilter,
  txWalletFilter,
  setTxWalletFilter,
  txSearch,
  setTxSearch,
  txDateFilter,
  setTxDateFilter,
  txMonthFilter,
  setTxMonthFilter,
  txYearFilter,
  setTxYearFilter,
  showAllTransactions,
  setShowAllTransactions,
  filteredTransactions,
  getCardClasses,
  getAccentBg,
  getTableClasses,
  getTableRowPadding,
  getTableRowClasses,
  handleDeleteTransaction,
  onAdd,
  onEdit
}) => {
  const [selectedTxDetail, setSelectedTxDetail] = useState<Transaction | null>(null);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  const now = new Date();
  const currentRealYear = now.getFullYear();
  const currentRealMonth = String(now.getMonth() + 1).padStart(2, '0');
  const [pickerYear, setPickerYear] = useState<number>(() => {
    return txYearFilter ? parseInt(txYearFilter, 10) : currentRealYear;
  });

  const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const MONTH_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  const displayedTransactions = showAllTransactions 
    ? filteredTransactions 
    : filteredTransactions.slice(0, 5);

  const groupedByDate: Record<string, Transaction[]> = {};
  displayedTransactions.forEach((t) => {
    if (!groupedByDate[t.date]) {
      groupedByDate[t.date] = [];
    }
    groupedByDate[t.date].push(t);
  });

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  const activeFilterCount = [
    txSearch ? 1 : 0,
    txTypeFilter !== 'semua' ? 1 : 0,
    txWalletFilter !== 'semua' ? 1 : 0,
    txCategoryFilter !== 'semua' ? 1 : 0,
    txDateFilter ? 1 : 0,
    txMonthFilter ? 1 : 0,
    txYearFilter ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const handleResetAllFilters = () => {
    setTxSearch('');
    setTxTypeFilter('semua');
    setTxWalletFilter('semua');
    setTxCategoryFilter('semua');
    setTxDateFilter('');
    setTxMonthFilter('');
    setTxYearFilter('');
  };

  return (
    <div className="flex flex-col gap-5" id="view-transactions">
      {/* Filter Controls - No Outer Wrapper */}
      <div className="flex flex-col gap-2.5 sm:gap-3 w-full relative z-30">
        {/* 1. Topmost: Search bar + Dynamic Reset Filter Button */}
        <div className="flex items-center gap-2 sm:gap-2.5 w-full">
          <div className="relative flex-1 min-w-0 transition-all duration-200">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
            <input
              type="text"
              placeholder="Cari transaksi berdasarkan judul..."
              value={txSearch}
              onChange={(e) => setTxSearch(e.target.value)}
              className={`w-full pl-10 pr-9 py-2.5 text-xs font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs ${
                uiStyle === 'glass' 
                  ? 'glass-input text-slate-800 dark:text-slate-100' 
                  : 'border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100'
              }`}
            />
            {txSearch && (
              <button
                type="button"
                onClick={() => setTxSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition z-10 cursor-pointer"
                title="Hapus Pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetAllFilters}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/50 shadow-xs hover:scale-[1.02] active:scale-95 transition-all duration-200 shrink-0 cursor-pointer whitespace-nowrap animate-in fade-in zoom-in-95"
              title="Reset Semua Filter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset ({activeFilterCount})</span>
            </button>
          )}
        </div>

        {/* 2. Below Search: Type Filter Cards (Matching card styles) */}
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3 w-full">
          <button
            type="button"
            onClick={() => setTxTypeFilter('semua')}
            className={`py-2 px-1 sm:px-2 rounded-xl text-[11px] sm:text-xs transition-all duration-200 text-center truncate cursor-pointer shadow-xs ${
              txTypeFilter === 'semua'
                ? (uiStyle === 'glass' 
                    ? 'bg-white/85 dark:bg-white/20 text-slate-950 dark:text-white font-black shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white dark:border-white/30 backdrop-blur-md' 
                    : 'bg-slate-900 text-white dark:bg-indigo-600 font-bold border border-slate-900 dark:border-indigo-600')
                : (uiStyle === 'glass'
                    ? 'glass-input text-slate-700 dark:text-slate-300 font-semibold hover:bg-white/40 dark:hover:bg-white/10'
                    : 'border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/80')
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setTxTypeFilter('pemasukan')}
            className={`py-2 px-1 sm:px-2 rounded-xl text-[11px] sm:text-xs transition-all duration-200 text-center truncate cursor-pointer shadow-xs ${
              txTypeFilter === 'pemasukan'
                ? (uiStyle === 'glass' 
                    ? 'bg-emerald-500/90 text-white font-black shadow-[0_4px_12px_rgba(16,185,129,0.3)] border border-emerald-300/40 backdrop-blur-md'
                    : 'bg-emerald-500 text-white font-bold border border-emerald-500')
                : (uiStyle === 'glass'
                    ? 'glass-input text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-500/10'
                    : 'border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/40')
            }`}
          >
            Pemasukan
          </button>
          <button
            type="button"
            onClick={() => setTxTypeFilter('pengeluaran')}
            className={`py-2 px-1 sm:px-2 rounded-xl text-[11px] sm:text-xs transition-all duration-200 text-center truncate cursor-pointer shadow-xs ${
              txTypeFilter === 'pengeluaran'
                ? (uiStyle === 'glass'
                    ? 'bg-rose-500/90 text-white font-black shadow-[0_4px_12px_rgba(244,63,94,0.3)] border border-rose-300/40 backdrop-blur-md'
                    : 'bg-rose-500 text-white font-bold border border-rose-500')
                : (uiStyle === 'glass'
                    ? 'glass-input text-rose-700 dark:text-rose-300 font-semibold hover:bg-rose-500/10'
                    : 'border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40')
            }`}
          >
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => setTxTypeFilter('transfer')}
            className={`py-2 px-1 sm:px-2 rounded-xl text-[11px] sm:text-xs transition-all duration-200 text-center truncate cursor-pointer shadow-xs ${
              txTypeFilter === 'transfer'
                ? (uiStyle === 'glass'
                    ? 'bg-blue-500/90 text-white font-black shadow-[0_4px_12px_rgba(59,130,246,0.3)] border border-blue-300/40 backdrop-blur-md'
                    : 'bg-blue-500 text-white font-bold border border-blue-500')
                : (uiStyle === 'glass'
                    ? 'glass-input text-blue-700 dark:text-blue-300 font-semibold hover:bg-blue-500/10'
                    : 'border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/40')
            }`}
          >
            Transfer
          </button>
        </div>

        {/* 3. Remaining 4 Filters in 2x2 Grid (2 top, 2 bottom) */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full">
          {/* Top-Left: Dompet Dropdown Card */}
          <div className={`relative flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl transition-all min-w-0 overflow-hidden ${
            uiStyle === 'glass' 
              ? 'glass-input' 
              : 'border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs'
          }`}>
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <WalletIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0">Dompet:</span>
              <select
                value={txWalletFilter}
                onChange={(e) => setTxWalletFilter(e.target.value)}
                className="w-full text-xs font-bold bg-transparent border-none text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer truncate py-0 pl-0.5 pr-4 appearance-none"
              >
                <option value="semua">Semua</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none absolute right-2.5 shrink-0" />
          </div>

          {/* Top-Right: Kategori & Sumber Dropdown Card */}
          <div className={`relative flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl transition-all min-w-0 overflow-hidden ${
            uiStyle === 'glass' 
              ? 'glass-input' 
              : 'border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs'
          }`}>
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0">Kategori:</span>
              <select
                value={txCategoryFilter}
                onChange={(e) => setTxCategoryFilter(e.target.value)}
                className="w-full text-xs font-bold bg-transparent border-none text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer truncate py-0 pl-0.5 pr-4 appearance-none"
              >
                <option value="semua">Semua</option>
                <optgroup label="Pengeluaran">
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Pemasukan">
                  {sources.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none absolute right-2.5 shrink-0" />
          </div>

          {/* Bottom-Left: Tanggal Picker Card */}
          <div className={`relative flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl transition-all min-w-0 ${
            uiStyle === 'glass' 
              ? 'glass-input' 
              : 'border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs'
          }`}>
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0">Tanggal:</span>
              <input
                type="date"
                value={txDateFilter}
                onChange={(e) => {
                  setTxDateFilter(e.target.value);
                  if (e.target.value) {
                    setTxMonthFilter('');
                    setTxYearFilter('');
                  }
                }}
                className="w-full text-xs font-bold bg-transparent border-none text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer min-w-0 py-0"
              />
            </div>
            {txDateFilter && (
              <button 
                type="button" 
                onClick={() => setTxDateFilter('')} 
                className="text-slate-400 hover:text-rose-500 cursor-pointer ml-1 p-0.5"
                title="Hapus Filter Tanggal"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Bottom-Right: Calendar Month & Year Picker Card */}
          <div className="relative min-w-0">
            <div className={`flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl transition-all ${
              uiStyle === 'glass' 
                ? 'glass-input' 
                : 'border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs'
            } ${txDateFilter ? 'opacity-40 pointer-events-none' : ''}`}>
              <div 
                onClick={() => {
                  if (!txDateFilter) {
                    if (txYearFilter) setPickerYear(parseInt(txYearFilter, 10));
                    setIsMonthPickerOpen(prev => !prev);
                  }
                }}
                className="flex items-center gap-1.5 min-w-0 flex-1 cursor-pointer select-none"
                title="Pilih Kalender Bulan & Tahun"
              >
                <CalendarDays className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0">Bulan/Thn:</span>
                <span className={`text-xs font-bold truncate ${
                  (txMonthFilter || txYearFilter) ? 'text-slate-900 dark:text-white font-black' : 'text-slate-700 dark:text-slate-200'
                }`}>
                  {txMonthFilter && txYearFilter 
                    ? `${MONTH_SHORT[parseInt(txMonthFilter, 10) - 1]} ${txYearFilter}`
                    : txMonthFilter 
                      ? MONTH_NAMES[parseInt(txMonthFilter, 10) - 1]
                      : txYearFilter 
                        ? `Tahun ${txYearFilter}` 
                        : 'Semua'}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {(txMonthFilter || txYearFilter) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTxMonthFilter('');
                      setTxYearFilter('');
                    }}
                    className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Hapus Filter Bulan & Tahun"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (!txDateFilter) {
                      if (txYearFilter) setPickerYear(parseInt(txYearFilter, 10));
                      setIsMonthPickerOpen(prev => !prev);
                    }
                  }}
                  className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMonthPickerOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Calendar Popover */}
            {isMonthPickerOpen && (
              <>
                {/* Backdrop to close on outside click */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsMonthPickerOpen(false)}
                />

                <div className="absolute right-0 sm:right-0 top-full mt-2 z-50 w-72 xs:w-80 max-w-[calc(100vw-2.5rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3.5 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
                  {/* Calendar Year Header with Prev/Next Controls */}
                  <div className="flex items-center justify-between px-1">
                    <button
                      type="button"
                      onClick={() => setPickerYear(prev => prev - 1)}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
                      title="Tahun Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white">
                      <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <span>{pickerYear}</span>
                      {pickerYear === currentRealYear && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          Tahun Ini
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setPickerYear(prev => prev + 1)}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
                      title="Tahun Berikutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 12 Months Grid */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {MONTH_SHORT.map((monthName, idx) => {
                      const monthNum = String(idx + 1).padStart(2, '0');
                      const isSelected = txMonthFilter === monthNum && txYearFilter === pickerYear.toString();
                      const isCurrentMonth = pickerYear === currentRealYear && monthNum === currentRealMonth;

                      return (
                        <button
                          key={monthNum}
                          type="button"
                          onClick={() => {
                            setTxMonthFilter(monthNum);
                            setTxYearFilter(pickerYear.toString());
                            setTxDateFilter('');
                            setIsMonthPickerOpen(false);
                          }}
                          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center relative cursor-pointer active:scale-95 ${
                            isSelected
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm font-black'
                              : isCurrentMonth
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span>{monthName}</span>
                          {isCurrentMonth && !isSelected && (
                            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-slate-900 dark:bg-slate-100" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Action Footer Buttons */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setPickerYear(currentRealYear);
                        setTxMonthFilter(currentRealMonth);
                        setTxYearFilter(currentRealYear.toString());
                        setTxDateFilter('');
                        setIsMonthPickerOpen(false);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Bulan Ini
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setTxYearFilter(pickerYear.toString());
                          setTxMonthFilter('');
                          setTxDateFilter('');
                          setIsMonthPickerOpen(false);
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title={`Filter seluruh transaksi di tahun ${pickerYear}`}
                      >
                        Semua {pickerYear}
                      </button>

                      {(txMonthFilter || txYearFilter) && (
                        <button
                          type="button"
                          onClick={() => {
                            setTxMonthFilter('');
                            setTxYearFilter('');
                            setIsMonthPickerOpen(false);
                          }}
                          className="px-2 py-1.5 rounded-lg text-[11px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={`${getCardClasses()} overflow-hidden flex flex-col`}>
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-400 flex flex-col items-center justify-center gap-2">
            <Filter className="w-10 h-10 stroke-[1.2] opacity-50" />
            <p className="text-xs font-semibold">Tidak menemukan transaksi yang cocok.</p>
          </div>
        ) : (
          <>
            {/* Top Bar with Toggle */}
            {filteredTransactions.length > 5 && (
              <div className={`px-4 pt-3 pb-3.5 flex justify-end transition-all ${
                uiStyle === 'glass'
                  ? 'border-b border-white/20 dark:border-white/10 bg-transparent'
                  : 'bg-white dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800'
              }`}>
                <button
                  onClick={() => {
                    if (showAllTransactions) {
                      setShowAllTransactions(false);
                      document.getElementById('view-transactions')?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      setShowAllTransactions(true);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shrink-0 ${
                    uiStyle === 'glass'
                      ? 'glass-panel hover:scale-105 active:scale-95 text-slate-800 dark:text-slate-100 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {showAllTransactions ? (
                    <>
                      <span>Ringkaskan</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Lihat Semua</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="overflow-x-auto scrollbar-thin">
              <table className={`${getTableClasses()} table-fixed w-full min-w-[500px]`}>
                <colgroup>
                  <col className="w-auto" />
                  <col className="w-[100px] sm:w-[110px]" />
                  <col className="w-[130px] sm:w-[150px]" />
                  <col className="w-[105px] sm:w-[115px]" />
                </colgroup>
                <thead className={`border-b text-[10px] font-bold uppercase tracking-wider transition-all ${
                  uiStyle === 'glass'
                    ? 'bg-white/40 dark:bg-slate-900/50 backdrop-blur-md border-white/30 dark:border-white/10 text-slate-700 dark:text-slate-300'
                    : 'bg-white dark:bg-slate-900/90 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  <tr>
                    <th className={getTableRowPadding()}>Deskripsi</th>
                    <th className={`${getTableRowPadding()} text-center`}>Tipe</th>
                    <th className={`${getTableRowPadding()} text-right`}>Jumlah</th>
                    <th className={`${getTableRowPadding()} text-center`}>Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sortedDates.map((dateStr) => {
                    const dateTxs = groupedByDate[dateStr];
                    const totalDateTxsCount = filteredTransactions.filter(t => t.date === dateStr).length;
                    const formattedDate = new Date(dateStr).toLocaleDateString('id-ID', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                    });
                    return (
                      <React.Fragment key={dateStr}>
                        <tr className={`select-none border-y transition-all ${
                          uiStyle === 'glass'
                            ? 'bg-white/30 dark:bg-slate-900/40 backdrop-blur-sm border-white/20 dark:border-white/10'
                            : 'bg-slate-50/40 dark:bg-slate-900/60 border-slate-100/80 dark:border-slate-800/80'
                        }`}>
                          <td colSpan={4} className="px-4 py-2 text-xs font-bold text-indigo-600 dark:text-cyan-400 font-mono tracking-tight whitespace-nowrap">
                            {formattedDate} ({totalDateTxsCount} Transaksi)
                          </td>
                        </tr>
                        {dateTxs.map((t, idx) => {
                          const isIncome = t.type === 'pemasukan';
                          const isTransfer = t.type === 'transfer';
                          return (
                            <tr 
                              key={t.id} 
                              className={`${getTableRowClasses(idx)} transition-colors cursor-pointer group`}
                              onClick={() => setSelectedTxDetail(t)}
                            >
                              <td className={getTableRowPadding() + " font-semibold text-slate-800 dark:text-slate-200 truncate"} title={t.description}>
                                <div className="flex items-center gap-2 truncate">
                                  <span className="truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {t.description}
                                  </span>
                                </div>
                              </td>
                              <td className={getTableRowPadding() + " whitespace-nowrap text-center"}>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  isIncome 
                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' 
                                    : isTransfer 
                                      ? 'bg-blue-50 text-blue-500 dark:bg-blue-950/20 dark:text-blue-400' 
                                      : 'bg-rose-50 text-rose-500 dark:bg-rose-950/20 dark:text-rose-400'
                                }`}>
                                  {t.type}
                                </span>
                              </td>
                              <td className={getTableRowPadding() + ` font-mono font-bold whitespace-nowrap text-right ${isIncome ? 'text-emerald-500' : (isTransfer ? 'text-blue-500' : 'text-rose-500')}`}>
                                <div className="flex flex-col items-end">
                                  <span>{isIncome ? '+' : (isTransfer ? '⇄ ' : '-')}{formatIDR(t.amount)}</span>
                                  {isTransfer && t.adminFee && t.adminFee > 0 ? (
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                                      +Admin {formatIDR(t.adminFee)}
                                    </span>
                                  ) : null}
                                </div>
                              </td>
                              <td 
                                className={getTableRowPadding() + " text-center whitespace-nowrap"}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center justify-center gap-1">
                                  <button 
                                    onClick={() => setSelectedTxDetail(t)} 
                                    title="Lihat Detail Transaksi (Tiket)"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 transition inline-flex items-center"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => onEdit(t)} 
                                    title="Edit Transaksi"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition inline-flex items-center"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteTransaction(t.id)} 
                                    title="Hapus Transaksi"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition inline-flex items-center"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Transaction Detail Pop-up Modal - Bento Grid Layout */}
      {selectedTxDetail && typeof document !== 'undefined' && createPortal(
        (() => {
          const wallet = wallets.find((w) => w.id === selectedTxDetail.walletId);
          const toWallet = selectedTxDetail.toWalletId ? wallets.find((w) => w.id === selectedTxDetail.toWalletId) : null;
          const isIncome = selectedTxDetail.type === 'pemasukan';
          const isTransfer = selectedTxDetail.type === 'transfer';
          
          const catOrSource = isIncome 
            ? sources.find(s => s.id === selectedTxDetail.sourceId)
            : (isTransfer ? null : categories.find(c => c.id === selectedTxDetail.categoryId));

          const formattedFullDate = new Date(selectedTxDetail.date).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });

          return (
            <div 
              className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden no-print"
              onClick={() => setSelectedTxDetail(null)}
            >
              {/* Sheet Card Container */}
              <div 
                className="relative w-full max-w-lg mx-auto rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[78vh] sm:h-[580px] max-h-[85vh] sm:max-h-[80vh] border-t sm:border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 animate-in slide-in-from-bottom duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Mobile Sheet Drag Handle */}
                <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

                {/* Header - Title & Badge ONLY (No paragraph, No X button) */}
                <div className="px-4 sm:px-5 pt-3.5 sm:pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-snug">
                      Rincian Detail Transaksi
                    </h3>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      isIncome 
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' 
                        : isTransfer 
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400' 
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                    }`}>
                      {selectedTxDetail.type}
                    </span>
                  </div>
                </div>

                {/* Body - Bento Grid Layout without icons and without Tipe (already on header badge) */}
                <div className="p-4 sm:p-5 flex flex-col gap-3 overflow-y-auto min-h-0 flex-1">
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Bento 1: Hero Amount Banner (Col span 2) */}
                    <div className={`col-span-2 p-4 rounded-2xl flex flex-col items-center justify-center text-center border ${
                      isIncome 
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400' 
                        : isTransfer 
                          ? 'bg-blue-50/80 dark:bg-blue-950/25 border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400' 
                          : 'bg-rose-50/80 dark:bg-rose-950/25 border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400'
                    }`}>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-80 block">
                        Jumlah Nominal
                      </span>
                      <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight my-1">
                        {isIncome ? '+' : (isTransfer ? '⇄ ' : '-')}{formatIDR(selectedTxDetail.amount)}
                      </div>
                      {isTransfer && selectedTxDetail.adminFee && selectedTxDetail.adminFee > 0 ? (
                        <div className="text-xs font-semibold opacity-85 mt-0.5">
                          +Biaya Admin {formatIDR(selectedTxDetail.adminFee)} (Total: {formatIDR(selectedTxDetail.amount + selectedTxDetail.adminFee)})
                        </div>
                      ) : null}
                    </div>

                    {/* Bento 2: Deskripsi (Col span 2) */}
                    <div className="col-span-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                        Deskripsi Transaksi
                      </span>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-normal break-words">
                        {selectedTxDetail.description || 'Tidak ada deskripsi'}
                      </div>
                    </div>

                    {/* Bento 3: Tanggal Transaksi (Col span 1) */}
                    <div className="col-span-1 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                        Tanggal
                      </span>
                      <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">
                        {formattedFullDate}
                      </div>
                    </div>

                    {/* Bento 4: Dompet (Col span 1) */}
                    <div className="col-span-1 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                        {isTransfer ? 'Dompet Asal' : 'Dompet'}
                      </span>
                      <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                        {wallet?.name || 'Dompet Terhapus'}
                      </div>
                    </div>

                    {/* Bento 5: Kategori / Sumber / Dompet Tujuan (Col span 2) */}
                    <div className="col-span-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                        {isTransfer ? 'Dompet Tujuan' : (isIncome ? 'Sumber Pendapatan' : 'Kategori')}
                      </span>
                      <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                        {isTransfer 
                          ? (toWallet?.name || 'Dompet Terhapus') 
                          : (catOrSource?.name || 'Kustom')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer - ONLY TUTUP BUTTON ON BOTTOM RIGHT */}
                <div className="px-4 sm:px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom,24px))] sm:pb-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end text-xs shrink-0 bg-slate-50/90 dark:bg-slate-900/90 sticky bottom-0 z-10">
                  <button
                    type="button"
                    onClick={() => setSelectedTxDetail(null)}
                    className="px-7 py-2.5 text-xs font-bold rounded-xl bg-slate-200/90 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition shadow-xs cursor-pointer active:scale-95"
                  >
                    Tutup
                  </button>
                </div>

              </div>
            </div>
          );
        })(),
        document.body
      )}
    </div>
  );
};
