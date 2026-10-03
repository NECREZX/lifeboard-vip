/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Transaction, Category, IncomeSource } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Format currency to IDR
const formatIDR = (num: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(num);
};

const CHART_COLORS = [
  '#3b82f6', // blue-500
  '#ef4444', // red-500
  '#22c55e', // green-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#64748b', // slate-500
];

// Helper to convert polar coordinates to cartesian for SVG pie charts
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

// Generate path for pie slices
function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', x, y,
    'L', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'Z'
  ].join(' ');
}

// 1. TREND LINE CHART
interface TrendChartProps {
  transactions: Transaction[];
  themeColor: string;
}

export function TrendChart({ transactions, themeColor }: TrendChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; type: 'income' | 'expense' | 'transfer' | 'adminFee'; value: number; x: number; y: number } | null>(null);

  // Group transactions by date
  const groupedData: { [date: string]: { income: number; expense: number; transfer: number; adminFee: number } } = {};
  
  // Sort transactions chronologically
  const sortedTrans = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  
  // Get last 7 unique dates or past few days
  sortedTrans.forEach((t) => {
    if (!groupedData[t.date]) {
      groupedData[t.date] = { income: 0, expense: 0, transfer: 0, adminFee: 0 };
    }
    if (t.type === 'pemasukan') {
      groupedData[t.date].income += t.amount;
    } else if (t.type === 'pengeluaran') {
      groupedData[t.date].expense += t.amount;
    } else if (t.type === 'transfer') {
      groupedData[t.date].transfer += t.amount;
    }
    if (t.adminFee && t.adminFee > 0) {
      groupedData[t.date].adminFee += t.adminFee;
    }
  });

  const uniqueDates = Object.keys(groupedData).slice(-6); // Get last 6 dates for optimal display density
  
  const chartData = uniqueDates.map((date) => {
    const formattedDate = new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    return {
      dateLabel: formattedDate,
      rawDate: date,
      income: groupedData[date].income,
      expense: groupedData[date].expense,
      transfer: groupedData[date].transfer,
      adminFee: groupedData[date].adminFee,
    };
  });

  // Calculate scales
  const maxVal = Math.max(...chartData.map(d => Math.max(d.income, d.expense, d.transfer, d.adminFee, 500000)));
  const padMax = maxVal * 1.15; // padding top

  // Chart dimensions
  const width = 500;
  const height = 240;
  const paddingLeft = 60;
  const paddingRight = 25;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  if (chartData.length === 0) {
    return (
      <div className="relative w-full h-full flex flex-col justify-between" id="trend-chart-container">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold tracking-tight text-slate-700 dark:text-slate-300">Trend Keuangan</h4>
        </div>
        <div className="flex flex-col items-center justify-center p-6 text-center min-h-[180px] bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800/80">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">Belum Ada Transaksi</p>
          <p className="text-[10px] text-slate-400/80 dark:text-slate-500/80 mt-1 max-w-xs leading-normal">Catat transaksi keuangan Anda untuk melihat grafik perkembangan secara otomatis.</p>
        </div>
      </div>
    );
  }

  // Helper coordinate functions
  const getX = (index: number) => {
    if (chartData.length === 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + 18 + (index / (chartData.length - 1)) * (chartWidth - 36);
  };

  const getY = (val: number) => {
    return paddingTop + chartHeight - (val / padMax) * chartHeight;
  };

  // Convert discrete points to a smooth mountain-like spline curve (Catmull-Rom Bezier)
  const createCurvedPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    if (points.length === 2) {
      const cp1x = (points[0].x + points[1].x) / 2;
      return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} C ${cp1x.toFixed(1)} ${points[0].y.toFixed(1)}, ${cp1x.toFixed(1)} ${points[1].y.toFixed(1)}, ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;
    }

    let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      // Mountain tension factor (0.2) ensures natural gentle hill curves without overshoot
      const tension = 0.2;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const incomePoints = chartData.map((d, i) => ({ x: getX(i), y: getY(d.income) }));
  const expensePoints = chartData.map((d, i) => ({ x: getX(i), y: getY(d.expense) }));
  const transferPoints = chartData.map((d, i) => ({ x: getX(i), y: getY(d.transfer) }));
  const adminFeePoints = chartData.map((d, i) => ({ x: getX(i), y: getY(d.adminFee) }));

  const incomePath = createCurvedPath(incomePoints);
  const expensePath = createCurvedPath(expensePoints);
  const transferPath = createCurvedPath(transferPoints);
  const adminFeePath = createCurvedPath(adminFeePoints);

  return (
    <div className="relative w-full h-full flex flex-col justify-between" id="trend-chart-container">
      {/* Header and Legend matching requested colors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <h4 className="text-sm font-semibold tracking-tight text-slate-700 dark:text-slate-300">Trend Keuangan</h4>
        <div className="flex items-center flex-nowrap gap-2 sm:gap-2.5 text-[11px] sm:text-xs whitespace-nowrap overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 inline-block shadow-xs"></span>
            <span className="text-slate-600 dark:text-slate-400 font-medium">Pendapatan</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500 inline-block shadow-xs"></span>
            <span className="text-slate-600 dark:text-slate-400 font-medium">Pengeluaran</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500 inline-block shadow-xs"></span>
            <span className="text-slate-600 dark:text-slate-400 font-medium">Transfer</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-orange-500 inline-block shadow-xs"></span>
            <span className="text-slate-600 dark:text-slate-400 font-medium">Biaya Admin</span>
          </div>
        </div>
      </div>

      <div className="relative flex-1 min-h-[180px] w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" id="trend-svg">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = paddingTop + chartHeight * (1 - ratio);
            const valLabel = formatIDR(padMax * ratio).replace('Rp', '').trim();
            return (
              <g key={index} className="opacity-40">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  fill="currentColor"
                  className="text-slate-400 dark:text-slate-500"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {ratio === 0 ? '0' : valLabel}
                </text>
              </g>
            );
          })}

          {/* Line 1: Pendapatan (Curved Green #10b981) */}
          <path
            d={incomePath}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* Line 2: Pengeluaran (Curved Red #ef4444) */}
          <path
            d={expensePath}
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* Line 3: Transfer (Curved Blue #3b82f6) */}
          <path
            d={transferPath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* Line 4: Biaya Admin (Curved Orange #f97316) */}
          <path
            d={adminFeePath}
            fill="none"
            stroke="#f97316"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* Interactive Data Points & Ticks for each date */}
          {chartData.map((d, i) => {
            const x = getX(i);
            const yIncome = getY(d.income);
            const yExpense = getY(d.expense);
            const yTransfer = getY(d.transfer);
            const yAdmin = getY(d.adminFee);

            return (
              <g key={i}>
                {/* Date Axis Label */}
                <text
                  x={x}
                  y={height - paddingBottom + 18}
                  fill="currentColor"
                  className="text-slate-400 dark:text-slate-500"
                  fontSize="11"
                  fontWeight="500"
                  textAnchor="middle"
                >
                  {d.dateLabel}
                </text>

                {/* Point 1: Pendapatan (Green Dot) */}
                <circle
                  cx={x}
                  cy={yIncome}
                  r="4.5"
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="cursor-pointer transition-all hover:r-6 shadow-sm"
                  onMouseEnter={() => {
                    setHoveredPoint({
                      label: d.dateLabel,
                      type: 'income',
                      value: d.income,
                      x,
                      y: yIncome,
                    });
                  }}
                  onMouseLeave={() => setHoveredPoint(null)}
                />

                {/* Point 2: Pengeluaran (Red Dot) */}
                <circle
                  cx={x}
                  cy={yExpense}
                  r="4.5"
                  fill="#ef4444"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="cursor-pointer transition-all hover:r-6 shadow-sm"
                  onMouseEnter={() => {
                    setHoveredPoint({
                      label: d.dateLabel,
                      type: 'expense',
                      value: d.expense,
                      x,
                      y: yExpense,
                    });
                  }}
                  onMouseLeave={() => setHoveredPoint(null)}
                />

                {/* Point 3: Transfer (Blue Dot) */}
                <circle
                  cx={x}
                  cy={yTransfer}
                  r="4"
                  fill="#3b82f6"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="cursor-pointer transition-all hover:r-6 shadow-sm"
                  onMouseEnter={() => {
                    setHoveredPoint({
                      label: d.dateLabel,
                      type: 'transfer',
                      value: d.transfer,
                      x,
                      y: yTransfer,
                    });
                  }}
                  onMouseLeave={() => setHoveredPoint(null)}
                />

                {/* Point 4: Biaya Admin (Orange Dot) */}
                <circle
                  cx={x}
                  cy={yAdmin}
                  r="3.5"
                  fill="#f97316"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="cursor-pointer transition-all hover:r-5 shadow-sm"
                  onMouseEnter={() => {
                    setHoveredPoint({
                      label: d.dateLabel,
                      type: 'adminFee',
                      value: d.adminFee,
                      x,
                      y: yAdmin,
                    });
                  }}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            );
          })}

          {/* Chart baseline */}
          <line
            x1={paddingLeft}
            y1={paddingTop + chartHeight}
            x2={width - paddingRight}
            y2={paddingTop + chartHeight}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700"
            strokeWidth="1.5"
          />
        </svg>

        {/* Hover Tooltip with smart clamping to prevent being cut off at edges */}
        {hoveredPoint && (() => {
          const pctX = (hoveredPoint.x / width) * 100;
          const xAlignClass = pctX < 28 
            ? 'translate-x-1' 
            : pctX > 72 
              ? '-translate-x-[98%]' 
              : '-translate-x-1/2';

          return (
            <div
              className={`absolute z-30 p-2.5 text-xs bg-slate-900/95 dark:bg-slate-900 text-white rounded-xl shadow-2xl pointer-events-none transform -translate-y-full flex flex-col gap-1 border border-slate-700/80 font-sans backdrop-blur-md transition-transform ${xAlignClass}`}
              style={{
                left: `${pctX}%`,
                top: `${(hoveredPoint.y / height) * 100 - 8}%`
              }}
            >
              <span className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">{hoveredPoint.label}</span>
              <div className="flex items-center gap-1.5 font-bold">
                {hoveredPoint.type === 'income' && (
                  <>
                    <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                    <span className="text-emerald-400">Pendapatan:</span>
                  </>
                )}
                {hoveredPoint.type === 'expense' && (
                  <>
                    <svg className="w-3.5 h-3.5 text-rose-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                      <polyline points="17 18 23 18 23 12" />
                    </svg>
                    <span className="text-rose-400">Pengeluaran:</span>
                  </>
                )}
                {hoveredPoint.type === 'transfer' && (
                  <>
                    <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 1l4 4-4 4" />
                      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                      <path d="M7 23l-4-4 4-4" />
                      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                    </svg>
                    <span className="text-blue-400">Transfer:</span>
                  </>
                )}
                {hoveredPoint.type === 'adminFee' && (
                  <>
                    {/* Modern Card / Fee Icon in Matching Orange */}
                    <svg className="w-3.5 h-3.5 text-orange-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                    <span className="text-orange-400">Biaya Admin:</span>
                  </>
                )}
                <span className="font-mono text-white text-xs">{formatIDR(hoveredPoint.value)}</span>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}


// 2. PIE CHART FOR EXPENSES
interface CategoryPieChartProps {
  transactions: Transaction[];
  categories: Category[];
}

export function CategoryPieChart({ transactions, categories }: CategoryPieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Filter and sum expenses
  const expenses = transactions.filter((t) => t.type === 'pengeluaran');
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

  // Group by categoryId
  const categoryMap: { [catId: string]: number } = {};
  expenses.forEach((e) => {
    if (e.categoryId) {
      categoryMap[e.categoryId] = (categoryMap[e.categoryId] || 0) + e.amount;
    }
  });

  const pieData = categories
    .map((cat, index) => {
      const amount = categoryMap[cat.id] || 0;
      return {
        id: cat.id,
        name: cat.name,
        color: cat.color || CHART_COLORS[index % CHART_COLORS.length],
        icon: cat.icon,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
      };
    })
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // Calculate segments
  let cumulativeAngle = 0;
  const segments = pieData.map((d, index) => {
    const angleRange = (d.percentage / 100) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angleRange;
    cumulativeAngle = endAngle;

    return {
      ...d,
      startAngle,
      endAngle,
      index
    };
  });

  return (
    <div className="w-full flex flex-col md:flex-row items-center gap-6" id="category-pie-container">
      <div className="relative w-[180px] h-[180px] shrink-0">
        {totalExpense === 0 ? (
          <div className="w-full h-full rounded-full border-4 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-4 text-center text-xs text-slate-400">
            <span>Belum ada data pengeluaran</span>
          </div>
        ) : (
          <>
            <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
              <circle cx="100" cy="100" r="85" fill="transparent" stroke="#f1f5f9" strokeWidth="20" className="dark:stroke-slate-800" />
              {segments.map((seg, i) => {
                const path = describeArc(100, 100, 75, seg.startAngle, seg.endAngle);
                const isActive = activeIndex === i;
                return (
                  <path
                    key={seg.id}
                    d={path}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={isActive ? 28 : 20}
                    className="transition-all duration-300 cursor-pointer hover:opacity-90"
                    style={{ strokeLinecap: 'butt' }}
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseLeave={() => setActiveIndex(null)}
                  />
                );
              })}
              {/* Center cutout */}
              <circle cx="100" cy="100" r="55" className="fill-white dark:fill-slate-900 transition-all duration-300" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-2">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total</span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono text-ellipsis overflow-hidden max-w-[130px]">{formatIDR(totalExpense)}</span>
              {activeIndex !== null && (
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[120px]">
                  {segments[activeIndex].percentage.toFixed(1)}% {segments[activeIndex].name}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Legend list */}
      <div className="flex-1 w-full flex flex-col gap-1.5 overflow-y-auto max-h-[180px]">
        {pieData.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">Sila tambahkan transaksi pengeluaran</p>
        ) : (
          pieData.map((d, i) => {
            const isActive = activeIndex === i;
            return (
              <div
                key={d.id}
                className={`flex items-center justify-between p-1.5 rounded-lg transition-all duration-200 text-xs cursor-pointer ${isActive ? 'bg-slate-100 dark:bg-slate-800 scale-[1.02] font-semibold' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                  <span className="text-slate-600 dark:text-slate-300 truncate max-w-[100px] sm:max-w-[140px]">{d.name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-right font-mono text-slate-500 dark:text-slate-400">
                  <span>{formatIDR(d.amount)}</span>
                  <span className="text-[10px] font-bold px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                    {d.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}



// 3. PIE CHART FOR INCOME SOURCES
interface SourcePieChartProps {
  transactions: Transaction[];
  sources: IncomeSource[];
}

export function SourcePieChart({ transactions, sources }: SourcePieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Filter and sum incomes
  const incomes = transactions.filter((t) => t.type === 'pemasukan');
  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);

  // Group by sourceId
  const sourceMap: { [srcId: string]: number } = {};
  incomes.forEach((e) => {
    if (e.sourceId) {
      sourceMap[e.sourceId] = (sourceMap[e.sourceId] || 0) + e.amount;
    }
  });

  const pieData = sources
    .map((src, index) => {
      const amount = sourceMap[src.id] || 0;
      return {
        id: src.id,
        name: src.name,
        color: src.color || CHART_COLORS[index % CHART_COLORS.length],
        icon: src.icon,
        amount,
        percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0
      };
    })
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // Calculate segments
  let cumulativeAngle = 0;
  const segments = pieData.map((d, index) => {
    const angleRange = (d.percentage / 100) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angleRange;
    cumulativeAngle = endAngle;

    return {
      ...d,
      startAngle,
      endAngle,
      index
    };
  });

  return (
    <div className="w-full flex flex-col md:flex-row items-center gap-6" id="source-pie-container">
      <div className="relative w-[180px] h-[180px] shrink-0">
        {totalIncome === 0 ? (
          <div className="w-full h-full rounded-full border-4 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-4 text-center text-xs text-slate-400">
            <span>Belum ada data pemasukan</span>
          </div>
        ) : (
          <>
            <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
              <circle cx="100" cy="100" r="85" fill="transparent" stroke="#f1f5f9" strokeWidth="20" className="dark:stroke-slate-800" />
              {segments.map((seg, i) => {
                const path = describeArc(100, 100, 75, seg.startAngle, seg.endAngle);
                const isActive = activeIndex === i;
                return (
                  <path
                    key={seg.id}
                    d={path}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={isActive ? 28 : 20}
                    className="transition-all duration-300 cursor-pointer hover:opacity-90"
                    style={{ strokeLinecap: 'butt' }}
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseLeave={() => setActiveIndex(null)}
                  />
                );
              })}
              {/* Center cutout */}
              <circle cx="100" cy="100" r="55" className="fill-white dark:fill-slate-900 transition-all duration-300" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-2">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total</span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono text-ellipsis overflow-hidden max-w-[130px]">{formatIDR(totalIncome)}</span>
              {activeIndex !== null && (
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[120px]">
                  {segments[activeIndex].percentage.toFixed(1)}% {segments[activeIndex].name}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Legend list */}
      <div className="flex-1 w-full flex flex-col gap-1.5 overflow-y-auto max-h-[180px]">
        {pieData.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">Sila tambahkan transaksi pemasukan</p>
        ) : (
          pieData.map((d, i) => {
            const isActive = activeIndex === i;
            return (
              <div
                key={d.id}
                className={`flex items-center justify-between p-1.5 rounded-lg transition-all duration-200 text-xs cursor-pointer ${isActive ? 'bg-slate-100 dark:bg-slate-800 scale-[1.02] font-semibold' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                  <span className="text-slate-600 dark:text-slate-300 truncate max-w-[100px] sm:max-w-[140px]">{d.name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-right font-mono text-slate-500 dark:text-slate-400">
                  <span>{formatIDR(d.amount)}</span>
                  <span className="text-[10px] font-bold px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                    {d.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// 4. BAR CHART FOR EXPENSES

export function CategoryBarChart({ transactions, categories, month, year }: CategoryPieChartProps & { month: number, year: number }) {
  const filtered = transactions.filter(t => t.type === 'pengeluaran' && new Date(t.date).getMonth() + 1 === month && new Date(t.date).getFullYear() === year);
  
  const data = categories.map((cat, index) => ({
    name: cat.name,
    amount: filtered.filter(t => t.categoryId === cat.id).reduce((sum, t) => sum + t.amount, 0),
    fill: cat.color || CHART_COLORS[index % CHART_COLORS.length]
  })).filter(d => d.amount > 0);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <XAxis dataKey="name" fontSize={10} stroke="currentColor" tick={{ fill: 'currentColor' }} />
        <YAxis fontSize={10} stroke="currentColor" tick={{ fill: 'currentColor' }} />
        <Tooltip formatter={(value: number) => formatIDR(value)} />
        <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// 5. BAR CHART FOR INCOME SOURCES
export function SourceBarChart({ transactions, sources, month, year }: SourcePieChartProps & { month: number, year: number }) {
  const filtered = transactions.filter(t => t.type === 'pemasukan' && new Date(t.date).getMonth() + 1 === month && new Date(t.date).getFullYear() === year);
  
  const data = sources.map((src, index) => ({
    name: src.name,
    amount: filtered.filter(t => t.sourceId === src.id).reduce((sum, t) => sum + t.amount, 0),
    fill: src.color || CHART_COLORS[index % CHART_COLORS.length]
  })).filter(d => d.amount > 0);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <XAxis dataKey="name" fontSize={10} stroke="currentColor" tick={{ fill: 'currentColor' }} />
        <YAxis fontSize={10} stroke="currentColor" tick={{ fill: 'currentColor' }} />
        <Tooltip formatter={(value: number) => formatIDR(value)} />
        <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
