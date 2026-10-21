export type UserRole = 'admin' | 'buyer' | 'user';

export type MinecraftVersion = '1.21';

export type ProductTier = '30_days' | '90_days' | 'lifetime' | 'config_pack' | 'spoofer';

export interface SoftwareProduct {
  id: string;
  name: string;
  tagline: string;
  category: 'client' | 'configs' | 'spoofer' | 'scripts';
  price: number;
  originalPrice?: number;
  durationLabel: string;
  popular?: boolean;
  featured?: boolean;
  supportedVersions: MinecraftVersion[];
  supportedServers: string[];
  features: string[];
  badge?: string;
  downloadSize: string;
  version: string;
}

export interface License {
  id: string;
  productId: string;
  productName: string;
  key: string;
  status: 'active' | 'expired' | 'frozen';
  expiresAt: string; // ISO date or 'Lifetime'
  daysRemaining: number | 'unlimited';
  hwid: string | null;
  hwidResetAvailable: boolean;
  lastHwidReset: string | null;
  activatedAt: string;
}

export interface CloudConfig {
  id: string;
  name: string;
  server: string;
  playstyle: 'Rage / HvH' | 'Legit / Closet' | 'Semi-Rage' | 'Anarchy';
  author: string;
  downloads: number;
  rating: number;
  lastUpdated: string;
  modulesCount: number;
  description: string;
  configData?: string;
}

export interface SoftwareModule {
  id: string;
  name: string;
  category: 'Combat' | 'Movement' | 'Render' | 'Player' | 'World' | 'Bypasses';
  description: string;
  bypasses: string[];
  hotkey?: string;
  iconName: string;
  isPopular?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  password?: string;
  minecraftNick?: string;
  hwid: string;
  registeredAt: string;
  balance: number;
  licenses: License[];
  isBanned?: boolean;
  isEmailVerified?: boolean;
  totpEnabled?: boolean;
  totpSecret?: string;
}

export type PaymentMethod = 'sbp' | 'card' | 'crypto' | 'yoomoney' | 'balance' | 'funpay';

export interface Order {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  productName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  licenseKey: string;
}

export type ViewMode = 
  | 'home' 
  | 'store' 
  | 'modules' 
  | 'configs' 
  | 'client_dashboard' 
  | 'admin_panel' 
  | 'faq';
