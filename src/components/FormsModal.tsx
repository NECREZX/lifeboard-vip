/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Wallet as WalletIcon, FolderPlus, Coins, Plus, Calendar, Bookmark, Landmark, Sparkles } from 'lucide-react';
import Swal from 'sweetalert2';
import { Wallet, Category, IncomeSource } from '../types';

interface FormsModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  categories: Category[];
  sources: IncomeSource[];
  accentColor: string;
  initialTab?: FormType;
  editData?: any;
  onAddTransaction: (data: {
    type: 'pemasukan' | 'pengeluaran';
    amount: number;
    description: string;
    date: string;
    walletId: string;
    categoryId?: string;
    sourceId?: string;
  }) => void;
  onUpdateTransaction?: (id: string, data: {
    type: 'pemasukan' | 'pengeluaran';
    amount: number;
    description: string;
    date: string;
    walletId: string;
    categoryId?: string;
    sourceId?: string;
  }) => void;
  onAddBudget: (data: { categoryId: string; limitAmount: number; month: string }) => void;
  onUpdateBudget?: (id: string, data: { categoryId: string; limitAmount: number; month: string }) => void;
  onAddSaving: (data: { name: string; targetAmount: number; currentAmount: number; deadline: string; color: string }) => void;
  onUpdateSaving?: (id: string, data: { name: string; targetAmount: number; currentAmount: number; deadline: string; color: string }) => void;
  onAddActivity: (data: { title: string; description: string; deadline: string }) => void;
  onUpdateActivity?: (id: string, data: { title: string; description: string; deadline: string }) => void;
  onAddWishlist: (data: { title: string; month: string; price?: number; notes?: string }) => void;
  onUpdateWishlist?: (id: string, data: { title: string; month: string; price?: number; notes?: string }) => void;
}

type FormType = 'pengeluaran' | 'pemasukan' | 'budgeting' | 'tabungan' | 'aktivitas' | 'wishlist';

export default function FormsModal({
  isOpen,
  onClose,
  wallets,
  categories,
  sources,
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
  onUpdateWishlist
}: FormsModalProps) {
  const [activeForm, setActiveForm] = React.useState<FormType>(initialTab || 'pengeluaran');

  // Form input states
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedWalletId, setSelectedWalletId] = useState(wallets[0]?.id || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || '');
  const [selectedSourceId, setSelectedSourceId] = useState(sources[0]?.id || '');

  // Budget states
  const [budgetLimit, setBudgetLimit] = useState('');
  const [budgetCategoryId, setBudgetCategoryId] = useState(categories[0]?.id || '');
  const [budgetMonth, setBudgetMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

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
      if (initialTab) {
        setActiveForm(initialTab);
      }
      
      if (editData) {
        if (activeForm === 'pengeluaran' || activeForm === 'pemasukan') {
          setAmount(editData.amount.toString());
          setDescription(editData.description || '');
          setDate(editData.date);
          setSelectedWalletId(editData.walletId);
          if (editData.categoryId) setSelectedCategoryId(editData.categoryId);
          if (editData.sourceId) setSelectedSourceId(editData.sourceId);
        } else if (activeForm === 'budgeting') {
          setBudgetLimit(editData.limitAmount.toString());
          setBudgetCategoryId(editData.categoryId);
          setBudgetMonth(editData.month);
        } else if (activeForm === 'tabungan') {
          setSavingName(editData.name);
          setSavingTarget(editData.targetAmount.toString());
          setSavingCurrent(editData.currentAmount.toString());
          setSavingDeadline(editData.deadline);
          setSavingColor(editData.color);
        } else if (activeForm === 'aktivitas') {
          setActivityTitle(editData.title);
          setActivityDesc(editData.description || '');
          setActivityDeadline(editData.deadline);
        } else if (activeForm === 'wishlist') {
          setWishlistTitle(editData.title);
          setWishlistMonth(editData.month);
          setWishlistPrice(editData.price?.toString() || '');
          setWishlistNotes(editData.notes || '');
        }
      } else {
        // Reset to defaults if not editing
        resetForms();
      }
    }
  }, [isOpen, editData, initialTab]);

  if (!isOpen) return null;

  const getAccentBg = () => {
    switch (accentColor) {
      case 'emerald': return 'bg-emerald-500 hover:bg-emerald-600';
      case 'amber': return 'bg-amber-500 hover:bg-amber-600';
      case 'rose': return 'bg-rose-500 hover:bg-rose-600';
      default: return 'bg-indigo-600 hover:bg-indigo-700';
    }
  };

  const getAccentText = (active: boolean) => {
    if (!active) return 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200';
    switch (accentColor) {
      case 'emerald': return 'text-emerald-500 font-bold border-emerald-500';
      case 'amber': return 'text-amber-500 font-bold border-amber-500';
      case 'rose': return 'text-rose-500 font-bold border-rose-500';
      default: return 'text-indigo-600 dark:text-indigo-400 font-bold border-indigo-600 dark:border-indigo-400';
    }
  };

  const getActiveTabClass = (type: FormType) => {
    return activeForm === type
      ? `border-b-2 py-2 px-3 text-xs font-bold shrink-0 transition ${getAccentText(true)}`
      : 'py-2 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 hover:text-slate-700 dark:hover:text-slate-300';
  };

  const resetForms = () => {
    setAmount('');
    setDescription('');
    setBudgetLimit('');
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
      icon: 'error',
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
      const parsedAmount = parseFloat(amount);
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
      const parsedAmount = parseFloat(amount);
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
    } else if (activeForm === 'budgeting') {
      const parsedLimit = parseFloat(budgetLimit);
      if (isNaN(parsedLimit) || parsedLimit <= 0) return showError('Anggaran limit harus valid!');
      if (!budgetCategoryId) return showError('Silakan tentukan kategori anggaran!');

      const data = {
        categoryId: budgetCategoryId,
        limitAmount: parsedLimit,
        month: budgetMonth
      };

      if (isEdit && onUpdateBudget) {
        onUpdateBudget(editData.id, data);
      } else {
        onAddBudget(data);
      }
    } else if (activeForm === 'tabungan') {
      const parsedTarget = parseFloat(savingTarget);
      const parsedCurrent = parseFloat(savingCurrent);
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
        price: wishlistPrice ? parseFloat(wishlistPrice) : undefined,
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

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto no-print">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800/80 my-8">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
              {editData ? 'Perbarui' : 'Tambah'} {activeForm.charAt(0).toUpperCase() + activeForm.slice(1)}
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">Isi form di bawah ini untuk menyimpan perubahan</p>
          </div>
          <button
            onClick={() => {
              resetForms();
              onClose();
            }}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-300 transition focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-xl overflow-x-auto scrollbar-none gap-0.5">
            {(['pengeluaran', 'pemasukan', 'budgeting', 'tabungan', 'aktivitas', 'wishlist'] as FormType[]).map((tab) => {
              const isActive = activeForm === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveForm(tab)}
                  className={`flex-1 min-w-[76px] text-center py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-200 uppercase tracking-tight focus:outline-none ${
                    isActive 
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[60vh]">
          
          {/* PENGELUARAN & PEMASUKAN SHARED INPUTS */}
          {(activeForm === 'pengeluaran' || activeForm === 'pemasukan') && (
            <>
              {/* Wallet Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Metode / Dompet</label>
                <select
                  value={selectedWalletId}
                  onChange={(e) => setSelectedWalletId(e.target.value)}
                  className="px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-none"
                  required
                >
                  <option value="" disabled>-- Pilih Dompet --</option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} (Saldo: Rp {w.initialBalance.toLocaleString('id-ID')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jumlah (Nominal Rupiah)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400 dark:text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    min="1"
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 font-mono text-slate-800 dark:text-slate-100 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Kategori Pengeluaran (Only for Pengeluaran) */}
              {activeForm === 'pengeluaran' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kategori Pengeluaran</label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-none"
                    required
                  >
                    <option value="" disabled>-- Pilih Kategori --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sumber Pendapatan (Only for Pemasukan) */}
              {activeForm === 'pemasukan' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sumber Pendapatan</label>
                  <select
                    value={selectedSourceId}
                    onChange={(e) => setSelectedSourceId(e.target.value)}
                    className="px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-none"
                    required
                  >
                    <option value="" disabled>-- Pilih Sumber --</option>
                    {sources.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tanggal & Deskripsi */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tanggal</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Catatan/Keterangan</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Beli kopi, jajan dll"
                    className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* BUDGETING FORM */}
          {activeForm === 'budgeting' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kategori Pengeluaran</label>
                <select
                  value={budgetCategoryId}
                  onChange={(e) => setBudgetCategoryId(e.target.value)}
                  className="px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Batas Belanja Bulanan (Rp)</label>
                <input
                  type="number"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  placeholder="Estimasi limit pengeluaran"
                  className="px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 font-mono text-slate-800 dark:text-slate-100 focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bulan Anggaran</label>
                <input
                  type="month"
                  value={budgetMonth}
                  onChange={(e) => setBudgetMonth(e.target.value)}
                  className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-none"
                  required
                />
              </div>
            </>
          )}

          {/* TABUNGAN FORM */}
          {activeForm === 'tabungan' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama Target Tabungan</label>
                <input
                  type="text"
                  value={savingName}
                  onChange={(e) => setSavingName(e.target.value)}
                  placeholder="Contoh: Beli Laptop Baru, Liburan"
                  className="px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Target Jumlah (Rp)</label>
                  <input
                    type="number"
                    value={savingTarget}
                    onChange={(e) => setSavingTarget(e.target.value)}
                    placeholder="0"
                    className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 font-mono text-slate-800 dark:text-slate-100 focus:outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dana Terkumpul Awal (Rp)</label>
                  <input
                    type="number"
                    value={savingCurrent}
                    onChange={(e) => setSavingCurrent(e.target.value)}
                    className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 font-mono text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Deadline Target</label>
                  <input
                    type="date"
                    value={savingDeadline}
                    onChange={(e) => setSavingDeadline(e.target.value)}
                    className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pilih Warna Tag</label>
                  <div className="flex gap-2 items-center h-full pt-1">
                    {['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSavingColor(color)}
                        className={`w-5 h-5 rounded-full border-2 transition ${savingColor === color ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* AKTIVITAS FORM */}
          {activeForm === 'aktivitas' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Judul Aktivitas Harian</label>
                <input
                  type="text"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="Contoh: Belajar Coding React, Bayar BPJS"
                  className="px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Detail Deskripsi</label>
                <textarea
                  value={activityDesc}
                  onChange={(e) => setActivityDesc(e.target.value)}
                  placeholder="Keterangan singkat aktivitas..."
                  rows={2}
                  className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Batas Waktu (Deadline)</label>
                <input
                  type="date"
                  value={activityDeadline}
                  onChange={(e) => setActivityDeadline(e.target.value)}
                  className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-none"
                  required
                />
              </div>
            </>
          )}

          {/* WISHLIST FORM */}
          {activeForm === 'wishlist' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama Barang Wishlist</label>
                <input
                  type="text"
                  value={wishlistTitle}
                  onChange={(e) => setWishlistTitle(e.target.value)}
                  placeholder="Contoh: Sepatu Adidas Samba, Meja Kerja"
                  className="px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estimasi Harga (Optional)</label>
                  <input
                    type="number"
                    value={wishlistPrice}
                    onChange={(e) => setWishlistPrice(e.target.value)}
                    placeholder="0"
                    className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 font-mono text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Target Bulan Rencana</label>
                  <input
                    type="month"
                    value={wishlistMonth}
                    onChange={(e) => setWishlistMonth(e.target.value)}
                    className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Catatan Tambahan</label>
                <textarea
                  value={wishlistNotes}
                  onChange={(e) => setWishlistNotes(e.target.value)}
                  placeholder="Keterangan atau link produk..."
                  rows={2}
                  className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </>
          )}

          {/* Form Submit Footer */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900">
            <button
              type="button"
              onClick={() => {
                resetForms();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition ${getAccentBg()}`}
            >
              Simpan Catatan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
