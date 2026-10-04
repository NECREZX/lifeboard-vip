/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Plus, 
  Check, 
  Layers, 
  Tag, 
  Briefcase, 
  Wallet as WalletIcon, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  FileText, 
  DollarSign, 
  Info, 
  X,
  Copy,
  Download,
  Search,
  RotateCcw
} from 'lucide-react';
import { 
  Wallet, 
  Category, 
  IncomeSource, 
  Transaction, 
  Budget, 
  Saving, 
  Activity, 
  Wishlist, 
  UserSettings 
} from '../../types';
import { IconRenderer } from '../IconRenderer';
import { formatIDR, getLocalDateString } from '../../lib/formatters';

export type FormType = 'pengeluaran' | 'pemasukan' | 'transfer' | 'budgeting' | 'tabungan' | 'aktivitas' | 'wishlist';

interface TambahDataViewProps {
  wallets: Wallet[];
  categories: Category[];
  sources: IncomeSource[];
  recentTransactions?: Transaction[];
  budgets?: Budget[];
  savings?: Saving[];
  activities?: Activity[];
  wishlists?: Wishlist[];
  settings: UserSettings;
  initialTab?: FormType;
  editData?: any;
  onBack: () => void;
  onAddTransaction: (data: Omit<Transaction, 'id'>) => void;
  onAddBudget: (data: Omit<Budget, 'id'>) => void;
  onAddSaving: (data: Omit<Saving, 'id'>) => void;
  onAddActivity: (data: Omit<Activity, 'id'>) => void;
  onAddWishlist: (data: Omit<Wishlist, 'id' | 'isPurchased' | 'createdAt'>) => void;
  onUpdateTransaction?: (id: string, data: Partial<Transaction>) => void;
  onUpdateBudget?: (id: string, data: Partial<Budget>) => void;
  onUpdateSaving?: (id: string, data: Partial<Saving>) => void;
  onUpdateActivity?: (id: string, data: Partial<Activity>) => void;
  onUpdateWishlist?: (id: string, data: Partial<Wishlist>) => void;
  onOpenManageWallets?: () => void;
  getCardClasses: () => string;
  getAccentBg: () => string;
  triggerNotification?: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'danger') => void;
}

const FORM_TABS: { id: FormType; label: string }[] = [
  { id: 'pengeluaran', label: 'Pengeluaran' },
  { id: 'pemasukan', label: 'Pendapatan' },
  { id: 'transfer', label: 'Transfer' },
  { id: 'budgeting', label: 'Budgeting' },
  { id: 'tabungan', label: 'Tabungan' },
  { id: 'aktivitas', label: 'Aktivitas' },
  { id: 'wishlist', label: 'Wishlist' }
];

export function TambahDataView({
  wallets,
  categories,
  sources,
  recentTransactions = [],
  budgets = [],
  savings = [],
  activities = [],
  wishlists = [],
  settings,
  initialTab = 'pengeluaran',
  editData,
  onBack,
  onAddTransaction,
  onAddBudget,
  onAddSaving,
  onAddActivity,
  onAddWishlist,
  onUpdateTransaction,
  onUpdateBudget,
  onUpdateSaving,
  onUpdateActivity,
  onUpdateWishlist,
  onOpenManageWallets,
  getCardClasses,
  getAccentBg,
  triggerNotification
}: TambahDataViewProps) {
  const isEdit = !!editData;
  const isDarkMode = settings?.isDarkMode || false;

  // Resolve user accent color
  const resolvedAccent = useMemo(() => {
    if (settings.themeColor === 'custom') return settings.customAccentColor || '#8b5cf6';
    switch (settings.themeColor) {
      case 'emerald': return '#10b981';
      case 'amber': return '#f59e0b';
      case 'rose': return '#f43f5e';
      case 'classic': return isDarkMode ? '#f8fafc' : '#0f172a';
      case 'indigo': default: return '#6366f1';
    }
  }, [settings.themeColor, settings.customAccentColor, isDarkMode]);

  // Radius for Enclosing Card exactly matching DashboardView
  const enclosingCardRadiusClass = useMemo(() => {
    if (settings?.cardRadius === 'sharp') return 'rounded-none';
    if (settings?.cardRadius === 'extra') return 'rounded-t-[40px] sm:rounded-t-[48px] rounded-b-none';
    return 'rounded-t-[32px] sm:rounded-t-[40px] rounded-b-none';
  }, [settings?.cardRadius]);

  const enclosingCardBgClass = useMemo(() => {
    if (settings?.uiStyle === 'glass') {
      return 'bg-white dark:bg-slate-950 border-t border-b-0 border-slate-200/60 dark:border-slate-800/80 shadow-[0_-16px_36px_rgba(0,0,0,0.15)]';
    } else if (settings?.uiStyle === 'minimal') {
      return 'bg-white dark:bg-slate-950 border-t border-b-0 border-slate-200 dark:border-slate-800 shadow-none';
    }
    return 'bg-white dark:bg-slate-950 border-t border-b-0 border-slate-200/90 dark:border-slate-800 shadow-[0_-16px_36px_rgba(0,0,0,0.12)] dark:shadow-[0_-16px_36px_rgba(0,0,0,0.45)]';
  }, [settings?.uiStyle]);

  // Active form tab
  const [activeForm, setActiveForm] = useState<FormType>(initialTab);

  // Tab Pages (3 items per page cleanly fitting 100% width with 0% cut off)
  const tabPages = useMemo(() => {
    const pages: { id: FormType; label: string }[][] = [];
    for (let i = 0; i < FORM_TABS.length; i += 3) {
      pages.push(FORM_TABS.slice(i, i + 3));
    }
    return pages;
  }, []);

  const [activeTabPageIndex, setActiveTabPageIndex] = useState(0);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const handleTabsScroll = () => {
    if (!tabsContainerRef.current) return;
    const { scrollLeft, clientWidth } = tabsContainerRef.current;
    if (clientWidth > 0) {
      const page = Math.round(scrollLeft / clientWidth);
      setActiveTabPageIndex(Math.min(tabPages.length - 1, Math.max(0, page)));
    }
  };

  const scrollToTabPage = (pageIdx: number) => {
    if (!tabsContainerRef.current) return;
    tabsContainerRef.current.scrollTo({
      left: pageIdx * tabsContainerRef.current.clientWidth,
      behavior: 'smooth'
    });
    setActiveTabPageIndex(pageIdx);
  };

  // Ensure active tab's page is displayed initially
  useEffect(() => {
    const pageIndex = tabPages.findIndex(p => p.some(t => t.id === activeForm));
    if (pageIndex !== -1 && pageIndex !== activeTabPageIndex) {
      scrollToTabPage(pageIndex);
    }
  }, [activeForm, tabPages]);

  // Wallet Pages (2 items per page cleanly fitting 100% width with 0% cut off)
  const walletItems = useMemo(() => {
    const items: (Wallet | { id: string; name: string; isAdd: boolean })[] = [...wallets];
    if (onOpenManageWallets) {
      items.push({ id: '__add_wallet__', name: 'Tambah Akun', isAdd: true });
    }
    return items;
  }, [wallets, onOpenManageWallets]);

  const walletPages = useMemo(() => {
    const pages: typeof walletItems[] = [];
    for (let i = 0; i < walletItems.length; i += 2) {
      pages.push(walletItems.slice(i, i + 2));
    }
    return pages;
  }, [walletItems]);

  const [activeWalletPageIndex, setActiveWalletPageIndex] = useState(0);
  const walletContainerRef = useRef<HTMLDivElement>(null);

  const handleWalletScroll = () => {
    if (!walletContainerRef.current) return;
    const { scrollLeft, clientWidth } = walletContainerRef.current;
    if (clientWidth > 0) {
      const page = Math.round(scrollLeft / clientWidth);
      setActiveWalletPageIndex(Math.min(walletPages.length - 1, Math.max(0, page)));
    }
  };

  const scrollToWalletPage = (pageIdx: number) => {
    if (!walletContainerRef.current) return;
    walletContainerRef.current.scrollTo({
      left: pageIdx * walletContainerRef.current.clientWidth,
      behavior: 'smooth'
    });
    setActiveWalletPageIndex(pageIdx);
  };

  // Common Transaction fields
  const [amount, setAmount] = useState<string>('');
  const [adminFee, setAdminFee] = useState<string>('');
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [selectedToWalletId, setSelectedToWalletId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(getLocalDateString());

  // Budgeting fields
  const [budgetLimit, setBudgetLimit] = useState<string>('');
  const [budgetMonth, setBudgetMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [budgetSelectedCategoryIds, setBudgetSelectedCategoryIds] = useState<string[]>(['all']);
  const [budgetSelectedWalletIds, setBudgetSelectedWalletIds] = useState<string[]>(['all']);

  // Tabungan fields
  const [savingName, setSavingName] = useState<string>('');
  const [savingTarget, setSavingTarget] = useState<string>('');
  const [savingCurrent, setSavingCurrent] = useState<string>('');
  const [savingDeadline, setSavingDeadline] = useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return getLocalDateString(d);
  });

  // Aktivitas fields
  const [activityTitle, setActivityTitle] = useState<string>('');
  const [activityDesc, setActivityDesc] = useState<string>('');
  const [activityDeadline, setActivityDeadline] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return getLocalDateString(d);
  });

  // Wishlist fields
  const [wishlistTitle, setWishlistTitle] = useState<string>('');
  const [wishlistMonth, setWishlistMonth] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [wishlistNotes, setWishlistNotes] = useState<string>('');

  // Date picker open state
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);

  // Histori / Duplicate Data Modal State
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateSearchQuery, setDuplicateSearchQuery] = useState('');

  // Initialize wallet defaults
  useEffect(() => {
    if (wallets.length > 0) {
      if (!selectedWalletId || !wallets.some(w => w.id === selectedWalletId)) {
        setSelectedWalletId(wallets[0].id);
      }
      if (!selectedToWalletId || !wallets.some(w => w.id === selectedToWalletId)) {
        const other = wallets.find(w => w.id !== wallets[0].id) || wallets[0];
        setSelectedToWalletId(other.id);
      }
    }
  }, [wallets, selectedWalletId, selectedToWalletId]);

  // Initialize category & source defaults
  useEffect(() => {
    if (categories.length > 0 && (!selectedCategoryId || !categories.some(c => c.id === selectedCategoryId))) {
      setSelectedCategoryId(categories[0].id);
    }
    if (sources.length > 0 && (!selectedSourceId || !sources.some(s => s.id === selectedSourceId))) {
      setSelectedSourceId(sources[0].id);
    }
  }, [categories, sources, selectedCategoryId, selectedSourceId]);

  // Sync initial tab or editData
  useEffect(() => {
    if (initialTab) {
      setActiveForm(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (editData) {
      if (editData.amount !== undefined) {
        setAmount(editData.amount.toString());
        setDate(editData.date || new Date().toISOString().split('T')[0]);
        setDescription(editData.description || '');
        if (editData.walletId) setSelectedWalletId(editData.walletId);
        if (editData.toWalletId) setSelectedToWalletId(editData.toWalletId);
        if (editData.adminFee) setAdminFee(editData.adminFee.toString());
        if (editData.categoryId) setSelectedCategoryId(editData.categoryId);
        if (editData.sourceId) setSelectedSourceId(editData.sourceId);
      }
      if (editData.limitAmount !== undefined || editData.monthlyLimit !== undefined) {
        const lim = editData.limitAmount !== undefined ? editData.limitAmount : editData.monthlyLimit;
        setBudgetLimit(lim.toString());
        setBudgetMonth(editData.month || '');
        setBudgetSelectedCategoryIds(editData.categoryIds || (editData.categoryId ? [editData.categoryId] : ['all']));
        setBudgetSelectedWalletIds(editData.walletIds || (editData.walletId ? [editData.walletId] : ['all']));
      }
      if (editData.targetAmount !== undefined) {
        setSavingName(editData.name || '');
        setSavingTarget(editData.targetAmount.toString());
        setSavingCurrent((editData.currentAmount || 0).toString());
        setSavingDeadline(editData.deadline || '');
      }
      if (editData.deadline && editData.title && !editData.month) {
        setActivityTitle(editData.title || '');
        setActivityDesc(editData.description || '');
        setActivityDeadline(editData.deadline || '');
      }
      if (editData.month && editData.title) {
        setWishlistTitle(editData.title || '');
        setWishlistMonth(editData.month || '');
        setWishlistNotes(editData.notes || '');
      }
    }
  }, [editData]);

  // Helper parsers
  const parseAmountInput = (val: string) => {
    if (!val) return 0;
    const cleanStr = val.toString().replace(/[^0-9]/g, '');
    const num = parseInt(cleanStr, 10);
    return isNaN(num) ? 0 : num;
  };

  const currentNumericAmount = parseAmountInput(amount);

  // Date Navigation Helpers
  const changeDateByDays = (days: number) => {
    const current = new Date(date);
    current.setDate(current.getDate() + days);
    setDate(getLocalDateString(current));
  };

  const isToday = useMemo(() => {
    const today = getLocalDateString();
    return date === today;
  }, [date]);

  const isYesterday = useMemo(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date === getLocalDateString(yesterday);
  }, [date]);

  const formattedDateLabel = useMemo(() => {
    if (isToday) return 'Hari Ini';
    if (isYesterday) return 'Kemarin';
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, [date, isToday, isYesterday]);

  // Quick Amount Shortcut handlers
  const addQuickAmount = (val: number) => {
    const next = currentNumericAmount + val;
    setAmount(next.toString());
  };

  const multiplyByThousand = () => {
    const next = currentNumericAmount > 0 ? currentNumericAmount * 1000 : 100000;
    setAmount(next.toString());
  };

  // Duplicate / Clone Data Handler
  const handleApplyDuplicate = (item: any) => {
    if (activeForm === 'pengeluaran' || activeForm === 'pemasukan') {
      if (item.amount) setAmount(item.amount.toString());
      if (item.walletId) setSelectedWalletId(item.walletId);
      if (item.categoryId) setSelectedCategoryId(item.categoryId);
      if (item.sourceId) setSelectedSourceId(item.sourceId);
      if (item.description) setDescription(item.description);
      setDate(getLocalDateString());
      triggerNotification?.('Data Berhasil Disalin', `Data ${activeForm} disalin ke formulir dengan tanggal hari ini`, 'success');
    } else if (activeForm === 'transfer') {
      if (item.amount) setAmount(item.amount.toString());
      if (item.walletId) setSelectedWalletId(item.walletId);
      if (item.toWalletId) setSelectedToWalletId(item.toWalletId);
      if (item.adminFee) setAdminFee(item.adminFee.toString());
      if (item.description) setDescription(item.description);
      setDate(getLocalDateString());
      triggerNotification?.('Data Berhasil Disalin', 'Data transfer disalin ke formulir dengan tanggal hari ini', 'success');
    } else if (activeForm === 'budgeting') {
      const lim = item.limitAmount || item.monthlyLimit || 0;
      setBudgetLimit(lim.toString());
      if (item.categoryIds) setBudgetSelectedCategoryIds(item.categoryIds);
      else if (item.categoryId) setBudgetSelectedCategoryIds([item.categoryId]);
      if (item.walletIds) setBudgetSelectedWalletIds(item.walletIds);
      else if (item.walletId) setBudgetSelectedWalletIds([item.walletId]);
      triggerNotification?.('Data Berhasil Disalin', 'Batas anggaran bulanan berhasil disalin', 'success');
    } else if (activeForm === 'tabungan') {
      if (item.name) setSavingName(item.name);
      if (item.targetAmount) setSavingTarget(item.targetAmount.toString());
      setSavingCurrent('0');
      if (item.deadline) setSavingDeadline(item.deadline);
      triggerNotification?.('Data Berhasil Disalin', `Target tabungan "${item.name}" berhasil disalin`, 'success');
    } else if (activeForm === 'aktivitas') {
      if (item.title) setActivityTitle(item.title);
      if (item.description) setActivityDesc(item.description);
      if (item.deadline) setActivityDeadline(item.deadline);
      triggerNotification?.('Data Berhasil Disalin', `Aktivitas "${item.title}" berhasil disalin`, 'success');
    } else if (activeForm === 'wishlist') {
      if (item.title) setWishlistTitle(item.title);
      if (item.notes) setWishlistNotes(item.notes);
      if (item.month) setWishlistMonth(item.month);
      triggerNotification?.('Data Berhasil Disalin', `Wishlist "${item.title}" berhasil disalin`, 'success');
    }

    setShowDuplicateModal(false);
  };

  // Duplicate candidates filtered by activeForm & duplicateSearchQuery
  const duplicateCandidates = useMemo(() => {
    const q = duplicateSearchQuery.toLowerCase().trim();

    if (activeForm === 'pengeluaran') {
      const filtered = recentTransactions.filter(t => t.type === 'pengeluaran');
      if (!q) return filtered;
      return filtered.filter(t => 
        (t.description || '').toLowerCase().includes(q) ||
        categories.find(c => c.id === t.categoryId)?.name.toLowerCase().includes(q) ||
        wallets.find(w => w.id === t.walletId)?.name.toLowerCase().includes(q)
      );
    }

    if (activeForm === 'pemasukan') {
      const filtered = recentTransactions.filter(t => t.type === 'pemasukan');
      if (!q) return filtered;
      return filtered.filter(t => 
        (t.description || '').toLowerCase().includes(q) ||
        sources.find(s => s.id === t.sourceId)?.name.toLowerCase().includes(q) ||
        wallets.find(w => w.id === t.walletId)?.name.toLowerCase().includes(q)
      );
    }

    if (activeForm === 'transfer') {
      const filtered = recentTransactions.filter(t => t.type === 'transfer');
      if (!q) return filtered;
      return filtered.filter(t => 
        (t.description || '').toLowerCase().includes(q) ||
        wallets.find(w => w.id === t.walletId)?.name.toLowerCase().includes(q) ||
        wallets.find(w => w.id === t.toWalletId)?.name.toLowerCase().includes(q)
      );
    }

    if (activeForm === 'budgeting') {
      if (!q) return budgets;
      return budgets.filter(b => (b.month || '').toLowerCase().includes(q));
    }

    if (activeForm === 'tabungan') {
      if (!q) return savings;
      return savings.filter(s => (s.name || '').toLowerCase().includes(q));
    }

    if (activeForm === 'aktivitas') {
      if (!q) return activities;
      return activities.filter(a => 
        (a.title || '').toLowerCase().includes(q) ||
        (a.description || '').toLowerCase().includes(q)
      );
    }

    if (activeForm === 'wishlist') {
      if (!q) return wishlists;
      return wishlists.filter(w => 
        (w.title || '').toLowerCase().includes(q) ||
        (w.notes || '').toLowerCase().includes(q)
      );
    }

    return [];
  }, [activeForm, duplicateSearchQuery, recentTransactions, budgets, savings, activities, wishlists, categories, sources, wallets]);

  // Handle Save
  const handleSave = () => {
    if (activeForm === 'pengeluaran' || activeForm === 'pemasukan') {
      if (currentNumericAmount <= 0) {
        triggerNotification?.('Jumlah Tidak Valid', 'Masukkan nominal transaksi yang valid', 'warning');
        return;
      }
      if (!selectedWalletId) {
        triggerNotification?.('Pilih Dompet', 'Silakan pilih dompet transaksi terlebih dahulu', 'warning');
        return;
      }

      const txData: Omit<Transaction, 'id'> = {
        type: activeForm,
        amount: currentNumericAmount,
        date,
        walletId: selectedWalletId,
        categoryId: activeForm === 'pengeluaran' ? selectedCategoryId : undefined,
        sourceId: activeForm === 'pemasukan' ? selectedSourceId : undefined,
        description: description.trim() || (activeForm === 'pengeluaran' ? 'Pengeluaran' : 'Pendapatan')
      };

      if (isEdit && editData?.id && onUpdateTransaction) {
        onUpdateTransaction(editData.id, txData);
        triggerNotification?.('Transaksi Diperbarui', 'Perubahan transaksi berhasil disimpan', 'success');
      } else {
        onAddTransaction(txData);
      }
    } else if (activeForm === 'transfer') {
      if (currentNumericAmount <= 0) {
        triggerNotification?.('Jumlah Tidak Valid', 'Masukkan nominal transfer yang valid', 'warning');
        return;
      }
      if (!selectedWalletId || !selectedToWalletId) {
        triggerNotification?.('Pilih Dompet', 'Pilih dompet asal dan dompet tujuan', 'warning');
        return;
      }
      if (selectedWalletId === selectedToWalletId) {
        triggerNotification?.('Dompet Sama', 'Dompet asal dan tujuan tidak boleh sama', 'warning');
        return;
      }

      const adminFeeNum = parseAmountInput(adminFee);
      const txData: Omit<Transaction, 'id'> = {
        type: 'transfer',
        amount: currentNumericAmount,
        adminFee: adminFeeNum > 0 ? adminFeeNum : undefined,
        date,
        walletId: selectedWalletId,
        toWalletId: selectedToWalletId,
        description: description.trim() || 'Transfer Antar Dompet'
      };

      if (isEdit && editData?.id && onUpdateTransaction) {
        onUpdateTransaction(editData.id, txData);
        triggerNotification?.('Transfer Diperbarui', 'Perubahan transfer berhasil disimpan', 'success');
      } else {
        onAddTransaction(txData);
      }
    } else if (activeForm === 'budgeting') {
      const limitNum = parseAmountInput(budgetLimit);
      if (limitNum <= 0) {
        triggerNotification?.('Limit Tidak Valid', 'Masukkan batas anggaran bulanan yang valid', 'warning');
        return;
      }

      const budgetData: Omit<Budget, 'id'> = {
        limitAmount: limitNum,
        categoryId: budgetSelectedCategoryIds[0] || 'all',
        month: budgetMonth,
        categoryIds: budgetSelectedCategoryIds.includes('all') ? ['all'] : budgetSelectedCategoryIds,
        walletIds: budgetSelectedWalletIds.includes('all') ? ['all'] : budgetSelectedWalletIds
      };

      if (isEdit && editData?.id && onUpdateBudget) {
        onUpdateBudget(editData.id, budgetData);
        triggerNotification?.('Anggaran Diperbarui', 'Batas anggaran bulanan berhasil diperbarui', 'success');
      } else {
        onAddBudget(budgetData);
      }
    } else if (activeForm === 'tabungan') {
      const targetNum = parseAmountInput(savingTarget);
      const currentNum = parseAmountInput(savingCurrent);
      if (!savingName.trim()) {
        triggerNotification?.('Nama Tabungan Wajib', 'Masukkan nama target tabungan', 'warning');
        return;
      }
      if (targetNum <= 0) {
        triggerNotification?.('Target Tidak Valid', 'Masukkan target nominal tabungan yang valid', 'warning');
        return;
      }

      const savingData: Omit<Saving, 'id'> = {
        name: savingName.trim(),
        targetAmount: targetNum,
        currentAmount: currentNum,
        deadline: savingDeadline,
        color: '#10b981'
      };

      if (isEdit && editData?.id && onUpdateSaving) {
        onUpdateSaving(editData.id, savingData);
        triggerNotification?.('Tabungan Diperbarui', 'Target tabungan berhasil diperbarui', 'success');
      } else {
        onAddSaving(savingData);
      }
    } else if (activeForm === 'aktivitas') {
      if (!activityTitle.trim()) {
        triggerNotification?.('Judul Wajib', 'Masukkan judul aktivitas harian', 'warning');
        return;
      }

      const actData: Omit<Activity, 'id'> = {
        title: activityTitle.trim(),
        description: activityDesc.trim(),
        deadline: activityDeadline,
        status: 'pending'
      };

      if (isEdit && editData?.id && onUpdateActivity) {
        onUpdateActivity(editData.id, actData);
        triggerNotification?.('Aktivitas Diperbarui', 'Aktivitas berhasil diperbarui', 'success');
      } else {
        onAddActivity(actData);
      }
    } else if (activeForm === 'wishlist') {
      if (!wishlistTitle.trim()) {
        triggerNotification?.('Nama Wishlist Wajib', 'Masukkan nama barang wishlist', 'warning');
        return;
      }

      const wishData: Omit<Wishlist, 'id' | 'isPurchased' | 'createdAt'> = {
        title: wishlistTitle.trim(),
        month: wishlistMonth,
        notes: wishlistNotes.trim() || undefined
      };

      if (isEdit && editData?.id && onUpdateWishlist) {
        onUpdateWishlist(editData.id, wishData);
        triggerNotification?.('Wishlist Diperbarui', 'Barang wishlist berhasil diperbarui', 'success');
      } else {
        onAddWishlist(wishData);
      }
    }

    onBack();
  };

  // Clean Neutral Input Class without purple ring
  const cleanInputClass = "w-full px-4 py-3 text-xs sm:text-sm font-medium rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 ring-0 focus:ring-0";

  return (
    <div className="flex flex-col" id="view-tambah-data">
      
      {/* =======================================================
          1. HERO BANNER BACKGROUND LAYER
         ======================================================= */}
      <div className="relative -mx-4 sm:-mx-6 -mt-1 z-0 overflow-hidden bg-[#FF7777] text-white rounded-b-none pt-7 sm:pt-9 px-4 sm:px-6 pb-24 sm:pb-28 lg:pb-32">
        {/* Authentic Indonesian Songket Weave Vector Motif */}
        <div 
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 22%, rgba(0, 0, 0, 0.4) 45%, rgba(0, 0, 0, 0.9) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 22%, rgba(0, 0, 0, 0.4) 45%, rgba(0, 0, 0, 0.9) 100%)'
          }}
        >
          <svg className="w-full h-full opacity-35 mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="tambah-songket-pattern-v18" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 48 24 L 24 48 L 0 24 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M 24 6 L 42 24 L 24 42 L 6 24 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <path d="M 24 12 L 36 24 L 24 36 L 12 24 Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
                <polygon points="24,18 27,24 24,30 21,24" fill="currentColor" fillOpacity="0.6" />
                <polygon points="18,24 24,21 30,24 24,27" fill="currentColor" fillOpacity="0.6" />
                <rect x="23" y="23" width="2" height="2" fill="white" />
                <path d="M 0 0 L 6 6 M 48 0 L 42 6 M 0 48 L 6 42 M 48 48 L 42 42" stroke="currentColor" strokeWidth="1.2" />
                <polygon points="0,0 4,0 0,4" fill="currentColor" fillOpacity="0.4" />
                <polygon points="48,0 44,0 48,4" fill="currentColor" fillOpacity="0.4" />
                <polygon points="0,48 4,48 0,44" fill="currentColor" fillOpacity="0.4" />
                <polygon points="48,48 44,48 48,44" fill="currentColor" fillOpacity="0.4" />
                <line x1="24" y1="0" x2="24" y2="6" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1,1" />
                <line x1="24" y1="42" x2="24" y2="48" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1,1" />
                <line x1="0" y1="24" x2="6" y2="24" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1,1" />
                <line x1="42" y1="24" x2="48" y2="24" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1,1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#tambah-songket-pattern-v18)" />
          </svg>

          {/* Luminous soft atmospheric glow */}
          <div className="absolute right-0 bottom-0 w-72 h-40 bg-rose-500/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-10 bottom-0 w-64 h-32 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Foreground in Banner: Tabs + Scroll Dots + Centered Histori Data Button */}
        <div className="relative z-10 pt-3 sm:pt-4 pb-1">
          {/* Tabs Container */}
          <div 
            ref={tabsContainerRef}
            onScroll={handleTabsScroll}
            className="flex overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory"
          >
            {tabPages.map((page, pIdx) => (
              <div key={pIdx} className="w-full shrink-0 grid grid-cols-3 gap-2 px-0.5 snap-start">
                {page.map((tab) => {
                  const isActive = activeForm === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveForm(tab.id)}
                      className={`w-full py-2.5 px-2 rounded-2xl text-xs font-black text-center truncate transition-all duration-150 cursor-pointer ${
                        isActive 
                          ? 'bg-white text-[#FF5555] shadow-lg font-black scale-100' 
                          : 'text-white hover:bg-white/20 bg-white/10 backdrop-blur-xs border border-white/20'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Clickable Pagination Dots for Tabs */}
          {tabPages.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-2 pb-1">
              {tabPages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToTabPage(idx)}
                  className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                    activeTabPageIndex === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Tombol Histori Data: Diturunkan sedikit lagi */}
          <div className="flex items-center justify-center pt-5 sm:pt-6 pb-0.5">
            <button
              type="button"
              onClick={() => {
                setDuplicateSearchQuery('');
                setShowDuplicateModal(true);
              }}
              title="Histori Data yang Lalu"
              className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 text-white border border-white/30 backdrop-blur-md text-xs font-black shadow-xs transition duration-150 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-rose-100" />
              <span>Histori Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* =======================================================
          2. MAIN ENCLOSING SHEET CARD (-mt-20.4 sm:-mt-22.4 lg:-mt-24.4 -> -mt-[81.6px] sm:-mt-[89.6px] lg:-mt-[97.6px])
         ======================================================= */}
      <div className={`relative z-10 -mx-4 sm:-mx-6 -mt-[81.6px] sm:-mt-[89.6px] lg:-mt-[97.6px] -mb-28 min-h-[calc(100vh-180px)] ${enclosingCardRadiusClass} ${enclosingCardBgClass} p-4 sm:p-6 lg:p-8 pt-6 sm:pt-8 pb-36 sm:pb-40 space-y-4 sm:space-y-5`}>

        {/* DATE SELECTOR BAR (Black Vector Calendar with < > navigation) */}
        {(activeForm === 'pengeluaran' || activeForm === 'pemasukan' || activeForm === 'transfer') && (
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl px-4 py-3 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <button
              type="button"
              onClick={() => changeDateByDays(-1)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Hari Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowDatePickerModal(true)}
              className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white hover:opacity-80 transition cursor-pointer px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Calendar className="w-4 h-4 text-slate-900 dark:text-white shrink-0 stroke-[2.2]" />
              <span>{formattedDateLabel}</span>
            </button>

            <button
              type="button"
              onClick={() => changeDateByDays(1)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Hari Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* HERO AMOUNT DISPLAY CARD (100% Dead Center Nominal & Rp) */}
        {(activeForm === 'pengeluaran' || activeForm === 'pemasukan' || activeForm === 'transfer') && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              {activeForm === 'pengeluaran' ? 'Nominal Pengeluaran' : activeForm === 'pemasukan' ? 'Nominal Pendapatan' : 'Nominal Transfer'}
            </span>

            {/* Centered Nominal Input Container */}
            <div className="w-full flex items-center justify-center text-center my-1">
              <div className="inline-flex items-center justify-center gap-2 max-w-full">
                <span className="text-2xl sm:text-3xl font-black text-slate-400 dark:text-slate-500 font-mono select-none shrink-0">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                  className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-slate-900 dark:text-white bg-transparent outline-none border-none text-left p-0 m-0"
                  style={{
                    width: `${Math.max(1, (amount || '0').length) * 28 + 12}px`,
                    maxWidth: 'calc(100vw - 160px)'
                  }}
                />
              </div>
            </div>

            {currentNumericAmount > 0 && (
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2">
                {formatIDR(currentNumericAmount)}
              </span>
            )}

            {/* Quick Amount Shortcuts Pills */}
            <div className="flex items-center gap-2 mt-5 flex-wrap justify-center">
              <button
                type="button"
                onClick={multiplyByThousand}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-black text-slate-700 dark:text-slate-200 transition active:scale-95 cursor-pointer"
              >
                +000
              </button>
              <button
                type="button"
                onClick={() => addQuickAmount(10000)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition active:scale-95 cursor-pointer"
              >
                +10rb
              </button>
              <button
                type="button"
                onClick={() => addQuickAmount(50000)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition active:scale-95 cursor-pointer"
              >
                +50rb
              </button>
              <button
                type="button"
                onClick={() => addQuickAmount(100000)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition active:scale-95 cursor-pointer"
              >
                +100rb
              </button>
            </div>
          </div>
        )}

        {/* MAIN FORM INPUTS CARD */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          
          {/* PENGELUARAN & PEMASUKAN FORM DETAILS */}
          {(activeForm === 'pengeluaran' || activeForm === 'pemasukan') && (
            <>
              {/* Wallet Selector Section (PILIH DOMPET) - 2 items strictly per page with ZERO cut-off! */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Pilih Dompet
                </label>

                <div 
                  ref={walletContainerRef}
                  onScroll={handleWalletScroll}
                  className="flex overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory"
                >
                  {walletPages.map((page, pIdx) => (
                    <div key={pIdx} className="w-full shrink-0 grid grid-cols-2 gap-2.5 px-0.5 snap-start">
                      {page.map((w: any) => {
                        if (w.isAdd) {
                          return (
                            <button
                              key={w.id}
                              type="button"
                              onClick={onOpenManageWallets}
                              className="w-full flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                              <Plus className="w-4 h-4 shrink-0" />
                              <span className="truncate">Tambah Akun</span>
                            </button>
                          );
                        }

                        const isSelected = selectedWalletId === w.id;
                        return (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => setSelectedWalletId(w.id)}
                            style={isSelected ? {
                              backgroundColor: resolvedAccent,
                              borderColor: resolvedAccent,
                              color: '#ffffff'
                            } : undefined}
                            className={`w-full flex items-center justify-center gap-2 py-3 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                              isSelected 
                                ? 'shadow-xs scale-100' 
                                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <IconRenderer name={w.icon || 'Wallet'} className="w-4 h-4 shrink-0" />
                            <span className="truncate">{w.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Clickable Pagination Dots for Wallets */}
                {walletPages.length > 1 && (
                  <div className="flex items-center justify-center gap-1.5 pt-1.5">
                    {walletPages.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => scrollToWalletPage(idx)}
                        className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                          activeWalletPageIndex === idx 
                            ? 'w-4 bg-slate-700 dark:bg-slate-300' 
                            : 'w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                        }`}
                        aria-label={`Dompet Halaman ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Category or Source Dropdown Card */}
              {activeForm === 'pengeluaran' ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Kategori Pengeluaran
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                      className={cleanInputClass + " appearance-none cursor-pointer pr-10"}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronRight className="w-4 h-4 rotate-90" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Sumber Pendapatan
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSourceId}
                      onChange={(e) => setSelectedSourceId(e.target.value)}
                      className={cleanInputClass + " appearance-none cursor-pointer pr-10"}
                    >
                      {sources.map((s) => (
                        <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronRight className="w-4 h-4 rotate-90" />
                    </div>
                  </div>
                </div>
              )}

              {/* Note / Description input (DESKRIPSI with neutral outline) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Deskripsi
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Silahkan masukkan teks"
                  className={cleanInputClass}
                />
              </div>
            </>
          )}

          {/* TRANSFER FORM DETAILS */}
          {activeForm === 'transfer' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Dompet Asal (Dari)
                  </label>
                  <select
                    value={selectedWalletId}
                    onChange={(e) => setSelectedWalletId(e.target.value)}
                    className={cleanInputClass}
                  >
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Dompet Tujuan (Ke)
                  </label>
                  <select
                    value={selectedToWalletId}
                    onChange={(e) => setSelectedToWalletId(e.target.value)}
                    className={cleanInputClass}
                  >
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Admin Fee Input with live spelled out nominal */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Biaya Admin (Opsional)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-xs text-slate-400">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={adminFee}
                    onChange={(e) => setAdminFee(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0"
                    className={cleanInputClass + " pl-10 font-mono"}
                  />
                </div>
                {parseAmountInput(adminFee) > 0 && (
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 pl-1">
                    = {formatIDR(parseAmountInput(adminFee))}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Deskripsi
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Silahkan masukkan teks"
                  className={cleanInputClass}
                />
              </div>
            </>
          )}

          {/* BUDGETING FORM DETAILS */}
          {activeForm === 'budgeting' && (() => {
            const isAllWals = budgetSelectedWalletIds.includes('all') || (wallets.length > 0 && budgetSelectedWalletIds.length === wallets.length);
            const isAllCats = budgetSelectedCategoryIds.includes('all') || (categories.length > 0 && budgetSelectedCategoryIds.length === categories.length);

            const toggleAllWallets = () => {
              setBudgetSelectedWalletIds(isAllWals ? [] : ['all']);
            };

            const toggleSingleWallet = (wId: string) => {
              if (isAllWals) {
                const remaining = wallets.filter(w => w.id !== wId).map(w => w.id);
                setBudgetSelectedWalletIds(remaining);
              } else {
                if (budgetSelectedWalletIds.includes(wId)) {
                  setBudgetSelectedWalletIds(budgetSelectedWalletIds.filter(id => id !== wId));
                } else {
                  const next = [...budgetSelectedWalletIds, wId];
                  setBudgetSelectedWalletIds(next.length === wallets.length ? ['all'] : next);
                }
              }
            };

            const isWalletActive = (wId: string) => isAllWals || budgetSelectedWalletIds.includes(wId);

            const toggleAllCategories = () => {
              setBudgetSelectedCategoryIds(isAllCats ? [] : ['all']);
            };

            const toggleSingleCategory = (cId: string) => {
              if (isAllCats) {
                const remaining = categories.filter(c => c.id !== cId).map(c => c.id);
                setBudgetSelectedCategoryIds(remaining);
              } else {
                if (budgetSelectedCategoryIds.includes(cId)) {
                  setBudgetSelectedCategoryIds(budgetSelectedCategoryIds.filter(id => id !== cId));
                } else {
                  const next = [...budgetSelectedCategoryIds, cId];
                  setBudgetSelectedCategoryIds(next.length === categories.length ? ['all'] : next);
                }
              }
            };

            const isCategoryActive = (cId: string) => isAllCats || budgetSelectedCategoryIds.includes(cId);

            return (
              <>
                {/* Monthly Spending Limit (Rp) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Batas Belanja Bulanan (Rp)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-xs text-slate-400">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={budgetLimit}
                      onChange={(e) => setBudgetLimit(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Estimasi limit pengeluaran"
                      className={cleanInputClass + " pl-10 pr-16 font-mono"}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const cur = parseAmountInput(budgetLimit);
                        setBudgetLimit(cur > 0 ? (cur * 1000).toString() : '1000000');
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[10px] font-black bg-purple-100 dark:bg-slate-800 text-purple-700 dark:text-purple-300 rounded-xl hover:bg-purple-200 transition cursor-pointer"
                    >
                      +000
                    </button>
                  </div>
                  {parseAmountInput(budgetLimit) > 0 && (
                    <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 pl-1">
                      = {formatIDR(parseAmountInput(budgetLimit))}
                    </span>
                  )}
                </div>

                {/* Month Picker */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Bulan Anggaran
                  </label>
                  <input
                    type="month"
                    value={budgetMonth}
                    onChange={(e) => setBudgetMonth(e.target.value)}
                    className={cleanInputClass}
                    required
                  />
                </div>

                {/* Wallets Multi-Select */}
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Pilih Dompet / Akun
                    </label>
                    <button
                      type="button"
                      onClick={toggleAllWallets}
                      className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      {isAllWals ? 'Batal Pilih Semua' : 'Pilih Semua'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                    <button
                      type="button"
                      onClick={toggleAllWallets}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-left transition cursor-pointer ${
                        isAllWals
                          ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 text-purple-950 dark:text-purple-200'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0">
                          <Layers className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold truncate">Semua Dompet (Global)</span>
                      </div>
                      {isAllWals && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                    </button>

                    {wallets.map((w) => {
                      const active = isWalletActive(w.id);
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => toggleSingleWallet(w.id)}
                          className={`flex items-center justify-between p-3 rounded-2xl border text-left transition cursor-pointer ${
                            active && !isAllWals
                              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 text-purple-950 dark:text-purple-200'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div 
                              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${w.color || '#6366f1'}20`, color: w.color || '#6366f1' }}
                            >
                              <IconRenderer name={w.icon || 'Wallet'} className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold truncate">{w.name}</span>
                          </div>
                          {active && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Category Multi-Select with Color Badges */}
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Pilih Kategori Pengeluaran
                    </label>
                    <button
                      type="button"
                      onClick={toggleAllCategories}
                      className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      {isAllCats ? 'Batal Pilih Semua' : 'Pilih Semua'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                    <button
                      type="button"
                      onClick={toggleAllCategories}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-left transition cursor-pointer ${
                        isAllCats
                          ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 text-purple-950 dark:text-purple-200'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0">
                          <Layers className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold truncate">Semua Kategori (Batas Total)</span>
                      </div>
                      {isAllCats && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                    </button>

                    {categories.map((c) => {
                      const active = isCategoryActive(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => toggleSingleCategory(c.id)}
                          className={`flex items-center justify-between p-3 rounded-2xl border text-left transition cursor-pointer ${
                            active && !isAllCats
                              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 text-purple-950 dark:text-purple-200'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div 
                              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${c.color || '#64748b'}22`, color: c.color || '#64748b' }}
                            >
                              <IconRenderer name={c.icon || 'Tag'} className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold truncate">{c.name}</span>
                          </div>
                          {active && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            );
          })()}

          {/* TABUNGAN FORM DETAILS */}
          {activeForm === 'tabungan' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Nama Target Tabungan
                </label>
                <input
                  type="text"
                  value={savingName}
                  onChange={(e) => setSavingName(e.target.value)}
                  placeholder="Beli Laptop Baru, Liburan, Dana Darurat..."
                  className={cleanInputClass}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Target Jumlah (Rp)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={savingTarget}
                      onChange={(e) => setSavingTarget(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="0"
                      className={cleanInputClass + " pr-14 font-mono"}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const cur = parseAmountInput(savingTarget);
                        setSavingTarget(cur > 0 ? (cur * 1000).toString() : '1000000');
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[10px] font-black bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300 rounded-xl hover:bg-amber-200 transition cursor-pointer"
                    >
                      +000
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Dana Terkumpul Awal (Rp)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={savingCurrent}
                      onChange={(e) => setSavingCurrent(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="0"
                      className={cleanInputClass + " pr-14 font-mono"}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const cur = parseAmountInput(savingCurrent);
                        setSavingCurrent(cur > 0 ? (cur * 1000).toString() : '100000');
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[10px] font-black bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300 rounded-xl hover:bg-amber-200 transition cursor-pointer"
                    >
                      +000
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Target Tanggal Selesai
                </label>
                <input
                  type="date"
                  value={savingDeadline}
                  onChange={(e) => setSavingDeadline(e.target.value)}
                  className={cleanInputClass}
                  required
                />
              </div>
            </>
          )}

          {/* AKTIVITAS FORM DETAILS */}
          {activeForm === 'aktivitas' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Judul Aktivitas Harian
                </label>
                <input
                  type="text"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="Belajar Coding, Bayar BPJS, Servis Motor..."
                  className={cleanInputClass}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Detail Deskripsi / Catatan
                </label>
                <textarea
                  value={activityDesc}
                  onChange={(e) => setActivityDesc(e.target.value)}
                  placeholder="Keterangan singkat rincian tugas atau agenda..."
                  rows={3}
                  className={cleanInputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Batas Waktu (Deadline)
                </label>
                <input
                  type="date"
                  value={activityDeadline}
                  onChange={(e) => setActivityDeadline(e.target.value)}
                  className={cleanInputClass}
                  required
                />
              </div>
            </>
          )}

          {/* WISHLIST FORM DETAILS */}
          {activeForm === 'wishlist' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Nama Barang Wishlist
                </label>
                <input
                  type="text"
                  value={wishlistTitle}
                  onChange={(e) => setWishlistTitle(e.target.value)}
                  placeholder="Sepatu Adidas Samba, Meja Kerja, Monitor..."
                  className={cleanInputClass}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Target Bulan Rencana
                </label>
                <input
                  type="month"
                  value={wishlistMonth}
                  onChange={(e) => setWishlistMonth(e.target.value)}
                  className={cleanInputClass}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Catatan Tambahan
                </label>
                <textarea
                  value={wishlistNotes}
                  onChange={(e) => setWishlistNotes(e.target.value)}
                  placeholder="Keterangan toko, tautan produk, atau varian..."
                  rows={3}
                  className={cleanInputClass}
                />
              </div>
            </>
          )}

        </div>

        {/* SINGLE THEMED SUBMIT BUTTON (Simpan) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSave}
            style={settings.themeColor === 'custom' ? { backgroundColor: resolvedAccent, color: '#ffffff' } : undefined}
            className={`w-full py-4 px-6 rounded-2xl font-black text-sm shadow-md hover:shadow-lg transition active:scale-98 cursor-pointer text-center ${getAccentBg()}`}
          >
            {isEdit ? 'Simpan Perubahan' : 'Simpan'}
          </button>
        </div>

      </div>

      {/* Date Picker Dialog with X Close Button (No Hari ini / Kemarin) */}
      {showDatePickerModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setShowDatePickerModal(false)}
        >
          <div 
            className="w-full max-w-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Pilih Tanggal</h4>
              <button 
                type="button" 
                onClick={() => setShowDatePickerModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setShowDatePickerModal(false);
              }}
              className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-bold outline-none focus:border-slate-400"
            />
          </div>
        </div>
      )}

      {/* =======================================================
          HISTORI DATA MODAL SHEET (Rendered via createPortal to document.body with z-[99999] covering top bar & bottom nav)
         ======================================================= */}
      {showDuplicateModal && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
          onClick={() => setShowDuplicateModal(false)}
        >
          <div 
            className="w-full sm:max-w-md h-[520px] max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header & Search Container (Fixed at top without X button) */}
            <div className="shrink-0 space-y-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <Download className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                    Histori {FORM_TABS.find(t => t.id === activeForm)?.label || 'Data'}
                  </h4>
                </div>
              </div>

              {/* Search Input Filter & Reset Filter Button */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={duplicateSearchQuery}
                    onChange={(e) => setDuplicateSearchQuery(e.target.value)}
                    placeholder={`Cari histori ${activeForm}...`}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold outline-none focus:border-slate-400"
                  />
                </div>

                {duplicateSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setDuplicateSearchQuery('')}
                    title="Reset Filter"
                    className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* List of Previous Data to Duplicate (Scrollable area) */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pt-3 pr-0.5">
              {duplicateCandidates.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <RotateCcw className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Belum ada histori {FORM_TABS.find(t => t.id === activeForm)?.label.toLowerCase()} yang tersimpan
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-xs">
                    Setelah Anda menyimpan transaksi atau data baru, data tersebut akan muncul di sini untuk bisa disalin kapan saja.
                  </p>
                </div>
              ) : (
                duplicateCandidates.map((item: any, idx: number) => {
                  if (activeForm === 'pengeluaran' || activeForm === 'pemasukan') {
                    const cat = categories.find(c => c.id === item.categoryId);
                    const src = sources.find(s => s.id === item.sourceId);
                    const wal = wallets.find(w => w.id === item.walletId);

                    return (
                      <button
                        key={item.id || idx}
                        type="button"
                        onClick={() => handleApplyDuplicate(item)}
                        className="w-full p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition flex items-center justify-between gap-3 group cursor-pointer shadow-3xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {item.description || (activeForm === 'pengeluaran' ? 'Pengeluaran' : 'Pendapatan')}
                            </span>
                            {cat && (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                                {cat.name}
                              </span>
                            )}
                            {src && (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                                {src.name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                            <span>{wal?.name || 'Dompet'}</span>
                            <span>•</span>
                            <span>{item.date}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-xs font-black font-mono ${
                            activeForm === 'pengeluaran' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {formatIDR(item.amount)}
                          </span>
                          <span className="block text-[10px] font-bold text-purple-600 dark:text-purple-400 group-hover:underline">
                            Salin ➜
                          </span>
                        </div>
                      </button>
                    );
                  }

                  if (activeForm === 'transfer') {
                    const fromWal = wallets.find(w => w.id === item.walletId);
                    const toWal = wallets.find(w => w.id === item.toWalletId);

                    return (
                      <button
                        key={item.id || idx}
                        type="button"
                        onClick={() => handleApplyDuplicate(item)}
                        className="w-full p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition flex items-center justify-between gap-3 group cursor-pointer shadow-3xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-white mb-1">
                            <span className="truncate">{fromWal?.name || 'Asal'}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{toWal?.name || 'Tujuan'}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate block">
                            {item.description || 'Transfer Antar Dompet'}
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-black font-mono text-blue-600 dark:text-blue-400">
                            {formatIDR(item.amount)}
                          </span>
                          <span className="block text-[10px] font-bold text-purple-600 dark:text-purple-400 group-hover:underline">
                            Salin ➜
                          </span>
                        </div>
                      </button>
                    );
                  }

                  if (activeForm === 'budgeting') {
                    const lim = item.limitAmount || item.monthlyLimit || 0;
                    return (
                      <button
                        key={item.id || idx}
                        type="button"
                        onClick={() => handleApplyDuplicate(item)}
                        className="w-full p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition flex items-center justify-between gap-3 group cursor-pointer shadow-3xs"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-black text-slate-900 dark:text-white block truncate mb-1">
                            Bulan {item.month || 'Periode'}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {item.categoryIds?.includes('all') ? 'Semua Kategori' : `${item.categoryIds?.length || 1} Kategori Terpilih`}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black font-mono text-purple-600 dark:text-purple-400">
                            {formatIDR(lim)}
                          </span>
                          <span className="block text-[10px] font-bold text-purple-600 dark:text-purple-400 group-hover:underline">
                            Salin ➜
                          </span>
                        </div>
                      </button>
                    );
                  }

                  if (activeForm === 'tabungan') {
                    return (
                      <button
                        key={item.id || idx}
                        type="button"
                        onClick={() => handleApplyDuplicate(item)}
                        className="w-full p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition flex items-center justify-between gap-3 group cursor-pointer shadow-3xs"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-black text-slate-900 dark:text-white block truncate mb-1">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            Deadline: {item.deadline || '-'}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black font-mono text-amber-600 dark:text-amber-400">
                            {formatIDR(item.targetAmount)}
                          </span>
                          <span className="block text-[10px] font-bold text-purple-600 dark:text-purple-400 group-hover:underline">
                            Salin ➜
                          </span>
                        </div>
                      </button>
                    );
                  }

                  if (activeForm === 'aktivitas') {
                    return (
                      <button
                        key={item.id || idx}
                        type="button"
                        onClick={() => handleApplyDuplicate(item)}
                        className="w-full p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition flex items-center justify-between gap-3 group cursor-pointer shadow-3xs"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-black text-slate-900 dark:text-white block truncate mb-1">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1">
                            {item.description || 'Tidak ada deskripsi'}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 group-hover:underline">
                            Salin ➜
                          </span>
                        </div>
                      </button>
                    );
                  }

                  if (activeForm === 'wishlist') {
                    return (
                      <button
                        key={item.id || idx}
                        type="button"
                        onClick={() => handleApplyDuplicate(item)}
                        className="w-full p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition flex items-center justify-between gap-3 group cursor-pointer shadow-3xs"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-black text-slate-900 dark:text-white block truncate mb-1">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1">
                            {item.notes || `Bulan ${item.month}`}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 group-hover:underline">
                            Salin ➜
                          </span>
                        </div>
                      </button>
                    );
                  }

                  return null;
                })
              )}
            </div>

            {/* Footer with Tutup Button */}
            <div className="shrink-0 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowDuplicateModal(false)}
                className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-black transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
