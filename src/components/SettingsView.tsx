import React, { useState } from "react";
import { 
  Settings, 
  Sparkles, 
  HelpCircle, 
  ShieldAlert, 
  Percent, 
  Eye, 
  Sliders, 
  Bell, 
  CreditCard,
  Activity,
  Check,
  Zap,
  HardDrive
} from "lucide-react";
import { User, UserSettings } from "../types";

interface SettingsViewProps {
  user: User;
  onUpdateSettings: (settings: Partial<UserSettings>) => Promise<boolean>;
}

export default function SettingsView({ user, onUpdateSettings }: SettingsViewProps) {
  
  // Custom states
  const [activeSegment, setActiveSegment] = useState<"appearance" | "trading" | "notifications" | "subscription">("appearance");
  
  // Active settings state variables
  const [accountSize, setAccountSize] = useState(user.settings.trading.accountSize.toString());
  const [currency, setCurrency] = useState(user.settings.trading.currency);
  const [defaultLeverage, setDefaultLeverage] = useState(user.settings.trading.defaultLeverage);
  const [riskPercent, setRiskPercent] = useState(user.settings.trading.riskPercent);
  
  // Appearance States
  const [theme, setTheme] = useState(user.settings.appearance.theme || "dark-navy");
  const [glowIntensity, setGlowIntensity] = useState(user.settings.appearance.glowIntensity);
  const [compactMode, setCompactMode] = useState(user.settings.appearance.compactMode);
  
  // Notice states
  const [tradeReminders, setTradeReminders] = useState(user.settings.notifications.tradeReminders);
  const [weeklySummaries, setWeeklySummaries] = useState(user.settings.notifications.weeklySummaries);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Trigger Save Updates
  const executeSaveSettings = async () => {
    setSaving(true);
    const updatedPayload: Partial<UserSettings> = {
      trading: {
        accountSize: parseFloat(accountSize) || 100000,
        currency,
        timezone: user.settings.trading.timezone,
        defaultLeverage,
        riskPercent,
        autoSaveNotes: user.settings.trading.autoSaveNotes
      },
      appearance: {
        theme: theme,
        accentColor: user.settings.appearance.accentColor,
        animationsEnabled: user.settings.appearance.animationsEnabled,
        glowIntensity: glowIntensity,
        compactMode: compactMode
      },
      notifications: {
        tradeReminders,
        journalingReminders: user.settings.notifications.journalingReminders,
        weeklySummaries,
        streakAlerts: user.settings.notifications.streakAlerts
      }
    };

    const s = await onUpdateSettings(updatedPayload);
    setSaving(false);
    if (s) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const navMenuItems = [
    { id: "appearance", label: "Appearance", icon: Eye },
    { id: "trading", label: "Trading parameters", icon: Sliders },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "subscription", label: "Subscription plan & Billing", icon: CreditCard },
  ] as const;

  const availableThemes = [
    {
      id: "dark-navy",
      name: "Deep Blue",
      tag: "DEFAULT",
      label: "Modern Fintech",
      description: "Premium fintech SaaS. Dark navy workspace with sleek cyan alerts.",
      colorBadge: "bg-cyan-500",
      accentText: "text-cyan-400",
      accentBorder: "border-cyan-500/30",
      accentBg: "from-blue-950/20 to-cyan-950/40",
      chartStroke: "#06b6d4",
      pnlColor: "text-emerald-400"
    },
    {
      id: "neon-purple",
      name: "Neon Purple",
      tag: "FUTURISTIC",
      label: "Dark Futuristic",
      description: "High-tech workspace with deep rich purple neon glow aesthetics.",
      colorBadge: "bg-purple-500",
      accentText: "text-purple-400",
      accentBorder: "border-purple-500/30",
      accentBg: "from-fuchsia-950/20 to-purple-950/40",
      chartStroke: "#a855f7",
      pnlColor: "text-fuchsia-400"
    },
    {
      id: "green-terminal",
      name: "Green Accent",
      tag: "TERMINAL",
      label: "Trader Terminal",
      description: "Classic hedge fund look with neon green highlights and high-density stats.",
      colorBadge: "bg-emerald-500",
      accentText: "text-emerald-400",
      accentBorder: "border-emerald-500/30",
      accentBg: "from-emerald-950/20 to-green-950/40",
      chartStroke: "#10b981",
      pnlColor: "text-emerald-400"
    },
    {
      id: "light",
      name: "Light Theme",
      tag: "MINIMAL",
      label: "Clean Professional",
      description: "Clean off-white SaaS backdrop with high contrast typography.",
      colorBadge: "bg-blue-600",
      accentText: "text-blue-600",
      accentBorder: "border-blue-200",
      accentBg: "from-slate-100 to-slate-200/50",
      chartStroke: "#2563eb",
      pnlColor: "text-emerald-600"
    },
    {
      id: "cyberpunk",
      name: "Cyberpunk",
      tag: "CYBER",
      label: "Neon + Gradients",
      description: "Vibrant high-contrast pink gradients and neon cyan command centers.",
      colorBadge: "bg-pink-500",
      accentText: "text-pink-400",
      accentBorder: "border-pink-500/30",
      accentBg: "from-pink-950/20 to-violet-950/40",
      chartStroke: "#f43f5e",
      pnlColor: "text-cyan-400"
    },
    {
      id: "minimal-dark",
      name: "Minimal Dark",
      tag: "PRODUCTIVITY",
      label: "Sleek Simple",
      description: "Sleek matte-black canvas, slate accents, low contrast labels for focus.",
      colorBadge: "bg-zinc-500",
      accentText: "text-slate-300",
      accentBorder: "border-zinc-800",
      accentBg: "from-zinc-900/40 to-slate-950/40",
      chartStroke: "#71717a",
      pnlColor: "text-emerald-400"
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-medium text-slate-100 tracking-tight">
          System Preferences
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Fine tune parameters, set standard account coordinates, and track Stripe SaaS premium licenses.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/55 text-emerald-300 text-xs flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" /> <span>Settings parameters synced securely with TradeEdge server databases.</span>
        </div>
      )}

      {/* SETTINGS CORE PANEL GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Sidebar categories navigation (1 column) */}
        <div className="rounded-2xl glass-panel p-4 shadow-xl space-y-1 md:col-span-1 h-fit">
          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const active = activeSegment === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSegment(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left text-xs font-semibold tracking-wide transition-all
                  ${active 
                    ? "bg-[#a855f7]/15 border-l-2 border-[#a855f7] text-[#a855f7] font-bold" 
                    : "text-slate-400 hover:bg-[#05070A]/40 hover:text-slate-200"
                  }
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Core segment configs content panel (3 columns) */}
        <div className="md:col-span-3 rounded-2xl glass-panel p-6 shadow-xl relative min-h-[380px] flex flex-col justify-between">
          
          <div className="space-y-6">

            {/* 1. APPEARANCE SEGMENT */}
            {activeSegment === "appearance" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-md font-display font-semibold text-slate-100 flex items-center gap-2">
                    <Eye className="w-4.5 h-4.5 text-cyan-400" /> Appearance & Theme customization
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Select a curated institutional identity. Theme changes propagate globally across all modules in real-time.
                  </p>
                </div>

                 {/* THEME PREVIEW SELECTION GRID (6 CURATED THEMES) */}
                <div>
                  <label className="text-xs text-slate-400 font-semibold uppercase block mb-3 font-sans tracking-wide">Background Themes</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableThemes.map((tItem) => {
                      const isActive = theme === tItem.id;
                      return (
                        <button
                          key={tItem.id}
                          type="button"
                          onClick={() => {
                            setTheme(tItem.id);
                            // Apply theme class instantly to HTML DOM root
                            document.documentElement.className = "";
                            document.documentElement.classList.add(`theme-${tItem.id}`);
                            // Auto save settings
                            const updatedPayload: Partial<UserSettings> = {
                              appearance: {
                                theme: tItem.id,
                                accentColor: user.settings.appearance.accentColor,
                                animationsEnabled: user.settings.appearance.animationsEnabled,
                                glowIntensity: glowIntensity,
                                compactMode: compactMode
                              }
                            };
                            onUpdateSettings(updatedPayload);
                          }}
                          className={`w-full text-left rounded-2xl p-4 transition-all duration-300 border relative overflow-hidden select-none group focus:outline-none flex flex-col justify-between h-48 cursor-pointer
                            ${isActive
                              ? `bg-slate-950/80 border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30`
                              : "bg-slate-900/30 hover:bg-slate-900/50 border-white/5 hover:border-white/10"
                            }
                          `}
                          style={{
                            borderColor: isActive ? tItem.chartStroke : undefined,
                            boxShadow: isActive ? `0 0 20px ${tItem.chartStroke}20` : undefined
                          }}
                        >
                          {/* Mini Header Details */}
                          <div className="flex items-center justify-between w-full relative z-10">
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block font-mono">{tItem.label}</span>
                              <h4 className="text-xs font-bold text-slate-200 mt-0.5 flex items-center gap-1.5">
                                {tItem.name}
                                {tItem.tag && (
                                  <span className={`text-[8px] font-bold px-1 py-0.2 rounded font-mono border ${tItem.accentBorder} ${tItem.accentText} bg-white/5`}>
                                    {tItem.tag}
                                  </span>
                                )}
                              </h4>
                            </div>
                            
                            {/* Active Indicator check indicator */}
                            <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border transition-all ${isActive ? "border-cyan-400 bg-cyan-950" : "border-white/10"}`}>
                              {isActive && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tItem.chartStroke }} />}
                            </div>
                          </div>

                          {/* Mini Mock Dashboard visualization diagram */}
                          <div className={`my-2 p-2 rounded-lg bg-black/40 border border-white/5 space-y-1 bg-gradient-to-br ${tItem.accentBg}`}>
                            <div className="flex items-center justify-between text-[8px] font-mono text-slate-400">
                              <span>Equity</span>
                              <span className={tItem.pnlColor || "text-emerald-400"}>+$1,450.00</span>
                            </div>
                            {/* Mini Vector Line graph mockup */}
                            <div className="h-4 flex items-end">
                              <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                                <path 
                                  d="M 0 18 Q 15 15 25 17 T 50 10 T 75 8 T 100 2" 
                                  fill="none" 
                                  stroke={isActive ? "#06b6d4" : tItem.chartStroke} 
                                  strokeWidth="1.5" 
                                />
                                <circle cx="100" cy="2" r="1.5" fill={isActive ? "#22d3ee" : tItem.chartStroke} />
                              </svg>
                            </div>
                          </div>

                          {/* Decriptive label */}
                          <p className="text-[10px] text-slate-400 leading-normal line-clamp-2 mt-1 relative z-10">
                            {tItem.description}
                          </p>

                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Glow selector */}
                  <div>
                    <label className="text-xs text-slate-400 font-semibold uppercase block mb-2 font-sans tracking-wide">Aura Neon Glow Intensity</label>
                    <select
                      value={glowIntensity}
                      onChange={(e: any) => setGlowIntensity(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-300 font-medium cursor-pointer"
                    >
                      <option value="low">Low (Minimal borders)</option>
                      <option value="medium">Medium (Standard outlines)</option>
                      <option value="high">High (High-end sci-fi glow effects)</option>
                    </select>
                  </div>

                  {/* Compact mode toggle view option */}
                  <div className="bg-white/5 px-4 py-3 border border-white/10 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">Compact Dashboard View</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Increases layout density of trading tables and lists.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCompactMode(!compactMode)}
                      className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer
                        ${compactMode ? "bg-[#06b6d4]" : "bg-slate-800"}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200
                        ${compactMode ? "translate-x-5" : "translate-x-0"}`}></div>
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* 2. TRADING PARAMETERS SEGMENT */}
            {activeSegment === "trading" && (
              <div className="space-y-5 animate-fadeIn">
                <h3 className="text-md font-display font-semibold text-slate-200 border-b border-white/10 pb-2.5 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" /> Trading coordinates configuration
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Account size */}
                  <div>
                    <label className="text-xs text-slate-400 font-semibold uppercase block mb-2">Base Account Size ($)</label>
                    <input
                      type="number"
                      value={accountSize}
                      onChange={(e) => setAccountSize(e.target.value)}
                      className="w-full bg-[#05070A] border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 font-semibold font-mono"
                    />
                  </div>

                  {/* Currency selector */}
                  <div>
                    <label className="text-xs text-slate-400 font-semibold uppercase block mb-2 font-sans">Default currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-[#05070A] border border-white/10 rounded-xl px-3 py-3 text-xs text-slate-300 font-medium"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>

                  {/* Leverage standard Defaults */}
                  <div>
                    <label className="text-xs text-slate-400 font-semibold uppercase block mb-2">Default Sizing Leverage (x)</label>
                    <input
                      type="number"
                      value={defaultLeverage}
                      onChange={(e) => setDefaultLeverage(Number(e.target.value))}
                      className="w-full bg-[#05070A] border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 font-mono"
                    />
                  </div>

                  {/* Risk limit percentages */}
                  <div>
                    <label className="text-xs text-slate-400 font-semibold uppercase block mb-2">Max Risk Limit per Trade (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={riskPercent}
                        onChange={(e) => setRiskPercent(Number(e.target.value))}
                        className="w-full bg-[#05070A] border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 font-mono"
                      />
                      <Percent className="absolute right-3.5 top-3.5 w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-indigo-950/20 border border-indigo-500/15 rounded-xl text-[11px] leading-relaxed text-indigo-300">
                  Risk limit percentages calculate margin thresholds dynamically relative to account size during trade creation rules.
                </div>
              </div>
            )}

            {/* 3. NOTIFICATIONS CATEGORIES */}
            {activeSegment === "notifications" && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-md font-display font-semibold text-slate-200 border-b border-white/10 pb-2.5 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cyan-400" /> Notifications & Reminders
                </h3>

                <div className="space-y-4 pt-1">
                  
                  {/* Toggle Reminders 1 */}
                  <div className="bg-white/5 p-4 border border-white/10 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">Session Journal Reminders</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Alert rules prompting retro logs 30m after closing active fills.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTradeReminders(!tradeReminders)}
                      className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none
                        ${tradeReminders ? "bg-[#a855f7]" : "bg-slate-800"}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200
                        ${tradeReminders ? "translate-x-5" : "translate-x-0"}`}></div>
                    </button>
                  </div>

                  {/* Toggle Reminders 2 */}
                  <div className="bg-white/5 p-4 border border-white/10 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">Weekly Performance summaries</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Recaps diagnostic accuracy win-rate trends via email.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWeeklySummaries(!weeklySummaries)}
                      className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none
                        ${weeklySummaries ? "bg-[#a855f7]" : "bg-slate-800"}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200
                        ${weeklySummaries ? "translate-x-5" : "translate-x-0"}`}></div>
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* 4. SUBSCRIPTION BILLING COCKPIT */}
            {activeSegment === "subscription" && (
              <div className="space-y-5 animate-fadeIn">
                <h3 className="text-md font-display font-semibold text-slate-200 border-b border-white/10 pb-2.5 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#a855f7]" /> Licensing & Billing
                </h3>

                {/* active status banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/25 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#a855f7] bg-purple-950 px-2 py-0.5 rounded border border-purple-500/30 text-glow-purple uppercase">
                      ACTIVE {user.settings.subscription.plan} LICENSE
                    </span>
                    <h4 className="font-display font-medium text-slate-200 text-sm mt-1">TradeEdge Premium subscription</h4>
                    <p className="text-[10px] text-slate-400">Unlimited neural reviews, deep metrics & automatic market price fills.</p>
                  </div>
                  
                  <div className="shrink-0 flex items-center gap-1.5 bg-[#a855f7] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.3)] select-none">
                    <Zap className="w-3.5 h-3.5" /> PRO USER
                  </div>
                </div>

                {/* Database Metrics bars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  
                  {/* Storage */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
                    <div className="flex justify-between items-center text-xs text-slate-300">
                      <span className="flex items-center gap-1"><HardDrive className="w-3.5 h-3.5 text-slate-500" /> Storage Limit</span>
                      <span className="font-mono">{user.settings.subscription.storageUsedMb}MB / 100MB</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1">
                      <div className="bg-indigo-400 h-full rounded" style={{ width: '14.2%' }}></div>
                    </div>
                  </div>

                  {/* AI credits */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
                    <div className="flex justify-between items-center text-xs text-slate-300">
                      <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-slate-500" /> AI Mentor Credits</span>
                      <span className="font-mono">{user.settings.subscription.aiCreditsUsed} / {user.settings.subscription.aiCreditsMax} q</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1">
                      <div className="bg-purple-500 h-full rounded" style={{ width: '38%' }}></div>
                    </div>
                  </div>

                </div>

                {/* Stripe Upgrade payment details display mock block */}
                <div className="border border-white/5 rounded-xl p-4.5 text-xs text-slate-400 leading-relaxed font-sans bg-black/35">
                  Billing flows are processed securely. To manage subscriptions or upgrade storage plans, use the <strong>Stripe Billing portal integration</strong> links in your cockpit profile dashboard.
                </div>
              </div>
            )}

          </div>

          {/* Bottom Saving triggers (visible across all active sections except billing) */}
          {activeSegment !== "subscription" && (
            <div className="pt-6 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={executeSaveSettings}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all border border-purple-500/20"
              >
                {saving ? "Storing configurations..." : "Save Preferences"}
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
