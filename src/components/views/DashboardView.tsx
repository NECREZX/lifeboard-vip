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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl text-white bg-gradient-to-br from-cyan-400 via-teal-500 to-rose-500 shadow-xl flex flex-col justify-between min-h-[140px] relative overflow-hidden group hover:scale-[1.01] transition-all duration-300 border-0">
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition duration-500" />
          <div className="absolute -left-6 -top-6 w-24 h-24 bg-cyan-300/30 rounded-full blur-xl" />
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-white drop-shadow-md block">TOTAL SALDO UTAMA</span>
            </div>
            <div className="p-2 rounded-lg bg-white/30 backdrop-blur-md border border-white/50">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="my-2 relative z-10">
            <h2 className="text-2xl font-extrabold tracking-tight font-mono text-white dark:text-white drop-shadow-md">{formatIDR(totalSaldoUtama)}</h2>
          </div>
          <div className="flex items-center justify-between text-[10px] pt-2 border-t border-white/20 relative z-10">
            <span className="font-bold opacity-80">Terakumulasi dari semua dompet</span>
            <button onClick={() => setActiveTab('kelola')} className="font-black underline decoration-2 underline-offset-4 hover:text-white transition">Detail</button>
          </div>
        </div>

        <div className={getCardClasses() + " p-5 flex flex-col justify-between min-h-[140px]"}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Total Pendapatan</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-500"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-emerald-500 tracking-tight font-mono">{formatIDR(totalIncome)}</h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Pemasukan</span>
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
            </div>
          </div>
        </div>

        <div className={getCardClasses() + " p-5 flex flex-col justify-between min-h-[140px]"}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Total Pengeluaran</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-rose-500"><TrendingDown className="w-4 h-4" /></div>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-rose-500 tracking-tight font-mono">{formatIDR(totalExpense)}</h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Pengeluaran</span>
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Individual Wallets (Dompet Saya) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Dompet Saya</h3>
          <button onClick={() => setActiveTab('kelola')} className="text-[10px] font-bold text-indigo-500 hover:underline">Kelola Dompet</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {wallets.map((w: any) => (
            <div key={w.id} className={getCardClasses() + " p-4 flex flex-col gap-2 group relative overflow-hidden"}>
              <div className="flex items-center justify-between">
                <div className={`w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs shadow-sm`}>
                  <IconRenderer name={w.icon} className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </div>
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate">{w.name}</h4>
                <p className="text-sm font-black font-mono text-slate-900 dark:text-slate-100 mt-0.5">{formatIDR(w.currentBalance)}</p>
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
             <button onClick={() => setActiveTab('budgeting')} className="text-[10px] font-bold text-indigo-500 hover:underline">Lihat Semua</button>
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
