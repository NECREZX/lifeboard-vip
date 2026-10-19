/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
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
  GripVertical,
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
  Settings,
  Lock,
  Sparkles
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
import { BRAND_WALLETS, BRAND_LOGOS_MAP, detectBrandFromWalletName } from '../BankLogos';
import { formatIDR } from '../../lib/formatters';
import { t } from '../../lib/i18n';
import { getEffectiveThemeColor, getThemeContrastColor, THEME_PRESETS, normalizeHexColor } from '../../lib/theme';

// Ikon Dompet Klasik
const CLASSIC_WALLET_ICONS = [
  { id: 'Wallet', label: 'Dompet Fisik' },
  { id: 'CreditCard', label: 'Kartu Kredit' },
  { id: 'PiggyBank', label: 'Celengan' },
  { id: 'Landmark', label: 'Bank Umum' },
  { id: 'Smartphone', label: 'M-Banking' },
  { id: 'Coins', label: 'Koin' },
  { id: 'CircleDollarSign', label: 'Finansial' }
];

// Ikon Lengkap & Berbeda untuk Kategori Pengeluaran (Bebas Duplikasi)
const EXPENSE_CATEGORY_ICONS = [
  { id: 'Utensils', label: 'Makanan' },
  { id: 'Coffee', label: 'Kopi & Kafe' },
  { id: 'Pizza', label: 'Camilan' },
  { id: 'Apple', label: 'Buah & Sehat' },
  { id: 'Car', label: 'Mobil' },
  { id: 'Bus', label: 'Angkutan' },
  { id: 'Fuel', label: 'Bensin' },
  { id: 'Bike', label: 'Motor' },
  { id: 'Plane', label: 'Tiket/Travel' },
  { id: 'ShoppingBag', label: 'Belanja' },
  { id: 'ShoppingCart', label: 'Supermarket' },
  { id: 'Shirt', label: 'Pakaian' },
  { id: 'Tag', label: 'Diskon' },
  { id: 'Package', label: 'Paket' },
  { id: 'Zap', label: 'Listrik' },
  { id: 'Home', label: 'Sewa Rumah' },
  { id: 'Droplets', label: 'Air PDAM' },
  { id: 'Wifi', label: 'Internet' },
  { id: 'Tv', label: 'TV & Streaming' },
  { id: 'Flame', label: 'Gas LPG' },
  { id: 'HeartPulse', label: 'Kesehatan' },
  { id: 'Pill', label: 'Obat & Vitamin' },
  { id: 'GraduationCap', label: 'Pendidikan' },
  { id: 'BookOpen', label: 'Buku Kursus' },
  { id: 'Gamepad2', label: 'Game & Topup' },
  { id: 'Film', label: 'Bioskop' },
  { id: 'Music', label: 'Konser Musik' },
  { id: 'Dumbbell', label: 'Gym & Fitness' },
  { id: 'Gift', label: 'Kado & Hadiah' },
  { id: 'HelpCircle', label: 'Lainnya' }
];

// Ikon Lengkap & Berbeda untuk Sumber Pendapatan (Bebas Duplikasi)
const INCOME_SOURCE_ICONS = [
  { id: 'Briefcase', label: 'Gaji Bulanan' },
  { id: 'Building', label: 'Kantor/PT' },
  { id: 'Building2', label: 'Bisnis/Usaha' },
  { id: 'Laptop', label: 'Freelance' },
  { id: 'Award', label: 'Bonus/Insentif' },
  { id: 'Banknote', label: 'Uang Tunai' },
  { id: 'Coins', label: 'Dividen/Koin' },
  { id: 'TrendingUp', label: 'Investasi' },
  { id: 'DollarSign', label: 'Dolar/Valas' },
  { id: 'CircleDollarSign', label: 'Penghasilan' },
  { id: 'BadgeDollarSign', label: 'Komisi Sales' },
  { id: 'Percent', label: 'Bunga Simpanan' },
  { id: 'Gift', label: 'Hadiah/THR' },
  { id: 'Trophy', label: 'Juara/Lomba' },
  { id: 'Sparkles', label: 'Rezeki Kaget' },
  { id: 'Smile', label: 'Uang Saku/Tip' },
  { id: 'Landmark', label: 'Perbankan' },
  { id: 'Gem', label: 'Royalti/Aset' },
  { id: 'PiggyBank', label: 'Buka Tabungan' }
];

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
  onMoveWallet?: (fromIndex: number, toIndex: number) => void;
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
  onLockScreen?: () => void;
  onViewSplash?: () => void;
}

export const KelolaView: React.FC<KelolaViewProps> = ({
  walletsWithCurrentBalance,
  categories,
  sources,
  getCardClasses,
  getAccentBg,
  startEditWallet,
  handleDeleteWallet,
  onMoveWallet,
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
  setActiveSubPage: propSetSubPage,
  onLockScreen,
  onViewSplash
}) => {
  // Navigation state for SeaBank-like menu list
  const [internalSubPage, setInternalSubPage] = useState<KelolaSubPage>('menu');
  const activeSubPage = propSubPage !== undefined ? propSubPage : internalSubPage;
  const setActiveSubPage = propSetSubPage || setInternalSubPage;

  const currentLang: Language = settings?.language || 'id';
  const activeThemeColor = getEffectiveThemeColor(settings);
  const contrastColor = getThemeContrastColor(activeThemeColor);

  // Profile Edit Modal State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [tempProfileName, setTempProfileName] = useState(profile?.name || '');
  const [tempProfileAvatar, setTempProfileAvatar] = useState(profile?.avatar || '/male_avatar.jpg');
  const [tempProfileEmail, setTempProfileEmail] = useState(profile?.email || 'rifqithoohaa12@gmail.com');

  // Wallet Icon Picker Tab State ('bank' | 'ewallet' | 'investasi' | 'klasik' | 'lainnya')
  const [walletIconTab, setWalletIconTab] = useState<'bank' | 'ewallet' | 'investasi' | 'klasik' | 'lainnya'>('bank');

  // Auto-switch tab if current walletFormIcon belongs to a specific category
  useEffect(() => {
    if (walletFormIcon) {
      const match = BRAND_WALLETS.find(b => b.id === walletFormIcon);
      if (match) {
        setWalletIconTab(match.category);
      } else if (CLASSIC_WALLET_ICONS.some(c => c.id === walletFormIcon)) {
        setWalletIconTab('klasik');
      }
    }
  }, [walletFormIcon]);

  // Drag & Drop State for Wallet Reordering
  const [draggedWalletIdx, setDraggedWalletIdx] = useState<number | null>(null);
  const [dragOverWalletIdx, setDragOverWalletIdx] = useState<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchDragIdxRef = useRef<number | null>(null);

  const handleWalletDragStart = (e: React.DragEvent, index: number) => {
    setDraggedWalletIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${index}`);
  };

  const handleWalletDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverWalletIdx !== index) {
      setDragOverWalletIdx(index);
    }
  };

  const handleWalletDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedWalletIdx !== null && draggedWalletIdx !== targetIndex) {
      onMoveWallet && onMoveWallet(draggedWalletIdx, targetIndex);
    }
    setDraggedWalletIdx(null);
    setDragOverWalletIdx(null);
  };

  const handleWalletDragEnd = () => {
    setDraggedWalletIdx(null);
    setDragOverWalletIdx(null);
  };

  const handleWalletTouchStart = (index: number, e: React.TouchEvent) => {
    touchDragIdxRef.current = index;
    touchStartYRef.current = e.touches[0].clientY;
    setDraggedWalletIdx(index);
  };

  const handleWalletTouchMove = (e: React.TouchEvent) => {
    if (touchDragIdxRef.current === null) return;
    const touch = e.touches[0];
    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
    const cardEl = targetEl?.closest('[data-wallet-drag-idx]');
    if (cardEl) {
      const targetIdx = parseInt(cardEl.getAttribute('data-wallet-drag-idx') || '-1', 10);
      if (targetIdx >= 0 && targetIdx !== dragOverWalletIdx) {
        setDragOverWalletIdx(targetIdx);
      }
    }
  };

  const handleWalletTouchEnd = () => {
    if (touchDragIdxRef.current !== null && dragOverWalletIdx !== null && touchDragIdxRef.current !== dragOverWalletIdx) {
      onMoveWallet && onMoveWallet(touchDragIdxRef.current, dragOverWalletIdx);
    }
    touchDragIdxRef.current = null;
    touchStartYRef.current = null;
    setDraggedWalletIdx(null);
    setDragOverWalletIdx(null);
  };

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
    const trimmedEmail = tempProfileEmail.trim();
    if (trimmed && setProfile && profile) {
      const updated: UserProfile = { 
        ...profile, 
        name: trimmed, 
        email: trimmedEmail || 'rifqithoohaa12@gmail.com',
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
      <div className="flex flex-col gap-4 pt-5 sm:pt-6" id="subview-dompet">
        <Breadcrumb 
          items={[
            { label: t('title_manage', currentLang), onClick: () => setActiveSubPage('menu') },
            { label: t('title_wallet_manage', currentLang) }
          ]} 
        />

        {/* Card Simpel Total Saldo Awal & Badge Jumlah Dompet */}
        <div className={`p-4 sm:p-5 ${getCardClasses()} border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4`}>
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-400">
              {t('total_initial_balance', currentLang)}
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight truncate">
              {formatIDR(totalInitial)}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 text-xs font-bold flex items-center gap-2 shadow-2xs shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>{walletsWithCurrentBalance.length} {t('registered_wallets', currentLang)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Tambah Dompet Baru / Edit Dompet */}
          <div className={getCardClasses() + " p-5 h-fit"}>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
              {walletEditId ? 'Edit Dompet' : 'Tambah Dompet Baru'}
            </h3>
            <form onSubmit={handleSaveWallet} className="flex flex-col gap-4">
              {/* Wallet Name input with auto-detection */}
              <div className="flex flex-col gap-1.5">
                <input 
                  type="text" 
                  placeholder="Nama Dompet (cth: Livin Mandiri, BCA, GoPay, Tunai)" 
                  value={walletFormName} 
                  onChange={e => {
                    const val = e.target.value;
                    setWalletFormName(val);
                    const detected = detectBrandFromWalletName(val);
                    if (detected && !walletEditId) {
                      setWalletFormIcon(detected.icon);
                      setWalletFormColor(detected.color);
                      if (['GoPay', 'OVO', 'DANA', 'ShopeePay', 'LinkAja', 'AstraPay', 'ISaku', 'PayPal'].includes(detected.icon)) {
                        setWalletIconTab('ewallet');
                      } else if (['Bibit', 'Stockbit', 'Ajaib', 'Crypto'].includes(detected.icon)) {
                        setWalletIconTab('investasi');
                      } else if (['Banknote', 'Wallet', 'CreditCard', 'PiggyBank'].includes(detected.icon)) {
                        setWalletIconTab('klasik');
                      } else {
                        setWalletIconTab('bank');
                      }
                    }
                  }} 
                  required 
                  className={getInputClass("px-4")} 
                />

                {/* Clean Auto-Detect Banner (Tanpa icon lampu/AI) */}
                {(() => {
                  const detected = detectBrandFromWalletName(walletFormName);
                  if (!detected) return null;
                  return (
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-[11px] animate-in fade-in duration-150">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 flex items-center justify-center shrink-0">
                          <IconRenderer name={detected.icon} className="w-6 h-6" />
                        </div>
                        <span className="text-slate-600 dark:text-slate-300 truncate">
                          Terdeteksi: <strong className="text-slate-900 dark:text-white font-bold">{detected.label}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setWalletFormIcon(detected.icon);
                          setWalletFormColor(detected.color);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-[10px] tracking-wide shrink-0 transition cursor-pointer shadow-xs"
                      >
                        Terapkan
                      </button>
                    </div>
                  );
                })()}
              </div>

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

              {/* Segmented Real-Brand and Classic Icon Picker */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Pilih Icon Dompet</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">Aktif:</span>
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <IconRenderer name={walletFormIcon} className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Segmented Category Tabs (5 Tabs) */}
                <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setWalletIconTab('bank')}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer text-center truncate ${
                      walletIconTab === 'bank'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-black'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalletIconTab('ewallet')}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer text-center truncate ${
                      walletIconTab === 'ewallet'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-black'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    E-Wallet
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalletIconTab('investasi')}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer text-center truncate ${
                      walletIconTab === 'investasi'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-black'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Investasi
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalletIconTab('klasik')}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer text-center truncate ${
                      walletIconTab === 'klasik'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-black'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Klasik
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalletIconTab('lainnya')}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer text-center truncate ${
                      walletIconTab === 'lainnya'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-black'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Lainnya
                  </button>
                </div>

                {/* Grid of Icons for selected tab */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1.5 border border-slate-100 dark:border-slate-800/80 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
                  {walletIconTab === 'klasik' ? (
                    CLASSIC_WALLET_ICONS.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setWalletFormIcon(item.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition cursor-pointer gap-1.5 ${
                          walletFormIcon === item.id
                            ? 'border-indigo-600 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-500/30 font-bold'
                            : 'border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <div className="w-8 h-8 flex items-center justify-center shrink-0">
                          <IconRenderer name={item.id} className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold truncate max-w-full">{item.label}</span>
                      </button>
                    ))
                  ) : (
                    BRAND_WALLETS.filter(b => b.category === walletIconTab).map(b => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setWalletFormIcon(b.id);
                          setWalletFormColor(b.defaultColor);
                        }}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition cursor-pointer gap-1.5 ${
                          walletFormIcon === b.id
                            ? 'border-indigo-600 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-500/30 font-bold'
                            : 'border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <div className="w-8 h-8 flex items-center justify-center shrink-0">
                          <IconRenderer name={b.id} className="w-8 h-8 rounded-xl" />
                        </div>
                        <span className="text-[10px] font-bold truncate max-w-full">{b.name}</span>
                      </button>
                    ))
                  )}
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
                      className="w-7 h-7 rounded-full border-2 flex items-center justify-center relative shadow-sm cursor-pointer transition-transform hover:scale-105"
                      style={{ 
                        backgroundColor: color,
                        borderColor: walletFormColor?.toLowerCase() === color.toLowerCase() ? (settings?.isDarkMode ? '#ffffff' : '#0f172a') : 'transparent' 
                      }}
                    >
                      {walletFormColor?.toLowerCase() === color.toLowerCase() && (
                        <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />
                      )}
                    </button>
                  ))}

                  {/* Bebas / Custom Color Circle with Native Color Picker Trigger */}
                  <label
                    className="w-7 h-7 rounded-full border-2 flex items-center justify-center relative shadow-sm cursor-pointer transition-transform hover:scale-105 overflow-hidden"
                    style={{
                      backgroundColor: walletFormColor,
                      borderColor: !PRESET_COLORS.map(c => c.toLowerCase()).includes(walletFormColor?.toLowerCase()) ? (settings?.isDarkMode ? '#ffffff' : '#0f172a') : 'transparent'
                    }}
                    title="Pilih Warna Bebas (Color Picker)"
                  >
                    <input 
                      type="color" 
                      value={walletFormColor?.startsWith('#') ? walletFormColor : '#10b981'}
                      onChange={(e) => setWalletFormColor(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {!PRESET_COLORS.map(c => c.toLowerCase()).includes(walletFormColor?.toLowerCase()) ? (
                      <Check className="w-3.5 h-3.5 text-white drop-shadow-md pointer-events-none" />
                    ) : (
                      <span className="text-[11px] text-white font-black drop-shadow-md pointer-events-none">+</span>
                    )}
                  </label>
                </div>

                {/* Custom Color Hex Tool like in Kustomisasi Umum */}
                <div className="mt-1 p-2.5 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden border-2 border-white dark:border-slate-800 shadow-xs shrink-0">
                      <input 
                        type="color" 
                        value={walletFormColor?.startsWith('#') ? walletFormColor : '#10b981'}
                        onChange={(e) => setWalletFormColor(e.target.value)}
                        className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0 p-0"
                        title="Pilih Warna Kustom"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">Pilih Warna Bebas</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Klik kotak warna atau isi kode HEX</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono font-bold text-slate-400">#</span>
                    <input 
                      type="text" 
                      value={(walletFormColor || '#10b981').replace('#', '')}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        setWalletFormColor(`#${val}`);
                      }}
                      className="w-20 px-2 py-1 text-xs font-mono font-bold uppercase rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="10B981"
                      maxLength={6}
                    />
                  </div>
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
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Daftar Dompet
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                {walletsWithCurrentBalance.length} Dompet
              </span>
            </div>

            {walletsWithCurrentBalance.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <p className="text-xs text-slate-400">Belum ada dompet tersimpan.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {walletsWithCurrentBalance.map((w, idx) => {
                  const isBeingDragged = draggedWalletIdx === idx;
                  const isDragOver = dragOverWalletIdx === idx && draggedWalletIdx !== idx;

                  return (
                    <div 
                      key={w.id} 
                      data-wallet-drag-idx={idx}
                      draggable
                      onDragStart={(e) => handleWalletDragStart(e, idx)}
                      onDragOver={(e) => handleWalletDragOver(e, idx)}
                      onDrop={(e) => handleWalletDrop(e, idx)}
                      onDragEnd={handleWalletDragEnd}
                      onTouchStart={(e) => handleWalletTouchStart(idx, e)}
                      onTouchMove={handleWalletTouchMove}
                      onTouchEnd={handleWalletTouchEnd}
                      className={`${getCardClasses()} p-3 sm:p-3.5 flex items-center justify-between group relative overflow-hidden transition-all duration-150 cursor-grab active:cursor-grabbing select-none ${
                        isBeingDragged 
                          ? 'opacity-40 scale-[0.98] border-2 border-dashed border-indigo-400 dark:border-indigo-500 shadow-none bg-indigo-50/20' 
                          : isDragOver
                            ? 'ring-2 ring-indigo-500 shadow-md bg-indigo-50/60 dark:bg-indigo-950/40 translate-y-0.5'
                            : 'hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                      }`}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: w.color || '#10b981' }} />
                      
                      {/* Left: Drag Grip Handle, Position Badge & Wallet Info */}
                      <div className="flex items-center gap-2.5 sm:gap-3 pl-1 min-w-0 flex-1">
                        {/* Drag Handle & Position Badge */}
                        <div 
                          className="flex items-center gap-1.5 shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-colors p-1"
                          title="Tahan dan geser untuk mengatur urutan posisi dompet"
                        >
                          <GripVertical className="w-4 h-4 shrink-0" />
                          <span className="font-mono font-bold text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            #{idx + 1}
                          </span>
                        </div>

                        {/* Wallet Icon (Besar & Jelas) */}
                        <div 
                          className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-xs shrink-0 overflow-hidden"
                          style={BRAND_LOGOS_MAP[w.icon] ? undefined : { backgroundColor: `${w.color || '#10b981'}25`, color: w.color || '#10b981' }}
                        >
                          {w.icon && (
                            <IconRenderer 
                              name={w.icon} 
                              className={BRAND_LOGOS_MAP[w.icon] ? "w-11 h-11 sm:w-12 sm:h-12 rounded-2xl" : "w-6 h-6 text-current"} 
                            />
                          )}
                        </div>

                        {/* Wallet Name & Balance */}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white uppercase tracking-tight truncate">{w.name}</h4>
                          <p className="text-[11px] font-mono text-indigo-500 dark:text-indigo-400 font-bold mt-0.5 truncate">{formatIDR(w.currentBalance ?? w.initialBalance)}</p>
                        </div>
                      </div>

                      {/* Actions: Edit & Delete */}
                      <div className="flex items-center gap-1 shrink-0 pl-2">
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); startEditWallet(w); }} 
                          title={`Edit dompet ${w.name}`}
                          className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); handleDeleteWallet(w.id); }} 
                          title={`Hapus dompet ${w.name}`}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
      <div className="flex flex-col gap-4 pt-5 sm:pt-6" id="subview-kategori">
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
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Pilih Icon Kategori</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">Aktif:</span>
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <IconRenderer name={categoryFormIcon} className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1.5 border border-slate-100 dark:border-slate-800/80 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
                  {EXPENSE_CATEGORY_ICONS.map(item => (
                    <button 
                      key={item.id} 
                      type="button" 
                      onClick={() => setCategoryFormIcon(item.id)} 
                      title={item.label}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition cursor-pointer gap-1 ${
                        categoryFormIcon === item.id 
                          ? 'border-indigo-600 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-500/30 font-bold' 
                          : 'border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <IconRenderer name={item.id} className="w-5 h-5" />
                      <span className="text-[9px] font-medium truncate max-w-full">{item.label}</span>
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
      <div className="flex flex-col gap-4 pt-5 sm:pt-6" id="subview-sumber">
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
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Pilih Icon Sumber Dana</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">Aktif:</span>
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <IconRenderer name={sourceFormIcon} className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1.5 border border-slate-100 dark:border-slate-800/80 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
                  {INCOME_SOURCE_ICONS.map(item => (
                    <button 
                      key={item.id} 
                      type="button" 
                      onClick={() => setSourceFormIcon(item.id)} 
                      title={item.label}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition cursor-pointer gap-1 ${
                        sourceFormIcon === item.id 
                          ? 'border-indigo-600 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-500/30 font-bold' 
                          : 'border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <IconRenderer name={item.id} className="w-5 h-5" />
                      <span className="text-[9px] font-medium truncate max-w-full">{item.label}</span>
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
    const subCardRadius = settings?.cardRadius === 'sharp' ? 'rounded-none' : settings?.cardRadius === 'extra' ? 'rounded-3xl' : 'rounded-2xl';
    const subIconRadius = settings?.cardRadius === 'sharp' ? 'rounded-none' : settings?.cardRadius === 'extra' ? 'rounded-2xl' : 'rounded-xl';

    return (
      <div className="flex flex-col gap-4 pt-5 sm:pt-6" id="subview-tampilan">
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
                className={`p-4 ${subCardRadius} border text-left cursor-pointer flex flex-col justify-between h-24 relative overflow-hidden transition-all ${
                  !settings?.isDarkMode 
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-slate-850 shadow-xs ring-2 ring-indigo-500/20' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`w-8 h-8 ${subIconRadius} flex items-center justify-center ${!settings?.isDarkMode ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    <Sun className="w-4 h-4" />
                  </div>
                  {!settings?.isDarkMode && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black tracking-wider uppercase shadow-2xs">
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
                className={`p-4 ${subCardRadius} border text-left cursor-pointer flex flex-col justify-between h-24 relative overflow-hidden transition-all ${
                  settings?.isDarkMode 
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-950/40 shadow-xs ring-2 ring-indigo-500/30' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div 
                    className={`w-8 h-8 ${subIconRadius} flex items-center justify-center ${settings?.isDarkMode ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                  >
                    <Moon className="w-4 h-4" />
                  </div>
                  {settings?.isDarkMode && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black tracking-wider uppercase shadow-2xs">
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
                className={`p-4 ${subCardRadius} border text-left cursor-pointer flex flex-col justify-between h-24 relative overflow-hidden transition-all ${
                  (settings?.language || 'id') === 'id'
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-slate-850 shadow-xs ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`w-8 h-8 ${subIconRadius} bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-black text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700`}>
                    ID
                  </div>
                  {(settings?.language || 'id') === 'id' && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black tracking-wider uppercase shadow-2xs">
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
                className={`p-4 ${subCardRadius} border text-left cursor-pointer flex flex-col justify-between h-24 relative overflow-hidden transition-all ${
                  settings?.language === 'en'
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-slate-850 shadow-xs ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`w-8 h-8 ${subIconRadius} bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-black text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700`}>
                    EN
                  </div>
                  {settings?.language === 'en' && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black tracking-wider uppercase shadow-2xs">
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
              className={`w-full p-4.5 ${subCardRadius} ${getCardClasses()} border border-slate-200/80 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-left transition-all shadow-xs`}
            >
              <div className="flex items-center gap-3.5">
                <div 
                  className={`w-10 h-10 ${subIconRadius} bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border`}
                >
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
      <div className="flex flex-col gap-4 pt-5 sm:pt-6 max-w-xl mx-auto w-full" id="subview-kustomisasi-ui">
        <Breadcrumb 
          items={[
            { label: t('title_manage', currentLang), onClick: () => setActiveSubPage('menu') },
            { label: t('title_general_customization', currentLang), onClick: () => setActiveSubPage('tampilan') },
            { label: t('title_ui_customization', currentLang) }
          ]} 
        />

        <div className={`p-5 rounded-2xl ${getCardClasses()} border border-slate-200/80 dark:border-slate-800 flex flex-col gap-6`}>
          
          {/* 1. Warna Aksen & Tema Banner Terpadu */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="text-[9.5px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider truncate flex-1 min-w-0">
                1. Warna Aksen & Tema Banner Terpadu
              </span>
              <span 
                className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border"
                style={{ 
                  backgroundColor: `${activeThemeColor}18`,
                  color: activeThemeColor,
                  borderColor: `${activeThemeColor}40`
                }}
              >
                {activeThemeColor.toUpperCase()}
              </span>
            </div>

            {/* Palet Pilihan Cepat */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
              {THEME_PRESETS.map((p) => {
                const isSelected = activeThemeColor.toLowerCase() === p.hex.toLowerCase();
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      if (setSettings) {
                        setSettings({ 
                          ...settings, 
                          themeColor: 'custom', 
                          customAccentColor: p.hex 
                        });
                      }
                    }}
                    className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 select-none focus:outline-none cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-900/80 font-bold shadow-xs scale-102' 
                        : 'border-slate-100 dark:border-slate-900 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                    title={p.description || p.label}
                  >
                    <span 
                      className="w-5 h-5 rounded-full shadow-xs block relative shrink-0 border border-black/10"
                      style={{ backgroundColor: p.hex }}
                    >
                      {isSelected && (
                        <span 
                          className="absolute inset-0 flex items-center justify-center font-black text-[10px]"
                          style={{ color: getThemeContrastColor(p.hex) }}
                        >
                          ✓
                        </span>
                      )}
                    </span>
                    <span className="text-[9.5px] text-slate-800 dark:text-slate-200 font-medium truncate w-full">
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Color Picker & Direct Hex Input */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div 
                  className="relative w-9 h-9 rounded-xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-xs shrink-0 cursor-pointer group"
                  style={{ backgroundColor: activeThemeColor }}
                  title="Klik untuk memilih warna bebas via Color Picker"
                >
                  <input 
                    type="color" 
                    value={activeThemeColor}
                    onChange={(e) => {
                      if (setSettings) {
                        setSettings({ ...settings, themeColor: 'custom', customAccentColor: e.target.value });
                      }
                    }}
                    className="absolute -top-3 -left-3 w-16 h-16 cursor-pointer opacity-0"
                    title="Pilih Warna Bebas"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:scale-110 transition-transform">
                    <Palette className="w-4 h-4" style={{ color: contrastColor }} />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
                    Pilih Sendiri / Kode Warna
                  </span>
                </div>
              </div>

              {/* Direct Hex Code Input */}
              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <span className="text-xs font-mono font-black text-slate-400">#</span>
                <input 
                  type="text" 
                  value={activeThemeColor.replace('#', '')}
                  onChange={(e) => {
                    const raw = e.target.value.trim().replace(/[^0-9a-fA-F]/g, '');
                    if (setSettings) {
                      const hex = raw ? `#${raw}` : '#FF7777';
                      setSettings({ ...settings, themeColor: 'custom', customAccentColor: hex });
                    }
                  }}
                  className="w-24 px-2.5 py-1.5 text-xs font-mono font-bold uppercase rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                  placeholder="FF7777"
                  maxLength={6}
                />
              </div>
            </div>

          </div>

          {/* 2. Tipografi Utama */}
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 block mb-2 uppercase tracking-widest">
              2. Tipografi Utama
            </span>
            <div className="relative">
              <select 
                value={(settings.fontStyle === 'instagram' || settings.fontStyle === 'sans' || settings.fontStyle === 'jakarta' || settings.fontStyle === 'sfpro') ? 'instagram' : settings.fontStyle === 'ios' ? 'spotify' : (settings.fontStyle === 'iceberg' || settings.fontStyle === 'pixel' || settings.fontStyle === 'slabo' || settings.fontStyle === 'rye' || settings.fontStyle === 'pompiere' || settings.fontStyle === 'flamenco') ? 'playwrite' : (settings.fontStyle === 'badscript' || settings.fontStyle === 'neobrutalism' || settings.fontStyle === 'architect') ? 'petit' : settings.fontStyle}
                onChange={(e) => setSettings && setSettings({ ...settings, fontStyle: e.target.value as FontStyle })}
                className="w-full p-3 pr-10 appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="instagram">Font A</option>
                <option value="spotify">Font B</option>
                <option value="grotesk">Font C</option>
                <option value="petit">Font D</option>
                <option value="playwrite">Font E</option>
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
      <div className="flex flex-col gap-4 pt-5 sm:pt-6" id="subview-cadangan">
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
      <div className="flex flex-col gap-4 pt-5 sm:pt-6" id="subview-ekspor">
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
      <div className="flex flex-col gap-4 pt-5 sm:pt-6" id="subview-bahaya">
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
  // Each sub-menu item formatted as a matching card button
  // ==========================================
  const menuItems = [
    {
      id: 'tampilan',
      title: 'Kustomisasi Tampilan & Tema',
      icon: Palette,
      iconColor: 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400',
      action: () => setActiveSubPage('tampilan')
    },
    {
      id: 'dompet',
      title: t('menu_wallets', currentLang),
      icon: WalletIcon,
      iconColor: 'bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400',
      action: () => setActiveSubPage('dompet')
    },
    {
      id: 'kategori',
      title: t('menu_categories', currentLang),
      icon: Tag,
      iconColor: 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400',
      action: () => setActiveSubPage('kategori')
    },
    {
      id: 'sumber',
      title: t('menu_sources', currentLang),
      icon: TrendingUp,
      iconColor: 'bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400',
      action: () => setActiveSubPage('sumber')
    },
    {
      id: 'cadangan',
      title: t('menu_backup', currentLang),
      icon: HardDrive,
      iconColor: 'bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400',
      action: () => setActiveSubPage('cadangan')
    },
    {
      id: 'ekspor',
      title: t('menu_export', currentLang),
      icon: FileCheck2,
      iconColor: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      action: () => setActiveSubPage('ekspor')
    },
    {
      id: 'bahaya',
      title: t('menu_danger', currentLang),
      icon: Trash2,
      iconColor: 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400',
      action: () => setActiveSubPage('bahaya')
    },
    {
      id: 'kunci_layar',
      title: 'Kunci Layar & Form Login',
      icon: Lock,
      iconColor: 'bg-slate-500/10 border border-slate-500/20 text-slate-700 dark:text-slate-300',
      action: () => {
        if (onLockScreen) {
          onLockScreen();
        }
      }
    }
  ];

  return (
    <div className="flex flex-col gap-3.5 sm:gap-4" id="view-manage">
      
      {/* 1. Backdrop Banner Atas (Persis Identik & Selaras dengan Dashboard Hero Banner) */}
      <div 
        className="relative -mx-4 sm:-mx-6 -mt-1 z-0 overflow-hidden text-white rounded-b-none pt-4 sm:pt-5 px-4 sm:px-6 h-[162px] sm:h-[172px] lg:h-[182px] transition-colors duration-200"
        style={{ backgroundColor: activeThemeColor, color: contrastColor }}
      >
        {/* Authentic Indonesian Songket Weave Vector Motif (Identik 100% dengan Banner Dashboard) */}
        <div 
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 30%, rgba(0, 0, 0, 0.4) 55%, rgba(0, 0, 0, 0.9) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 30%, rgba(0, 0, 0, 0.4) 55%, rgba(0, 0, 0, 0.9) 100%)'
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

          {/* Subtle luminous atmospheric glow in the lower corners matching activeThemeColor */}
          <div 
            className="absolute right-0 bottom-0 w-72 h-40 rounded-full blur-3xl pointer-events-none" 
            style={{ backgroundColor: `${activeThemeColor}40` }}
          />
          <div 
            className="absolute left-10 bottom-0 w-64 h-32 rounded-full blur-3xl pointer-events-none" 
            style={{ backgroundColor: `${activeThemeColor}30` }}
          />
        </div>
      </div>

      {/* 2. Card 1: Profil (Menimpa Banner Lebih Tinggi, Foto Profil Mengambang di Atas dengan Icon Pensil, Ukiran Songket Batik di Kiri & Kanan) */}
      <div 
        onClick={() => {
          setTempProfileName(profile?.name || '');
          setTempProfileEmail(profile?.email || 'rifqithoohaa12@gmail.com');
          setTempProfileAvatar(profile?.avatar || '/male_avatar.jpg');
          setShowEditProfileModal(true);
        }}
        className={`relative z-10 -mt-20 sm:-mt-22 lg:-mt-24 p-4 sm:p-5 pt-8 sm:pt-9 ${getCardClasses()} !overflow-visible flex items-center justify-center max-w-2xl mx-auto w-full cursor-pointer group hover:border-slate-300 dark:hover:border-slate-700`}
        title="Klik untuk mengubah nama, email, dan avatar profil"
      >
        {/* Ornamen Motif Batik Kawung di Sisi Kiri Card */}
        <div 
          className="absolute left-2.5 sm:left-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 dark:opacity-35 group-hover:opacity-60 transition-opacity"
          style={{ color: activeThemeColor }}
        >
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 sm:w-8.5 sm:h-8.5">
            {/* Authentic Indonesian Batik Kawung Motif */}
            <path d="M 19 19 C 14 13, 14 5, 19 2 C 24 5, 24 13, 19 19 Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="19" cy="8" r="1.2" fill="currentColor" />
            <path d="M 19 19 C 14 25, 14 33, 19 36 C 24 33, 24 25, 19 19 Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="19" cy="30" r="1.2" fill="currentColor" />
            <path d="M 19 19 C 13 14, 5 14, 2 19 C 5 24, 13 24, 19 19 Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="8" cy="19" r="1.2" fill="currentColor" />
            <path d="M 19 19 C 25 14, 33 14, 36 19 C 33 24, 25 24, 19 19 Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="30" cy="19" r="1.2" fill="currentColor" />
            <circle cx="19" cy="19" r="2.2" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>

        {/* Ornamen Motif Batik Kawung di Sisi Kanan Card */}
        <div 
          className="absolute right-2.5 sm:right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 dark:opacity-35 group-hover:opacity-60 transition-opacity"
          style={{ color: activeThemeColor }}
        >
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 sm:w-8.5 sm:h-8.5">
            {/* Authentic Indonesian Batik Kawung Motif */}
            <path d="M 19 19 C 14 13, 14 5, 19 2 C 24 5, 24 13, 19 19 Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="19" cy="8" r="1.2" fill="currentColor" />
            <path d="M 19 19 C 14 25, 14 33, 19 36 C 24 33, 24 25, 19 19 Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="19" cy="30" r="1.2" fill="currentColor" />
            <path d="M 19 19 C 13 14, 5 14, 2 19 C 5 24, 13 24, 19 19 Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="8" cy="19" r="1.2" fill="currentColor" />
            <path d="M 19 19 C 25 14, 33 14, 36 19 C 33 24, 25 24, 19 19 Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="30" cy="19" r="1.2" fill="currentColor" />
            <circle cx="19" cy="19" r="2.2" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>

        {/* Foto Profil Dikeluarkan dan Terletak di Tengah Mengambang (di Bagian Banner) dengan Icon Pensil */}
        <div className="absolute -top-8 sm:-top-9 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <div className="relative group/avatar">
            <div className={`w-16 h-16 sm:w-18 sm:h-18 ${settings?.cardRadius === 'sharp' ? 'rounded-none' : 'rounded-full'} overflow-hidden border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover/avatar:scale-105 transition-transform`}>
              <img 
                src={profile?.avatar || '/male_avatar.jpg'} 
                alt="Avatar Profil" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }} 
              />
            </div>
            {/* Icon Pensil di Foto Profil */}
            <div 
              className={`absolute -bottom-0.5 -right-0.5 w-6 h-6 sm:w-6.5 sm:h-6.5 ${settings?.cardRadius === 'sharp' ? 'rounded-none' : 'rounded-full'} text-white border-2 border-white dark:border-slate-800 flex items-center justify-center group-hover/avatar:scale-110 transition-transform`}
              style={{ backgroundColor: activeThemeColor }}
            >
              <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Nama & Email (Rata Tengah) */}
        <div className="flex flex-col min-w-0 items-center text-center px-10 sm:px-14 z-10">
          <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors max-w-xs sm:max-w-md">
            {profile?.name || t('user_default_name', currentLang)}
          </h3>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 truncate mt-0.5 max-w-xs sm:max-w-md">
            {profile?.email || 'rifqithoohaa12@gmail.com'}
          </span>
        </div>
      </div>

      {/* 3. Card 2: Daftar Sub Menu Pengaturan */}
      <div 
        className={`relative z-10 p-4 sm:p-5 ${getCardClasses()} flex flex-col gap-2 max-w-2xl mx-auto w-full mb-6`}
      >
        {menuItems.map((item) => {
          const IconComp = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className={`w-full flex items-center justify-between p-3 sm:p-3.5 ${settings?.cardRadius === 'sharp' ? 'rounded-none' : settings?.cardRadius === 'extra' ? 'rounded-2xl' : 'rounded-xl'} bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/80 border border-slate-200/80 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 transition-all cursor-pointer group active:scale-[0.99] text-left shadow-none`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 ${settings?.cardRadius === 'sharp' ? 'rounded-none' : settings?.cardRadius === 'extra' ? 'rounded-xl' : 'rounded-lg'} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${item.iconColor}`}>
                  <IconComp className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>
          );
        })}
      </div>

      {/* Modal Edit Profil (Nama, Email, dan Foto Profil) */}
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

              {/* Input Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Alamat Email</label>
                <input
                  type="email"
                  value={tempProfileEmail}
                  onChange={(e) => setTempProfileEmail(e.target.value)}
                  placeholder="cth: nama@email.com"
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
