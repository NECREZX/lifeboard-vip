/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trash2, Check, Edit2 } from 'lucide-react';
import { Saving } from '../../types';
import { formatIDR } from '../../lib/formatters';

interface SavingsViewProps {
  savings: Saving[];
  savingFilter: 'semua' | 'berjalan' | 'tercapai';
  setSavingFilter: (val: 'semua' | 'berjalan' | 'tercapai') => void;
  getCardClasses: () => string;
  handleDeleteSaving: (id: string) => void;
  handleSavingAddAmount: (id: string, amount: string) => void;
  onEdit: (saving: Saving) => void;
}

export const SavingsView: React.FC<SavingsViewProps> = ({
  savings,
  savingFilter,
  setSavingFilter,
  getCardClasses,
  handleDeleteSaving,
  handleSavingAddAmount,
  onEdit
}) => {
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

  // 3. Running / Active Targets (Tanpa target yang sudah tercapai)
  const runningTargetAmount = runningSavings.reduce((sum, s) => sum + s.targetAmount, 0);
  const runningCurrentAmount = runningSavings.reduce((sum, s) => sum + s.currentAmount, 0);
  const runningRemainingAmount = Math.max(0, runningTargetAmount - runningCurrentAmount);
  const runningPercentage = runningTargetAmount > 0 ? Math.min(100, (runningCurrentAmount / runningTargetAmount) * 100) : 0;

  // 4. Completed Targets (Target yang sudah 100% tuntas)
  const completedCurrentAmount = completedSavings.reduce((sum, s) => sum + s.currentAmount, 0);

  return (
    <div className="flex flex-col gap-6" id="view-savings">
      {/* 1. Filter Status Tabs (Top) */}
      <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 w-fit backdrop-blur-sm">
        <button
          onClick={() => setSavingFilter('semua')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
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
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
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
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
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

          {/* Card 2: Total Nominal Target Tabungan & Detail Target Berjalan (Tanpa Target Tercapai) */}
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

            {/* Breakdown Spesifik: Target Berjalan (Tanpa Target Tercapai) */}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {savings
          .filter((s) => {
            if (savingFilter === 'berjalan') return s.currentAmount < s.targetAmount;
            if (savingFilter === 'tercapai') return s.currentAmount >= s.targetAmount;
            return true;
          })
          .map((s) => {
            const pct = Math.min((s.currentAmount / s.targetAmount) * 100, 100);
            const isDone = s.currentAmount >= s.targetAmount;
            
            return (
              <div key={s.id} className={getCardClasses() + " p-4 flex flex-col justify-between gap-3 min-h-[160px] relative"}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">{s.name}</h4>
                    {s.deadline && (
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">
                        Tenggat: {new Date(s.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => onEdit(s)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteSaving(s.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="my-1">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-500 text-[11px]">Progres</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                      {formatIDR(s.currentAmount)} / {formatIDR(s.targetAmount)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${isDone ? 'bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold block mt-1 text-right">{pct.toFixed(0)}% Terkumpul</span>
                </div>

                {!isDone && (
                  <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                    <input
                      type="number"
                      placeholder="Tambah tabungan (Rp)"
                      id={`add-saving-${s.id}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSavingAddAmount(s.id, e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                      className="flex-1 px-3 py-1.5 text-[11px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(`add-saving-${s.id}`) as HTMLInputElement;
                        if (input) {
                          handleSavingAddAmount(s.id, input.value);
                          input.value = '';
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl text-[10px] font-bold text-white uppercase tracking-wider shadow-sm transition shrink-0 bg-indigo-600"
                    >
                      Tambah
                    </button>
                  </div>
                )}

                {isDone && (
                  <div className="flex items-center justify-end border-t border-slate-100 dark:border-slate-800/80 pt-2">
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 font-bold text-[10px] uppercase flex items-center gap-1 tracking-wider shadow-sm">
                      <Check className="w-3 h-3 stroke-[3]" /> Target Tercapai
                    </span>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
