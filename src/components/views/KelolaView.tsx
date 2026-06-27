/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Wallet, Category, IncomeSource } from '../../types';
import { IconRenderer } from '../IconRenderer';
import { formatIDR } from '../../lib/formatters';

interface KelolaViewProps {
  walletsWithCurrentBalance: any[];
  categories: Category[];
  sources: IncomeSource[];
  getCardClasses: () => string;
  getAccentBg: () => string;
  startEditWallet: (w: Wallet) => void;
  handleDeleteWallet: (id: string) => void;
  startEditCategory: (c: Category) => void;
  handleDeleteCategory: (id: string) => void;
  startEditSource: (s: IncomeSource) => void;
  handleDeleteSource: (id: string) => void;
  walletEditId: string | null;
  walletFormName: string;
  setWalletFormName: (val: string) => void;
  walletFormBalance: string;
  setWalletFormBalance: (val: string) => void;
  walletFormIcon: string;
  setWalletFormIcon: (val: string) => void;
  handleSaveWallet: (e: React.FormEvent) => void;
  resetWalletForm: () => void;
  categoryEditId: string | null;
  categoryFormName: string;
  setCategoryFormName: (val: string) => void;
  categoryFormIcon: string;
  setCategoryFormIcon: (val: string) => void;
  handleSaveCategory: (e: React.FormEvent) => void;
  resetCategoryForm: () => void;
  sourceEditId: string | null;
  sourceFormName: string;
  setSourceFormName: (val: string) => void;
  sourceFormIcon: string;
  setSourceFormIcon: (val: string) => void;
  handleSaveSource: (e: React.FormEvent) => void;
  resetSourceForm: () => void;
}

export const KelolaView: React.FC<KelolaViewProps> = ({
  walletsWithCurrentBalance,
  categories,
  sources,
  getCardClasses,
  getAccentBg,
  startEditWallet,
  handleDeleteWallet,
  startEditCategory,
  handleDeleteCategory,
  startEditSource,
  handleDeleteSource,
  walletEditId,
  walletFormName,
  setWalletFormName,
  walletFormBalance,
  setWalletFormBalance,
  walletFormIcon,
  setWalletFormIcon,
  handleSaveWallet,
  resetWalletForm,
  categoryEditId,
  categoryFormName,
  setCategoryFormName,
  categoryFormIcon,
  setCategoryFormIcon,
  handleSaveCategory,
  resetCategoryForm,
  sourceEditId,
  sourceFormName,
  setSourceFormName,
  sourceFormIcon,
  setSourceFormIcon,
  handleSaveSource,
  resetSourceForm
}) => {
  return (
    <div className="flex flex-col gap-8" id="view-manage">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">Kelola Dompet</h1>
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Saldo Awal</span>
          <span className="text-xs font-mono font-black text-indigo-500">{formatIDR(walletsWithCurrentBalance.reduce((sum, w) => sum + w.initialBalance, 0))}</span>
        </div>
      </div>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={getCardClasses() + " p-5 h-fit"}>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">{walletEditId ? 'Edit Dompet' : 'Tambah Dompet Baru'}</h3>
            <form onSubmit={handleSaveWallet} className="flex flex-col gap-4">
              <input type="text" placeholder="Nama Dompet (cth: BCA, Jago)" value={walletFormName} onChange={e => setWalletFormName(e.target.value)} required className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none" />
              <input type="number" placeholder="Saldo Awal (Rp)" value={walletFormBalance} onChange={e => setWalletFormBalance(e.target.value)} required className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none" />
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Pilih Icon</span>
                <div className="flex flex-wrap gap-2">
                  {['Wallet', 'CreditCard', 'Banknote', 'PiggyBank', 'Briefcase'].map(icon => (
                    <button key={icon} type="button" onClick={() => setWalletFormIcon(icon)} className={`w-10 h-10 rounded-xl flex items-center justify-center border transition ${walletFormIcon === icon ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950 shadow-md' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 text-slate-400'}`}>
                      <IconRenderer name={icon} className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition ${getAccentBg()}`}>{walletEditId ? 'Simpan Perubahan' : 'Tambahkan Dompet'}</button>
                {walletEditId && <button type="button" onClick={resetWalletForm} className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-500 hover:bg-slate-200 transition">Batal</button>}
              </div>
            </form>
          </div>
          <div className="flex flex-col gap-3">
            {walletsWithCurrentBalance.map(w => (
              <div key={w.id} className={getCardClasses() + " p-4 flex items-center justify-between group"}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    {w.icon && <IconRenderer name={w.icon} className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-tight">{w.name}</h4>
                    <p className="text-[11px] font-mono text-indigo-500 font-bold mt-0.5">{formatIDR(w.initialBalance)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEditWallet(w)} className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800 transition"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDeleteWallet(w.id)} className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories & Sources Sections could also be here or kept in App.tsx for simplicity, 
          but for full modularity, let's keep going */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">Kategori Pengeluaran</h2>
          </div>
          <div className={getCardClasses() + " p-4 mb-4"}>
            <form onSubmit={handleSaveCategory} className="flex gap-2">
              <input type="text" placeholder="Nama Kategori" value={categoryFormName} onChange={e => setCategoryFormName(e.target.value)} required className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none" />
              <button type="submit" className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition ${getAccentBg()}`}><Plus className="w-4 h-4" /></button>
            </form>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {categories.map(c => (
              <div key={c.id} className={getCardClasses() + " p-3 flex items-center justify-between group"}>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{c.name}</span>
                <button onClick={() => handleDeleteCategory(c.id)} className="p-1 rounded text-slate-400 hover:text-rose-500 transition opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">Sumber Pendapatan</h2>
          </div>
          <div className={getCardClasses() + " p-4 mb-4"}>
            <form onSubmit={handleSaveSource} className="flex gap-2">
              <input type="text" placeholder="Nama Sumber" value={sourceFormName} onChange={e => setSourceFormName(e.target.value)} required className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none" />
              <button type="submit" className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition ${getAccentBg()}`}><Plus className="w-4 h-4" /></button>
            </form>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {sources.map(s => (
              <div key={s.id} className={getCardClasses() + " p-3 flex items-center justify-between group"}>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{s.name}</span>
                <button onClick={() => handleDeleteSource(s.id)} className="p-1 rounded text-slate-400 hover:text-rose-500 transition opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
