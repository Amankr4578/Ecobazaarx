
export enum UserRole {
  ADMIN = 'Admin',
  USER = 'User',
  ANALYST = 'Analyst'
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface SustainabilityPreferences {
  plasticFreePackaging: boolean;
  carbonNeutralShipping: boolean;
  localSourcingOnly: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  isEmailVerified?: boolean;
  likedProducts?: string[];
  cart?: CartItem[];
  greenPoints?: number;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  bio?: string;
  profileImage?: string;
  sustainabilityPreferences?: SustainabilityPreferences;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface CarbonData {
  production: number;
  transport: number;
  packaging: number;
  usage: number;
  total: number;
}

export interface LifecycleStage {
  stage: string;
  description: string;
  location: string;
  icon: string;
}

export enum EmissionLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface PriceComparison {
  site: string;
  price: number;
  url: string;
  isBestValue?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  carbonScore: number; // 0-100, higher is better (lower footprint)
  emissionFactor: number;
  emissionLevel: EmissionLevel;
  carbonData: CarbonData;
  brand: string;
  materials: string[];
  manufactureDate: string;
  expectedLifespan: string;
  repairabilityScore: number;
  recyclingInstructions: string;
  lifecycleStages: LifecycleStage[];
  weight?: string;
  dimensions?: string;
  origin?: string;
  purchaseCount: number;
  viewCount: number;
  likeCount?: number;
  salesTrend: { month: string; sales: number }[];
  pointsValue: number;
  priceComparison?: PriceComparison[];
  isVisible?: boolean;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  discountCode: string;
  type: 'percentage' | 'fixed';
  value: number;
}

export interface Order {
  id: string;
  userId: number;
  totalAmount: number;
  discountAmount: number;
  platformFee: number;
  status: 'pending' | 'completed' | 'cancelled';
  items: { productId: string; quantity: number; price: number; name: string }[];
  createdAt: string;
}

export interface UserActivity {
  id: number;
  userId: number;
  productId: string;
  actionType: 'view' | 'purchase' | 'like' | 'unlike';
  carbonImpact: number;
  createdAt: string;
  productName?: string;
}
