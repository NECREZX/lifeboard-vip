/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  Wallet as WalletIcon 
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

      <div className="flex flex-col gap-0.5 mb-6">
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">Hai, {profileName}</h1>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Selamat Datang di Lifeboard</p>
      </div>

      {/* Row 1: Primary Metrics */}
      <div className="flex flex-col gap-4">
        {/* Main Balance Banner Card - Redesigned to a High-Tech Platinum Smart Card */}
        <div className={`p-6 rounded-3xl ${
          settings?.uiStyle === 'glass'
            ? 'glass-panel bg-white/75 dark:bg-slate-900/60'
            : 'bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 text-white'
        } border border-white/60 dark:border-slate-800/80 shadow-xl flex flex-col justify-between min-h-[195px] relative overflow-hidden group hover:shadow-[0_20px_50px_-15px_rgba(99,102,241,0.2)] hover:-translate-y-0.5 transition-all duration-500`}>
          
          {/* Wave Lines Background Mesh */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.06] dark:opacity-[0.12] pointer-events-none scale-105 group-hover:scale-110 transition-transform duration-700" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 Q25,30 50,50 T100,50" fill="none" stroke="currentColor" strokeWidth="0.5" className={settings?.uiStyle === 'glass' ? 'text-indigo-500 dark:text-indigo-400' : 'text-cyan-400'} />
            <path d="M0,65 Q25,45 50,65 T100,65" fill="none" stroke="currentColor" strokeWidth="0.5" className={settings?.uiStyle === 'glass' ? 'text-indigo-500 dark:text-indigo-400' : 'text-cyan-400'} />
            <path d="M0,35 Q25,15 50,35 T100,35" fill="none" stroke="currentColor" strokeWidth="0.5" className={settings?.uiStyle === 'glass' ? 'text-indigo-500 dark:text-indigo-400' : 'text-cyan-400'} />
          </svg>

          {/* Top-right blur highlights */}
          <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-8 -top-8 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />

          {/* Header Row: Chip only */}
          <div className="flex items-start justify-between relative z-10 gap-2">
            <div className="flex items-center gap-3">
              {/* Gold Smart Card Chip */}
              <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 p-[1.2px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_1.5px_3px_rgba(0,0,0,0.12)] relative overflow-hidden shrink-0">
                <div className="w-full h-full border border-black/10 rounded-sm grid grid-cols-3 grid-rows-3 opacity-80">
                  <div className="border-r border-b border-black/15"></div>
                  <div className="border-r border-b border-black/15"></div>
                  <div className="border-b border-black/15"></div>
                  <div className="border-r border-b border-black/15"></div>
                  <div className="border-r border-b border-black/15"></div>
                  <div className="border-b border-black/15"></div>
                  <div className="border-r border-black/15"></div>
                  <div className="border-r border-black/15"></div>
                  <div></div>
                </div>
                <div className="absolute inset-x-2.5 top-0 bottom-0 border-l border-r border-black/10 pointer-events-none"></div>
              </div>
            </div>

            <div className="text-right">
              {/* Removed brand watermark as requested */}
            </div>
          </div>

          {/* Middle Row: Balance Display with custom actions */}
          <div className="my-3.5 relative z-10 flex flex-col gap-1">
            <span className={`text-[8px] font-black tracking-[0.15em] ${settings?.uiStyle === 'glass' ? 'text-slate-400 dark:text-slate-500' : 'text-white/60'} uppercase block`}>TOTAL SALDO UTAMA</span>
            <div className="flex items-center justify-between gap-4">
              <h2 className={`text-2xl sm:text-3xl font-black tracking-wider font-mono ${settings?.uiStyle === 'glass' ? 'text-slate-800 dark:text-slate-100' : 'text-white'} drop-shadow-sm`}>
                {showHideBalance ? '••••••••' : formatIDR(activeDisplaySaldo)}
              </h2>

              {/* Security Button */}
              <button
                type="button"
                onClick={toggleHideBalance}
                title={showHideBalance ? "Tampilkan Saldo Utama" : "Sembunyikan Saldo Utama"}
                className={`p-1.5 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95 ${
                  settings?.uiStyle === 'glass'
                    ? 'bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                {showHideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Bottom Row: Switch only */}
          <div className={`pt-3.5 border-t ${
            settings?.uiStyle === 'glass' ? 'border-slate-150 dark:border-slate-800/80' : 'border-white/15'
          } relative z-10 flex items-center justify-end gap-3`}>
            {/* Left side empty for minimalistic look */}
            <div className="mr-auto"></div>

            {/* Smart Toggle Switch inside Card */}
            <button
              type="button"
              onClick={() => setIncludeAdminFee(prev => !prev)}
              className={`group flex items-center gap-2 px-2.5 py-1 rounded-full border transition-all cursor-pointer select-none active:scale-95 ${
                settings?.uiStyle === 'glass'
                  ? 'bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700/90 border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300'
                  : 'bg-black/20 hover:bg-black/30 border-white/15 text-white'
              }`}
              title={includeAdminFee ? "Termasuk Biaya Admin (Klik untuk ubah)" : "Tanpa Biaya Admin (Klik untuk ubah)"}
            >
              <span className={`text-[9px] font-bold uppercase tracking-wide min-w-[95px] sm:min-w-[105px] text-left shrink-0 ${
                settings?.uiStyle === 'glass' ? 'text-slate-600 dark:text-slate-400' : 'text-white'
              }`}>
                {includeAdminFee ? 'Termasuk Admin' : 'Tanpa Admin'}
              </span>

              {/* Glossy Toggle Track */}
              <div className={`relative w-8 h-4 rounded-full p-0.5 transition-all duration-300 ease-in-out border ${
                includeAdminFee
                  ? (settings?.uiStyle === 'glass' ? 'bg-indigo-500/25 border-indigo-500/35' : 'bg-cyan-500/25 border-cyan-500/35')
                  : 'bg-slate-300/35 border-transparent'
              }`}>
                <div className={`w-3 h-3 rounded-full transform transition-transform duration-300 ease-in-out shadow-sm ${
                  includeAdminFee
                    ? `translate-x-3.5 ${settings?.uiStyle === 'glass' ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-cyan-400'}`
                    : 'bg-slate-400 dark:bg-slate-500'
                }`} />
              </div>
            </button>
          </div>
        </div>

        {/* Secondary Metrics: 3 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Total Pendapatan */}
          <div className={getCardClasses() + " p-5 sm:p-6 min-h-[110px] relative overflow-hidden flex items-center justify-center group"}>
            {/* Bottom-left circle bubble */}
            <div className="absolute -left-7 -bottom-7 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-emerald-100/60 dark:bg-emerald-950/40 pointer-events-none group-hover:scale-105 transition-transform duration-300 z-0" />
            
            <div className="z-10 relative w-full text-center flex flex-col items-center justify-center px-6">
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-mono">
                {showHideBalance ? '••••••••' : formatIDR(totalIncome)}
              </h3>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400 mt-1 uppercase tracking-wider">
                Total Pendapatan
              </p>
            </div>

            {/* Top-right circle bubble with icon */}
            <div className="absolute -right-7 -top-7 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-emerald-100/80 dark:bg-emerald-950/50 flex items-center justify-center pointer-events-none group-hover:scale-105 transition-transform duration-300 z-0">
              <div className="-translate-x-2 translate-y-2 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          {/* Card 2: Total Pengeluaran */}
          <div className={getCardClasses() + " p-5 sm:p-6 min-h-[110px] relative overflow-hidden flex items-center justify-center group"}>
            {/* Bottom-left circle bubble */}
            <div className="absolute -left-7 -bottom-7 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-rose-100/60 dark:bg-rose-950/40 pointer-events-none group-hover:scale-105 transition-transform duration-300 z-0" />

            <div className="z-10 relative w-full text-center flex flex-col items-center justify-center px-6">
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-mono">
                {showHideBalance ? '••••••••' : formatIDR(totalExpense)}
              </h3>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400 mt-1 uppercase tracking-wider">
                Total Pengeluaran
              </p>
            </div>

            {/* Top-right circle bubble with icon */}
            <div className="absolute -right-7 -top-7 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-rose-100/80 dark:bg-rose-950/50 flex items-center justify-center pointer-events-none group-hover:scale-105 transition-transform duration-300 z-0">
              <div className="-translate-x-2 translate-y-2 text-rose-600 dark:text-rose-400">
                <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          {/* Card 3: Biaya Admin Transfer */}
          <div className={getCardClasses() + " p-5 sm:p-6 min-h-[110px] relative overflow-hidden flex items-center justify-center group"}>
            {/* Bottom-left circle bubble */}
            <div className="absolute -left-7 -bottom-7 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-sky-100/60 dark:bg-sky-950/40 pointer-events-none group-hover:scale-105 transition-transform duration-300 z-0" />

            <div className="z-10 relative w-full text-center flex flex-col items-center justify-center px-6">
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-mono">
                {showHideBalance ? '••••••••' : formatIDR(totalTransferAdminFees)}
              </h3>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400 mt-1 uppercase tracking-wider">
                Biaya Admin Transfer
              </p>
            </div>

            {/* Top-right circle bubble with icon */}
            <div className="absolute -right-7 -top-7 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-sky-100/80 dark:bg-sky-950/50 flex items-center justify-center pointer-events-none group-hover:scale-105 transition-transform duration-300 z-0">
              <div className="-translate-x-2 translate-y-2 text-sky-600 dark:text-sky-400">
                <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Premium Bento Grid Batik White ATM Cards with Direct Balances */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Saldo Rekening</h3>
          <button onClick={() => setActiveTab('kelola')} className="text-[10px] font-black uppercase tracking-wider text-indigo-500 hover:underline">Kelola Dompet</button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 grid-flow-row-dense gap-4">
          {wallets.map((w: any, idx: number) => {
            const isExpanded = w.id === expandedWalletId;
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
            
            // Get Card Style & Border Radius dynamically
            let cardBgClass = "bg-white dark:bg-slate-900 ";
            let cardBorderClass = "border border-slate-100 dark:border-slate-800/40 ";
            let cardShadowClass = "shadow-sm hover:shadow-md ";

            if (settings?.uiStyle === 'glass') {
              cardBgClass = "bg-white/45 dark:bg-slate-900/45 backdrop-blur-md ";
              cardBorderClass = "border border-white/30 dark:border-slate-800/50 ";
              cardShadowClass = "shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.15)] ";
            } else if (settings?.uiStyle === 'minimal') {
              cardBgClass = "bg-slate-50/50 dark:bg-slate-950/20 ";
              cardBorderClass = "border border-slate-150 dark:border-slate-800/60 ";
              cardShadowClass = "shadow-none ";
            }

            let cardRadiusClass = "rounded-[24px] ";
            if (settings?.cardRadius === 'sharp') {
              cardRadiusClass = "rounded-none ";
            } else if (settings?.cardRadius === 'extra') {
              cardRadiusClass = "rounded-[32px] ";
            }

             return (
              <div 
                key={w.id} 
                onClick={() => setExpandedWalletId(prev => prev === w.id ? null : w.id)}
                className={`${cardBgClass} ${cardBorderClass} ${cardShadowClass} ${cardRadiusClass} p-5 text-slate-800 dark:text-white relative overflow-hidden hover:scale-[1.01] active:scale-[0.99] transition-all duration-500 ease-in-out flex flex-col justify-between h-[210px] sm:h-[230px] select-none cursor-pointer ${isExpanded ? 'col-span-2' : 'col-span-1'}`}
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
                      {isExpanded ? 'Rekening Utama' : 'Aktif'}
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
                  <span className={`font-mono font-black tracking-tight text-slate-800 dark:text-white select-all block break-all leading-tight transition-all duration-300 ${
                    isExpanded ? 'text-xl sm:text-2xl' : 'text-sm sm:text-base'
                  }`}>
                    {showHideBalance ? '••••••••' : formatIDR(balanceVal)}
                  </span>
                </div>

                {/* Card Bottom: Wi-Fi Waves & Overlapping Spheres Logo in original wallet color */}
                <div className="flex justify-between items-end relative z-10">
                  <div className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-90" style={{ color: `${cardColor}aa` }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {isExpanded && (
                      <span className="text-[7px] font-black text-slate-400 dark:text-slate-500 tracking-wider uppercase animate-fade-in">
                        PAYMENT SYSTEM
                      </span>
                    )}
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
                   <td className={`py-2 text-right font-bold ${a.status === 'completed' ? 'text-emerald-500' : 'text-sky-500'}`}>{a.status === 'completed' ? 'Selesai' : 'Pending'}</td>
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
