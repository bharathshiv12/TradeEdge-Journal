import React from "react";
import { 
  LayoutDashboard, 
  PlusCircle, 
  BookOpen, 
  Compass, 
  Flame, 
  Calendar, 
  Settings, 
  TrendingUp, 
  Users,
  ChevronLeft,
  ChevronRight,
  Menu,
  Sparkles,
  LogOut
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  userPlan: 'FREE' | 'PRO';
  userEmail: string;
  userName: string;
  userAvatar?: string;
  onLogout?: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  userPlan,
  userEmail,
  userName,
  userAvatar,
  onLogout
}: SidebarProps) {
  
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "add-trade", label: "Add Trade", icon: PlusCircle, highlight: true },
    { id: "trades", label: "Trade Logs", icon: BookOpen },
    { id: "strategy", label: "Strategy", icon: Compass },
    { id: "analysis", label: "Analysis", icon: Flame, badge: "AI" },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside 
      id="sidebar-nav"
      className={`fixed top-0 left-0 z-50 h-screen transition-all duration-300 ease-in-out glass flex flex-col justify-between border-r border-white/5 select-none
        ${collapsed ? "w-20" : "w-68"} bg-[#020617]/95`}
    >
      {/* Top Banner Branding */}
      <div>
        <div className="p-5 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative group p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-blue-500/20">
              <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 rounded-xl bg-cyan-500/20 blur-sm scale-0 group-hover:scale-125 transition-all"></div>
            </div>
            {!collapsed && (
              <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent truncate select-none">
                TradeEdge <span className="text-cyan-400 font-semibold text-xs ml-1 px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-glow-blue">JOURNAL</span>
              </span>
            )}
          </div>

          <button
            id="toggle-sidebar"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Core */}
        <nav className="p-3 mt-4 space-y-1 my-navigation flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg transition-all duration-200 group relative border-l-3 sidebar-item
                  ${isActive 
                    ? "active-sidebar text-cyan-400 font-bold border-cyan-400 bg-cyan-500/5 shadow-inner shadow-cyan-500/5" 
                    : "border-transparent text-slate-400 hover:text-white hover:bg-white/5 h-nav"
                  }
                  ${item.highlight && !isActive ? "text-cyan-400 hover:text-cyan-300" : ""}
                `}
              >
                <div className={`relative ${isActive ? "text-cyan-400 text-glow-blue" : "text-slate-400 group-hover:text-slate-200"}`}>
                  <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105`} />
                  {item.highlight && !isActive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  )}
                </div>

                {!collapsed && (
                  <span className="text-sm tracking-wide font-sans truncate block flex-1 text-left select-none">
                    {item.label}
                  </span>
                )}

                {/* Sub-badge display */}
                {item.badge && !collapsed && (
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-cyan-400/15 border border-cyan-400/30 text-cyan-400 text-glow-blue scale-90">
                    {item.badge}
                  </span>
                )}

                {/* Micro hover utility block for collapsed version */}
                {collapsed && (
                  <div className="absolute left-20 scale-0 group-hover:scale-100 bg-[#04081c] border border-white/5 text-slate-100 text-xs px-3 py-2 rounded-md transition-all shadow-xl origin-left pointer-events-none whitespace-nowrap font-sans font-medium">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Session Profile segment */}
      <div className="p-3 border-t border-white/5">
        {!collapsed ? (
          <div className="p-3 rounded-xl bg-[#04091a]/80 border border-white/5 flex items-center gap-3">
            <img 
              src={userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop"} 
              alt={userName} 
              className="w-10 h-10 rounded-lg object-cover ring-2 ring-cyan-500/30"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-100 truncate">{userName}</p>
              <div className="flex items-center justify-between gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold text-glow-blue text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-500/20">
                  {userPlan} MEMBER
                </span>
                {onLogout && (
                  <button 
                    onClick={onLogout}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                    title="Log out of cockpit"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-2 relative group cursor-pointer" onClick={onLogout}>
            <img 
              src={userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop"} 
              alt={userName} 
              className="w-9 h-9 rounded-lg object-cover ring-2 ring-cyan-500/30 hover:ring-rose-500/60 transition-all"
              referrerPolicy="no-referrer"
            />
            <div className="absolute left-20 scale-0 group-hover:scale-100 bg-[#04081a] border border-white/5 text-slate-100 text-xs p-3 rounded-md transition-all shadow-xl origin-left pointer-events-none whitespace-nowrap space-y-1">
              <p className="font-semibold text-slate-200">{userName}</p>
              <p className="text-[10px] text-cyan-400 font-bold">{userPlan} PLAN ACTIVE</p>
              <p className="text-[8px] text-rose-400 font-semibold font-mono">CLICK TO LOG OUT</p>
            </div>
          </div>
        )}
        
        {!collapsed && (
          <div className="mt-2.5 flex justify-between items-center px-1 text-xs text-slate-500 font-medium select-none">
            <span>Server Stable</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        )}
      </div>
    </aside>
  );
}
