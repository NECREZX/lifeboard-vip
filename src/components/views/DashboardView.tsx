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
  ChevronRight,
  ArrowLeftRight,
  SlidersHorizontal,
  Calendar,
  BarChart3,
  Printer,
  Bell,
  Wallet as WalletIcon,
  Bot
} from 'lucide-react';
import { IconRenderer } from '../IconRenderer';
import { Transaction, Wallet, Saving, Budget, Activity, Wishlist } from '../../types';
import { TrendChart, CategoryPieChart, SourcePieChart } from '../InteractiveCharts';
import { formatIDR } from '../../lib/formatters';
import { t } from '../../lib/i18n';
import { isCategoryMatch, isWalletMatch, getBudgetCategoryLabel } from '../../lib/budgetUtils';

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
  onOpenWalletManage?: () => void;
  onOpenNotifications?: () => void;
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
  onOpenWalletManage,
  onOpenNotifications,
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

  const currentLang = settings?.language || 'id';

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
  const currentMonthName = currentLang === 'en' 
    ? currentMonthDate.toLocaleDateString('en-US', { month: 'long' })
    : currentMonthDate.toLocaleDateString('id-ID', { month: 'long' });

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
    { value: 1, label: currentLang === 'en' ? 'Jan' : 'Jan' },
    { value: 2, label: currentLang === 'en' ? 'Feb' : 'Feb' },
    { value: 3, label: currentLang === 'en' ? 'Mar' : 'Mar' },
    { value: 4, label: currentLang === 'en' ? 'Apr' : 'Apr' },
    { value: 5, label: currentLang === 'en' ? 'May' : 'Mei' },
    { value: 6, label: currentLang === 'en' ? 'Jun' : 'Jun' },
    { value: 7, label: currentLang === 'en' ? 'Jul' : 'Jul' },
    { value: 8, label: currentLang === 'en' ? 'Aug' : 'Agu' },
    { value: 9, label: currentLang === 'en' ? 'Sep' : 'Sep' },
    { value: 10, label: currentLang === 'en' ? 'Oct' : 'Okt' },
    { value: 11, label: currentLang === 'en' ? 'Nov' : 'Nov' },
    { value: 12, label: currentLang === 'en' ? 'Dec' : 'Des' },
  ];
  
  const fullMonths = currentLang === 'en' ? [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ] : [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const years = Array.from({ length: 50 }, (_, i) => 2020 + i);

  return (
    <div className="flex flex-col" id="view-dashboard">
      {/* 1. Hero Banner: Total Saldo Utama (Seamlessly fused with Top Bar #FF7777) */}
      <div className="relative -mx-4 sm:-mx-6 -mt-1 z-0 overflow-hidden bg-[#FF7777] text-white rounded-b-none pt-4 sm:pt-5 px-4 sm:px-6 pb-24 sm:pb-28 lg:pb-32">
        {/* Authentic Indonesian Songket Weave Vector Motif (Pure Songket geometric diamond-grid without circular ring lines) */}
        <div 
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 22%, rgba(0, 0, 0, 0.4) 45%, rgba(0, 0, 0, 0.9) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 22%, rgba(0, 0, 0, 0.4) 45%, rgba(0, 0, 0, 0.9) 100%)'
          }}
        >
          <svg className="w-full h-full opacity-35 mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Tradisional Songket Motif: Belah Ketupat / Bunga Melati / Tapak Catur Weave */}
              <pattern id="banner-songket-motif" width="48" height="48" patternUnits="userSpaceOnUse">
                {/* Outer Diamond Weave */}
                <path d="M 24 0 L 48 24 L 24 48 L 0 24 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                {/* Secondary Inset Diamond */}
                <path d="M 24 6 L 42 24 L 24 42 L 6 24 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
                {/* Tertiary Inset Diamond */}
                <path d="M 24 12 L 36 24 L 24 36 L 12 24 Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
                
                {/* Center Songket Floret (Pucuk Rebung / Bunga Intan) */}
                <polygon points="24,18 27,24 24,30 21,24" fill="currentColor" fillOpacity="0.6" />
                <polygon points="18,24 24,21 30,24 24,27" fill="currentColor" fillOpacity="0.6" />
                <rect x="23" y="23" width="2" height="2" fill="white" />
                
                {/* Corner Songket Cross Weaves connecting the grid */}
                <path d="M 0 0 L 6 6 M 48 0 L 42 6 M 0 48 L 6 42 M 48 48 L 42 42" stroke="currentColor" strokeWidth="1.2" />
                <polygon points="0,0 4,0 0,4" fill="currentColor" fillOpacity="0.4" />
                <polygon points="48,0 44,0 48,4" fill="currentColor" fillOpacity="0.4" />
                <polygon points="0,48 4,48 0,44" fill="currentColor" fillOpacity="0.4" />
                <polygon points="48,48 44,48 48,44" fill="currentColor" fillOpacity="0.4" />
                
                {/* Fine Songket Horizontal & Vertical Weave Ticks */}
                <line x1="24" y1="0" x2="24" y2="6" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1,1" />
                <line x1="24" y1="42" x2="24" y2="48" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1,1" />
                <line x1="0" y1="24" x2="6" y2="24" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1,1" />
                <line x1="42" y1="24" x2="48" y2="24" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1,1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#banner-songket-motif)" />
          </svg>
          
          {/* Subtle luminous rose-wine atmospheric glow in the lower corners (pure soft blur, no rings) */}
          <div className="absolute right-0 bottom-0 w-72 h-40 bg-rose-500/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-10 bottom-0 w-64 h-32 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Foreground Content: Total Saldo Utama */}
        <div className="relative z-10">
          {/* Top Row: Badge TOTAL SALDO UTAMA (Compact & Subtle) */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 border border-white/25 backdrop-blur-md text-white shadow-3xs w-fit">
              <ShieldCheck className="w-2.5 h-2.5 text-rose-100 shrink-0" />
              <span className="text-[8px] sm:text-[9px] font-bold tracking-wider uppercase whitespace-nowrap">
                {t('dash_total_balance', currentLang).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Saldo Display Row: Saldo on Left, Eye Toggle at Far Right Edge */}
          <div className="mt-2.5 sm:mt-3 flex items-center justify-between gap-3">
            <div className="relative inline-flex items-center min-w-0">
              <h2 
                className={`text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-mono text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-opacity duration-150 truncate ${
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

            {/* Control Row: Admin Toggle on Left, Eye Toggle on Right */}
            <div className="flex items-center gap-2 ml-auto shrink-0">
              {/* Admin Fee Toggle placed to the left of Eye icon */}
              <button
                type="button"
                onClick={() => setIncludeAdminFee(prev => !prev)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:py-2 ${settings?.cardRadius === 'sharp' ? 'rounded-none' : 'rounded-xl'} bg-white/20 hover:bg-white/30 border border-white/30 text-white backdrop-blur-md cursor-pointer transition-all active:scale-95 text-[10px] sm:text-xs font-bold shadow-xs select-none`}
                title={includeAdminFee ? "Biaya admin transfer: Aktif (dipotong) • Klik untuk ubah" : "Biaya admin transfer: Nonaktif • Klik untuk ubah"}
              >
                <div className={`w-2 h-2 rounded-full ${includeAdminFee ? 'bg-emerald-300' : 'bg-white/40'}`} />
                <span>Admin</span>
              </button>

              {/* Eye toggle placed at the far right edge */}
              <button
                type="button"
                onClick={toggleHideBalance}
                title={showHideBalance ? (currentLang === 'en' ? "Show Main Balance" : "Tampilkan Saldo Utama") : (currentLang === 'en' ? "Hide Main Balance" : "Sembunyikan Saldo Utama")}
                className={`p-2 sm:p-2.5 ${settings?.cardRadius === 'sharp' ? 'rounded-none' : 'rounded-xl'} transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md shrink-0`}
              >
                {showHideBalance ? <EyeOff className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> : <Eye className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
              </button>
            </div>
          </div>

          {/* GoPay-Style Monthly Expense & Income Report Bar */}
          <div className="mt-3 pt-2.5 border-t border-white/20">
            <div className="w-full flex items-center justify-between gap-3 p-1.5 -mx-1.5 text-white text-left select-none">
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
                      {currentLang === 'en' ? `spent in ${currentMonthName}` : `udah terpakai di ${currentMonthName}`}
                    </span>
                  </div>

                  {currentMonthIncomes > 0 && (
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-white/85 mt-0.5">
                      <span>{currentLang === 'en' ? 'Total Income:' : 'Total Pendapatan:'}</span>
                      <span className="font-bold text-emerald-200 font-mono drop-shadow-3xs">
                        {showHideBalance ? '••••••' : `+${formatIDR(currentMonthIncomes)}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Enclosing Card (GoPay style Sheet Card: -mt-20 sm:-mt-22 lg:-mt-24 -> -mt-[80px] sm:-mt-[88px] lg:-mt-[96px]) */}
      {/* Overlaps the top banner halfway and wraps: */}
      {/* - Card persegi panjang (Pendapatan, Admin Transfer, Pengeluaran) */}
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

        let enclosingCardBgClass = "bg-white dark:bg-slate-950 border-t border-b-0 border-slate-200/90 dark:border-slate-800 shadow-[0_-16px_36px_rgba(0,0,0,0.12)] dark:shadow-[0_-16px_36px_rgba(0,0,0,0.45)]";
        if (settings?.uiStyle === 'glass') {
          enclosingCardBgClass = "bg-white dark:bg-slate-950 border-t border-b-0 border-slate-200/60 dark:border-slate-800/80 shadow-[0_-16px_36px_rgba(0,0,0,0.15)]";
        } else if (settings?.uiStyle === 'minimal') {
          enclosingCardBgClass = "bg-white dark:bg-slate-950 border-t border-b-0 border-slate-200 dark:border-slate-800 shadow-none";
        }

        let metricCardBgClass = "bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 shadow-xs";
        if (settings?.uiStyle === 'glass') {
          metricCardBgClass = "bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200/70 dark:border-slate-800/70 shadow-xs";
        } else if (settings?.uiStyle === 'minimal') {
          metricCardBgClass = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-none";
        }

        return (
          <div className={`relative z-10 -mx-4 sm:-mx-6 -mt-[80px] sm:-mt-[88px] lg:-mt-[96px] -mb-28 min-h-[calc(100vh-180px)] ${enclosingCardRadiusClass} ${enclosingCardBgClass} p-4 sm:p-6 lg:p-8 pt-6 sm:pt-8 pb-36 sm:pb-40 space-y-6 sm:space-y-8 transition-all duration-300`}>
            {/* 1. Secondary Metrics: 3 Direct Cards (Pendapatan [Kiri], Admin Transfer [Tengah], Pengeluaran [Kanan]) */}
            <div className="grid grid-cols-3 gap-2 xs:gap-3 sm:gap-4 items-center justify-center w-full relative z-10">
              {/* Card 1: Total Pendapatan (Kiri) */}
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

              {/* Card 2: Biaya Admin Transfer (Tengah) */}
              <div 
                className={`aspect-square ${metricCardRadiusClass} ${metricCardBgClass} p-2 xs:p-2.5 sm:p-4 flex flex-col justify-between items-center text-center group hover:shadow-md hover:border-sky-300 dark:hover:border-sky-600 transition-all select-none overflow-hidden relative cursor-pointer`}
                onClick={() => setIncludeAdminFee(prev => !prev)}
                title="Klik untuk ubah pemotongan biaya admin"
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

              {/* Card 3: Total Pengeluaran (Kanan) */}
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
            </div>

            {/* Quick Actions Bar: Notifikasi (Kiri), Toggle Admin (Tengah), Laporan (Kanan) */}
            <div className="grid grid-cols-3 gap-2 xs:gap-2.5 sm:gap-3.5 pt-0.5 sm:pt-1">
              {/* Button 1: Notifikasi */}
              <button
                type="button"
                onClick={() => onOpenNotifications ? onOpenNotifications() : setActiveTab('notifikasi')}
                className={`group flex flex-col items-center justify-center p-2.5 sm:p-3 gap-1.5 ${metricCardRadiusClass} ${metricCardBgClass} hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-sm transition-all cursor-pointer select-none active:scale-[0.98] text-center`}
                title="Buka Pusat Notifikasi"
              >
                <div className={`w-7 h-7 sm:w-8 sm:h-8 ${settings?.cardRadius === 'sharp' ? 'rounded-none' : 'rounded-lg sm:rounded-xl'} bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                  <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Notifikasi
                </span>
              </button>

              {/* Button 2: Lifeboard AI (Tanpa card pembungkus, ukuran lebih besar, warna #FF7777) */}
              <button
                type="button"
                onClick={() => setActiveTab('lifeboard_ai')}
                className="group flex flex-col items-center justify-center p-1.5 sm:p-2 gap-1.5 cursor-pointer select-none active:scale-95 transition-all text-center w-full my-auto"
                title="Buka Lifeboard AI"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#FF7777]/15 hover:bg-[#FF7777]/25 text-[#FF7777] flex items-center justify-center shrink-0 shadow-sm shadow-[#FF7777]/20 group-hover:scale-110 transition-transform">
                  <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF7777]" />
                </div>
                <span className="text-[11px] sm:text-xs font-black tracking-wider text-slate-800 dark:text-slate-100 group-hover:text-[#FF7777] transition-colors uppercase">
                  AI
                </span>
              </button>

              {/* Button 3: Laporan */}
              <button
                type="button"
                onClick={() => setActiveTab('laporan')}
                className={`group flex flex-col items-center justify-center p-2.5 sm:p-3 gap-1.5 ${metricCardRadiusClass} ${metricCardBgClass} hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-sm transition-all cursor-pointer select-none active:scale-[0.98] text-center`}
                title="Buka Laporan Keuangan & Mutasi"
              >
                <div className={`w-7 h-7 sm:w-8 sm:h-8 ${settings?.cardRadius === 'sharp' ? 'rounded-none' : 'rounded-lg sm:rounded-xl'} bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                  >
                    <path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Laporan
                </span>
              </button>
            </div>

            {/* 2. Card Total Saldo Dompet - Unified Account Summary Card */}
            <div className="mt-1 sm:mt-2">
              {wallets.length === 0 ? (
                <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Belum ada dompet tersimpan</p>
                  <button
                    type="button"
                    onClick={() => onOpenWalletManage ? onOpenWalletManage() : setActiveTab('kelola')}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                  >
                    Tambah Dompet Baru
                  </button>
                </div>
              ) : (
                <div className={`${getCardClasses()} overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80`}>
                  {wallets.map((w: any) => {
                    const balanceVal = w.currentBalance ?? w.initialBalance;
                    const cardColor = w.color || '#0284c7';

                    return (
                      <div 
                        key={w.id}
                        onClick={() => onOpenWalletManage ? onOpenWalletManage() : setActiveTab('kelola')}
                        className="group flex items-center justify-between p-3.5 sm:p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer select-none"
                        title="Klik untuk kelola dompet ini"
                      >
                        {/* Left: Colored Icon & Wallet Name */}
                        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                          <div 
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs transition-transform group-hover:scale-105"
                            style={{ backgroundColor: cardColor }}
                          >
                            <IconRenderer name={w.icon || 'Wallet'} className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" />
                          </div>

                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm leading-snug truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {w.name}
                            </h4>
                          </div>
                        </div>

                        {/* Right: Directly visible Nominal Balance with Chevron Arrow */}
                        <div className="flex items-center gap-2 sm:gap-2.5 text-right shrink-0 pl-2">
                          <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-base tracking-tight font-mono">
                            {showHideBalance ? '••••••••' : formatIDR(balanceVal)}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

              {/* 3. Charts Section: Seluruh visualisasi chart di menu dashboard */}
              <div id="dashboard-charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6 scroll-mt-20">
                <div className={`${getCardClasses()} p-5 lg:p-6 col-span-1 lg:col-span-2`}>
                  <TrendChart transactions={transactions} themeColor="indigo" />
                </div>
                <div className={`${getCardClasses()} p-5 lg:p-6`}>
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-semibold tracking-tight text-slate-700 dark:text-slate-300">Alokasi Pengeluaran Keseluruhan</h4>
                  </div>
                  <CategoryPieChart transactions={transactions} categories={categories} />
                </div>
                <div className={`${getCardClasses()} p-5 lg:p-6`}>
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-semibold tracking-tight text-slate-700 dark:text-slate-300">Sumber Pendapatan Keseluruhan</h4>
                  </div>
                  <SourcePieChart transactions={transactions} sources={sources} />
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
                            .filter(t => t.type === 'pengeluaran' && isCategoryMatch(b, t.categoryId) && t.date.startsWith(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`) && isWalletMatch(b, t.walletId))
                            .reduce((sum, t) => sum + t.amount, 0);
                          const categoryName = getBudgetCategoryLabel(b, categories);
                          return (
                            <tr key={b.id} className="border-b border-slate-100 dark:border-slate-800">
                              <td className="py-2 truncate max-w-[80px] text-slate-700 dark:text-slate-200">{categoryName}</td>
                              <td className="py-2 text-right font-mono font-bold text-slate-800 dark:text-slate-100">{formatIDR(Math.max(0, b.limitAmount - spent))}</td>
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
