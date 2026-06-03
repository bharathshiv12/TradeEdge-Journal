export interface UserSettings {
  appearance: {
    theme: string;
    accentColor: string;
    animationsEnabled: boolean;
    glowIntensity: 'low' | 'medium' | 'high';
    compactMode: boolean;
  };
  trading: {
    accountSize: number;
    currency: string;
    timezone: string;
    defaultLeverage: number;
    riskPercent: number;
    autoSaveNotes: boolean;
  };
  notifications: {
    tradeReminders: boolean;
    journalingReminders: boolean;
    weeklySummaries: boolean;
    streakAlerts: boolean;
  };
  subscription: {
    plan: 'FREE' | 'PRO';
    aiCreditsUsed: number;
    aiCreditsMax: number;
    storageUsedMb: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  settings: UserSettings;
}

export type AssetType = 'Crypto' | 'Forex' | 'Commodities' | 'US Stocks' | 'Indian Market';

export interface Trade {
  id: string;
  symbol: string;
  assetType: AssetType;
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice?: number;
  leverage: number;
  quantity: number;
  stopLoss?: number;
  takeProfit?: number;
  pnl: number; // profit & loss value
  notes: string;
  screenshots: string[]; // URLs or base64
  emotions: string[]; // e.g., ['Greedy', 'Fearful', 'Patient', 'Confident', 'Disciplined']
  strategyId?: string; // Linked Strategy
  timestamp: string; // ISO DateTime
  status: 'OPEN' | 'CLOSED';
  rating?: number; // 1-5 stars
  confidence?: number; // 1-5 stars
  tags?: string[];
  lessons?: string;
}

export interface Strategy {
  id: string;
  title: string;
  notes: string;
  rules: string[];
  checklist: string[];
  screenshots: string[];
  linkedTradeCount: number;
  winRate: number; // e.g. 64%
}

export interface CalendarDailyStats {
  date: string; // YYYY-MM-DD
  pnl: number;
  tradeCount: number;
  assets: string[];
  leverageAvg: number;
  rrRatio: number;
  notes?: string;
}

export interface Message {
  role: 'user' | 'assistant';
  timestamp: string;
  text: string;
}

export interface ChatSession {
  tradeId?: string;
  messages: Message[];
}
