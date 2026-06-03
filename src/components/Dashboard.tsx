import React, { useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Trophy, 
  Percent, 
  Clock, 
  Coins, 
  ArrowUpRight, 
  ExternalLink,
  Sparkles,
  PlusCircle
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Legend 
} from "recharts";
import { Trade, Strategy } from "../types";

interface DashboardProps {
  trades: Trade[];
  strategies: Strategy[];
  accountSize: number;
  currency: string;
  onNavigate: (tab: string) => void;
  theme?: string;
  userName?: string;
}

export default function Dashboard({ trades, strategies, accountSize, currency, onNavigate, theme = "dark-navy", userName = "Alexander Edge" }: DashboardProps) {
  
  // Dynamic stroke color based on theme
  const chartStroke = useMemo(() => {
    switch (theme) {
      case "neon-purple": return "#a855f7";
      case "green-terminal": return "#10b981";
      case "light": return "#2563eb";
      case "cyberpunk": return "#ec4899";
      case "minimal-dark": return "#71717a";
      case "dark-navy":
      default:
        return "#06b6d4";
    }
  }, [theme]);

  // 1. Calculations
  const stats = useMemo(() => {
    const closedTrades = trades.filter((t) => t.status === "CLOSED");
    const totalTradesCount = trades.length;
    const closedTradesCount = closedTrades.length;
    
    let totalPnl = 0;
    let winCount = 0;
    let bestTrade = 0;
    
    closedTrades.forEach((t) => {
      totalPnl += t.pnl;
      if (t.pnl > 0) winCount++;
      if (t.pnl > bestTrade) bestTrade = t.pnl;
    });

    const winRate = closedTradesCount > 0 ? Math.round((winCount / closedTradesCount) * 100) : 0;
    
    return {
      totalPnl,
      winRate,
      totalTradesCount,
      closedTradesCount,
      bestTrade,
    };
  }, [trades]);

  // 2. Formatting Helpers
  const formatVal = (val: number) => {
    const symbolMap: Record<string, string> = { USD: "$", EUR: "€", INR: "₹", GBP: "£" };
    const prefix = symbolMap[currency] || "$";
    return `${val >= 0 ? "+" : ""}${prefix}${Math.abs(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusColor = (val: number) => {
    if (val > 0) return "text-emerald-400";
    if (val < 0) return "text-rose-500";
    return "text-slate-400";
  };

  // 3. Recharts - Equity Curve Chart Generation
  const equityCurveData = useMemo(() => {
    // Sort closed trades chronological
    const closed = [...trades]
      .filter((t) => t.status === "CLOSED")
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let runningEquity = accountSize;
    const data = [{ name: "Start", Equity: runningEquity, pnl: 0 }];

    closed.forEach((t) => {
      runningEquity += t.pnl;
      data.push({
        name: new Date(t.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        Equity: Number(runningEquity.toFixed(2)),
        pnl: t.pnl
      });
    });

    return data;
  }, [trades, accountSize]);

  // 4. Recharts - Daily P&L Chart Generation
  const dailyPnlData = useMemo(() => {
    const map: Record<string, number> = {};
    trades.forEach((t) => {
      if (t.status === "CLOSED") {
        const dateStr = new Date(t.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
        map[dateStr] = (map[dateStr] || 0) + t.pnl;
      }
    });

    return Object.keys(map).map((k) => ({
      date: k,
      PnL: Number(map[k].toFixed(2))
    })).slice(-7).reverse(); // Keep last 7 days sorted
  }, [trades]);

  // 5. Recharts - Win vs Loss Distribution
  const winLossData = useMemo(() => {
    const closed = trades.filter((t) => t.status === "CLOSED");
    let wins = 0;
    let losses = 0;

    closed.forEach((t) => {
      if (t.pnl > 0) wins++;
      else if (t.pnl < 0) losses++;
    });

    return [
      { name: "Wins", value: wins, color: "#10b981" },
      { name: "Losses", value: losses, color: "#ef4444" }
    ];
  }, [trades]);

  // 6. Recharts - P&L aggregated by symbol
  const symbolStatsData = useMemo(() => {
    const sumMap: Record<string, number> = {};
    trades.forEach((t) => {
      if (t.status === "CLOSED") {
        sumMap[t.symbol] = (sumMap[t.symbol] || 0) + t.pnl;
      }
    });

    return Object.keys(sumMap).map((sym) => ({
      symbol: sym,
      pnl: Number(sumMap[sym].toFixed(2))
    })).sort((a,b) => b.pnl - a.pnl);
  }, [trades]);

  // 7. PieChart for Asset distribution
  const assetDistributionData = useMemo(() => {
    const map: Record<string, number> = {};
    trades.forEach((t) => {
      map[t.assetType] = (map[t.assetType] || 0) + 1;
    });

    const colors = ["#a855f7", "#06b6d4", "#f59e0b", "#3b82f6", "#10b981"];
    
    return Object.keys(map).map((k, i) => ({
      name: k,
      value: map[k],
      color: colors[i % colors.length]
    }));
  }, [trades]);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner Personalized for the user */}
      <div className="relative rounded-2xl overflow-hidden glass-panel p-6 border border-white/5 bg-gradient-to-r from-indigo-950/20 via-slate-900/40 to-cyan-950/15 shadow-2x transition-all hover:border-cyan-500/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold bg-cyan-950/50 border border-cyan-500/35 px-2.5 py-1 rounded-md">
                Active Session Cockpit
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-semibold bg-purple-950/40 border border-purple-500/25 px-2.5 py-1 rounded-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> PRO Tier
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-medium text-slate-100 tracking-tight mt-3">
              Welcome back, <span className="font-semibold text-white text-glow-blue underline decoration-cyan-500/25 decoration-2 underline-offset-4">{userName}</span>
            </h1>
            <p className="text-slate-400 text-sm mt-2 max-w-2xl font-sans leading-relaxed">
              Real-time multi-asset optimization intelligence workspace. Keep tracking of performance metrics, strategy protocols, and secure localized ledger data.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-mono text-slate-400 border border-slate-800 bg-slate-950/40 rounded-xl px-3.5 py-2.5 flex items-center gap-2 select-none shadow-sm h-11">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Node Connected
            </span>
            <button 
              id="quick-add-trade"
              onClick={() => onNavigate("add-trade")}
              className="h-11 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold shadow-[0_4px_20px_rgba(6,182,212,0.3)] hover:shadow-[0_4px_25px_rgba(6,182,212,0.45)] transition-all flex items-center gap-2 border border-cyan-400/20 cursor-pointer hover:scale-[1.01]"
            >
              <PlusCircle className="w-4 h-4" /> Journal Trade
            </button>
          </div>
        </div>
      </div>

      {/* 4 CORE KPI CARDS CAROUSEL GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total P&L Card */}
        <div className="rounded-2xl glass-panel p-5 relative overflow-hidden group hover:border-[#a855f7]/30 transition-all duration-300 shadow-xl">
          <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-10 transition-opacity">
            <Coins className="w-24 h-24 text-slate-100" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs tracking-wider uppercase font-semibold">Total Net P&L</span>
            <span className={`p-1.5 rounded-lg bg-slate-900/80 border border-[#1e293b] text-slate-400`}>
              {stats.totalPnl >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
            </span>
          </div>
          <div className="mt-4">
            <h3 className={`text-2xl md:text-3xl font-display font-bold ${getStatusColor(stats.totalPnl)} text-glow-purple`}>
              {formatVal(stats.totalPnl)}
            </h3>
            <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1">
              Current Balance: <span className="text-slate-200">${(accountSize + stats.totalPnl).toLocaleString()} USD</span>
            </p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 to-teal-500 opacity-60"></div>
        </div>

        {/* Win Rate Card */}
        <div className="rounded-2xl glass-panel p-5 relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300 shadow-xl">
          <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity className="w-24 h-24 text-slate-100" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs tracking-wider uppercase font-semibold">Win Rate Accuracy</span>
            <span className="p-1.5 rounded-lg bg-slate-900/80 border border-[#1e293b] text-cyan-400">
              <Percent className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-100 text-glow-blue">
              {stats.winRate}%
            </h3>
            <span className="text-xs text-slate-400">
              of {stats.closedTradesCount} closed entries
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1.5">
            Consistency level: <span className="text-emerald-400 font-semibold">{stats.winRate >= 50 ? "Excellent Alpha" : "Optimizable Threshold"}</span>
          </p>
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-60"></div>
        </div>

        {/* Total Trades Card */}
        <div className="rounded-2xl glass-panel p-5 relative overflow-hidden group hover:border-violet-500/30 transition-all duration-300 shadow-xl">
          <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-10 transition-opacity">
            <Clock className="w-24 h-24 text-slate-100" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs tracking-wider uppercase font-semibold">Total Trade Positions</span>
            <span className="p-1.5 rounded-lg bg-slate-900/80 border border-[#1e293b] text-violet-400">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-100">
              {stats.totalTradesCount}
            </h3>
            <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1.5">
              <span>Open: {trades.filter(t=>t.status === "OPEN").length} positions</span>
              <span className="text-slate-600">•</span>
              <span>Closed: {stats.closedTradesCount}</span>
            </p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-600 to-purple-600 opacity-60"></div>
        </div>

        {/* Best Performance Win Card */}
        <div className="rounded-2xl glass-panel p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 shadow-xl">
          <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-10 transition-opacity">
            <Trophy className="w-24 h-24 text-slate-100" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs tracking-wider uppercase font-semibold">Best Profit Position</span>
            <span className="p-1.5 rounded-lg bg-slate-900/80 border border-[#1e293b] text-yellow-500">
              <Trophy className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-emerald-400">
              {formatVal(stats.bestTrade)}
            </h3>
            <p className="text-slate-400 text-xs mt-1.5">
              Single maximum yield captured
            </p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-yellow-500 to-amber-500 opacity-60"></div>
        </div>

      </div>

      {/* PRIMARY CHARTS GRIDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. Area Chart: Equity Curve Dynamics */}
        <div className="lg:col-span-2 rounded-2xl glass-panel p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-display font-semibold text-slate-100">Performance Equity Curve</h2>
              <p className="text-slate-400 text-xs">Visualizing capital expansion cumulative growth</p>
            </div>
          </div>
          
          <div className="h-72 w-full">
            {equityCurveData.length <= 1 ? (
              <div className="h-full flex flex-col justify-center items-center text-slate-500 text-sm">
                No closed trades to compute historical curve. Add closed trades to visualize.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityCurveData} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartStroke} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={chartStroke} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--text-muted)" 
                    fontSize={11} 
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="var(--text-muted)" 
                    fontSize={11} 
                    tickLine={false} 
                    domain={['auto', 'auto']}
                    tickFormatter={(v) => `$${v.toLocaleString()}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--color-border)", borderRadius: "12px", color: "var(--text-primary)" }}
                    labelClassName="text-slate-400 text-xs"
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, "Equity Balance"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Equity" 
                    stroke={chartStroke} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorEquity)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 2. Win / Loss Accuracy Breakdowns */}
        <div className="rounded-2xl glass-panel p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-display font-semibold text-slate-100">Accuracy Win/Loss Spread</h2>
            <p className="text-slate-400 text-xs">Percentage and absolute volume efficiency</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center relative">
            {stats.closedTradesCount === 0 ? (
              <span className="text-slate-500 text-sm">Add closed positions</span>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={winLossData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {winLossData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#080b1d", borderColor: "#1e293b" }}
                      formatter={(v) => [v, "Trades Count"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Overlay Text */}
                <div className="absolute inset-x-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold font-display text-glow-purple">{stats.winRate}%</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">Win Rate</span>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-[#1e293b]/40 pt-4 text-center">
            <div className="bg-[#111827]/40 rounded-xl p-2 border border-[#1e293b]/20">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Winning Trades</span>
              <span className="text-lg font-bold text-emerald-400 font-display mt-0.5 block">
                {winLossData[0]?.value || 0}
              </span>
            </div>
            <div className="bg-[#111827]/40 rounded-xl p-2 border border-[#1e293b]/20">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Loss Entries</span>
              <span className="text-lg font-bold text-rose-500 font-display mt-0.5 block">
                {winLossData[1]?.value || 0}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* SECONDARY CHART COMBINATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 3. Daily Profit Distribution Bar graph */}
        <div className="rounded-2xl glass-panel p-5 shadow-xl space-y-4">
          <div>
            <h2 className="text-md font-display font-semibold text-slate-200">Daily Trailing P&L Log</h2>
            <p className="text-slate-400 text-xs">Profit aggregates recorded over active session days</p>
          </div>

          <div className="h-60 w-full">
            {dailyPnlData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                No active session logs found.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyPnlData}>
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--color-border)", borderRadius: "12px", color: "var(--text-primary)" }}
                    formatter={(val) => [formatVal(Number(val)), "Aggregation"]}
                  />
                  <Bar dataKey="PnL">
                    {dailyPnlData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.PnL >= 0 ? "#10b981" : "#ef4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 4. Asset Distribution breakdown Pie chart */}
        <div className="rounded-2xl glass-panel p-5 shadow-xl space-y-4">
          <div>
            <h2 className="text-md font-display font-semibold text-slate-200">Leveraged Market Segments</h2>
            <p className="text-slate-400 text-xs">Total volume mapped across Crypto, Forex, Indices & Stocks</p>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            {assetDistributionData.length === 0 ? (
              <div className="text-slate-500 text-sm">No assets recorded.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {assetDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#080b1d", borderColor: "#1e293b" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* RECENT TRADES SUMMARY cockpit table */}
      <div className="rounded-2xl glass-panel p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-md font-display font-semibold text-slate-100">Live Cockpit - Recent Journal Pages</h2>
            <p className="text-slate-400 text-xs">Track current open and recently filled risk structures</p>
          </div>
          <button 
            id="to-journal-page"
            onClick={() => onNavigate("trades")}
            className="text-xs font-semibold text-[#a855f7] hover:text-purple-400 transition-colors flex items-center gap-1.5 shrink-0"
          >
            Review Entire Ledger <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#1e293b]/40">
          <table className="w-full text-slate-300 text-left border-collapse">
            <thead>
              <tr className="bg-[#090d21] border-b border-[#1e293b]/40 text-xs uppercase tracking-wider text-slate-400 font-semibold font-sans">
                <th className="py-3 px-4">Market Symbol</th>
                <th className="py-3 px-4">Setup Type</th>
                <th className="py-3 px-4">Entry / Exit Rates</th>
                <th className="py-3 px-4">Lev Leverage</th>
                <th className="py-3 px-4">P&L Yield</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Quality Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/25 text-sm">
              {trades.slice(0, 5).map((trade) => {
                const isProfit = trade.pnl > 0;
                
                return (
                  <tr key={trade.id} className="hover:bg-[#070b1f]/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold font-display text-slate-100">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${trade.status === 'OPEN' ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`}></span>
                        {trade.symbol}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${trade.type === 'LONG' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/10' : 'bg-rose-950/40 text-rose-400 border border-rose-500/10'}`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      {trade.entryPrice} {trade.exitPrice ? `→ ${trade.exitPrice}` : " (Live tracking)"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      {trade.leverage}x
                    </td>
                    <td className={`py-3.5 px-4 font-semibold font-display ${trade.status === 'OPEN' ? 'text-cyan-400' : isProfit ? 'text-emerald-400' : 'text-rose-500'}`}>
                      {trade.status === 'OPEN' ? 'Tracking...' : formatVal(trade.pnl)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded leading-none ${trade.status === 'OPEN' ? 'bg-cyan-950/50 border border-cyan-500/30 text-cyan-400' : 'bg-slate-900 border border-[#1e293b] text-slate-400'}`}>
                        {trade.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex justify-center gap-0.5 text-yellow-500 text-xs">
                        {Array.from({ length: trade.rating || 0 }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {trades.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    No trades logged. Click &quot;Add Trade Record&quot; to begin your premium cockpit logs!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
