import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle,
  TrendingDown,
  Globe,
  CornerDownRight,
  Info,
  Phone,
  HelpCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Activity,
  Cpu,
  Zap,
  Layers,
  ArrowUpRight,
  Compass
} from "lucide-react";

interface AuthPageProps {
  onLoginSuccess: (user: any) => void;
}

const SECURITY_QUESTIONS = [
  "What city were you born in?",
  "What is your mother's maiden name?",
  "What is your first pet's name?",
  "What was the name of your first school?",
  "What was the make of your first car?"
];

type AssetType = "BTC" | "ETH" | "SOL";

interface AssetData {
  name: string;
  ticker: string;
  price: string;
  change: string;
  isPositive: boolean;
  color: string;
  chartPath: string;
  volume: string;
  high: string;
}

const ASSET_REGISTRY: Record<AssetType, AssetData> = {
  BTC: {
    name: "Bitcoin",
    ticker: "BTCUSDT",
    price: "$68,492.50",
    change: "+4.12%",
    isPositive: true,
    color: "#06b6d4", // cyan
    chartPath: "M 0 85 Q 15 65 25 75 T 50 35 T 75 25 T 100 10 L 100 100 L 0 100 Z",
    volume: "28.4B Volt",
    high: "$69,120.00"
  },
  ETH: {
    name: "Ethereum",
    ticker: "ETHUSDT",
    price: "$3,624.15",
    change: "+3.84%",
    isPositive: true,
    color: "#a855f7", // purple
    chartPath: "M 0 90 Q 15 80 25 82 T 50 45 T 75 40 T 100 20 L 100 100 L 0 100 Z",
    volume: "14.2B Volt",
    high: "$3,680.00"
  },
  SOL: {
    name: "Solana",
    ticker: "SOLUSDT",
    price: "$174.68",
    change: "-1.45%",
    isPositive: false,
    color: "#f43f5e", // rose
    chartPath: "M 0 40 Q 15 48 25 35 T 50 65 T 75 55 T 100 80 L 100 100 L 0 100 Z",
    volume: "4.8B Volt",
    high: "$182.30"
  }
};

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [view, setView] = useState<"login" | "signup" | "forgot">("login");
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [activeAsset, setActiveAsset] = useState<AssetType>("BTC");

  // Form Fields State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState("");

  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Focus state styling helper
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Auto tick mock terminal updates for visual richness
  const [liveTicks, setLiveTicks] = useState<{ id: number; text: string }[]>([]);
  useEffect(() => {
    const defaultTicks = [
      { id: 1, text: "System ready: SSL connection secured" },
      { id: 2, text: "SQL Database connected via High-Speed engine" }
    ];
    setLiveTicks(defaultTicks);

    const interval = setInterval(() => {
      const messages = [
        "Network latency optimized: 14ms",
        "Encrypted database node stabilized",
        "Algorithmic trade patterns parsed",
        "Volatility index calculations refreshed",
        "Client security protocol compliant"
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setLiveTicks(prev => {
        const next = [...prev, { id: Date.now(), text: randomMsg }];
        return next.slice(-3); // Keep last 3 items
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const response = await fetch("/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Guest Operator #${randomId}`,
          email: `guest_trader_${randomId}@tradeedge.com`,
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
        })
      });
      const data = await response.json();
      if (response.ok && data.user) {
        getUserAndSuccess(data.user);
      } else {
        setError(data.error || "Simulated guest sign in failed.");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError(err?.message || "Guest registration verification failed on server directory.");
      setIsSubmitting(false);
    }
  };

  const getUserAndSuccess = (userData: any) => {
    localStorage.setItem("tradeedge_session_user", JSON.stringify(userData));
    onLoginSuccess(userData);
    setIsSubmitting(false);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      if (view === "login") {
        if (!email || !password) {
          throw new Error("Please enter both email address and password credentials.");
        }

        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
          getUserAndSuccess(data.user);
        } else {
          setError(data.error || "Invalid credentials. Authorization failed.");
          setIsSubmitting(false);
        }

      } else if (view === "signup") {
        if (!name || !email || !phone || !password || !confirmPassword || !securityQuestion || !securityAnswer) {
          throw new Error("All fields must be completed to establish your profile.");
        }
        if (password !== confirmPassword) {
          throw new Error("Confirmation password does not match original password.");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters in length.");
        }

        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            name, 
            email, 
            phone, 
            password, 
            securityQuestion, 
            securityAnswer 
          })
        });

        const data = await response.json();
        if (response.ok) {
          setSuccess("Account registered successfully! Establishing live sandbox session...");
          setTimeout(() => {
            getUserAndSuccess(data.user);
          }, 1200);
        } else {
          setError(data.error || "Database persistence failed on signup.");
          setIsSubmitting(false);
        }

      } else if (view === "forgot") {
        if (forgotStep === 1) {
          if (!email) throw new Error("Email address is required.");

          const response = await fetch("/api/auth/forgot-step1", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
          });

          const data = await response.json();
          if (response.ok) {
            setSecurityQuestion(data.securityQuestion);
            setForgotStep(2);
            setSuccess("Email coordinates loaded. Please answer your custom security challenge.");
          } else {
            setError(data.error || "Account associated with this email address not found.");
          }
          setIsSubmitting(false);

        } else if (forgotStep === 2) {
          if (!securityAnswer || !password || !confirmPassword) {
            throw new Error("All parameters are required to reset security credentials.");
          }
          if (password !== confirmPassword) {
            throw new Error("Confirmation password does not match new password.");
          }
          if (password.length < 6) {
            throw new Error("New password must be at least 6 characters.");
          }

          const response = await fetch("/api/auth/forgot-step2", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              email, 
              securityAnswer, 
              newPassword: password 
            })
          });

          const data = await response.json();
          if (response.ok) {
            setSuccess("Password key altered successfully! Returning to Login view.");
            setTimeout(() => {
              setView("login");
              setForgotStep(1);
              setPassword("");
              setConfirmPassword("");
              setSecurityAnswer("");
              setSuccess(null);
            }, 1800);
          } else {
            setError(data.error || "Security token answer is incorrect. Reset authorization rejected.");
          }
          setIsSubmitting(false);
        }
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected framework validation error occurred.");
      setIsSubmitting(false);
    }
  };

  const selectedAsset = ASSET_REGISTRY[activeAsset];

  return (
    <div className="min-h-screen w-full bg-[#02040a] text-slate-100 flex flex-col lg:flex-row font-sans relative overflow-hidden">
      
      {/* Decorative High-Fidelity Custom Space Background Matrix */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
        {/* Colorful dynamic background glows */}
        <div className="absolute top-[-400px] left-[-200px] w-[900px] h-[900px] rounded-full bg-gradient-to-tr from-cyan-600/10 to-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-[-300px] right-[-200px] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-violet-600/10 to-cyan-500/10 blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-blue-500/[0.03] blur-[120px] pointer-events-none" />
        
        {/* Subtle grid system */}
        <div 
          className="absolute inset-0 opacity-[0.06] transition-opacity duration-700"
          style={{
            backgroundImage: `
              linear-gradient(to right, #3b82f6 1px, transparent 1px),
              linear-gradient(to bottom, #3b82f6 1px, transparent 1px)
            `,
            backgroundSize: "44px 44px"
          }}
        />
        
        {/* Soft radar waves */}
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] border border-blue-500/[0.05] rounded-full animate-[spin_80s_linear_infinite] shrink-0" />
        <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] border border-cyan-500/[0.03] rounded-full animate-[spin_40s_linear_infinite_reverse] shrink-0" />
      </div>

      {/* LEFT PANEL: Branding & Interactive Live Asset Tracker */}
      <div className="w-full lg:w-1/2 xl:w-5/12 p-8 sm:p-12 xl:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/5 bg-[#030611]/60 backdrop-blur-3xl z-10 relative overflow-hidden">
        
        {/* Ambient panel glows */}
        <div className="absolute -top-40 -left-40 w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[80px]" />
        <div className="absolute bottom-10 right-10 w-[250px] h-[250px] rounded-full bg-blue-500/10 blur-[90px]" />

        {/* Top Header - TradeEdge Branding */}
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-xl shadow-cyan-500/25 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-2xl tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  TradeEdge
                </span>
                <span className="text-[9px] tracking-widest font-mono border border-cyan-500/40 px-2 py-0.5 rounded-full text-cyan-300 bg-cyan-950/50 uppercase font-bold text-[8px]">
                  Engine v2
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono tracking-wide">SECURE SQL ARCHITECTURE</p>
            </div>
          </div>
          
          <div className="pt-8 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-[11px] text-slate-300 font-medium backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Multi-Asset Telemetry Live</span>
            </div>

            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight text-white max-w-lg">
              Precision <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent font-black">Trade Logging</span> & Analytics OS
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Discover raw edge in volatile markets. Log executions, evaluate custom setup formulas, visualize equity performance, and interact with an elite AI analysis supervisor.
            </p>
          </div>
        </div>

        {/* Dynamic Interactive Trading Sandbox Tickers */}
        <div className="my-10 p-6 rounded-3xl border border-white/10 bg-[#040815]/80 backdrop-blur-md relative z-10 shadow-2xl transition-all duration-300 hover:border-white/15">
          {/* Header & asset fast switches */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-500 font-sans uppercase font-bold tracking-wider">Interactive Live Feed</span>
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
                <span className="font-mono text-xs font-bold text-slate-300">Market Index Live</span>
              </div>
            </div>
            
            {/* Elegant pill selectors */}
            <div className="flex bg-white/[0.04] p-1 rounded-xl border border-white/5 self-start">
              {(["BTC", "ETH", "SOL"] as AssetType[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveAsset(tab)}
                  className={`px-3 py-1 text-xs font-bold font-mono rounded-lg transition-all duration-200 ${
                    activeAsset === tab
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Asset values panel */}
          <div className="pt-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 font-bold tracking-tight">{selectedAsset.name} Ticker</span>
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-2xl font-black text-white tracking-tight">{selectedAsset.price}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-mono flex items-center gap-0.5 ${
                  selectedAsset.isPositive 
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                }`}>
                  {selectedAsset.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {selectedAsset.change}
                </span>
              </div>
            </div>
            <div className="text-right space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">24h Peak Value</span>
              <p className="font-mono text-xs font-bold text-slate-200">{selectedAsset.high}</p>
            </div>
          </div>
          
          {/* Glowing svg chart visualization */}
          <div className="h-28 flex items-end select-none pt-4 relative overflow-hidden rounded-xl bg-gradient-to-b from-[#02040b]/0 to-cyan-950/10">
            <div className="absolute inset-x-0 bottom-0 top-0 h-full flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-t border-dashed border-white/10 w-full" />
              <div className="border-t border-dashed border-white/10 w-full" />
              <div className="border-t border-dashed border-white/10 w-full" />
            </div>

            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id={`glowGrad-${activeAsset}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={selectedAsset.color} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={selectedAsset.color} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path 
                d={selectedAsset.chartPath} 
                fill={`url(#glowGrad-${activeAsset})`}
                className="transition-all duration-500 ease-in-out"
              />
              <path 
                d={selectedAsset.chartPath.split(" L 100")[0]} 
                fill="none" 
                stroke={selectedAsset.color} 
                strokeWidth="2.5"
                className="animate-pulse transition-all duration-500 ease-in-out"
              />
              <circle cx="100" cy="15" r="4.5" fill={selectedAsset.color} className="animate-ping" />
              <circle cx="100" cy="15" r="3" fill="#ffffff" />
            </svg>
          </div>

          {/* Micro metrics footer */}
          <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 font-mono border-t border-white/5 pt-4 mt-2">
            <div>
              <span className="text-[8px] text-slate-500 block uppercase font-sans font-bold">24h Volumetrics</span>
              <span className="font-bold text-slate-200 block mt-0.5">{selectedAsset.volume}</span>
            </div>
            <div>
              <span className="text-[8px] text-slate-500 block uppercase font-sans font-bold">Consistency Index</span>
              <span className="font-bold text-cyan-400 block mt-0.5">89.4% Rated</span>
            </div>
            <div>
              <span className="text-[8px] text-slate-500 block uppercase font-sans font-bold">Max Risk Drawdown</span>
              <span className="font-bold text-rose-400 block mt-0.5">-1.22% Peak</span>
            </div>
          </div>
        </div>

        {/* Live system telemetry line */}
        <div className="space-y-4 pt-4 relative z-10 border-t border-white/5">
          <div className="space-y-1.5">
            <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block font-bold">System Telemetry Log</span>
            <div className="space-y-1 font-mono text-[10px] text-slate-400">
              {liveTicks.map((tick) => (
                <div key={tick.id} className="flex items-center gap-1.5 animate-fadeIn">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-slate-500">[{new Date(tick.id).toLocaleTimeString()}]</span>
                  <span className="text-slate-300 font-medium">{tick.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 select-none gap-2 pt-2">
            <p className="font-mono text-[10px]">© 2026 TradeEdge OS. Secure Multi-Tier SQL Node.</p>
            <div className="flex gap-4 font-mono text-[10px] text-slate-400 font-semibold direct-links">
              <span className="hover:text-cyan-400 cursor-pointer transition-colors">Integrity</span>
              <span>•</span>
              <span className="hover:text-cyan-300 cursor-pointer transition-colors">Supabase Cluster</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: High-Fidelity Glassmorphic Auth Form Container */}
      <div className="w-full lg:w-1/2 xl:w-7/12 p-6 sm:p-12 xl:p-16 flex flex-col justify-center items-center z-10 bg-[#02050c]/85 overflow-y-auto">
        
        {/* Dynamic card with interactive glass highlights */}
        <div className="w-full max-w-md bg-gradient-to-b from-[#060b1e]/90 to-[#030612]/95 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-[0_0_60px_-15px_rgba(6,182,212,0.15)] relative overflow-hidden backdrop-blur-2xl">
          
          {/* Subtle top decoration */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          
          <div className="space-y-3 mb-8 relative">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Zap className="w-4.5 h-4.5 shrink-0 animate-pulse" />
              </div>
              <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest font-black">Secure Operator Node</span>
            </div>

            {view === "login" && (
              <>
                <h2 className="text-3xl font-extrabold tracking-tight text-white font-display">
                  Welcome Back
                </h2>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Provide verified ledger credentials to unlock your institutional operations, strategies, and historic audit matrices.
                </p>
              </>
            )}
            {view === "signup" && (
              <>
                <h2 className="text-3xl font-extrabold tracking-tight text-white font-display">
                  Create Ledger Account
                </h2>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Establish a secure multi-session ledger with full Supabase transactional backup capabilities.
                </p>
              </>
            )}
            {view === "forgot" && (
              <>
                <h2 className="text-3xl font-extrabold tracking-tight text-white font-display">
                  Retrieve Storage Key
                </h2>
                <p className="text-cyan-400 text-xs font-medium leading-relaxed font-mono">
                  {forgotStep === 1 
                    ? "STEP 01: Verify system-linked email coordinate"
                    : "STEP 02: Provide security question response to authorize key reset"
                  }
                </p>
              </>
            )}
          </div>

          {/* Custom animated feedback labels */}
          {error && (
            <div className="flex gap-3 items-start bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl p-4 text-xs animate-[shake_0.4s_ease-in-out]">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              <div>
                <span className="font-bold block uppercase text-[10px] tracking-wider text-rose-400">Error Authorization Failed</span>
                <p className="mt-0.5 text-slate-300 leading-relaxed font-semibold">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="flex gap-3 items-start bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl p-4 text-xs">
              <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400 animate-pulse mt-0.5" />
              <div>
                <span className="font-bold block uppercase text-[10px] tracking-wider text-emerald-400">Transaction Authorized</span>
                <p className="mt-0.5 text-slate-300 leading-relaxed font-semibold">{success}</p>
              </div>
            </div>
          )}

          {/* Quick Sandbox / Google Login Portal */}
          {view === "login" && (
            <div className="space-y-4 mb-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full h-12 border border-cyan-500/30 hover:border-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/40 rounded-xl text-xs font-bold text-cyan-300 transition-all duration-200 flex items-center justify-center gap-3 select-none hover:shadow-cyan-500/10 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="font-mono uppercase tracking-wider">Initialize Guest Developer Mode</span>
              </button>
              
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/5" />
                <span className="flex-shrink mx-4 text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono">Or authentic secure access</span>
                <div className="flex-grow border-t border-white/5" />
              </div>
            </div>
          )}

          {/* Core Fields Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-5">
            
            {/* Extended Sign up Inputs */}
            {view === "signup" && (
              <>
                {/* Full Name */}
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider font-mono">Full Operator Name</label>
                  <div className={`relative rounded-xl border transition-all duration-200 ${
                    focusedField === "name" 
                      ? "border-cyan-500 bg-[#070e24] shadow-[0_0_12px_rgba(6,182,212,0.15)]" 
                      : "border-white/10 bg-white/[0.02]"
                  }`}>
                    <UserIcon className={`absolute left-3.5 top-3.5 w-4.5 h-4.5 transition-colors duration-200 ${
                      focusedField === "name" ? "text-cyan-400" : "text-slate-500"
                    }`} />
                    <input
                      type="text"
                      required
                      placeholder="Alexander Edge"
                      value={name}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      disabled={isSubmitting}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent pl-11 pr-4 py-3.5 text-xs text-white focus:outline-none placeholder-slate-600 font-semibold"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider font-mono">Verified Phone Link</label>
                  <div className={`relative rounded-xl border transition-all duration-200 ${
                    focusedField === "phone" 
                      ? "border-cyan-500 bg-[#070e24] shadow-[0_0_12px_rgba(6,182,212,0.15)]" 
                      : "border-white/10 bg-white/[0.02]"
                  }`}>
                    <Phone className={`absolute left-3.5 top-3.5 w-4.5 h-4.5 transition-colors duration-200 ${
                      focusedField === "phone" ? "text-cyan-400" : "text-slate-500"
                    }`} />
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 019-2834"
                      value={phone}
                      onFocus={() => setFocusedField("phone")}
                      onBlur={() => setFocusedField(null)}
                      disabled={isSubmitting}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-transparent pl-11 pr-4 py-3.5 text-xs text-white focus:outline-none placeholder-slate-600 font-bold font-mono"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Address */}
            {(view === "login" || view === "signup" || (view === "forgot" && forgotStep === 1)) && (
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider font-mono">Email Coordinate</label>
                <div className={`relative rounded-xl border transition-all duration-200 ${
                  focusedField === "email" 
                    ? "border-cyan-500 bg-[#070e24] shadow-[0_0_12px_rgba(6,182,212,0.15)]" 
                    : "border-white/10 bg-white/[0.02]"
                }`}>
                  <Mail className={`absolute left-3.5 top-3.5 w-4.5 h-4.5 transition-colors duration-200 ${
                    focusedField === "email" ? "text-cyan-400" : "text-slate-500"
                  }`} />
                  <input
                    type="email"
                    required
                    placeholder="operator@tradeedge-systems.com"
                    value={email}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    disabled={isSubmitting}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent pl-11 pr-4 py-3.5 text-xs text-white focus:outline-none placeholder-slate-600 font-bold font-mono text-cyan-200"
                  />
                </div>
              </div>
            )}

            {/* Security Challenge step 2 of forgot */}
            {view === "forgot" && forgotStep === 2 && (
              <div className="space-y-4 p-5 bg-[#050B18] border border-cyan-500/20 rounded-2xl animate-fadeIn shadow-inner">
                <div className="flex gap-2.5">
                  <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] text-[#22d3ee] font-mono uppercase block font-black tracking-widest">Linked Security Question</span>
                    <p className="text-slate-200 text-xs font-bold leading-normal mt-1">{securityQuestion}</p>
                  </div>
                </div>
                
                <div className="space-y-1.5 pt-1">
                  <label className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider font-mono">Security Code Answer</label>
                  <input
                    type="text"
                    required
                    placeholder="Input exact security recovery phrase"
                    value={securityAnswer}
                    disabled={isSubmitting}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    className="w-full bg-[#030611] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600 font-semibold"
                  />
                </div>
              </div>
            )}

            {/* Security Selection and Response on Registration */}
            {view === "signup" && (
              <div className="space-y-4 p-5 bg-[#050B18] border border-white/5 rounded-2xl animate-fadeIn space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider font-mono">Recovery Challenge Question</label>
                  <select
                    value={securityQuestion}
                    disabled={isSubmitting}
                    onChange={(e) => setSecurityQuestion(e.target.value)}
                    className="w-full bg-[#02050c] border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold text-slate-200 focus:outline-none focus:border-cyan-400"
                  >
                    {SECURITY_QUESTIONS.map((q, idx) => (
                      <option key={idx} value={q} className="bg-[#02050c] text-slate-200 font-semibold">{q}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider font-mono">Security Answer Response</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter security recovery answer"
                    value={securityAnswer}
                    disabled={isSubmitting}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    className="w-full bg-[#02050c] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-cyan-400 placeholder-slate-600 font-semibold"
                  />
                </div>
              </div>
            )}

            {/* Password input panels */}
            {(view === "login" || view === "signup" || (view === "forgot" && forgotStep === 2)) && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider font-mono">
                    {view === "forgot" ? "New Security Passkey" : "Master Passkey Secure"}
                  </label>
                  {view === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setView("forgot");
                        setForgotStep(1);
                        setError(null);
                        setSuccess(null);
                      }}
                      className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors font-mono uppercase tracking-wider"
                    >
                      Reset Key
                    </button>
                  )}
                </div>
                <div className={`relative rounded-xl border transition-all duration-200 ${
                  focusedField === "password" 
                    ? "border-cyan-500 bg-[#070e24] shadow-[0_0_12px_rgba(6,182,212,0.15)]" 
                    : "border-white/10 bg-white/[0.02]"
                }`}>
                  <Lock className={`absolute left-3.5 top-3.5 w-4.5 h-4.5 transition-colors duration-200 ${
                    focusedField === "password" ? "text-cyan-400" : "text-slate-500"
                  }`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    disabled={isSubmitting}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent pl-11 pr-11 py-3.5 text-xs text-white focus:outline-none placeholder-slate-600 font-bold font-mono tracking-widest text-cyan-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password inputs */}
            {(view === "signup" || (view === "forgot" && forgotStep === 2)) && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider font-mono">Verify Passkey Mirror</label>
                <div className={`relative rounded-xl border transition-all duration-200 ${
                  focusedField === "confirmPassword" 
                    ? "border-cyan-500 bg-[#070e24] shadow-[0_0_12px_rgba(6,182,212,0.15)]" 
                    : "border-white/10 bg-white/[0.02]"
                }`}>
                  <Lock className={`absolute left-3.5 top-3.5 w-4.5 h-4.5 transition-colors duration-200 ${
                    focusedField === "confirmPassword" ? "text-cyan-400" : "text-slate-500"
                  }`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField(null)}
                    disabled={isSubmitting}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-transparent pl-11 pr-11 py-3.5 text-xs text-white focus:outline-none placeholder-slate-600 font-bold font-mono tracking-widest text-cyan-100"
                  />
                </div>
              </div>
            )}

            {/* Session checkbox */}
            {view === "login" && (
              <div className="flex items-center justify-between py-1 select-none">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/15 bg-white/5 accent-cyan-500 cursor-pointer text-cyan-500 focus:ring-0 focus:ring-offset-0"
                  />
                  Maintain persistent node
                </label>
              </div>
            )}

            {/* Active Action trigger buttons */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold font-mono uppercase tracking-widest hover:opacity-95 active:scale-[0.98] hover:shadow-cyan-500/15 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {view === "login" && "Access operator account"}
                  {view === "signup" && "Build new directory"}
                  {view === "forgot" && forgotStep === 1 && "Request Question Verification"}
                  {view === "forgot" && forgotStep === 2 && "Reset master key"}
                  <ArrowRight className="w-4 h-4 text-white shrink-0" />
                </>
              )}
            </button>
          </form>

          {/* Navigational Toggles */}
          <div className="text-center text-xs text-slate-400 select-none border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-center items-center gap-2 font-bold font-mono tracking-wide mt-6 uppercase">
            {view === "login" && (
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <span>New institutional operator?</span>
                <button
                  type="button"
                  onClick={() => {
                    setView("signup");
                    setError(null);
                    setSuccess(null);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors font-bold"
                >
                  Create directory
                </button>
              </div>
            )}

            {view === "signup" && (
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <span>Existing node operator?</span>
                <button
                  type="button"
                  onClick={() => {
                    setView("login");
                    setError(null);
                    setSuccess(null);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors font-bold"
                >
                  Authorize login
                </button>
              </div>
            )}

            {view === "forgot" && (
              <button
                type="button"
                onClick={() => {
                  setView("login");
                  setForgotStep(1);
                  setError(null);
                  setSuccess(null);
                }}
                className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 font-bold hover:underline"
              >
                <CornerDownRight className="w-3.5 h-3.5 text-cyan-450" />
                Return to Login node
              </button>
            )}
          </div>
          
        </div>
      </div>

    </div>
  );
}

