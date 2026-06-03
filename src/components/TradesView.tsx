import React, { useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  Trash2, 
  Grid, 
  List, 
  X, 
  Star, 
  Calendar, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Share2, 
  ExternalLink,
  Edit3,
  Check
} from "lucide-react";
import { Trade, Strategy, AssetType } from "../types";

interface TradesViewProps {
  trades: Trade[];
  strategies: Strategy[];
  currency: string;
  onUpdateTradeStatus: (id: string, exitPrice: number) => Promise<boolean>;
  onDeleteTrade: (id: string) => Promise<boolean>;
}

export default function TradesView({ 
  trades, 
  strategies, 
  currency, 
  onUpdateTradeStatus, 
  onDeleteTrade 
}: TradesViewProps) {
  
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAsset, setFilterAsset] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  
  // Close Trade modal state
  const [isClosingId, setIsClosingId] = useState<string | null>(null);
  const [closingExitPrice, setClosingExitPrice] = useState("");
  const [closingLoading, setClosingLoading] = useState(false);

  // Formatting helpers
  const formatVal = (val: number) => {
    const symbolMap: Record<string, string> = { USD: "$", EUR: "€", INR: "₹", GBP: "£" };
    const prefix = symbolMap[currency] || "$";
    return `${val >= 0 ? "+" : ""}${prefix}${Math.abs(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Filter/Sort computation
  const filteredAndSortedTrades = useMemo(() => {
    let result = [...trades];

    // Search term mapping
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (t) => 
          t.symbol.toLowerCase().includes(q) || 
          (t.notes && t.notes.toLowerCase().includes(q)) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Asset filter
    if (filterAsset !== "All") {
      result = result.filter((t) => t.assetType === filterAsset);
    }

    // Status filter
    if (filterStatus !== "All") {
      result = result.filter((t) => t.status === filterStatus);
    }

    // Sorting rules
    result.sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      if (sortBy === "date-asc") {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      if (sortBy === "pnl-desc") {
        return b.pnl - a.pnl;
      }
      if (sortBy === "pnl-asc") {
        return a.pnl - b.pnl;
      }
      if (sortBy === "rating-desc") {
        return (b.rating || 0) - (a.rating || 0);
      }
      return 0;
    });

    return result;
  }, [trades, searchTerm, filterAsset, filterStatus, sortBy]);

  // Handle Close trade action
  const executeClosingTrade = async (id: string) => {
    if (!closingExitPrice) return;
    setClosingLoading(true);
    const success = await onUpdateTradeStatus(id, parseFloat(closingExitPrice));
    setClosingLoading(false);
    if (success) {
      setIsClosingId(null);
      setClosingExitPrice("");
      // Refresh current open detail view if opened
      if (selectedTrade?.id === id) {
        setSelectedTrade(null);
      }
    }
  };

  // Find linked strategy title
  const getLinkedStrategyTitle = (stratId?: string) => {
    if (!stratId) return "No strategy framework";
    return strategies.find(s => s.id === stratId)?.title || "Custom Framework";
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-medium text-slate-100 tracking-tight">
            Trades Journal Ledger
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse structural archives, tags, ratings, and execute active trade fills securely in the cockpit sandbox.
          </p>
        </div>
      </div>

      {/* FILTER CONTROLS HUB */}
      <div className="rounded-2xl glass-panel p-5 shadow-xl grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search symbols, tags, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#05070A]/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[#a855f7]"
          />
        </div>

        {/* Filter Asset Type */}
        <div>
          <select
            value={filterAsset}
            onChange={(e) => setFilterAsset(e.target.value)}
            className="w-full bg-[#05070A]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-[#a855f7]"
          >
            <option value="All">All Assets</option>
            <option value="Crypto">Crypto</option>
            <option value="Forex">Forex</option>
            <option value="Commodities">Commodities</option>
            <option value="US Stocks">US Stocks</option>
            <option value="Indian Market">Indian Market</option>
          </select>
        </div>

        {/* Filter Status */}
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-[#05070A]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-[#a855f7]"
          >
            <option value="All">All States (Open & Closed)</option>
            <option value="OPEN">Open Positions</option>
            <option value="CLOSED">Closed Positions</option>
          </select>
        </div>

        {/* Sorting options */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-[#05070A]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-[#a855f7]"
          >
            <option value="date-desc">Chronological: Newest First</option>
            <option value="date-asc">Chronological: Oldest First</option>
            <option value="pnl-desc">PnL Profit Yield: Largest First</option>
            <option value="pnl-asc">PnL Profit Yield: Lowest First</option>
            <option value="rating-desc">Self Rating: Highest First</option>
          </select>
        </div>

      </div>

      {/* CORE TIMELINE REVOLUTION GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Ledger Column list (Spans 2 columns if item details modal is NOT open) */}
        <div className={`space-y-4 ${selectedTrade ? "xl:col-span-2" : "xl:col-span-3"}`}>
          
          <div className="flex justify-between items-center text-xs text-slate-400 px-1">
            <span>Query matches: <strong className="text-slate-200">{filteredAndSortedTrades.length} position logs</strong></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAndSortedTrades.map((t) => {
              const isProfit = t.pnl > 0;
              const isSelected = selectedTrade?.id === t.id;
              
              return (
                <div 
                  key={t.id}
                  onClick={() => setSelectedTrade(t)}
                  className={`rounded-2xl p-5 border cursor-pointer transition-all duration-200 flex flex-col justify-between h-48 select-none shadow-md
                    ${isSelected 
                      ? "bg-gradient-to-br from-purple-950/25 to-[#121026]/50 border-[#a855f7] ring-1 ring-[#a855f7]/30" 
                      : "bg-[#05070A]/60 border-white/10 hover:border-slate-600/65"
                    }
                  `}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-base text-slate-100">{t.symbol}</span>
                        <span className="text-[10px] text-slate-400 font-medium tracking-wide">({t.assetType})</span>
                      </div>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded
                        ${t.status === "OPEN" 
                          ? "bg-cyan-950 text-cyan-400 border border-cyan-500/10 animate-pulse" 
                          : "bg-slate-900 border border-[#1e293b] text-slate-400"
                        }
                      `}>
                        {t.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded 
                        ${t.type === "LONG" ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/10" : "bg-rose-950/60 text-rose-400 border border-rose-500/10"}`}>
                        {t.type} {t.leverage}X
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Qty: {t.quantity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-sans line-clamp-2 pt-1">
                      {t.notes || "No retrospective analysis logged for this entry."}
                    </p>
                  </div>

                  {/* Footer metadata details */}
                  <div className="border-t border-[#1e293b]/30 pt-3 mt-1 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(t.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Self Rating star marker */}
                      <div className="flex text-yellow-500 text-xs">
                        {Array.from({ length: t.rating || 0 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-500" />
                        ))}
                      </div>

                      {/* Display P&L */}
                      <span className={`text-sm font-semibold font-display ${t.status === "OPEN" ? "text-cyan-400" : isProfit ? "text-[#10b981]" : "text-[#f43f5e]"}`}>
                        {t.status === "OPEN" ? "Tracking" : formatVal(t.pnl)}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
            
            {filteredAndSortedTrades.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-500">
                No archived journal items found matching the selected query parameters.
              </div>
            )}
          </div>

        </div>

        {/* Sidebar Panel - Current Selected Trade Deep Dive Modal Card */}
        {selectedTrade && (
          <div className="xl:col-span-1 rounded-2xl glass-panel p-6 shadow-2xl relative border border-slate-700/40 h-fit space-y-5 animate-slideLeft">
            
            {/* Action Toggles */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Position Deep Analysis</span>
              <button 
                onClick={() => setSelectedTrade(null)}
                className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Core Header info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold text-slate-100">{selectedTrade.symbol}</h2>
                <span className={`text-sm font-display font-bold ${selectedTrade.status === "OPEN" ? "text-cyan-400" : selectedTrade.pnl > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {selectedTrade.status === "OPEN" ? "Open Live" : formatVal(selectedTrade.pnl)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wide
                  ${selectedTrade.type === "LONG" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/10" : "bg-rose-950/40 text-rose-400 border border-rose-500/10"}`}>
                  {selectedTrade.type} Directional
                </span>
                <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded tracking-wide font-mono font-medium">
                  {selectedTrade.leverage}X Multiplier
                </span>
                <span className="text-[10px] bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/20 px-2 py-0.5 rounded font-display font-bold">
                  {selectedTrade.assetType}
                </span>
              </div>
            </div>

            {/* Details spec grid */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3.5 text-xs">
              
              <div className="flex justify-between">
                <span className="text-slate-400">Entry price target</span>
                <span className="font-mono text-slate-200">{selectedTrade.entryPrice}</span>
              </div>

              {selectedTrade.exitPrice && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Triggered Exit Close</span>
                  <span className="font-mono text-emerald-400">{selectedTrade.exitPrice}</span>
                </div>
              )}

              {selectedTrade.stopLoss && (
                <div className="flex justify-between">
                  <span className="text-rose-400/80 font-semibold">Stop Loss Limit</span>
                  <span className="font-mono text-rose-400">{selectedTrade.stopLoss}</span>
                </div>
              )}

              {selectedTrade.takeProfit && (
                <div className="flex justify-between">
                  <span className="text-emerald-400/80 font-semibold">Take Profit Target</span>
                  <span className="font-mono text-emerald-400">{selectedTrade.takeProfit}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-slate-400">Archived Timestamp</span>
                <span className="font-mono text-slate-300">
                  {new Date(selectedTrade.timestamp).toLocaleString(undefined, { hour: "numeric", minute: "numeric", month: "short", day: "numeric" })}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Alignment Strategy</span>
                <span className="text-slate-200 font-semibold truncate max-w-[150px]">{getLinkedStrategyTitle(selectedTrade.strategyId)}</span>
              </div>
            </div>

            {/* Note & Description */}
            <div className="space-y-2">
              <span className="text-slate-400 text-xs font-semibold block uppercase">Trading Thesis notes</span>
              <p className="text-slate-300 text-sm bg-slate-950/20 p-3 rounded-xl border border-slate-800/20 leading-relaxed font-sans">
                {selectedTrade.notes || "No retrospective thesis logged currently."}
              </p>
            </div>

            {/* Actionable lesson section */}
            {selectedTrade.lessons && (
              <div className="space-y-2">
                <span className="text-red-400 text-xs font-semibold block uppercase">Actionable Lesson Gained</span>
                <div className="bg-rose-950/20 border border-rose-500/20 text-rose-300 text-xs p-3.5 rounded-xl leading-relaxed">
                  {selectedTrade.lessons}
                </div>
              </div>
            )}

            {/* Emotional Profile tags */}
            {selectedTrade.emotions && selectedTrade.emotions.length > 0 && (
              <div className="space-y-2">
                <span className="text-slate-400 text-xs font-semibold block uppercase">Trader Emotional Profile</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTrade.emotions.map((emo, index) => (
                    <span 
                      key={index}
                      className="text-[10px] font-bold bg-[#1e1b4b]/60 text-slate-300 px-2 py-0.5 rounded-lg border border-[#312e81]"
                    >
                      {emo}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* operations trigger controls */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs">
              <div className="space-y-0.5">
                <span className="text-slate-400 block tracking-wide">Journal Rating quality</span>
                <span className="text-slate-500 text-[10px] block">Calculated self-efficiency</span>
              </div>
              <div className="flex text-yellow-500 gap-1 text-sm bg-[#05070A] border border-white/10 px-3 py-1.5 rounded-xl">
                {Array.from({ length: selectedTrade.rating || 0 }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
            </div>

            {/* Operations controls (Close open trades or delete trade entirely) */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              {selectedTrade.status === "OPEN" && (
                <button
                  onClick={() => setIsClosingId(selectedTrade.id)}
                  className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all border border-emerald-500/20 uppercase tracking-wider flex items-center justify-center gap-1.5 col-span-2"
                >
                  <Check className="w-4 h-4" /> Close Out Position
                </button>
              )}

              <button
                onClick={async () => {
                  if (confirm("Verify deleting this journal log permanently? This step cannot be reverted.")) {
                    const de = await onDeleteTrade(selectedTrade.id);
                    if (de) setSelectedTrade(null);
                  }
                }}
                className="py-2 rounded-xl bg-slate-900 text-rose-500 border border-rose-500/35 hover:bg-rose-950/20 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 col-span-2 mt-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Purge Journal Log
              </button>
            </div>

          </div>
        )}

      </div>

      {/* DETAILED DIALOG MODAL FOR COMPLETING OPEN TRADES */}
      {isClosingId && (
        <div id="close-dialog" className="fixed inset-0 bg-[#05070A]/90 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
          <div className="rounded-2xl bg-gradient-to-b from-[#121026] to-[#05070A] border border-white/10 p-6 max-w-sm w-full mx-4 shadow-2xl relative space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-md font-display font-semibold text-slate-100 uppercase tracking-widest flex items-center gap-1.5">
                <Star className="w-4 h-4 text-cyan-400" /> Close Position Details
              </h3>
              <button 
                onClick={() => setIsClosingId(null)}
                className="p-1 rounded bg-white/10 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block uppercase mb-1.5">Realized Exit Trigger price</label>
              <input
                type="number"
                step="any"
                placeholder="Exit trigger price"
                value={closingExitPrice}
                onChange={(e) => setClosingExitPrice(e.target.value)}
                className="w-full bg-[#05070A] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-1">PnL will be dynamically adjusted compared to your entry position.</p>
            </div>

            <div className="pt-2 flex gap-3.5">
              <button
                onClick={() => executeClosingTrade(isClosingId)}
                disabled={closingLoading}
                className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs tracking-wider border border-cyan-400/20 active:scale-95 transition-all"
              >
                {closingLoading ? "Processing Fill..." : "Verify & Close Position"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
