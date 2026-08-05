/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, Filter, Trash2, Edit2, PlusCircle, X, Calendar, Wallet as WalletIcon, Tag, RotateCcw, SlidersHorizontal, ChevronUp, ChevronDown } from 'lucide-react';
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
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">Transaksi Keuangan</h1>
        {activeFilterCount > 0 && (
          <button
            onClick={handleResetAllFilters}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-xl border border-rose-200/60 dark:border-rose-900/50 transition-all hover:scale-[1.02]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset {activeFilterCount} Filter</span>
          </button>
        )}
      </div>

      {/* Filter Panel */}
      <div className={`${getCardClasses()} p-4 md:p-5 flex flex-col gap-4`}>
        {/* Top Controls Header */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
            <input
              type="text"
              placeholder="Cari transaksi berdasarkan judul..."
              value={txSearch}
              onChange={(e) => setTxSearch(e.target.value)}
              className={`w-full pl-10 pr-9 py-2 text-xs font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                uiStyle === 'glass' 
                  ? 'glass-input text-slate-800 dark:text-slate-100' 
                  : 'border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100'
              }`}
            />
            {txSearch && (
              <button
                onClick={() => setTxSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition z-10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter Pills */}
          <div className={`grid grid-cols-4 w-full gap-1 p-1 rounded-2xl transition-all ${
            uiStyle === 'glass' 
              ? 'bg-black/5 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-inner' 
              : 'bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800'
          }`}>
            <button
              onClick={() => setTxTypeFilter('semua')}
              className={`py-1.5 px-1 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 text-center truncate ${
                txTypeFilter === 'semua'
                  ? (uiStyle === 'glass' 
                      ? 'bg-white/85 dark:bg-white/20 text-slate-950 dark:text-white font-black shadow-[0_4px_12px_rgba(0,0,0,0.1),inset_0_1px_1.5px_rgba(255,255,255,0.9)] border border-white dark:border-white/30 backdrop-blur-md scale-[1.02]' 
                      : 'bg-slate-900 text-white dark:bg-indigo-600 shadow-sm')
                  : (uiStyle === 'glass'
                      ? 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60')
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setTxTypeFilter('pemasukan')}
              className={`py-1.5 px-1 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 text-center truncate ${
                txTypeFilter === 'pemasukan'
                  ? (uiStyle === 'glass' 
                      ? 'bg-emerald-500/90 text-white font-black shadow-[0_4px_12px_rgba(16,185,129,0.3),inset_0_1px_1.5px_rgba(255,255,255,0.5)] border border-emerald-300/40 backdrop-blur-md scale-[1.02]'
                      : 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20')
                  : (uiStyle === 'glass'
                      ? 'text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-500/10'
                      : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40')
              }`}
            >
              Pemasukan
            </button>
            <button
              onClick={() => setTxTypeFilter('pengeluaran')}
              className={`py-1.5 px-1 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 text-center truncate ${
                txTypeFilter === 'pengeluaran'
                  ? (uiStyle === 'glass'
                      ? 'bg-rose-500/90 text-white font-black shadow-[0_4px_12px_rgba(244,63,94,0.3),inset_0_1px_1.5px_rgba(255,255,255,0.5)] border border-rose-300/40 backdrop-blur-md scale-[1.02]'
                      : 'bg-rose-500 text-white shadow-sm shadow-rose-500/20')
                  : (uiStyle === 'glass'
                      ? 'text-rose-700 dark:text-rose-300 font-bold hover:bg-rose-500/10'
                      : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40')
              }`}
            >
              Pengeluaran
            </button>
            <button
              onClick={() => setTxTypeFilter('transfer')}
              className={`py-1.5 px-1 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 text-center truncate ${
                txTypeFilter === 'transfer'
                  ? (uiStyle === 'glass'
                      ? 'bg-blue-500/90 text-white font-black shadow-[0_4px_12px_rgba(59,130,246,0.3),inset_0_1px_1.5px_rgba(255,255,255,0.5)] border border-blue-300/40 backdrop-blur-md scale-[1.02]'
                      : 'bg-blue-500 text-white shadow-sm shadow-blue-500/20')
                  : (uiStyle === 'glass'
                      ? 'text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-500/10'
                      : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40')
              }`}
            >
              Transfer
            </button>
          </div>
        </div>

        {/* Secondary Filter Row: Wallet & Category Selects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
          {/* Wallet Dropdown */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${
            uiStyle === 'glass' 
              ? 'glass-input' 
              : 'border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/60'
          }`}>
            <WalletIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0">Dompet:</span>
            <select
              value={txWalletFilter}
              onChange={(e) => setTxWalletFilter(e.target.value)}
              className="w-full text-xs font-semibold bg-transparent border-none text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer truncate"
            >
              <option value="semua" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium">Semua</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium">{w.name}</option>
              ))}
            </select>
          </div>

          {/* Category & Source Dropdown */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl sm:col-span-1 lg:col-span-1 transition-all ${
            uiStyle === 'glass' 
              ? 'glass-input' 
              : 'border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/60'
          }`}>
            <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0">Kategori:</span>
            <select
              value={txCategoryFilter}
              onChange={(e) => setTxCategoryFilter(e.target.value)}
              className="w-full text-xs font-semibold bg-transparent border-none text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer truncate"
            >
              <option value="semua" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium">Semua Kategori & Sumber</option>
              <optgroup label="Pengeluaran" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold">
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium">{c.name}</option>
                ))}
              </optgroup>
              <optgroup label="Pemasukan" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold">
                {sources.map((s) => (
                  <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium">{s.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Date Selector */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${
            uiStyle === 'glass' 
              ? 'glass-input' 
              : 'border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/60'
          }`}>
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0">Tanggal:</span>
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
              className="w-full text-xs font-semibold bg-transparent border-none text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            />
            {txDateFilter && (
              <button onClick={() => setTxDateFilter('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Month / Year Combo */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${
            uiStyle === 'glass' 
              ? 'glass-input' 
              : 'border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/60'
          }`}>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0">Bulan/Thn:</span>
            <select
              value={txMonthFilter}
              onChange={(e) => {
                setTxMonthFilter(e.target.value);
                if (e.target.value) {
                  setTxDateFilter('');
                }
              }}
              disabled={!!txDateFilter}
              className="w-full text-xs font-semibold bg-transparent border-none text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer disabled:opacity-40 truncate"
            >
              <option value="">Semua Bulan</option>
              <option value="01">Januari</option>
              <option value="02">Februari</option>
              <option value="03">Maret</option>
              <option value="04">April</option>
              <option value="05">Mei</option>
              <option value="06">Juni</option>
              <option value="07">Juli</option>
              <option value="08">Agustus</option>
              <option value="09">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
            <select
              value={txYearFilter}
              onChange={(e) => {
                setTxYearFilter(e.target.value);
                if (e.target.value) {
                  setTxDateFilter('');
                }
              }}
              disabled={!!txDateFilter}
              className="text-xs font-semibold bg-transparent border-none text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer disabled:opacity-40"
            >
              <option value="">Semua Tahun</option>
              {Array.from(new Set([
                '2024', '2025', '2026', '2027',
                ...transactions.map(t => t.date.split('-')[0]).filter(Boolean)
              ])).sort().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
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
              <table className={`${getTableClasses()} table-fixed min-w-[920px] w-full`}>
                <colgroup>
                  <col className="w-[160px]" />
                  <col className="w-[130px]" />
                  <col className="w-[150px]" />
                  <col className="w-[150px]" />
                  <col className="w-[110px]" />
                  <col className="w-[140px]" />
                  <col className="w-[80px]" />
                </colgroup>
                <thead className={`border-b text-[10px] font-bold uppercase tracking-wider transition-all ${
                  uiStyle === 'glass'
                    ? 'bg-white/40 dark:bg-slate-900/50 backdrop-blur-md border-white/30 dark:border-white/10 text-slate-700 dark:text-slate-300'
                    : 'bg-white dark:bg-slate-900/90 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  <tr>
                    <th className={getTableRowPadding()}>Deskripsi</th>
                    <th className={getTableRowPadding()}>Tipe</th>
                    <th className={getTableRowPadding()}>Dompet</th>
                    <th className={getTableRowPadding()}>Kategori/Aliran</th>
                    <th className={getTableRowPadding()}>Tanggal</th>
                    <th className={getTableRowPadding()}>Jumlah</th>
                    <th className={`${getTableRowPadding()} text-right`}>Aksi</th>
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
                          <td colSpan={7} className="px-4 py-2 text-xs font-bold text-indigo-600 dark:text-cyan-400 font-mono tracking-tight whitespace-nowrap">
                            {formattedDate} ({totalDateTxsCount} Transaksi)
                          </td>
                        </tr>
                        {dateTxs.map((t, idx) => {
                          const wallet = wallets.find((w) => w.id === t.walletId);
                          const toWallet = t.toWalletId ? wallets.find((w) => w.id === t.toWalletId) : null;
                          const isIncome = t.type === 'pemasukan';
                          const isTransfer = t.type === 'transfer';
                          const catName = isIncome 
                            ? sources.find(s => s.id === t.sourceId)
                            : (isTransfer ? null : categories.find(c => c.id === t.categoryId));
                          return (
                            <tr key={t.id} className={getTableRowClasses(idx)}>
                              <td className={getTableRowPadding() + " font-semibold text-slate-800 dark:text-slate-200 truncate"} title={t.description}>{t.description}</td>
                              <td className={getTableRowPadding() + " whitespace-nowrap"}>
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
                              <td className={getTableRowPadding() + " text-slate-500 dark:text-slate-400 font-medium truncate"} title={isTransfer ? `${wallet?.name || 'Dompet Terhapus'} → ${toWallet?.name || 'Dompet Terhapus'}` : (wallet?.name || 'Dompet Terhapus')}>
                                {isTransfer ? (
                                  <span className="flex items-center gap-1.5 text-[11px] truncate">
                                    <span className="truncate">{wallet?.name || 'Dompet Terhapus'}</span>
                                    <span className="text-slate-300 dark:text-slate-600 shrink-0">→</span>
                                    <span className="truncate">{toWallet?.name || 'Dompet Terhapus'}</span>
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5 truncate">
                                    {wallet?.icon && <IconRenderer name={wallet.icon} className="w-3.5 h-3.5 shrink-0" />}
                                    <span className="truncate">{wallet?.name || 'Dompet Terhapus'}</span>
                                  </span>
                                )}
                              </td>
                              <td className={getTableRowPadding() + " text-slate-500 dark:text-slate-400 font-medium truncate"} title={isTransfer ? 'Transfer Saldo' : (catName?.name || 'Kustom')}>
                                {isTransfer ? (
                                  <div className="flex flex-col truncate">
                                    <span className="text-slate-400 dark:text-slate-500 italic text-[11px] truncate">Transfer Saldo</span>
                                    {t.adminFee && t.adminFee > 0 ? (
                                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate">
                                        Biaya Admin: {formatIDR(t.adminFee)}
                                      </span>
                                    ) : null}
                                  </div>
                                ) : (
                                  <span className="flex items-center gap-1.5 truncate">
                                    {catName?.icon && <IconRenderer name={catName.icon} className="w-3.5 h-3.5 shrink-0" />}
                                    <span className="truncate">{catName?.name || 'Kustom'}</span>
                                  </span>
                                )}
                              </td>
                              <td className={getTableRowPadding() + " font-mono text-slate-400 dark:text-slate-300 whitespace-nowrap"}>
                                {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td className={getTableRowPadding() + ` font-mono font-bold whitespace-nowrap ${isIncome ? 'text-emerald-500' : (isTransfer ? 'text-blue-500' : 'text-rose-500')}`}>
                                <div className="flex flex-col">
                                  <span>{isIncome ? '+' : (isTransfer ? '⇄ ' : '-')}{formatIDR(t.amount)}</span>
                                  {isTransfer && t.adminFee && t.adminFee > 0 ? (
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                                      Keluar Asal: {formatIDR(t.amount + t.adminFee)}
                                    </span>
                                  ) : null}
                                </div>
                              </td>
                              <td className={getTableRowPadding() + " text-right whitespace-nowrap"}>
                                <div className="flex items-center justify-end gap-1">
                                  <button onClick={() => onEdit(t)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition inline-flex items-center">
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handleDeleteTransaction(t.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition inline-flex items-center">
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
    </div>
  );
};
