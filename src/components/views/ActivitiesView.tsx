/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Trash2, 
  CheckCircle, 
  Circle, 
  Calendar, 
  Bookmark, 
  Edit2, 
  ChevronDown, 
  ShoppingBag, 
  CheckSquare, 
  Target
} from 'lucide-react';
import { Activity, Wishlist } from '../../types';
import { formatIDR } from '../../lib/formatters';
import { WishlistIcon } from '../CustomIcons';

interface ActivitiesViewProps {
  activities: Activity[];
  wishlists: Wishlist[];
  activeSubTab?: 'all' | 'agenda' | 'wishlist';
  setActiveSubTab?: (tab: 'all' | 'agenda' | 'wishlist') => void;
  getCardClasses: () => string;
  handleDeleteActivity: (id: string) => void;
  handleToggleActivity: (id: string) => void;
  handleDeleteWishlist: (id: string) => void;
  handleToggleWishlist: (id: string) => void;
  onEditActivity: (activity: Activity) => void;
  onEditWishlist: (wishlist: Wishlist) => void;
  settings?: any;
}

type UnifiedItem = 
  | { itemType: 'activity'; data: Activity }
  | { itemType: 'wishlist'; data: Wishlist };

export const ActivitiesView: React.FC<ActivitiesViewProps> = ({
  activities,
  wishlists,
  activeSubTab = 'all',
  setActiveSubTab,
  getCardClasses,
  handleDeleteActivity,
  handleToggleActivity,
  handleDeleteWishlist,
  handleToggleWishlist,
  onEditActivity,
  onEditWishlist,
  settings
}) => {
  const [localTypeFilter, setLocalTypeFilter] = useState<'all' | 'agenda' | 'wishlist'>(activeSubTab || 'all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [hoveredAxis, setHoveredAxis] = useState<string | null>(null);

  const currentType = localTypeFilter;

  const handleTypeChange = (newType: 'all' | 'agenda' | 'wishlist') => {
    setLocalTypeFilter(newType);
    if (setActiveSubTab) {
      setActiveSubTab(newType);
    }
  };

  const btnRadius = settings?.cardRadius === 'sharp' ? 'rounded-none' : settings?.cardRadius === 'extra' ? 'rounded-2xl' : 'rounded-xl';

  const filterBtnClass = useMemo(() => {
    let cls = `relative flex items-center justify-between gap-1.5 px-3 py-2 ${btnRadius} transition-all min-w-0 overflow-hidden bg-white dark:bg-slate-900 `;
    if (settings?.cardStyle === 'bordered') {
      cls += 'border-2 border-slate-300 dark:border-slate-700 shadow-none';
    } else if (settings?.cardStyle === 'shadowed') {
      cls += 'border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_16px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]';
    } else {
      cls += 'border border-slate-200/90 dark:border-slate-800 shadow-none';
    }
    return cls;
  }, [settings?.cardStyle, btnRadius]);

  // --- Statistics Calculations ---
  const totalActivities = activities.length;
  const completedActivities = activities.filter((a) => a.status === 'completed').length;
  const pendingActivities = totalActivities - completedActivities;
  const activityProgressPct = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

  const totalWishlists = wishlists.length;
  const purchasedWishlists = wishlists.filter((w) => Boolean(w.isPurchased)).length;
  const pendingWishlists = totalWishlists - purchasedWishlists;
  const wishlistProgressPct = totalWishlists > 0 ? Math.round((purchasedWishlists / totalWishlists) * 100) : 0;
  const totalWishlistPrice = wishlists.reduce((sum, w) => sum + (w.price || 0), 0);

  const totalCombined = totalActivities + totalWishlists;
  const totalDoneCombined = completedActivities + purchasedWishlists;
  const overallProgressPct = totalCombined > 0 ? Math.round((totalDoneCombined / totalCombined) * 100) : 0;

  // --- Radar Coordinates & Metrics ---
  const radarAxes = useMemo(() => {
    const maxVal = Math.max(completedActivities, purchasedWishlists, pendingWishlists, pendingActivities, 1);
    const R = 80;
    const cx = 170;
    const cy = 125;

    const northVal = completedActivities;
    const eastVal = purchasedWishlists;
    const southVal = pendingWishlists;
    const westVal = pendingActivities;

    const northY = cy - (northVal > 0 ? Math.max((northVal / maxVal) * R, 12) : 0);
    const eastX = cx + (eastVal > 0 ? Math.max((eastVal / maxVal) * R, 12) : 0);
    const southY = cy + (southVal > 0 ? Math.max((southVal / maxVal) * R, 12) : 0);
    const westX = cx - (westVal > 0 ? Math.max((westVal / maxVal) * R, 12) : 0);

    return {
      cx,
      cy,
      R,
      maxVal,
      north: { id: 'north', label: 'Agenda Selesai', count: northVal, x: cx, y: northY, color: '#10b981', bg: 'bg-emerald-500' },
      east: { id: 'east', label: 'Wishlist Terbeli', count: eastVal, x: eastX, y: cy, color: '#06b6d4', bg: 'bg-cyan-500' },
      south: { id: 'south', label: 'Wishlist Rencana', count: southVal, x: cx, y: southY, color: '#f43f5e', bg: 'bg-rose-500' },
      west: { id: 'west', label: 'Agenda Tertunda', count: westVal, x: westX, y: cy, color: '#6366f1', bg: 'bg-indigo-500' },
      pointsString: `${cx},${northY} ${eastX},${cy} ${cx},${southY} ${westX},${cy}`
    };
  }, [completedActivities, purchasedWishlists, pendingWishlists, pendingActivities]);

  // --- Filtered and Combined Content List ---
  const unifiedItems: UnifiedItem[] = useMemo(() => {
    const list: UnifiedItem[] = [];

    // Filter Activities
    if (currentType === 'all' || currentType === 'agenda') {
      activities.forEach((a) => {
        const isDone = a.status === 'completed';
        if (statusFilter === 'pending' && isDone) return;
        if (statusFilter === 'completed' && !isDone) return;
        list.push({ itemType: 'activity', data: a });
      });
    }

    // Filter Wishlists
    if (currentType === 'all' || currentType === 'wishlist') {
      wishlists.forEach((w) => {
        const isDone = Boolean(w.isPurchased);
        if (statusFilter === 'pending' && isDone) return;
        if (statusFilter === 'completed' && !isDone) return;
        list.push({ itemType: 'wishlist', data: w });
      });
    }

    // Sort: Pending items on top, completed at bottom. Secondary sort by date/month
    return list.sort((a, b) => {
      const aDone = a.itemType === 'activity' ? a.data.status === 'completed' : Boolean(a.data.isPurchased);
      const bDone = b.itemType === 'activity' ? b.data.status === 'completed' : Boolean(b.data.isPurchased);
      if (aDone !== bDone) {
        return aDone ? 1 : -1;
      }
      const aDate = a.itemType === 'activity' ? a.data.deadline : a.data.month;
      const bDate = b.itemType === 'activity' ? b.data.deadline : b.data.month;
      return (aDate || '').localeCompare(bDate || '');
    });
  }, [activities, wishlists, currentType, statusFilter]);

  return (
    <div className="flex flex-col gap-6" id="view-activities">
      {/* =======================================================
          1. FILTER BAR (DIPALING ATAS): TIPE & STATUS MENYATU
         ======================================================= */}
      <div className="flex items-center justify-end w-full">
        <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          {/* Tipe Selector: Semua, Agenda Kerja, Wishlist */}
          <div className={filterBtnClass}>
            <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">
              Tipe:
            </span>
            <div className="relative flex items-center min-w-0 flex-1 justify-end">
              <select
                value={currentType}
                onChange={(e) => handleTypeChange(e.target.value as 'all' | 'agenda' | 'wishlist')}
                className="text-[11px] sm:text-xs font-bold bg-transparent border-none text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer py-0 pl-1 pr-4 min-w-0 w-full truncate text-right appearance-none"
              >
                <option value="all">Semua</option>
                <option value="agenda">Agenda Kerja</option>
                <option value="wishlist">Daftar Keinginan</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none absolute right-0 shrink-0" />
            </div>
          </div>

          {/* Status Selector Dropdown Card (Menyatu Secara Cerdas) */}
          <div className={filterBtnClass}>
            <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">
              Status:
            </span>
            <div className="relative flex items-center min-w-0 flex-1 justify-end">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-[11px] sm:text-xs font-bold bg-transparent border-none text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer py-0 pl-1 pr-4 min-w-0 w-full truncate text-right appearance-none"
              >
                <option value="all">Semua Status</option>
                {currentType === 'agenda' ? (
                  <>
                    <option value="pending">Belum Selesai</option>
                    <option value="completed">Selesai</option>
                  </>
                ) : currentType === 'wishlist' ? (
                  <>
                    <option value="pending">Rencana (Belum Terbeli)</option>
                    <option value="completed">Sudah Terbeli</option>
                  </>
                ) : (
                  <>
                    <option value="pending">Belum Selesai / Rencana</option>
                    <option value="completed">Selesai / Terbeli</option>
                  </>
                )}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none absolute right-0 shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* =======================================================
          2. CARD RINGKASAN (SUMMARY CARDS SEJAJAR 3 KOLOM)
         ======================================================= */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
        {/* Card Ringkasan 1: Agenda Kerja */}
        <div className={`${getCardClasses()} p-2.5 sm:p-4 flex flex-col justify-between relative overflow-hidden transition-all`}>
          <div className="flex items-start justify-between gap-1 sm:gap-2 mb-1.5 sm:mb-2.5">
            <div className="min-w-0">
              <span className="text-[8.5px] sm:text-[10px] font-extrabold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 block truncate mb-0.5">
                Agenda
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-base sm:text-2xl font-black text-slate-800 dark:text-slate-100">
                  {totalActivities}
                </span>
                <span className="text-[9px] sm:text-xs font-semibold text-slate-400 hidden xs:inline">tugas</span>
              </div>
            </div>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
              <CheckSquare className="w-3.5 h-3.5 sm:w-5 sm:h-5 stroke-[2.2]" />
            </div>
          </div>

          <div className="flex flex-col gap-1 sm:gap-1.5 pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-[9px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-0.5 sm:gap-1 truncate">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="hidden sm:inline">Selesai:</span> <strong className="text-slate-700 dark:text-slate-200">{completedActivities}</strong>
              </span>
              <span className="flex items-center gap-0.5 sm:gap-1 truncate">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-indigo-400 shrink-0" />
                <span className="hidden sm:inline">Tunda:</span> <strong className="text-slate-700 dark:text-slate-200">{pendingActivities}</strong>
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 sm:h-1.5 overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${activityProgressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card Ringkasan 2: Wishlist (Daftar Keinginan) */}
        <div className={`${getCardClasses()} p-2.5 sm:p-4 flex flex-col justify-between relative overflow-hidden transition-all`}>
          <div className="flex items-start justify-between gap-1 sm:gap-2 mb-1.5 sm:mb-2.5">
            <div className="min-w-0">
              <span className="text-[8.5px] sm:text-[10px] font-extrabold uppercase tracking-wider text-rose-500 dark:text-rose-400 block truncate mb-0.5">
                Wishlist
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-base sm:text-2xl font-black text-slate-800 dark:text-slate-100">
                  {totalWishlists}
                </span>
                <span className="text-[9px] sm:text-xs font-semibold text-slate-400 hidden xs:inline">barang</span>
              </div>
            </div>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-xs">
              <ShoppingBag className="w-3.5 h-3.5 sm:w-5 sm:h-5 stroke-[2.2]" />
            </div>
          </div>

          <div className="flex flex-col gap-1 sm:gap-1.5 pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-[9px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-0.5 sm:gap-1 truncate">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-500 shrink-0" />
                <span className="hidden sm:inline">Terbeli:</span> <strong className="text-slate-700 dark:text-slate-200">{purchasedWishlists}</strong>
              </span>
              <span className="flex items-center gap-0.5 sm:gap-1 truncate">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-400 shrink-0" />
                <span className="hidden sm:inline">Rencana:</span> <strong className="text-slate-700 dark:text-slate-200">{pendingWishlists}</strong>
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 sm:h-1.5 overflow-hidden">
              <div 
                className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${wishlistProgressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card Ringkasan 3: Progres Keseluruhan */}
        <div className={`${getCardClasses()} p-2.5 sm:p-4 flex flex-col justify-between relative overflow-hidden transition-all`}>
          <div className="flex items-start justify-between gap-1 sm:gap-2 mb-1.5 sm:mb-2.5">
            <div className="min-w-0">
              <span className="text-[8.5px] sm:text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block truncate mb-0.5">
                Progres
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-base sm:text-2xl font-black text-slate-800 dark:text-slate-100">
                  {overallProgressPct}%
                </span>
                <span className="text-[9px] sm:text-xs font-semibold text-slate-400 hidden xs:inline">tercapai</span>
              </div>
            </div>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
              <Target className="w-3.5 h-3.5 sm:w-5 sm:h-5 stroke-[2.2]" />
            </div>
          </div>

          <div className="flex flex-col gap-1 sm:gap-1.5 pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-[9px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <span className="truncate font-mono">
                <strong className="text-emerald-600 dark:text-emerald-400">{totalDoneCombined}</strong>/{totalCombined}
              </span>
              <span className="text-[8.5px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                {overallProgressPct}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 sm:h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${overallProgressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* =======================================================
          3. VISUALISASI GRAFIK AKTIVITAS DAN WISHLIST: RADAR POLIGON (SPIDER WEB)
         ======================================================= */}
      <div className={`${getCardClasses()} p-4 sm:p-6 transition-all`}>
        <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 mb-2 sm:mb-3">
          Grafik Aktivitas dan Wishlist
        </h4>

        {totalCombined === 0 ? (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-1.5">
            <span className="text-xs font-semibold">Belum ada agenda kerja atau daftar keinginan</span>
            <span className="text-[11px] text-slate-400">Tambahkan data untuk melihat grafik radar aktivitas</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* SVG Radar Poligon Web */}
            <div className="relative w-full max-w-[340px] aspect-[340/250] flex items-center justify-center my-1">
              <svg viewBox="0 0 340 250" className="w-full h-full overflow-visible">
                <defs>
                  {/* Gradasi Lembut Poligon Radar */}
                  <radialGradient id="radarPolyGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.38" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.08" />
                  </radialGradient>
                </defs>

                {/* Concentric Web Rings (Level 25%, 50%, 75%, 100%) */}
                {[0.25, 0.5, 0.75, 1.0].map((lvl, index) => {
                  const r = radarAxes.R * lvl;
                  const pts = `${radarAxes.cx},${radarAxes.cy - r} ${radarAxes.cx + r},${radarAxes.cy} ${radarAxes.cx},${radarAxes.cy + r} ${radarAxes.cx - r},${radarAxes.cy}`;
                  return (
                    <polygon
                      key={`ring-${index}`}
                      points={pts}
                      fill="none"
                      stroke="currentColor"
                      className="text-slate-200 dark:text-slate-800"
                      strokeWidth={lvl === 1.0 ? '1.2' : '0.8'}
                      strokeDasharray={lvl === 1.0 ? 'none' : '3 3'}
                    />
                  );
                })}

                {/* Sumbu Salib Koordinat (Cross Axes) */}
                <line
                  x1={radarAxes.cx}
                  y1={radarAxes.cy - radarAxes.R - 5}
                  x2={radarAxes.cx}
                  y2={radarAxes.cy + radarAxes.R + 5}
                  stroke="currentColor"
                  className="text-slate-300 dark:text-slate-700"
                  strokeWidth="1.2"
                />
                <line
                  x1={radarAxes.cx - radarAxes.R - 5}
                  y1={radarAxes.cy}
                  x2={radarAxes.cx + radarAxes.R + 5}
                  y2={radarAxes.cy}
                  stroke="currentColor"
                  className="text-slate-300 dark:text-slate-700"
                  strokeWidth="1.2"
                />

                {/* Pusat Radar */}
                <circle cx={radarAxes.cx} cy={radarAxes.cy} r="3" fill="#6366f1" />

                {/* Poligon Data Radar */}
                <polygon
                  points={radarAxes.pointsString}
                  fill="url(#radarPolyGradient)"
                  stroke="#6366f1"
                  strokeWidth="2.2"
                  className="transition-all duration-500 drop-shadow-sm"
                />

                {/* 4 Titik Sudut / Node Interaktif */}
                {[radarAxes.north, radarAxes.east, radarAxes.south, radarAxes.west].map((node) => {
                  const isHovered = hoveredAxis === node.id;
                  return (
                    <g 
                      key={node.id} 
                      className="cursor-pointer transition-transform duration-200"
                      onMouseEnter={() => setHoveredAxis(node.id)}
                      onMouseLeave={() => setHoveredAxis(null)}
                    >
                      {/* Outer pulse circle when hovered */}
                      {isHovered && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="10"
                          fill={node.color}
                          fillOpacity="0.25"
                          className="animate-ping"
                        />
                      )}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isHovered ? 6 : 4.5}
                        fill={node.color}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        className="transition-all duration-200"
                      />
                    </g>
                  );
                })}

                {/* Label Sumbu Luar */}
                {/* 1. Atas: Agenda Selesai */}
                <text
                  x={radarAxes.cx}
                  y="20"
                  textAnchor="middle"
                  className="text-[10px] sm:text-[11px] font-bold fill-slate-700 dark:fill-slate-200"
                >
                  Agenda Selesai
                </text>
                <text
                  x={radarAxes.cx}
                  y="33"
                  textAnchor="middle"
                  className="text-[9.5px] font-mono font-bold fill-emerald-600 dark:fill-emerald-400"
                >
                  {completedActivities} tugas
                </text>

                {/* 2. Kanan: Wishlist Terbeli */}
                <text
                  x={radarAxes.cx + radarAxes.R + 12}
                  y={radarAxes.cy - 3}
                  textAnchor="start"
                  className="text-[10px] sm:text-[11px] font-bold fill-slate-700 dark:fill-slate-200"
                >
                  Wishlist Terbeli
                </text>
                <text
                  x={radarAxes.cx + radarAxes.R + 12}
                  y={radarAxes.cy + 10}
                  textAnchor="start"
                  className="text-[9.5px] font-mono font-bold fill-cyan-600 dark:fill-cyan-400"
                >
                  {purchasedWishlists} barang
                </text>

                {/* 3. Bawah: Wishlist Rencana */}
                <text
                  x={radarAxes.cx}
                  y={radarAxes.cy + radarAxes.R + 24}
                  textAnchor="middle"
                  className="text-[10px] sm:text-[11px] font-bold fill-slate-700 dark:fill-slate-200"
                >
                  Wishlist Rencana
                </text>
                <text
                  x={radarAxes.cx}
                  y={radarAxes.cy + radarAxes.R + 37}
                  textAnchor="middle"
                  className="text-[9.5px] font-mono font-bold fill-rose-600 dark:fill-rose-400"
                >
                  {pendingWishlists} barang
                </text>

                {/* 4. Kiri: Agenda Tertunda */}
                <text
                  x={radarAxes.cx - radarAxes.R - 12}
                  y={radarAxes.cy - 3}
                  textAnchor="end"
                  className="text-[10px] sm:text-[11px] font-bold fill-slate-700 dark:fill-slate-200"
                >
                  Agenda Tertunda
                </text>
                <text
                  x={radarAxes.cx - radarAxes.R - 12}
                  y={radarAxes.cy + 10}
                  textAnchor="end"
                  className="text-[9.5px] font-mono font-bold fill-indigo-600 dark:fill-indigo-400"
                >
                  {pendingActivities} tugas
                </text>
              </svg>
            </div>

            {/* 4 Kartu Metrik Kuadran di Bawah Radar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/80">
              {[
                { id: 'north', label: 'Agenda Selesai', count: completedActivities, color: 'bg-emerald-500', textCol: 'text-emerald-600 dark:text-emerald-400' },
                { id: 'west', label: 'Agenda Tertunda', count: pendingActivities, color: 'bg-indigo-500', textCol: 'text-indigo-600 dark:text-indigo-400' },
                { id: 'east', label: 'Wishlist Terbeli', count: purchasedWishlists, color: 'bg-cyan-500', textCol: 'text-cyan-600 dark:text-cyan-400' },
                { id: 'south', label: 'Wishlist Rencana', count: pendingWishlists, color: 'bg-rose-500', textCol: 'text-rose-600 dark:text-rose-400' }
              ].map((m) => {
                const isHovered = hoveredAxis === m.id;
                const pct = totalCombined > 0 ? Math.round((m.count / totalCombined) * 100) : 0;
                return (
                  <div
                    key={m.id}
                    onMouseEnter={() => setHoveredAxis(m.id)}
                    onMouseLeave={() => setHoveredAxis(null)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isHovered
                        ? 'bg-slate-50 dark:bg-slate-800 border-indigo-300 dark:border-indigo-600 scale-[1.02]'
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${m.color}`} />
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate">
                        {m.label}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className={`text-base font-black font-mono ${m.textCol}`}>
                        {m.count}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* =======================================================
          4. LIST KONTEN ITEM GABUNGAN / TERFILTER
         ======================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {unifiedItems.length === 0 ? (
          <div className="col-span-full py-14 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Bookmark className="w-8 h-8 text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {totalCombined === 0
                ? 'Belum ada agenda kerja maupun daftar keinginan.'
                : 'Tidak ada item yang sesuai dengan filter yang dipilih.'}
            </p>
            <p className="text-xs text-slate-400">
              Gunakan menu Tambah Data untuk menjadwalkan agenda atau wishlist baru.
            </p>
          </div>
        ) : (
          unifiedItems.map((item) => {
            if (item.itemType === 'activity') {
              const a = item.data;
              const isDone = a.status === 'completed';

              return (
                <div 
                  key={`act-${a.id}`} 
                  className={getCardClasses() + ` p-4 flex flex-col gap-3 transition-all duration-300 ${
                    isDone 
                      ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/40 grayscale-[0.4]' 
                      : 'hover:border-indigo-200 dark:hover:border-indigo-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button 
                      type="button"
                      onClick={() => handleToggleActivity(a.id)} 
                      className={`shrink-0 mt-0.5 transition cursor-pointer ${
                        isDone ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700 hover:text-indigo-400'
                      }`}
                      title={isDone ? 'Tandai belum selesai' : 'Tandai selesai'}
                    >
                      {isDone ? (
                        <CheckCircle className="w-5 h-5 fill-emerald-50 dark:fill-emerald-950/30" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-sm leading-snug transition truncate ${
                        isDone ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {a.title}
                      </h4>
                      {a.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {a.description}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <button 
                        type="button"
                        onClick={() => onEditActivity(a)} 
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition cursor-pointer"
                        title="Edit agenda"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleDeleteActivity(a.id)} 
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                        title="Hapus agenda"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Footer Tag & Date */}
                  <div className="flex items-center justify-between pt-2 mt-auto border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {a.deadline 
                          ? new Date(a.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                          : '-'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Type Badge: Agenda */}
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold uppercase tracking-wider">
                        <Bookmark className="w-2.5 h-2.5" />
                        <span>Agenda</span>
                      </span>

                      {/* Status Pill */}
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest ${
                        isDone ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {isDone ? 'Selesai' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            } else {
              // Wishlist item
              const w = item.data;
              const isPurchased = Boolean(w.isPurchased);

              return (
                <div 
                  key={`wish-${w.id}`} 
                  className={getCardClasses() + ` p-4 flex flex-col gap-3 transition-all duration-300 ${
                    isPurchased 
                      ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/40 grayscale-[0.4]' 
                      : 'hover:border-rose-200 dark:hover:border-rose-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button 
                      type="button"
                      onClick={() => handleToggleWishlist(w.id)} 
                      className={`shrink-0 mt-0.5 transition cursor-pointer ${
                        isPurchased ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700 hover:text-rose-400'
                      }`}
                      title={isPurchased ? 'Tandai belum terbeli' : 'Tandai terbeli'}
                    >
                      {isPurchased ? (
                        <CheckCircle className="w-5 h-5 fill-emerald-50 dark:fill-emerald-950/30" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-sm leading-snug transition truncate ${
                        isPurchased ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {w.title}
                      </h4>
                      <div className="flex flex-col gap-0.5 mt-1">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                          Target: {w.month}
                        </p>
                        {w.price ? (
                          <p className="text-[10.5px] font-mono text-rose-500 dark:text-rose-400 font-bold">
                            {formatIDR(w.price)}
                          </p>
                        ) : null}
                        {w.notes && (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 italic line-clamp-1">
                            "{w.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <button 
                        type="button"
                        onClick={() => onEditWishlist(w)} 
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                        title="Edit wishlist"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleDeleteWishlist(w.id)} 
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                        title="Hapus wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Footer Tag & Type */}
                  <div className="flex items-center justify-between pt-2 mt-auto border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <ShoppingBag className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {w.month || 'Target'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Type Badge: Wishlist */}
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[9px] font-bold uppercase tracking-wider">
                        <WishlistIcon className="w-2.5 h-2.5 fill-current" />
                        <span>Wishlist</span>
                      </span>

                      {/* Status Pill */}
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest ${
                        isPurchased ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {isPurchased ? 'Terbeli' : 'Rencana'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
          })
        )}
      </div>
    </div>
  );
};
