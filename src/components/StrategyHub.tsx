import React, { useState } from "react";
import { 
  PlusCircle, 
  Sparkles, 
  Trash2, 
  Compass, 
  Cpu, 
  BookOpen, 
  Layers, 
  CheckCircle, 
  Target,
  PenTool,
  Save,
  Clock
} from "lucide-react";
import { Strategy } from "../types";

interface StrategyHubProps {
  strategies: Strategy[];
  onAddStrategy: (strat: any) => Promise<boolean>;
}

export default function StrategyHub({ strategies, onAddStrategy }: StrategyHubProps) {
  
  // States
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(strategies[0] || null);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customNotes, setCustomNotes] = useState("");
  
  // AI generation state
  const [aiAssetClass, setAiAssetClass] = useState("Crypto");
  const [aiMethodology, setAiMethodology] = useState("Smart Money Concepts");
  const [generatingAi, setGeneratingAi] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const methodologyPresets = [
    "Smart Money Concepts",
    "EMA Exponential Trend-Rider",
    "Fibonacci Cluster Retest",
    "Range Liquidity Sweep",
    "Volatility Breaker Breakout",
  ];

  // Manual new Strategy template
  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle) return;

    const dummyPayload = {
      title: customTitle,
      notes: customNotes,
      rules: [
        "Define daily directional structural bias",
        "Wait for displacement sweep on lower timeframe keys"
      ],
      checklist: [
        "Risk calculated below 1.5% limit?",
        "Daily bias fully aligned?"
      ]
    };

    const success = await onAddStrategy(dummyPayload);
    if (success) {
      setCustomTitle("");
      setCustomNotes("");
      setIsAddingCustom(false);
      // Find and select recently inserted
      if (strategies.length > 0) {
        setSelectedStrategy(strategies[strategies.length - 1]);
      }
    }
  };

  // AI Strategy creator request
  const handleGenerateAiStrategy = async () => {
    setGeneratingAi(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/strategy/generate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-email": (() => {
            const u = localStorage.getItem("tradeedge_session_user");
            if (u) {
              try { return JSON.parse(u)?.email || ""; } catch(e) {}
            }
            return "";
          })()
        },
        body: JSON.stringify({
          theme: aiMethodology,
          assetClass: aiAssetClass
        })
      });

      if (response.ok) {
        const generatedData = await response.json();
        // Post newly generated AI strategy directly to saving stack
        await onAddStrategy(generatedData);
        
        // Auto select the new strategy
        if (strategies.length > 0) {
          setSelectedStrategy(strategies[strategies.length - 1]);
        }
      } else {
        setErrorMsg("API connectivity issue encountered. Failed to query AI mentor.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network latency timeout. Please retry strategy synthesis.");
    } finally {
      setGeneratingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-medium text-slate-100 tracking-tight flex items-center gap-2">
          Strategy <span className="text-sm font-sans px-2 py-0.5 rounded bg-purple-950/50 border border-purple-500/30 text-[#8b5cf6] text-glow-purple flex items-center gap-1">
            <Cpu className="w-3 h-3" /> AI Protocol Creator
          </span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Develop rules, criteria checklists, and invoke high-grade trade-pattern templates engineered via generative artificial intelligence.
        </p>
      </div>

      {/* STRATEGY WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: Selector listing & AI Catalyst Builder */}
        <div className="space-y-6">
          
          {/* Card Module: Strategy ledger lists */}
          <div className="rounded-2xl glass-panel p-5 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-sm font-display font-semibold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#a855f7]" /> Protocols (Active)
              </h3>
              <button
                onClick={() => setIsAddingCustom(!isAddingCustom)}
                className="text-xs font-semibold text-[#a855f7] hover:text-[#c084fc] transition-colors flex items-center gap-1"
              >
                + Custom
              </button>
            </div>

            {/* Custom Manual adding drawer */}
            {isAddingCustom && (
              <form onSubmit={handleCreateCustom} className="p-3.5 rounded-xl bg-purple-950/15 border border-purple-500/15 space-y-3.5 animate-fadeIn">
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block uppercase mb-1">Protocol Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SMC Breaker Retest"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full bg-[#05070A] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-[#a855f7]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block uppercase mb-1">Summary details</label>
                  <textarea
                    rows={2}
                    placeholder="Define methodology objective..."
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    className="w-full bg-[#05070A] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-[#a855f7]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 rounded-lg bg-[#a855f7] hover:bg-purple-500 text-white font-semibold text-xs transition-all"
                >
                  Create Protocol
                </button>
              </form>
            )}

            {/* Existing lists */}
            <div className="space-y-2 mt-2 max-h-56 overflow-y-auto">
              {strategies.map((strat) => {
                const isSelected = selectedStrategy?.id === strat.id;
                return (
                  <div
                    key={strat.id}
                    onClick={() => { setSelectedStrategy(strat); setIsAddingCustom(false); }}
                    className={`p-3.5 rounded-xl cursor-pointer border transition-all duration-150 select-none
                      ${isSelected 
                        ? "bg-[#a855f7]/10 border-[#a855f7] text-[#a855f7]" 
                        : "bg-white/5 border border-white/10 text-slate-400 hover:border-slate-600"
                      }
                    `}
                  >
                    <h4 className="font-display font-bold text-sm text-slate-200 truncate">{strat.title}</h4>
                    <p className="text-[10px] mt-1 text-slate-400 line-clamp-1">{strat.notes}</p>
                    <div className="flex justify-between items-center mt-2.5 text-[9px] text-slate-500 font-mono font-medium">
                      <span>Linked entries: {strat.linkedTradeCount}</span>
                      <span className="text-[#a855f7] text-glow-purple font-semibold">WinRate: {strat.winRate}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card Module: AI STRATEGY CREATOR PANEL */}
          <div className="rounded-2xl bg-gradient-to-b from-[#121026] to-[#05070A] border border-purple-500/20 p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-display font-semibold text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" /> AI Strategy synthesis
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Auto-generate complex, rules-based, edge-verified protocols optimized for specific volatile liquidity zones using Gemini models.
            </p>

            <div className="space-y-3 pt-1">
              {/* Asset Class Select */}
              <div>
                <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Optimized Market Segment</label>
                <select
                  value={aiAssetClass}
                  onChange={(e) => setAiAssetClass(e.target.value)}
                  className="w-full bg-[#05070A] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 font-medium focus:outline-none focus:border-purple-500"
                >
                  <option value="Crypto">Crypto Assets</option>
                  <option value="Forex">Forex Markets</option>
                  <option value="US Stocks">US Stocks Index</option>
                  <option value="Commodities">Commodities Swap</option>
                </select>
              </div>

              {/* Methodology Selector */}
              <div>
                <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Mathematical Theory core</label>
                <select
                  value={aiMethodology}
                  onChange={(e) => setAiMethodology(e.target.value)}
                  className="w-full bg-[#05070A] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 font-medium focus:outline-none focus:border-purple-500"
                >
                  {methodologyPresets.map((preset) => (
                    <option key={preset} value={preset}>{preset}</option>
                  ))}
                </select>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-950/20 text-rose-300 border border-rose-500/20 text-[10px] leading-snug">
                  {errorMsg}
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerateAiStrategy}
                disabled={generatingAi}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all border border-purple-500/20 active:scale-95"
              >
                {generatingAi ? "Synthesizing AI Engine..." : "Invoke Gemini AI Builder"}
              </button>
            </div>
          </div>

        </div>

        {/* Column 2 & 3: Selected Strategy Notion Workspace (Spans 2 columns) */}
        <div className="lg:col-span-2">
          {selectedStrategy ? (
            <div className="rounded-2xl glass-panel p-6 shadow-xl space-y-6 min-h-full">
              
              {/* Strategy Header info */}
              <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-display font-bold text-slate-100">{selectedStrategy.title}</h2>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{selectedStrategy.notes}</p>
                </div>
                
                <div className="bg-[#05070A] border border-white/10 rounded-xl px-4 py-3 text-center shrink-0 min-w-[120px]">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">Protocol Accuracy</span>
                  <span className="text-lg font-bold text-purple-400 font-display mt-0.5 text-glow-purple block">{selectedStrategy.winRate}% WinRate</span>
                </div>
              </div>

              {/* Core Strategy Rules (Linear block style) */}
              <div className="space-y-4">
                <h3 className="text-sm font-display font-semibold text-slate-200 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/10 pb-1.5">
                  <Target className="w-4 h-4 text-emerald-400" /> Executive Entry Rules (Sequential)
                </h3>
                <div className="space-y-3">
                  {selectedStrategy.rules && selectedStrategy.rules.length > 0 ? (
                    selectedStrategy.rules.map((rule, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[#05070A]/60 border border-white/10 flex gap-3 text-sm text-slate-200 leading-relaxed font-sans">
                        <span className="font-bold text-xs text-[#a855f7] bg-purple-950/50 border border-purple-500/15 w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-mono">
                          0{idx + 1}
                        </span>
                        <span>{rule}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No checklist structures defined yet.</p>
                  )}
                </div>
              </div>

              {/* Checklist criteria workspace */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-display font-semibold text-slate-200 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/10 pb-1.5">
                  <CheckCircle className="w-4 h-4 text-cyan-400 animate-pulse" /> Verification Pre-Entry Checklist
                </h3>
                <div className="space-y-2">
                  {selectedStrategy.checklist && selectedStrategy.checklist.length > 0 ? (
                    selectedStrategy.checklist.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3.5 p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 font-sans">
                        <input
                          type="checkbox"
                          defaultChecked={idx % 2 === 0} // visual aesthetic seed
                          className="w-4.5 h-4.5 accent-purple-500 rounded bg-[#05070A] border-white/10 cursor-pointer"
                        />
                        <span>{item}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No checklist parameters set.</p>
                  )}
                </div>
              </div>

              {/* Visual helper block */}
              <div className="bg-white/5 rounded-xl p-4.5 border border-white/5 space-y-2 text-xs leading-relaxed text-slate-400">
                <p className="font-semibold text-slate-300 flex items-center gap-1.5 mb-1 bg-black/35 border border-white/5 p-2.5 rounded-lg w-fit">
                  <BookOpen className="w-4 h-4 text-purple-400" /> Operational Notion:
                </p>
                To edit rule triggers or custom criteria, simply tap the fields to modify. Once a position is linked under the <strong>Add Trade Cockpit</strong>, these rules act as prerequisites to lock manual discipline scores.
              </div>

            </div>
          ) : (
            <div className="rounded-2xl glass-panel p-16 shadow-xl flex flex-col justify-center items-center text-center space-y-4">
              <Compass className="w-16 h-16 text-slate-700 animate-spin" style={{ animationDuration: '20s' }} />
              <h3 className="text-slate-300 font-display font-medium text-lg">No Trading Protocols Registered</h3>
              <p className="text-slate-500 text-sm max-w-sm">
                Generate dynamic strategies using Gemini AI models above or add custom criteria to begin tracking your structural edge.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
