/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  Plus,
  Bell,
  Trash2,
  Edit2,
  Filter,
  Download,
  CheckCircle,
  Circle,
  AlertTriangle,
  X,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Layers,
  Sparkles,
  Search,
  Calendar,
  Check,
  CheckSquare,
  Bookmark,
  Share2,
  Tv,
  ArrowUpRight,
  ChevronRight,
  Info,
  Palette
} from 'lucide-react';

import {
  Wallet,
  Category,
  IncomeSource,
  Transaction,
  Saving,
  Budget,
  Activity,
  Wishlist,
  NotificationItem,
  UserProfile,
  UserSettings,
  ThemeColor,
  FontStyle,
  UIStyle,
  CardStyle,
  CardRadius,
  TableStyle
} from './types';

import { IconRenderer } from './components/IconRenderer';

import {
  DEFAULT_WALLETS,
  DEFAULT_CATEGORIES,
  DEFAULT_SOURCES,
  DEFAULT_TRANSACTIONS,
  DEFAULT_BUDGETS,
  DEFAULT_SAVINGS,
  DEFAULT_ACTIVITIES,
  DEFAULT_WISHLISTS,
  DEFAULT_NOTIFICATIONS
} from './data';

import BottomNav from './components/BottomNav';
import WalletCard from './components/WalletCard';
import NotificationPanel from './components/NotificationPanel';
import ProfileDropdown from './components/ProfileDropdown';
import FormsModal from './components/FormsModal';
import { TrendChart, CategoryPieChart, SourcePieChart } from './components/InteractiveCharts';

import { formatIDR } from './lib/formatters';

import { DashboardView } from './components/views/DashboardView';
import { TransactionsView } from './components/views/TransactionsView';
import { SavingsView } from './components/views/SavingsView';
import { BudgetsView } from './components/views/BudgetsView';
import { ActivitiesView } from './components/views/ActivitiesView';
import { KelolaView } from './components/views/KelolaView';

import { SplashView } from './components/views/SplashView';
import { AuthView } from './components/views/AuthView';

export default function App() {
  const [appState, setAppState] = useState<'splash' | 'auth' | 'main'>('splash');
  
  // --- Persistent States ---
  const [wallets, setWallets] = useState<Wallet[]>(() => {
    const saved = localStorage.getItem('fin_wallets');
    return saved ? JSON.parse(saved) : DEFAULT_WALLETS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('fin_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [sources, setSources] = useState<IncomeSource[]>(() => {
    const saved = localStorage.getItem('fin_sources');
    return saved ? JSON.parse(saved) : DEFAULT_SOURCES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('fin_transactions');
    return saved ? JSON.parse(saved) : DEFAULT_TRANSACTIONS;
  });

  const [savings, setSavings] = useState<Saving[]>(() => {
    const saved = localStorage.getItem('fin_savings');
    return saved ? JSON.parse(saved) : DEFAULT_SAVINGS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('fin_budgets');
    return saved ? JSON.parse(saved) : DEFAULT_BUDGETS;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('fin_activities');
    return saved ? JSON.parse(saved) : DEFAULT_ACTIVITIES;
  });

  const [wishlists, setWishlists] = useState<Wishlist[]>(() => {
    const saved = localStorage.getItem('fin_wishlists');
    return saved ? JSON.parse(saved) : DEFAULT_WISHLISTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('fin_notifications');
    return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('fin_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: fix old paths that contained /src/assets/images
      if (parsed.avatar && typeof parsed.avatar === 'string' && parsed.avatar.includes('/src/assets/images')) {
        parsed.avatar = parsed.avatar.includes('male') ? '/male_avatar.jpg' : '/female_avatar.jpg';
        localStorage.setItem('fin_profile', JSON.stringify(parsed));
      }
      return parsed;
    }
    return { name: 'Rifqi Thoohaa', avatar: '/male_avatar.jpg' };
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('fin_settings');
    const defaultSettings: UserSettings = {
      uiStyle: 'glass',
      cardStyle: 'shadowed',
      cardRadius: 'rounded',
      tableStyle: 'compact',
      fontStyle: 'sans',
      themeColor: 'indigo',
      isDarkMode: false
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge saved settings with defaults to keep all properties intact
        return { ...defaultSettings, ...parsed };
      } catch (e) {
        return defaultSettings;
      }
    }
    
    return defaultSettings;
  });

  // --- UI/Interaction States ---
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeActivitiesSubTab, setActiveActivitiesSubTab] = useState<'agenda' | 'wishlist'>('agenda');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalFormTab, setModalFormTab] = useState<'pengeluaran' | 'pemasukan' | 'budgeting' | 'tabungan' | 'aktivitas' | 'wishlist'>('pengeluaran');
  const [modalEditData, setModalEditData] = useState<any>(null);
  
  // PWA Install prompt state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Edit states
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  
  // Filters States
  const [txTypeFilter, setTxTypeFilter] = useState<'semua' | 'pemasukan' | 'pengeluaran'>('semua');
  const [txCategoryFilter, setTxCategoryFilter] = useState<string>('semua');
  const [txWalletFilter, setTxWalletFilter] = useState<string>('semua');
  const [txSearch, setTxSearch] = useState<string>('');
  const [txDateFilter, setTxDateFilter] = useState<string>('');
  const [txMonthFilter, setTxMonthFilter] = useState<string>('');
  const [txYearFilter, setTxYearFilter] = useState<string>('');

  // Saving filter
  const [savingFilter, setSavingFilter] = useState<'semua' | 'berjalan' | 'tercapai'>('semua');

  // Transaction show all toggle
  const [showAllTransactions, setShowAllTransactions] = useState<boolean>(false);

  const showConfirm = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' | 'info' = 'warning') => {
    const isDark = settings.isDarkMode;
    Swal.fire({
      title: title,
      text: message,
      icon: type === 'danger' ? 'error' : type,
      showCancelButton: true,
      confirmButtonText: 'Konfirmasi',
      cancelButtonText: 'Batal',
      confirmButtonColor: type === 'danger' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#6366f1',
      cancelButtonColor: '#94a3b8',
      background: isDark ? '#1e293b' : '#ffffff',
      color: isDark ? '#f8fafc' : '#1e293b',
      customClass: {
        popup: 'rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        onConfirm();
      }
    });
  };

  const showAlert = (title: string, message: string) => {
    const isDark = settings.isDarkMode;
    Swal.fire({
      title: title,
      text: message,
      icon: 'warning',
      confirmButtonText: 'Selesai',
      confirmButtonColor: '#6366f1',
      background: isDark ? '#1e293b' : '#ffffff',
      color: isDark ? '#f8fafc' : '#1e293b',
      customClass: {
        popup: 'rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl',
      }
    });
  };

  // --- Sync to LocalStorage ---
  useEffect(() => {
    localStorage.setItem('fin_wallets', JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem('fin_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('fin_sources', JSON.stringify(sources));
  }, [sources]);

  useEffect(() => {
    localStorage.setItem('fin_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('fin_savings', JSON.stringify(savings));
  }, [savings]);

  useEffect(() => {
    localStorage.setItem('fin_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('fin_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('fin_wishlists', JSON.stringify(wishlists));
  }, [wishlists]);

  useEffect(() => {
    localStorage.setItem('fin_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('fin_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('fin_settings', JSON.stringify(settings));
    // Apply styling properties dynamically
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (settings.isDarkMode) {
      document.documentElement.classList.add('dark');
      if (metaThemeColor) metaThemeColor.setAttribute("content", "#020617");
    } else {
      document.documentElement.classList.remove('dark');
      if (metaThemeColor) metaThemeColor.setAttribute("content", "#f8fafc");
    }

    // Apply font
    let fontFamilyStr = "'Plus Jakarta Sans', sans-serif";
    switch (settings.fontStyle) {
      case 'jakarta': fontFamilyStr = "'Plus Jakarta Sans', sans-serif"; break;
      case 'grotesk': fontFamilyStr = "'Space Grotesk', sans-serif"; break;
      case 'ios': fontFamilyStr = "-apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Text', 'Segoe UI', Roboto, sans-serif"; break;
      case 'neobrutalism': fontFamilyStr = "'Epilogue', sans-serif"; break;
      case 'pixel': fontFamilyStr = "'Chakra Petch', sans-serif"; break;
      case 'mono': fontFamilyStr = "'JetBrains Mono', monospace"; break;
      case 'serif': fontFamilyStr = "'Playfair Display', serif"; break;
      case 'sans': default: fontFamilyStr = "'Plus Jakarta Sans', sans-serif"; break;
    }
    document.body.style.fontFamily = fontFamilyStr;
    document.documentElement.style.setProperty('--font-sans', fontFamilyStr);
    document.documentElement.style.setProperty('--font-display', fontFamilyStr);
  }, [settings]);

  // --- Clean slate check on mount ---
  useEffect(() => {
    const hasCleared = localStorage.getItem('fin_clean_slate_2026_v5');
    if (!hasCleared) {
      localStorage.setItem('fin_clean_slate_2026_v5', 'true');
      
      // Reset inputs to clean slate
      localStorage.setItem('fin_transactions', JSON.stringify([]));
      localStorage.setItem('fin_savings', JSON.stringify([]));
      localStorage.setItem('fin_budgets', JSON.stringify([]));
      localStorage.setItem('fin_activities', JSON.stringify([]));
      localStorage.setItem('fin_wishlists', JSON.stringify([]));
      localStorage.setItem('fin_notifications', JSON.stringify([]));
      
      setTransactions([]);
      setSavings([]);
      setBudgets([]);
      setActivities([]);
      setWishlists([]);
      setNotifications([]);
      
      // Set to single default wallet
      localStorage.setItem('fin_wallets', JSON.stringify(DEFAULT_WALLETS));
      setWallets(DEFAULT_WALLETS);
    }
  }, []);

  // --- Manage Wallet Form States & Handlers ---
  const [walletEditId, setWalletEditId] = useState<string | null>(null);
  const [walletFormName, setWalletFormName] = useState<string>('');
  const [walletFormBalance, setWalletFormBalance] = useState<string>('');
  const [walletFormIcon, setWalletFormIcon] = useState<string>('💵');

  const startEditWallet = (w: Wallet) => {
    setWalletEditId(w.id);
    setWalletFormName(w.name);
    setWalletFormBalance(w.initialBalance.toString());
    setWalletFormIcon(w.icon || 'Wallet');
  };

  const resetWalletForm = () => {
    setWalletEditId(null);
    setWalletFormName('');
    setWalletFormBalance('');
    setWalletFormIcon('💵');
  };

  const handleSaveWallet = (e: React.FormEvent) => {
    e.preventDefault();
    const balance = parseFloat(walletFormBalance) || 0;
    if (walletEditId) {
      // Editing
      setWallets(prev => prev.map(w => w.id === walletEditId ? { ...w, name: walletFormName, initialBalance: balance, icon: walletFormIcon } : w));
      triggerNotification('✏️ Dompet Diperbarui', `Dompet "${walletFormName}" berhasil disimpan.`, 'info');
    } else {
      // Adding
      const newWallet: Wallet = {
        id: `w-${Date.now()}`,
        name: walletFormName,
        initialBalance: balance,
        icon: walletFormIcon,
        color: '#4f46e5'
      };
      setWallets(prev => [...prev, newWallet]);
      triggerNotification('Dompet Ditambahkan', `Dompet baru "${walletFormName}" telah aktif.`, 'success');
    }
    resetWalletForm();
  };

  // --- Manage Category Form States & Handlers ---
  const [categoryEditId, setCategoryEditId] = useState<string | null>(null);
  const [categoryFormName, setCategoryFormName] = useState<string>('');
  const [categoryFormIcon, setCategoryFormIcon] = useState<string>('');

  const startEditCategory = (c: Category) => {
    setCategoryEditId(c.id);
    setCategoryFormName(c.name);
    setCategoryFormIcon(c.icon || 'Utensils');
  };

  const resetCategoryForm = () => {
    setCategoryEditId(null);
    setCategoryFormName('');
    setCategoryFormIcon('');
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryEditId) {
      setCategories(prev => prev.map(c => c.id === categoryEditId ? { ...c, name: categoryFormName, icon: categoryFormIcon } : c));
      triggerNotification('✏️ Kategori Diperbarui', `Kategori "${categoryFormName}" berhasil disimpan.`, 'info');
    } else {
      const newCategory: Category = {
        id: `c-${Date.now()}`,
        name: categoryFormName,
        icon: categoryFormIcon,
        color: '#ef4444'
      };
      setCategories(prev => [...prev, newCategory]);
      triggerNotification('Kategori Ditambahkan', `Kategori baru "${categoryFormName}" telah aktif.`, 'success');
    }
    resetCategoryForm();
  };

  const handleDeleteCategory = (id: string) => {
    if (categories.length <= 1) {
      showAlert('Aksi Ditolak', 'Sistem harus memiliki minimal satu kategori!');
      return;
    }
    showConfirm(
      'Hapus Kategori',
      'Yakin ingin menghapus kategori ini? Transaksi terkait tidak akan dihapus, namun mungkin kehilangan referensi kategori aslinya.',
      () => {
        setCategories(prev => prev.filter(c => c.id !== id));
        triggerNotification('Kategori Dihapus', 'Kategori berhasil dihapus.', 'info');
      },
      'danger'
    );
  };

  // --- Manage Source Form States & Handlers ---
  const [sourceEditId, setSourceEditId] = useState<string | null>(null);
  const [sourceFormName, setSourceFormName] = useState<string>('');
  const [sourceFormIcon, setSourceFormIcon] = useState<string>('');

  const startEditSource = (s: IncomeSource) => {
    setSourceEditId(s.id);
    setSourceFormName(s.name);
    setSourceFormIcon(s.icon || 'Briefcase');
  };

  const resetSourceForm = () => {
    setSourceEditId(null);
    setSourceFormName('');
    setSourceFormIcon('');
  };

  const handleSaveSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceEditId) {
      setSources(prev => prev.map(s => s.id === sourceEditId ? { ...s, name: sourceFormName, icon: sourceFormIcon } : s));
      triggerNotification('✏️ Sumber Diperbarui', `Sumber "${sourceFormName}" berhasil disimpan.`, 'info');
    } else {
      const newSource: IncomeSource = {
        id: `s-${Date.now()}`,
        name: sourceFormName,
        icon: sourceFormIcon,
        color: '#10b981'
      };
      setSources(prev => [...prev, newSource]);
      triggerNotification('Sumber Ditambahkan', `Sumber pendapatan baru "${sourceFormName}" telah aktif.`, 'success');
    }
    resetSourceForm();
  };

  const handleDeleteSource = (id: string) => {
    if (sources.length <= 1) {
      showAlert('Aksi Ditolak', 'Sistem harus memiliki minimal satu sumber pendapatan!');
      return;
    }
    showConfirm(
      'Hapus Sumber',
      'Yakin ingin menghapus sumber pendapatan ini?',
      () => {
        setSources(prev => prev.filter(s => s.id !== id));
        triggerNotification('Sumber Dihapus', 'Sumber pendapatan berhasil dihapus.', 'info');
      },
      'danger'
    );
  };

  // Catch PWA beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const triggerPWAInstall = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User menerima instalasi PWA');
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    });
  };

  // --- Math/Financial Computations ---
  // Wallets with calculated current balance based on transactions
  const walletsWithCurrentBalance = wallets.map(w => {
    const incomes = transactions
      .filter(t => t.type === 'pemasukan' && t.walletId === w.id)
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'pengeluaran' && t.walletId === w.id)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      ...w,
      currentBalance: w.initialBalance + incomes - expenses
    };
  });

  // Total Wallet Balance = Sum of all Wallet static initial balances
  const totalWalletBalance = wallets.reduce((sum, w) => sum + w.initialBalance, 0);
  
  // Total Income = Sum of incomes
  const totalIncome = transactions
    .filter((t) => t.type === 'pemasukan')
    .reduce((sum, t) => sum + t.amount, 0);

  // Total Expense = Sum of expenses
  const totalExpense = transactions
    .filter((t) => t.type === 'pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0);

  // Total Main Balance (Total Saldo Utama) = Initial Wallets + Incomes - Expenses
  const totalSaldoUtama = totalWalletBalance + totalIncome - totalExpense;

  // --- Notification triggers & warnings ---
  const triggerNotification = (title: string, message: string, type: 'info' | 'warning' | 'success') => {
    const newNotif: NotificationItem = {
      id: `n-${Date.now()}`,
      title,
      message,
      date: 'Baru saja',
      isRead: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Standard centered SweetAlert
    Swal.fire({
      icon: type,
      title: title,
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#6366f1',
      background: settings.isDarkMode ? '#1e293b' : '#ffffff',
      color: settings.isDarkMode ? '#f8fafc' : '#1e293b',
      customClass: {
        popup: 'rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl',
      }
    });
  };

  const openAddModal = (tab: 'pengeluaran' | 'pemasukan' | 'budgeting' | 'tabungan' | 'aktivitas' | 'wishlist' = 'pengeluaran', editData: any = null) => {
    setModalFormTab(tab);
    setModalEditData(editData);
    setIsAddModalOpen(true);
  };

  const handleUpdateTransaction = (id: string, data: any) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    triggerNotification('Transaksi Diperbarui', 'Perubahan transaksi berhasil disimpan.', 'success');
  };

  const handleUpdateBudget = (id: string, data: any) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
    triggerNotification('Anggaran Diperbarui', 'Perubahan batas anggaran berhasil disimpan.', 'info');
  };

  const handleUpdateSaving = (id: string, data: any) => {
    setSavings(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    triggerNotification('Target Tabungan Diperbarui', 'Perubahan target tabungan berhasil disimpan.', 'success');
  };

  const handleUpdateActivity = (id: string, data: any) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
    triggerNotification('Aktivitas Diperbarui', 'Perubahan rencana aktivitas berhasil disimpan.', 'info');
  };

  const handleUpdateWishlist = (id: string, data: { title: string; month: string; price?: number; notes?: string }) => {
    setWishlists(prev => prev.map(w => w.id === id ? { ...w, ...data } : w));
    triggerNotification('Wishlist Diperbarui', 'Perubahan daftar keinginan berhasil disimpan.', 'info');
  };

  // --- Add Entities Handlers ---
  const handleAddTransaction = (data: {
    type: 'pemasukan' | 'pengeluaran';
    amount: number;
    description: string;
    date: string;
    walletId: string;
    categoryId?: string;
    sourceId?: string;
  }) => {
    const newTx: Transaction = {
      id: `t-${Date.now()}`,
      ...data
    };
    setTransactions(prev => [newTx, ...prev]);
    
    // Warn budget limits if expense added
    if (data.type === 'pengeluaran' && data.categoryId) {
      const txMonth = data.date.slice(0, 7); // e.g. "2026-06"
      const budget = budgets.find((b) => b.categoryId === data.categoryId && b.month === txMonth);
      if (budget) {
        const budgetLimit = budget.limitAmount;
        // Calculate other expenses in the same category and same month
        const catExpenses = transactions
          .filter((t) => t.type === 'pengeluaran' && t.categoryId === data.categoryId && t.date.slice(0, 7) === txMonth)
          .reduce((sum, t) => sum + t.amount, 0) + data.amount;
        
        const catName = categories.find(c => c.id === data.categoryId)?.name || '';
        
        if (catExpenses > budgetLimit) {
          triggerNotification(
            '🚨 Anggaran Melebihi Batas!',
            `Peringatan: Pengeluaran bulanan kategori ${catName} telah melebihi batas anggaran Rp ${budgetLimit.toLocaleString('id-ID')}! (Tercatat: Rp ${catExpenses.toLocaleString('id-ID')})`,
            'warning'
          );
          // Highlight with immediate custom alert so user is fully aware
          setTimeout(() => {
            showAlert(
              'NOTIFIKASI PERINGATAN!',
              `Pengeluaran untuk kategori [ ${catName} ] telah MELEBIHI batas anggaran bulan ini!\n\nBatas Anggaran: Rp ${budgetLimit.toLocaleString('id-ID')}\nTotal Pengeluaran: Rp ${catExpenses.toLocaleString('id-ID')}`
            );
          }, 100);
        } else if (catExpenses > budgetLimit * 0.8) {
          triggerNotification(
            'Anggaran Mendekati Limit',
            `Pengeluaran kategori ${catName} telah mencapai 80% dari batas Rp ${budgetLimit.toLocaleString('id-ID')}`,
            'warning'
          );
        }
      }
    }

    triggerNotification(
      data.type === 'pemasukan' ? 'Pemasukan Baru' : 'Pengeluaran Baru',
      `${data.description} sebesar ${formatIDR(data.amount)} berhasil dicatat.`,
      'success'
    );
  };

  const handleAddBudget = (data: { categoryId: string; limitAmount: number; month: string }) => {
    const newBudget: Budget = {
      id: `b-${Date.now()}`,
      ...data
    };
    setBudgets(prev => [newBudget, ...prev]);
    triggerNotification('🎯 Anggaran Baru Diatur', 'Batas anggaran bulanan untuk kategori berhasil disimpan.', 'info');
  };

  const handleAddSaving = (data: { name: string; targetAmount: number; currentAmount: number; deadline: string; color: string }) => {
    const newSaving: Saving = {
      id: `sv-${Date.now()}`,
      ...data
    };
    setSavings(prev => [newSaving, ...prev]);
    triggerNotification('🎯 Target Tabungan Baru', `Menabung untuk "${data.name}" berhasil dibuat.`, 'success');
  };

  const handleAddActivity = (data: { title: string; description: string; deadline: string }) => {
    const newActivity: Activity = {
      id: `a-${Date.now()}`,
      ...data,
      status: 'pending'
    };
    setActivities(prev => [newActivity, ...prev]);
    triggerNotification('Aktivitas Harian Ditambah', `Aktivitas "${data.title}" siap dikerjakan.`, 'info');
  };

  const handleAddWishlist = (data: { title: string; month: string; price?: number; notes?: string }) => {
    const newWish: Wishlist = {
      id: `wl-${Date.now()}`,
      ...data,
      isPurchased: false
    };
    setWishlists(prev => [newWish, ...prev]);
    triggerNotification('Wishlist Ditambahkan', `Barang impian "${data.title}" masuk dalam daftar keinginan.`, 'info');
  };

  // --- Wallet Quick Actions ---

  // --- Edit/Delete Handlers ---
  const handleUpdateWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWallet) return;
    setWallets(prev => prev.map(w => w.id === editingWallet.id ? editingWallet : w));
    setEditingWallet(null);
    triggerNotification('✏️ Dompet Diperbarui', 'Detail dompet berhasil disimpan.', 'info');
  };

  const handleDeleteWallet = (id: string) => {
    if (wallets.length <= 1) {
      showAlert('Aksi Ditolak', 'Sistem harus memiliki minimal satu dompet utama!');
      return;
    }
    showConfirm(
      'Hapus Dompet',
      'Yakin ingin menghapus dompet ini? Transaksi yang berkaitan akan tetap ada namun dompet akan dihapus.',
      () => {
        setWallets(prev => prev.filter(w => w.id !== id));
        triggerNotification('Dompet Dihapus', 'Dompet berhasil dibersihkan dari sistem.', 'info');
      },
      'danger'
    );
  };

  const handleDeleteTransaction = (id: string) => {
    showConfirm(
      'Hapus Transaksi',
      'Hapus transaksi ini dari riwayat?',
      () => {
        setTransactions(prev => prev.filter(t => t.id !== id));
        triggerNotification('Transaksi Dihapus', 'Riwayat transaksi dibersihkan.', 'info');
      },
      'danger'
    );
  };

  const handleDeleteSaving = (id: string) => {
    showConfirm(
      'Hapus Target Tabungan',
      'Hapus target tabungan ini?',
      () => {
        setSavings(prev => prev.filter(s => s.id !== id));
        triggerNotification('Tabungan Dihapus', 'Target tabungan dibersihkan.', 'info');
      },
      'danger'
    );
  };

  const handleToggleActivity = (id: string) => {
    setActivities(prev => prev.map(a => {
      if (a.id === id) {
        const nextStatus = a.status === 'completed' ? 'pending' : 'completed';
        if (nextStatus === 'completed') {
          triggerNotification('🎉 Aktivitas Selesai!', `Kerja bagus! Aktivitas "${a.title}" telah diselesaikan.`, 'success');
        }
        return { ...a, status: nextStatus };
      }
      return a;
    }));
  };

  const handleDeleteActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  const handleToggleWishlist = (id: string) => {
    setWishlists(prev => prev.map(w => {
      if (w.id === id) {
        const nextPurchased = !w.isPurchased;
        if (nextPurchased) {
          triggerNotification('Wishlist Terbeli!', `Selamat! Wishlist "${w.title}" telah Anda beli.`, 'success');
        }
        return { ...w, isPurchased: nextPurchased };
      }
      return w;
    }));
  };

  const handleDeleteWishlist = (id: string) => {
    setWishlists(prev => prev.filter(w => w.id !== id));
  };

  const handleSavingAddAmount = (id: string, amountStr: string) => {
    const val = parseFloat(amountStr);
    if (isNaN(val) || val <= 0) return;
    setSavings(prev => prev.map(s => {
      if (s.id === id) {
        const newAmt = s.currentAmount + val;
        if (newAmt >= s.targetAmount) {
          triggerNotification('🎯 Target Tabungan Selesai!', `Selamat! Tabungan "${s.name}" telah mencapai target Rp ${s.targetAmount.toLocaleString('id-ID')}!`, 'success');
        }
        return { ...s, currentAmount: newAmt };
      }
      return s;
    }));
  };

  // --- Reset/Export Actions ---
  const handleDeleteAllData = () => {
    showConfirm(
      'Hapus Seluruh Data',
      'PERINGATAN! Anda akan menghapus semua data transaksi, tabungan, aktivitas, wishlist, dan kustomisasi. Tindakan ini tidak dapat dibatalkan.',
      () => {
        showConfirm(
          'Konfirmasi Akhir',
          'Apakah Anda benar-benar yakin ingin menghapus keseluruhan data sistem secara permanen?',
          () => {
            localStorage.clear();
            setWallets(DEFAULT_WALLETS);
            setCategories(DEFAULT_CATEGORIES);
            setSources(DEFAULT_SOURCES);
            setTransactions([]);
            setSavings([]);
            setBudgets([]);
            setActivities([]);
            setWishlists([]);
            setNotifications([]);
            setSettings({
              uiStyle: 'modern',
              cardStyle: 'shadowed',
              cardRadius: 'rounded',
              tableStyle: 'compact',
              fontStyle: 'sans',
              themeColor: 'indigo',
              isDarkMode: false
            });
            triggerNotification('Reset Sistem Selesai', 'Seluruh database telah dikembalikan ke kondisi awal.', 'warning');
            showAlert('Sistem Berhasil Direset', 'Seluruh data di sistem Anda telah berhasil dihapus!');
          },
          'danger'
        );
      },
      'danger'
    );
  };

  const handleExportCSV = () => {
    let csv = '\uFEFF'; // Excel UTF-8 BOM
    csv += '=== LAPORAN TRANSAKSI ===\n';
    csv += 'ID,Tipe,Nominal,Keterangan,Tanggal,Dompet,Kategori/Sumber\n';
    transactions.forEach(t => {
      const wallet = wallets.find(w => w.id === t.walletId)?.name || '';
      const catOrSrc = t.type === 'pengeluaran'
        ? categories.find(c => c.id === t.categoryId)?.name || ''
        : sources.find(s => s.id === t.sourceId)?.name || '';
      csv += `"${t.id}","${t.type}",${t.amount},"${t.description.replace(/"/g, '""')}","${t.date}","${wallet}","${catOrSrc}"\n`;
    });

    csv += '\n=== LAPORAN TABUNGAN ===\n';
    csv += 'Nama Target,Target Nominal,Terkumpul,Tenggat Waktu\n';
    savings.forEach(s => {
      csv += `"${s.name.replace(/"/g, '""')}",${s.targetAmount},${s.currentAmount},"${s.deadline}"\n`;
    });

    csv += '\n=== ANGGARAN BULANAN ===\n';
    csv += 'Kategori,Batas Belanja,Bulan\n';
    budgets.forEach(b => {
      const cat = categories.find(c => c.id === b.categoryId)?.name || '';
      csv += `"${cat}",${b.limitAmount},"${b.month}"\n`;
    });

    csv += '\n=== AKTIVITAS HARIAN ===\n';
    csv += 'Judul,Deskripsi,Batas Waktu,Status\n';
    activities.forEach(a => {
      csv += `"${a.title.replace(/"/g, '""')}","${a.description.replace(/"/g, '""')}","${a.deadline}","${a.status}"\n`;
    });

    csv += '\n=== DAFTAR WISHLIST ===\n';
    csv += 'Barang Impian,Target Bulan,Status Dibeli\n';
    wishlists.forEach(w => {
      csv += `"${w.title.replace(/"/g, '""')}","${w.month}","${w.isPurchased ? 'Terbeli' : 'Rencana'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Laporan_Sistem_Keuangan_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleExportPDF = (startDate: string, endDate: string) => {
    // Generate beautiful self-contained printable report HTML page with robust tables & style settings
    const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    // Filter transactions by date range
    const filteredTransactions = transactions.filter(t => t.date >= startDate && t.date <= endDate);

    // Calculate deep insights
    const totalIncome = filteredTransactions.filter(t => t.type === 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filteredTransactions.filter(t => t.type === 'pengeluaran').reduce((sum, t) => sum + t.amount, 0);
    const netSavingsRate = totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : '0.0';
    const completedActivities = activities.filter(a => a.status === 'selesai' || a.status === 'done').length;
    const purchasedWishlists = wishlists.filter(w => w.isPurchased).length;

    // 1. Transactions List Table rows
    let rowsHtml = '';
    filteredTransactions.forEach((t, index) => {
      const wallet = wallets.find(w => w.id === t.walletId)?.name || 'Dompet Utama';
      const catOrSrc = t.type === 'pengeluaran'
        ? categories.find(c => c.id === t.categoryId)?.name || 'Pengeluaran'
        : sources.find(s => s.id === t.sourceId)?.name || 'Pemasukan';
      const isIncome = t.type === 'pemasukan';
      rowsHtml += `
        <tr class="${index % 2 === 1 ? 'stripe-row' : ''}">
          <td style="text-align: center; font-weight: bold; color: #64748b;">${index + 1}</td>
          <td style="font-weight: 700; color: #0f172a;">${t.description}</td>
          <td style="text-align: center;">
            <span class="badge ${isIncome ? 'badge-income' : 'badge-expense'}">
              ${isIncome ? 'PEMASUKAN' : 'PENGELUARAN'}
            </span>
          </td>
          <td>${wallet}</td>
          <td>${catOrSrc}</td>
          <td style="font-family: monospace; color: #64748b; font-size: 10px;">${new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
          <td class="amount font-mono" style="color: ${isIncome ? '#059669' : '#dc2626'};">
            ${isIncome ? '+' : '-'}${formatIDR(t.amount)}
          </td>
        </tr>
      `;
    });

    // 2. Savings List Table rows
    let savingsTableRows = '';
    savings.forEach((s, index) => {
      const pct = Math.min((s.currentAmount / s.targetAmount) * 100, 100);
      const sisa = Math.max(s.targetAmount - s.currentAmount, 0);
      const isDone = s.currentAmount >= s.targetAmount;
      savingsTableRows += `
        <tr class="${index % 2 === 1 ? 'stripe-row' : ''}">
          <td style="text-align: center; font-weight: bold; color: #64748b;">${index + 1}</td>
          <td style="font-weight: 700; color: #0f172a;">${s.name}</td>
          <td style="font-family: monospace; font-size: 10px;">${new Date(s.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
          <td class="amount font-mono" style="color: #059669;">${formatIDR(s.currentAmount)}</td>
          <td class="amount font-mono" style="color: #4f46e5;">${formatIDR(s.targetAmount)}</td>
          <td class="amount font-mono" style="color: ${sisa > 0 ? '#ea580c' : '#059669'};">${sisa > 0 ? formatIDR(sisa) : 'Selesai ✓'}</td>
          <td style="text-align: right; font-weight: bold; font-family: monospace; color: ${isDone ? '#059669' : '#4f46e5'};">${pct.toFixed(0)}%</td>
        </tr>
      `;
    });

    // 3. Budgets List Table rows
    let budgetsTableRows = '';
    budgets.forEach((b, index) => {
      const cat = categories.find(c => c.id === b.categoryId)?.name || 'Kategori Umum';
      const spent = transactions
        .filter(t => t.type === 'pengeluaran' && t.categoryId === b.categoryId)
        .reduce((sum, t) => sum + t.amount, 0);
      const pct = Math.min((spent / b.limitAmount) * 100, 100);
      const isOver = spent > b.limitAmount;
      const sisa = Math.max(b.limitAmount - spent, 0);
      budgetsTableRows += `
        <tr class="${index % 2 === 1 ? 'stripe-row' : ''}">
          <td style="text-align: center; font-weight: bold; color: #64748b;">${index + 1}</td>
          <td style="font-weight: 700; color: #0f172a;">${cat}</td>
          <td style="text-align: center; font-weight: bold; color: #64748b;">${b.month}</td>
          <td class="amount font-mono" style="color: ${isOver ? '#dc2626' : '#0f172a'}">${formatIDR(spent)}</td>
          <td class="amount font-mono" style="color: #4f46e5;">${formatIDR(b.limitAmount)}</td>
          <td class="amount font-mono" style="color: ${isOver ? '#dc2626' : '#059669'}">${sisa > 0 ? formatIDR(sisa) : 'Rp 0'}</td>
          <td style="text-align: right; font-weight: bold; color: ${isOver ? '#dc2626' : '#059669'}">${isOver ? 'Overlimit' : 'Aman'} (${pct.toFixed(0)}%)</td>
        </tr>
      `;
    });

    // 4. Wishlists Table rows
    let wishlistTableRows = '';
    wishlists.forEach((w, index) => {
      wishlistTableRows += `
        <tr class="${index % 2 === 1 ? 'stripe-row' : ''}">
          <td style="text-align: center; font-weight: bold; color: #64748b;">${index + 1}</td>
          <td style="font-weight: 700; color: #0f172a;">${w.title}</td>
          <td style="text-align: center; color: #4f46e5; font-weight: bold;">${w.month}</td>
          <td style="text-align: right;">
            <span class="badge ${w.isPurchased ? 'badge-income' : 'badge-neutral'}">
              ${w.isPurchased ? 'SUDAH DIBELI' : 'DAFTAR KEINGINAN'}
            </span>
          </td>
        </tr>
      `;
    });

    // 5. Activities Table rows
    let activitiesTableRows = '';
    activities.forEach((a, index) => {
      const isDone = a.status === 'selesai' || a.status === 'done';
      activitiesTableRows += `
        <tr class="${index % 2 === 1 ? 'stripe-row' : ''}">
          <td style="text-align: center; font-weight: bold; color: #64748b;">${index + 1}</td>
          <td style="font-weight: 700; color: #0f172a; ${isDone ? 'text-decoration: line-through; color: #94a3b8;' : ''}">${a.title}</td>
          <td style="font-weight: 500; color: #475569;">${a.category || 'Rencana'}</td>
          <td style="text-align: center;">
            <span class="badge ${a.priority === 'tinggi' ? 'badge-expense' : a.priority === 'sedang' ? 'badge-warning' : 'badge-neutral'}" style="font-size: 8px;">
              ${(a.priority || 'sedang').toUpperCase()}
            </span>
          </td>
          <td style="text-align: right;">
            <span class="badge ${isDone ? 'badge-income' : 'badge-info'}">
              ${isDone ? 'SELESAI' : 'BERJALAN'}
            </span>
          </td>
        </tr>
      `;
    });

    const reportHtml = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Laporan Keuangan & Kegiatan Lifeboard - ${dateStr}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700;800&display=swap');
    
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: #ffffff;
      color: #1e293b;
      margin: 0;
      padding: 40px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .report-container {
      max-width: 1000px;
      margin: 0 auto;
      background-color: #ffffff;
    }

    /* Print settings & controls topbar */
    .no-print {
      background: #0f172a;
      color: #ffffff;
      padding: 20px;
      border-radius: 16px;
      margin-bottom: 35px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.15);
    }
    .no-print-title {
      font-size: 13px;
      font-weight: 800;
      color: #38bdf8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0 0 4px 0;
    }
    .no-print-desc {
      font-size: 11px;
      color: #cbd5e1;
      margin: 0;
    }
    .print-btn {
      background: linear-gradient(135deg, #0ea5e9, #6366f1);
      color: #ffffff;
      border: none;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      padding: 12px 24px;
      border-radius: 10px;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .print-btn:hover {
      opacity: 0.9;
    }

    /* Executive Branding Header */
    .header-branding {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #0f172a;
      padding-bottom: 25px;
      margin-bottom: 30px;
    }
    .brand-title-group {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .brand-logo-badge {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background-color: #4f46e5;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-logo-text {
      color: #ffffff;
      font-size: 20px;
      font-weight: 900;
    }
    .brand-name {
      font-size: 26px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0;
    }
    .brand-subtitle {
      font-size: 10px;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-top: 4px;
      display: block;
    }
    .header-meta {
      text-align: right;
    }
    .meta-tag {
      font-size: 10px;
      font-weight: 900;
      color: #4f46e5;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      display: block;
    }
    .meta-date {
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      margin: 4px 0 0 0;
    }

    /* Executive KPI Bento Grid */
    .bento-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 35px;
    }
    .bento-card {
      border: 2px solid #0f172a;
      border-radius: 14px;
      padding: 15px;
      background-color: #ffffff;
      box-shadow: 4px 4px 0px #0f172a;
    }
    .bento-card.dark-card {
      background-color: #0f172a;
      color: #ffffff;
    }
    .bento-card h4 {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin: 0 0 10px 0;
    }
    .bento-card.dark-card h4 {
      color: #94a3b8;
    }
    .bento-card p {
      font-size: 17px;
      font-weight: 900;
      font-family: 'JetBrains Mono', monospace;
      margin: 0;
    }
    .bento-card.dark-card p {
      color: #38bdf8;
    }

    /* Section Styles */
    .section-title {
      font-size: 13px;
      font-weight: 900;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      border-bottom: 2.5px solid #0f172a;
      padding-bottom: 6px;
      margin-top: 35px;
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Robust Table Styles with Clear Borders */
    .report-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .report-table th {
      background-color: #0f172a !important;
      color: #ffffff !important;
      font-weight: 800;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 10px 12px;
      border: 1.5px solid #0f172a;
      text-align: left;
    }
    .report-table td {
      padding: 10px 12px;
      font-size: 11px;
      font-weight: 500;
      border: 1.5px solid #0f172a;
      color: #1e293b;
    }
    .report-table tr.stripe-row {
      background-color: #f8fafc !important;
    }
    .report-table .font-mono {
      font-family: 'JetBrains Mono', monospace;
    }
    .report-table .amount {
      font-weight: 800;
      font-size: 11px;
    }
    .report-table td.amount {
      text-align: right;
    }
    .report-table th.amount {
      text-align: right;
    }

    /* Badges */
    .badge {
      display: inline-block;
      font-size: 8px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid #0f172a;
    }
    .badge-income {
      background-color: #d1fae5;
      color: #065f46;
    }
    .badge-expense {
      background-color: #fee2e2;
      color: #991b1b;
    }
    .badge-warning {
      background-color: #fef3c7;
      color: #92400e;
    }
    .badge-info {
      background-color: #dbeafe;
      color: #1e40af;
    }
    .badge-neutral {
      background-color: #f1f5f9;
      color: #334155;
    }

    .empty-state {
      text-align: center;
      padding: 30px;
      font-style: italic;
      color: #64748b;
      font-weight: 500;
    }

    .page-break {
      page-break-before: always;
    }

    .footer-stamp {
      border-top: 1.5px solid #cbd5e1;
      margin-top: 50px;
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.05em;
    }

    @media print {
      .no-print {
        display: none !important;
      }
      body {
        padding: 0;
        background-color: #ffffff;
      }
      .bento-card {
        box-shadow: none !important;
      }
    }
  </style>
</head>
<body>

  <div class="report-container">
    
    <!-- Action Bar (Invisible in print PDF) -->
    <div class="no-print">
      <div>
        <h4 class="no-print-title">PRATINJAU LAPORAN EXECUTIVE - LIFEBOARD</h4>
        <p class="no-print-desc">Dokumen ini diformat khusus dengan batas sel tabel tebal &amp; warna kontras agar hasil cetak/PDF terlihat sempurna.</p>
      </div>
      <button onclick="window.print()" class="print-btn">
        🖨️ CETAK / SIMPAN KE PDF
      </button>
    </div>

    <!-- Header Branding -->
    <div class="header-branding">
      <div class="brand-title-group">
        <div class="brand-logo-badge">
          <span class="brand-logo-text">L</span>
        </div>
        <div>
          <h1 class="brand-name">Lifeboard</h1>
          <span class="brand-subtitle">Financial Organizer &amp; Life Dashboard</span>
        </div>
      </div>
      <div class="header-meta">
        <span class="meta-tag">LAPORAN BULANAN EKSEKUTIF</span>
        <p class="meta-date">Cetak: ${dateStr}</p>
      </div>
    </div>

    <!-- Bento Grid Summary -->
    <div class="bento-grid">
      <div class="bento-card dark-card">
        <h4>Sisa Saldo Kumulatif</h4>
        <p>${formatIDR(totalSaldoUtama)}</p>
      </div>
      <div class="bento-card">
        <h4>Total Arus Pemasukan</h4>
        <p style="color: #059669;">${formatIDR(totalIncome)}</p>
      </div>
      <div class="bento-card">
        <h4>Total Arus Pengeluaran</h4>
        <p style="color: #dc2626;">${formatIDR(totalExpense)}</p>
      </div>
      <div class="bento-card">
        <h4>Tingkat Tabungan</h4>
        <p style="color: #4f46e5;">${netSavingsRate}%</p>
      </div>
    </div>

    <!-- 1. RIWAYAT MUTASI & ARUS KAS -->
    <div class="section-title">1. Riwayat Arus Kas &amp; Mutasi Transaksi</div>
    <table class="report-table">
      <thead>
        <tr>
          <th style="width: 5%; text-align: center;">No</th>
          <th style="width: 32%">Deskripsi Transaksi</th>
          <th style="width: 18%; text-align: center;">Tipe</th>
          <th style="width: 15%">Dompet</th>
          <th style="width: 15%">Kategori / Aliran</th>
          <th style="width: 15%">Tanggal</th>
          <th class="amount" style="width: 10%">Jumlah</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml || '<tr><td colspan="7" class="empty-state">Belum ada riwayat transaksi terdaftar.</td></tr>'}
      </tbody>
    </table>

    <!-- 2. TARGET TABUNGAN DAN INVESTASI -->
    <div class="section-title">🎯 2. Target Tabungan &amp; Investasi</div>
    <table class="report-table">
      <thead>
        <tr>
          <th style="width: 5%; text-align: center;">No</th>
          <th style="width: 30%">Nama Target Tabungan</th>
          <th style="width: 15%">Tenggat Waktu</th>
          <th class="amount" style="width: 15%">Terakumulasi</th>
          <th class="amount" style="width: 15%">Target Dana</th>
          <th class="amount" style="width: 15%">Kekurangan</th>
          <th style="width: 10%; text-align: right;">Progres</th>
        </tr>
      </thead>
      <tbody>
        ${savingsTableRows || '<tr><td colspan="7" class="empty-state">Belum ada target tabungan diatur.</td></tr>'}
      </tbody>
    </table>

    <!-- PAGE BREAK FOR PAGE 2 -->
    <div class="page-break"></div>

    <!-- Header Branding Page 2 -->
    <div class="header-branding" style="margin-top: 30px;">
      <div class="brand-title-group">
        <div class="brand-logo-badge" style="background-color: #0ea5e9;">
          <span class="brand-logo-text">L</span>
        </div>
        <div>
          <h1 class="brand-name">Lifeboard</h1>
          <span class="brand-subtitle">Rencana Kerja &amp; Anggaran Pembelanjaan</span>
        </div>
      </div>
      <div class="header-meta">
        <span class="meta-tag" style="color: #0ea5e9;">HALAMAN 2 - LAPORAN DETAIL</span>
        <p class="meta-date">Cetak: ${dateStr}</p>
      </div>
    </div>

    <!-- 3. ANGGARAN BULANAN -->
    <div class="section-title">🛡️ 3. Pengawasan Anggaran &amp; Batas Belanja Bulanan</div>
    <table class="report-table">
      <thead>
        <tr>
          <th style="width: 5%; text-align: center;">No</th>
          <th style="width: 30%">Kategori Pengeluaran</th>
          <th style="width: 15%; text-align: center;">Bulan/Periode</th>
          <th class="amount" style="width: 15%">Realisasi Belanja</th>
          <th class="amount" style="width: 15%">Batas Maksimal</th>
          <th class="amount" style="width: 15%">Sisa Anggaran</th>
          <th style="width: 10%; text-align: right;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${budgetsTableRows || '<tr><td colspan="7" class="empty-state">Belum ada batas anggaran dikonfigurasi.</td></tr>'}
      </tbody>
    </table>

    <!-- 4. WISHLIST & RENCANA BELANJA -->
    <div class="section-title">4. Daftar Keinginan &amp; Wishlist Realisasi</div>
    <table class="report-table">
      <thead>
        <tr>
          <th style="width: 5%; text-align: center;">No</th>
          <th style="width: 60%">Nama Barang / Keinginan</th>
          <th style="width: 20%; text-align: center;">Target Bulan</th>
          <th style="width: 15%; text-align: right;">Status Pembelian</th>
        </tr>
      </thead>
      <tbody>
        ${wishlistTableRows || '<tr><td colspan="4" class="empty-state">Daftar keinginan masih kosong.</td></tr>'}
      </tbody>
    </table>

    <!-- 5. RENCANA AKTIVITAS HARIAN -->
    <div class="section-title">5. Agenda &amp; Rencana Aktivitas</div>
    <table class="report-table">
      <thead>
        <tr>
          <th style="width: 5%; text-align: center;">No</th>
          <th style="width: 50%">Uraian Aktivitas/Agenda Kerja</th>
          <th style="width: 20%">Kategori Agenda</th>
          <th style="width: 12%; text-align: center;">Prioritas</th>
          <th style="width: 13%; text-align: right;">Status Kerja</th>
        </tr>
      </thead>
      <tbody>
        ${activitiesTableRows || '<tr><td colspan="5" class="empty-state">Belum ada agenda aktivitas terjadwal.</td></tr>'}
      </tbody>
    </table>

    <!-- Footer Copyright Stamp -->
    <div class="footer-stamp">
      <div>Lifeboard Organizer &copy; 2026 - Laporan Cetak Otomatis</div>
      <div>✓ Dokumen Resmi Terverifikasi Sistem</div>
    </div>

  </div>

  <script>
    // Prompt print dialog automatically
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
    `;

    const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Lifeboard_Laporan_Cetak_${new Date().toISOString().split('T')[0]}.html`;
    link.click();
    
    // Show instruction popup inside app for perfect clarity!
    showAlert(
      '📂 Unduhan Laporan Sukses!',
      'File HTML Laporan yang siap dicetak telah berhasil diunduh.\n\nLangkah mudah:\n1. Buka file hasil unduhan tersebut di browser Anda.\n2. Dialog print/PDF otomatis akan langsung muncul!\n3. Simpan sebagai PDF berkualitas tinggi tanpa terpotong menu editor.'
    );
  };

  // --- Dynamic Styling Helpers ---
  const getThemeFontClass = () => {
    return 'font-sans ';
  };

  const getThemeBackground = () => {
    if (settings.isDarkMode) {
      if (settings.uiStyle === 'glass') return 'bg-slate-950/95 ';
      return 'bg-slate-950 ';
    }
    if (settings.uiStyle === 'glass') return 'bg-slate-50/95 ';
    return 'bg-slate-50 ';
  };

  const getCardClasses = () => {
    let cls = "transition-all duration-300 overflow-hidden ";
    
    // 1. Apply UI Style baseline background & structural styles
    if (settings.uiStyle === 'glass') {
      cls += "glass-panel shadow-sm backdrop-blur-md border border-white/20 dark:border-slate-800/40 ";
    } else if (settings.uiStyle === 'minimal') {
      cls += "bg-transparent dark:bg-transparent border-0 border-b border-slate-200 dark:border-slate-800 shadow-none ";
    } else {
      // Modern Slate style
      cls += "bg-white dark:bg-slate-900 ";
    }

    // 2. Apply Border Radius
    if (settings.uiStyle !== 'minimal') {
      if (settings.cardRadius === 'sharp') cls += "rounded-none ";
      else if (settings.cardRadius === 'rounded') cls += "rounded-2xl ";
      else if (settings.cardRadius === 'extra') cls += "rounded-3xl ";
    }

    // 3. Apply Card Borders & Shadows (if not minimal style, which forces borderless plain)
    if (settings.uiStyle !== 'minimal') {
      if (settings.cardStyle === 'flat') {
        cls += "border border-slate-200 dark:border-slate-800/60 shadow-none ";
      } else if (settings.cardStyle === 'bordered') {
        cls += "border-2 border-slate-300 dark:border-slate-700 shadow-none ";
      } else if (settings.cardStyle === 'shadowed') {
        cls += "border border-slate-100 dark:border-slate-800/30 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] ";
      }
    }
    
    return cls;
  };

  const getTableClasses = () => {
    return "w-full text-left text-xs border-collapse ";
  };

  const getTableRowClasses = (index: number) => {
    let cls = "transition-all duration-150 hover:bg-slate-50/40 dark:hover:bg-slate-800/10 ";
    
    if (settings.tableStyle === 'striped') {
      if (index % 2 === 1) {
        cls += "bg-slate-50/50 dark:bg-slate-900/40 ";
      } else {
        cls += "bg-white dark:bg-slate-900/10 ";
      }
    } else {
      cls += "border-b border-slate-100 dark:border-slate-800/40 ";
    }
    return cls;
  };

  const getTableRowPadding = () => {
    if (settings.tableStyle === 'compact') return 'py-1.5 px-3 ';
    return 'py-3.5 px-4 ';
  };

  const getAccentGradient = () => {
    switch (settings.themeColor) {
      case 'emerald': return 'from-emerald-500 to-teal-500 shadow-emerald-500/20';
      case 'amber': return 'from-amber-500 to-orange-500 shadow-amber-500/20';
      case 'rose': return 'from-rose-500 to-pink-500 shadow-rose-500/20';
      default: return 'from-indigo-600 to-blue-500 shadow-indigo-600/20';
    }
  };

  const getAccentBg = () => {
    switch (settings.themeColor) {
      case 'emerald': return 'bg-emerald-500 hover:bg-emerald-600';
      case 'amber': return 'bg-amber-500 hover:bg-amber-600';
      case 'rose': return 'bg-rose-500 hover:bg-rose-600';
      default: return 'bg-indigo-600 hover:bg-indigo-700';
    }
  };

  const getAccentText = () => {
    switch (settings.themeColor) {
      case 'emerald': return 'text-emerald-500 dark:text-emerald-400';
      case 'amber': return 'text-amber-500 dark:text-amber-400';
      case 'rose': return 'text-rose-500 dark:text-rose-400';
      default: return 'text-indigo-600 dark:text-indigo-400';
    }
  };

  // --- Filtered Transactions list ---
  const filteredTransactions = transactions.filter((t) => {
    const matchesType = txTypeFilter === 'semua' || t.type === txTypeFilter;
    const matchesWallet = txWalletFilter === 'semua' || t.walletId === txWalletFilter;
    
    let matchesCategory = true;
    if (txCategoryFilter !== 'semua') {
      matchesCategory = t.type === 'pengeluaran' ? t.categoryId === txCategoryFilter : t.sourceId === txCategoryFilter;
    }

    const matchesSearch = txSearch.trim() === '' || 
      t.description.toLowerCase().includes(txSearch.toLowerCase()) ||
      t.amount.toString().includes(txSearch);

    const matchesDate = txDateFilter === '' || t.date === txDateFilter;
    
    let matchesMonth = true;
    if (txMonthFilter !== '') {
      const parts = t.date.split('-');
      if (parts.length >= 2) {
        matchesMonth = parts[1] === txMonthFilter;
      } else {
        matchesMonth = false;
      }
    }

    let matchesYear = true;
    if (txYearFilter !== '') {
      const parts = t.date.split('-');
      if (parts.length >= 1) {
        matchesYear = parts[0] === txYearFilter;
      } else {
        matchesYear = false;
      }
    }

    return matchesType && matchesWallet && matchesCategory && matchesSearch && matchesDate && matchesMonth && matchesYear;
  });

  if (appState === 'splash') {
    return <SplashView onFinish={() => setAppState('auth')} />;
  }

  if (appState === 'auth') {
    return <AuthView onLogin={() => setAppState('main')} />;
  }

  return (
    <div className={`min-h-screen pb-24 ${getThemeFontClass()} ${getThemeBackground()} selection:bg-indigo-100 transition-colors duration-300 relative`}>
      
      {/* AMBIENT BACKGROUND BLOBS FOR GLASS UI */}
      {settings.uiStyle === 'glass' && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden no-print">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/30 dark:bg-indigo-600/20 blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow"></div>
          <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-emerald-500/20 dark:bg-emerald-600/10 blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] rounded-full bg-pink-500/20 dark:bg-pink-600/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>
      )}

      {/* 1. STICKY TOP BAR */}
      <header 
        className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 no-print"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 12px)' }}
      >
        <div className="max-w-xl mx-auto pb-3 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Elegant Geometric Fintech Logomark */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[1.2rem] overflow-hidden shadow-sm flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-slate-700/50 bg-transparent">
              <img src="/icon.svg" className="w-full h-full object-cover scale-[1.15]" alt="Logo" referrerPolicy="no-referrer" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification drop */}
            <NotificationPanel
              notifications={notifications}
              isOpen={isNotifOpen}
              setIsOpen={setIsNotifOpen}
              onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
              onClearAll={() => setNotifications([])}
              onToggleRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n))}
              onDeleteOne={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
              accentColor={settings.themeColor}
            />

            {/* Profile configuration drop */}
            <ProfileDropdown
              profile={profile}
              setProfile={setProfile}
              settings={settings}
              setSettings={setSettings}
              onExportExcel={handleExportCSV}
              onExportPDF={handleExportPDF}
              onDeleteAllData={handleDeleteAllData}
              onOpenSettings={() => setShowSettingsModal(true)}
            />
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTAINER CONTENT */}
      <main className="max-w-xl mx-auto px-4 pt-6 pb-12 no-print relative z-10">
        
        {activeTab === 'dashboard' && (
          <DashboardView 
            profileName={profile.name}
            transactions={transactions}
            wallets={walletsWithCurrentBalance}
            categories={categories}
            sources={sources}
            savings={savings}
            budgets={budgets}
            activities={activities}
            wishlists={wishlists}
            totalSaldoUtama={totalSaldoUtama}
            totalWalletBalance={totalWalletBalance}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            getCardClasses={getCardClasses}
            getAccentBg={getAccentBg}
            isInstallable={isInstallable}
            triggerPWAInstall={triggerPWAInstall}
            setActiveTab={setActiveTab}
          />
        )}


        {activeTab === 'transaksi' && (
          <TransactionsView 
            transactions={transactions}
            wallets={wallets}
            categories={categories}
            sources={sources}
            txTypeFilter={txTypeFilter}
            setTxTypeFilter={setTxTypeFilter}
            txCategoryFilter={txCategoryFilter}
            setTxCategoryFilter={setTxCategoryFilter}
            txWalletFilter={txWalletFilter}
            setTxWalletFilter={setTxWalletFilter}
            txSearch={txSearch}
            setTxSearch={setTxSearch}
            txDateFilter={txDateFilter}
            setTxDateFilter={setTxDateFilter}
            txMonthFilter={txMonthFilter}
            setTxMonthFilter={setTxMonthFilter}
            txYearFilter={txYearFilter}
            setTxYearFilter={setTxYearFilter}
            showAllTransactions={showAllTransactions}
            setShowAllTransactions={setShowAllTransactions}
            filteredTransactions={filteredTransactions}
            getCardClasses={getCardClasses}
            getAccentBg={getAccentBg}
            getTableClasses={getTableClasses}
            getTableRowPadding={getTableRowPadding}
            getTableRowClasses={getTableRowClasses}
            handleDeleteTransaction={handleDeleteTransaction}
            onAdd={(type) => openAddModal(type)}
            onEdit={(tx) => openAddModal(tx.type === 'pemasukan' ? 'pemasukan' : 'pengeluaran', tx)}
          />
        )}

        {activeTab === 'tabungan' && (
          <SavingsView 
            savings={savings}
            savingFilter={savingFilter}
            setSavingFilter={setSavingFilter}
            getCardClasses={getCardClasses}
            handleDeleteSaving={handleDeleteSaving}
            handleSavingAddAmount={handleSavingAddAmount}
            onEdit={(saving) => openAddModal('tabungan', saving)}
          />
        )}

        {activeTab === 'anggaran' && (
          <BudgetsView 
            budgets={budgets}
            categories={categories}
            transactions={transactions}
            getCardClasses={getCardClasses}
            handleDeleteBudget={(id) => {
              showConfirm('Hapus Anggaran', 'Hapus batas anggaran ini?', () => {
                setBudgets(prev => prev.filter(b => b.id !== id));
                triggerNotification('Anggaran Dihapus', 'Batas anggaran dibersihkan.', 'info');
              }, 'danger');
            }}
            onEdit={(budget) => openAddModal('budgeting', budget)}
          />
        )}


        {activeTab === 'aktivitas' && (
          <ActivitiesView 
            activities={activities}
            wishlists={wishlists}
            activeSubTab={activeActivitiesSubTab}
            setActiveSubTab={setActiveActivitiesSubTab}
            getCardClasses={getCardClasses}
            handleDeleteActivity={handleDeleteActivity}
            handleToggleActivity={handleToggleActivity}
            handleDeleteWishlist={(id) => {
              showConfirm('Hapus Wishlist', 'Hapus item ini dari daftar keinginan?', () => {
                setWishlists(prev => prev.filter(w => w.id !== id));
                triggerNotification('Wishlist Dihapus', 'Item dihapus dari daftar.', 'info');
              }, 'danger');
            }}
            handleToggleWishlist={(id) => {
              setWishlists(prev => prev.map(w => w.id === id ? { ...w, isPurchased: !w.isPurchased } : w));
            }}
            onEditActivity={(activity) => openAddModal('aktivitas', activity)}
            onEditWishlist={(wishlist) => openAddModal('wishlist', wishlist)}
          />
        )}

        {activeTab === 'kelola' && (
          <KelolaView 
            walletsWithCurrentBalance={walletsWithCurrentBalance}
            categories={categories}
            sources={sources}
            getCardClasses={getCardClasses}
            getAccentBg={getAccentBg}
            startEditWallet={startEditWallet}
            handleDeleteWallet={handleDeleteWallet}
            startEditCategory={startEditCategory}
            handleDeleteCategory={handleDeleteCategory}
            startEditSource={startEditSource}
            handleDeleteSource={handleDeleteSource}
            walletEditId={walletEditId}
            walletFormName={walletFormName}
            setWalletFormName={setWalletFormName}
            walletFormBalance={walletFormBalance}
            setWalletFormBalance={setWalletFormBalance}
            walletFormIcon={walletFormIcon}
            setWalletFormIcon={setWalletFormIcon}
            handleSaveWallet={handleSaveWallet}
            resetWalletForm={resetWalletForm}
            categoryEditId={categoryEditId}
            categoryFormName={categoryFormName}
            setCategoryFormName={setCategoryFormName}
            categoryFormIcon={categoryFormIcon}
            setCategoryFormIcon={setCategoryFormIcon}
            handleSaveCategory={handleSaveCategory}
            resetCategoryForm={resetCategoryForm}
            sourceEditId={sourceEditId}
            sourceFormName={sourceFormName}
            setSourceFormName={setSourceFormName}
            sourceFormIcon={sourceFormIcon}
            setSourceFormIcon={setSourceFormIcon}
            handleSaveSource={handleSaveSource}
            resetSourceForm={resetSourceForm}
          />
        )}

      </main>

      {/* =======================================================
          3. EDIT WALLET DIALOG MODAL (POPUP ON EDIT METRICS)
         ======================================================= */}
      {editingWallet && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto no-print">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className={`p-4 text-white flex items-center justify-between ${getAccentBg()}`}>
              <h3 className="font-bold text-sm tracking-tight">Edit Dompet Utama</h3>
              <button onClick={() => setEditingWallet(null)} className="text-white hover:opacity-80"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpdateWallet} className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Dompet</label>
                <input
                  type="text"
                  value={editingWallet.name}
                  onChange={(e) => setEditingWallet({ ...editingWallet, name: e.target.value })}
                  className="px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saldo Awal (Directly Impacts Total)</label>
                <input
                  type="number"
                  value={editingWallet.initialBalance}
                  onChange={(e) => setEditingWallet({ ...editingWallet, initialBalance: parseFloat(e.target.value) || 0 })}
                  className="px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-white font-mono"
                  required
                />
              </div>
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingWallet(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-xs font-bold text-white rounded-xl ${getAccentBg()}`}
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          5. WIZARD CREATION FORM OVERLAY
         ======================================================= */}
      <FormsModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        wallets={wallets}
        categories={categories}
        sources={sources}
        accentColor={settings.themeColor}
        initialTab={modalFormTab}
        editData={modalEditData}
        onAddTransaction={handleAddTransaction}
        onUpdateTransaction={handleUpdateTransaction}
        onAddBudget={handleAddBudget}
        onUpdateBudget={handleUpdateBudget}
        onAddSaving={handleAddSaving}
        onUpdateSaving={handleUpdateSaving}
        onAddActivity={handleAddActivity}
        onUpdateActivity={handleUpdateActivity}
        onAddWishlist={handleAddWishlist}
        onUpdateWishlist={handleUpdateWishlist}
      />

      {/* =======================================================
          6. STICKY BOTTOM TAB NAVIGATION
         ======================================================= */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        accentColor={settings.themeColor}
        onAddClick={() => {
          if (activeTab === 'aktivitas') {
            if (activeActivitiesSubTab === 'agenda') openAddModal('aktivitas');
            else openAddModal('wishlist');
          }
          else if (activeTab === 'tabungan') openAddModal('tabungan');
          else if (activeTab === 'budgeting') openAddModal('budgeting');
          else if (activeTab === 'transaksi') openAddModal('pengeluaran');
          else openAddModal('pengeluaran');
        }}
      />

      {/* =======================================================
          7. HIGH-QUALITY FULL PRINTABLE PDF STATEMENT LAYOUT
         ======================================================= */}
      <div className="hidden print:block print-container p-8 font-sans bg-white text-slate-900" id="print-report-layout">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">LAPORAN MUTASI KEUANGAN &amp; AKTIVITAS HARIAN</h1>
          <p className="text-xs text-slate-500 mt-1">Dicetak oleh FinActivity PWA pada {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <div className="w-full border-b border-slate-200 my-4" />
        </div>

        {/* Financial metrics block */}
        <div className="grid grid-cols-3 gap-4 border border-slate-200 rounded-xl p-4 mb-6">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Saldo Utama</span>
            <div className="text-lg font-bold font-mono text-slate-800 mt-1">{formatIDR(totalSaldoUtama)}</div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Pemasukan</span>
            <div className="text-lg font-bold font-mono text-emerald-600 mt-1">+{formatIDR(totalIncome)}</div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Pengeluaran</span>
            <div className="text-lg font-bold font-mono text-rose-600 mt-1">-{formatIDR(totalExpense)}</div>
          </div>
        </div>

        {/* Wallets list */}
        <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-slate-500">DAFTAR KEPEMILIKAN DOMPET</h3>
        <table className="w-full text-xs text-left border border-slate-100 rounded-lg mb-6">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-2">Nama Dompet</th>
              <th className="p-2">Saldo Awal Set</th>
            </tr>
          </thead>
          <tbody>
            {walletsWithCurrentBalance.map(w => (
              <tr key={w.id} className="border-b border-slate-100">
                <td className="p-2 font-medium flex items-center gap-1">
                  {w.icon && <IconRenderer name={w.icon} className="w-3.5 h-3.5 text-slate-500" />} {w.name}
                </td>
                <td className="p-2 font-mono font-bold">{formatIDR(w.currentBalance ?? w.initialBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Transactions list */}
        <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-slate-500">RIWAYAT MUTASI ALIRAN KAS</h3>
        <table className="w-full text-xs text-left border border-slate-100 rounded-lg mb-6">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-2">Deskripsi</th>
              <th className="p-2">Tipe</th>
              <th className="p-2">Metode Dompet</th>
              <th className="p-2">Kategori/Aliran</th>
              <th className="p-2">Tanggal</th>
              <th className="p-2">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => {
              const walletName = wallets.find(w => w.id === t.walletId)?.name || '';
              const catName = t.type === 'pengeluaran'
                ? categories.find(c => c.id === t.categoryId)?.name || ''
                : sources.find(s => s.id === t.sourceId)?.name || '';
              return (
                <tr key={t.id} className="border-b border-slate-100">
                  <td className="p-2 font-semibold">{t.description}</td>
                  <td className="p-2 font-bold uppercase">{t.type}</td>
                  <td className="p-2">{walletName}</td>
                  <td className="p-2">{catName}</td>
                  <td className="p-2 font-mono">{t.date}</td>
                  <td className="p-2 font-mono font-bold">{t.type === 'pemasukan' ? '+' : '-'}{formatIDR(t.amount)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Savings, Activities, and Wishlist print rows */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-slate-500">PROGRES TARGET TABUNGAN</h3>
            <table className="w-full text-[10px] text-left border border-slate-100">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-2">Nama Target</th>
                  <th className="p-2">Terkumpul</th>
                  <th className="p-2">Target</th>
                </tr>
              </thead>
              <tbody>
                {savings.map(s => (
                  <tr key={s.id} className="border-b border-slate-100">
                    <td className="p-2">{s.name}</td>
                    <td className="p-2 font-mono">{formatIDR(s.currentAmount)}</td>
                    <td className="p-2 font-mono font-bold">{formatIDR(s.targetAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-slate-500">DAFTAR KEGIATAN HARIAN</h3>
            <table className="w-full text-[10px] text-left border border-slate-100">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-2">Judul Agenda</th>
                  <th className="p-2">Batas Waktu</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {activities.map(a => (
                  <tr key={a.id} className="border-b border-slate-100">
                    <td className="p-2">{a.title}</td>
                    <td className="p-2 font-mono">{a.deadline}</td>
                    <td className="p-2 font-bold uppercase">{a.status === 'completed' ? 'Selesai' : 'Antrean'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Print Sign-off block */}
        <div className="mt-12 flex justify-between text-xs pt-12 border-t border-dashed border-slate-200">
          <div>
            <p>Penyusun Laporan,</p>
            <div className="h-16" />
            <p className="font-bold underline">{profile.name}</p>
          </div>
          <div className="text-right">
            <p>Diverifikasi Sistem,</p>
            <div className="h-16" />
            <p className="font-bold text-slate-400">FINACTIVITY AUTO-CERTIFIED</p>
          </div>
        </div>
      </div>



      {/* =======================================================
          UI & STYLE CONFIGURATOR MODAL (100% Viewport Safe)
         ======================================================= */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-950 w-full max-w-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-800/80 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-indigo-500" /> Tampilan &amp; Tema
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">Kustomisasi Estetika Aplikasi</p>
              </div>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-300 transition focus:outline-none"
              >
                <X className="w-4.5 h-4.5 stroke-[2.5]" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col gap-5 overflow-y-auto flex-1">
              
              {/* Theme palettes 10% accent selection */}
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 block mb-2 uppercase tracking-widest">1. Warna Aksen</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                        onClick={() => setSettings({ ...settings, themeColor: p.id as ThemeColor })}
                        className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 select-none focus:outline-none ${
                          isActive 
                            ? 'border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-900/60 font-bold shadow-sm' 
                            : 'border-slate-100 dark:border-slate-900 hover:border-slate-200 dark:hover:border-slate-800 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full shadow-sm block relative ${p.colorClass}`}>
                          {isActive && (
                            <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-[10px]">✓</span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-800 dark:text-slate-200 font-semibold">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font Style Scheme */}
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 block mb-2 uppercase tracking-widest">2. Tipografi Utama</span>
                <div className="relative">
                  <select 
                    value={settings.fontStyle === 'sans' ? 'jakarta' : settings.fontStyle}
                    onChange={(e) => setSettings({ ...settings, fontStyle: e.target.value as FontStyle })}
                    className="w-full p-3 pr-10 appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 transition cursor-pointer"
                  >
                    <option value="jakarta">Jakarta Sans (Modern & Clean)</option>
                    <option value="grotesk">Space Grotesk (Tech & Edgy)</option>
                    <option value="ios">SF Pro / iOS (Klasik Apple)</option>
                    <option value="neobrutalism">Epilogue (Tegas & Berani)</option>
                    <option value="pixel">Chakra Petch (Cyberpunk & Tech)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              {/* UI Style Scheme */}
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 block mb-2 uppercase tracking-widest">3. Gaya Visual UI</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'modern', label: 'Modern Slate', desc: 'Sederhana & Elegan' },
                    { id: 'minimal', label: 'Minimalist', desc: 'Tanpa Pembatas' },
                    { id: 'glass', label: 'Glassmorphic', desc: 'Efek Transparansi' }
                  ].map((s) => {
                    const isActive = settings.uiStyle === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSettings({ ...settings, uiStyle: s.id as UIStyle })}
                        className={`p-3 rounded-xl border text-left transition select-none focus:outline-none ${
                          isActive 
                            ? 'border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-900/60 font-bold shadow-sm' 
                            : 'border-slate-100 dark:border-slate-900 hover:border-slate-200 dark:hover:border-slate-800 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <span className="font-bold text-xs text-slate-900 dark:text-white block">{s.label}</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 block">{s.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card border style */}
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 block mb-2 uppercase tracking-widest">4. Gaya Kartu &amp; Border</span>
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
                        onClick={() => setSettings({ ...settings, cardStyle: c.id as CardStyle })}
                        className={`p-3 rounded-xl border text-left transition select-none focus:outline-none ${
                          isActive 
                            ? 'border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-900/60 font-bold shadow-sm' 
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

              {/* Card radius style */}
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 block mb-2 uppercase tracking-widest">5. Sudut Kartu (Radius)</span>
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
                        onClick={() => setSettings({ ...settings, cardRadius: c.id as CardRadius })}
                        className={`p-3 rounded-xl border text-left transition select-none focus:outline-none ${
                          isActive 
                            ? 'border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-900/60 font-bold shadow-sm' 
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

              {/* Table Row Spacing density */}
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 block mb-2 uppercase tracking-widest">6. Kerapatan Tabel / List</span>
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
                        onClick={() => setSettings({ ...settings, tableStyle: t.id as TableStyle })}
                        className={`p-3 rounded-xl border text-left transition select-none focus:outline-none ${
                          isActive 
                            ? 'border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-900/60 font-bold shadow-sm' 
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

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-900 flex justify-end bg-slate-50/50 dark:bg-slate-950/20">
              <button
                onClick={() => setShowSettingsModal(false)}
                className={`w-full py-2.5 text-xs font-bold text-white rounded-xl transition ${getAccentBg()}`}
              >
                Terapkan Perubahan Tampilan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
