import React, { useMemo } from 'react';
import { Budget, Transaction, UIStyle } from '../types';

interface FinancialHealthCardProps {
  transactions?: Transaction[];
  budgets: Budget[];
  activeDisplaySaldo: number;
  currentMonthIncomes: number;
  currentMonthExpenses: number;
  currentMonthName?: string;
  showHideBalance?: boolean;
  formatIDR: (val: number) => string;
  currentLang?: string;
  getCardClasses: () => string;
  onNavigateToBudgets?: () => void;
  onNavigateToLaporan?: () => void;
  uiStyle?: UIStyle;
}

export const FinancialHealthCard: React.FC<FinancialHealthCardProps> = ({
  budgets,
  activeDisplaySaldo,
  currentMonthIncomes,
  currentMonthExpenses,
  currentLang = 'id',
  getCardClasses,
  onNavigateToLaporan,
  uiStyle
}) => {
  const isEn = currentLang === 'en';

  // Perhitungan Kondisi Finansial Objektif & Matematis
  const analysis = useMemo(() => {
    const income = currentMonthIncomes;
    const expense = currentMonthExpenses;
    const net = income - expense;

    // Rasio Pengeluaran (% pemasukan yang terpakai)
    const expenseRatio = income > 0 
      ? Math.round((expense / income) * 100) 
      : (expense > 0 ? 100 : 0);

    // Rasio Tabungan (% pemasukan yang tersimpan)
    const savingsRate = income > 0 
      ? Math.round((Math.max(0, net) / income) * 100) 
      : 0;

    // Kepatuhan Anggaran
    const totalBudgets = budgets.length;
    let overBudgetsCount = 0;
    budgets.forEach(b => {
      if ((b.spent || 0) > b.amount) overBudgetsCount++;
    });
    const budgetAdherence = totalBudgets > 0 
      ? Math.round(((totalBudgets - overBudgetsCount) / totalBudgets) * 100)
      : 100;

    // Kesiapan Dana Darurat (Kelipatan biaya hidup bulanan - dibulatkan & dibatasi maks > 12 bulan)
    let reserveMultiple = '0';
    let rawReserveMonths = 0;
    if (expense > 0) {
      rawReserveMonths = activeDisplaySaldo / expense;
      if (rawReserveMonths >= 12) {
        reserveMultiple = '> 12';
      } else if (rawReserveMonths < 1) {
        reserveMultiple = '< 1';
      } else {
        reserveMultiple = Math.round(rawReserveMonths).toString();
      }
    } else {
      reserveMultiple = activeDisplaySaldo > 0 ? '> 12' : '0';
      rawReserveMonths = activeDisplaySaldo > 0 ? 12 : 0;
    }

    // Skor Finansial Total 0 - 100
    let score = 0;

    // A. Pengendalian Belanja (max 40 poin)
    if (income > 0) {
      if (expenseRatio <= 45) score += 40;
      else if (expenseRatio <= 65) score += 34;
      else if (expenseRatio <= 80) score += 24;
      else if (expenseRatio <= 95) score += 14;
      else if (expenseRatio <= 100) score += 8;
      else score += 0;
    } else if (expense === 0) {
      score += 25;
    } else {
      score += 5;
    }

    // B. Kemampuan Menabung (max 30 poin)
    if (net > 0) {
      if (savingsRate >= 25) score += 30;
      else if (savingsRate >= 15) score += 24;
      else if (savingsRate >= 5) score += 18;
      else score += 12;
    } else if (net === 0 && income > 0) {
      score += 10;
    } else if (net < 0) {
      const deficitRatio = Math.abs(net) / (income || 1);
      if (deficitRatio < 0.15) score += 6;
      else score += 2;
    } else {
      score += 12;
    }

    // C. Kepatuhan Anggaran (max 20 poin)
    if (totalBudgets > 0) {
      score += Math.round((budgetAdherence / 100) * 20);
    } else {
      score += 16;
    }

    // D. Kesiapan Dana Darurat (max 10 poin)
    if (expense > 0) {
      if (activeDisplaySaldo >= expense * 3) score += 10;
      else if (activeDisplaySaldo >= expense) score += 7;
      else if (activeDisplaySaldo > 0) score += 4;
      else score += 0;
    } else {
      score += activeDisplaySaldo > 0 ? 10 : 5;
    }

    const finalScore = Math.min(100, Math.max(5, score));

    // Status Grade dan Warna
    let gradeLabel = '';
    let badgeClasses = '';
    let gaugeColor = '';

    if (finalScore >= 85) {
      gradeLabel = isEn ? 'Sangat Prima' : 'Sangat Prima';
      badgeClasses = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700/80';
      gaugeColor = '#10B981';
    } else if (finalScore >= 70) {
      gradeLabel = isEn ? 'Sehat & Stabil' : 'Sehat & Stabil';
      badgeClasses = 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border-teal-300 dark:border-teal-700/80';
      gaugeColor = '#0D9488';
    } else if (finalScore >= 50) {
      gradeLabel = isEn ? 'Cukup Stabil' : 'Cukup Stabil';
      badgeClasses = 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700/80';
      gaugeColor = '#F59E0B';
    } else if (finalScore >= 35) {
      gradeLabel = isEn ? 'Perlu Penghematan' : 'Perlu Penghematan';
      badgeClasses = 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700/80';
      gaugeColor = '#EA580C';
    } else {
      gradeLabel = isEn ? 'Perlu Evaluasi' : 'Perlu Evaluasi';
      badgeClasses = 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-700/80';
      gaugeColor = '#EF4444';
    }

    // 1. Badge Pengendalian Belanja
    let expenseBadge = { 
      label: 'Terkendali Aman', 
      class: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/80' 
    };
    if (expenseRatio > 85) {
      expenseBadge = { 
        label: 'Melebihi Limit', 
        class: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/80' 
      };
    } else if (expenseRatio > 70) {
      expenseBadge = { 
        label: 'Mendekati Batas', 
        class: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/80' 
      };
    } else if (expenseRatio > 50) {
      expenseBadge = { 
        label: 'Terkendali Baik', 
        class: 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800/80' 
      };
    }

    // 2. Badge Kemampuan Menabung
    let savingsBadge = { 
      label: 'Sangat Baik', 
      class: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/80' 
    };
    if (savingsRate <= 0) {
      savingsBadge = { 
        label: 'Belum Menabung', 
        class: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/80' 
      };
    } else if (savingsRate < 15) {
      savingsBadge = { 
        label: 'Porsi Tipis', 
        class: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/80' 
      };
    } else if (savingsRate < 25) {
      savingsBadge = { 
        label: 'Sesuai Target', 
        class: 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/80' 
      };
    }

    // 3. Badge Kesiapan Dana Darurat
    let reserveBadge = { 
      label: 'Cadangan Aman', 
      class: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/80' 
    };
    if (reserveMultiple === '0' || reserveMultiple === '< 1' || rawReserveMonths < 1) {
      reserveBadge = { 
        label: 'Perlu Tambahan', 
        class: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/80' 
      };
    } else if (rawReserveMonths < 3) {
      reserveBadge = { 
        label: 'Cadangan Cukup', 
        class: 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800/80' 
      };
    }

    return {
      income,
      expenseRatio,
      savingsRate,
      reserveMultiple,
      score: finalScore,
      gradeLabel,
      badgeClasses,
      gaugeColor,
      expenseBadge,
      savingsBadge,
      reserveBadge
    };
  }, [currentMonthIncomes, currentMonthExpenses, budgets, activeDisplaySaldo, isEn]);

  const {
    income,
    expenseRatio,
    savingsRate,
    reserveMultiple,
    score,
    gradeLabel,
    badgeClasses,
    gaugeColor,
    expenseBadge,
    savingsBadge,
    reserveBadge
  } = analysis;

  return (
    <div className={`${getCardClasses()} p-5 lg:p-6 transition-all duration-200 select-none border border-slate-200/80 dark:border-slate-800`}>
      {/* Header: Judul bersih 'Kondisi Finansial' tanpa garis bawah */}
      <div className="pb-1 flex items-center justify-between">
        <h4 className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-200">
          {isEn ? 'Financial Condition' : 'Kondisi Finansial'}
        </h4>
      </div>

      {/* 1. BAGIAN ATAS: Tulisan Angka Skor di Tengah, Indikator Bar, lalu Badge Kondisi & per 100 di Bawahnya */}
      <div className="pt-2 pb-5 space-y-4">
        {/* Tulisan Angka Skor Tetap di Tengah */}
        <div className="flex flex-col items-center justify-center text-center pt-2 pb-1">
          <span className="font-mono font-black text-4xl sm:text-5xl text-slate-800 dark:text-white tracking-tight">
            {score}
          </span>
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
            {isEn ? 'Score' : 'Skor'}
          </span>
        </div>

        {/* Garis Indikator Bar Horizontal Multi-Warna */}
        <div className="w-full">
          {/* Label Kategori Zona Warna */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold mb-2">
            <span className="text-rose-500">Merah (Defisit)</span>
            <span className="text-orange-500">Oranye (Waspada)</span>
            <span className="text-amber-500">Kuning (Cukup)</span>
            <span className="text-emerald-500">Hijau (Prima)</span>
          </div>

          {/* Garis Bar Multi-Warna Horizontal dengan Pointer Penunjuk Skor */}
          <div className="relative w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full p-0.5 flex gap-1 shadow-inner">
            {/* Segmen 1: Merah (0-35) */}
            <div className="h-full rounded-full flex-1 bg-rose-500 opacity-90" title="Zona Merah: Defisit (0-35)" />
            {/* Segmen 2: Oranye (35-50) */}
            <div className="h-full rounded-full flex-1 bg-orange-500 opacity-90" title="Zona Oranye: Waspada (35-50)" />
            {/* Segmen 3: Kuning (50-70) */}
            <div className="h-full rounded-full flex-1 bg-amber-400 opacity-90" title="Zona Kuning: Cukup (50-70)" />
            {/* Segmen 4: Hijau (70-100) */}
            <div className="h-full rounded-full flex-1 bg-emerald-500 opacity-90" title="Zona Hijau: Sehat & Prima (70-100)" />

            {/* Jarum / Pin Pointer Penunjuk Posisi Skor Aktual */}
            <div 
              className="absolute -top-1.5 w-4 h-6 bg-white dark:bg-slate-900 border-2 rounded-full shadow-md transition-all duration-700 ease-out -ml-2 flex items-center justify-center z-10"
              style={{ 
                left: `${score}%`,
                borderColor: gaugeColor 
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: gaugeColor }} />
            </div>
          </div>
        </div>

        {/* Badge Kondisi dan Skor / 100 di Bawah Indikator Bar */}
        <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 mt-3 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">
              {isEn ? 'Condition:' : 'Kondisi:'}
            </span>
            <span className={`px-2.5 sm:px-3 py-0.5 text-xs font-bold rounded-full border shadow-2xs truncate ${badgeClasses}`}>
              {gradeLabel}
            </span>
          </div>
          <div className="text-xs shrink-0 pl-2">
            <span className="font-mono font-bold text-slate-900 dark:text-white">{score}</span>
            <span className="text-slate-400 dark:text-slate-500 font-semibold"> / 100</span>
          </div>
        </div>
      </div>

      {/* 2. GARIS BATAS PEMISAH ANTARA CHART DAN PILAR */}
      <div className="pt-5 border-t border-slate-200/80 dark:border-slate-700/80">
        {/* PILAR KONDISI FINANSIAL: Tiap pilar dibingkai kotak berbatas (border) tersendiri agar rapih */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Pilar 1: Pengendalian Belanja */}
          <div className={`p-3.5 sm:p-4 rounded-xl ${uiStyle === 'clay' ? 'clay-card-rose' : 'border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600'} flex items-center justify-between gap-3 transition-colors`}>
            <div className="min-w-0">
              <div className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${uiStyle === 'clay' ? 'text-rose-900 dark:text-rose-200' : 'text-slate-500 dark:text-slate-400'}`}>
                {isEn ? 'Spending Control' : 'Pengendalian Belanja'}
              </div>
              <div className={`font-mono font-bold text-base sm:text-lg ${uiStyle === 'clay' ? 'text-rose-950 dark:text-rose-100' : 'text-slate-900 dark:text-white'} mt-0.5 truncate`}>
                {income > 0 ? `${expenseRatio}%` : (currentMonthExpenses > 0 ? '100%' : '0%')}
                <span className={`text-xs font-normal ${uiStyle === 'clay' ? 'text-rose-800/70 dark:text-rose-200/70' : 'text-slate-400 dark:text-slate-500'} ml-1`}>dari pemasukan</span>
              </div>
            </div>
            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border shrink-0 text-center shadow-2xs ${expenseBadge.class}`}>
              {expenseBadge.label}
            </span>
          </div>

          {/* Pilar 2: Kemampuan Menabung */}
          <div className={`p-3.5 sm:p-4 rounded-xl ${uiStyle === 'clay' ? 'clay-card-emerald' : 'border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600'} flex items-center justify-between gap-3 transition-colors`}>
            <div className="min-w-0">
              <div className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${uiStyle === 'clay' ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-500 dark:text-slate-400'}`}>
                {isEn ? 'Savings Capacity' : 'Kemampuan Menabung'}
              </div>
              <div className={`font-mono font-bold text-base sm:text-lg ${uiStyle === 'clay' ? 'text-emerald-950 dark:text-emerald-100' : 'text-slate-900 dark:text-white'} mt-0.5 truncate`}>
                {savingsRate}%
                <span className={`text-xs font-normal ${uiStyle === 'clay' ? 'text-emerald-800/70 dark:text-emerald-200/70' : 'text-slate-400 dark:text-slate-500'} ml-1`}>tersimpan</span>
              </div>
            </div>
            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border shrink-0 text-center shadow-2xs ${savingsBadge.class}`}>
              {savingsBadge.label}
            </span>
          </div>

          {/* Pilar 3: Kesiapan Dana Darurat */}
          <div className={`p-3.5 sm:p-4 rounded-xl ${uiStyle === 'clay' ? 'clay-card-blue' : 'border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600'} flex items-center justify-between gap-3 transition-colors`}>
            <div className="min-w-0">
              <div className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${uiStyle === 'clay' ? 'text-sky-900 dark:text-sky-200' : 'text-slate-500 dark:text-slate-400'}`}>
                {isEn ? 'Emergency Preparedness' : 'Kesiapan Dana Darurat'}
              </div>
              <div className={`font-mono font-bold text-base sm:text-lg ${uiStyle === 'clay' ? 'text-sky-950 dark:text-sky-100' : 'text-slate-900 dark:text-white'} mt-0.5 truncate`}>
                {reserveMultiple} Bulan
                <span className={`text-xs font-normal ${uiStyle === 'clay' ? 'text-sky-800/70 dark:text-sky-200/70' : 'text-slate-400 dark:text-slate-500'} ml-1`}>biaya hidup</span>
              </div>
            </div>
            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border shrink-0 text-center shadow-2xs ${reserveBadge.class}`}>
              {reserveBadge.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
