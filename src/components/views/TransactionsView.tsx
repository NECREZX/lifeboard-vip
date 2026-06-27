/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, Filter, Trash2, Edit2, PlusCircle } from 'lucide-react';
import { Transaction, Wallet, Category, IncomeSource } from '../../types';
import { IconRenderer } from '../IconRenderer';
import { formatIDR } from '../../lib/formatters';

interface TransactionsViewProps {
  transactions: Transaction[];
  wallets: Wallet[];
  categories: Category[];
  sources: IncomeSource[];
  txTypeFilter: 'semua' | 'pemasukan' | 'pengeluaran';
  setTxTypeFilter: (val: 'semua' | 'pemasukan' | 'pengeluaran') => void;
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

  return (
    <div className="flex flex-col gap-5" id="view-transactions">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">Transaksi Keuangan</h1>
      </div>

      <div className={getCardClasses() + " p-5 flex flex-col gap-5"}>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={txSearch}
              onChange={(e) => setTxSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
            <button
              onClick={() => setTxTypeFilter('semua')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${txTypeFilter === 'semua' ? 'bg-slate-900 text-white dark:bg-indigo-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
            >
              Semua
            </button>
            <button
              onClick={() => setTxTypeFilter('pemasukan')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${txTypeFilter === 'pemasukan' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
            >
              Pemasukan
            </button>
            <button
              onClick={() => setTxTypeFilter('pengeluaran')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${txTypeFilter === 'pengeluaran' ? 'bg-rose-500 text-white shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
            >
              Pengeluaran
            </button>
          </div>

          <select
            value={txWalletFilter}
            onChange={(e) => setTxWalletFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none w-full md:w-auto"
          >
            <option value="semua">Semua Dompet</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>

          <select
            value={txCategoryFilter}
            onChange={(e) => setTxCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none w-full md:w-auto"
          >
            <option value="semua">Semua Kategori & Sumber</option>
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

        <div className="flex flex-col md:flex-row gap-3 items-center w-full pt-3 border-t border-slate-100 dark:border-slate-800/60">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 self-start md:self-auto shrink-0 md:mr-2 pt-1 md:pt-0">
            Filter Waktu:
          </div>
          
          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Tanggal:</span>
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
              className="px-2 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none w-full md:w-auto"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Bulan:</span>
            <select
              value={txMonthFilter}
              onChange={(e) => {
                setTxMonthFilter(e.target.value);
                if (e.target.value) {
                  setTxDateFilter('');
                }
              }}
              disabled={!!txDateFilter}
              className="px-2 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none disabled:opacity-50 w-full md:w-auto"
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
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Tahun:</span>
            <select
              value={txYearFilter}
              onChange={(e) => {
                setTxYearFilter(e.target.value);
                if (e.target.value) {
                  setTxDateFilter('');
                }
              }}
              disabled={!!txDateFilter}
              className="px-2 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none disabled:opacity-50 w-full md:w-auto"
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

          {(txDateFilter || txMonthFilter || txYearFilter) && (
            <button
              onClick={() => {
                setTxDateFilter('');
                setTxMonthFilter('');
                setTxYearFilter('');
              }}
              className="text-[10px] text-rose-500 hover:text-rose-600 font-bold uppercase tracking-wider px-2 py-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition ml-auto"
            >
              Bersihkan Filter Waktu
            </button>
          )}
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
            <div className="overflow-x-auto">
              <table className={getTableClasses()}>
                <thead className="bg-slate-50 dark:bg-slate-900/80 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className={getTableRowPadding()}>Deskripsi</th>
                    <th className={getTableRowPadding()}>Tipe</th>
                    <th className={getTableRowPadding()}>Dompet</th>
                    <th className={getTableRowPadding()}>Kategori/Aliran</th>
                    <th className={getTableRowPadding()}>Tanggal</th>
                    <th className={getTableRowPadding()}>Jumlah</th>
                    <th className={getTableRowPadding() + " text-right"}>Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sortedDates.map((dateStr) => {
                    const dateTxs = groupedByDate[dateStr];
                    const formattedDate = new Date(dateStr).toLocaleDateString('id-ID', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                    });
                    return (
                      <React.Fragment key={dateStr}>
                        <tr className="bg-slate-50/50 dark:bg-slate-900/40 select-none border-y border-slate-100/80 dark:border-slate-800/80">
                          <td colSpan={7} className="px-4 py-2 text-xs font-bold text-indigo-600 dark:text-cyan-400 font-mono tracking-tight">
                            {formattedDate} ({dateTxs.length} Transaksi)
                          </td>
                        </tr>
                        {dateTxs.map((t, idx) => {
                          const wallet = wallets.find((w) => w.id === t.walletId);
                          const isIncome = t.type === 'pemasukan';
                          const catName = isIncome 
                            ? sources.find(s => s.id === t.sourceId)
                            : categories.find(c => c.id === t.categoryId);
                          return (
                            <tr key={t.id} className={getTableRowClasses(idx)}>
                              <td className={getTableRowPadding() + " font-semibold text-slate-800 dark:text-slate-200"}>{t.description}</td>
                              <td className={getTableRowPadding()}>
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isIncome ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-500 dark:bg-rose-950/20 dark:text-rose-400'}`}>
                                  {t.type}
                                </span>
                              </td>
                              <td className={getTableRowPadding() + " text-slate-500 dark:text-slate-400 font-medium"}>
                                <span className="flex items-center gap-1.5">
                                  {wallet?.icon && <IconRenderer name={wallet.icon} className="w-3.5 h-3.5" />}
                                  <span>{wallet?.name || 'Dompet Terhapus'}</span>
                                </span>
                              </td>
                              <td className={getTableRowPadding() + " text-slate-500 dark:text-slate-400 font-medium"}>
                                <span className="flex items-center gap-1.5">
                                  {catName?.icon && <IconRenderer name={catName.icon} className="w-3.5 h-3.5" />}
                                  <span>{catName?.name || 'Kustom'}</span>
                                </span>
                              </td>
                              <td className={getTableRowPadding() + " font-mono text-slate-400 dark:text-slate-300"}>
                                {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td className={getTableRowPadding() + ` font-mono font-bold ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {isIncome ? '+' : '-'}{formatIDR(t.amount)}
                              </td>
                              <td className={getTableRowPadding() + " text-right"}>
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
            {filteredTransactions.length > 5 && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20">
                <button
                  onClick={() => setShowAllTransactions(!showAllTransactions)}
                  className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition uppercase tracking-widest"
                >
                  {showAllTransactions ? 'Sembunyikan Sebagian' : `Lihat Semua (${filteredTransactions.length})`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
