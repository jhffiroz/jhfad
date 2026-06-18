export type MembershipTier = 'regular' | 'standard' | 'premium' | 'elite';

export type KycStatus = 'not_started' | 'pending_verification' | 'verified' | 'rejected';

export interface User {
  id: string;
  email: string;
  phone?: string;
  name?: string;
  idNumber?: string;
  dob?: string;
  membershipStatus: MembershipTier;
  kycStatus: KycStatus;
  idCardUrl?: string; // base64 payload from camera
  selfieUrl?: string; // base64 payload from camera
  walletBalance: number; // in BDT
  todayEarnings: number;
  currentMonthEarnings: number;
  totalLifetimeEarnings: number;
  dailyAdsWatched: number;
  totalAdsWatched: number;
  lastAdWatchedAt?: string;
  createdAt: string;
  isBanned?: boolean;
  lastLoginAt?: string;
  deviceInfo?: string;
}

export interface Ad {
  id: string;
  title: string;
  adType: 'image' | 'video' | 'interactive';
  mediaUrl: string; // fallback or decorative
  duration: number; // in seconds, default 30
  rewardAmount: number; // in BDT
  enabled: boolean;
  viewsCount: number;
  category: string;
}

export interface MembershipUpgrade {
  id: string;
  userId: string;
  email: string;
  userName?: string;
  userPhone?: string;
  tier: MembershipTier;
  amount: number;
  paymentMethod: 'bkash' | 'nagad' | 'rocket' | 'bank_qr';
  transactionId: string;
  paymentReference: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  email: string;
  method: 'bkash' | 'nagad' | 'rocket' | 'bank';
  amount: number;
  accountNumber: string;
  bankName?: string;
  branchName?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
}

export interface AdWatchLog {
  id: string;
  userId: string;
  adId: string;
  adTitle: string;
  rewardEarned: number;
  watchedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  category: 'auth' | 'kyc' | 'payment' | 'withdrawal' | 'ad' | 'system';
  action: string;
  details: string;
  userId?: string;
  email?: string;
  ipAddress?: string;
}

export interface SystemStats {
  dailyActiveUsers: number;
  totalAdViews: number;
  totalRevenue: number; // From membership purchases
  totalPayouts: number; // From withdrawn earnings
  fraudCount: number;
}
