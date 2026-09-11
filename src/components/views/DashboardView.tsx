/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  LayoutDashboard, 
  CheckSquare, 
  ShoppingBag, 
  Target, 
  PieChart, 
  Receipt, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { IconRenderer } from '../IconRenderer';
import { Transaction, Wallet, Saving, Budget, Activity, Wishlist } from '../../types';
import { TrendChart, CategoryBarChart, SourceBarChart, CategoryPieChart, SourcePieChart } from '../InteractiveCharts';
import { formatIDR } from '../../lib/formatters';

// ... (DashboardView component remains largely the same)

// Inside DashboardView:
// ... (Row 1-3)
// ...
// Tables (Row 3):
// Fix text colors in tables
// ...

// Row 4: Charts
// ...
// Add 5 charts


interface DashboardViewProps {
  profileName: string;
  transactions: Transaction[];
  wallets: Wallet[];
  categories: any[];
  sources: any[];
  savings: Saving[];
  budgets: Budget[];
  activities: Activity[];
  wishlists: Wishlist[];
  totalSaldoUtama: number;
  totalWalletBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalTransferAdminFees: number;
  getCardClasses: () => string;
  getAccentBg: () => string;
  isInstallable: boolean;
  triggerPWAInstall: () => void;
  setActiveTab: (tab: string) => void;
  settings?: any;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profileName,
  transactions,
  wallets,
  categories,
  sources,
  savings,
  budgets,
  activities,
  wishlists,
  totalSaldoUtama,
  totalWalletBalance,
  totalIncome,
  totalExpense,
  totalTransferAdminFees,
  getCardClasses,
  getAccentBg,
  isInstallable,
  triggerPWAInstall,
  setActiveTab,
  settings
}) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempMonth, setTempMonth] = useState(selectedMonth);
  const [tempYear, setTempYear] = useState(selectedYear);

  // Eye Toggle & Admin Fee mode state
  const [showHideBalance, setShowHideBalance] = useState<boolean>(() => {
    return localStorage.getItem('lifeboard_hide_balance') === 'true';
  });
  const [includeAdminFee, setIncludeAdminFee] = useState<boolean>(true);
  const [selectedWalletForModal, setSelectedWalletForModal] = useState<Wallet | null>(null);
  const [expandedWalletId, setExpandedWalletId] = useState<string | null>(null);

  const activeThemeColor = settings?.themeColor === 'custom'
    ? (settings?.customAccentColor || '#8b5cf6')
    : (settings?.themeColor === 'emerald'
        ? '#10b981'
        : settings?.themeColor === 'amber'
          ? '#f59e0b'
          : settings?.themeColor === 'rose'
            ? '#f43f5e'
            : settings?.themeColor === 'classic'
              ? '#0f172a'
              : '#6366f1');

  const toggleHideBalance = () => {
    setShowHideBalance(prev => {
      const next = !prev;
      localStorage.setItem('lifeboard_hide_balance', next.toString());
      return next;
    });
  };

  const saldoWithAdmin = totalSaldoUtama; // Includes admin fee deduction
  const saldoWithoutAdmin = totalSaldoUtama + totalTransferAdminFees; // Raw total before admin fee deduction
  const activeDisplaySaldo = includeAdminFee ? saldoWithAdmin : saldoWithoutAdmin;

  // Current month's report calculations (GoPay style)
  const currentMonthDate = new Date();
  const currentMonthKey = `${currentMonthDate.getFullYear()}-${String(currentMonthDate.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthName = currentMonthDate.toLocaleDateString('id-ID', { month: 'long' });

  const currentMonthExpenses = transactions
    .filter(t => t.type === 'pengeluaran' && t.date && t.date.startsWith(currentMonthKey))
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthIncomes = transactions
    .filter(t => t.type === 'pemasukan' && t.date && t.date.startsWith(currentMonthKey))
    .reduce((sum, t) => sum + t.amount, 0);

  const handleApplyFilter = () => {
    setSelectedMonth(tempMonth);
    setSelectedYear(tempYear);
    setIsFilterModalOpen(false);
  };

  const handleResetFilter = () => {
    setTempMonth(new Date().getMonth() + 1);
    setTempYear(new Date().getFullYear());
  };

  const months = [
    { value: 1, label: 'Jan' }, { value: 2, label: 'Feb' }, { value: 3, label: 'Mar' },
    { value: 4, label: 'Apr' }, { value: 5, label: 'Mei' }, { value: 6, label: 'Jun' },
    { value: 7, label: 'Jul' }, { value: 8, label: 'Agu' }, { value: 9, label: 'Sep' },
    { value: 10, label: 'Okt' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Des' },
  ];
  
  const fullMonths = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const years = Array.from({ length: 50 }, (_, i) => 2020 + i);

  return (
    <div className="flex flex-col gap-6" id="view-dashboard">
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm flex flex-col gap-6">
            <h3 className="text-xl font-bold">Setel bulan</h3>
            <div className="flex gap-4">
              <div className="flex-1 h-40 overflow-y-auto">
                {months.map((m, i) => (
                   <button key={m.value} onClick={() => setTempMonth(m.value)} className={`w-full py-2 ${tempMonth === m.value ? 'font-bold' : 'text-slate-400'}`}>{m.label}</button>
                ))}
              </div>
              <div className="flex-1 h-40 overflow-y-auto">
                {years.map(y => (
                  <button key={y} onClick={() => setTempYear(y)} className={`w-full py-2 ${tempYear === y ? 'font-bold' : 'text-slate-400'}`}>{y}</button>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <button onClick={handleResetFilter} className="text-indigo-600 font-bold">Hapus</button>
              <div className="flex gap-4">
                <button onClick={() => setIsFilterModalOpen(false)} className="text-slate-500 font-bold">Batal</button>
                <button onClick={handleApplyFilter} className="text-indigo-600 font-bold">Setel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PWA Install prompt */}
      {isInstallable && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border border-indigo-100/50 dark:border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-xl shrink-0 shadow-sm">
              📲
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100">Pasang Aplikasi Ke HP / Desktop</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Akses cepat, hemat kuota, dan berfungsi penuh secara offline.</p>
            </div>
          </div>
          <button
            onClick={triggerPWAInstall}
            className={`px-4 py-1.5 rounded-xl text-[10px] font-bold text-white uppercase tracking-wider shadow-sm transition shrink-0 ${getAccentBg()}`}
          >
            Pasang Sekarang
          </button>
        </div>
      )}


      {/* 1. Hero Banner: Total Saldo Utama (Flat at bottom, extended for halfway overlap) */}
      <div className="relative -mx-4 sm:-mx-6 -mt-6 z-0 overflow-hidden bg-gradient-to-br from-cyan-400 via-teal-500 to-rose-500 text-white rounded-b-none pt-6 sm:pt-8 px-4 sm:px-6 pb-24 sm:pb-28 lg:pb-32 transition-all duration-200">
        {/* Artistic Geometric Vector Lattice Overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="banner-geometric-motif" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M30 0 L60 30 L30 60 L0 30 Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <circle cx="30" cy="30" r="14" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <circle cx="0" cy="0" r="12" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <circle cx="60" cy="0" r="12" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <circle cx="0" cy="60" r="12" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <circle cx="60" cy="60" r="12" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <path d="M30 16 L34 26 L44 30 L34 34 L30 44 L26 34 L16 30 L26 26 Z" fill="currentColor" fillOpacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#banner-geometric-motif)" />
        </svg>

        {/* Luminous Glowing Orbs matching Login Form Palette */}
        <div className="absolute -left-16 -top-16 w-72 h-72 bg-cyan-200/35 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 top-1/4 w-80 h-80 bg-teal-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-16 -top-10 w-80 h-80 bg-rose-300/35 rounded-full blur-3xl pointer-events-none" />

        {/* Translucent Decorative Rings in upper areas */}
        <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full border border-white/20 bg-white/5 pointer-events-none" />
        <div className="absolute -right-4 -top-4 w-60 h-60 rounded-full border border-white/10 pointer-events-none" />

        {/* Foreground Content: Total Saldo Utama */}
        <div className="relative z-10">
          {/* Main Hero Row: Left (Badge, Saldo) | Right (Simple Admin Toggle Card) */}
          <div className="flex items-center justify-between gap-3">
            {/* Left Column */}
            <div className="min-w-0 flex-1">
              {/* Badge TOTAL SALDO UTAMA */}
              <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white/20 border border-white/30 backdrop-blur-md text-white shadow-xs w-fit">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-100 shrink-0" />
                <span className="text-[10px] sm:text-xs font-black tracking-[0.12em] sm:tracking-[0.16em] uppercase whitespace-nowrap">
                  TOTAL SALDO UTAMA
                </span>
              </div>

              {/* Saldo Display with Eye Icon */}
              <div className="mt-2.5 sm:mt-3 flex items-center gap-2.5">
                <div className="relative inline-flex items-center">
                  <h2 
                    className={`text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-mono text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-opacity duration-150 ${
                      showHideBalance ? 'opacity-0 select-none pointer-events-none' : 'opacity-100'
                    }`}
                    aria-hidden={showHideBalance}
                  >
                    {formatIDR(activeDisplaySaldo)}
                  </h2>

                  {showHideBalance && (
                    <div className="absolute inset-0 flex items-center overflow-hidden">
                      <span className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-black tracking-wider text-white font-mono drop-shadow-[0_4px_12px_rgba(0,0,0,0.2)] select-none">
                        ••••••••
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={toggleHideBalance}
                  title={showHideBalance ? "Tampilkan Saldo Utama" : "Sembunyikan Saldo Utama"}
                  className="p-1 sm:p-1.5 rounded-full transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95 bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-sm shrink-0"
                >
                  {showHideBalance ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </button>
              </div>
            </div>

            {/* Right Column: Clean Simple Card with direct Toggle Switch + 'Admin' text below */}
            <button
              type="button"
              onClick={() => setIncludeAdminFee(prev => !prev)}
              title={includeAdminFee ? "Biaya Admin: Termasuk (Aktif) • Klik untuk ubah" : "Biaya Admin: Tanpa Admin (Nonaktif) • Klik untuk ubah"}
              aria-label={includeAdminFee ? "Termasuk Biaya Admin (Aktif)" : "Tanpa Biaya Admin (Nonaktif)"}
              className="flex flex-col items-center justify-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl bg-black/20 hover:bg-black/30 border border-white/20 transition-all cursor-pointer active:scale-95 select-none shrink-0 shadow-xs"
            >
              {/* Direct Toggle Switch without any icon */}
              <div className={`relative w-8 h-4.5 sm:w-9 sm:h-5 rounded-full p-0.5 transition-colors duration-200 border ${
                includeAdminFee ? 'bg-emerald-400 border-emerald-300' : 'bg-black/40 border-white/30'
              }`}>
                <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white transition-transform duration-200 shadow-xs ${
                  includeAdminFee ? 'translate-x-3.5 sm:translate-x-4' : 'translate-x-0'
                }`} />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-white tracking-wide leading-none">
                Admin
              </span>
            </button>
          </div>

          {/* GoPay-Style Monthly Expense & Income Report Bar */}
          <div className="mt-3 pt-2.5 border-t border-white/20">
            <button
              type="button"
              onClick={() => setActiveTab('laporan')}
              className="group w-full flex items-center justify-between gap-3 p-1.5 -mx-1.5 rounded-xl hover:bg-white/15 active:scale-[0.99] transition-all cursor-pointer select-none text-white text-left"
              title="Klik untuk lihat Laporan Bulanan Lengkap"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* 3 mini vertical bars icon matching GoPay */}
                <div className="flex items-end gap-0.5 h-4 w-3.5 pb-0.5 shrink-0 text-white drop-shadow-3xs">
                  <div className="w-1 h-2 bg-white rounded-xs" />
                  <div className="w-1 h-4 bg-white rounded-xs" />
                  <div className="w-1 h-2.5 bg-white rounded-xs" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm leading-snug">
                    <span className="font-bold text-white tracking-tight drop-shadow-3xs font-mono">
                      {showHideBalance ? '••••••' : formatIDR(currentMonthExpenses)}
                    </span>
                    <span className="text-white/90 font-normal drop-shadow-3xs text-[11px] sm:text-xs truncate">
                      udah terpakai di {currentMonthName}
                    </span>
                  </div>

                  {currentMonthIncomes > 0 && (
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-white/85 mt-0.5">
                      <span>Total Pendapatan:</span>
                      <span className="font-bold text-emerald-200 font-mono drop-shadow-3xs">
                        {showHideBalance ? '••••••' : `+${formatIDR(currentMonthIncomes)}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Custom ChevronsRight SVG pointer icon (Larger & Bolder) */}
              <div className="flex items-center text-white shrink-0 pr-0.5">
                <svg 
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform shrink-0 drop-shadow-xs" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 -960 960 960" 
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="36"
                >
                  <path d="M383-480 200-664l56-56 240 240-240 240-56-56 183-184Zm264 0L464-664l56-56 240 240-240 240-56-56 183-184Z"/>
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Enclosing Card (GoPay style Sheet Card) */}
      {/* Overlaps the top banner halfway and wraps: */}
      {/* - Card persegi panjang (Pendapatan, Pengeluaran, Admin Transfer) */}
      {/* - Saldo Dompet */}
      {/* - Card Aktivitas, Wishlist, Tabungan, Anggaran */}
      {/* - Seluruh visualisasi chart di dashboard */}
      {(() => {
        let enclosingCardRadiusClass = "rounded-t-[32px] sm:rounded-t-[40px] rounded-b-none";
        let metricCardRadiusClass = "rounded-2xl sm:rounded-3xl";

        if (settings?.cardRadius === 'sharp') {
          enclosingCardRadiusClass = "rounded-none";
          metricCardRadiusClass = "rounded-none";
        } else if (settings?.cardRadius === 'extra') {
          enclosingCardRadiusClass = "rounded-t-[40px] sm:rounded-t-[48px] rounded-b-none";
          metricCardRadiusClass = "rounded-3xl sm:rounded-[32px]";
        }

        let enclosingCardBgClass = "bg-white dark:bg-slate-900 border-t border-b-0 border-slate-200/90 dark:border-slate-800 shadow-[0_-16px_36px_rgba(0,0,0,0.12)] dark:shadow-[0_-16px_36px_rgba(0,0,0,0.45)]";
        if (settings?.uiStyle === 'glass') {
          enclosingCardBgClass = "bg-white dark:bg-slate-900 border-t border-b-0 border-slate-200/60 dark:border-slate-800/80 shadow-[0_-16px_36px_rgba(0,0,0,0.15)]";
        } else if (settings?.uiStyle === 'minimal') {
          enclosingCardBgClass = "bg-white dark:bg-slate-900 border-t border-b-0 border-slate-200 dark:border-slate-800 shadow-none";
        }

        let metricCardBgClass = "bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 shadow-xs";
        if (settings?.uiStyle === 'glass') {
          metricCardBgClass = "bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/70 dark:border-slate-700/70 shadow-xs";
        } else if (settings?.uiStyle === 'minimal') {
          metricCardBgClass = "bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-none";
        }

        return (
          <div className={`relative z-10 -mx-4 sm:-mx-6 -mt-20 sm:-mt-22 lg:-mt-24 mb-0 ${enclosingCardRadiusClass} ${enclosingCardBgClass} p-4 sm:p-6 lg:p-8 pt-6 sm:pt-8 pb-36 sm:pb-44 min-h-[calc(100vh-120px)] space-y-8 sm:space-y-10 transition-all duration-300`}>
            {/* 1. Secondary Metrics: 3 Direct Cards (Pendapatan, Pengeluaran, Admin Transfer) */}
            <div className="grid grid-cols-3 gap-2 xs:gap-3 sm:gap-4 items-center justify-center w-full relative z-10">
              {/* Card 1: Total Pendapatan */}
              <div 
                className={`aspect-square ${metricCardRadiusClass} ${metricCardBgClass} p-2 xs:p-2.5 sm:p-4 flex flex-col justify-between items-center text-center group hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600 transition-all select-none overflow-hidden relative`}
              >
                <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-3xs shrink-0 transition-transform group-hover:scale-110">
                  <TrendingUp className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="w-full my-auto px-0.5">
                  <span className="block font-mono font-black text-[11px] xs:text-xs sm:text-base lg:text-lg text-slate-800 dark:text-slate-100 tracking-tight truncate">
                    {showHideBalance ? '••••••' : formatIDR(totalIncome)}
                  </span>
                </div>
                <span className="text-[9px] xs:text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
                  Pendapatan
                </span>
              </div>

              {/* Card 2: Total Pengeluaran */}
              <div 
                className={`aspect-square ${metricCardRadiusClass} ${metricCardBgClass} p-2 xs:p-2.5 sm:p-4 flex flex-col justify-between items-center text-center group hover:shadow-md hover:border-rose-300 dark:hover:border-rose-600 transition-all select-none overflow-hidden relative`}
              >
                <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-full bg-rose-100/90 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-3xs shrink-0 transition-transform group-hover:scale-110">
                  <TrendingDown className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="w-full my-auto px-0.5">
                  <span className="block font-mono font-black text-[11px] xs:text-xs sm:text-base lg:text-lg text-slate-800 dark:text-slate-100 tracking-tight truncate">
                    {showHideBalance ? '••••••' : formatIDR(totalExpense)}
                  </span>
                </div>
                <span className="text-[9px] xs:text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
                  Pengeluaran
                </span>
              </div>

              {/* Card 3: Biaya Admin Transfer */}
              <div 
                className={`aspect-square ${metricCardRadiusClass} ${metricCardBgClass} p-2 xs:p-2.5 sm:p-4 flex flex-col justify-between items-center text-center group hover:shadow-md hover:border-sky-300 dark:hover:border-sky-600 transition-all select-none overflow-hidden relative`}
              >
                <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-full bg-sky-100/90 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-3xs shrink-0 transition-transform group-hover:scale-110">
                  <Receipt className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="w-full my-auto px-0.5">
                  <span className="block font-mono font-black text-[11px] xs:text-xs sm:text-base lg:text-lg text-slate-800 dark:text-slate-100 tracking-tight truncate">
                    {showHideBalance ? '••••••' : formatIDR(totalTransferAdminFees)}
                  </span>
                </div>
                <span className="text-[9px] xs:text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
                  Admin Transfer
                </span>
              </div>
            </div>

              {/* 3. Card Saldo Dompet - Stacked Wallet Cards in Pocket Sleeve */}
              <div className="mt-12 sm:mt-16 pt-2 sm:pt-3">
                <div className="flex items-center justify-between mb-3.5 px-1">
                  <h3 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-700 dark:text-slate-200">
                    Saldo Dompet
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('kelola')}
                    className="text-[10px] sm:text-[11px] font-bold text-indigo-500 dark:text-indigo-400 hover:underline flex items-center gap-0.5 transition-colors cursor-pointer group"
                    title="Buka Menu Kelola Dompet"
                  >
                    <span>Kelola Dompet</span>
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>

                {wallets.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Belum ada dompet tersimpan</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('kelola')}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                    >
                      Tambah Dompet Baru
                    </button>
                  </div>
                ) : (
                  <div className="w-full relative py-1">
                    <div className="flex flex-col relative">
                      {wallets.map((w: any, idx: number) => {
                        const balanceVal = w.currentBalance ?? w.initialBalance;
                        const cardColor = w.color || '#0284c7';
                        const isLast = idx === wallets.length - 1;

                        let stackCardRadius = "rounded-2xl sm:rounded-[24px]";
                        if (settings?.cardRadius === 'sharp') {
                          stackCardRadius = "rounded-none";
                        } else if (settings?.cardRadius === 'extra') {
                          stackCardRadius = "rounded-3xl sm:rounded-[30px]";
                        }

                        // For the bottom-most card entering the pocket sleeve, remove bottom rounding so it plunges straight into the sleeve without gaps
                        if (isLast && settings?.cardRadius !== 'sharp') {
                          stackCardRadius = settings?.cardRadius === 'extra' 
                            ? "rounded-t-3xl sm:rounded-t-[30px] rounded-b-none" 
                            : "rounded-t-2xl sm:rounded-t-[24px] rounded-b-none";
                        }

                        return (
                          <div 
                            key={w.id}
                            onClick={() => setActiveTab('kelola')}
                            style={{ zIndex: 10 + idx }}
                            className={`group relative ${idx > 0 ? '-mt-3.5 sm:-mt-4' : ''} ${stackCardRadius} bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 ${isLast ? 'border-b-0 pb-10 sm:pb-12' : 'pb-6 sm:pb-7'} shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] px-4 sm:px-5 py-3.5 sm:py-4 transition-all duration-200 hover:-translate-y-2 hover:shadow-xl hover:z-50 cursor-pointer select-none`}
                            title="Klik untuk kelola dompet ini"
                          >
                            <div className="flex items-center justify-between gap-3 relative z-10">
                              {/* Left: Circular Icon Badge & Heading Only */}
                              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                                <div 
                                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs transition-transform group-hover:scale-105"
                                  style={{ backgroundColor: cardColor }}
                                >
                                  <IconRenderer name={w.icon || 'Wallet'} className="w-5 h-5 text-white" />
                                </div>

                                <div className="min-w-0">
                                  <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug truncate">
                                    {w.name}
                                  </h4>
                                </div>
                              </div>

                              {/* Right: Balance */}
                              <div className="text-right shrink-0 pl-2">
                                <span className="font-bold text-slate-950 dark:text-white text-sm sm:text-base tracking-tight font-mono">
                                  {showHideBalance ? '••••••••' : formatIDR(balanceVal)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Physical Wallet Pocket Rim (Stitched bottom wave flap sleeve - GoPay style: melengkung ke bawah di tengah, menyatu tanpa garis batas) */}
                      <div 
                        style={{ zIndex: 30 + wallets.length }}
                        className="relative -mt-6 sm:-mt-7 pointer-events-none select-none"
                      >
                        <svg 
                          className="w-full h-10 sm:h-12 block" 
                          preserveAspectRatio="none" 
                          viewBox="0 0 1000 60"
                        >
                          {/* The pocket body that blends 100% seamlessly into the container background below without any border or shadow cutoff */}
                          <path 
                            d="M 0,6 L 260,6 C 350,6 410,24 500,24 C 590,24 650,6 740,6 L 1000,6 L 1000,60 L 0,60 Z" 
                            className="fill-white dark:fill-slate-900" 
                          />
                          {/* Top edge rim line with smooth downward curve in the center */}
                          <path 
                            d="M 0,6 L 260,6 C 350,6 410,24 500,24 C 590,24 650,6 740,6 L 1000,6" 
                            fill="none" 
                            className="stroke-slate-200/90 dark:stroke-slate-700/90" 
                            strokeWidth="1.2" 
                          />
                          {/* Dashed stitched seam parallel to the center downward curve */}
                          <path 
                            d="M 0,14 L 260,14 C 350,14 410,32 500,32 C 590,32 650,14 740,14 L 1000,14" 
                            fill="none" 
                            className="stroke-slate-300 dark:stroke-slate-600" 
                            strokeWidth="1.25" 
                            strokeDasharray="6,4" 
                            strokeLinecap="round" 
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Charts Section: Seluruh visualisasi chart di menu dashboard */}
              <div className="-mt-4 sm:-mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={getCardClasses() + " p-5 lg:p-6"}>
                  <TrendChart transactions={transactions} themeColor="indigo" />
                </div>
                <div className={getCardClasses() + " p-5 lg:p-6"}>
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-semibold tracking-tight text-slate-700 dark:text-slate-300">Alokasi Pengeluaran (Keseluruhan)</h4>
                  </div>
                  <CategoryPieChart transactions={transactions} categories={categories} />
                </div>
                <div className={getCardClasses() + " p-5 lg:p-6"}>
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-semibold tracking-tight text-slate-700 dark:text-slate-300">Sumber Pendapatan (Keseluruhan)</h4>
                  </div>
                  <SourcePieChart transactions={transactions} sources={sources} />
                </div>
                <div className={getCardClasses() + " p-5 lg:p-6"}>
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-semibold tracking-tight text-slate-700 dark:text-slate-300">Statistik Bulanan</h4>
                    <button 
                      onClick={() => setIsFilterModalOpen(true)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                      {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <h4 className="text-xs font-semibold mb-2 text-slate-600 dark:text-slate-400">Alokasi Pengeluaran</h4>
                        <CategoryBarChart transactions={transactions} categories={categories} month={selectedMonth} year={selectedYear} />
                     </div>
                     <div>
                        <h4 className="text-xs font-semibold mb-2 text-slate-600 dark:text-slate-400">Sumber Pendapatan</h4>
                        <SourceBarChart transactions={transactions} sources={sources} month={selectedMonth} year={selectedYear} />
                     </div>
                  </div>
                </div>
              </div>

              {/* 4. Secondary Insights Tables: Aktivitas, Wishlist, Tabungan, Anggaran */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700 dark:text-slate-300">
                <div className={getCardClasses() + " p-4"}>
                   <div className="flex justify-between items-center mb-2">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aktivitas</h4>
                     <button onClick={() => setActiveTab('aktivitas')} className="text-[10px] font-bold text-indigo-500 hover:underline">Lihat Semua</button>
                   </div>
                   <table className="w-full text-[11px]">
                     <thead>
                       <tr className="text-slate-500 border-b border-slate-100 dark:border-slate-800">
                         <th className="text-left font-normal pb-1">Judul</th>
                         <th className="text-right font-normal pb-1">Status</th>
                       </tr>
                     </thead>
                     <tbody>
                       {activities.slice(0, 3).map(a => (
                         <tr key={a.id} className="border-b border-slate-100 dark:border-slate-800">
                           <td className="py-2 truncate max-w-[100px] text-slate-700 dark:text-slate-200">{a.title}</td>
                           <td className={`py-2 text-right font-bold ${a.status === 'completed' ? 'text-emerald-500' : 'text-amber-500 dark:text-amber-400'}`}>{a.status === 'completed' ? 'Selesai' : 'Pending'}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>

                <div className={getCardClasses() + " p-4"}>
                   <div className="flex justify-between items-center mb-2">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Wishlist</h4>
                     <button onClick={() => setActiveTab('aktivitas')} className="text-[10px] font-bold text-indigo-500 hover:underline">Lihat Semua</button>
                   </div>
                   <table className="w-full text-[11px]">
                     <thead>
                       <tr className="text-slate-500 border-b border-slate-100 dark:border-slate-800">
                         <th className="text-left font-normal pb-1">Barang</th>
                         <th className="text-right font-normal pb-1">Target</th>
                       </tr>
                     </thead>
                     <tbody>
                       {wishlists
                        .filter(w => w.month === `${selectedYear}-${String(selectedMonth).padStart(2, '0')}` && !w.isPurchased)
                        .slice(0, 3).map(w => (
                         <tr key={w.id} className="border-b border-slate-100 dark:border-slate-800">
                           <td className="py-2 truncate max-w-[100px] text-slate-700 dark:text-slate-200">{w.title}</td>
                           <td className="py-2 text-right font-bold text-slate-800 dark:text-slate-100">{w.month}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>

                <div className={getCardClasses() + " p-4"}>
                   <div className="flex justify-between items-center mb-2">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tabungan</h4>
                     <button onClick={() => setActiveTab('tabungan')} className="text-[10px] font-bold text-indigo-500 hover:underline">Lihat Semua</button>
                   </div>
                   <table className="w-full text-[11px]">
                     <thead>
                       <tr className="text-slate-500 border-b border-slate-100 dark:border-slate-800">
                         <th className="text-left font-normal pb-1">Target</th>
                         <th className="text-right font-normal pb-1">Progres</th>
                       </tr>
                     </thead>
                     <tbody>
                       {savings.slice(0, 3).map(s => (
                         <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800">
                           <td className="py-2 truncate max-w-[80px] text-slate-700 dark:text-slate-200">{s.name}</td>
                           <td className="py-2 text-right font-bold text-indigo-600 dark:text-indigo-400">{Math.round((s.currentAmount / s.targetAmount) * 100)}%</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
                
                <div className={getCardClasses() + " p-4"}>
                   <div className="flex justify-between items-center mb-2">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Anggaran</h4>
                     <button onClick={() => setActiveTab('anggaran')} className="text-[10px] font-bold text-indigo-500 hover:underline">Lihat Semua</button>
                   </div>
                   <table className="w-full text-[11px]">
                     <thead>
                       <tr className="text-slate-500 border-b border-slate-100 dark:border-slate-800">
                         <th className="text-left font-normal pb-1">Kategori</th>
                         <th className="text-right font-normal pb-1">Sisa</th>
                       </tr>
                     </thead>
                     <tbody>
                       {budgets
                        .filter(b => b.month === `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`)
                        .slice(0, 3).map(b => {
                          const spent = transactions
                            .filter(t => t.type === 'pengeluaran' && t.categoryId === b.categoryId && t.date.startsWith(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`))
                            .reduce((sum, t) => sum + t.amount, 0);
                          const categoryName = categories.find(c => c.id === b.categoryId)?.name || 'Kategori';
                          return (
                            <tr key={b.id} className="border-b border-slate-100 dark:border-slate-800">
                              <td className="py-2 truncate max-w-[80px] text-slate-700 dark:text-slate-200">{categoryName}</td>
                              <td className="py-2 text-right font-bold text-slate-800 dark:text-slate-100">{formatIDR(Math.max(0, b.limitAmount - spent))}</td>
                            </tr>
                          );
                        })}
                     </tbody>
                   </table>
                </div>
              </div>

          </div>
        );
      })()}

    </div>
  );
};
