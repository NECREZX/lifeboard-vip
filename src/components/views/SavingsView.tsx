/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Trash2, 
  Check, 
  Edit2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ChevronDown, 
  ChevronUp, 
  X,
  Coins,
  Plus,
  Search
} from 'lucide-react';
import { Saving, SavingLog, Wallet } from '../../types';
import { formatIDR } from '../../lib/formatters';
import { parseAmountInput } from '../FormsModal';

interface SavingsViewProps {
  savings: Saving[];
  savingLogs: SavingLog[];
  wallets: Wallet[];
  savingFilter: 'semua' | 'berjalan' | 'tercapai';
  setSavingFilter: (val: 'semua' | 'berjalan' | 'tercapai') => void;
  getCardClasses: () => string;
  handleDeleteSaving: (id: string) => void;
  onDepositSaving: (savingId: string, walletId: string, amount: number, date: string, notes?: string) => void;
  onWithdrawSaving: (savingId: string, walletId: string, amount: number, date: string, notes?: string) => void;
  onUpdateSavingLog: (logId: string, walletId: string, amount: number, date: string, notes?: string) => void;
  onDeleteSavingLog: (logId: string) => void;
  onEdit: (saving: Saving) => void;
  settings?: any;
}

export const SavingsView: React.FC<SavingsViewProps> = ({
  savings,
  savingLogs = [],
  wallets = [],
  savingFilter,
  setSavingFilter,
  getCardClasses,
  handleDeleteSaving,
  onDepositSaving,
  onWithdrawSaving,
  onUpdateSavingLog,
  onDeleteSavingLog,
  onEdit,
}) => {
  // 1. Modal Setor / Tarik / Edit Log State
  const [activeModalSaving, setActiveModalSaving] = useState<Saving | null>(null);
  const [editingSavingLog, setEditingSavingLog] = useState<SavingLog | null>(null);
  const [actionType, setActionType] = useState<'setor' | 'tarik'>('setor');
  const [formWalletId, setFormWalletId] = useState<string>('');
  const [formAmount, setFormAmount] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [formNotes, setFormNotes] = useState<string>('');

  // 2. Modal Rincian Riwayat Transaksi (Inspecting Logs Modal, persis menu Budgeting)
  const [inspectingSaving, setInspectingSaving] = useState<Saving | null>(null);
  const [inspectingSearchQuery, setInspectingSearchQuery] = useState<string>('');
  const [canScrollDown, setCanScrollDown] = useState<boolean>(false);
  const modalListRef = useRef<HTMLDivElement>(null);

  const checkModalScroll = useCallback(() => {
    if (!modalListRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = modalListRef.current;
    setCanScrollDown(scrollHeight - scrollTop - clientHeight > 12);
  }, []);

  // Buka Modal Form Setor / Tarik
  const openActionModal = (saving: Saving, type: 'setor' | 'tarik') => {
    const isCompleted = saving.currentAmount >= saving.targetAmount;
    setEditingSavingLog(null);
    setActiveModalSaving(saving);
    // Jika target sudah tercapai, otomatis arahkan ke tarik saldo
    setActionType(isCompleted ? 'tarik' : type);
    setFormWalletId(wallets[0]?.id || '');
    setFormAmount('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormNotes('');
  };

  // Buka Modal Form Edit Log Transaksi
  const openEditLogModal = (log: SavingLog) => {
    const targetSaving = savings.find(s => s.id === log.savingId) || inspectingSaving;
    if (!targetSaving) return;
    setEditingSavingLog(log);
    setActiveModalSaving(targetSaving);
    setActionType(log.type);
    setFormWalletId(log.walletId);
    setFormAmount(log.amount.toString());
    setFormDate(log.date);
    setFormNotes(log.notes || '');
  };

  const closeActionModal = () => {
    setActiveModalSaving(null);
    setEditingSavingLog(null);
    setFormAmount('');
    setFormNotes('');
  };

  // Submit Handler Setor / Tarik / Edit
  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalSaving) return;

    const amountVal = parseAmountInput(formAmount);
    if (amountVal <= 0) return;

    const targetWalletId = formWalletId || wallets[0]?.id;
    if (!targetWalletId) return;

    if (editingSavingLog) {
      onUpdateSavingLog(
        editingSavingLog.id,
        targetWalletId,
        amountVal,
        formDate,
        formNotes.trim() || undefined
      );
    } else if (actionType === 'setor') {
      onDepositSaving(
        activeModalSaving.id,
        targetWalletId,
        amountVal,
        formDate,
        formNotes.trim() || undefined
      );
    } else {
      onWithdrawSaving(
        activeModalSaving.id,
        targetWalletId,
        amountVal,
        formDate,
        formNotes.trim() || undefined
      );
    }

    closeActionModal();
  };

  // 1. Overall Metrics
  const totalTargetAmount = savings.reduce((sum, s) => sum + s.targetAmount, 0);
  const totalCurrentAmount = savings.reduce((sum, s) => sum + s.currentAmount, 0);
  const totalRemainingAmount = Math.max(0, totalTargetAmount - totalCurrentAmount);
  const overallPercentage = totalTargetAmount > 0 ? Math.min(100, (totalCurrentAmount / totalTargetAmount) * 100) : 0;

  // 2. Filtered Subsets (Berjalan vs Tercapai)
  const runningSavings = savings.filter((s) => s.currentAmount < s.targetAmount);
  const completedSavings = savings.filter((s) => s.currentAmount >= s.targetAmount);

  const runningCount = runningSavings.length;
  const completedCount = completedSavings.length;

  // 3. Running / Active Targets
  const runningTargetAmount = runningSavings.reduce((sum, s) => sum + s.targetAmount, 0);
  const runningCurrentAmount = runningSavings.reduce((sum, s) => sum + s.currentAmount, 0);
  const runningRemainingAmount = Math.max(0, runningTargetAmount - runningCurrentAmount);

  // 4. Completed Targets
  const completedCurrentAmount = completedSavings.reduce((sum, s) => sum + s.currentAmount, 0);

  // Helper to find wallet details
  const getWallet = (id: string): Wallet | undefined => {
    return wallets.find(w => w.id === id);
  };

  const selectedWalletObj = wallets.find(w => w.id === (formWalletId || wallets[0]?.id));

  // Current saving remaining and progress inside modal
  const modalSavingRemaining = activeModalSaving 
    ? Math.max(0, activeModalSaving.targetAmount - activeModalSaving.currentAmount) 
    : 0;
  const modalSavingPct = activeModalSaving && activeModalSaving.targetAmount > 0
    ? Math.min(100, (activeModalSaving.currentAmount / activeModalSaving.targetAmount) * 100)
    : 0;

  // Inspecting logs memoized with quick search (persis Menu Budgeting)
  const inspectingLogs = useMemo(() => {
    if (!inspectingSaving) return [];
    const base = savingLogs.filter(l => l.savingId === inspectingSaving.id);
    if (!inspectingSearchQuery.trim()) return base;
    const q = inspectingSearchQuery.toLowerCase();
    return base.filter(l => {
      const wal = wallets.find(w => w.id === l.walletId)?.name?.toLowerCase() || '';
      const notes = (l.notes || '').toLowerCase();
      const amountStr = l.amount.toString();
      const typeStr = l.type === 'setor' ? 'setor' : 'tarik';
      return wal.includes(q) || notes.includes(q) || amountStr.includes(q) || typeStr.includes(q);
    });
  }, [inspectingSaving, savingLogs, inspectingSearchQuery, wallets]);

  useEffect(() => {
    if (inspectingSaving) {
      const timer = setTimeout(() => {
        checkModalScroll();
      }, 60);
      window.addEventListener('resize', checkModalScroll);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', checkModalScroll);
      };
    } else {
      setCanScrollDown(false);
    }
  }, [inspectingSaving, inspectingLogs, checkModalScroll]);

  return (
    <div className="flex flex-col gap-6" id="view-savings">
      {/* 1. Filter Status Tabs (Top) */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 w-fit backdrop-blur-sm">
          <button
            onClick={() => setSavingFilter('semua')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              savingFilter === 'semua'
                ? 'bg-slate-900 text-white dark:bg-indigo-600 shadow-sm shadow-slate-900/20'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <span>Semua</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
              savingFilter === 'semua'
                ? 'bg-white/20 text-white'
                : 'bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {savings.length}
            </span>
          </button>
          <button
            onClick={() => setSavingFilter('berjalan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              savingFilter === 'berjalan'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <span>Berjalan</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
              savingFilter === 'berjalan'
                ? 'bg-white/20 text-white'
                : 'bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {runningCount}
            </span>
          </button>
          <button
            onClick={() => setSavingFilter('tercapai')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              savingFilter === 'tercapai'
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <span>Tercapai</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
              savingFilter === 'tercapai'
                ? 'bg-white/20 text-white'
                : 'bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {completedCount}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Overall Savings Summary Cards */}
      {savings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Total Target Tabungan Dibuat & Status Count */}
          <div className={`${getCardClasses()} p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden`}>
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Total Target Tabungan
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 font-mono">
                  {savings.length}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Target Dibuat
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Berjalan:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{runningCount} Target</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Tercapai:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{completedCount} Target</span>
                </div>
              </div>

              {completedCount > 0 && (
                <div className="p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40 flex items-center justify-between text-[11px] mt-1">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    Uang Target Tercapai:
                  </span>
                  <span className="font-mono font-black text-emerald-700 dark:text-emerald-300">
                    {formatIDR(completedCurrentAmount)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Total Nominal Target Tabungan & Detail Target Berjalan */}
          <div className={`${getCardClasses()} p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Total Nominal Target Tabungan
                </span>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {overallPercentage.toFixed(0)}% Terkumpul
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 font-mono block mt-1">
                {formatIDR(totalTargetAmount)}
              </span>

              {/* Overall Progress Bar */}
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    overallPercentage >= 100 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                      : 'bg-indigo-600'
                  }`}
                  style={{ width: `${overallPercentage}%` }}
                />
              </div>
            </div>

            {/* Bagian Total Terkumpul & Sisa Keseluruhan */}
            <div className="grid grid-cols-2 gap-3 pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider truncate" title="Total semua uang tabungan yang terkumpul">
                  Total Semua Terkumpul
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 font-mono mt-0.5 truncate">
                  {formatIDR(totalCurrentAmount)}
                </span>
              </div>
              <div className="flex flex-col border-l border-slate-100 dark:border-slate-800/60 pl-3 min-w-0">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate" title="Sisa uang yang masih perlu dikumpulkan">
                  Sisa Total Dibutuhkan
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 font-mono mt-0.5 truncate">
                  {formatIDR(totalRemainingAmount)}
                </span>
              </div>
            </div>

            {/* Breakdown Spesifik: Target Berjalan */}
            {completedCount > 0 && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-1.5">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="font-bold text-slate-600 dark:text-slate-300">
                      Target Berjalan (Aktif):
                    </span>
                    <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                      {formatIDR(runningTargetAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    <span>Terkumpul: <strong className="font-mono text-slate-700 dark:text-slate-200">{formatIDR(runningCurrentAmount)}</strong></span>
                    <span>Sisa: <strong className="font-mono text-rose-500 dark:text-rose-400">{formatIDR(runningRemainingAmount)}</strong></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Savings List */}
      {savings.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">Belum Ada Target Tabungan</h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Tambahkan target tabungan Anda melalui tombol + di menu bawah.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {savings
            .filter((s) => {
              if (savingFilter === 'berjalan') return s.currentAmount < s.targetAmount;
              if (savingFilter === 'tercapai') return s.currentAmount >= s.targetAmount;
              return true;
            })
            .map((s) => {
              const pct = Math.min((s.currentAmount / s.targetAmount) * 100, 100);
              const isDone = s.currentAmount >= s.targetAmount;
              const remaining = Math.max(0, s.targetAmount - s.currentAmount);
              const cardLogs = savingLogs.filter(l => l.savingId === s.id);

              return (
                <div 
                  key={s.id} 
                  className={`${getCardClasses()} p-4 sm:p-5 flex flex-col justify-between gap-4 relative overflow-hidden transition-all duration-200`}
                >
                  {/* Top Bar: Title, Badge & Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded-full shrink-0 shadow-xs" 
                          style={{ backgroundColor: s.color || '#6366f1' }}
                        />
                        <h4 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 truncate">
                          {s.name}
                        </h4>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        {s.deadline && (
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                            Tenggat: {new Date(s.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                        {isDone && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold text-[10px] uppercase flex items-center gap-1 tracking-wider shadow-2xs border border-emerald-200/60 dark:border-emerald-800/40">
                            <Check className="w-2.5 h-2.5 stroke-[3]" /> Target Terpenuhi
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <button 
                        onClick={() => onEdit(s)} 
                        title="Edit Target Tabungan"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteSaving(s.id)} 
                        title="Hapus Target Tabungan"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar & Amount Numbers */}
                  <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px]">
                        Terkumpul saat ini:
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {formatIDR(s.currentAmount)} <span className="text-slate-400 font-normal">/ {formatIDR(s.targetAmount)}</span>
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-200/80 dark:bg-slate-700/80 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isDone 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                            : 'bg-indigo-600'
                        }`} 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mt-1.5">
                      <span>{pct.toFixed(0)}% Terkumpul</span>
                      <span>{isDone ? 'Target Terpenuhi' : `Sisa Kurang: ${formatIDR(remaining)}`}</span>
                    </div>
                  </div>

                  {/* Action Row: Rincian Transaksi (Teks Saja) & Tombol (+) */}
                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2.5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setInspectingSaving(s)}
                      className="flex-1 flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <span>Rincian Transaksi</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-extrabold border border-slate-200/60 dark:border-slate-700">
                          {cardLogs.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        <span>Lihat Rincian</span>
                        <ChevronDown className="w-3.5 h-3.5 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>

                    {/* Tombol (+) Setor / Tarik Tabungan */}
                    <button
                      type="button"
                      onClick={() => openActionModal(s, 'setor')}
                      title="Setor / Tarik Tabungan"
                      className="h-[36px] w-[36px] rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-xs transition flex items-center justify-center cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* =========================================================================
          1. FORM MODAL SETOR & TARIK (PERSIS KONSEP FORM RINCIAN MENU BUDGETING)
          Portaled ke document.body: Simple, Bersih, Anti-Mentok, Safe-Area Padded
         ========================================================================= */}
      {activeModalSaving && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeActionModal();
          }}
        >
          <div className="relative w-full max-w-lg mx-auto rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh] border-t sm:border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 animate-in slide-in-from-bottom duration-200">
            {/* Mobile Sheet Drag Handle Indicator */}
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

            {/* Header */}
            <div className="px-4 sm:px-5 pt-3 sm:pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  {editingSavingLog
                    ? (actionType === 'setor' ? 'Edit Setoran Tabungan' : 'Edit Penarikan Tabungan')
                    : (actionType === 'setor' ? 'Setor Tabungan' : 'Tarik Saldo')
                  }
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[260px] sm:max-w-xs">
                  Target: <strong className="text-slate-600 dark:text-slate-300 font-semibold">{activeModalSaving.name}</strong>
                  {editingSavingLog && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[9.5px] font-bold rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                      Mode Edit
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleActionSubmit} className="flex-1 overflow-y-auto px-4 sm:px-5 py-3.5 flex flex-col gap-3.5 overscroll-contain">
              {/* Segmented Mode Switcher (Setor vs Tarik) */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <button
                  type="button"
                  disabled={Boolean(editingSavingLog) || activeModalSaving.currentAmount >= activeModalSaving.targetAmount}
                  onClick={() => {
                    if (!editingSavingLog && activeModalSaving.currentAmount < activeModalSaving.targetAmount) {
                      setActionType('setor');
                      setFormAmount('');
                    }
                  }}
                  className={`flex items-center justify-center py-2 rounded-lg text-xs font-bold transition-all ${
                    editingSavingLog && actionType !== 'setor'
                      ? 'opacity-40 cursor-not-allowed text-slate-400'
                      : !editingSavingLog && activeModalSaving.currentAmount >= activeModalSaving.targetAmount
                        ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600'
                        : actionType === 'setor'
                          ? 'bg-emerald-600 text-white shadow-xs cursor-pointer'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer'
                  }`}
                  title={activeModalSaving.currentAmount >= activeModalSaving.targetAmount ? 'Target sudah 100% tercapai' : undefined}
                >
                  Setor Tabungan
                </button>
                <button
                  type="button"
                  disabled={Boolean(editingSavingLog) || activeModalSaving.currentAmount <= 0}
                  onClick={() => {
                    if (!editingSavingLog && activeModalSaving.currentAmount > 0) {
                      setActionType('tarik');
                      setFormAmount('');
                    }
                  }}
                  className={`flex items-center justify-center py-2 rounded-lg text-xs font-bold transition-all ${
                    editingSavingLog && actionType !== 'tarik'
                      ? 'opacity-40 cursor-not-allowed text-slate-400'
                      : !editingSavingLog && activeModalSaving.currentAmount <= 0
                        ? 'opacity-40 cursor-not-allowed text-slate-400'
                        : actionType === 'tarik'
                          ? 'bg-amber-600 text-white shadow-xs cursor-pointer'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer'
                  }`}
                >
                  Tarik Saldo
                </button>
              </div>

              {/* Info Progress Target Ringkas */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Posisi Terkumpul:
                  </span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                    {formatIDR(activeModalSaving.currentAmount)} <span className="text-slate-400 font-normal">/ {formatIDR(activeModalSaving.targetAmount)}</span>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200/80 dark:bg-slate-700/80 rounded-full overflow-hidden mt-1.5">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      modalSavingPct >= 100 
                        ? 'bg-emerald-500' 
                        : 'bg-indigo-600'
                    }`}
                    style={{ width: `${modalSavingPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-medium">
                  <span>{modalSavingPct.toFixed(0)}% Tercapai</span>
                  <span>{modalSavingRemaining > 0 ? `Kurang: ${formatIDR(modalSavingRemaining)}` : 'Target Terpenuhi'}</span>
                </div>
              </div>

              {/* 1. Pilih Dompet Sumber / Tujuan */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span>{actionType === 'setor' ? 'Dompet Sumber' : 'Dompet Tujuan'}</span>
                  {selectedWalletObj && (
                    <span className="font-mono text-slate-700 dark:text-slate-300 normal-case">
                      Saldo: {formatIDR(selectedWalletObj.currentBalance ?? selectedWalletObj.initialBalance)}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <select
                    value={formWalletId || wallets[0]?.id || ''}
                    onChange={(e) => setFormWalletId(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer pr-8"
                  >
                    {wallets.map((w) => {
                      const bal = w.currentBalance ?? w.initialBalance;
                      return (
                        <option key={w.id} value={w.id} className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900">
                          {w.name} — {formatIDR(bal)}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 2. Nominal Input & Shortcut */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {actionType === 'setor' ? 'Nominal Setoran' : 'Nominal Penarikan'}
                  </span>
                  {actionType === 'setor' ? (
                    modalSavingRemaining > 0 && (
                      <button
                        type="button"
                        onClick={() => setFormAmount(modalSavingRemaining.toString())}
                        className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        Penuhi Sisa ({formatIDR(modalSavingRemaining)})
                      </button>
                    )
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">
                      Maks: {formatIDR(activeModalSaving.currentAmount)}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="text"
                    value={formAmount ? formatIDR(parseAmountInput(formAmount)).replace('Rp\u00a0', '').replace('Rp ', '') : ''}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '');
                      const num = parseFloat(clean) || 0;
                      if (actionType === 'tarik') {
                        if (num > activeModalSaving.currentAmount) {
                          setFormAmount(activeModalSaving.currentAmount.toString());
                        } else {
                          setFormAmount(clean);
                        }
                      } else {
                        if (modalSavingRemaining > 0 && num > modalSavingRemaining) {
                          setFormAmount(modalSavingRemaining.toString());
                        } else {
                          setFormAmount(clean);
                        }
                      }
                    }}
                    placeholder="0"
                    required
                    className={`w-full pl-9 pr-14 py-2.5 text-sm font-mono font-bold rounded-xl border bg-white dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 ${
                      actionType === 'setor'
                        ? 'border-slate-200 dark:border-slate-800 focus:ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-800 focus:ring-amber-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const cur = parseAmountInput(formAmount);
                      const mult = cur ? cur * 1000 : 1000;
                      if (actionType === 'tarik' && mult > activeModalSaving.currentAmount) {
                        setFormAmount(activeModalSaving.currentAmount.toString());
                      } else if (actionType === 'setor' && modalSavingRemaining > 0 && mult > modalSavingRemaining) {
                        setFormAmount(modalSavingRemaining.toString());
                      } else {
                        setFormAmount(mult.toString());
                      }
                    }}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-black rounded-lg transition select-none cursor-pointer ${
                      actionType === 'setor'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-200'
                    }`}
                  >
                    +000
                  </button>
                </div>

                {/* Quick Shortcuts (Nominal Saja, Sejajar 1 Baris) */}
                <div className={`grid gap-1 mt-0.5 ${actionType === 'tarik' ? 'grid-cols-6' : 'grid-cols-5'}`}>
                  {[20000, 50000, 100000, 250000, 500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        const cur = parseAmountInput(formAmount);
                        const next = cur + amt;
                        if (actionType === 'tarik') {
                          const maxTarik = editingSavingLog && editingSavingLog.type === 'tarik'
                            ? activeModalSaving.currentAmount + editingSavingLog.amount
                            : activeModalSaving.currentAmount;
                          if (next > maxTarik) {
                            setFormAmount(maxTarik.toString());
                          } else {
                            setFormAmount(next.toString());
                          }
                        } else {
                          const maxSetor = editingSavingLog && editingSavingLog.type === 'setor'
                            ? Math.max(0, activeModalSaving.targetAmount - (activeModalSaving.currentAmount - editingSavingLog.amount))
                            : modalSavingRemaining;
                          if (maxSetor > 0 && next > maxSetor) {
                            setFormAmount(maxSetor.toString());
                          } else {
                            setFormAmount(next.toString());
                          }
                        }
                      }}
                      className={`w-full py-1.5 px-0.5 text-center text-[10px] sm:text-[10.5px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/70 transition cursor-pointer ${
                        actionType === 'setor'
                          ? 'hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40'
                          : 'hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/40'
                      }`}
                    >
                      +{amt >= 1000 ? `${amt / 1000}rb` : amt}
                    </button>
                  ))}
                  {actionType === 'tarik' && (
                    <button
                      type="button"
                      onClick={() => {
                        const maxTarik = editingSavingLog && editingSavingLog.type === 'tarik'
                          ? activeModalSaving.currentAmount + editingSavingLog.amount
                          : activeModalSaving.currentAmount;
                        setFormAmount(maxTarik.toString());
                      }}
                      className="w-full py-1.5 px-0.5 text-center text-[9.5px] sm:text-[10px] font-bold rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/70 dark:border-amber-700/70 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition cursor-pointer whitespace-nowrap"
                    >
                      Semua
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Tanggal & Catatan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Catatan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder={actionType === 'setor' ? 'Misal: Sisihkan gaji' : 'Misal: Keperluan belanja'}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Spacer button for form submit */}
              <button type="submit" className="hidden" />
            </form>

            {/* Footer Summary with Tutup & Action Buttons (Safe Area Padded) */}
            <div className="px-4 sm:px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom,20px))] sm:pb-3.5 border-t border-slate-100 dark:border-slate-800 text-xs shrink-0 bg-slate-50/70 dark:bg-slate-900/70 flex items-center gap-2.5">
              <button
                type="button"
                onClick={closeActionModal}
                className="w-1/3 sm:w-28 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleActionSubmit}
                disabled={!formAmount || parseAmountInput(formAmount) <= 0}
                className={`flex-1 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center ${
                  actionType === 'setor'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {editingSavingLog
                  ? 'Simpan Perubahan'
                  : actionType === 'setor'
                    ? 'Konfirmasi Setor'
                    : 'Konfirmasi Tarik'
                }
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* =========================================================================
          2. MODAL RINCIAN TRANSAKSI TABUNGAN (PERSIS MODAL RINCIAN TRANSAKSI BUDGETING)
          Portaled ke document.body: Simple, List Rapi, Search & Action Hapus/Batal
         ========================================================================= */}
      {inspectingSaving && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setInspectingSaving(null);
              setInspectingSearchQuery('');
            }
          }}
        >
          <div className="relative w-full max-w-lg mx-auto rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[78vh] sm:h-[560px] max-h-[85vh] sm:max-h-[80vh] border-t sm:border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 animate-in slide-in-from-bottom duration-200">
            {/* Mobile Sheet Drag Indicator */}
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

            {/* Header */}
            <div className="px-4 sm:px-5 pt-3 sm:pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">
                    Rincian Transaksi Tabungan
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    {savingLogs.filter(l => l.savingId === inspectingSaving.id).length} trx
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[260px] sm:max-w-xs">
                  Target: <strong className="text-slate-600 dark:text-slate-300 font-semibold">{inspectingSaving.name}</strong>
                </p>
              </div>
            </div>

            {/* Quick Search for when there are multiple transactions */}
            {savingLogs.filter(l => l.savingId === inspectingSaving.id).length > 2 && (
              <div className="px-4 sm:px-5 pt-2.5 pb-1 shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={inspectingSearchQuery}
                    onChange={(e) => setInspectingSearchQuery(e.target.value)}
                    placeholder="Cari transaksi, dompet, atau catatan..."
                    className="w-full pl-8 pr-8 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {inspectingSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setInspectingSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {inspectingSearchQuery && (
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 pl-1">
                    Menampilkan {inspectingLogs.length} dari {savingLogs.filter(l => l.savingId === inspectingSaving.id).length} trx
                  </div>
                )}
              </div>
            )}

            {/* High-Efficiency Compact Transactions List */}
            <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
              <div 
                ref={modalListRef}
                onScroll={checkModalScroll}
                className="flex-1 overflow-y-auto min-h-0 px-3 sm:px-4 py-2 flex flex-col gap-2 overscroll-contain scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {inspectingLogs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-medium">
                    {inspectingSearchQuery
                      ? 'Tidak ada transaksi yang cocok dengan pencarian.'
                      : 'Belum ada riwayat transaksi setor atau tarik untuk target tabungan ini.'}
                  </div>
                ) : (
                  inspectingLogs.map((log) => {
                    const isSetor = log.type === 'setor';
                    const walletObj = getWallet(log.walletId);
                    const walletName = walletObj?.name || 'Dompet';
                    const walletColor = walletObj?.color || '#6366f1';

                    return (
                      <div
                        key={log.id}
                        className="h-[60px] px-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 flex items-center justify-between gap-3 transition shrink-0 shadow-2xs"
                      >
                        {/* Left: Type Icon + Info */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div 
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                              isSetor 
                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' 
                                : 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                            }`}
                          >
                            {isSetor ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0 flex-1 flex flex-col justify-center">
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate leading-snug">
                              {isSetor ? 'Setor dari ' : 'Tarik ke '}
                              <span 
                                className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md text-white inline-block ml-1"
                                style={{ backgroundColor: walletColor }}
                              >
                                {walletName}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate flex items-center gap-1.5 mt-0.5 leading-none">
                              <span className="shrink-0">{new Date(log.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              {log.notes && (
                                <>
                                  <span className="shrink-0">•</span>
                                  <span className="truncate max-w-[140px] text-slate-500 dark:text-slate-400 font-medium" title={log.notes}>
                                    {log.notes}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Amount, Edit & Delete buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span 
                            className={`font-mono font-bold text-xs sm:text-sm whitespace-nowrap ${
                              isSetor 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : 'text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {isSetor ? '+' : '-'}{formatIDR(log.amount)}
                          </span>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => openEditLogModal(log)}
                              title="Edit Transaksi Ini"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteSavingLog(log.id)}
                              title="Hapus / Batalkan Transaksi Ini"
                              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Footer Summary with Centered Scroll Down Arrow & Close Button */}
            <div className="relative px-4 sm:px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom,20px))] sm:pb-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs shrink-0 bg-slate-50/70 dark:bg-slate-900/70">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                  Total Terkumpul di Target
                </span>
                <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                  {formatIDR(inspectingSaving.currentAmount)}
                </span>
              </div>

              {/* Tanda Panah ke Bawah Sejajar di Tengah Footer */}
              {canScrollDown && (
                <button
                  type="button"
                  onClick={() => {
                    if (modalListRef.current) {
                      modalListRef.current.scrollBy({ top: 180, behavior: 'smooth' });
                    }
                  }}
                  className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-slate-200/90 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300/60 dark:border-slate-700 shadow-2xs transition cursor-pointer"
                  title="Masih ada transaksi di bawah"
                  aria-label="Scroll ke bawah"
                >
                  <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setInspectingSaving(null);
                  setInspectingSearchQuery('');
                }}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition shadow-xs cursor-pointer"
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
};
