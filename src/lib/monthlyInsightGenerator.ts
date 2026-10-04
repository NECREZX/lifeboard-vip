/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction, Budget, Saving, SavingLog, Activity, Wishlist, Category, IncomeSource } from '../types';
import { formatIDR } from './formatters';
import { formatMonthLabel } from './jakartaTime';

export interface MonthlyInsightData {
  monthStr: string; // YYYY-MM
  monthLabel: string;
  generatedAt: string;

  // 1. Cashflow & Income/Expense
  totalIncome: number;
  totalExpense: number;
  netCashflow: number;
  savingsRate: number; // percentage (net / income * 100)
  topExpenseCategories: { name: string; amount: number; percentage: number; color?: string }[];
  topIncomeSources: { name: string; amount: number; percentage: number; color?: string }[];

  // 2. Transaction Patterns & Peak Days
  totalTransactionsCount: number;
  peakDayName: string; // e.g. "Sabtu"
  peakDayAmount: number;
  busiestDayName: string; // e.g. "Jumat" (most count)
  busiestDayCount: number;

  // 3. Transfers & Admin Fees
  transferCount: number;
  totalTransferred: number;
  totalAdminFees: number;
  adminFeeEfficiencyLabel: string;

  // 4. Budgeting Health
  totalBudgetsCount: number;
  safeBudgetsCount: number;
  overBudgetsCount: number;
  averageRemainingBudgetPct: number;
  budgetStatusSummary: string;

  // 5. Savings & Wishlist
  savingDeposited: number;
  savingWithdrawn: number;
  netSavingAddition: number;
  wishlistPurchasedCount: number;
  wishlistPurchasedTotal: number;

  // 6. Activities & Productivity
  activitiesCompletedCount: number;
  activitiesPendingCount: number;
  activityCompletionRate: number; // 0-100%

  // 7. Executive Assessment
  financialHealthGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
  executiveSummary: string;
  keyHighlights: string[];
  strategicRecommendations: string[];
}

const INDO_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const generateMonthlyInsight = async (
  monthStr: string,
  transactions: Transaction[],
  budgets: Budget[],
  savings: Saving[],
  savingLogs: SavingLog[],
  activities: Activity[],
  wishlists: Wishlist[],
  categories: Category[],
  sources: IncomeSource[]
): Promise<MonthlyInsightData> => {
  const monthLabel = formatMonthLabel(monthStr);

  // 1. Filter Transactions by month
  const monthTxs = transactions.filter((t) => t.date && t.date.startsWith(monthStr));

  let totalIncome = 0;
  let totalExpense = 0;
  let totalAdminFees = 0;
  let totalTransferred = 0;
  let transferCount = 0;

  const expenseByCategory: Record<string, number> = {};
  const incomeBySource: Record<string, number> = {};

  const daySpending: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const dayCount: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

  monthTxs.forEach((tx) => {
    const d = new Date(tx.date);
    const dayOfWeek = isNaN(d.getDay()) ? 0 : d.getDay();
    dayCount[dayOfWeek] = (dayCount[dayOfWeek] || 0) + 1;

    if (tx.type === 'pemasukan') {
      totalIncome += tx.amount;
      const sId = tx.sourceId || 'other';
      incomeBySource[sId] = (incomeBySource[sId] || 0) + tx.amount;
    } else if (tx.type === 'pengeluaran') {
      totalExpense += tx.amount;
      daySpending[dayOfWeek] = (daySpending[dayOfWeek] || 0) + tx.amount;
      const cId = tx.categoryId || 'other';
      expenseByCategory[cId] = (expenseByCategory[cId] || 0) + tx.amount;
    } else if (tx.type === 'transfer') {
      transferCount += 1;
      totalTransferred += tx.amount;
      if (tx.adminFee && tx.adminFee > 0) {
        totalAdminFees += tx.adminFee;
      }
    }
  });

  const netCashflow = totalIncome - totalExpense - totalAdminFees;
  const savingsRate = totalIncome > 0 ? Math.round(Math.max(0, (netCashflow / totalIncome) * 100)) : 0;

  // Top Expense Categories
  const topExpenseCategories = Object.entries(expenseByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([catId, amount]) => {
      const cat = categories.find((c) => c.id === catId);
      const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
      return {
        name: cat ? cat.name : 'Lainnya',
        amount,
        percentage,
        color: cat?.color || '#ef4444',
      };
    });

  // Top Income Sources
  const topIncomeSources = Object.entries(incomeBySource)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([srcId, amount]) => {
      const src = sources.find((s) => s.id === srcId);
      const percentage = totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0;
      return {
        name: src ? src.name : 'Sumber Lain',
        amount,
        percentage,
        color: src?.color || '#10b981',
      };
    });

  // Peak Spending Day and Busiest Day
  let peakDayIdx = 0;
  let maxDaySpend = -1;
  let busiestDayIdx = 0;
  let maxDayCount = -1;

  Object.entries(daySpending).forEach(([dStr, spend]) => {
    const idx = parseInt(dStr, 10);
    if (spend > maxDaySpend) {
      maxDaySpend = spend;
      peakDayIdx = idx;
    }
  });

  Object.entries(dayCount).forEach(([dStr, cnt]) => {
    const idx = parseInt(dStr, 10);
    if (cnt > maxDayCount) {
      maxDayCount = cnt;
      busiestDayIdx = idx;
    }
  });

  const peakDayName = maxDaySpend > 0 ? INDO_DAYS[peakDayIdx] : '-';
  const busiestDayName = maxDayCount > 0 ? INDO_DAYS[busiestDayIdx] : '-';

  // Admin Fee efficiency
  let adminFeeEfficiencyLabel = 'Sangat Hemat';
  if (totalTransferred > 0) {
    const feeRatio = (totalAdminFees / totalTransferred) * 100;
    if (feeRatio > 2) adminFeeEfficiencyLabel = 'Cukup Tinggi';
    else if (feeRatio > 0.5) adminFeeEfficiencyLabel = 'Wajar';
  }

  // 4. Budgeting Calculations
  const monthBudgets = budgets.filter((b) => b.month === monthStr);
  let safeBudgetsCount = 0;
  let overBudgetsCount = 0;
  let remainingPctSum = 0;

  monthBudgets.forEach((b) => {
    // Calculate spend for this budget
    const budgetCategories = b.categoryIds && b.categoryIds.length > 0 ? b.categoryIds : [b.categoryId];
    const isAll = budgetCategories.includes('all');

    const spend = monthTxs
      .filter((t) => t.type === 'pengeluaran')
      .filter((t) => isAll || (t.categoryId && budgetCategories.includes(t.categoryId)))
      .reduce((sum, t) => sum + t.amount, 0);

    if (spend > b.limitAmount) {
      overBudgetsCount += 1;
    } else {
      safeBudgetsCount += 1;
      const rem = Math.max(0, b.limitAmount - spend);
      const remPct = b.limitAmount > 0 ? (rem / b.limitAmount) * 100 : 0;
      remainingPctSum += remPct;
    }
  });

  const totalBudgetsCount = monthBudgets.length;
  const averageRemainingBudgetPct =
    totalBudgetsCount === 0 ? 0 : safeBudgetsCount > 0 ? Math.round(remainingPctSum / safeBudgetsCount) : overBudgetsCount > 0 ? 0 : 100;

  const budgetStatusSummary =
    totalBudgetsCount === 0
      ? 'Belum ada anggaran yang dicatat di bulan ini.'
      : overBudgetsCount === 0
      ? `Seluruh ${totalBudgetsCount} anggaran terkendali aman.`
      : `${overBudgetsCount} dari ${totalBudgetsCount} pos anggaran melebihi limit.`;

  // 5. Savings & Wishlist
  const monthSavingLogs = savingLogs.filter((log) => log.date && log.date.startsWith(monthStr));
  let savingDeposited = 0;
  let savingWithdrawn = 0;

  monthSavingLogs.forEach((log) => {
    if (log.type === 'setor') {
      savingDeposited += log.amount;
    } else if (log.type === 'tarik') {
      savingWithdrawn += log.amount;
    }
  });

  const netSavingAddition = savingDeposited - savingWithdrawn;

  // Wishlist purchased in this month
  const monthWishlists = wishlists.filter((w) => w.month === monthStr || !w.month);
  const wishlistPurchased = monthWishlists.filter((w) => w.isPurchased);
  const wishlistPurchasedCount = wishlistPurchased.length;
  const wishlistPurchasedTotal = wishlistPurchased.reduce((sum, w) => sum + (w.price || 0), 0);

  // 6. Activities & Productivity
  const monthActivities = activities.filter((a) => a.deadline && a.deadline.startsWith(monthStr));
  const activitiesCompletedCount = monthActivities.filter((a) => a.status === 'completed').length;
  const activitiesPendingCount = monthActivities.filter((a) => a.status === 'pending').length;
  const totalActivities = monthActivities.length;
  const activityCompletionRate = totalActivities > 0 ? Math.round((activitiesCompletedCount / totalActivities) * 100) : 0;

  // 7. Executive Health Grade & Highlights
  let financialHealthGrade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'B';
  if (netCashflow > 0 && overBudgetsCount === 0 && savingsRate >= 30) {
    financialHealthGrade = 'A+';
  } else if (netCashflow > 0 && overBudgetsCount <= 1 && savingsRate >= 15) {
    financialHealthGrade = 'A';
  } else if (netCashflow >= 0) {
    financialHealthGrade = 'B';
  } else if (netCashflow < 0 && Math.abs(netCashflow) < totalIncome * 0.2) {
    financialHealthGrade = 'C';
  } else {
    financialHealthGrade = 'D';
  }

  // Key Highlights
  const keyHighlights: string[] = [];
  if (netCashflow > 0) {
    keyHighlights.push(`Surplus arus kas positif sebesar ${formatIDR(netCashflow)} (${savingsRate}% dari total pemasukan).`);
  } else {
    keyHighlights.push(`Defisit arus kas sebesar -${formatIDR(Math.abs(netCashflow))}, pengeluaran melebihi pemasukan.`);
  }

  if (topExpenseCategories.length > 0) {
    keyHighlights.push(`Pos pengeluaran terbesar didominasi oleh "${topExpenseCategories[0].name}" (${topExpenseCategories[0].percentage}% dari total belanja).`);
  }

  if (peakDayName !== '-') {
    keyHighlights.push(`Puncak pengeluaran tercatat paling tinggi pada hari ${peakDayName} (${formatIDR(maxDaySpend)}).`);
  }

  if (netSavingAddition > 0) {
    keyHighlights.push(`Berhasil menyisihkan tambahan dana tabungan bersih sebesar ${formatIDR(netSavingAddition)}.`);
  }

  if (wishlistPurchasedCount > 0) {
    keyHighlights.push(`${wishlistPurchasedCount} barang impian wishlist berhasil terealisasi.`);
  }

  // Strategic Recommendations
  const strategicRecommendations: string[] = [];
  if (overBudgetsCount > 0) {
    strategicRecommendations.push(`Lakukan pengetatan pada ${overBudgetsCount} pos anggaran yang over limit dengan mengalihkan belanja non-esensial.`);
  } else {
    strategicRecommendations.push(`Pertahankan kedisiplinan anggaran; rata-rata sisa anggaran ${averageRemainingBudgetPct}% dapat dialokasikan langsung ke pos tabungan.`);
  }

  if (totalAdminFees > 15000) {
    strategicRecommendations.push(`Optimalisasi metode transfer untuk menghemat biaya admin sebesar ${formatIDR(totalAdminFees)} di bulan berikutnya.`);
  }

  if (activityCompletionRate < 70 && totalActivities > 0) {
    strategicRecommendations.push(`Tingkatkan konsistensi penyelesaian agenda bulanan yang masih tertunda sebanyak ${activitiesPendingCount} aktivitas.`);
  }

  const executiveSummary = `Kinerja keuangan Anda di bulan ${monthLabel} mencatatkan ${
    netCashflow >= 0 ? 'surplus yang sehat' : 'tekanan defisit'
  } dengan skor ${financialHealthGrade}. ${
    topExpenseCategories.length > 0 ? `Konsentrasi pengeluaran utama berada pada ${topExpenseCategories[0].name}.` : ''
  } ${
    overBudgetsCount === 0
      ? 'Seluruh batas anggaran terjaga disiplin.'
      : 'Diperlukan penyesuaian pada kategori yang melampaui limit.'
  }`;

  const generatedAt = new Date().toISOString();

  return {
    monthStr,
    monthLabel,
    generatedAt,
    totalIncome,
    totalExpense,
    netCashflow,
    savingsRate,
    topExpenseCategories,
    topIncomeSources,
    totalTransactionsCount: monthTxs.length,
    peakDayName,
    peakDayAmount: maxDaySpend > 0 ? maxDaySpend : 0,
    busiestDayName,
    busiestDayCount: maxDayCount > 0 ? maxDayCount : 0,
    transferCount,
    totalTransferred,
    totalAdminFees,
    adminFeeEfficiencyLabel,
    totalBudgetsCount,
    safeBudgetsCount,
    overBudgetsCount,
    averageRemainingBudgetPct,
    budgetStatusSummary,
    savingDeposited,
    savingWithdrawn,
    netSavingAddition,
    wishlistPurchasedCount,
    wishlistPurchasedTotal,
    activitiesCompletedCount,
    activitiesPendingCount,
    activityCompletionRate,
    financialHealthGrade,
    executiveSummary,
    keyHighlights,
    strategicRecommendations,
  };
};

/**
 * Panggilan ke Server-Side Gemini AI Endpoint (/api/gemini/monthly-review)
 * untuk merangkai evaluasi eksekutif dan rekomendasi taktis.
 */
export async function generateGeminiExecutiveReview(
  data: MonthlyInsightData
): Promise<{ executiveSummary: string; strategicRecommendations: string[] } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch('/api/gemini/monthly-review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      console.warn('Server Gemini API response not ok:', response.status, errJson);
      return null;
    }

    const result = await response.json();
    if (result && typeof result.executiveSummary === 'string' && Array.isArray(result.strategicRecommendations)) {
      return {
        executiveSummary: result.executiveSummary.trim(),
        strategicRecommendations: result.strategicRecommendations.filter((r: any) => typeof r === 'string')
      };
    }

    return null;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.warn('Gemini AI call timed out after 15 seconds');
    } else {
      console.warn('Gemini AI review request error:', err);
    }
    return null;
  }
}

