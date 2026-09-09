/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus, Edit2, Trash2, Check, WalletCards } from 'lucide-react';
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
  walletFormColor: string;
  setWalletFormColor: (val: string) => void;
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
  walletFormColor,
  setWalletFormColor,
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
  const getInputClass = (extra = "px-4") => {
    if (settings?.uiStyle === 'glass') {
      return `w-full py-2.5 text-xs rounded-xl glass-input text-slate-800 dark:text-slate-100 focus:outline-none ${extra}`;
    }
    return `w-full py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none ${extra}`;
  };

  return (
    <div className="flex flex-col gap-6" id="view-manage">
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            {/* ATM Card Tanpa Chip - Total Saldo Awal (Placing above form Tambah Dompet Baru) */}
            {(() => {
              const totalInitial = walletsWithCurrentBalance.reduce((sum, w) => sum + (Number(w.initialBalance) || 0), 0);
              let cardRadiusClass = "rounded-[22px]";
              if (settings?.cardRadius === 'sharp') cardRadiusClass = "rounded-none";
              else if (settings?.cardRadius === 'extra') cardRadiusClass = "rounded-[28px]";

              return (
                <div 
                  className={`w-full relative overflow-hidden ${cardRadiusClass} p-5 sm:p-6 bg-gradient-to-r from-cyan-500 via-teal-600 to-rose-500 text-white shadow-[0_16px_36px_rgba(20,184,166,0.25)] border border-white/40 ring-1 ring-white/20 flex flex-col justify-between h-[185px] sm:h-[195px] select-none group transition-all duration-300 hover:shadow-[0_20px_42px_rgba(20,184,166,0.35)]`}
                >
                  {/* Subtle Decorative Wave & Glow Overlay matching Top Bar / Bottom Bar */}
                  <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
                      <path d="M0,12 Q25,3 50,15 T100,8" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-white" />
                      <path d="M0,18 Q30,8 65,22 T100,16" fill="none" stroke="currentColor" strokeWidth="0.4" className="text-white" />
                    </svg>
                    <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
                    <div className="absolute left-1/4 -bottom-10 w-36 h-20 rounded-full bg-teal-300/20 blur-xl pointer-events-none" />
                  </div>

                  {/* Diagonal Holographic Sheen */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none" />

                  {/* Card Header: Icon on left, "TOTAL SALDO AWAL" directly to the right */}
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center shadow-xs shrink-0">
                      <WalletCards className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-black tracking-[0.2em] text-white/90 uppercase">
                      TOTAL SALDO AWAL
                    </span>
                  </div>

                  {/* Card Middle: Embossed Balance Display */}
                  <div className="relative z-10 my-auto py-1">
                    <h3 className="text-2xl sm:text-3xl font-mono font-black tracking-tight text-white drop-shadow-md">
                      {formatIDR(totalInitial)}
                    </h3>
                  </div>

                  {/* Card Bottom: Status Dompet & Overlapping Spheres */}
                  <div className="flex justify-between items-end relative z-10 pt-2 border-t border-white/25">
                    <div>
                      <span className="text-[7px] font-bold uppercase tracking-[0.18em] text-white/70 block">
                        STATUS DOMPET
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-bold tracking-wide text-white uppercase">
                        {walletsWithCurrentBalance.length} Dompet Aktif
                      </span>
                    </div>

                    {/* Dual Overlapping Spheres Payment Badge */}
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-mono tracking-wider text-white/80">IDR</span>
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-white/40 shadow-xs" />
                        <div className="w-6 h-6 rounded-full bg-white/60 shadow-xs" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Form Tambah Dompet Baru / Edit Dompet */}
            <div className={getCardClasses() + " p-5 h-fit"}>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">{walletEditId ? 'Edit Dompet' : 'Tambah Dompet Baru'}</h3>
              <form onSubmit={handleSaveWallet} className="flex flex-col gap-4">
                <input type="text" placeholder="Nama Dompet (cth: BCA, Jago)" value={walletFormName} onChange={e => setWalletFormName(e.target.value)} required className={getInputClass("px-4")} />
                <div className="relative">
                  <input type="number" placeholder="Saldo Awal (Rp)" value={walletFormBalance} onChange={e => setWalletFormBalance(e.target.value)} required className={getInputClass("pl-4 pr-16")} />
                  <button
                    type="button"
                    onClick={() => setWalletFormBalance(prev => prev ? prev + '000' : '1000')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-black bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-slate-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-slate-700 transition focus:outline-none select-none z-10"
                  >
                    +000
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Pilih Icon</span>
                  <div className="flex flex-wrap gap-2">
                    {['Wallet', 'CreditCard', 'Banknote', 'PiggyBank', 'Briefcase', 'Smartphone'].map(icon => (
                      <button key={icon} type="button" onClick={() => setWalletFormIcon(icon)} className={`w-10 h-10 rounded-xl flex items-center justify-center border transition ${walletFormIcon === icon ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950 shadow-md' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 text-slate-400'}`}>
                        <IconRenderer name={icon} className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Warna Dompet (Identitas Card)</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {PRESET_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setWalletFormColor(color)}
                        className="w-7 h-7 rounded-full border-2 transition transform hover:scale-110 flex items-center justify-center relative shadow-sm"
                        style={{ 
                          backgroundColor: color,
                          borderColor: walletFormColor === color ? (settings?.isDarkMode ? '#ffffff' : '#0f172a') : 'transparent' 
                        }}
                      >
                        {walletFormColor === color && (
                          <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button 
                    type="submit" 
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition ${getAccentBg() || 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                    style={settings?.themeColor === 'custom' && settings?.customAccentColor ? { backgroundColor: settings.customAccentColor } : undefined}
                  >
                    {walletEditId ? 'Simpan Perubahan' : 'Tambahkan Dompet'}
                  </button>
                  {walletEditId && <button type="button" onClick={resetWalletForm} className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition">Batal</button>}
                </div>
              </form>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {walletsWithCurrentBalance.map(w => (
              <div key={w.id} className={getCardClasses() + " p-4 flex items-center justify-between group relative overflow-hidden"}>
                <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: w.color || '#10b981' }} />
                <div className="flex items-center gap-3 pl-2">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xs shadow-xs"
                    style={{ backgroundColor: `${w.color || '#10b981'}25`, color: w.color || '#10b981' }}
                  >
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
                className={getInputClass("px-4")} 
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
                <button 
                  type="submit" 
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition ${getAccentBg() || 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                  style={settings?.themeColor === 'custom' && settings?.customAccentColor ? { backgroundColor: settings.customAccentColor } : undefined}
                >
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
                className={getInputClass("px-4")} 
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
                <button 
                  type="submit" 
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition ${getAccentBg() || 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                  style={settings?.themeColor === 'custom' && settings?.customAccentColor ? { backgroundColor: settings.customAccentColor } : undefined}
                >
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
