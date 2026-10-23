/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Bot,
  X,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  PiggyBank,
  CheckCircle2,
  Calendar,
  Award,
  ChevronRight,
  DollarSign,
  Sliders,
  Check,
  RefreshCw,
  Lock,
  Sparkles,
  Target,
  AlertTriangle,
  History
} from 'lucide-react';
import {
  Transaction,
  Budget,
  Saving,
  SavingLog,
  Activity,
  Wishlist,
  Category,
  IncomeSource,
  UserSettings
} from '../../types';
import { formatIDR } from '../../lib/formatters';
import { getJakartaDateInfo, formatMonthLabel } from '../../lib/jakartaTime';
import {
  generateMonthlyInsight,
  MonthlyInsightData,
  generateGeminiExecutiveReview
} from '../../lib/monthlyInsightGenerator';
import { getEffectiveThemeColor, getThemeContrastColor } from '../../lib/theme';
import { Breadcrumb, BreadcrumbItem } from '../Breadcrumb';
import { BannerMotifOverlay } from '../BannerMotif';

interface LifeboardAIViewProps {
  transactions: Transaction[];
  budgets: Budget[];
  savings: Saving[];
  savingLogs: SavingLog[];
  activities: Activity[];
  wishlists: Wishlist[];
  categories: Category[];
  sources: IncomeSource[];
  settings: UserSettings;
  getCardClasses: () => string;
  onBackToDashboard: () => void;
}

export const LifeboardAIView: React.FC<LifeboardAIViewProps> = ({
  transactions,
  budgets,
  savings,
  savingLogs,
  activities,
  wishlists,
  categories,
  sources,
  settings,
  getCardClasses,
  onBackToDashboard
}) => {
  // Current Jakarta / WIB (GMT+7) date information
  const [wibInfo, setWibInfo] = useState(getJakartaDateInfo());

  // Periodically refresh WIB time every 30s
  useEffect(() => {
    const timer = setInterval(() => {
      setWibInfo(getJakartaDateInfo());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const currentMonthStr = wibInfo.monthStr; // e.g. "2026-10"

  // Radius & Background Classes for Enclosing Card
  const enclosingCardRadiusClass = useMemo(() => {
    if (settings?.cardRadius === 'sharp') return 'rounded-none';
    if (settings?.cardRadius === 'extra') return 'rounded-t-[48px] sm:rounded-t-[56px] rounded-b-none';
    return 'rounded-t-[40px] sm:rounded-t-[40px] rounded-b-none';
  }, [settings?.cardRadius]);

  const enclosingCardBgClass = useMemo(() => {
    if (settings?.uiStyle === 'glass') {
      return 'bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border-t sm:border border-slate-200/60 dark:border-slate-800/80 shadow-none';
    } else if (settings?.uiStyle === 'minimal') {
      return 'bg-white dark:bg-[#121212] border-t sm:border border-slate-200 dark:border-slate-800 shadow-none';
    }
    return 'bg-white dark:bg-[#121212] border-t sm:border border-slate-200/90 dark:border-slate-800 shadow-none';
  }, [settings?.uiStyle]);

  const isDark = !!settings?.isDarkMode;
  const rawThemeColor = getEffectiveThemeColor(settings);
  const activeThemeColor = rawThemeColor;
  const contrastColor = getThemeContrastColor(rawThemeColor);




  // Collect all past months with real user data
  const availablePastMonths = useMemo(() => {
    const monthSet = new Set<string>();
    transactions.forEach((t) => {
      if (t.date && t.date.length >= 7) {
        monthSet.add(t.date.substring(0, 7));
      }
    });
    budgets.forEach((b) => {
      if (b.month) monthSet.add(b.month);
    });

    // Also include previous months
    const d1 = new Date(wibInfo.year, wibInfo.month - 2, 1);
    const m1 = `${d1.getFullYear()}-${String(d1.getMonth() + 1).padStart(2, '0')}`;
    const d2 = new Date(wibInfo.year, wibInfo.month - 3, 1);
    const m2 = `${d2.getFullYear()}-${String(d2.getMonth() + 1).padStart(2, '0')}`;
    monthSet.add(m1);
    monthSet.add(m2);

    return Array.from(monthSet)
      .filter((m) => m <= currentMonthStr)
      .sort((a, b) => b.localeCompare(a));
  }, [transactions, budgets, currentMonthStr, wibInfo]);

  // Modal history state
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Selected month and insight data
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [insightData, setInsightData] = useState<MonthlyInsightData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Gemini AI review cache per month
  const [geminiReviews, setGeminiReviews] = useState<Record<string, { executiveSummary: string; strategicRecommendations: string[] }>>(() => {
    try {
      const raw = localStorage.getItem('lifeboard_gemini_reviews_v1');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Regenerate Quota per month (Maksimal 5x refresh per bulan)
  const [refreshQuotas, setRefreshQuotas] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem('lifeboard_gemini_quota_v1');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const getRemainingQuota = (mStr: string) => {
    if (typeof refreshQuotas[mStr] === 'number') {
      return refreshQuotas[mStr];
    }
    return 5; // Default 5x kesempatan regenerasi
  };

  // Kalkulasi data analitik riil
  const calculateInsight = async (mStr: string) => {
    try {
      const baseData = await generateMonthlyInsight(
        mStr,
        transactions,
        budgets,
        savings,
        savingLogs,
        activities,
        wishlists,
        categories,
        sources
      );

      // Sync cached Gemini review with live data numbers
      if (geminiReviews[mStr]) {
        const cachedSummary = geminiReviews[mStr].executiveSummary;
        // Check if cached text conflicts with current real-time budget count
        const mentionsWrongOverCount = /([0-9]+)\s*(pos|kategori|anggaran)?\s*(over|melebihi)/i.exec(cachedSummary);
        if (mentionsWrongOverCount && parseInt(mentionsWrongOverCount[1], 10) !== baseData.overBudgetsCount) {
          // Invalidate stale cache if budget count changed
          delete geminiReviews[mStr];
          try {
            localStorage.setItem('lifeboard_gemini_reviews_v1', JSON.stringify(geminiReviews));
          } catch {}
        } else {
          baseData.executiveSummary = cachedSummary;
          baseData.strategicRecommendations = geminiReviews[mStr].strategicRecommendations;
        }
      }

      return baseData;
    } catch (e) {
      console.error('Error calculating insight:', e);
      return null;
    }
  };

  // Buka insight bulan tertentu
  const loadInsightForMonth = async (mStr: string) => {
    setSelectedMonth(mStr);
    setIsHistoryModalOpen(false);
    setIsLoading(true);

    const freshData = await calculateInsight(mStr);
    if (freshData) {
      setInsightData(freshData);

      // Jika belum pernah di-generate dengan Gemini AI, buat analisis pertama kali secara otomatis
      if (!geminiReviews[mStr]) {
        setIsGeneratingAI(true);
        generateGeminiExecutiveReview(freshData)
          .then((aiReview) => {
            if (aiReview) {
              setGeminiReviews((prev) => {
                const next = { ...prev, [mStr]: aiReview };
                try {
                  localStorage.setItem('lifeboard_gemini_reviews_v1', JSON.stringify(next));
                } catch {}
                return next;
              });
              setInsightData((prev) => {
                if (!prev || prev.monthStr !== mStr) return prev;
                return {
                  ...prev,
                  executiveSummary: aiReview.executiveSummary,
                  strategicRecommendations: aiReview.strategicRecommendations
                };
              });
            }
          })
          .catch((err) => {
            console.warn('Initial AI generation error:', err);
          })
          .finally(() => {
            setIsGeneratingAI(false);
          });
      }
    }
    setIsLoading(false);
  };

  // Handler tombol Regenerasi AI (Dibatasi 3x per bulan)
  const handleRegenerateGemini = async () => {
    if (!selectedMonth || !insightData || isGeneratingAI) return;
    const currentQuota = getRemainingQuota(selectedMonth);

    if (currentQuota <= 0) {
      return; // Kuota habis
    }

    setIsGeneratingAI(true);
    const newQuota = currentQuota - 1;

    // Simpan sisa kuota baru
    setRefreshQuotas((prev) => {
      const next = { ...prev, [selectedMonth]: newQuota };
      try {
        localStorage.setItem('lifeboard_gemini_quota_v1', JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      const aiReview = await generateGeminiExecutiveReview(insightData);
      if (aiReview) {
        setGeminiReviews((prev) => {
          const next = { ...prev, [selectedMonth]: aiReview };
          try {
            localStorage.setItem('lifeboard_gemini_reviews_v1', JSON.stringify(next));
          } catch {}
          return next;
        });

        setInsightData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            executiveSummary: aiReview.executiveSummary,
            strategicRecommendations: aiReview.strategicRecommendations
          };
        });
      }
    } catch (e) {
      console.error('Error regenerating with Gemini:', e);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Re-kalkulasi otomatis ketika data mutasi/budget berubah
  useEffect(() => {
    if (!selectedMonth) return;
    calculateInsight(selectedMonth).then((fresh) => {
      if (fresh) {
        setInsightData(fresh);
      }
    });
  }, [
    selectedMonth,
    transactions,
    budgets,
    savings,
    savingLogs,
    activities,
    wishlists,
    categories,
    sources
  ]);

  // Past months list (excluding current month)
  const pastMonthsList = availablePastMonths.filter((m) => m !== currentMonthStr);

  const remainingQuota = selectedMonth ? getRemainingQuota(selectedMonth) : 3;

  const cardRadiusClass = settings?.cardRadius === 'sharp' ? 'rounded-none' : settings?.cardRadius === 'extra' ? 'rounded-3xl' : 'rounded-2xl';
  const smallRadiusClass = settings?.cardRadius === 'sharp' ? 'rounded-none' : settings?.cardRadius === 'extra' ? 'rounded-2xl' : 'rounded-xl';



  const breadcrumbItems = useMemo((): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { label: 'Dashboard', onClick: onBackToDashboard },
      { 
        label: 'Lifeboard AI', 
        onClick: selectedMonth ? () => { setSelectedMonth(null); setInsightData(null); } : undefined 
      }
    ];
    if (selectedMonth) {
      items.push({ label: formatMonthLabel(selectedMonth) });
    }
    return items;
  }, [onBackToDashboard, selectedMonth]);

  return (
    <div className="flex flex-col relative w-full" id="view-lifeboard-ai">
      {/* =======================================================
          1. HERO BANNER PERSIS DASHBOARD & PENGATURAN
         ======================================================= */}
      {/* 1. Backdrop Banner Atas dengan Breadcrumb, Icon, dan Tulisan Lifeboard AI (Identik & Sejajar 100% dengan Dashboard & Pengaturan) */}
      <div 
        className="relative -mx-4 sm:-mx-6 -mt-1 z-0 overflow-hidden text-white rounded-b-none pt-4 sm:pt-5 px-4 sm:px-6 h-[200px] sm:h-[215px] lg:h-[230px] transition-colors duration-200"
        style={{ backgroundColor: activeThemeColor, color: contrastColor }}
      >
        {/* Authentic Indonesian Songket Weave Vector Motif */}
        <div 
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 30%, rgba(0, 0, 0, 0.4) 55%, rgba(0, 0, 0, 0.9) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 30%, rgba(0, 0, 0, 0.4) 55%, rgba(0, 0, 0, 0.9) 100%)'
          }}
        >
          <BannerMotifOverlay motif={settings?.bannerMotif} idPrefix="lifeboard-banner" />

          {/* Subtle luminous atmospheric glow matching activeThemeColor */}
          <div 
            className="absolute right-0 bottom-0 w-72 h-40 rounded-full blur-3xl pointer-events-none"
            style={{ backgroundColor: isDark ? `${rawThemeColor}20` : `${activeThemeColor}40` }}
          />
          <div 
            className="absolute left-10 bottom-0 w-64 h-32 rounded-full blur-3xl pointer-events-none"
            style={{ backgroundColor: isDark ? `${rawThemeColor}15` : `${activeThemeColor}30` }}
          />
        </div>

        {/* 1. Breadcrumb Navigation di Banner (Posisi Sejajar & Pas Menggunakan Komponen Breadcrumb Global) */}
        <div className="relative z-10">
          <Breadcrumb items={breadcrumbItems} contrastColor={contrastColor} />
        </div>

        {/* 2. ICON & TULISAN LIFEBOARD AI DI BANNER (Tanpa Paragraf, Rapi & Proporsional) */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center select-none pt-6 sm:pt-8 pb-3 sm:pb-4">
          <div 
            className={`w-12 h-12 sm:w-14 sm:h-14 ${cardRadiusClass} bg-white dark:bg-[#121212] border-2 shadow-lg shadow-black/15 flex items-center justify-center transition-transform duration-200 hover:scale-105`}
            style={{ borderColor: `${activeThemeColor}50`, color: activeThemeColor }}
          >
            <div 
              className={`w-8.5 h-8.5 sm:w-10 sm:h-10 ${smallRadiusClass} flex items-center justify-center`}
              style={{ backgroundColor: `${activeThemeColor}20` }}
            >
              <Bot className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5" style={{ color: activeThemeColor }} />
            </div>
          </div>

        </div>
      </div>

      {/* =======================================================
          2. KONTEN UTAMA DENGAN CARD PEMBUNGKUS (KONSISTEN 100% SEJAJAR DENGAN DASHBOARD)
         ======================================================= */}
      <div className={`relative z-10 -mx-4 sm:-mx-6 -mt-[36px] sm:-mt-[88px] lg:-mt-[96px] ${enclosingCardRadiusClass} ${enclosingCardBgClass} px-4 sm:px-5 pt-6 pb-28 space-y-6`}>
        {/* A. TAMPILAN AWAL ROOM AI */}
        {!insightData ? (
          <div className="flex flex-col items-center w-full space-y-4 pb-8">

            {/* 2. TIGA CARD SEJAJAR KE KANAN (RINGKAS, KECIL, PAS TANPA SCROLL) */}
            <div className="w-full max-w-md mx-auto px-1">
              <div className="grid grid-cols-3 gap-2">
                {/* Card 1: Sebenarnya Insight Apa */}
                <div className={`${getCardClasses()} p-2.5 sm:p-3 flex flex-col justify-between text-left`}>
                  <div>
                    <div 
                      className={`w-6 h-6 ${smallRadiusClass} flex items-center justify-center mb-1.5`}
                      style={{ backgroundColor: `${activeThemeColor}20`, color: activeThemeColor }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span 
                      className="text-[9px] font-extrabold uppercase tracking-wider block mb-0.5"
                      style={{ color: activeThemeColor }}
                    >
                      Cakupan
                    </span>
                    <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-100 mb-1 leading-tight">
                      Seluruh Data
                    </h4>
                    <p className="text-[9.5px] sm:text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                      Mengevaluasi seluruh pos: mutasi, tabungan, budget, wishlist, dan agenda.
                    </p>
                  </div>
                </div>

                {/* Card 2: Seberapa Akurat */}
                <div className={`${getCardClasses()} p-2.5 sm:p-3 flex flex-col justify-between text-left`}>
                  <div>
                    <div className={`w-6 h-6 ${smallRadiusClass} bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5`}>
                      <Target className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-0.5">
                      Akurasi
                    </span>
                    <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-100 mb-1 leading-tight">
                      100% Catatanmu
                    </h4>
                    <p className="text-[9.5px] sm:text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                      Hitungan angkanya pas, kalimatnya dibantu Gemini AI.
                    </p>
                  </div>
                </div>

                {/* Card 3: Kekurangannya Apa (Berkaitan Langsung dengan AI) */}
                <div className={`${getCardClasses()} p-2.5 sm:p-3 flex flex-col justify-between text-left`}>
                  <div>
                    <div className={`w-6 h-6 ${smallRadiusClass} bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1.5`}>
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-0.5">
                      Kekurangan AI
                    </span>
                    <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-100 mb-1 leading-tight">
                      Bisa Salah Tafsir
                    </h4>
                    <p className="text-[9.5px] sm:text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                      Ulasan dibuat otomatis oleh AI, bisa keliru membaca situasi dan konteks transaksimu.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. MODUL KONTROL UTAMA: DIBUNGKUS CARD PUTIH BERSIH UNTUK MENYATU DENGAN NAVIGASI HP */}
            <div className="w-full max-w-md mx-auto pt-1">
              <div className={`${getCardClasses()} p-4 sm:p-4.5 space-y-3`}>
                {/* Baris 1: Tombol Cek Riwayat Insight Bulanan */}
                <button
                  type="button"
                  onClick={() => setIsHistoryModalOpen(true)}
                  className={`w-full flex items-center justify-between p-3 sm:p-3.5 ${smallRadiusClass} bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-100 transition-all active:scale-[0.99] ${
                    settings?.cardStyle === 'bordered'
                      ? 'border-2 border-slate-300 dark:border-slate-700 shadow-none'
                      : settings?.cardStyle === 'shadowed'
                      ? 'border border-slate-200/80 dark:border-slate-800 shadow-xs'
                      : 'border border-slate-200/90 dark:border-slate-800 shadow-none'
                  } group cursor-pointer`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 ${smallRadiusClass} bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0`}>
                      <History className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs sm:text-sm font-bold block">
                        Cek Riwayat Insight Bulanan
                      </span>
                      <span className="text-[10px] text-slate-400 block -mt-0.5">
                        Lihat arsip laporan bulan sebelumnya
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>

                {/* Pembatas Elegan */}
                <div className="h-px bg-slate-100 dark:bg-slate-800/80 w-full" />

                {/* Baris 2: Tombol / Status Insight Bulan Berjalan (PERSIS SAMA BACKGROUND, BORDER, ICON & WARNA) */}
                <div>
                  {wibInfo.isLastDayOfMonth ? (
                    <button
                      type="button"
                      onClick={() => loadInsightForMonth(currentMonthStr)}
                      disabled={isLoading}
                      className={`w-full py-3.5 px-5 ${smallRadiusClass} text-white font-bold text-xs sm:text-sm tracking-wide shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer select-none`}
                      style={{ backgroundColor: activeThemeColor, color: contrastColor }}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Menganalisis Sistem Finansial...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Lihat Insight Bulan Ini</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className={`p-3 sm:p-3.5 ${smallRadiusClass} bg-white dark:bg-slate-900 ${
                      settings?.cardStyle === 'bordered'
                        ? 'border-2 border-slate-300 dark:border-slate-700 shadow-none'
                        : settings?.cardStyle === 'shadowed'
                        ? 'border border-slate-200/80 dark:border-slate-800 shadow-xs'
                        : 'border border-slate-200/90 dark:border-slate-800 shadow-none'
                    } flex items-center justify-between gap-3 text-left`}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 ${smallRadiusClass} bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0`}>
                          <Lock className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                            Insight {wibInfo.monthNameIndo} {wibInfo.year}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate -mt-0.5">
                            Terbuka tanggal {wibInfo.lastDayOfMonth} {wibInfo.monthNameIndo}
                          </p>
                        </div>
                      </div>

                      <span 
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0"
                        style={{ backgroundColor: `${activeThemeColor}15`, borderColor: `${activeThemeColor}30`, color: activeThemeColor }}
                      >
                        {wibInfo.daysRemainingInMonth} hari lagi
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* B. DETAIL LAPORAN INSIGHT BULAN */
          <div className="space-y-4 -mt-10 sm:-mt-12 pb-10">
            {/* Card Header Insight Bulan yang Menimpa Banner */}
            <div className={`${getCardClasses()} p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-lg flex items-center justify-between gap-3 relative z-20`}>
              <div>
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-0.5">
                  Insight Bulan
                </span>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                  {insightData.monthLabel}
                </h3>
              </div>

              {/* Status Skor & Tombol Regenerasi AI (Batas 3x per bulan) */}
              <div className="flex items-center gap-2 shrink-0">
                <div 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-black text-xs sm:text-sm shadow-xs shrink-0 border"
                  style={{ backgroundColor: `${activeThemeColor}15`, borderColor: `${activeThemeColor}30`, color: activeThemeColor }}
                >
                  <Award className="w-4 h-4" />
                  <span>Skor {insightData.financialHealthGrade}</span>
                </div>
              </div>
            </div>

            {/* BAR PEMBERITAHUAN REGENERASI GEMINI AI & SISA KUOTA (MAKSIMAL 3X) */}
            <div className="flex items-center justify-between px-2 py-1 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Sparkles className="w-3.5 h-3.5" style={{ color: activeThemeColor }} />
                <span className="font-semibold">Didukung Google Gemini AI</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRegenerateGemini}
                  disabled={isGeneratingAI || remainingQuota <= 0}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all select-none ${
                    remainingQuota > 0 && !isGeneratingAI
                      ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-xs active:scale-95 cursor-pointer'
                      : 'bg-slate-100 dark:bg-slate-800/60 text-slate-400 border border-slate-200/50 dark:border-slate-800 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin' : ''}`} style={isGeneratingAI ? { color: activeThemeColor } : undefined} />
                  <span>
                    {isGeneratingAI
                      ? 'Menganalisis...'
                      : `Regenerate (${5 - remainingQuota}/5)`}
                  </span>
                </button>
              </div>
            </div>

            {/* SEBELAHAN KANAN KIRI: Hasil Evaluasi & Rekomendasi Bulan Berikutnya */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              {/* Kolom Kiri: Hasil Evaluasi */}
              <div 
                className={`${getCardClasses()} p-5 sm:p-6 bg-gradient-to-br from-rose-50/50 to-white dark:from-rose-950/20 dark:to-slate-900 border flex flex-col justify-between relative`}
                style={{ borderColor: `${activeThemeColor}30` }}
              >
                {isGeneratingAI && (
                  <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs rounded-3xl flex items-center justify-center z-10">
                    <div className="flex items-center gap-2 text-xs font-bold" style={{ color: activeThemeColor }}>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Gemini AI sedang menyusun evaluasi...</span>
                    </div>
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${activeThemeColor}20`, color: activeThemeColor }}
                      >
                        <Award className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs font-black tracking-wider uppercase text-slate-800 dark:text-slate-200">
                        Hasil Evaluasi
                      </h4>
                    </div>
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{ backgroundColor: `${activeThemeColor}15`, color: activeThemeColor }}
                    >
                      <Sparkles className="w-2.5 h-2.5" /> Gemini AI
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                    {insightData.executiveSummary}
                  </p>
                </div>
              </div>

              {/* Kolom Kanan: Rekomendasi Bulan Berikutnya */}
              <div 
                className={`${getCardClasses()} p-5 sm:p-6 bg-gradient-to-br from-rose-50/50 to-white dark:from-rose-950/20 dark:to-slate-900 border flex flex-col justify-between relative`}
                style={{ borderColor: `${activeThemeColor}30` }}
              >
                {isGeneratingAI && (
                  <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs rounded-3xl flex items-center justify-center z-10">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <RefreshCw className="w-4 h-4 animate-spin" style={{ color: activeThemeColor }} />
                      <span>Menyusun rekomendasi taktis...</span>
                    </div>
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${activeThemeColor}20`, color: activeThemeColor }}
                      >
                        <Target className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs font-black tracking-wider uppercase text-slate-800 dark:text-slate-200">
                        Rekomendasi Bulan Berikutnya
                      </h4>
                    </div>
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{ backgroundColor: `${activeThemeColor}15`, color: activeThemeColor }}
                    >
                      Taktis
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-200 list-disc list-inside font-medium">
                    {insightData.strategicRecommendations.slice(0, 3).map((rec, i) => (
                      <li key={i} className="leading-relaxed">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Arus Kas Finansial (Pendapatan, Pengeluaran, Total Saldo Akhir) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Pendapatan */}
              <div className={`${getCardClasses()} p-5 flex flex-col justify-between`}>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">Pendapatan</span>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <span className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight block">
                    {formatIDR(insightData.totalIncome)}
                  </span>
                  {insightData.topIncomeSources.length > 0 && (
                    <p className="text-[11px] text-slate-400 mt-1 truncate">
                      Sumber: {insightData.topIncomeSources[0].name}
                    </p>
                  )}
                </div>
              </div>

              {/* Pengeluaran */}
              <div className={`${getCardClasses()} p-5 flex flex-col justify-between`}>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">Pengeluaran</span>
                  <TrendingDown className="w-4 h-4 text-rose-500" />
                </div>
                <div>
                  <span className="text-lg sm:text-xl font-black font-mono text-rose-600 dark:text-rose-400 tracking-tight block">
                    {formatIDR(insightData.totalExpense)}
                  </span>
                  {insightData.topExpenseCategories.length > 0 && (
                    <p className="text-[11px] text-slate-400 mt-1 truncate">
                      Terbesar: {insightData.topExpenseCategories[0].name}
                    </p>
                  )}
                </div>
              </div>

              {/* Total Saldo Akhir */}
              <div className={`${getCardClasses()} p-5 flex flex-col justify-between`}>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">Total Saldo Akhir</span>
                  <DollarSign className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <span className={`text-lg sm:text-xl font-black font-mono tracking-tight block ${
                    insightData.netCashflow >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600'
                  }`}>
                    {insightData.netCashflow >= 0 ? `+${formatIDR(insightData.netCashflow)}` : `-${formatIDR(Math.abs(insightData.netCashflow))}`}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Rasio Simpanan: {insightData.savingsRate}%
                  </p>
                </div>
              </div>
            </div>

            {/* Top 3 Kategori Pengeluaran */}
            {insightData.topExpenseCategories.length > 0 && (
              <div className={`${getCardClasses()} p-5 sm:p-6`}>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3.5">
                  Top 3 Kategori Pengeluaran
                </h4>
                <div className="space-y-3">
                  {insightData.topExpenseCategories.map((cat, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-800 dark:text-slate-200">{cat.name}</span>
                        <div className="font-mono text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span>{formatIDR(cat.amount)}</span>
                          <span className="text-[10px] font-bold text-slate-500 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                            {cat.percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${Math.min(100, cat.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pola Hari Transaksi & Biaya Admin Transfer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={`${getCardClasses()} p-5 flex flex-col justify-between`}>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 mb-3">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-black uppercase tracking-wider">Pola Hari Transaksi</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Puncak Pengeluaran:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {insightData.peakDayName} ({formatIDR(insightData.peakDayAmount)})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Hari Paling Sering:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {insightData.busiestDayName} ({insightData.busiestDayCount} trx)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Total Transaksi:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {insightData.totalTransactionsCount} kali
                    </span>
                  </div>
                </div>
              </div>

              <div className={`${getCardClasses()} p-5 flex flex-col justify-between`}>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 mb-3">
                  <ArrowRightLeft className="w-4 h-4 text-sky-500" />
                  <span className="text-xs font-black uppercase tracking-wider">Transfer & Biaya Admin</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Dana Dipindahkan:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {formatIDR(insightData.totalTransferred)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Biaya Admin:</span>
                    <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
                      {formatIDR(insightData.totalAdminFees)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Efisiensi Biaya:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {insightData.adminFeeEfficiencyLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Kondisi Budget & Tabungan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={`${getCardClasses()} p-5`}>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 mb-3">
                  <Sliders className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-black uppercase tracking-wider">Kondisi Budget</span>
                </div>
                <div className="text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Status Anggaran:</span>
                    <span className={`font-bold ${insightData.totalBudgetsCount === 0 ? 'text-slate-400' : insightData.overBudgetsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {insightData.totalBudgetsCount === 0 ? 'Belum ada anggaran' : insightData.overBudgetsCount > 0 ? `${insightData.overBudgetsCount} Pos Over Limit` : 'Semua Aman Terkendali'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Rata-rata Sisa:</span>
                    <span className="font-mono font-black text-slate-900 dark:text-slate-100">
                      {insightData.totalBudgetsCount === 0 ? 'Tidak ada' : `${insightData.averageRemainingBudgetPct}%`}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`${getCardClasses()} p-5`}>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 mb-3">
                  <PiggyBank className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-black uppercase tracking-wider">Tabungan & Wishlist</span>
                </div>
                <div className="text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Setoran Tabungan:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatIDR(Math.max(0, insightData.netSavingAddition))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Wishlist Terbeli:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {insightData.wishlistPurchasedCount} barang ({formatIDR(insightData.wishlistPurchasedTotal)})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Disiplin Aktivitas */}
            <div className={`${getCardClasses()} p-5 flex items-center justify-between gap-3`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Disiplin Agenda</span>
                  <h5 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    {insightData.activitiesCompletedCount + insightData.activitiesPendingCount === 0 ? 'Belum ada agenda di bulan ini' : `${insightData.activitiesCompletedCount} Selesai • ${insightData.activitiesPendingCount} Tertunda`}
                  </h5>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg sm:text-xl font-black font-mono text-purple-600 dark:text-purple-400">
                  {insightData.activitiesCompletedCount + insightData.activitiesPendingCount === 0 ? '-' : `${insightData.activityCompletionRate}%`}
                </span>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Tingkat Tuntas</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =======================================================
          3. MODAL POPUP RIWAYAT INSIGHT (DIPORTAL KE DOCUMENT.BODY)
         ======================================================= */}
      {isHistoryModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] backdrop-blur-md bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[32px] sm:rounded-3xl overflow-hidden shadow-2xl border-t border-x sm:border-b-0 border-slate-200/80 dark:border-slate-800 max-h-[85vh] flex flex-col">
            {/* Pull Handle */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* Modal Header: Judul Saja, Tanpa Button X */}
            <div className="px-6 py-3.5 border-b border-slate-100 dark:border-slate-800/80">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
                Riwayat Insight Bulanan
              </h3>
            </div>

            {/* List of Months: Scrollable ke bawah, Tidak Terpotong Cardnya */}
            <div className="px-6 py-4 overflow-y-auto space-y-3 flex-1 max-h-[60vh] bg-white dark:bg-slate-900">
              {pastMonthsList.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  Belum ada riwayat insight bulan sebelumnya.
                </div>
              ) : (
                pastMonthsList.map((mStr) => {
                  const label = formatMonthLabel(mStr);
                  const isSelected = selectedMonth === mStr;

                  return (
                    <button
                      key={mStr}
                      type="button"
                      onClick={() => loadInsightForMonth(mStr)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer select-none active:scale-[0.98] ${
                        isSelected
                          ? 'text-slate-900 dark:text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 shadow-3xs'
                      }`}
                      style={
                        isSelected 
                          ? { backgroundColor: `${activeThemeColor}15`, borderColor: activeThemeColor }
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={
                            isSelected 
                              ? { backgroundColor: activeThemeColor, color: contrastColor }
                              : { backgroundColor: `${activeThemeColor}20`, color: activeThemeColor }
                          }
                        >
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm tracking-tight truncate">
                            {label}
                          </p>
                          <span className="text-[11px] font-mono text-slate-400 block">
                            {mStr}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isSelected ? (
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: activeThemeColor, color: contrastColor }}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Modal Footer: Tombol Tutup di Kanan Bawah Tanpa Garis Pembatas */}
            <div className="px-6 pt-1 pb-[max(1.25rem,env(safe-area-inset-bottom,20px))] flex justify-end shrink-0 bg-white dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer active:scale-95"
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
