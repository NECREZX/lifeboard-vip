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

  // Dynamic Banner Measurement to end precisely halfway down the metrics wrapper card
  const bannerContainerRef = useRef<HTMLDivElement>(null);
  const metricsWrapperCardRef = useRef<HTMLDivElement>(null);
  const [bannerHeight, setBannerHeight] = useState<number | null>(null);

  useEffect(() => {
    const updateBannerHeight = () => {
      if (bannerContainerRef.current && metricsWrapperCardRef.current) {
        const containerRect = bannerContainerRef.current.getBoundingClientRect();
        const cardRect = metricsWrapperCardRef.current.getBoundingClientRect();
        const calculated = (cardRect.top - containerRect.top) + (cardRect.height / 2);
        if (calculated > 80) {
          setBannerHeight(Math.round(calculated));
        }
      }
    };

    updateBannerHeight();
    const timer = setTimeout(updateBannerHeight, 80);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && metricsWrapperCardRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateBannerHeight();
      });
      resizeObserver.observe(metricsWrapperCardRef.current);
      if (bannerContainerRef.current) {
        resizeObserver.observe(bannerContainerRef.current);
      }
    }

    window.addEventListener('resize', updateBannerHeight);
    return () => {
      clearTimeout(timer);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', updateBannerHeight);
    };
  }, [wallets.length, settings?.cardRadius, settings?.uiStyle, includeAdminFee, showHideBalance]);

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


      {/* Hero Banner with Bottom Radius adapted to user's setting (Kotak, Rounded, Sangat Rounded) */}
      {(() => {
        let bannerRadiusClass = "rounded-b-[28px] sm:rounded-b-[36px]";
        let wrapperRadiusClass = "rounded-2xl sm:rounded-3xl";
        let innerSquareRadiusClass = "rounded-xl sm:rounded-2xl";

        if (settings?.cardRadius === 'sharp') {
          bannerRadiusClass = "rounded-b-none";
          wrapperRadiusClass = "rounded-none";
          innerSquareRadiusClass = "rounded-none";
        } else if (settings?.cardRadius === 'extra') {
          bannerRadiusClass = "rounded-b-[40px] sm:rounded-b-[50px]";
          wrapperRadiusClass = "rounded-3xl sm:rounded-[36px]";
          innerSquareRadiusClass = "rounded-2xl sm:rounded-[24px]";
        }

        let wrapperBgClass = "bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_16px_40px_rgba(0,0,0,0.12)]";
        if (settings?.uiStyle === 'glass') {
          wrapperBgClass = "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-white/60 dark:border-slate-800/80 shadow-[0_16px_40px_rgba(0,0,0,0.15)]";
        } else if (settings?.uiStyle === 'minimal') {
          wrapperBgClass = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md";
        }

        return (
          <div ref={bannerContainerRef} className="relative -mx-4 sm:-mx-6 -mt-6 z-0 mb-8 sm:mb-10">
            {/* The Banner Body background: dynamically terminates at halfway down the metrics wrapper card */}
            <div 
              className={`absolute inset-x-0 top-0 overflow-hidden bg-gradient-to-br from-cyan-400 via-teal-500 to-rose-500 text-white ${bannerRadiusClass} shadow-[0_16px_36px_rgba(0,0,0,0.16)] border-b border-white/20 pointer-events-none transition-all duration-200`}
              style={bannerHeight ? { height: `${bannerHeight}px` } : { height: '260px' }}
            >
              {/* Artistic Geometric Vector Lattice Overlay */}
              <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="banner-geometric-motif" width="60" height="60" patternUnits="userSpaceOnUse">
                    {/* Interlocking geometric stars & octagons */}
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

              {/* Elegant Translucent Decorative Rings in upper areas (cleanly clear of bottom corners for pristine symmetry) */}
              <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full border border-white/20 bg-white/5 pointer-events-none" />
              <div className="absolute -right-4 -top-4 w-60 h-60 rounded-full border border-white/10 pointer-events-none" />
            </div>

            {/* Foreground Content Container with Top Padding */}
            <div className="relative z-10 pt-6 px-4 sm:px-6">
              {/* 1. Total Saldo Utama Section */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 backdrop-blur-md text-white shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-100" />
                    <span className="text-[10px] sm:text-xs font-black tracking-[0.16em] uppercase">
                      TOTAL SALDO UTAMA
                    </span>
                  </div>
                  <div className="hidden xs:flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/20 border border-white/15 backdrop-blur-md text-[10px] font-mono text-cyan-100 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    <span>IDR</span>
                  </div>
                </div>

                {/* Saldo Display with Eye Icon on the right - Fixed anchor width so toggle button stays in identical position without elongating */}
                <div className="mt-4 sm:mt-5 flex items-center gap-3">
                  <div className="relative inline-flex items-center">
                    {/* Nominal text always dictates natural container width so eye toggle never moves */}
                    <h2 
                      className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-mono text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-opacity duration-150 ${
                        showHideBalance ? 'opacity-0 select-none pointer-events-none' : 'opacity-100'
                      }`}
                      aria-hidden={showHideBalance}
                    >
                      {formatIDR(activeDisplaySaldo)}
                    </h2>

                    {/* Masked bullet overlay inside exact bounding box */}
                    {showHideBalance && (
                      <div className="absolute inset-0 flex items-center overflow-hidden">
                        <span className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-wider text-white font-mono drop-shadow-[0_4px_12px_rgba(0,0,0,0.2)] select-none">
                          ••••••••
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Eye Button at the right of nominal balance number - its position stays 100% constant */}
                  <button
                    type="button"
                    onClick={toggleHideBalance}
                    title={showHideBalance ? "Tampilkan Saldo Utama" : "Sembunyikan Saldo Utama"}
                    className="p-1.5 sm:p-2 rounded-full transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95 bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-sm shrink-0"
                  >
                    {showHideBalance ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>

                {/* Toggle switch Termasuk Admin / Tanpa Admin below nominal number */}
                <div className="mt-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setIncludeAdminFee(prev => !prev)}
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/30 bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer select-none active:scale-95 shadow-sm backdrop-blur-sm"
                    title={includeAdminFee ? "Termasuk Biaya Admin (Klik untuk ubah)" : "Tanpa Biaya Admin (Klik untuk ubah)"}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wide text-white/95 drop-shadow-3xs">
                      {includeAdminFee ? 'Termasuk Admin' : 'Tanpa Admin'}
                    </span>
                    <div className={`relative w-7 h-3.5 sm:w-8 sm:h-4 rounded-full p-0.5 transition-all duration-300 ease-in-out border ${
                      includeAdminFee ? 'bg-white/40 border-white/60' : 'bg-black/20 border-white/20'
                    }`}>
                      <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transform transition-transform duration-300 ease-in-out shadow-sm ${
                        includeAdminFee ? 'translate-x-3 sm:translate-x-3.5 bg-white' : 'bg-white/60'
                      }`} />
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. Secondary Metrics: Rectangular Wrapper Card with 2 Curved Lines Motif & Centered Cards */}
              <div className="mt-8 sm:mt-10">
                <div 
                  ref={metricsWrapperCardRef}
                  className={`w-full ${wrapperRadiusClass} ${wrapperBgClass} p-3.5 sm:p-5 py-5 sm:py-6 transition-all duration-300 relative z-20 overflow-hidden flex flex-col justify-center items-center`}
                >
                  {/* Motif Batik di Pinggir-Pinggir Card - Sudut Kiri Atas (Warna Cyan - Teal) */}
                  <div className="absolute top-0 left-0 w-28 h-28 sm:w-36 sm:h-36 pointer-events-none z-0 select-none opacity-45 dark:opacity-40">
                    <svg className="w-full h-full" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="batik-edge-tl" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#0d9488" />
                        </linearGradient>
                      </defs>
                      {/* Batik Kawung & Ceplok Corner Grid */}
                      {/* Lingkaran & Kurva Kawung Sudut */}
                      <circle cx="0" cy="0" r="32" stroke="url(#batik-edge-tl)" strokeWidth="1.5" fill="none" />
                      <circle cx="0" cy="0" r="48" stroke="url(#batik-edge-tl)" strokeWidth="1" strokeDasharray="2 2" fill="none" />
                      <circle cx="48" cy="0" r="24" stroke="url(#batik-edge-tl)" strokeWidth="1.2" fill="none" />
                      <circle cx="0" cy="48" r="24" stroke="url(#batik-edge-tl)" strokeWidth="1.2" fill="none" />
                      <circle cx="36" cy="36" r="18" stroke="url(#batik-edge-tl)" strokeWidth="1.2" fill="none" />
                      {/* Daun / Kelopak Kawung Interlocking */}
                      <path d="M 0,24 C 14,24 24,14 24,0 C 14,0 0,14 0,24 Z" fill="url(#batik-edge-tl)" opacity="0.35" />
                      <path d="M 24,0 C 24,14 38,24 48,24 C 48,14 38,0 24,0 Z" fill="url(#batik-edge-tl)" opacity="0.25" />
                      <path d="M 0,24 C 0,38 14,48 24,48 C 24,34 14,24 0,24 Z" fill="url(#batik-edge-tl)" opacity="0.25" />
                      <path d="M 24,48 C 34,48 48,34 48,24 C 34,24 24,34 24,48 Z" fill="url(#batik-edge-tl)" opacity="0.4" />
                      {/* Isen-isen Batik (Titik & Garis Parang Lembut) */}
                      <circle cx="24" cy="24" r="2.5" fill="url(#batik-edge-tl)" />
                      <circle cx="12" cy="12" r="1.5" fill="url(#batik-edge-tl)" />
                      <circle cx="36" cy="12" r="1.5" fill="url(#batik-edge-tl)" />
                      <circle cx="12" cy="36" r="1.5" fill="url(#batik-edge-tl)" />
                      <circle cx="68" cy="14" r="1.75" fill="url(#batik-edge-tl)" />
                      <circle cx="14" cy="68" r="1.75" fill="url(#batik-edge-tl)" />
                      {/* Border Garis Pinggir Bertingkat */}
                      <path d="M 0,80 L 12,68 L 30,68 L 40,58 L 58,58 L 68,40 L 68,30 L 80,12 L 80,0" stroke="url(#batik-edge-tl)" strokeWidth="1" strokeDasharray="3 3" />
                      <path d="M 0,96 C 45,96 96,45 96,0" stroke="url(#batik-edge-tl)" strokeWidth="0.75" strokeDasharray="2 4" />
                    </svg>
                  </div>

                  {/* Motif Batik di Pinggir-Pinggir Card - Sudut Bawah Kanan (Warna Teal - Rose) */}
                  <div className="absolute bottom-0 right-0 w-28 h-28 sm:w-36 sm:h-36 pointer-events-none z-0 select-none opacity-45 dark:opacity-40">
                    <svg className="w-full h-full" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="batik-edge-br" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#0d9488" />
                          <stop offset="100%" stopColor="#f43f5e" />
                        </linearGradient>
                      </defs>
                      {/* Batik Kawung & Ceplok Corner Grid */}
                      <circle cx="120" cy="120" r="32" stroke="url(#batik-edge-br)" strokeWidth="1.5" fill="none" />
                      <circle cx="120" cy="120" r="48" stroke="url(#batik-edge-br)" strokeWidth="1" strokeDasharray="2 2" fill="none" />
                      <circle cx="72" cy="120" r="24" stroke="url(#batik-edge-br)" strokeWidth="1.2" fill="none" />
                      <circle cx="120" cy="72" r="24" stroke="url(#batik-edge-br)" strokeWidth="1.2" fill="none" />
                      <circle cx="84" cy="84" r="18" stroke="url(#batik-edge-br)" strokeWidth="1.2" fill="none" />
                      {/* Daun / Kelopak Kawung Interlocking */}
                      <path d="M 120,96 C 106,96 96,106 96,120 C 106,120 120,106 120,96 Z" fill="url(#batik-edge-br)" opacity="0.35" />
                      <path d="M 96,120 C 96,106 82,96 72,96 C 72,106 82,120 96,120 Z" fill="url(#batik-edge-br)" opacity="0.25" />
                      <path d="M 120,96 C 120,82 106,72 96,72 C 96,86 106,96 120,96 Z" fill="url(#batik-edge-br)" opacity="0.25" />
                      <path d="M 96,72 C 86,72 72,86 72,96 C 86,96 96,86 96,72 Z" fill="url(#batik-edge-br)" opacity="0.4" />
                      {/* Isen-isen Batik */}
                      <circle cx="96" cy="96" r="2.5" fill="url(#batik-edge-br)" />
                      <circle cx="108" cy="108" r="1.5" fill="url(#batik-edge-br)" />
                      <circle cx="84" cy="108" r="1.5" fill="url(#batik-edge-br)" />
                      <circle cx="108" cy="84" r="1.5" fill="url(#batik-edge-br)" />
                      <circle cx="52" cy="106" r="1.75" fill="url(#batik-edge-br)" />
                      <circle cx="106" cy="52" r="1.75" fill="url(#batik-edge-br)" />
                      {/* Border Garis Pinggir Bertingkat */}
                      <path d="M 120,40 L 108,52 L 90,52 L 80,62 L 62,62 L 52,80 L 52,90 L 40,108 L 40,120" stroke="url(#batik-edge-br)" strokeWidth="1" strokeDasharray="3 3" />
                      <path d="M 120,24 C 75,24 24,75 24,120" stroke="url(#batik-edge-br)" strokeWidth="0.75" strokeDasharray="2 4" />
                    </svg>
                  </div>

                  {/* 3 Square Cards arranged horizontally side-by-side (sejajar ke kanan) & perfectly centered */}
                  <div className="grid grid-cols-3 gap-2 xs:gap-3 sm:gap-4 items-center justify-center w-full relative z-10">
                    {/* Card 1: Total Pendapatan */}
                    <div 
                      className={`aspect-square ${innerSquareRadiusClass} bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 p-2 xs:p-2.5 sm:p-4 flex flex-col justify-between items-center text-center group hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600 transition-all select-none overflow-hidden relative`}
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
                      className={`aspect-square ${innerSquareRadiusClass} bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 p-2 xs:p-2.5 sm:p-4 flex flex-col justify-between items-center text-center group hover:shadow-md hover:border-rose-300 dark:hover:border-rose-600 transition-all select-none overflow-hidden relative`}
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
                      className={`aspect-square ${innerSquareRadiusClass} bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 p-2 xs:p-2.5 sm:p-4 flex flex-col justify-between items-center text-center group hover:shadow-md hover:border-sky-300 dark:hover:border-sky-600 transition-all select-none overflow-hidden relative`}
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
                </div>
              </div>

              {/* 3. Card Saldo Dompet - Sitting cleanly outside the banner */}
              <div className="mt-8 sm:mt-10">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-700 dark:text-slate-200">
                    Saldo Dompet
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('kelola')}
                    className="text-[11px] font-bold text-black dark:text-white hover:text-slate-700 dark:hover:text-slate-200 hover:underline flex items-center gap-1 transition-colors cursor-pointer group"
                    title="Buka Menu Kelola Dompet"
                  >
                    <span className="text-black dark:text-white font-bold">Kelola Dompet</span>
                    <ChevronRight className="w-3.5 h-3.5 text-black dark:text-white transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {wallets.map((w: any, idx: number) => {
                    const balanceVal = w.currentBalance ?? w.initialBalance;
                    const patternIndex = idx % 4;
                    
                    let patternId = `batik-pattern-${w.id}`;
                    let patternMarkup = null;

                    if (patternIndex === 0) {
                      // Batik Parang (Wavy S-Curves)
                      patternMarkup = (
                        <pattern id={patternId} width="40" height="80" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
                          <path d="M 0,0 C 10,10 30,10 40,20 C 40,30 20,30 10,40 C 0,50 20,50 30,60 C 30,70 10,70 0,80" fill="none" stroke="currentColor" strokeWidth="1.8" />
                          <path d="M 40,0 C 30,10 10,10 0,20 C 0,30 20,30 30,40 C 40,50 20,50 10,60 C 10,70 30,70 40,80" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
                          <polygon points="20,15 25,20 20,25 15,20" fill="currentColor" />
                          <polygon points="20,55 25,60 20,65 15,60" fill="currentColor" />
                          <circle cx="20" cy="30" r="1.5" fill="currentColor" />
                          <circle cx="20" cy="70" r="1.5" fill="currentColor" />
                        </pattern>
                      );
                    } else if (patternIndex === 1) {
                      // Batik Kawung (Concentric Circle Petals)
                      patternMarkup = (
                        <pattern id={patternId} width="50" height="50" patternUnits="userSpaceOnUse">
                          <circle cx="25" cy="25" r="12.5" fill="none" stroke="currentColor" strokeWidth="0.8" />
                          <circle cx="0" cy="25" r="12.5" fill="none" stroke="currentColor" strokeWidth="0.8" />
                          <circle cx="50" cy="25" r="12.5" fill="none" stroke="currentColor" strokeWidth="0.8" />
                          <circle cx="25" cy="0" r="12.5" fill="none" stroke="currentColor" strokeWidth="0.8" />
                          <circle cx="25" cy="50" r="12.5" fill="none" stroke="currentColor" strokeWidth="0.8" />
                          <path d="M 25,12.5 A 12.5,12.5 0 0,1 25,37.5 A 12.5,12.5 0 0,1 25,12.5" fill="none" stroke="currentColor" strokeWidth="0.5" />
                          <path d="M 12.5,25 A 12.5,12.5 0 0,1 37.5,25 A 12.5,12.5 0 0,1 12.5,25" fill="none" stroke="currentColor" strokeWidth="0.5" />
                          <circle cx="25" cy="25" r="1.5" fill="currentColor" />
                        </pattern>
                      );
                    } else if (patternIndex === 2) {
                      // Batik Megamendung (Cloud Waves)
                      patternMarkup = (
                        <pattern id={patternId} width="60" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 0,20 Q 15,5 30,20 T 60,20" fill="none" stroke="currentColor" strokeWidth="1.2" />
                          <path d="M 0,25 Q 15,12 30,25 T 60,25" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.7" />
                          <path d="M 0,30 Q 15,19 30,30 T 60,30" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
                          <circle cx="30" cy="20" r="1.5" fill="currentColor" />
                        </pattern>
                      );
                    } else {
                      // Batik Sekar Jagad (Geometric Network Mesh)
                      patternMarkup = (
                        <pattern id={patternId} width="45" height="45" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
                          <path d="M 0,0 C 11.25,11.25 11.25,33.75 0,45" fill="none" stroke="currentColor" strokeWidth="0.8" />
                          <path d="M 45,0 C 33.75,11.25 33.75,33.75 45,45" fill="none" stroke="currentColor" strokeWidth="0.8" />
                          <path d="M 0,0 C 11.25,11.25 33.75,11.25 45,0" fill="none" stroke="currentColor" strokeWidth="0.8" />
                          <path d="M 0,45 C 11.25,33.75 33.75,33.75 45,45" fill="none" stroke="currentColor" strokeWidth="0.8" />
                          <circle cx="22.5" cy="22.5" r="2" fill="currentColor" />
                          <circle cx="11.25" cy="11.25" r="1" fill="currentColor" />
                          <circle cx="33.75" cy="11.25" r="1" fill="currentColor" />
                        </pattern>
                      );
                    }

                    const cardColor = w.color || '#3b82f6';
                    
                    // Solid, crisp elevated card inside navy banner
                    let cardBgClass = "bg-white dark:bg-slate-900 ";
                    let cardBorderClass = "border border-white/30 dark:border-slate-800 ";
                    let cardShadowClass = "shadow-lg hover:shadow-xl ";

                    if (settings?.uiStyle === 'glass') {
                      cardBgClass = "bg-white/95 dark:bg-slate-900/90 backdrop-blur-md ";
                      cardBorderClass = "border border-white/60 dark:border-slate-800/80 ";
                      cardShadowClass = "shadow-[0_12px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.3)] ";
                    } else if (settings?.uiStyle === 'minimal') {
                      cardBgClass = "bg-white dark:bg-slate-900 ";
                      cardBorderClass = "border border-slate-200 dark:border-slate-800 ";
                      cardShadowClass = "shadow-md ";
                    }

                    let cardRadiusClass = "rounded-[22px] ";
                    if (settings?.cardRadius === 'sharp') {
                      cardRadiusClass = "rounded-none ";
                    } else if (settings?.cardRadius === 'extra') {
                      cardRadiusClass = "rounded-[28px] ";
                    }

                    return (
                      <div 
                        key={w.id} 
                        className={`${cardBgClass} ${cardBorderClass} ${cardShadowClass} ${cardRadiusClass} p-4 sm:p-5 text-slate-800 dark:text-white relative overflow-hidden hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex flex-col justify-between h-[195px] sm:h-[210px] select-none col-span-1`}
                      >
                        {/* SVG Batik Pattern overlay styled with the wallet's specific custom color */}
                        <div 
                          className="absolute inset-0 opacity-[0.08] dark:opacity-[0.14] pointer-events-none mix-blend-multiply dark:mix-blend-overlay"
                          style={{ color: cardColor }}
                        >
                          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                              {patternMarkup}
                            </defs>
                            <rect width="100%" height="100%" fill={`url(#${patternId})`} />
                          </svg>
                        </div>

                        {/* Subtle radial sheen overlay for premium matte finish */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-slate-100/10 to-white/20 pointer-events-none" />

                        {/* Card Top: Small Active Dot & Wallet Icon */}
                        <div className="flex justify-between items-start relative z-10">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.15)] animate-pulse" style={{ backgroundColor: cardColor }} />
                            <span className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                              Aktif
                            </span>
                          </div>

                          {/* Colored Circle with Wallet Icon using original wallet color */}
                          <div 
                            className="w-7 h-7 rounded-full flex items-center justify-center border shadow-3xs"
                            style={{ 
                              backgroundColor: `${cardColor}12`,
                              borderColor: `${cardColor}30`,
                              color: cardColor
                            }}
                          >
                            <IconRenderer name={w.icon} className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        {/* Card Middle: Wallet Name & Direct Balance */}
                        <div className="my-auto relative z-10 py-1">
                          <span className="text-[9px] font-black tracking-[0.12em] text-slate-400 dark:text-slate-500 uppercase block mb-1">
                            {w.name}
                          </span>
                          <span className="font-mono font-black tracking-tight text-slate-800 dark:text-white select-all block break-all leading-tight text-sm sm:text-base">
                            {showHideBalance ? '••••••••' : formatIDR(balanceVal)}
                          </span>
                        </div>

                        {/* Card Bottom: Wi-Fi Waves & Overlapping Spheres Logo in original wallet color */}
                        <div className="flex justify-between items-end relative z-10">
                          <div className="flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-90" style={{ color: `${cardColor}aa` }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>

                          {/* Dual overlapping spheres themed with the original wallet color */}
                          <div className="flex -space-x-1.5 shrink-0">
                            <div 
                              className="w-4.5 h-4.5 rounded-full opacity-65 shadow-3xs" 
                              style={{ backgroundColor: cardColor }}
                            />
                            <div className="w-4.5 h-4.5 rounded-full bg-slate-200 dark:bg-slate-700 opacity-40 shadow-3xs" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Row 3: Secondary Insights Tables */}
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

    </div>
  );
};
