/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Edit3,
  Trash2, 
  Check, 
  WalletCards, 
  Sun,
  Moon,
  FileSpreadsheet, 
  FileText,
  Bell,
  Download,
  Upload,
  Database,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Wallet as WalletIcon,
  Tag,
  TrendingUp,
  Palette,
  HardDrive,
  FileCheck2,
  AlertOctagon,
  X,
  UserCheck,
  Settings
} from 'lucide-react';
import { Breadcrumb } from '../Breadcrumb';
import { 
  Wallet, 
  Category, 
  IncomeSource, 
  UserSettings, 
  UserProfile, 
  KelolaSubPage,
  ThemeColor,
  FontStyle,
  UIStyle,
  CardStyle,
  CardRadius,
  TableStyle,
  Language
} from '../../types';
import { IconRenderer } from '../IconRenderer';
import { formatIDR } from '../../lib/formatters';
import { t } from '../../lib/i18n';

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
  settings: UserSettings;
  setSettings?: (settings: UserSettings) => void;
  profile?: UserProfile;
  setProfile?: (profile: UserProfile) => void;
  onExportExcel?: () => void;
  onExportPDF?: (startDate: string, endDate: string) => void;
  onExportBackup?: () => void;
  onRestoreBackup?: (file: File) => void;
  onDeleteAllData?: () => void;
  onOpenNotifications?: () => void;
  triggerNotification?: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'alert') => void;
  activeSubPage?: KelolaSubPage;
  setActiveSubPage?: (subPage: KelolaSubPage) => void;
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
  settings,
  setSettings,
  profile,
  setProfile,
  onExportExcel,
  onExportPDF,
  onExportBackup,
  onRestoreBackup,
  onDeleteAllData,
  onOpenNotifications,
  triggerNotification,
  activeSubPage: propSubPage,
  setActiveSubPage: propSetSubPage
}) => {
  // Navigation state for SeaBank-like menu list
  const [internalSubPage, setInternalSubPage] = useState<KelolaSubPage>('menu');
  const activeSubPage = propSubPage !== undefined ? propSubPage : internalSubPage;
  const setActiveSubPage = propSetSubPage || setInternalSubPage;

  const currentLang: Language = settings?.language || 'id';

  // Profile Edit Modal State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [tempProfileName, setTempProfileName] = useState(profile?.name || '');
  const [tempProfileAvatar, setTempProfileAvatar] = useState(profile?.avatar || '/male_avatar.jpg');

  // Local state for Report Date Filter
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const setDarkModeValue = (isDark: boolean) => {
    if (!setSettings || !settings) return;
    setSettings({ ...settings, isDarkMode: isDark });
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tempProfileName.trim();
    if (trimmed && setProfile && profile) {
      const updated: UserProfile = { 
        ...profile, 
        name: trimmed, 
        avatar: tempProfileAvatar 
      };
      setProfile(updated);
      try {
        localStorage.setItem('fin_profile', JSON.stringify(updated));
      } catch {}
      if (triggerNotification) {
        triggerNotification('Profil Diperbarui', `Profil ${trimmed} berhasil disimpan.`, 'success');
      }
    }
    setShowEditProfileModal(false);
  };

  const getInputClass = (extra = "px-4") => {
    if (settings?.uiStyle === 'glass') {
      return `w-full py-2.5 text-xs rounded-xl glass-input text-slate-800 dark:text-slate-100 focus:outline-none ${extra}`;
    }
    return `w-full py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none ${extra}`;
  };

  // Calculations for summary
  const totalInitial = walletsWithCurrentBalance.reduce((sum, w) => sum + (Number(w.initialBalance) || 0), 0);

  // ==========================================
  // VIEW 1: KELOLA DOMPET
  // ==========================================
  if (activeSubPage === 'dompet') {
    return (
      <div className="flex flex-col gap-4" id="subview-dompet">
        <Breadcrumb 
          items={[
            { label: t('title_manage', currentLang), onClick: () => setActiveSubPage('menu') },
            { label: t('title_wallet_manage', currentLang) }
          ]} 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Tambah Dompet Baru / Edit Dompet */}
          <div className={getCardClasses() + " p-5 h-fit"}>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
              {walletEditId ? 'Edit Dompet' : 'Tambah Dompet Baru'}
            </h3>
            <form onSubmit={handleSaveWallet} className="flex flex-col gap-4">
              <input 
                type="text" 
                placeholder="Nama Dompet (cth: BCA, Jago, Tunai)" 
                value={walletFormName} 
                onChange={e => setWalletFormName(e.target.value)} 
                required 
                className={getInputClass("px-4")} 
              />
              <div className="relative">
                <input 
                  type="number" 
                  placeholder="Saldo Awal (Rp)" 
                  value={walletFormBalance} 
                  onChange={e => setWalletFormBalance(e.target.value)} 
                  required 
                  className={getInputClass("pl-4 pr-16")} 
                />
                <button
                  type="button"
                  onClick={() => setWalletFormBalance(walletFormBalance ? walletFormBalance + '000' : '1000')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-black bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-slate-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-slate-700 focus:outline-none select-none z-10 cursor-pointer"
                >
                  +000
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Pilih Icon</span>
                <div className="flex flex-wrap gap-2">
                  {['Wallet', 'CreditCard', 'Banknote', 'PiggyBank', 'Briefcase', 'Smartphone'].map(icon => (
                    <button 
                      key={icon} 
                      type="button" 
                      onClick={() => setWalletFormIcon(icon)} 
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border cursor-pointer ${walletFormIcon === icon ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950 shadow-md' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 text-slate-400'}`}
                    >
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
                      className="w-7 h-7 rounded-full border-2 flex items-center justify-center relative shadow-sm cursor-pointer"
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
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer ${getAccentBg() || 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                  style={settings?.themeColor === 'custom' && settings?.customAccentColor ? { backgroundColor: settings.customAccentColor } : undefined}
                >
                  {walletEditId ? 'Simpan Perubahan' : 'Tambahkan Dompet'}
                </button>
                {walletEditId && (
                  <button 
                    type="button" 
                    onClick={resetWalletForm} 
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List Dompet Saat Ini */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daftar Dompet Saat Ini</span>
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
                  <button onClick={() => startEditWallet(w)} className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800 cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDeleteWallet(w.id)} className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: KELOLA KATEGORI PENGELUARAN
  // ==========================================
  if (activeSubPage === 'kategori') {
    return (
      <div className="flex flex-col gap-4" id="subview-kategori">
        <Breadcrumb 
          items={[
            { label: t('title_manage', currentLang), onClick: () => setActiveSubPage('menu') },
            { label: t('title_category_manage', currentLang) }
          ]} 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={getCardClasses() + " p-5 h-fit"}>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
              {categoryEditId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h3>
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
                      className="w-7 h-7 rounded-full border-2 flex items-center justify-center relative shadow-sm cursor-pointer"
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
                <div className="flex flex-wrap gap-2">
                  {['Utensils', 'Car', 'ShoppingBag', 'Tv', 'Zap', 'HeartPulse', 'GraduationCap', 'Home', 'Plane', 'Coffee', 'Gift', 'HelpCircle'].map(icon => (
                    <button 
                      key={icon} 
                      type="button" 
                      onClick={() => setCategoryFormIcon(icon)} 
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border cursor-pointer ${categoryFormIcon === icon ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950 shadow-md' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 text-slate-400'}`}
                    >
                      <IconRenderer name={icon} className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="submit" 
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer ${getAccentBg() || 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                  style={settings?.themeColor === 'custom' && settings?.customAccentColor ? { backgroundColor: settings.customAccentColor } : undefined}
                >
                  {categoryEditId ? 'Simpan Perubahan' : 'Tambahkan Kategori'}
                </button>
                {categoryEditId && (
                  <button 
                    type="button" 
                    onClick={resetCategoryForm} 
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daftar Kategori Saat Ini</span>
            <div className="grid grid-cols-1 gap-2.5">
              {categories.map(c => (
                <div key={c.id} className={getCardClasses() + " p-3.5 flex items-center justify-between group relative overflow-hidden"}>
                  <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: c.color }} />
                  <div className="flex items-center gap-3 pl-1.5">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-xs shadow-xs"
                      style={{ backgroundColor: `${c.color}25`, color: c.color }}
                    >
                      {c.icon && <IconRenderer name={c.icon} className="w-4 h-4" />}
                    </div>
                    <span className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-tight">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEditCategory(c)} className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800 cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteCategory(c.id)} className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: KELOLA SUMBER PENDAPATAN
  // ==========================================
  if (activeSubPage === 'sumber') {
    return (
      <div className="flex flex-col gap-4" id="subview-sumber">
        <Breadcrumb 
          items={[
            { label: t('title_manage', currentLang), onClick: () => setActiveSubPage('menu') },
            { label: t('title_source_manage', currentLang) }
          ]} 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={getCardClasses() + " p-5 h-fit"}>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
              {sourceEditId ? 'Edit Sumber Dana' : 'Tambah Sumber Dana'}
            </h3>
            <form onSubmit={handleSaveSource} className="flex flex-col gap-4">
              <input 
                type="text" 
                placeholder="Nama Sumber (cth: Gaji, Freelance, Dividen)" 
                value={sourceFormName} 
                onChange={e => setSourceFormName(e.target.value)} 
                required 
                className={getInputClass("px-4")} 
              />
              
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Warna Sumber Dana</span>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSourceFormColor(color)}
                      className="w-7 h-7 rounded-full border-2 flex items-center justify-center relative shadow-sm cursor-pointer"
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
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Pilih Icon Sumber Dana</span>
                <div className="flex flex-wrap gap-2">
                  {['Banknote', 'Briefcase', 'TrendingUp', 'Gift', 'DollarSign', 'Coins', 'Building', 'Smile'].map(icon => (
                    <button 
                      key={icon} 
                      type="button" 
                      onClick={() => setSourceFormIcon(icon)} 
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border cursor-pointer ${sourceFormIcon === icon ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950 shadow-md' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 text-slate-400'}`}
                    >
                      <IconRenderer name={icon} className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="submit" 
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer ${getAccentBg() || 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                  style={settings?.themeColor === 'custom' && settings?.customAccentColor ? { backgroundColor: settings.customAccentColor } : undefined}
                >
                  {sourceEditId ? 'Simpan Perubahan' : 'Tambahkan Sumber'}
                </button>
                {sourceEditId && (
                  <button 
                    type="button" 
                    onClick={resetSourceForm} 
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daftar Sumber Pendapatan</span>
            <div className="grid grid-cols-1 gap-2.5">
              {sources.map(s => (
                <div key={s.id} className={getCardClasses() + " p-3.5 flex items-center justify-between group relative overflow-hidden"}>
                  <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: s.color }} />
                  <div className="flex items-center gap-3 pl-1.5">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-xs shadow-xs"
                      style={{ backgroundColor: `${s.color}25`, color: s.color }}
                    >
                      {s.icon && <IconRenderer name={s.icon} className="w-4 h-4" />}
                    </div>
                    <span className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-tight">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEditSource(s)} className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800 cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteSource(s.id)} className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 4: KUSTOMISASI UMUM (General Customization)
  // ==========================================
  if (activeSubPage === 'tampilan') {
    return (
      <div className="flex flex-col gap-4" id="subview-tampilan">
        <Breadcrumb 
          items={[
            { label: t('title_manage', currentLang), onClick: () => setActiveSubPage('menu') },
            { label: t('title_general_customization', currentLang) }
          ]} 
        />

        <div className="max-w-xl mx-auto w-full flex flex-col gap-4 mt-3 sm:mt-4">
          
          {/* 1. Visual Dual Tile Mode Selector (Terang vs Gelap) */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
              {t('app_theme_choice', currentLang)}
            </span>
            <div className="grid grid-cols-2 gap-3">
              {/* Option 1: Mode Terang */}
              <button
                type="button"
                onClick={() => setDarkModeValue(false)}
                className={`p-4 rounded-2xl border text-left cursor-pointer flex flex-col justify-between h-24 relative overflow-hidden ${
                  !settings?.isDarkMode 
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-slate-850 shadow-xs ring-2 ring-indigo-500/20' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${!settings?.isDarkMode ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    <Sun className="w-4 h-4" />
                  </div>
                  {!settings?.isDarkMode && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black tracking-wider uppercase">
                      {currentLang === 'en' ? 'Active' : 'Aktif'}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white">
                    {t('light_mode', currentLang)}
                  </h4>
                </div>
              </button>

              {/* Option 2: Mode Gelap */}
              <button
                type="button"
                onClick={() => setDarkModeValue(true)}
                className={`p-4 rounded-2xl border text-left cursor-pointer flex flex-col justify-between h-24 relative overflow-hidden ${
                  settings?.isDarkMode 
                    ? 'border-indigo-500 bg-indigo-950/40 shadow-xs ring-2 ring-indigo-500/30' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${settings?.isDarkMode ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    <Moon className="w-4 h-4" />
                  </div>
                  {settings?.isDarkMode && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black tracking-wider uppercase">
                      {currentLang === 'en' ? 'Active' : 'Aktif'}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white">
                    {t('dark_mode', currentLang)}
                  </h4>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Visual Dual Tile Language Selector (Bahasa Indonesia & English) */}
          <div className="flex flex-col gap-2 mt-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
              {t('language_choice', currentLang)}
            </span>
            <div className="grid grid-cols-2 gap-3">
              {/* Option 1: Bahasa Indonesia */}
              <button
                type="button"
                onClick={() => {
                  if (setSettings && settings) {
                    const updated: UserSettings = { ...settings, language: 'id' };
                    setSettings(updated);
                    try {
                      localStorage.setItem('fin_settings', JSON.stringify(updated));
                    } catch {}
                    if (triggerNotification) {
                      triggerNotification('Bahasa Diperbarui', 'Bahasa sistem diubah ke Bahasa Indonesia.', 'success');
                    }
                  }
                }}
                className={`p-4 rounded-2xl border text-left cursor-pointer flex flex-col justify-between h-24 relative overflow-hidden ${
                  (settings?.language || 'id') === 'id'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-slate-850 shadow-xs ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-black text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
                    ID
                  </div>
                  {(settings?.language || 'id') === 'id' && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black tracking-wider uppercase">
                      {currentLang === 'en' ? 'Active' : 'Aktif'}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white">
                    Bahasa Indonesia
                  </h4>
                </div>
              </button>

              {/* Option 2: English */}
              <button
                type="button"
                onClick={() => {
                  if (setSettings && settings) {
                    const updated: UserSettings = { ...settings, language: 'en' };
                    setSettings(updated);
                    try {
                      localStorage.setItem('fin_settings', JSON.stringify(updated));
                    } catch {}
                    if (triggerNotification) {
                      triggerNotification('Language Updated', 'System language set to English.', 'success');
                    }
                  }
                }}
                className={`p-4 rounded-2xl border text-left cursor-pointer flex flex-col justify-between h-24 relative overflow-hidden ${
                  settings?.language === 'en'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-slate-850 shadow-xs ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-black text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
                    EN
                  </div>
                  {settings?.language === 'en' && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black tracking-wider uppercase">
                      Active
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white">
                    English (US)
                  </h4>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Card: Redirect to Sub-sub Menu Kustomisasi UI */}
          <div className="flex flex-col gap-2 mt-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
              {t('additional_customization', currentLang)}
            </span>
            <button
              type="button"
              onClick={() => setActiveSubPage('kustomisasi_ui')}
              className={`w-full p-4.5 rounded-2xl ${getCardClasses()} border border-slate-200/80 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-left`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                    {t('title_ui_customization', currentLang)}
                  </h4>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 ml-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 4.1: SUB-SUB MENU KUSTOMISASI UI
  // ==========================================
  if (activeSubPage === 'kustomisasi_ui') {
    return (
      <div className="flex flex-col gap-4 max-w-xl mx-auto w-full" id="subview-kustomisasi-ui">
        <Breadcrumb 
          items={[
            { label: t('title_manage', currentLang), onClick: () => setActiveSubPage('menu') },
            { label: t('title_general_customization', currentLang), onClick: () => setActiveSubPage('tampilan') },
            { label: t('title_ui_customization', currentLang) }
          ]} 
        />

        <div className={`p-5 rounded-2xl ${getCardClasses()} border border-slate-200/80 dark:border-slate-800 flex flex-col gap-6`}>
          
          {/* 1. Warna Aksen */}
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 block mb-2.5 uppercase tracking-widest">
              1. Warna Aksen
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'indigo', label: 'Indigo', colorClass: 'bg-indigo-600' },
                { id: 'emerald', label: 'Emerald', colorClass: 'bg-emerald-500' },
                { id: 'amber', label: 'Amber', colorClass: 'bg-amber-500' },
                { id: 'rose', label: 'Rose', colorClass: 'bg-rose-500' }
              ].map((p) => {
                const isActive = settings.themeColor === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSettings && setSettings({ ...settings, themeColor: p.id as ThemeColor })}
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1.5 select-none focus:outline-none cursor-pointer ${
                      isActive 
                        ? 'border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-900/60 font-bold shadow-xs' 
                        : 'border-slate-100 dark:border-slate-900 hover:border-slate-200 dark:hover:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full shadow-xs block relative ${p.colorClass}`}>
                      {isActive && (
                        <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-[10px]">✓</span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-800 dark:text-slate-200 font-semibold">{p.label}</span>
                  </button>
                );
              })}

              {/* Custom Color Option */}
              <button
                type="button"
                onClick={() => {
                  if (setSettings && settings.themeColor !== 'custom') {
                    setSettings({ ...settings, themeColor: 'custom', customAccentColor: settings.customAccentColor || '#8b5cf6' });
                  }
                }}
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1.5 select-none focus:outline-none cursor-pointer ${
                  settings.themeColor === 'custom' 
                    ? 'border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-900/60 font-bold shadow-xs' 
                    : 'border-slate-100 dark:border-slate-900 hover:border-slate-200 dark:hover:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <span 
                  className="w-5 h-5 rounded-full shadow-xs block relative border border-black/10 shrink-0"
                  style={{ backgroundColor: settings.customAccentColor || '#8b5cf6' }}
                >
                  {settings.themeColor === 'custom' && (
                    <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-[10px]">✓</span>
                  )}
                </span>
                <span className="text-[10px] text-slate-800 dark:text-slate-200 font-semibold">Bebas</span>
              </button>
            </div>

            {/* Custom Color Picker Tool */}
            {settings.themeColor === 'custom' && (
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden border-2 border-white dark:border-slate-800 shadow-xs shrink-0">
                    <input 
                      type="color" 
                      value={settings.customAccentColor || '#8b5cf6'}
                      onChange={(e) => setSettings && setSettings({ ...settings, themeColor: 'custom', customAccentColor: e.target.value })}
                      className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0 p-0"
                      title="Pilih Warna Aksen Kustom"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">Pilih Warna Bebas</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Klik ikon untuk pilih via color picker</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-mono font-bold text-slate-400">#</span>
                  <input 
                    type="text" 
                    value={(settings.customAccentColor || '#8b5cf6').replace('#', '')}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      if (setSettings) {
                        setSettings({ ...settings, themeColor: 'custom', customAccentColor: `#${val}` });
                      }
                    }}
                    className="w-20 px-2 py-1 text-xs font-mono font-bold uppercase rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="8B5CF6"
                    maxLength={6}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Tipografi Utama */}
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 block mb-2 uppercase tracking-widest">
              2. Tipografi Utama
            </span>
            <div className="relative">
              <select 
                value={settings.fontStyle === 'sans' ? 'jakarta' : settings.fontStyle}
                onChange={(e) => setSettings && setSettings({ ...settings, fontStyle: e.target.value as FontStyle })}
                className="w-full p-3 pr-10 appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="jakarta">Jakarta Sans (Modern & Clean)</option>
                <option value="grotesk">Space Grotesk (Tech & Edgy)</option>
                <option value="ios">Roboto Slab (Klasik Serif)</option>
                <option value="neobrutalism">Edu VIC WA NT Hand (Tulisan Tangan / Cursive)</option>
                <option value="iceberg">Iceberg (Display & Modern)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          {/* 3. Gaya Visual UI */}
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 block mb-2 uppercase tracking-widest">
              3. Gaya Visual UI
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'modern', label: 'Modern Slate', desc: 'Sederhana & Elegan' },
                { id: 'minimal', label: 'Minimalist', desc: 'Tanpa Pembatas' },
                { id: 'glass', label: 'Glassmorphic', desc: 'Liquid Frosted Glass' }
              ].map((s) => {
                const isActive = settings.uiStyle === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSettings && setSettings({ ...settings, uiStyle: s.id as UIStyle })}
                    className={`p-3 rounded-xl border text-left cursor-pointer relative overflow-hidden ${
                      isActive 
                        ? (s.id === 'glass' 
                            ? 'glass-panel border-indigo-500/80 font-bold shadow-xs' 
                            : 'border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-900/60 font-bold shadow-xs')
                        : 'border-slate-100 dark:border-slate-900 hover:border-slate-200 dark:hover:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    {s.id === 'glass' && (
                      <div className="absolute -right-2 -bottom-2 w-10 h-10 bg-gradient-to-br from-indigo-500/40 via-pink-400/30 to-cyan-400/40 rounded-full blur-md pointer-events-none" />
                    )}
                    <span className="font-bold text-xs text-slate-900 dark:text-white block relative z-10">{s.label}</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 block relative z-10">{s.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Gaya Kartu & Border */}
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 block mb-2 uppercase tracking-widest">
              4. Gaya Kartu &amp; Border
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'flat', label: 'Rata (Flat)', desc: 'Sederhana' },
                { id: 'bordered', label: 'Garis Tipis', desc: 'Batas Halus' },
                { id: 'shadowed', label: 'Bayangan', desc: 'Efek Kedalaman' }
              ].map((c) => {
                const isActive = settings.cardStyle === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSettings && setSettings({ ...settings, cardStyle: c.id as CardStyle })}
                    className={`p-3 rounded-xl border text-left cursor-pointer ${
                      isActive 
                        ? 'border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-900/60 font-bold shadow-xs' 
                        : 'border-slate-100 dark:border-slate-900 hover:border-slate-200 dark:hover:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">{c.label}</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 block">{c.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Sudut Kartu (Radius) */}
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 block mb-2 uppercase tracking-widest">
              5. Sudut Kartu (Radius)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'sharp', label: 'Tajam', desc: 'Kotak' },
                { id: 'rounded', label: 'Bulat', desc: 'Standar' },
                { id: 'extra', label: 'Ekstra', desc: 'Sangat Bulat' }
              ].map((c) => {
                const isActive = settings.cardRadius === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSettings && setSettings({ ...settings, cardRadius: c.id as CardRadius })}
                    className={`p-3 rounded-xl border text-left cursor-pointer ${
                      isActive 
                        ? 'border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-900/60 font-bold shadow-xs' 
                        : 'border-slate-100 dark:border-slate-900 hover:border-slate-200 dark:hover:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">{c.label}</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 block">{c.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Kerapatan Tabel / List */}
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 block mb-2 uppercase tracking-widest">
              6. Kerapatan Tabel / List
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'compact', label: 'Kompak', desc: 'Lebih Padat' },
                { id: 'spacious', label: 'Longgar', desc: 'Lebih Rapi' },
                { id: 'striped', label: 'Zebra', desc: 'Garis Selang-Seling' }
              ].map((t) => {
                const isActive = settings.tableStyle === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSettings && setSettings({ ...settings, tableStyle: t.id as TableStyle })}
                    className={`p-3 rounded-xl border text-left cursor-pointer ${
                      isActive 
                        ? 'border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-900/60 font-bold shadow-xs' 
                        : 'border-slate-100 dark:border-slate-900 hover:border-slate-200 dark:hover:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">{t.label}</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 block">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 5: CADANGKAN & PULIHKAN DATA
  // ==========================================
  if (activeSubPage === 'cadangan') {
    return (
      <div className="flex flex-col gap-4" id="subview-cadangan">
        <Breadcrumb 
          items={[
            { label: t('title_manage', currentLang), onClick: () => setActiveSubPage('menu') },
            { label: t('title_backup_restore', currentLang) }
          ]} 
        />

        <div className="max-w-xl mx-auto w-full flex flex-col gap-4">
          <div className={getCardClasses() + " p-5 flex flex-col gap-4 border border-slate-200/80 dark:border-slate-800"}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-sky-600 dark:text-sky-400 font-bold text-sm">
                <Database className="w-5 h-5" />
                <span>Format Cadangan Terenkapsulasi (JSON)</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Offline</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Seluruh data dompet, transaksi, anggaran, tabungan, dan aktivitas Anda dapat diekspor menjadi satu file cadangan aman. Simpan file ini di Google Drive atau memori HP Anda.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {onExportBackup && (
                <button
                  type="button"
                  onClick={onExportBackup}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Cadangkan Sekarang</span>
                </button>
              )}
              {onRestoreBackup && (
                <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-sky-700 dark:text-sky-200 bg-white dark:bg-slate-850 border border-sky-300 dark:border-sky-700 hover:bg-sky-50 dark:hover:bg-slate-800 shadow-xs cursor-pointer text-center">
                  <Upload className="w-4 h-4" />
                  <span>Pulihkan Cadangan</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onRestoreBackup(file);
                        e.target.value = '';
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 6: EKSPOR LAPORAN
  // ==========================================
  if (activeSubPage === 'ekspor') {
    return (
      <div className="flex flex-col gap-4" id="subview-ekspor">
        <Breadcrumb 
          items={[
            { label: t('title_manage', currentLang), onClick: () => setActiveSubPage('menu') },
            { label: t('title_export_reports', currentLang) }
          ]} 
        />

        <div className="max-w-xl mx-auto w-full flex flex-col gap-4">
          {/* PDF Report Export with Date Filter */}
          {onExportPDF && (
            <div className={getCardClasses() + " p-5 flex flex-col gap-3 border border-slate-200/80 dark:border-slate-800"}>
              <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-xs">
                <FileText className="w-4 h-4 text-amber-500" />
                <span>Cetak Laporan Keuangan (PDF)</span>
              </div>
              <p className="text-[11px] text-slate-400">Pilih rentang tanggal transaksi yang ingin dicetak ke dalam laporan resmi.</p>
              
              <div className="flex gap-2 pt-1">
                <div className="w-1/2 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-bold">DARI TANGGAL:</span>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={e => setStartDate(e.target.value)} 
                    className="w-full text-xs p-2.5 rounded-xl border bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium cursor-pointer shadow-2xs" 
                  />
                </div>
                <div className="w-1/2 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-bold">SAMPAI TANGGAL:</span>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={e => setEndDate(e.target.value)} 
                    className="w-full text-xs p-2.5 rounded-xl border bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium cursor-pointer shadow-2xs" 
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => onExportPDF(startDate, endDate)}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-xs cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Cetak Lembar Laporan (PDF)</span>
              </button>
            </div>
          )}

          {/* Excel (CSV) Export */}
          {onExportExcel && (
            <div className={getCardClasses() + " p-5 flex flex-col gap-3 border border-slate-200/80 dark:border-slate-800"}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-xs">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <span>Ekspor Data Excel (CSV)</span>
                </div>
                <button
                  type="button"
                  onClick={onExportExcel}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh CSV</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">Unduh seluruh riwayat transaksi dalam format file spreadsheet Excel (CSV) untuk analisis di laptop/PC.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 7: HAPUS SEMUA DATA (DANGER ZONE)
  // ==========================================
  if (activeSubPage === 'bahaya') {
    return (
      <div className="flex flex-col gap-4" id="subview-bahaya">
        <Breadcrumb 
          items={[
            { label: t('title_manage', currentLang), onClick: () => setActiveSubPage('menu') },
            { label: t('title_danger_zone', currentLang) }
          ]} 
        />

        <div className="max-w-xl mx-auto w-full flex flex-col gap-4">
          <div className={getCardClasses() + " p-5 flex flex-col gap-4 border border-slate-200/80 dark:border-slate-800"}>
            <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400 font-bold text-sm">
              <AlertOctagon className="w-5 h-5" />
              <span>Zona Bahaya (Hapus Data Total)</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Seluruh data transaksi, dompet, tabungan, anggaran, dan aktivitas yang tersimpan di perangkat ini akan dibersihkan kembali ke pengaturan bawaan. Pastikan Anda telah mengunduh file cadangan (*backup JSON*) terlebih dahulu jika masih ingin menyimpan riwayat keuangan Anda.
            </p>

            {onDeleteAllData && (
              <button
                type="button"
                onClick={onDeleteAllData}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-xs cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Bersihkan Semua Data Aplikasi</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW UTAMA: SEABANK-STYLE MENU LIST (DEFAULT)
  // Each sub-menu item has a UNIQUE distinct color!
  // ==========================================
  const menuItems = [
    {
      id: 'dompet',
      title: t('menu_wallets', currentLang),
      icon: WalletIcon,
      iconColor: 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/40 border border-amber-600/20',
      action: () => setActiveSubPage('dompet')
    },
    {
      id: 'kategori',
      title: t('menu_categories', currentLang),
      icon: Tag,
      iconColor: 'text-rose-500 bg-rose-500/10 border border-rose-500/20',
      action: () => setActiveSubPage('kategori')
    },
    {
      id: 'sumber',
      title: t('menu_sources', currentLang),
      icon: TrendingUp,
      iconColor: 'text-teal-500 bg-teal-500/10 border border-teal-500/20',
      action: () => setActiveSubPage('sumber')
    },
    {
      id: 'tampilan',
      title: t('menu_general_customization', currentLang),
      icon: Palette,
      iconColor: 'text-indigo-500 bg-indigo-500/10 border border-indigo-500/20',
      action: () => setActiveSubPage('tampilan')
    },
    {
      id: 'cadangan',
      title: t('menu_backup', currentLang),
      icon: HardDrive,
      iconColor: 'text-sky-500 bg-sky-500/10 border border-sky-500/20',
      action: () => setActiveSubPage('cadangan')
    },
    {
      id: 'ekspor',
      title: t('menu_export', currentLang),
      icon: FileCheck2,
      iconColor: 'text-amber-500 bg-amber-500/10 border border-amber-500/20',
      action: () => setActiveSubPage('ekspor')
    },
    {
      id: 'notifikasi',
      title: t('menu_notifications', currentLang),
      icon: Bell,
      iconColor: 'text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-800 border border-slate-300 dark:border-slate-700',
      action: () => onOpenNotifications ? onOpenNotifications() : null
    },
    {
      id: 'bahaya',
      title: t('menu_danger', currentLang),
      icon: Trash2,
      iconColor: 'text-red-600 bg-red-500/10 border border-red-500/20',
      action: () => setActiveSubPage('bahaya')
    }
  ];

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full pb-6" id="view-manage">
      
      {/* 1. Profil Banner Atas (Banner Songket Centered style like Dashboard Hero) */}
      <div className="relative -mx-4 sm:-mx-6 -mt-1 z-0 overflow-hidden bg-[#FF7777] text-white rounded-b-none pt-4 sm:pt-5 px-4 sm:px-6 pb-24 sm:pb-28 lg:pb-30">
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
              <pattern id="banner-songket-motif-kelola" width="48" height="48" patternUnits="userSpaceOnUse">
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
            <rect width="100%" height="100%" fill="url(#banner-songket-motif-kelola)" />
          </svg>

          {/* Subtle luminous rose-wine atmospheric glow in the lower corners (pure soft blur, no rings) */}
          <div className="absolute right-0 bottom-0 w-72 h-40 bg-rose-500/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-10 bottom-0 w-64 h-32 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Centered Profile Content */}
        <div 
          onClick={() => {
            setTempProfileName(profile?.name || '');
            setTempProfileAvatar(profile?.avatar || '/male_avatar.jpg');
            setShowEditProfileModal(true);
          }}
          className="relative z-10 flex flex-col items-center justify-center text-center cursor-pointer group"
          title="Klik untuk mengubah nama dan avatar profil"
        >
          {/* Centered Avatar with clean ring */}
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border-4 border-white/60 bg-white/20 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
            <img 
              src={profile?.avatar || '/male_avatar.jpg'} 
              alt="Avatar Profil" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }} 
            />
          </div>

          {/* Centered Name with Edit Icon right beside it */}
          <div className="flex items-center justify-center gap-1.5 mt-2.5">
            <h3 className="font-black text-lg sm:text-xl text-white tracking-tight drop-shadow-xs">
              {profile?.name || t('user_default_name', currentLang)}
            </h3>
            <div className="p-1 rounded-full bg-white/20 border border-white/30 text-white group-hover:bg-white/35 transition-all shadow-xs shrink-0">
              <Edit3 className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Card Total Saldo Awal (Overlapping / Nimpa Banner Profil, NO icon, Minimalist Concept) */}
      <div 
        className={`relative z-10 -mt-18 sm:-mt-20 p-4 sm:p-5 rounded-2xl ${getCardClasses()} border border-slate-200/80 dark:border-slate-800 shadow-md flex flex-col gap-2`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400">
            {t('total_initial_balance', currentLang)}
          </span>
          <div className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 text-[10px] sm:text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{walletsWithCurrentBalance.length} {t('registered_wallets', currentLang)}</span>
          </div>
        </div>

        <div className="mt-1">
          <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
            {formatIDR(totalInitial)}
          </span>
        </div>
      </div>

      {/* 3. Daftar Menu Pengaturan (Unique Color Icons) */}
      <div className={`rounded-2xl ${getCardClasses()} border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-xs`}>
        {menuItems.map((item) => {
          const IconComp = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-left"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconColor}`}>
                  <IconComp className="w-5 h-5" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                  {item.title}
                </h4>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 ml-3" />
            </button>
          );
        })}
      </div>

      {/* Modal Edit Profil (Nama + Foto Profil Cowo / Cewe) */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-800 dark:text-white">Edit Profil Pengguna</h3>
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              
              {/* Pilihan Foto Profil Cowo / Cewe */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Pilih Foto Profil</label>
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Foto Cowok */}
                  <div 
                    onClick={() => setTempProfileAvatar('/male_avatar.jpg')}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 cursor-pointer ${
                      tempProfileAvatar === '/male_avatar.jpg' 
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-indigo-500/30 shadow-xs">
                      <img src="/male_avatar.jpg" alt="Cowok" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-extrabold text-slate-800 dark:text-white">Pria / Cowo</span>
                      {tempProfileAvatar === '/male_avatar.jpg' && (
                        <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 stroke-[3]" />
                      )}
                    </div>
                  </div>

                  {/* Foto Cewek */}
                  <div 
                    onClick={() => setTempProfileAvatar('/female_avatar.jpg')}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 cursor-pointer ${
                      tempProfileAvatar === '/female_avatar.jpg' 
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-indigo-500/30 shadow-xs">
                      <img src="/female_avatar.jpg" alt="Cewek" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-extrabold text-slate-800 dark:text-white">Wanita / Cewe</span>
                      {tempProfileAvatar === '/female_avatar.jpg' && (
                        <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 stroke-[3]" />
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Input Nama */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Nama Pengguna</label>
                <input
                  type="text"
                  value={tempProfileName}
                  onChange={(e) => setTempProfileName(e.target.value)}
                  placeholder="Masukkan nama Anda"
                  required
                  className={getInputClass("px-4 py-2.5")}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm cursor-pointer ${getAccentBg() || 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                  Simpan Profil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
