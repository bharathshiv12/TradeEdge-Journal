import React, { useState, useMemo } from "react";
import { 
  Calendar, 
  ChevronRight, 
  Sparkles, 
  ArrowUpRight, 
  Info,
  Layers,
  CheckCircle,
  HelpCircle,
  FileText
} from "lucide-react";
import { CalendarDailyStats } from "../types";

interface CalendarMapProps {
  calendarData: CalendarDailyStats[];
  currency: string;
}

export default function CalendarMap({ calendarData, currency }: CalendarMapProps) {
  
  // Custom states
  const [hoveredDay, setHoveredDay] = useState<CalendarDailyStats | null>(null);
  const [selectedDay, setSelectedDay] = useState<CalendarDailyStats | null>(null);

  // Formatting helpers
  const formatVal = (val: number) => {
    const symbolMap: Record<string, string> = { USD: "$", EUR: "€", INR: "₹", GBP: "£" };
    const prefix = symbolMap[currency] || "$";
    return `${val >= 0 ? "+" : ""}${prefix}${Math.abs(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  // We design for May 2026
  const Year = 2026;
  const Month = 4; // May (0-indexed represents May in UTC standard loops or customize)
  const MonthDaysCount = 31;
  const StartDayOffset = 5; // May 1st, 2026 starts on Friday (5 in UTC / offset mapping)

  // Generate calendar dates for May 2026
  const CalendarCellsOfMay = useMemo(() => {
    const cells = [];
    
    // Empty padded offsets
    for (let i = 0; i < StartDayOffset; i++) {
      cells.push({ empty: true, dateString: "" });
    }

    // Days mapping
    for (let day = 1; day <= MonthDaysCount; day++) {
      const dayStr = `${Year}-05-${day.toString().padStart(2, '0')}`;
      const statsObj = calendarData.find((d) => d.date === dayStr) || {
        date: dayStr,
        pnl: 0,
        tradeCount: 0,
        assets: [],
        leverageAvg: 0,
        rrRatio: 0
      };

      cells.push({
        empty: false,
        day,
        dateString: dayStr,
        stats: statsObj
      });
    }

    return cells;
  }, [calendarData]);

  // consistency calculation
  const calendarMetrics = useMemo(() => {
    const activeDays = calendarData.filter((d) => d.tradeCount > 0);
    const profitDays = activeDays.filter((d) => d.pnl > 0);
    const winRate = activeDays.length > 0 ? Math.round((profitDays.length / activeDays.length) * 100) : 0;
    
    let totalMonthlyPnl = 0;
    calendarData.forEach((d) => {
      totalMonthlyPnl += d.pnl;
    });

    return {
      activeDaysCount: activeDays.length,
      profitDaysCount: profitDays.length,
      consistencyScore: winRate,
      totalMonthlyPnl
    };
  }, [calendarData]);

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-medium text-slate-100 tracking-tight">
          Performance Calendar Cockpit
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Review daily yields. Hover cells to evaluate statistics or map historical journals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Calendar Grid (2 Columns) */}
        <div className="lg:col-span-2 rounded-2xl glass-panel p-6 shadow-xl space-y-5">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-lg font-display font-semibold text-slate-200 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" /> May 2026
            </h2>
            
            <div className="flex gap-4 items-center text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/40"></span> Profit Day</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500/20 border border-rose-500/40"></span> Loss Day</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-white/5 border border-white/10"></span> Flat/No Trade</span>
            </div>
          </div>

          {/* Calendar Heatmap Wrapper */}
          <div className="relative pt-2">
            
            {/* Week days titles header */}
            <div className="grid grid-cols-7 gap-2.5 text-center text-[10px] text-slate-400 font-semibold tracking-wider uppercase mb-3 select-none font-sans">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Grid Days core */}
            <div className="grid grid-cols-7 gap-2.5 select-none">
              {CalendarCellsOfMay.map((cell, idx) => {
                if (cell.empty) {
                  return <div key={idx} className="aspect-square rounded-xl bg-white/5 opacity-10"></div>;
                }

                const dayStats = cell.stats;
                const active = dayStats.tradeCount > 0;
                const isWinner = dayStats.pnl > 0;
                const isLoser = dayStats.pnl < 0;

                // Cellular style formatting based on performance
                let cellStyle = "bg-white/5 border border-white/5 hover:border-white/20 text-slate-400";
                if (active) {
                  if (isWinner) {
                    cellStyle = "bg-emerald-950/25 border-emerald-500/40 hover:border-emerald-400 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.05)]";
                  } else if (isLoser) {
                    cellStyle = "bg-rose-950/25 border-rose-500/45 hover:border-rose-400 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.05)]";
                  }
                }

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => active && setHoveredDay(dayStats)}
                    onMouseLeave={() => setHoveredDay(null)}
                    onClick={() => active && setSelectedDay(dayStats)}
                    className={`aspect-square rounded-2xl flex flex-col justify-between p-2 cursor-pointer transition-all duration-150 relative ${cellStyle}`}
                  >
                    <span className="text-xs font-bold font-mono">{cell.day}</span>
                    {active && (
                      <span className="text-[10px] font-bold font-display truncate">
                        {formatVal(dayStats.pnl).split(".")[0]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

          <div className="text-xs text-slate-500 font-mono mt-2 text-center pb-1">
            * Tap active performance days to reveal micro-ledger entries.
          </div>

        </div>

        {/* Performance Sidebar stats (1 Column) */}
        <div className="space-y-6">
          
          {/* Dynamic popover block upon hover or default select */}
          {(hoveredDay || selectedDay) ? (
            <div className="rounded-2xl bg-gradient-to-b from-[#121026] to-[#05070A] border border-purple-500/35 p-5 shadow-2xl space-y-4 animate-slideLeft">
              <div className="border-b border-purple-500/10 pb-2.5 flex justify-between items-center text-slate-200">
                <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider font-mono">
                  {new Date((hoveredDay || selectedDay)!.date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-950/50 text-purple-300 border border-purple-500/10 uppercase font-mono">
                  Daily Log
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                
                <div className="flex justify-between">
                  <span className="text-slate-400">Realized Day P&L</span>
                  <strong className={`font-display text-sm ${(hoveredDay || selectedDay)!.pnl >= 0 ? "text-emerald-400" : "text-rose-500"}`}>
                    {formatVal((hoveredDay || selectedDay)!.pnl)}
                  </strong>
                </div>

                <div className="flex justify-between border-t border-white/5 pt-3">
                  <span className="text-slate-400">Trades executed</span>
                  <span className="font-mono text-slate-200">{(hoveredDay || selectedDay)!.tradeCount} fill entries</span>
                </div>

                <div className="flex justify-between border-t border-white/5 pt-3">
                  <span className="text-slate-400">Market segments</span>
                  <span className="text-slate-300 truncate max-w-[150px]">
                    {(hoveredDay || selectedDay)!.assets.join(", ") || "None"}
                  </span>
                </div>

                <div className="flex justify-between border-t border-white/5 pt-3">
                  <span className="text-slate-400">Leverage Average</span>
                  <span className="font-mono text-slate-200">{(hoveredDay || selectedDay)!.leverageAvg}x</span>
                </div>

                {(hoveredDay || selectedDay)!.notes && (
                  <div className="border-t border-white/5 pt-3.5">
                    <span className="text-slate-400 block pb-1">Retrospective notes</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed italic bg-black/35 p-2.5 rounded-lg border border-white/5">
                      &ldquo;{(hoveredDay || selectedDay)!.notes}&rdquo;
                    </p>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="rounded-2xl glass-panel p-5 text-center text-slate-500 text-xs py-10 flex flex-col items-center gap-2">
              <Info className="w-8 h-8 text-slate-600 animate-bounce" style={{ animationDuration: '4s' }} />
              Hover or Select active cells to review diagnostic feedback popovers.
            </div>
          )}

          {/* Core Analytics parameters */}
          <div className="rounded-2xl glass-panel p-5 shadow-xl space-y-5">
            <h3 className="text-sm font-display font-semibold text-slate-200 border-b border-white/5 pb-3 uppercase tracking-widest">
              Monthly overview stats
            </h3>

            <div className="space-y-4">
              
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Net Monthly P&L</span>
                <span className={`font-mono font-bold ${calendarMetrics.totalMonthlyPnl >= 0 ? "text-[#10b981]" : "text-[#f43f5e]"}`}>
                  {formatVal(calendarMetrics.totalMonthlyPnl)}
                </span>
              </div>

              <div className="flex justify-between text-xs pt-1 border-t border-white/5">
                <span className="text-slate-400">Active trading sessions</span>
                <span className="font-mono text-slate-200 font-semibold">{calendarMetrics.activeDaysCount} Days</span>
              </div>

              {/* Consistency Slider radial marker */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>CONSISTENCY EFFICIENCY SCORE</span>
                  <span className="text-purple-400 font-bold text-glow-purple">{calendarMetrics.consistencyScore}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full"
                    style={{ width: `${calendarMetrics.consistencyScore}%` }}
                  ></div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
