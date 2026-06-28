/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Wallet, Category, IncomeSource } from '../../types';
import { IconRenderer } from '../IconRenderer';
import { formatIDR } from '../../lib/formatters';

const PRESET_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber/Yellow
  '#10b981', // Emerald/Green
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet/Purple
  '#ec4899', // Pink
  '#64748b', // Slate
];

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
  categoryFormColor: string;
  setCategoryFormColor: (val: string) => void;
  handleSaveCategory: (e: React.FormEvent) => void;
  resetCategoryForm: () => void;
  sourceEditId: string | null;
  sourceFormName: string;
  setSourceFormName: (val: string) => void;
  sourceFormIcon: string;
  setSourceFormIcon: (val: string) => void;
  sourceFormColor: string;
  setSourceFormColor: (val: string) => void;
  handleSaveSource: (e: React.FormEvent) => void;
  resetSourceForm: () => void;
  settings: any;
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
  categoryFormColor,
  setCategoryFormColor,
  handleSaveCategory,
  resetCategoryForm,
  sourceEditId,
  sourceFormName,
  setSourceFormName,
  sourceFormIcon,
  setSourceFormIcon,
  sourceFormColor,
  setSourceFormColor,
  handleSaveSource,
  resetSourceForm,
  settings
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
                <div className="flex items-center gap-1">
                  <button onClick={() => startEditWallet(w)} className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800 transition"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDeleteWallet(w.id)} className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Categories Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">Kategori Pengeluaran</h2>
          </div>
          <div className={getCardClasses() + " p-5 h-fit"}>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">{categoryEditId ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h3>
            <form onSubmit={handleSaveCategory} className="flex flex-col gap-4">
              <input 
                type="text" 
                placeholder="Nama Kategori (cth: Makanan, Transportasi)" 
                value={categoryFormName} 
                onChange={e => setCategoryFormName(e.target.value)} 
                required 
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none" 
              />
              
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Warna Kategori (Untuk Grafik)</span>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCategoryFormColor(color)}
                      className="w-7 h-7 rounded-full border-2 transition transform hover:scale-110 flex items-center justify-center relative shadow-sm"
                      style={{ 
                        backgroundColor: color,
                        borderColor: categoryFormColor.toLowerCase() === color.toLowerCase() ? (settings.isDarkMode ? '#ffffff' : '#0f172a') : 'transparent'
                      }}
                    >
                      {categoryFormColor.toLowerCase() === color.toLowerCase() && (
                        <span className="text-[10px] text-white font-bold drop-shadow">✓</span>
                      )}
                    </button>
                  ))}
                  {/* Custom Color Picker input with elegant visual representation */}
                  <div 
                    className="relative w-7 h-7 rounded-full overflow-hidden border-2 flex items-center justify-center shadow-sm cursor-pointer"
                    style={{
                      borderColor: !PRESET_COLORS.map(c => c.toLowerCase()).includes(categoryFormColor.toLowerCase()) ? (settings.isDarkMode ? '#ffffff' : '#0f172a') : 'transparent'
                    }}
                  >
                    <input 
                      type="color" 
                      value={categoryFormColor} 
                      onChange={e => setCategoryFormColor(e.target.value)}
                      className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150" 
                    />
                    {!PRESET_COLORS.map(c => c.toLowerCase()).includes(categoryFormColor.toLowerCase()) && (
                      <span className="text-[10px] text-white font-bold drop-shadow z-10">✓</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Pilih Icon Kategori</span>
                <div className="flex flex-wrap gap-1.5">
                  {['Utensils', 'Car', 'Coffee', 'Zap', 'ShoppingBag', 'Laptop', 'PiggyBank', 'Briefcase', 'TrendingUp'].map(icon => (
                    <button 
                      key={icon} 
                      type="button" 
                      onClick={() => setCategoryFormIcon(icon)} 
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border transition ${categoryFormIcon === icon ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950 shadow-sm' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 text-slate-400'}`}
                    >
                      <IconRenderer name={icon} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition ${getAccentBg()}`}>
                  {categoryEditId ? 'Simpan Perubahan' : 'Tambahkan Kategori'}
                </button>
                {categoryEditId && (
                  <button type="button" onClick={resetCategoryForm} className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categories.map(c => (
              <div key={c.id} className={getCardClasses() + " p-3 flex items-center justify-between group"}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm" 
                    style={{ backgroundColor: c.color || '#ef4444' }}
                  >
                    <IconRenderer name={c.icon || 'Utensils'} className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{c.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => startEditCategory(c)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800 transition">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteCategory(c.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sources Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">Sumber Pendapatan</h2>
          </div>
          <div className={getCardClasses() + " p-5 h-fit"}>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">{sourceEditId ? 'Edit Sumber' : 'Tambah Sumber Baru'}</h3>
            <form onSubmit={handleSaveSource} className="flex flex-col gap-4">
              <input 
                type="text" 
                placeholder="Nama Sumber (cth: Gaji, Freelance)" 
                value={sourceFormName} 
                onChange={e => setSourceFormName(e.target.value)} 
                required 
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none" 
              />
              
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Warna Sumber (Untuk Grafik)</span>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSourceFormColor(color)}
                      className="w-7 h-7 rounded-full border-2 transition transform hover:scale-110 flex items-center justify-center relative shadow-sm"
                      style={{ 
                        backgroundColor: color,
                        borderColor: sourceFormColor.toLowerCase() === color.toLowerCase() ? (settings.isDarkMode ? '#ffffff' : '#0f172a') : 'transparent'
                      }}
                    >
                      {sourceFormColor.toLowerCase() === color.toLowerCase() && (
                        <span className="text-[10px] text-white font-bold drop-shadow">✓</span>
                      )}
                    </button>
                  ))}
                  {/* Custom Color Picker input with elegant visual representation */}
                  <div 
                    className="relative w-7 h-7 rounded-full overflow-hidden border-2 flex items-center justify-center shadow-sm cursor-pointer"
                    style={{
                      borderColor: !PRESET_COLORS.map(c => c.toLowerCase()).includes(sourceFormColor.toLowerCase()) ? (settings.isDarkMode ? '#ffffff' : '#0f172a') : 'transparent'
                    }}
                  >
                    <input 
                      type="color" 
                      value={sourceFormColor} 
                      onChange={e => setSourceFormColor(e.target.value)}
                      className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150" 
                    />
                    {!PRESET_COLORS.map(c => c.toLowerCase()).includes(sourceFormColor.toLowerCase()) && (
                      <span className="text-[10px] text-white font-bold drop-shadow z-10">✓</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Pilih Icon Sumber</span>
                <div className="flex flex-wrap gap-1.5">
                  {['Briefcase', 'Laptop', 'TrendingUp', 'CircleDollarSign', 'Landmark', 'BadgeDollarSign', 'Wallet'].map(icon => (
                    <button 
                      key={icon} 
                      type="button" 
                      onClick={() => setSourceFormIcon(icon)} 
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border transition ${sourceFormIcon === icon ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950 shadow-sm' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 text-slate-400'}`}
                    >
                      <IconRenderer name={icon} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition ${getAccentBg()}`}>
                  {sourceEditId ? 'Simpan Perubahan' : 'Tambahkan Sumber'}
                </button>
                {sourceEditId && (
                  <button type="button" onClick={resetSourceForm} className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sources.map(s => (
              <div key={s.id} className={getCardClasses() + " p-3 flex items-center justify-between group"}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm" 
                    style={{ backgroundColor: s.color || '#10b981' }}
                  >
                    <IconRenderer name={s.icon || 'Briefcase'} className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{s.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => startEditSource(s)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800 transition">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteSource(s.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
