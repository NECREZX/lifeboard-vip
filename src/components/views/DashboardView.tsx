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
  setActiveTab
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
        {/* Main Balance Banner Card */}
        <div className="p-6 rounded-2xl text-white bg-gradient-to-br from-cyan-400 via-teal-500 to-rose-500 shadow-xl flex flex-col justify-between min-h-[160px] relative overflow-hidden group transition-all duration-300 border-0">
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition duration-500" />
          <div className="absolute -left-6 -top-6 w-24 h-24 bg-cyan-300/30 rounded-full blur-xl" />
          
          {/* Header Row */}
          <div className="flex items-center justify-between relative z-10 gap-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-white drop-shadow-md block">TOTAL SALDO UTAMA</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleHideBalance}
                title={showHideBalance ? "Tampilkan Saldo Utama" : "Sembunyikan Saldo Utama"}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 transition flex items-center justify-center text-white focus:outline-none shadow-sm cursor-pointer"
              >
                {showHideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/40 text-white">
                <LayoutDashboard className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Amount Display */}
          <div className="my-2 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono text-white drop-shadow-md">
              {showHideBalance ? '••••••••' : formatIDR(activeDisplaySaldo)}
            </h2>
          </div>

          {/* Bottom Row: Option Toggle Switch */}
          <div className="pt-2 border-t border-white/20 relative z-10 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setIncludeAdminFee(prev => !prev)}
              className="group flex items-center justify-between gap-3 px-3.5 py-1.5 rounded-full bg-black/25 hover:bg-black/35 backdrop-blur-md border border-white/30 transition-all cursor-pointer select-none"
              title={includeAdminFee ? "Termasuk Biaya Admin (Klik untuk ubah)" : "Tanpa Biaya Admin (Klik untuk ubah)"}
            >
              <span className="text-[10.5px] font-bold text-white transition-colors text-left min-w-[125px] sm:min-w-[130px]">
                {includeAdminFee ? 'Termasuk Biaya Admin' : 'Tanpa Biaya Admin'}
              </span>
              
              {/* Glossy 3D Toggle Switch with consistent track styling */}
              <div
                className={`relative w-9 h-5 rounded-full p-0.5 transition-all duration-300 ease-in-out shadow-inner border border-white/30 ${
                  includeAdminFee
                    ? 'bg-white/30'
                    : 'bg-white/15'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-gradient-to-b from-white via-slate-50 to-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.35)] transform transition-transform duration-300 ease-in-out ${
                    includeAdminFee ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
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
            <div className="absolute -left-7 -bottom-7 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-amber-100/60 dark:bg-amber-950/40 pointer-events-none group-hover:scale-105 transition-transform duration-300 z-0" />

            <div className="z-10 relative w-full text-center flex flex-col items-center justify-center px-6">
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-mono">
                {showHideBalance ? '••••••••' : formatIDR(totalTransferAdminFees)}
              </h3>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400 mt-1 uppercase tracking-wider">
                Biaya Admin Transfer
              </p>
            </div>

            {/* Top-right circle bubble with icon */}
            <div className="absolute -right-7 -top-7 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-amber-100/80 dark:bg-amber-950/50 flex items-center justify-center pointer-events-none group-hover:scale-105 transition-transform duration-300 z-0">
              <div className="-translate-x-2 translate-y-2 text-amber-600 dark:text-amber-400">
                <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Individual Wallets (Dompet Saya) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Saldo Dompet</h3>
          <button onClick={() => setActiveTab('kelola')} className="text-[10px] font-bold text-indigo-500 hover:underline">Kelola Dompet</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {wallets.map((w: any) => (
            <div key={w.id} className={getCardClasses() + " p-4 min-h-[90px] relative overflow-hidden flex items-center justify-between group"}>
              {/* Left-side vertical color indicator line */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: w.color || '#10b981' }} />
              
              <div className="z-10 pl-2.5 w-full flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-5 h-5 rounded-md flex items-center justify-center text-xs shrink-0"
                    style={{ backgroundColor: `${w.color || '#10b981'}25`, color: w.color || '#10b981' }}
                  >
                    <IconRenderer name={w.icon} className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">{w.name}</h4>
                </div>
                <p className="text-xs sm:text-sm font-black font-mono text-slate-900 dark:text-slate-100 mt-1.5">
                  {showHideBalance ? '••••••••' : formatIDR(w.currentBalance)}
                </p>
              </div>
            </div>
          ))}
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
                   <td className={`py-2 text-right font-bold ${a.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`}>{a.status === 'completed' ? 'Selesai' : 'Pending'}</td>
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
