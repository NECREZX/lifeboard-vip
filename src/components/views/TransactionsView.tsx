/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, Filter, Trash2, X, Calendar, 
  Wallet as WalletIcon, Tag, RotateCcw, ChevronUp, 
  ChevronDown, ArrowUpRight, ArrowDownLeft, ArrowLeftRight,
  ChevronLeft, ChevronRight, MoreVertical, Pencil,
  ArrowRight
} from 'lucide-react';
import { Transaction, Wallet, Category, IncomeSource } from '../../types';
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
  settings?: any;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

const DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function formatCardDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const dateObj = new Date(y, m, d);
      const dayName = DAYS_SHORT[dateObj.getDay()] || '';
      const monthName = MONTH_SHORT[m] || '';
      return `${dayName}, ${d} ${monthName} ${y}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export const TransactionsView: React.FC<TransactionsViewProps> = React.memo(({
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
  onEdit,
  settings
}) => {
  const [selectedTxDetail, setSelectedTxDetail] = useState<Transaction | null>(null);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [activeMenuTxId, setActiveMenuTxId] = useState<string | null>(null);

  const now = useMemo(() => new Date(), []);
  const currentRealYear = now.getFullYear();
  const currentRealMonth = String(now.getMonth() + 1).padStart(2, '0');

  // Default periode ke bulan & tahun sekarang jika kosong
  useEffect(() => {
    if (!txMonthFilter && !txYearFilter) {
      setTxMonthFilter(currentRealMonth);
      setTxYearFilter(String(currentRealYear));
    }
  }, [txMonthFilter, txYearFilter, currentRealMonth, currentRealYear, setTxMonthFilter, setTxYearFilter]);

  const activeSelectedMonthNum = txMonthFilter || currentRealMonth;
  const activeSelectedYearNum = txYearFilter || String(currentRealYear);

  const [pickerYear, setPickerYear] = useState<number>(() => {
    return parseInt(activeSelectedYearNum, 10);
  });

  const dateInputRef = useRef<HTMLInputElement>(null);

  // Navigasi bulan sebelumnya dan berikutnya
  const handlePrevMonth = () => {
    const currentM = parseInt(activeSelectedMonthNum, 10);
    const currentY = parseInt(activeSelectedYearNum, 10);
    if (currentM === 1) {
      setTxMonthFilter('12');
      setTxYearFilter(String(currentY - 1));
      setPickerYear(currentY - 1);
    } else {
      setTxMonthFilter(String(currentM - 1).padStart(2, '0'));
      setTxYearFilter(String(currentY));
    }
    setTxDateFilter('');
  };

  const handleNextMonth = () => {
    const currentM = parseInt(activeSelectedMonthNum, 10);
    const currentY = parseInt(activeSelectedYearNum, 10);
    if (currentM === 12) {
      setTxMonthFilter('01');
      setTxYearFilter(String(currentY + 1));
      setPickerYear(currentY + 1);
    } else {
      setTxMonthFilter(String(currentM + 1).padStart(2, '0'));
      setTxYearFilter(String(currentY));
    }
    setTxDateFilter('');
  };

  // Format tanggal tanggal yang dipilih
  const formattedSelectedDate = useMemo(() => {
    if (!txDateFilter) return '';
    try {
      const parts = txDateFilter.split('-');
      if (parts.length === 3) {
        const d = parseInt(parts[2], 10);
        const m = MONTH_SHORT[parseInt(parts[1], 10) - 1];
        return `${d} ${m}`;
      }
      return txDateFilter;
    } catch {
      return txDateFilter;
    }
  }, [txDateFilter]);

  // Transaksi yang ditampilkan: ringkaskan 5 saja atau lihat semua
  const displayedTransactions = useMemo(() => {
    return showAllTransactions 
      ? filteredTransactions 
      : filteredTransactions.slice(0, 5);
  }, [showAllTransactions, filteredTransactions]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (txSearch) count++;
    if (txTypeFilter !== 'semua') count++;
    if (txWalletFilter !== 'semua') count++;
    if (txCategoryFilter !== 'semua') count++;
    if (txDateFilter) count++;
    return count;
  }, [txSearch, txTypeFilter, txWalletFilter, txCategoryFilter, txDateFilter]);

  const handleResetAllFilters = useCallback(() => {
    setTxSearch('');
    setTxTypeFilter('semua');
    setTxWalletFilter('semua');
    setTxCategoryFilter('semua');
    setTxDateFilter('');
    setTxMonthFilter(currentRealMonth);
    setTxYearFilter(String(currentRealYear));
  }, [setTxSearch, setTxTypeFilter, setTxWalletFilter, setTxCategoryFilter, setTxDateFilter, setTxMonthFilter, setTxYearFilter, currentRealMonth, currentRealYear]);

  // Nama dompet terpilih
  const selectedWalletName = useMemo(() => {
    if (txWalletFilter === 'semua') return 'Semua';
    const found = wallets.find(w => w.id === txWalletFilter);
    return found ? found.name : 'Semua';
  }, [txWalletFilter, wallets]);

  // Nama kategori terpilih
  const selectedCategoryName = useMemo(() => {
    if (txCategoryFilter === 'semua') return 'Semua';
    const cat = categories.find(c => c.id === txCategoryFilter);
    if (cat) return cat.name;
    const src = sources.find(s => s.id === txCategoryFilter);
    if (src) return src.name;
    return 'Semua';
  }, [txCategoryFilter, categories, sources]);

  // Dynamic Theme Styling
  const cardRadiusClass = settings?.cardRadius === 'sharp' ? 'rounded-none' : settings?.cardRadius === 'extra' ? 'rounded-3xl' : 'rounded-2xl';
  const smallRadiusClass = settings?.cardRadius === 'sharp' ? 'rounded-none' : settings?.cardRadius === 'extra' ? 'rounded-2xl' : 'rounded-xl';

  const filterCardClass = useMemo(() => {
    let cls = `bg-white dark:bg-slate-900 ${cardRadiusClass} `;
    if (settings?.cardStyle === 'bordered') {
      cls += 'border-2 border-slate-300 dark:border-slate-700 shadow-none ';
    } else if (settings?.cardStyle === 'shadowed') {
      cls += 'border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)] ';
    } else {
      cls += 'border border-slate-200/90 dark:border-slate-800 shadow-none ';
    }
    return cls;
  }, [settings?.cardStyle, cardRadiusClass]);

  const buttonStyleClass = useMemo(() => {
    let cls = `${smallRadiusClass} `;
    if (settings?.cardStyle === 'bordered') {
      cls += 'border-2 border-slate-300 dark:border-slate-700 shadow-none ';
    } else if (settings?.cardStyle === 'shadowed') {
      cls += 'border border-slate-200/80 dark:border-slate-800 shadow-xs ';
    } else {
      cls += 'border border-slate-200/90 dark:border-slate-800 shadow-none ';
    }
    return cls;
  }, [settings?.cardStyle, smallRadiusClass]);

  return (
    <div className="flex flex-col gap-4 sm:gap-5 pb-32 sm:pb-36" id="view-transactions">
      {/* ========================================================
          1. SEARCH BAR DENGAN RESET FILTER BUTTON (GLOBAL SEARCH)
          ======================================================== */}
      <div className="flex items-center gap-2 sm:gap-2.5 w-full">
        <div className="relative flex-1 min-w-0 transition-all duration-200">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
          <input
            type="text"
            placeholder="Cari transaksi berdasarkan judul..."
            value={txSearch}
            onChange={(e) => setTxSearch(e.target.value)}
            className={`w-full pl-10 pr-9 py-2.5 text-xs font-medium ${cardRadiusClass} transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 ${
              uiStyle === 'glass' 
                ? 'glass-input text-slate-800 dark:text-slate-100' 
                : `${filterCardClass} text-slate-800 dark:text-slate-100`
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
            className={`flex items-center gap-1.5 px-3 py-2.5 ${cardRadiusClass} text-xs font-bold text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/50 hover:scale-[1.02] active:scale-95 transition-all duration-200 shrink-0 cursor-pointer whitespace-nowrap animate-in fade-in zoom-in-95`}
            title="Reset Filter Aktif"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ({activeFilterCount})</span>
          </button>
        )}
      </div>

      {/* ========================================================
          2. TYPE FILTER TABS (Semua, Pendapatan, Pengeluaran, Transfer)
          Latar Belakang Putih Sesuai Permintaan
          ======================================================== */}
      <div className={`${filterCardClass} p-1.5 flex items-center justify-between gap-1 w-full`}>
        <button
          type="button"
          onClick={() => setTxTypeFilter('semua')}
          className={`flex-1 py-2 px-1 text-xs text-center ${smallRadiusClass} transition-all duration-200 cursor-pointer ${
            txTypeFilter === 'semua'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 font-semibold hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          Semua
        </button>
        <button
          type="button"
          onClick={() => setTxTypeFilter('pemasukan')}
          className={`flex-1 py-2 px-1 text-xs text-center ${smallRadiusClass} transition-all duration-200 cursor-pointer ${
            txTypeFilter === 'pemasukan'
              ? 'bg-emerald-600 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 font-semibold hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          Pendapatan
        </button>
        <button
          type="button"
          onClick={() => setTxTypeFilter('pengeluaran')}
          className={`flex-1 py-2 px-1 text-xs text-center ${smallRadiusClass} transition-all duration-200 cursor-pointer ${
            txTypeFilter === 'pengeluaran'
              ? 'bg-rose-500 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 font-semibold hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          Pengeluaran
        </button>
        <button
          type="button"
          onClick={() => setTxTypeFilter('transfer')}
          className={`flex-1 py-2 px-1 text-xs text-center ${smallRadiusClass} transition-all duration-200 cursor-pointer ${
            txTypeFilter === 'transfer'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 font-semibold hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          Transfer
        </button>
      </div>

      {/* ========================================================
          3. TIGA FILTER DATA: DOMPET, TANGGAL, KATEGORI
          ======================================================== */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full">
        {/* Card 1: DOMPET */}
        <div className={`relative ${filterCardClass} p-3 transition-all flex flex-col justify-between`}>
          <div className="flex items-center justify-between">
            <div className={`w-6 h-6 ${smallRadiusClass} bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center`}>
              <WalletIcon className="w-3.5 h-3.5" />
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2.5">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">DOMPET</span>
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate block mt-0.5">
              {selectedWalletName}
            </span>
          </div>
          <select
            value={txWalletFilter}
            onChange={(e) => setTxWalletFilter(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          >
            <option value="semua">Semua</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        {/* Card 2: TANGGAL */}
        <div className={`relative ${filterCardClass} p-3 transition-all flex flex-col justify-between`}>
          <div className="flex items-center justify-between">
            <div className={`w-6 h-6 ${smallRadiusClass} bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center`}>
              <Calendar className="w-3.5 h-3.5" />
            </div>
            {txDateFilter ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTxDateFilter('');
                }}
                className="text-slate-400 hover:text-rose-500 z-20 cursor-pointer"
                title="Hapus Tanggal"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>
          <div className="mt-2.5">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">TANGGAL</span>
            <span className={`text-xs sm:text-sm font-extrabold truncate block mt-0.5 ${txDateFilter ? 'text-slate-900 dark:text-white font-black' : 'text-slate-900 dark:text-slate-100'}`}>
              {formattedSelectedDate || 'Pilih'}
            </span>
          </div>
          <input
            ref={dateInputRef}
            type="date"
            value={txDateFilter}
            onChange={(e) => {
              setTxDateFilter(e.target.value);
              if (e.target.value) {
                const parts = e.target.value.split('-');
                if (parts.length === 3) {
                  setTxMonthFilter(parts[1]);
                  setTxYearFilter(parts[0]);
                  setPickerYear(parseInt(parts[0], 10));
                }
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        </div>

        {/* Card 3: KATEGORI */}
        <div className={`relative ${filterCardClass} p-3 transition-all flex flex-col justify-between`}>
          <div className="flex items-center justify-between">
            <div className={`w-6 h-6 ${smallRadiusClass} bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center`}>
              <Tag className="w-3.5 h-3.5" />
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2.5">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">KATEGORI</span>
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate block mt-0.5">
              {selectedCategoryName}
            </span>
          </div>
          <select
            value={txCategoryFilter}
            onChange={(e) => setTxCategoryFilter(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          >
            <option value="semua">Semua</option>
            <optgroup label="Pengeluaran">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </optgroup>
            <optgroup label="Pendapatan">
              {sources.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* ========================================================
          4. PERIODE (BULAN & TAHUN) KAPSUL
          ======================================================== */}
      <div className="w-full relative">
        <div className={`${filterCardClass} p-2 sm:p-2.5 flex items-center justify-between`}>
          {/* Tombol Bulan Sebelumnya */}
          <button
            type="button"
            onClick={handlePrevMonth}
            className={`w-9 h-9 ${smallRadiusClass} flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer shrink-0`}
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Tengah: Ikon Kalender & Label Periode */}
          <div 
            onClick={() => {
              setPickerYear(parseInt(activeSelectedYearNum, 10));
              setIsMonthPickerOpen(true);
            }}
            className="flex items-center gap-2.5 cursor-pointer px-3 py-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition select-none"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                PERIODE
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">
                  {MONTH_NAMES[parseInt(activeSelectedMonthNum, 10) - 1]} {activeSelectedYearNum}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Tombol Bulan Berikutnya */}
          <button
            type="button"
            onClick={handleNextMonth}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer shrink-0"
            title="Bulan Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================
          5. MODAL DIALOG PEMILIH BULAN & TAHUN (CENTERED DIALOG AGAR TIDAK KEPOTONG)
          ======================================================== */}
      {isMonthPickerOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsMonthPickerOpen(false)}
        >
          <div 
            className="w-full max-w-xs bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl p-4.5 space-y-3.5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal Tahun */}
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={() => setPickerYear(prev => prev - 1)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Tahun Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1.5 font-black text-base text-slate-900 dark:text-white">
                <Calendar className="w-4 h-4 text-rose-500" />
                <span>{pickerYear}</span>
              </div>
              <button
                type="button"
                onClick={() => setPickerYear(prev => prev + 1)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Tahun Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Grid 12 Bulan */}
            <div className="grid grid-cols-3 gap-2">
              {MONTH_SHORT.map((monthName, idx) => {
                const monthNum = String(idx + 1).padStart(2, '0');
                const isSelected = activeSelectedMonthNum === monthNum && activeSelectedYearNum === pickerYear.toString();
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
                    className={`py-2.5 px-1 rounded-xl text-xs font-bold transition-all text-center cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {monthName}
                  </button>
                );
              })}
            </div>

            {/* Tombol Tutup */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsMonthPickerOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================
          6. BARIS KETERANGAN JUMLAH TRANSAKSI & BUTTON LIHAT SEMUA / RINGKAS (5 DATA)
          Tinggi baris dibuat konsisten (min-h-[36px]) agar tidak terjadi pergeseran layout
          ======================================================== */}
      <div className="flex items-center justify-between min-h-[36px] px-1">
        <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
          {filteredTransactions.length} transaksi {txSearch ? 'ditemukan' : ''}
        </span>

        {filteredTransactions.length > 5 ? (
          <button
            type="button"
            onClick={() => {
              if (showAllTransactions) {
                setShowAllTransactions(false);
                document.getElementById('view-transactions')?.scrollIntoView({ behavior: 'smooth' });
              } else {
                setShowAllTransactions(true);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 ${smallRadiusClass} bg-white dark:bg-slate-900 ${
              settings?.cardStyle === 'bordered'
                ? 'border-2 border-slate-300 dark:border-slate-700 shadow-none'
                : settings?.cardStyle === 'shadowed'
                ? 'border border-slate-200/80 dark:border-slate-800 shadow-xs'
                : 'border border-slate-200/90 dark:border-slate-800 shadow-none'
            } text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition active:scale-95 cursor-pointer`}
          >
            <span>{showAllTransactions ? 'Ringkaskan' : 'Lihat Semua'}</span>
            {showAllTransactions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <div className="h-[31px] invisible pointer-events-none select-none" aria-hidden="true" />
        )}
      </div>

      {/* ========================================================
          7. CARD TRANSAKSI (CARD SATU-SATU DENGAN TITIK 3 EDIT & HAPUS)
          ======================================================== */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-2">
          <Filter className="w-9 h-9 stroke-[1.2] opacity-40" />
          <p className="text-xs font-bold">
            {txSearch ? 'Tidak menemukan transaksi yang cocok dengan pencarian.' : 'Tidak menemukan transaksi pada periode ini.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 relative">
          {/* Backdrop untuk menutup menu titik 3 saat klik di luar */}
          {activeMenuTxId && (
            <div 
              className="fixed inset-0 z-20 cursor-default" 
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenuTxId(null);
              }} 
            />
          )}

          {displayedTransactions.map((t) => {
            const isIncome = t.type === 'pemasukan';
            const isTransfer = t.type === 'transfer';
            const isMenuOpen = activeMenuTxId === t.id;

            return (
              <div
                key={t.id}
                onClick={() => setSelectedTxDetail(t)}
                className={`${getCardClasses()} p-3.5 sm:p-4 transition-all flex items-center justify-between gap-3 cursor-pointer group relative`}
              >
                {/* Sisi Kiri: Ikon Tipe & Info Transaksi */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Ikon Tipe Transaksi */}
                  <div className={`w-11 h-11 ${smallRadiusClass} flex items-center justify-center shrink-0 ${
                    isIncome 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                      : isTransfer 
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400' 
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400'
                  }`}>
                    {isIncome ? (
                      <ArrowDownLeft className="w-5 h-5 stroke-[2.4]" />
                    ) : isTransfer ? (
                      <ArrowLeftRight className="w-5 h-5 stroke-[2.4]" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 stroke-[2.4]" />
                    )}
                  </div>

                  {/* Info Judul & Tanggal */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-snug truncate group-hover:text-rose-500 transition-colors">
                      {t.description || 'Tanpa Judul'}
                    </h4>
                    <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5 truncate">
                      {formatCardDate(t.date)}
                    </span>
                  </div>
                </div>

                {/* Sisi Kanan: Nominal & Tombol Titik 3 */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div className="flex flex-col items-end">
                    <span className={`text-sm sm:text-base font-black font-mono tracking-tight ${
                      isIncome 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : isTransfer 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {isIncome ? '+' : (isTransfer ? '' : '-')}{formatIDR(t.amount)}
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-wider block mt-0.5 ${
                      isIncome 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : isTransfer 
                          ? 'text-blue-500 dark:text-blue-400' 
                          : 'text-rose-500 dark:text-rose-400'
                    }`}>
                      {isIncome ? 'PENDAPATAN' : t.type}
                    </span>
                  </div>

                  {/* Tombol Titik 3 */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuTxId(isMenuOpen ? null : t.id);
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Menu Aksi"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Popover Menu: Edit & Hapus (Konsisten terbuka ke bawah untuk semua card) */}
                    {isMenuOpen && (
                      <div 
                        className="absolute right-0 top-full mt-1.5 z-30 w-36 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Tombol Edit */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuTxId(null);
                            onEdit(t);
                          }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-xl transition cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5 text-slate-500" />
                          <span>Edit</span>
                        </button>

                        {/* Tombol Hapus */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuTxId(null);
                            handleDeleteTransaction(t.id);
                          }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          8. FORM RINCIAN DETAIL TRANSAKSI (KONSEP E-RECEIPT / STRUK DIGITAL FINTECH)
          ======================================================== */}
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
              className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden no-print"
              onClick={() => setSelectedTxDetail(null)}
            >
              {/* Sheet Card Container */}
              <div 
                className="relative w-full max-w-md mx-auto rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[78vh] sm:h-[580px] max-h-[88vh] sm:max-h-[82vh] border-t sm:border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 animate-in slide-in-from-bottom duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Mobile Sheet Drag Handle */}
                <div className="w-12 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

                {/* Top Bar Header */}
                <div className="px-5 pt-3.5 sm:pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-snug">
                      Rincian Detail Transaksi
                    </h3>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      isIncome 
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40' 
                        : isTransfer 
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40' 
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40'
                    }`}>
                      {isIncome ? 'Pendapatan' : isTransfer ? 'Transfer' : 'Pengeluaran'}
                    </span>
                  </div>
                </div>

                {/* Scrollable Receipt Body */}
                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
                  {/* HERO NOMINAL CARD (DENGAN RUANG LEGA & DESKRIPSI DI BAWAH NOMINAL) */}
                  <div className={`rounded-3xl p-5 sm:p-6 flex flex-col items-center justify-center text-center border ${
                    isIncome 
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-200/80 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300' 
                      : isTransfer 
                        ? 'bg-blue-50/70 dark:bg-blue-950/25 border-blue-200/80 dark:border-blue-900/40 text-blue-700 dark:text-blue-300' 
                        : 'bg-rose-50/70 dark:bg-rose-950/25 border-rose-200/80 dark:border-rose-900/40 text-rose-700 dark:text-rose-300'
                  }`}>
                    {/* Big Nominal (Pendapatan: Hijau, Transfer: Biru, Pengeluaran: Merah) */}
                    <div className={`text-3xl sm:text-4xl font-black font-mono tracking-tight my-1 leading-normal ${
                      isIncome 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : isTransfer 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {isIncome ? '+' : (isTransfer ? '' : '-')}{formatIDR(selectedTxDetail.amount)}
                    </div>

                    {/* Keterangan Biaya Admin Khusus Transfer (Warna Biru) */}
                    {isTransfer && selectedTxDetail.adminFee && selectedTxDetail.adminFee > 0 ? (
                      <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">
                        +Biaya Admin {formatIDR(selectedTxDetail.adminFee)} (Total: {formatIDR(selectedTxDetail.amount + selectedTxDetail.adminFee)})
                      </div>
                    ) : null}

                    {/* Deskripsi Transaksi di bawah Nominal (Warna Hitam / Slate-900) */}
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 mt-2 max-w-[90%] break-words">
                      "{selectedTxDetail.description || 'Tidak ada deskripsi'}"
                    </p>
                  </div>

                  {/* GARIS PUTUS-PUTUS PEMISAH BERSIH (TANPA SETENGAH LINGKARAN) */}
                  <div className="border-b border-dashed border-slate-200 dark:border-slate-800 my-0.5" />

                  {/* KETERANGAN TANPA BUNGKUS CARD - LANGSUNG TEKS BERGARIS PEMISAH */}
                  <div className="flex flex-col gap-1 pt-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                      Keterangan
                    </span>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {/* Baris Tanggal & Waktu */}
                      <div className="flex items-center justify-between gap-3 py-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shrink-0 text-slate-500 dark:text-slate-400">
                            <Calendar className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">Waktu & Tanggal</span>
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 text-right truncate">
                          {formattedFullDate}
                        </span>
                      </div>

                      {/* Baris Jenis / Kategori */}
                      <div className="flex items-center justify-between gap-3 py-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shrink-0 text-slate-500 dark:text-slate-400">
                            <Tag className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {isIncome ? 'Sumber Pendapatan' : isTransfer ? 'Jenis Transaksi' : 'Kategori Pengeluaran'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 text-right truncate">
                          {isTransfer ? 'Transfer Antar Dompet' : (catOrSource?.name || 'Kustom')}
                        </span>
                      </div>

                      {/* Baris Dompet Sumber */}
                      <div className="flex items-center justify-between gap-3 py-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shrink-0 text-slate-500 dark:text-slate-400">
                            <WalletIcon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {isTransfer ? 'Dompet Asal' : 'Dompet / Rekening'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 text-right truncate">
                          {wallet?.name || 'Dompet Terhapus'}
                        </span>
                      </div>

                      {/* Baris Khusus Transfer: Dompet Tujuan & Admin Fee */}
                      {isTransfer && (
                        <>
                          <div className="flex items-center justify-between gap-3 py-2.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shrink-0 text-blue-500">
                                <ArrowRight className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs text-slate-500 dark:text-slate-400">Dompet Tujuan</span>
                            </div>
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 text-right truncate">
                              {toWallet?.name || 'Dompet Terhapus'}
                            </span>
                          </div>

                          {selectedTxDetail.adminFee && selectedTxDetail.adminFee > 0 ? (
                            <div className="flex items-center justify-between gap-3 py-2.5">
                              <span className="text-xs text-slate-500 dark:text-slate-400 pl-1">Biaya Layanan/Admin</span>
                              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                                {formatIDR(selectedTxDetail.adminFee)}
                              </span>
                            </div>
                          ) : null}

                          <div className="flex items-center justify-between gap-3 py-2.5">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 pl-1">Total Pengurangan</span>
                            <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                              {formatIDR(selectedTxDetail.amount + (selectedTxDetail.adminFee || 0))}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* BOTTOM ACTION BAR - BUTTON TUTUP DI SEBELAH KANAN BAWAH */}
                <div className="px-5 pt-1 pb-[max(1.25rem,env(safe-area-inset-bottom,20px))] sm:pb-3.5 flex items-center justify-end shrink-0 bg-white dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => setSelectedTxDetail(null)}
                    className={`px-6 py-2.5 text-xs font-bold ${smallRadiusClass} bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition shadow-2xs cursor-pointer active:scale-95 text-center`}
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
});
