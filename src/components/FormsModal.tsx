/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Wallet as WalletIcon, FolderPlus, Coins, Plus, Calendar, Bookmark, Landmark, Sparkles, Check, CheckSquare, Square, Layers, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { Wallet, Category, IncomeSource } from '../types';
import { formatIDR } from '../lib/formatters';
import { IconRenderer } from './IconRenderer';

export const parseAmountInput = (val: string | number): number => {
  if (typeof val === 'number') return Math.round(val);
  if (!val) return 0;
  let s = val.trim();
  // Handle thousand separators: Indonesian "7.500.000" or US "7,500,000"
  if (s.includes('.')) {
    const parts = s.split('.');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      s = s.replace(/\./g, '');
    }
  }
  if (s.includes(',')) {
    const parts = s.split(',');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      s = s.replace(/,/g, '');
    } else {
      s = s.replace(',', '.');
    }
  }
  const num = parseFloat(s);
  return isNaN(num) ? 0 : Math.round(num);
};

interface FormsModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  categories: Category[];
  sources: IncomeSource[];
  uiStyle?: string;
  accentColor: string;
  initialTab?: FormType;
  editData?: any;
  onAddTransaction: (data: {
    type: 'pemasukan' | 'pengeluaran' | 'transfer';
    amount: number;
    adminFee?: number;
    description: string;
    date: string;
    walletId: string;
    categoryId?: string;
    sourceId?: string;
    toWalletId?: string;
  }) => void;
  onUpdateTransaction?: (id: string, data: {
    type: 'pemasukan' | 'pengeluaran' | 'transfer';
    amount: number;
    adminFee?: number;
    description: string;
    date: string;
    walletId: string;
    categoryId?: string;
    sourceId?: string;
    toWalletId?: string;
  }) => void;
  onAddBudget: (data: { categoryId: string; categoryIds?: string[]; limitAmount: number; month: string; walletId?: string; walletIds?: string[] }) => void;
  onUpdateBudget?: (id: string, data: { categoryId: string; categoryIds?: string[]; limitAmount: number; month: string; walletId?: string; walletIds?: string[] }) => void;
  onAddSaving: (data: { name: string; targetAmount: number; currentAmount: number; deadline: string; color: string }) => void;
  onUpdateSaving?: (id: string, data: { name: string; targetAmount: number; currentAmount: number; deadline: string; color: string }) => void;
  onAddActivity: (data: { title: string; description: string; deadline: string }) => void;
  onUpdateActivity?: (id: string, data: { title: string; description: string; deadline: string }) => void;
  onAddWishlist: (data: { title: string; month: string; price?: number; notes?: string }) => void;
  onUpdateWishlist?: (id: string, data: { title: string; month: string; price?: number; notes?: string }) => void;
  language?: string;
}

type FormType = 'pengeluaran' | 'pemasukan' | 'transfer' | 'budgeting' | 'tabungan' | 'aktivitas' | 'wishlist';

export default function FormsModal({
  isOpen,
  onClose,
  wallets,
  categories,
  sources,
  uiStyle,
  accentColor,
  initialTab,
  editData,
  onAddTransaction,
  onUpdateTransaction,
  onAddBudget,
  onUpdateBudget,
  onAddSaving,
  onUpdateSaving,
  onAddActivity,
  onUpdateActivity,
  onAddWishlist,
  onUpdateWishlist,
  language = 'id'
}: FormsModalProps) {
  const [activeForm, setActiveForm] = React.useState<FormType>(initialTab || 'pengeluaran');

  // Form input states
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedWalletId, setSelectedWalletId] = useState(wallets[0]?.id || '');
  const [selectedToWalletId, setSelectedToWalletId] = useState(() => {
    const remaining = wallets.filter(w => w.id !== (wallets[0]?.id || ''));
    return remaining[0]?.id || '';
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || '');
  const [selectedSourceId, setSelectedSourceId] = useState(sources[0]?.id || '');

  React.useEffect(() => {
    if (selectedWalletId === selectedToWalletId) {
      const other = wallets.find(w => w.id !== selectedWalletId);
      if (other) {
        setSelectedToWalletId(other.id);
      }
    }
  }, [selectedWalletId, wallets]);

  // Transfer extra state
  const [adminFee, setAdminFee] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [budgetMonth, setBudgetMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [budgetSelectedCategoryIds, setBudgetSelectedCategoryIds] = useState<string[]>(['all']);
  const [budgetSelectedWalletIds, setBudgetSelectedWalletIds] = useState<string[]>(['all']);

  // Saving states
  const [savingName, setSavingName] = useState('');
  const [savingTarget, setSavingTarget] = useState('');
  const [savingCurrent, setSavingCurrent] = useState('0');
  const [savingDeadline, setSavingDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [savingColor, setSavingColor] = useState('#10b981');

  // Activity states
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDesc, setActivityDesc] = useState('');
  const [activityDeadline, setActivityDeadline] = useState(new Date().toISOString().split('T')[0]);

  // Wishlist states
  const [wishlistTitle, setWishlistTitle] = useState('');
  const [wishlistPrice, setWishlistPrice] = useState('');
  const [wishlistNotes, setWishlistNotes] = useState('');
  const [wishlistMonth, setWishlistMonth] = useState(new Date().toISOString().slice(0, 7));

  // Effect to handle edit data and initial tab
  React.useEffect(() => {
    if (isOpen) {
      const targetForm = initialTab || activeForm;
      if (initialTab) {
        setActiveForm(initialTab);
      }
      
      if (editData) {
        if (targetForm === 'pengeluaran' || targetForm === 'pemasukan' || targetForm === 'transfer') {
          setAmount(editData.amount.toString());
          setAdminFee(editData.adminFee ? editData.adminFee.toString() : '');
          setDescription(editData.description || '');
          setDate(editData.date);
          setSelectedWalletId(editData.walletId);
          if (editData.toWalletId) setSelectedToWalletId(editData.toWalletId);
          if (editData.categoryId) setSelectedCategoryId(editData.categoryId);
          if (editData.sourceId) setSelectedSourceId(editData.sourceId);
        } else if (targetForm === 'budgeting') {
          setBudgetLimit(editData.limitAmount.toString());
          setBudgetMonth(editData.month);

          // Restore category selection
          if (editData.categoryIds && Array.isArray(editData.categoryIds) && editData.categoryIds.length > 0) {
            setBudgetSelectedCategoryIds(editData.categoryIds);
          } else if (editData.categoryId) {
            if (editData.categoryId === 'all') {
              setBudgetSelectedCategoryIds(['all']);
            } else if (editData.categoryId.includes(',')) {
              setBudgetSelectedCategoryIds(editData.categoryId.split(',').map((s: string) => s.trim()));
            } else {
              setBudgetSelectedCategoryIds([editData.categoryId]);
            }
          } else {
            setBudgetSelectedCategoryIds(['all']);
          }

          // Restore wallet selection
          if (editData.walletIds && Array.isArray(editData.walletIds) && editData.walletIds.length > 0) {
            setBudgetSelectedWalletIds(editData.walletIds);
          } else if (editData.walletId) {
            if (editData.walletId === 'all') {
              setBudgetSelectedWalletIds(['all']);
            } else if (editData.walletId.includes(',')) {
              setBudgetSelectedWalletIds(editData.walletId.split(',').map((s: string) => s.trim()));
            } else {
              setBudgetSelectedWalletIds([editData.walletId]);
            }
          } else {
            setBudgetSelectedWalletIds(['all']);
          }
        } else if (targetForm === 'tabungan') {
          setSavingName(editData.name);
          setSavingTarget(editData.targetAmount.toString());
          setSavingCurrent(editData.currentAmount.toString());
          setSavingDeadline(editData.deadline);
          setSavingColor(editData.color);
        } else if (targetForm === 'aktivitas') {
          setActivityTitle(editData.title);
          setActivityDesc(editData.description || '');
          setActivityDeadline(editData.deadline);
        } else if (targetForm === 'wishlist') {
          setWishlistTitle(editData.title);
          setWishlistMonth(editData.month);
          setWishlistPrice(editData.price?.toString() || '');
          setWishlistNotes(editData.notes || '');
        }
      } else {
        // Reset to defaults if not editing
        resetForms();
        if (wallets.length > 0) {
          setSelectedWalletId(wallets[0].id);
          const remaining = wallets.filter(w => w.id !== wallets[0].id);
          setSelectedToWalletId(remaining[0]?.id || '');
        }
        if (categories.length > 0) {
          setSelectedCategoryId(categories[0].id);
        }
        setBudgetSelectedCategoryIds(['all']);
        setBudgetSelectedWalletIds(['all']);
        if (sources.length > 0) setSelectedSourceId(sources[0].id);
      }
    }
  }, [isOpen, editData, initialTab]);

  if (!isOpen) return null;

  const isHex = accentColor.startsWith('#');

  const getResolvedAccent = () => {
    if (isHex) return accentColor;
    switch (accentColor) {
      case 'emerald': return '#10b981';
      case 'amber': return '#f59e0b';
      case 'rose': return '#f43f5e';
      default: return '#6366f1';
    }
  };
  const resolvedAccent = getResolvedAccent();

  const getAccentBg = () => {
    if (isHex) return '';
    switch (accentColor) {
      case 'emerald': return 'bg-emerald-500 hover:bg-emerald-600';
      case 'amber': return 'bg-amber-500 hover:bg-amber-600';
      case 'rose': return 'bg-rose-500 hover:bg-rose-600';
      default: return 'bg-indigo-600 hover:bg-indigo-700';
    }
  };

  const getAccentText = (active: boolean) => {
    if (!active) return 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200';
    if (isHex) return 'font-bold';
    switch (accentColor) {
      case 'emerald': return 'text-emerald-500 font-bold border-emerald-500';
      case 'amber': return 'text-amber-500 font-bold border-amber-500';
      case 'rose': return 'text-rose-500 font-bold border-rose-500';
      default: return 'text-indigo-600 dark:text-indigo-400 font-bold border-indigo-600 dark:border-indigo-400';
    }
  };

  const getBadgeProps = () => {
    switch (activeForm) {
      case 'pemasukan':
        return {
          label: 'Pendapatan',
          className: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 font-bold',
          style: undefined
        };
      case 'pengeluaran':
        return {
          label: 'Pengeluaran',
          className: 'bg-rose-50 dark:bg-rose-950/50 text-rose-500 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60 font-bold',
          style: undefined
        };
      case 'transfer':
        return {
          label: 'Transfer',
          className: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/60 font-bold',
          style: undefined
        };
      default:
        return {
          label: activeForm.charAt(0).toUpperCase() + activeForm.slice(1),
          className: 'font-bold',
          style: {
            backgroundColor: `${resolvedAccent}18`,
            color: resolvedAccent
          }
        };
    }
  };

  const getActiveTabClass = (type: FormType) => {
    return activeForm === type
      ? `border-b-2 py-2 px-3 text-xs font-bold shrink-0 transition ${getAccentText(true)}`
      : 'py-2 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 hover:text-slate-700 dark:hover:text-slate-300';
  };

  const resetForms = () => {
    setAmount('');
    setAdminFee('');
    setDescription('');
    if (wallets.length > 0) {
      const remaining = wallets.filter(w => w.id !== wallets[0].id);
      setSelectedToWalletId(remaining[0]?.id || '');
    }
    setBudgetLimit('');
    setBudgetSelectedCategoryIds(['all']);
    setBudgetSelectedWalletIds(['all']);
    setSavingName('');
    setSavingTarget('');
    setSavingCurrent('0');
    setActivityTitle('');
    setActivityDesc('');
    setWishlistTitle('');
    setWishlistPrice('');
    setWishlistNotes('');
  };

  const showError = (msg: string) => {
    Swal.fire({
      title: 'Validasi Gagal',
      text: msg,
      confirmButtonText: 'OK',
      confirmButtonColor: '#ef4444',
      background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
      color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#1e293b'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isEdit = !!editData;

    if (activeForm === 'pengeluaran') {
      const parsedAmount = parseAmountInput(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) return showError('Jumlah harus valid!');
      if (!selectedWalletId) return showError('Silakan pilih atau tambahkan dompet terlebih dahulu!');
      if (!selectedCategoryId) return showError('Silakan pilih atau tambahkan kategori terlebih dahulu!');

      const data = {
        type: 'pengeluaran' as const,
        amount: parsedAmount,
        description: description.trim() || 'Pengeluaran Tanpa Nama',
        date,
        walletId: selectedWalletId,
        categoryId: selectedCategoryId
      };

      if (isEdit && onUpdateTransaction) {
        onUpdateTransaction(editData.id, data);
      } else {
        onAddTransaction(data);
      }
    } else if (activeForm === 'pemasukan') {
      const parsedAmount = parseAmountInput(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) return showError('Jumlah harus valid!');
      if (!selectedWalletId) return showError('Silakan pilih atau tambahkan dompet terlebih dahulu!');
      if (!selectedSourceId) return showError('Silakan pilih atau tambahkan sumber pendapatan terlebih dahulu!');

      const data = {
        type: 'pemasukan' as const,
        amount: parsedAmount,
        description: description.trim() || 'Pemasukan Tanpa Nama',
        date,
        walletId: selectedWalletId,
        sourceId: selectedSourceId
      };

      if (isEdit && onUpdateTransaction) {
        onUpdateTransaction(editData.id, data);
      } else {
        onAddTransaction(data);
      }
    } else if (activeForm === 'transfer') {
      const parsedAmount = parseAmountInput(amount);
      const parsedAdminFee = adminFee ? parseAmountInput(adminFee) : 0;
      if (isNaN(parsedAmount) || parsedAmount <= 0) return showError('Jumlah transfer harus valid!');
      if (isNaN(parsedAdminFee) || parsedAdminFee < 0) return showError('Biaya admin harus angka valid!');
      if (!selectedWalletId) return showError('Silakan pilih dompet asal!');
      if (!selectedToWalletId) return showError('Silakan pilih dompet tujuan!');
      if (selectedWalletId === selectedToWalletId) return showError('Dompet asal dan tujuan tidak boleh sama!');

      const data = {
        type: 'transfer' as const,
        amount: parsedAmount,
        adminFee: parsedAdminFee,
        description: description.trim() || 'Transfer Saldo',
        date,
        walletId: selectedWalletId,
        toWalletId: selectedToWalletId
      };

      if (isEdit && onUpdateTransaction) {
        onUpdateTransaction(editData.id, data);
      } else {
        onAddTransaction(data);
      }
    } else if (activeForm === 'budgeting') {
      const parsedLimit = parseAmountInput(budgetLimit);
      if (isNaN(parsedLimit) || parsedLimit <= 0) return showError('Anggaran limit harus valid!');

      const isAllCats = budgetSelectedCategoryIds.includes('all') || (categories.length > 0 && budgetSelectedCategoryIds.length === categories.length);
      const isAllWals = budgetSelectedWalletIds.includes('all') || (wallets.length > 0 && budgetSelectedWalletIds.length === wallets.length);

      if (!isAllCats && budgetSelectedCategoryIds.length === 0) {
        return showError('Silakan pilih minimal satu kategori pengeluaran!');
      }
      if (!isAllWals && budgetSelectedWalletIds.length === 0) {
        return showError('Silakan pilih minimal satu dompet / akun!');
      }

      const finalCatIds = isAllCats ? ['all'] : budgetSelectedCategoryIds;
      const finalWalIds = isAllWals ? ['all'] : budgetSelectedWalletIds;

      const data = {
        categoryId: isAllCats ? 'all' : finalCatIds.join(','),
        categoryIds: finalCatIds,
        limitAmount: parsedLimit,
        month: budgetMonth,
        walletId: isAllWals ? 'all' : finalWalIds.join(','),
        walletIds: finalWalIds
      };

      if (isEdit && onUpdateBudget) {
        onUpdateBudget(editData.id, data);
      } else {
        onAddBudget(data);
      }
    } else if (activeForm === 'tabungan') {
      const parsedTarget = parseAmountInput(savingTarget);
      const parsedCurrent = parseAmountInput(savingCurrent);
      if (isNaN(parsedTarget) || parsedTarget <= 0) return showError('Target jumlah harus valid!');
      if (!savingName.trim()) return showError('Nama target tabungan wajib diisi!');

      const data = {
        name: savingName.trim(),
        targetAmount: parsedTarget,
        currentAmount: isNaN(parsedCurrent) ? 0 : parsedCurrent,
        deadline: savingDeadline,
        color: savingColor
      };

      if (isEdit && onUpdateSaving) {
        onUpdateSaving(editData.id, data);
      } else {
        onAddSaving(data);
      }
    } else if (activeForm === 'aktivitas') {
      if (!activityTitle.trim()) return showError('Judul aktivitas wajib diisi!');
      
      const data = {
        title: activityTitle.trim(),
        description: activityDesc.trim(),
        deadline: activityDeadline
      };

      if (isEdit && onUpdateActivity) {
        onUpdateActivity(editData.id, data);
      } else {
        onAddActivity(data);
      }
    } else if (activeForm === 'wishlist') {
      if (!wishlistTitle.trim()) return showError('Nama barang wishlist wajib diisi!');

      const data = {
        title: wishlistTitle.trim(),
        month: wishlistMonth,
        price: wishlistPrice ? parseAmountInput(wishlistPrice) : undefined,
        notes: wishlistNotes.trim() || undefined
      };

      if (isEdit && onUpdateWishlist) {
        onUpdateWishlist(editData.id, data);
      } else {
        onAddWishlist(data);
      }
    }

    resetForms();
    onClose();
  };

  const getFormInputClass = (extra = "") => {
    if (uiStyle === 'glass') {
      return `glass-input text-slate-950 dark:text-white font-extrabold placeholder:text-slate-500/80 dark:placeholder:text-slate-400/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 transition-all ${extra}`;
    }
    return `border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 font-medium transition-all focus:outline-none ${extra}`;
  };

  return typeof document !== 'undefined' && createPortal(
    <div 
      className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden no-print"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          resetForms();
          onClose();
        }
      }}
    >
      <div className={`relative w-full max-w-lg mx-auto rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[78vh] sm:h-[580px] max-h-[85vh] sm:max-h-[80vh] border-t sm:border border-slate-200/90 dark:border-slate-800 animate-in slide-in-from-bottom duration-200 ${
        uiStyle === 'glass' 
          ? 'glass-card' 
          : 'bg-white dark:bg-slate-900'
      }`}>
        {/* Mobile Sheet Drag Indicator */}
        <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="px-4 sm:px-5 pt-3.5 sm:pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-snug">
              Form Input Data
            </h3>
            {(() => {
              const badge = getBadgeProps();
              return (
                <span 
                  className={`text-[10px] px-2.5 py-0.5 rounded-full ${badge.className}`}
                  style={badge.style}
                >
                  {badge.label}
                </span>
              );
            })()}
          </div>
        </div>

        {/* Tab Selection Navigation */}
        {!editData && (
          <div className="px-4 sm:px-5 pt-2.5 pb-2 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/60 dark:bg-slate-900/60">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              {(['pengeluaran', 'pemasukan', 'transfer', 'budgeting', 'tabungan', 'aktivitas', 'wishlist'] as FormType[]).map((tab) => {
                const isActive = activeForm === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveForm(tab)}
                    className={`shrink-0 px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer select-none ${
                      isActive 
                        ? 'shadow-xs text-white' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-200/50 hover:bg-slate-200/80 dark:bg-slate-800/60 dark:hover:bg-slate-800'
                    }`}
                    style={isActive ? { backgroundColor: resolvedAccent } : undefined}
                  >
                    {tab === 'pengeluaran' ? 'Pengeluaran' : 
                     tab === 'pemasukan' ? 'Pendapatan' : 
                     tab === 'transfer' ? 'Transfer' : 
                     tab === 'budgeting' ? 'Budgeting' : 
                     tab === 'tabungan' ? 'Tabungan' : 
                     tab === 'aktivitas' ? 'Aktivitas' : 'Wishlist'}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Body Form */}
        <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
          <form id="forms-modal-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col gap-4">
          
          {/* PENGELUARAN & PEMASUKAN SHARED INPUTS */}
          {(activeForm === 'pengeluaran' || activeForm === 'pemasukan') && (
            <>
              {/* Wallet Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Metode / Dompet</label>
                <select
                  value={selectedWalletId}
                  onChange={(e) => setSelectedWalletId(e.target.value)}
                  className={getFormInputClass("px-3.5 py-2.5 text-xs rounded-xl")}
                  required
                >
                  <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-500 font-semibold">-- Pilih Dompet --</option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
                      {w.name} (Saldo: Rp {w.initialBalance.toLocaleString('id-ID')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Jumlah (Nominal Rupiah)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-xs text-slate-600 dark:text-slate-300">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
                    placeholder="0"
                    className={getFormInputClass("w-full pl-9 pr-16 py-2.5 text-sm rounded-xl font-mono")}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const currentVal = parseAmountInput(amount);
                      setAmount(currentVal > 0 ? (currentVal * 1000).toString() : '100000');
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-black bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-slate-700 transition focus:outline-none select-none z-10 shadow-sm"
                  >
                    +000
                  </button>
                </div>
                {parseAmountInput(amount) > 0 && (
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 pl-1">
                    = {formatIDR(parseAmountInput(amount))}
                  </span>
                )}
              </div>

              {/* Kategori Pengeluaran (Only for Pengeluaran) */}
              {activeForm === 'pengeluaran' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Kategori Pengeluaran</label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className={getFormInputClass("px-3.5 py-2.5 text-xs rounded-xl")}
                    required
                  >
                    <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-500 font-semibold">-- Pilih Kategori --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sumber Pendapatan (Only for Pemasukan) */}
              {activeForm === 'pemasukan' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Sumber Pendapatan</label>
                  <select
                    value={selectedSourceId}
                    onChange={(e) => setSelectedSourceId(e.target.value)}
                    className={getFormInputClass("px-3.5 py-2.5 text-xs rounded-xl")}
                    required
                  >
                    <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-500 font-semibold">-- Pilih Sumber --</option>
                    {sources.map((s) => (
                      <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tanggal & Deskripsi */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Tanggal</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={getFormInputClass("px-3.5 py-2 text-xs rounded-xl")}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Catatan/Keterangan</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Beli kopi, jajan dll"
                    className={getFormInputClass("px-3.5 py-2 text-xs rounded-xl")}
                  />
                </div>
              </div>
            </>
          )}

          {/* TRANSFER BALDO INPUTS */}
          {activeForm === 'transfer' && (
            <>
              {/* Source & Destination Wallets */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Dompet Asal (Dari)</label>
                  <select
                    value={selectedWalletId}
                    onChange={(e) => setSelectedWalletId(e.target.value)}
                    className={getFormInputClass("px-3.5 py-2.5 text-xs rounded-xl")}
                    required
                  >
                    <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-500 font-semibold">-- Pilih Asal --</option>
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Dompet Tujuan (Ke)</label>
                  <select
                    value={selectedToWalletId}
                    onChange={(e) => setSelectedToWalletId(e.target.value)}
                    className={getFormInputClass("px-3.5 py-2.5 text-xs rounded-xl")}
                    required
                  >
                    <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-500 font-semibold">-- Pilih Tujuan --</option>
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount & Admin Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Jumlah Transfer</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-xs text-slate-600 dark:text-slate-300">Rp</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      min="1"
                      className={getFormInputClass("w-full pl-9 pr-16 py-2.5 text-sm rounded-xl font-mono")}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setAmount(prev => prev ? prev + '000' : '1000')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-black bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-slate-700 transition focus:outline-none select-none z-10 shadow-sm"
                    >
                      +000
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Biaya Admin (Opsional)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-xs text-slate-600 dark:text-slate-300">Rp</span>
                    <input
                      type="number"
                      value={adminFee}
                      onChange={(e) => setAdminFee(e.target.value)}
                      placeholder="0 (misal: 1200)"
                      min="0"
                      className={getFormInputClass("w-full pl-9 pr-3 py-2.5 text-sm rounded-xl font-mono")}
                    />
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium -mt-2">
                * Biaya admin hanya dipotong dari Dompet Asal dan tidak menambah saldo Dompet Tujuan.
              </p>

              {/* Tanggal & Deskripsi */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Tanggal</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={getFormInputClass("px-3.5 py-2 text-xs rounded-xl")}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Keterangan</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mutasi, Tarik ATM, dll"
                    className={getFormInputClass("px-3.5 py-2 text-xs rounded-xl")}
                  />
                </div>
              </div>
            </>
          )}

          {/* BUDGETING FORM */}
          {activeForm === 'budgeting' && (() => {
            const isAllWals = budgetSelectedWalletIds.includes('all') || (wallets.length > 0 && budgetSelectedWalletIds.length === wallets.length);
            const isAllCats = budgetSelectedCategoryIds.includes('all') || (categories.length > 0 && budgetSelectedCategoryIds.length === categories.length);

            const toggleAllWallets = () => {
              if (isAllWals) {
                setBudgetSelectedWalletIds([]);
              } else {
                setBudgetSelectedWalletIds(['all']);
              }
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
                  if (next.length === wallets.length) {
                    setBudgetSelectedWalletIds(['all']);
                  } else {
                    setBudgetSelectedWalletIds(next);
                  }
                }
              }
            };

            const isWalletActive = (wId: string) => {
              return isAllWals || budgetSelectedWalletIds.includes(wId);
            };

            const toggleAllCategories = () => {
              if (isAllCats) {
                setBudgetSelectedCategoryIds([]);
              } else {
                setBudgetSelectedCategoryIds(['all']);
              }
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
                  if (next.length === categories.length) {
                    setBudgetSelectedCategoryIds(['all']);
                  } else {
                    setBudgetSelectedCategoryIds(next);
                  }
                }
              }
            };

            const isCategoryActive = (cId: string) => {
              return isAllCats || budgetSelectedCategoryIds.includes(cId);
            };

            const selectedWalletsList = isAllWals ? wallets : wallets.filter(w => budgetSelectedWalletIds.includes(w.id));
            const selectedCategoriesList = isAllCats ? categories : categories.filter(c => budgetSelectedCategoryIds.includes(c.id));

            return (
              <>
                {/* 1. Wallet Multi-Select Checkboxes */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                      {language === 'en' ? 'Select Wallet / Account' : 'Pilih Dompet / Akun'}
                    </label>
                    <button
                      type="button"
                      onClick={toggleAllWallets}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-1.5 py-0.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition cursor-pointer"
                    >
                      {isAllWals
                        ? (language === 'en' ? 'Uncheck All' : 'Batal Pilih Semua')
                        : (language === 'en' ? 'Select All' : 'Pilih Semua')}
                    </button>
                  </div>

                  {/* Wallets Checkbox Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                    {/* All Wallets Option Card */}
                    <button
                      type="button"
                      onClick={toggleAllWallets}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isAllWals
                          ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 text-indigo-950 dark:text-indigo-100 shadow-2xs'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold block truncate">
                            {language === 'en' ? 'All Wallets (Global)' : 'Semua Dompet (Global)'}
                          </span>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center transition-all shrink-0 ml-2 ${
                        isAllWals
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'border border-slate-300 dark:border-slate-600'
                      }`}>
                        {isAllWals && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>

                    {/* Individual Wallet Cards */}
                    {wallets.map((w) => {
                      const active = isWalletActive(w.id);
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => toggleSingleWallet(w.id)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            active && !isAllWals
                              ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 text-indigo-950 dark:text-indigo-100 shadow-2xs'
                              : isAllWals
                                ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
                                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                              style={{ backgroundColor: `${w.color || '#3b82f6'}20` }}
                            >
                              <IconRenderer name={w.icon || 'Wallet'} className="w-4 h-4" style={{ color: w.color || '#3b82f6' }} />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold block truncate">{w.name}</span>
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-md flex items-center justify-center transition-all shrink-0 ml-2 ${
                            active
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'border border-slate-300 dark:border-slate-600'
                          }`}>
                            {active && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Category Multi-Select Checkboxes */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                      {language === 'en' ? 'Select Expense Category' : 'Pilih Kategori Pengeluaran'}
                    </label>
                    <button
                      type="button"
                      onClick={toggleAllCategories}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-1.5 py-0.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition cursor-pointer"
                    >
                      {isAllCats
                        ? (language === 'en' ? 'Uncheck All' : 'Batal Pilih Semua')
                        : (language === 'en' ? 'Select All' : 'Pilih Semua')}
                    </button>
                  </div>

                  {/* Categories Checkbox Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {/* All Categories Option Card */}
                    <button
                      type="button"
                      onClick={toggleAllCategories}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isAllCats
                          ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 text-indigo-950 dark:text-indigo-100 shadow-2xs'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold block truncate">
                            {language === 'en' ? 'All Categories (Total Spending Limit)' : 'Semua Kategori (Batas Belanja Total)'}
                          </span>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center transition-all shrink-0 ml-2 ${
                        isAllCats
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'border border-slate-300 dark:border-slate-600'
                      }`}>
                        {isAllCats && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>

                    {/* Individual Category Cards */}
                    {categories.map((c) => {
                      const active = isCategoryActive(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => toggleSingleCategory(c.id)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            active && !isAllCats
                              ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 text-indigo-950 dark:text-indigo-100 shadow-2xs'
                              : isAllCats
                                ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
                                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                              style={{ backgroundColor: `${c.color || '#10b981'}20` }}
                            >
                              <IconRenderer name={c.icon || 'Tag'} className="w-4 h-4" style={{ color: c.color || '#10b981' }} />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold block truncate">{c.name}</span>
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-md flex items-center justify-center transition-all shrink-0 ml-2 ${
                            active
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'border border-slate-300 dark:border-slate-600'
                          }`}>
                            {active && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Monthly Spending Limit (Rp) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    {language === 'en' ? 'Monthly Spending Limit (Rp)' : 'Batas Belanja Bulanan (Rp)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-xs text-slate-600 dark:text-slate-300">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={budgetLimit}
                      onChange={(e) => setBudgetLimit(e.target.value.replace(/[^0-9.,]/g, ''))}
                      placeholder={language === 'en' ? 'Estimated spending limit' : 'Estimasi limit pengeluaran'}
                      className={getFormInputClass("w-full pl-9 pr-16 py-2.5 text-xs rounded-xl font-mono")}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const currentVal = parseAmountInput(budgetLimit);
                        setBudgetLimit(currentVal > 0 ? (currentVal * 1000).toString() : '1000000');
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-black bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-slate-700 transition focus:outline-none select-none z-10 shadow-sm cursor-pointer"
                    >
                      +000
                    </button>
                  </div>
                  {parseAmountInput(budgetLimit) > 0 && (
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 pl-1">
                      = {formatIDR(parseAmountInput(budgetLimit))}
                    </span>
                  )}
                </div>

                {/* 5. Month Picker */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    {language === 'en' ? 'Budget Month' : 'Bulan Anggaran'}
                  </label>
                  <input
                    type="month"
                    value={budgetMonth}
                    onChange={(e) => setBudgetMonth(e.target.value)}
                    className={getFormInputClass("px-3.5 py-2 text-xs rounded-xl")}
                    required
                  />
                </div>
              </>
            );
          })()}

          {/* TABUNGAN FORM */}
          {activeForm === 'tabungan' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Nama Target Tabungan</label>
                <input
                  type="text"
                  value={savingName}
                  onChange={(e) => setSavingName(e.target.value)}
                  placeholder="Contoh: Beli Laptop Baru, Liburan"
                  className={getFormInputClass("px-3.5 py-2.5 text-xs rounded-xl")}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Target Jumlah (Rp)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={savingTarget}
                      onChange={(e) => setSavingTarget(e.target.value)}
                      placeholder="0"
                      className={getFormInputClass("w-full pl-3.5 pr-14 py-2 text-xs rounded-xl font-mono")}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setSavingTarget(prev => prev ? prev + '000' : '1000')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-black bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-slate-700 transition focus:outline-none select-none z-10 shadow-sm"
                    >
                      +000
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Dana Terkumpul Awal (Rp)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={savingCurrent}
                      onChange={(e) => setSavingCurrent(e.target.value)}
                      className={getFormInputClass("w-full pl-3.5 pr-14 py-2 text-xs rounded-xl font-mono")}
                    />
                    <button
                      type="button"
                      onClick={() => setSavingCurrent(prev => prev ? prev + '000' : '1000')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-black bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-slate-700 transition focus:outline-none select-none z-10 shadow-sm"
                    >
                      +000
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* AKTIVITAS FORM */}
          {activeForm === 'aktivitas' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Judul Aktivitas Harian</label>
                <input
                  type="text"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="Contoh: Belajar Coding React, Bayar BPJS"
                  className={getFormInputClass("px-3.5 py-2.5 text-xs rounded-xl")}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Detail Deskripsi</label>
                <textarea
                  value={activityDesc}
                  onChange={(e) => setActivityDesc(e.target.value)}
                  placeholder="Keterangan singkat aktivitas..."
                  rows={2}
                  className={getFormInputClass("px-3.5 py-2 text-xs rounded-xl")}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Batas Waktu (Deadline)</label>
                <input
                  type="date"
                  value={activityDeadline}
                  onChange={(e) => setActivityDeadline(e.target.value)}
                  className={getFormInputClass("px-3.5 py-2 text-xs rounded-xl")}
                  required
                />
              </div>
            </>
          )}

          {/* WISHLIST FORM */}
          {activeForm === 'wishlist' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Nama Barang Wishlist</label>
                <input
                  type="text"
                  value={wishlistTitle}
                  onChange={(e) => setWishlistTitle(e.target.value)}
                  placeholder="Contoh: Sepatu Adidas Samba, Meja Kerja"
                  className={getFormInputClass("px-3.5 py-2.5 text-xs rounded-xl")}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Estimasi Harga (Optional)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={wishlistPrice}
                      onChange={(e) => setWishlistPrice(e.target.value)}
                      placeholder="0"
                      className={getFormInputClass("w-full pl-3.5 pr-14 py-2.5 text-xs rounded-xl font-mono")}
                    />
                    <button
                      type="button"
                      onClick={() => setWishlistPrice(prev => prev ? prev + '000' : '1000')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-black bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-slate-700 transition focus:outline-none select-none z-10 shadow-sm"
                    >
                      +000
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Target Bulan Rencana</label>
                  <input
                    type="month"
                    value={wishlistMonth}
                    onChange={(e) => setWishlistMonth(e.target.value)}
                    className={getFormInputClass("px-3.5 py-2 text-xs rounded-xl")}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Catatan Tambahan</label>
                <textarea
                  value={wishlistNotes}
                  onChange={(e) => setWishlistNotes(e.target.value)}
                  placeholder="Keterangan atau link produk..."
                  rows={2}
                  className={getFormInputClass("px-3.5 py-2 text-xs rounded-xl")}
                />
              </div>
            </>
          )}

          </form>
        </div>

        {/* Footer Summary with Action Buttons (Matching Rincian Transaksi Footer) */}
        <div className="relative px-4 sm:px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom,20px))] sm:pb-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs shrink-0 bg-slate-50/70 dark:bg-slate-900/70">
          <button
            type="button"
            onClick={() => {
              resetForms();
              onClose();
            }}
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition shadow-xs cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            form="forms-modal-form"
            className={`px-6 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs transition active:scale-95 cursor-pointer ${getAccentBg()}`}
            style={isHex ? { backgroundColor: accentColor } : undefined}
          >
            {editData ? 'Simpan Perubahan' : 'Simpan Catatan'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
