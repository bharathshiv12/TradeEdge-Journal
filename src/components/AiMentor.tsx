import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Send, 
  Flame, 
  BookOpen, 
  Cpu, 
  TrendingUp, 
  TrendingDown, 
  Database,
  ThumbsUp,
  Brain,
  Layers,
  HelpCircle,
  Clock,
  Volume2
} from "lucide-react";
import { Trade, Message } from "../types";

interface AiMentorProps {
  trades: Trade[];
  currency: string;
}

export default function AiMentor({ trades, currency }: AiMentorProps) {
  
  // States
  const [selectedTradeId, setSelectedTradeId] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      role: "assistant",
      timestamp: new Date().toISOString(),
      text: "Greetings. I am your proprietary **TradeEdge Journal AI Mentor**. I represent Wall Street trading desks, risk committees, and algorithmic intelligence. Select an entry below or pose general portfolio queries to explore behavioral loops or technical metrics."
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [querying, setQuerying] = useState(false);
  
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, querying]);

  // Selected trade note representation
  const activeTradeObj = trades.find(t => t.id === selectedTradeId);

  // Formatting Helpers
  const formatVal = (val: number) => {
    const symbolMap: Record<string, string> = { USD: "$", EUR: "€", INR: "₹", GBP: "£" };
    return `${val >= 0 ? "+" : ""}${symbolMap[currency] || "$"}${Math.abs(val)}`;
  };

  // Submit query
  const handleQueryMentor = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    setQuerying(true);
    
    // Add user message to history
    const userMsg: Message = {
      role: "user",
      timestamp: new Date().toISOString(),
      text: textToSend
    };
    
    setChatHistory(prev => [...prev, userMsg]);
    setUserInput("");

    try {
      const response = await fetch("/api/mentor/chat", {
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
          tradeId: selectedTradeId || undefined,
          messages: chatHistory,
          userMessage: textToSend
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMsg: Message = {
          role: "assistant",
          timestamp: new Date().toISOString(),
          text: data.text
        };
        setChatHistory(prev => [...prev, assistantMsg]);
      } else {
        const errMsg: Message = {
          role: "assistant",
          timestamp: new Date().toISOString(),
          text: "My neural connection is currently restricted. Please check your **Settings > Secrets** panel or network status before retrying."
        };
        setChatHistory(prev => [...prev, errMsg]);
      }
    } catch (err) {
      console.error(err);
      const errMsg: Message = {
        role: "assistant",
        timestamp: new Date().toISOString(),
        text: "Gateway latency arose. Synthesizing offline localized intelligence..."
      };
      setChatHistory(prev => [...prev, errMsg]);
    } finally {
      setQuerying(false);
    }
  };

  // Trigger quick presets
  const applyPresetQuery = (preset: string) => {
    let finalQuery = preset;
    if (activeTradeObj) {
      finalQuery = `${preset} for my ${activeTradeObj.symbol} trade that entry at ${activeTradeObj.entryPrice}. Here is my note details: "${activeTradeObj.notes}"`;
    }
    handleQueryMentor(finalQuery);
  };

  const helperShortcuts = [
    { title: "Audit This Setup", query: "Audit my checklist details and point out psychological risk issues." },
    { title: "Explain Better Entries", query: "Where were optimal entries according to smart money order blocks?" },
    { title: "Analyze Emotional Loops", query: "How did my emotional state impact my win/loss dynamic?" },
    { title: "Review Sizing Model", query: "Is my leverage and position sizing statistically safe for my account size?" }
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-medium text-slate-100 tracking-tight flex items-center gap-2">
          AI Trading Analysis <span className="text-sm font-sans px-2.5 py-0.5 rounded bg-purple-950/50 border border-purple-500/30 text-[#8b5cf6] text-glow-purple flex items-center gap-1 animate-pulse">
            <Brain className="w-3.5 h-3.5" /> Neural Sandbox
          </span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Perform strict microscopic audits on individual trades, risk distributions, and behavioral lapses.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Sidebar Selector: Select Trade Context (1 Column) */}
        <div className="space-y-5">
          <div className="rounded-2xl glass-panel p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-display font-semibold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" /> Active Context
            </h3>
            
            <div>
              <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-2">Selected Entry</label>
              <select
                value={selectedTradeId}
                onChange={(e) => {
                  setSelectedTradeId(e.target.value);
                  // Quick state clean history to represent new context thread
                  setChatHistory([
                    {
                      role: "assistant",
                      timestamp: new Date().toISOString(),
                      text: `Locking neural review focus onto trade target **${e.target.value ? trades.find(t=>t.id === e.target.value)?.symbol : 'No Select'}**. I am scanning notes, emotions, and yield calculations. What elements do you want to audit?`
                    }
                  ]);
                }}
                className="w-full bg-[#05070A]/90 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-300 font-semibold focus:outline-none focus:border-[#a855f7]"
              >
                <option value="">-- No Select (Holistic Audits) --</option>
                {trades.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.symbol} ({t.status === 'OPEN' ? 'Tracking' : formatVal(t.pnl)})
                  </option>
                ))}
              </select>
            </div>

            {/* If trade select, display mini card in panel */}
            {activeTradeObj && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3.5 text-xs animate-fadeIn">
                <div className="flex justify-between items-center text-slate-200">
                  <strong className="font-display text-sm">{activeTradeObj.symbol}</strong>
                  <span className={`font-mono font-bold ${activeTradeObj.status === 'OPEN' ? 'text-cyan-400' : activeTradeObj.pnl >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                    {activeTradeObj.status === 'OPEN' ? 'Open' : formatVal(activeTradeObj.pnl)}
                  </span>
                </div>
                <div className="space-y-1.5 text-slate-400 leading-relaxed font-sans">
                  <p><strong className="text-slate-300">Notes:</strong> {activeTradeObj.notes || "No log content cataloged."}</p>
                  <p><strong className="text-slate-300">Trader Emotions:</strong> {activeTradeObj.emotions?.join(', ') || "Normal"}</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Mentor Prompts Card */}
          <div className="rounded-2xl glass-panel p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-display font-semibold text-slate-200 uppercase tracking-widest">
              Prompt Shortcuts
            </h3>
            <div className="flex flex-col gap-2.5">
              {helperShortcuts.map((sh, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPresetQuery(sh.query)}
                  className="w-full p-2.5 rounded-xl text-left bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-purple-500/30 transition-all text-[11px] font-sans"
                >
                  {sh.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Conversation Window (3 Columns) */}
        <div className="lg:col-span-3 rounded-2xl glass-panel p-6 shadow-2xl flex flex-col justify-between h-[550px] space-y-4">
          
          {/* Messages history window */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scroll-smooth">
            {chatHistory.map((m, idx) => {
              const isAssistant = m.role === "assistant";
              return (
                <div 
                  key={idx} 
                  className={`flex ${isAssistant ? "justify-start" : "justify-end"} animate-fadeIn`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-4 leading-relaxed text-sm shadow-xl
                    ${isAssistant 
                      ? "bg-white/5 text-slate-300 border border-white/10" 
                      : "bg-[#8b5cf6] text-white"
                    }
                  `}>
                    
                    {/* Role identity badge */}
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-wider font-extrabold mb-2.5 border-b border-white/10 pb-1.5">
                      {isAssistant ? (
                        <>
                          <Cpu className="w-3.5 h-3.5 text-purple-400" />
                          <span>TradeEdge Intelligent Mentor</span>
                        </>
                      ) : (
                        <>
                          <span>Alexander Edge (You)</span>
                        </>
                      )}
                    </div>

                    <div className="font-sans whitespace-pre-wrap leading-relaxed text-xs md:text-sm">
                      {m.text}
                    </div>

                  </div>
                </div>
              );
            })}

            {/* Streaming query indicator */}
            {querying && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white/5 text-slate-400 rounded-2xl p-4.5 border border-white/10 text-xs flex items-center gap-2">
                  <Flame className="w-4 h-4 text-purple-500 animate-spin" />
                  <span>Scanning portfolio logic. Executing risk matrices...</span>
                </div>
              </div>
            )}
            
            <div ref={chatBottomRef} />
          </div>

          {/* Submission bar */}
          <div className="flex gap-2.5 pt-3 border-t border-white/10">
            <input
              type="text"
              placeholder="Ask mentor: 'Audit NVDA trade timing', 'How to reduce stop loss wipes'..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleQueryMentor(userInput);
              }}
              className="flex-1 bg-[#05070A] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[#a855f7]"
            />
            <button
              onClick={() => handleQueryMentor(userInput)}
              className="p-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all shadow-md active:scale-95 flex items-center justify-center shrink-0 border border-purple-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
