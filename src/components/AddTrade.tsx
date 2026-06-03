import React, { useState, useEffect } from "react";
import { 
  PlusCircle, 
  Sparkles, 
  HelpCircle, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Activity, 
  Upload, 
  Briefcase,
  Layers,
  CheckCircle,
  FileText
} from "lucide-react";
import { AssetType, Trade, Strategy } from "../types";

interface AddTradeProps {
  strategies: Strategy[];
  onAddTrade: (trade: any) => Promise<boolean>;
  onNavigate: (tab: string) => void;
}

export default function AddTrade({ strategies, onAddTrade, onNavigate }: AddTradeProps) {
  
  // States
  const [assetType, setAssetType] = useState<AssetType>("Crypto");
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [tradeType, setTradeType] = useState<"LONG" | "SHORT">("LONG");
  const [autofill, setAutofill] = useState(true);
  const [entryPrice, setEntryPrice] = useState("67240.50");
  const [exitPrice, setExitPrice] = useState("");
  const [leverage, setLeverage] = useState(10);
  const [quantity, setQuantity] = useState("0.5");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState("");
  const [status, setStatus] = useState<"OPEN" | "CLOSED">("CLOSED");
  const [rating, setRating] = useState(4);
  const [confidence, setConfidence] = useState(4);
  const [tagsInput, setTagsInput] = useState("");
  const [lessons, setLessons] = useState("");
  
  // Live ticker dynamic rates (polled from local API)
  const [liveRates, setLiveRates] = useState<Record<string, { price: number; change: number }>>({});
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Asset defaults
  const symbolPresets: Record<AssetType, string[]> = {
    "Crypto": ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"],
    "Forex": ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD"],
    "Commodities": ["Gold", "Silver", "USOIL"],
    "US Stocks": ["NVDA", "AAPL", "MSFT", "TSLA"],
    "Indian Market": ["RELIANCE", "NIFTY50", "TCS", "INFY"],
  };

  // Fetch live prices periodically or update preset Symbol
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const r = await fetch("/api/market/ticker");
        if (r.ok) {
          const data = await r.json();
          setLiveRates(data);
          
          // Autofill price if active
          if (autofill && data[symbol]) {
            setEntryPrice(data[symbol].price.toString());
          }
        }
      } catch (err) {
        console.warn("Pricing pool down", err);
      }
    };
    
    fetchRates();
    const inv = setInterval(fetchRates, 3000);
    return () => clearInterval(inv);
  }, [symbol, autofill]);

  // Handle asset type switcher
  const handleAssetTypeChange = (val: AssetType) => {
    setAssetType(val);
    const presets = symbolPresets[val];
    if (presets && presets.length > 0) {
      setSymbol(presets[0]);
    }
  };

  const emotionPresets = [
    "Disciplined", "Patient", "Greedy", "Fearful", "FOMO", 
    "Confident", "Anxious", "Hesitant", "Angry", "Calm"
  ];

  const toggleEmotion = (emotion: string) => {
    if (selectedEmotions.includes(emotion)) {
      setSelectedEmotions(selectedEmotions.filter((e) => e !== emotion));
    } else {
      setSelectedEmotions([...selectedEmotions, emotion]);
    }
  };

  // Calculate live statistics
  const calculatedRisk = () => {
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    if (!entry || !sl) return "0.00%";
    const multiplier = tradeType === "LONG" ? 1 : -1;
    const difference = (entry - sl) * multiplier;
    const pct = (difference / entry) * 100;
    return `${pct.toFixed(2)}%`;
  };

  const calculatedRrr = () => {
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    const tp = parseFloat(takeProfit);
    if (!entry || !sl || !tp) return "1:2 (Estimated)";
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    if (risk === 0) return "1:0";
    return `1:${(reward / risk).toFixed(1)}`;
  };

  const calculatedPnl = () => {
    if (status === "OPEN") return "Estimated dynamically";
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const qty = parseFloat(quantity);
    if (!entry || !exit || !qty) return "$0.00";
    const mult = tradeType === "LONG" ? 1 : -1;
    const riskAmount = (exit - entry) * qty * leverage * mult;
    return `$${riskAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPrice(true);

    const tagsArr = tagsInput.split(",").map(t => t.trim()).filter(Boolean);

    const payload = {
      symbol,
      assetType,
      type: tradeType,
      entryPrice: parseFloat(entryPrice),
      exitPrice: status === "CLOSED" && exitPrice ? parseFloat(exitPrice) : undefined,
      leverage,
      quantity: parseFloat(quantity),
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
      notes,
      emotions: selectedEmotions,
      strategyId: selectedStrategyId || undefined,
      status,
      rating,
      confidence,
      tags: tagsArr,
      lessons,
      timestamp: new Date().toISOString()
    };

    const success = await onAddTrade(payload);
    setLoadingPrice(false);
    
    if (success) {
      setSuccessMsg(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        setSuccessMsg(false);
        onNavigate("trades");
      }, 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Page Header banner */}
      <div>
        <h1 className="text-3xl font-display font-medium text-slate-100 tracking-tight flex items-center gap-2">
          Log New Trading Setup
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Catalog real-time, manual, or paper positions. Integrate notes and emotions to optimize intelligence metrics.
        </p>
      </div>

      {successMsg && (
        <div id="success-alert" className="p-4 rounded-xl bg-emerald-900/40 border border-emerald-500/50 text-emerald-300 text-sm flex items-center gap-3 animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span>Position logged successfully! Transferring you securely to your Trade Journal archives.</span>
        </div>
      )}

      {/* CORE INPUT GRID FORM */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: General Asset & Parameters Configuration (2 columns on large screen) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card Module 1: Market & Asset Selection */}
          <div className="rounded-2xl glass-panel p-6 shadow-xl space-y-5">
            <h2 className="text-md font-display font-semibold text-slate-200 border-b border-white/10 pb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#a855f7]" /> 1. Market Selection
            </h2>
            
            {/* Market Switcher buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {(["Crypto", "Forex", "Commodities", "US Stocks", "Indian Market"] as AssetType[]).map((typeItem) => (
                <button
                  type="button"
                  key={typeItem}
                  onClick={() => handleAssetTypeChange(typeItem)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold select-none border whitespace-nowrap transition-all duration-150
                    ${assetType === typeItem
                      ? "bg-[#a855f7]/15 border-[#a855f7] text-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                      : "bg-[#05070A]/80 border-white/10 text-slate-400 hover:border-slate-500"
                    }
                  `}
                >
                  {typeItem}
                </button>
              ))}
            </div>

            {/* Symbol preset dynamic list & Long/Short Switch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-2">Symbol Ticker</label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full bg-[#05070A]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[#a855f7] font-semibold"
                >
                  {symbolPresets[assetType].map((preset) => (
                    <option key={preset} value={preset}>{preset}</option>
                  ))}
                </select>
                <div className="mt-2 text-xs text-slate-500 font-mono">
                  Preset selection dynamically maps parameters from the database.
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-2">Position Direction</label>
                <div className="grid grid-cols-2 gap-2.5 h-12 bg-[#05070A] rounded-xl p-1 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setTradeType("LONG")}
                    className={`rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all
                      ${tradeType === "LONG"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-md"
                        : "text-slate-400 hover:text-slate-200"
                      }
                    `}
                  >
                    <TrendingUp className="w-3.5 h-3.5" /> LONG
                  </button>
                  <button
                    type="button"
                    onClick={() => setTradeType("SHORT")}
                    className={`rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all
                      ${tradeType === "SHORT"
                        ? "bg-rose-500/15 text-rose-400 border border-rose-500/20 shadow-md"
                        : "text-slate-400 hover:text-slate-200"
                      }
                    `}
                  >
                    <TrendingDown className="w-3.5 h-3.5" /> SHORT
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card Module 2: Pricing Parameters & Sizing */}
          <div className="rounded-2xl glass-panel p-6 shadow-xl space-y-5">
            <h2 className="text-md font-display font-semibold text-slate-200 border-b border-white/10 pb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> 2. Sizing & Risk Configuration
            </h2>

            {/* Fill Mode Switcher */}
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-200">Auto Live Rate Synchronization</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Locks entry price to streaming tickers on activation.</p>
              </div>
              <button
                type="button"
                onClick={() => setAutofill(!autofill)}
                className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none
                  ${autofill ? "bg-[#a855f7]" : "bg-slate-800"}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200
                  ${autofill ? "translate-x-5" : "translate-x-0"}`}></div>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-2">Entry Price</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={entryPrice}
                  disabled={autofill}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="w-full bg-[#05070A]/80 disabled:opacity-60 disabled:cursor-not-allowed border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[#a855f7] font-mono font-medium"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-2">Quantity Size</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-[#05070A]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[#a855f7] font-mono font-medium"
                />
              </div>
            </div>

            {/* Leverage Sliders */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs text-slate-400 font-semibold">
                <span>RISK COLLATERAL LEVERAGE</span>
                <span className="text-purple-400 text-glow-purple">{leverage}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="200"
                value={leverage}
                onChange={(e) => setLeverage(Number(e.target.value))}
                className="w-full accent-purple-500 bg-white/5 h-2 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1x (Spot Margin)</span>
                <span>100x (High Cap Acc)</span>
                <span>200x (Aggressive Speculation)</span>
              </div>
            </div>

            {/* Risk mitigation coordinates: TP & SL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-2">Take Profit Target</label>
                <input
                  type="number"
                  step="any"
                  placeholder="Exit target rate"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className="w-full bg-[#05070A]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[#a855f7] font-mono font-medium"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-2">Stop Loss Boundary</label>
                <input
                  type="number"
                  step="any"
                  placeholder="Liquidity risk boundary"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full bg-[#05070A]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[#a855f7] font-mono font-medium"
                />
              </div>
            </div>
          </div>

          {/* Card Module 3: Strategy & Emotional Mapping */}
          <div className="rounded-2xl glass-panel p-6 shadow-xl space-y-5">
            <h2 className="text-md font-display font-semibold text-slate-200 border-b border-white/10 pb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-violet-400" /> 3. Protocol & Emotion Alignment
            </h2>

            {/* Strategy linker */}
            <div>
              <label className="text-xs text-slate-400 font-semibold uppercase block mb-2">Execute Under Strategy Framework</label>
              <select
                value={selectedStrategyId}
                onChange={(e) => setSelectedStrategyId(e.target.value)}
                className="w-full bg-[#05070A]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[#a855f7]"
              >
                <option value="">-- Standalone Execution (No linked strategy) --</option>
                {strategies.map((strat) => (
                  <option key={strat.id} value={strat.id}>{strat.title}</option>
                ))}
              </select>
            </div>

            {/* Mood selector tag block */}
            <div>
              <label className="text-xs text-slate-400 font-semibold uppercase block mb-2">Mental Profile Tag (Pick Multiple)</label>
              <div className="flex flex-wrap gap-2">
                {emotionPresets.map((emo) => {
                  const active = selectedEmotions.includes(emo);
                  return (
                    <button
                      type="button"
                      key={emo}
                      onClick={() => toggleEmotion(emo)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all duration-150 border select-none
                        ${active
                          ? "bg-purple-900/30 text-[#a855f7] border-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.1)]"
                          : "bg-white/5 text-slate-400 border-white/10 hover:border-slate-500"
                        }
                      `}
                    >
                      {emo}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note taking workspace */}
            <div className="grid grid-cols-1 gap-4 pt-2">
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-2">Retrospective Logs & Notes</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Record your entry thesis. What elements or indicator configuration prompted this transaction?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#05070A]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[#a855f7]"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Status, Metrics, Uploads & Submission Card */}
        <div className="space-y-6">
          
          {/* Diagnostic Metrics cockpit cards */}
          <div className="rounded-2xl bg-gradient-to-b from-[#121026] to-[#05070A] p-5 border border-purple-500/15 shadow-2xl space-y-4">
            <h3 className="text-sm font-display font-semibold text-slate-200 uppercase tracking-widest flex items-center gap-2 border-b border-purple-500/15 pb-2">
              <Activity className="w-4 h-4 text-purple-400" /> Active Risk Monitor
            </h3>

            <div className="space-y-3.5 divide-y divide-white/5">
              
              <div className="flex justify-between text-xs pt-1.5">
                <span className="text-slate-400">Position Profile</span>
                <span className={`font-bold uppercase ${tradeType === "LONG" ? "text-emerald-400 text-glow-purple" : "text-rose-400"}`}>
                  {tradeType} BUY
                </span>
              </div>

              <div className="flex justify-between text-xs pt-3">
                <span className="text-slate-400 font-sans">Leverage Load Risk</span>
                <span className="font-mono text-slate-200">{leverage}x Size multiplier</span>
              </div>

              <div className="flex justify-between text-xs pt-3">
                <span className="text-slate-400">Margin Stop Offset</span>
                <span className="text-rose-400 font-mono font-medium">{calculatedRisk()} Limit</span>
              </div>

              <div className="flex justify-between text-xs pt-3">
                <span className="text-slate-400">Risk-to-Reward (RR)</span>
                <span className="text-cyan-400 font-mono font-medium">{calculatedRrr()} Offset</span>
              </div>

              <div className="flex justify-between text-xs pt-3">
                <span className="text-slate-400">Calculated Yield Projection</span>
                <span className="text-slate-200 font-mono font-bold">{calculatedPnl()}</span>
              </div>

            </div>

            {/* Diagnostic Alert message for leverage */}
            {leverage > 25 && (
              <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl flex items-start gap-2 text-amber-300 text-[11px] leading-relaxed">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                <span><strong>High Leverage Warning:</strong> Positioning leverage levels beyond 25x aggregates significant margin wipeout risk. Ensure boundaries are strictly set!</span>
              </div>
            )}
          </div>

          {/* Screenshot drag-and-drop placeholder module */}
          <div className="rounded-2xl glass-panel p-5 shadow-xl space-y-4">
            <label className="text-xs text-slate-400 font-semibold uppercase block">Chart Screenshot or Asset Log</label>
            <div className="border border-dashed border-white/10 hover:border-purple-500/50 rounded-xl p-5 text-center cursor-pointer transition-colors bg-white/5 group">
              <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2 group-hover:scale-110 group-hover:text-[#a855f7] transition-all" />
              <p className="text-xs font-semibold text-slate-300">Drag & drop or Click to capture screenshot</p>
              <p className="text-[10px] text-slate-500 mt-1">PNG, JPG, SVG up to 5MB</p>
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="text"
                placeholder="Custom tags (separated by comma)"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full bg-[#05070A]/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none"
              />
            </div>
          </div>

          {/* Position Setup Status & rating configuration */}
          <div className="rounded-2xl glass-panel p-6 shadow-xl space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-semibold uppercase block mb-2">Trade Status Mode</label>
              <div className="grid grid-cols-2 gap-2 h-10 bg-[#05070A] rounded-xl p-1 border border-white/10">
                <button
                  type="button"
                  onClick={() => setStatus("OPEN")}
                  className={`rounded-lg flex items-center justify-center text-xs font-bold transition-all
                    ${status === "OPEN"
                      ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                    }
                  `}
                >
                  ACTIVE OPEN
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("CLOSED")}
                  className={`rounded-lg flex items-center justify-center text-xs font-bold transition-all
                    ${status === "CLOSED"
                      ? "bg-slate-800 text-slate-200 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                    }
                  `}
                >
                  CLOSED FILL
                </button>
              </div>
            </div>

            {/* If Closed, ask for exit price and lessons */}
            {status === "CLOSED" && (
              <div className="space-y-4 pt-1 animate-fadeIn">
                <div>
                  <label className="text-xs text-slate-400 font-semibold uppercase block mb-1.5">Exit price rate</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Realized trigger price"
                    value={exitPrice}
                    onChange={(e) => setExitPrice(e.target.value)}
                    className="w-full bg-[#05070A]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[#a855f7] font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-semibold uppercase block mb-1.5">Actionable Lesson Gained</label>
                  <input
                    type="text"
                    placeholder="What mistake arose, or list what worked nicely"
                    value={lessons}
                    onChange={(e) => setLessons(e.target.value)}
                    className="w-full bg-[#05070A]/80 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1.5">Confidence (1-5)</label>
                <select
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full bg-[#05070A]/80 border border-white/10 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="1">1 (Highly Skeptical)</option>
                  <option value="2">2 (Low Confluence)</option>
                  <option value="3">3 (Normal Baseline)</option>
                  <option value="4">4 (High Conviction)</option>
                  <option value="5">5 (Prime A+ Candidate)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1.5">Self Rating (1-5)</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full bg-[#05070A]/80 border border-white/10 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="1">1 ★ (Terrible emotional buy)</option>
                  <option value="2">2 ★★ (Checklist violated)</option>
                  <option value="3">3 ★★★ (Decent baseline)</option>
                  <option value="4">4 ★★★★ (Exactly on rules)</option>
                  <option value="5">5 ★★★★★ (Ideal textbook flow)</option>
                </select>
              </div>
            </div>

            {/* Submission triggers */}
            <button
              type="submit"
              disabled={loadingPrice}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg hover:shadow-xl transition-all border border-purple-500/20 active:scale-95"
            >
              {loadingPrice ? "Synching ledger details..." : "Commit Transaction To Journal"}
            </button>
            
          </div>

        </div>

      </form>

    </div>
  );
}
