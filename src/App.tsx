import React, { useState, useEffect } from "react";
import { 
  Menu, 
  X, 
  Sparkles, 
  TrendingUp, 
  Cpu, 
  Activity, 
  HardDrive,
  User,
  Zap,
  BookOpen
} from "lucide-react";
import Sidebar from "./components/Sidebar.tsx";
import Dashboard from "./components/Dashboard.tsx";
import AddTrade from "./components/AddTrade.tsx";
import TradesView from "./components/TradesView.tsx";
import StrategyHub from "./components/StrategyHub.tsx";
import AiMentor from "./components/AiMentor.tsx";
import CalendarMap from "./components/CalendarMap.tsx";
import SettingsView from "./components/SettingsView.tsx";
import AuthPage from "./components/AuthPage.tsx";
import { Trade, Strategy, User as UserType, CalendarDailyStats, UserSettings } from "./types.ts";

export default function App() {
  
  // Navigation active screen
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // States
  const [user, setUser] = useState<UserType | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Session Header Extractor
  const getSessionHeaders = (forcedEmail?: string) => {
    if (forcedEmail) {
      return { "x-user-email": forcedEmail };
    }
    const localUser = localStorage.getItem("tradeedge_session_user");
    if (localUser) {
      try {
        const parsed = JSON.parse(localUser);
        if (parsed?.email) {
          return { "x-user-email": parsed.email };
        }
      } catch (e) {
        // ignore
      }
    }
    return {};
  };

  // Load Initial API data pools
  const fetchAllData = async (forcedEmail?: string) => {
    try {
      const headers = getSessionHeaders(forcedEmail);
      const [userRes, tradesRes, strategiesRes, calendarRes] = await Promise.all([
        fetch("/api/user", { headers }),
        fetch("/api/trades", { headers }),
        fetch("/api/strategies", { headers }),
        fetch("/api/calendar", { headers })
      ]);

      if (userRes.ok) {
        const uObj = await userRes.json();
        setUser(uObj);
        localStorage.setItem("tradeedge_session_user", JSON.stringify(uObj));
      }
      if (tradesRes.ok) setTrades(await tradesRes.json());
      if (strategiesRes.ok) setStrategies(await strategiesRes.json());
      if (calendarRes.ok) setCalendarDays(await calendarRes.json());
      
    } catch (err) {
      console.error("[TradeEdge APP] Fetch sequence failed. Checking standard fallback pipelines.", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Session Loader from localStorage on initialization
    const localUser = localStorage.getItem("tradeedge_session_user");
    if (!localUser) {
      setUser(null);
      setLoading(false);
    } else {
      const parsed = JSON.parse(localUser);
      // Retrieve modern cloud profile context on startup
      const headers = { "x-user-email": parsed.email };
      fetch("/api/user", { headers })
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          throw new Error("Session is invalid on backend.");
        })
        .then((latestUser) => {
          setUser(latestUser);
          localStorage.setItem("tradeedge_session_user", JSON.stringify(latestUser));
          fetchAllData(latestUser.email);
        })
        .catch((err) => {
          console.warn("Offline login or connection fallback:", err);
          setUser(parsed);
          fetchAllData(parsed.email);
        });
    }

    // Set up polling loop to sync prices in background
    const pricingSync = setInterval(async () => {
      try {
        const trRes = await fetch("/api/trades", { headers: getSessionHeaders() });
        if (trRes.ok) {
          const updatedTrades = await trRes.json();
          setTrades(updatedTrades);
        }
      } catch (err) {
        console.warn("Pricing ticker polling paused.", err);
      }
    }, 5000);

    return () => clearInterval(pricingSync);
  }, []);

  // Sync selected theme dynamically on DOM root element class
  useEffect(() => {
    const activeTheme = user?.settings?.appearance?.theme || "dark-navy";
    document.documentElement.className = "";
    document.documentElement.classList.add(`theme-${activeTheme}`);
  }, [user?.settings?.appearance?.theme]);

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    setLoading(true);
    fetchAllData(userData.email);
  };

  const handleLogout = () => {
    localStorage.removeItem("tradeedge_session_user");
    setUser(null);
  };

  // Handlers
  const handleAddTrade = async (payload: any): Promise<boolean> => {
    try {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getSessionHeaders() },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchAllData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const handleUpdateTradeStatus = async (id: string, exitPrice: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/trades/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getSessionHeaders() },
        body: JSON.stringify({
          exitPrice,
          status: "CLOSED"
        })
      });
      if (res.ok) {
        await fetchAllData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const handleDeleteTrade = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/trades/${id}`, {
        method: "DELETE",
        headers: getSessionHeaders()
      });
      if (res.ok) {
        await fetchAllData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const handleAddStrategy = async (payload: any): Promise<boolean> => {
    try {
      const res = await fetch("/api/strategies", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getSessionHeaders() },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchAllData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const handleUpdateSettings = async (settings: Partial<UserSettings>): Promise<boolean> => {
    try {
      const res = await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getSessionHeaders() },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        await fetchAllData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#020617] text-slate-100 flex flex-col justify-center items-center gap-4 select-none">
        <Activity className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className="text-sm font-display font-medium text-slate-300 uppercase tracking-widest text-glow-blue">
          Initializing TradeEdge Cockpit...
        </p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans antialiased text-base">
      
      {/* BACKGROUND SCI-FI GLOW METAPHORS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-cyan-900/5 blur-[120px]"></div>
        <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full bg-blue-900/5 blur-[120px]"></div>
      </div>

      {/* MOBILE HEADER TOP NAV BAR */}
      <header className="fixed top-0 inset-x-0 z-40 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 h-14 px-4 flex items-center justify-between md:hidden">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 font-bold text-white text-xs">
            TE
          </div>
          <span className="font-display font-bold text-slate-200 tracking-tight">TradeEdge Journal</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* MOBILE MENU LISTS DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 pt-16 bg-[#020617] md:hidden px-6 space-y-4 animate-slideDown">
          {[
            { id: "dashboard", label: "Dashboard" },
            { id: "add-trade", label: "Add Trade Record" },
            { id: "trades", label: "Trade Logs" },
            { id: "strategy", label: "Strategy" },
            { id: "analysis", label: "Analysis" },
            { id: "calendar", label: "Performance Calendar" },
            { id: "settings", label: "Preferences" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left py-3 text-lg font-semibold border-b border-white/5
                ${activeTab === item.id ? "text-cyan-400 font-bold" : "text-slate-400"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* COMPACT MAIN WRAPPER FRAMEWORK */}
      <div className="flex relative min-h-screen">
        
        {/* DESKTOP SIDEBAR NAVIGATION */}
        <div className="hidden md:block">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
            userPlan={user.settings.subscription.plan}
            userEmail={user.email}
            userName={user.name}
            userAvatar={user.avatar}
            onLogout={handleLogout}
          />
        </div>

        {/* RIGHTSIDE WORKSPACE AREA */}
        <main 
          className={`flex-1 transition-all duration-300 pt-16 md:pt-0 min-h-screen relative z-10 p-4 md:p-8
            ${sidebarCollapsed ? "md:pl-28" : "md:pl-76"}
          `}
        >
          {/* CORE PAGE SWITCH CASE RENDERING SWITCH */}
          <div className="max-w-7xl mx-auto">
            {activeTab === "dashboard" && (
              <Dashboard
                trades={trades}
                strategies={strategies}
                accountSize={user.settings.trading.accountSize}
                currency={user.settings.trading.currency}
                onNavigate={setActiveTab}
                theme={user.settings.appearance.theme || "dark-navy"}
                userName={user.name}
              />
            )}
            
            {activeTab === "add-trade" && (
              <AddTrade
                strategies={strategies}
                onAddTrade={handleAddTrade}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === "trades" && (
              <TradesView
                trades={trades}
                strategies={strategies}
                currency={user.settings.trading.currency}
                onUpdateTradeStatus={handleUpdateTradeStatus}
                onDeleteTrade={handleDeleteTrade}
              />
            )}

            {activeTab === "strategy" && (
              <StrategyHub
                strategies={strategies}
                onAddStrategy={handleAddStrategy}
              />
            )}

            {activeTab === "analysis" && (
              <AiMentor
                trades={trades}
                currency={user.settings.trading.currency}
              />
            )}

            {activeTab === "calendar" && (
              <CalendarMap
                calendarData={calendarDays}
                currency={user.settings.trading.currency}
              />
            )}

            {activeTab === "settings" && (
              <SettingsView
                user={user}
                onUpdateSettings={handleUpdateSettings}
              />
            )}
          </div>
        </main>

      </div>

    </div>
  );
}
