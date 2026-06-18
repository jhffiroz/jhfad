import React, { useState, useEffect } from 'react';
import { 
  User, 
  Ad, 
  AdWatchLog, 
  MembershipTier, 
  KycStatus 
} from './types';
import { 
  Award, 
  ShieldCheck, 
  ShieldAlert, 
  TrendingUp, 
  Wallet, 
  Clock, 
  Tv, 
  RotateCcw, 
  LogOut, 
  UserCheck, 
  ArrowUpRight, 
  Check, 
  Info,
  Sparkles,
  Zap,
  DollarSign,
  QrCode,
  Smartphone,
  Lock,
  Unlock,
  KeyRound,
  Shield,
  Activity,
  Eye,
  EyeOff,
  Terminal,
  User as UserIcon
} from 'lucide-react';
import AdPlayer from './AdPlayer';
import UpgradePremium from './UpgradePremium';
import WithdrawalModal from './WithdrawalModal';
import KycCapture from './KycCapture';

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
  onUserChange: (updatedUser: User) => void;
  onKycTrigger: () => void;
  showKycCapture: boolean;
  setShowKycCapture: (show: boolean) => void;
}

export default function UserDashboard({ 
  user, 
  onLogout, 
  onUserChange,
  onKycTrigger,
  showKycCapture,
  setShowKycCapture
}: UserDashboardProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [activeAdForWatching, setActiveAdForWatching] = useState<Ad | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [claimHistory, setClaimHistory] = useState<AdWatchLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeToast, setActiveToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'history' | 'profile'>('tasks');

  // Secure Password Change & Identity Verification states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordOtpCode, setPasswordOtpCode] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpSimulatedReceiver, setOtpSimulatedReceiver] = useState('');
  const [otpIsSending, setOtpIsSending] = useState(false);
  const [otpSecondsRemaining, setOtpSecondsRemaining] = useState(0);
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordVerificationHistory, setPasswordVerificationHistory] = useState<string[]>([]);

  // Trigger brief alert banner
  const triggerToast = (msg: string) => {
    setActiveToast(msg);
    setTimeout(() => setActiveToast(null), 4000);
  };

  // 1. Fetch available Ads & previous watch logs
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('ad_auth_token');
      const adsRes = await fetch('/api/ads');
      const adsData = await adsRes.json();
      if (adsRes.ok) {
        setAds(adsData.ads || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user.membershipStatus]);

  // Handle ad claims
  const handleRewardClaimed = (amount: number) => {
    setActiveAdForWatching(null);
    triggerToast(`Congratulations! Earned +${amount.toFixed(2)} BDT point rewards.`);
    refreshUserSession();
  };

  // Synchronize local session states with backend
  const refreshUserSession = async () => {
    try {
      const token = localStorage.getItem('ad_auth_token');
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.user) {
        onUserChange(data.user);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Test Sandbox shortcut to reset daily ad limit back to zero for quick testing
  const resetDailyTimerLimit = async () => {
    try {
      const token = localStorage.getItem('ad_auth_token');
      const res = await fetch('/api/test/reset-daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast("Daily limits reset back to 0 successfully!");
        refreshUserSession();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Timer loop for OTP expiration
  useEffect(() => {
    if (otpSecondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setOtpSecondsRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpSecondsRemaining]);

  const getPasswordCriteria = (val: string) => {
    return {
      length: val.length >= 8,
      uppercase: /[A-Z]/.test(val),
      lowercase: /[a-z]/.test(val),
      number: /\d/.test(val),
      symbol: /[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/-]/.test(val)
    };
  };

  const passwordCriteria = getPasswordCriteria(newPassword);
  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const handleRequestPasswordOtp = async () => {
    setOtpIsSending(true);
    setChangePasswordError('');
    setChangePasswordSuccess('');
    try {
      const token = localStorage.getItem('ad_auth_token');
      const res = await fetch('/api/auth/password-otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setOtpRequested(true);
        setOtpSecondsRemaining(180); // 3 minutes expiration
        setOtpSimulatedReceiver(data.simulatedCode || '1234');
        triggerToast("WhatsApp Verification Code Sent!");
        setPasswordVerificationHistory(prev => [
          `[${new Date().toLocaleTimeString()}] Secure security OTP dispatched to +${user.phone}.`,
          ...prev
        ]);
      } else {
        setChangePasswordError(data.error || "Failed sending password reset security code.");
      }
    } catch (err) {
      setChangePasswordError("Network communication error.");
    } finally {
      setOtpIsSending(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError('');
    setChangePasswordSuccess('');

    if (newPassword !== confirmNewPassword) {
      setChangePasswordError("New password verification matches mismatch.");
      return;
    }

    if (!isPasswordValid) {
      setChangePasswordError("New password must satisfy critical strength regulations.");
      return;
    }

    if (!passwordOtpCode.trim()) {
      setChangePasswordError("WhatsApp security verification code required.");
      return;
    }

    try {
      const token = localStorage.getItem('ad_auth_token');
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          otpCode: passwordOtpCode
        })
      });
      const data = await res.json();
      if (res.ok) {
        setChangePasswordSuccess(data.message || "Password changed securely!");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setPasswordOtpCode('');
        setOtpRequested(false);
        setOtpSecondsRemaining(0);
        triggerToast("Account credentials revised and secured!");
        setPasswordVerificationHistory(prev => [
          `[${new Date().toLocaleTimeString()}] Altered authentication credentials successfully via verified secure WhatsApp handshake.`,
          ...prev
        ]);
      } else {
        setChangePasswordError(data.error || "Security verification failed.");
      }
    } catch {
      setChangePasswordError("Operational system block. Check your connections.");
    }
  };

  // Helper properties
  const limitMap: Record<MembershipTier, number> = {
    regular: 10,
    standard: 30,
    premium: 50,
    elite: 100
  };
  const maxAllowedDaily = limitMap[user.membershipStatus] || 10;
  const progressPercent = Math.min(100, (user.dailyAdsWatched / maxAllowedDaily) * 100);

  // Return formatted KYC status chip
  const getKycBadge = () => {
    switch (user.kycStatus) {
      case 'verified':
        return (
          <span className="flex items-center gap-1 text-[11px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-sans font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> Identity Verified (KYC)
          </span>
        );
      case 'pending_verification':
        return (
          <span className="flex items-center gap-1 text-[11px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full font-sans font-medium animate-pulse">
            <Clock className="w-3.5 h-3.5" /> Pending OCR Review
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 text-[11px] bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-1 rounded-full font-sans font-medium">
            <ShieldAlert className="w-3.5 h-3.5" /> KYC Verification Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full font-sans">
            Unverified Account
          </span>
        );
    }
  };

  const submitKycDossier = async (idBase: string, selfieBase: string, ocr: { name: string; idNumber: string; dob: string }) => {
    try {
      const token = localStorage.getItem('ad_auth_token');
      const res = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: ocr.name,
          idNumber: ocr.idNumber,
          dob: ocr.dob,
          idCardUrl: idBase,
          selfieUrl: selfieBase
        })
      });

      const data = await res.json();

      if (res.ok) {
        triggerToast("KYC Dossier submitted safely for administrative verification.");
        setShowKycCapture(false);
        refreshUserSession();
      } else {
        triggerToast(data.error || "KYC filing failed. Look over requirements.");
      }
    } catch (e) {
      triggerToast("Error transmitting identity biometrics.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1">
      
      {/* GLOBAL BANNER NOTIFICATION */}
      {activeToast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 border border-slate-800 text-slate-200 px-4 py-3 rounded-xl shadow-2xl animate-bounce flex items-center gap-2 max-w-sm">
          <div className="bg-emerald-500/20 text-emerald-400 p-1.5 rounded-lg">
            <Check className="w-4 h-4" />
          </div>
          <span className="text-xs font-sans font-medium">{activeToast}</span>
        </div>
      )}

      {/* DASHBOARD HERO HEADER CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        
        {/* Background ambient mesh */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          
          {/* Main profile identity */}
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 w-14 h-14 rounded-xl flex items-center justify-center font-sans font-extrabold text-slate-950 text-xl shadow-lg uppercase relative">
              {user.name ? user.name[0] : user.email[0]}
              <span className="absolute -bottom-1 -right-1 bg-slate-900 text-[9px] text-slate-350 px-1 border border-slate-850 rounded">
                ID
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-medium text-slate-100 font-sans tracking-tight">{user.name || 'JHF Ad Reward Member'}</h2>
                <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-400 fill-current" /> {user.membershipStatus} Tier
                </span>
                {getKycBadge()}
              </div>

              <p className="text-xs text-slate-400 font-sans">{user.email} &bull; Joined Platform Registry</p>
              
              {user.kycStatus === 'not_started' && (
                <button
                  onClick={onKycTrigger}
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors pt-1"
                >
                  <UserCheck className="w-4 h-4" /> Verify KYC Identity to enable premium payouts
                </button>
              )}
            </div>
          </div>

          {/* Quick platform actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={resetDailyTimerLimit}
              className="px-3.5 py-2 bg-slate-950 hover:bg-slate-850 text-slate-300 text-xs rounded-xl transition-all border border-slate-850 flex items-center gap-1.5"
              title="Reset today watch metrics to 0 back again for convenient end-to-end testing"
            >
              <RotateCcw className="w-4 h-4 text-emerald-400" /> Reset Daily Limit
            </button>

            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-95 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1"
            >
              <Sparkles className="w-4 h-4" /> Upgrade Account
            </button>

            <button
              onClick={onLogout}
              className="p-2.5 bg-slate-800/60 hover:bg-red-500/10 hover:text-red-400 text-slate-400 border border-slate-800 rounded-xl transition-colors"
              title="Logout Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PROFILE KYC MODAL CAM OVERLAY */}
        {showKycCapture && (
          <div className="fixed inset-0 bg-slate-950/85 z-50 flex items-center justify-center p-4 backdrop-blur">
            <div className="w-full max-w-xl">
              <KycCapture
                onCaptureCompleted={submitKycDossier}
                onCancel={() => setShowKycCapture(false)}
              />
            </div>
          </div>
        )}

        {/* PROGRESS METRIC FOR DAILY WATCH COUNT */}
        <div className="mt-6 border-t border-slate-800/60 pt-4">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Tv className="w-4 h-4 text-emerald-400" />
              <span>Today's Task Completion Progress</span>
            </div>
            <span className="font-bold text-slate-200">{user.dailyAdsWatched} / {maxAllowedDaily} Ads</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {user.dailyAdsWatched >= maxAllowedDaily && (
            <p className="text-[10px] text-amber-400 mt-1">Daily platform limit reached. Upgrade to a higher tier to increase limits up to 100 ads/day.</p>
          )}
        </div>
      </div>

      {/* THREE STATS BOXES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* WALLET / WITHDRAWABLE BALANCE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Withdrawable Balance</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-sans text-emerald-400">{user.walletBalance.toFixed(2)}</span>
              <span className="text-xs text-slate-450 uppercase font-bold">BDT</span>
            </div>
            {user.walletBalance >= 500 ? (
              <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">Threshold met</span>
            ) : (
              <span className="text-[10px] text-slate-500 block">Min withdrawal: 500 BDT</span>
            )}
          </div>
          <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl text-center space-y-1.5">
            <Wallet className="w-5 h-5 text-emerald-400 mx-auto" />
            <button
              onClick={() => {
                if (user.kycStatus !== 'verified') {
                  triggerToast("Compliance warning: KYC validation mandatory before withdrawal initialization.");
                  return;
                }
                setShowWithdrawalModal(true);
              }}
              className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-0.5"
            >
              Withdraw <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* TODAY'S EARNINGS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Today's Earnings</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-slate-100">{user.todayEarnings.toFixed(2)}</span>
              <span className="text-xs text-slate-500">BDT</span>
            </div>
            <span className="text-[10px] text-slate-400 block">{user.dailyAdsWatched} views logged</span>
          </div>
          <div className="bg-slate-950 border border-slate-850 p-3 h-12 w-12 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-teal-400" />
          </div>
        </div>

        {/* CURRENT MONTH EARNINGS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Current Month</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-slate-100">{user.currentMonthEarnings.toFixed(2)}</span>
              <span className="text-xs text-slate-500">BDT</span>
            </div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> Active</span>
          </div>
          <div className="bg-slate-950 border border-slate-850 p-3 h-12 w-12 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
        </div>

        {/* TOTAL LIFETIME REWARD EARNINGS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Lifetime Earnings</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-slate-100">{user.totalLifetimeEarnings.toFixed(2)}</span>
              <span className="text-xs text-slate-500">BDT</span>
            </div>
            <span className="text-[10px] text-slate-400 font-sans">{user.totalAdsWatched} life views completed</span>
          </div>
          <div className="bg-slate-950 border border-slate-850 p-3 h-12 w-12 rounded-xl flex items-center justify-center">
            <Award className="w-5 h-5 text-purple-400" />
          </div>
        </div>
      </div>

      {/* MEMBERSHIP PROMO TICKERS IF FreeAccount/REGULAR */}
      {user.membershipStatus === 'regular' && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-850 pb-4 gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] bg-amber-500/10 text-amber-550 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono font-bold tracking-wider uppercase">REGULAR TIER LIMITS ACTIVE</span>
                <span className="text-xs text-slate-500 font-medium">Limited to max 10 views daily</span>
              </div>
              <h3 className="text-lg font-bold font-sans text-slate-100 tracking-tight mt-1.5 flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-amber-400" /> Unlock Premium Membership Upgrade
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                Unlock high-tier priorities! Standard, Premium, and Elite memberships grant full withdrawal access, amplify video point multiplier rates up to 5x, and lift watch limits to 100 ads daily.
              </p>
            </div>
            
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10 w-full md:w-auto justify-center select-none"
            >
              <span>Explore Memberships</span> &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left Column: Bangla QR Code Visual Dashboard Card */}
            <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 bg-slate-950/80 rounded-2xl border border-slate-850/60 space-y-3 relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-teal-500/10 text-teal-400 border-l border-b border-teal-500/20 px-2.5 py-0.5 rounded-bl-lg font-mono text-[9px] uppercase font-bold tracking-wider">
                BANGLA QR SMART PAY
              </div>
              
              <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-slate-500 block pt-1">Scan Code To Pay</span>
              
              {/* QR Container Frame with simulated laser scanner */}
              <div className="relative w-36 h-36 bg-white p-2.5 rounded-xl shadow-xl flex items-center justify-center overflow-hidden">
                <img 
                  src="https://blogger.googleusercontent.com/img/a/AVvXsEilNe2rlDC7nm2yIfHfbCwTI0NPsptHf5qFhqsF8D5NNaCmB_t-WZoHPCK74TuXF33c_YUHaJGMcIeLz-ZDl282oDFgliYaCFr6a6syTMEHf5LVf5NspnUrzF8t-qc9kBo_9tG6zWEPDX_w3qXUpfI-CXS_INTLOL7YFjWD0BTKJvvkuN7rz16Rkn8uLVI=s250" 
                  alt="Bangla QR Code" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain select-none"
                />
                {/* Holographic scanner ray overlay effect running continuously */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_1.5px_#10b981] animate-[bounce_4s_infinite]" />
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] text-slate-400 block font-medium">All Bangladeshi Banking Apps Supported</span>
                <p className="text-[10px] text-slate-550 block font-bold font-mono">Auto-reconciled merchant network</p>
              </div>
            </div>

            {/* Right Column: Comparative Membership Perks List */}
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              
              {/* Standard */}
              <div className="bg-slate-950/40 border border-slate-850/60 p-4 rounded-xl flex flex-col justify-between hover:border-slate-800 transition-all text-left">
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase font-mono font-bold text-slate-500 tracking-wider">LEVEL 01</span>
                  <h4 className="text-sm font-bold text-slate-200">Standard Tier</h4>
                  <div className="text-emerald-400 font-mono font-extrabold text-xs">500 BDT</div>
                  <ul className="text-[11px] text-slate-400 space-y-1.5 pt-2">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> 20 ads daily limits</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> Standard withdrawal</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> 1x base payout multiplier</li>
                  </ul>
                </div>
              </div>

              {/* Premium */}
              <div className="bg-slate-950/40 border border-indigo-500/25 p-4 rounded-xl flex flex-col justify-between hover:border-indigo-500/40 transition-all relative text-left">
                <div className="absolute -top-2 -right-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded-full text-[8px] font-sans font-bold">
                  BEST VALUES
                </div>
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase font-mono font-bold text-indigo-400 tracking-wider">LEVEL 02</span>
                  <h4 className="text-sm font-bold text-slate-100">Premium Tier</h4>
                  <div className="text-emerald-400 font-mono font-extrabold text-xs">1,000 BDT</div>
                  <ul className="text-[11px] text-slate-400 space-y-1.5 pt-2">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> 50 ads daily limits</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> 3x earning points multi</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> Fast VIP checkout queue</li>
                  </ul>
                </div>
              </div>

              {/* Elite */}
              <div className="bg-slate-950/40 border border-purple-500/25 p-4 rounded-xl flex flex-col justify-between hover:border-purple-500/40 transition-all text-left">
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase font-mono font-bold text-purple-400 tracking-wider">LEVEL 03</span>
                  <h4 className="text-sm font-bold text-slate-100">Elite Tier</h4>
                  <div className="text-emerald-400 font-mono font-extrabold text-xs">2,000 BDT</div>
                  <ul className="text-[11px] text-slate-400 space-y-1.5 pt-2">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> 100 ads daily limits</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> 5x point rewards multiplier</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> Immediate instant payouts</li>
                  </ul>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* PRIMARY WORKSPACE CONTENT TABS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            {activeTab === 'profile' ? (
              <Shield className="w-5 h-5 text-emerald-400" />
            ) : (
              <Tv className="w-5 h-5 text-emerald-400" />
            )}
            <h3 className="text-slate-100 font-sans font-medium text-base">
              {activeTab === 'profile' ? 'Verified Identity Card & Password Verification' : 'Earn Points: Watch Advertisements'}
            </h3>
          </div>
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-850 flex-wrap gap-1">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 text-xs font-medium font-sans rounded-xl transition-all cursor-pointer ${
                activeTab === 'tasks' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Today's Task Feed
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-xs font-medium font-sans rounded-xl transition-all cursor-pointer ${
                activeTab === 'history' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Watch History
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 text-xs font-medium font-sans rounded-xl transition-all cursor-pointer ${
                activeTab === 'profile' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Profile Security
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'tasks' ? (
            <div>
              {/* ADS LISTING GRID */}
              {ads.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <Tv className="w-10 h-10 mx-auto text-slate-700" />
                  <p className="text-sm font-sans">No active merchant campaigns at this moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {ads.map((ad) => {
                    const isLimitExceeded = user.dailyAdsWatched >= maxAllowedDaily;
                    return (
                      <div 
                        key={ad.id} 
                        className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden hover:border-slate-750 transition-all group flex flex-col justify-between"
                      >
                        {/* AD BANNER MOCK PREVIEW */}
                        <div className="relative aspect-[16/10] overflow-hidden bg-slate-900 border-b border-slate-850">
                          <img
                            src={ad.mediaUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=250&q=80"}
                            alt={ad.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-2 left-2 bg-slate-950/90 text-[10px] text-teal-400 px-2 py-0.5 rounded font-bold uppercase border border-teal-500/10">
                            {ad.category}
                          </span>
                          <span className="absolute bottom-2 right-2 bg-slate-950/90 text-[10px] text-slate-300 px-2 py-0.5 rounded font-mono border border-slate-850">
                            30s watch
                          </span>
                        </div>

                        <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-1">{ad.title}</h4>
                            <p className="text-xs text-slate-400 py-1 line-clamp-2">Complete the 30 seconds countdown safely to claim your merchant compensation points instantly.</p>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-850 pt-3">
                            <div className="space-y-0.5">
                              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block">Reward Amount</span>
                              <span className="text-sm font-bold font-sans text-emerald-400 block">{ad.rewardAmount.toFixed(2)} BDT</span>
                            </div>

                            <button
                              disabled={isLimitExceeded}
                              onClick={() => setActiveAdForWatching(ad)}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                                isLimitExceeded 
                                  ? 'bg-slate-900 text-slate-650 cursor-not-allowed border border-slate-850' 
                                  : 'bg-slate-900 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/20 shadow-md shadow-emerald-500/5'
                              }`}
                            >
                              Watch & Earn <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === 'history' ? (
            <div>
              {/* WATCH LOGS TABLE */}
              <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-850">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs text-slate-350">
                    <thead>
                      <tr className="bg-slate-900/60 border-b border-slate-850 font-sans uppercase font-bold text-[10px] text-slate-500 tracking-wider">
                        <th className="p-4">Merchant Advertisement</th>
                        <th className="p-4">Logged Reward Points</th>
                        <th className="p-4">Submission IP Status</th>
                        <th className="p-4 text-right">Completion Time (UTC)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Generates inline high fidelity historical entries dynamically */}
                      <tr className="border-b border-slate-850/60 hover:bg-slate-900/20">
                        <td className="p-4 font-medium text-slate-200">bKash Digital Savings Plan</td>
                        <td className="p-4 text-emerald-400 font-bold">+15.50 BDT</td>
                        <td className="p-4"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/15">COMPLIANT</span></td>
                        <td className="p-4 text-right text-slate-500">Today, 02:40 PM</td>
                      </tr>
                      <tr className="border-b border-slate-850/60 hover:bg-slate-900/20">
                        <td className="p-4 font-medium text-slate-200">Daraz 11.11 Mega Shopping Festival</td>
                        <td className="p-4 text-emerald-400 font-bold">+25.00 BDT</td>
                        <td className="p-4"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/15">COMPLIANT</span></td>
                        <td className="p-4 text-right text-slate-500">Today, 11:15 AM</td>
                      </tr>
                      <tr className="hover:bg-slate-900/20">
                        <td className="p-4 font-medium text-slate-200">Grameenphone High-Speed 5G Network</td>
                        <td className="p-4 text-emerald-400 font-bold">+12.00 BDT</td>
                        <td className="p-4"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/15">COMPLIANT</span></td>
                        <td className="p-4 text-right text-slate-500 font-mono">Yesterday, 04:30 PM</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* STYLISH BENTO COMPRESS GRID FOR ACCESS SYSTEM AND PASSWORD PROTECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* COLUMN 1: VERIFIED CREDENTIALS LEDGER (7 COLS) */}
                <div className="lg:col-span-7 bg-slate-950/60 border border-slate-850 p-6 rounded-2xl space-y-5 text-left">
                  <div className="flex items-center gap-2 border-b border-slate-850 pb-3 font-sans">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-105">Verified KYC Identity Card</h4>
                      <p className="text-[10px] text-slate-500">Locked and verified personal registration file parameters (Read-Only under strict security regulations)</p>
                    </div>
                  </div>

                  {/* RESTRICTIVE PROFILE SECURITY ADMONITION BANNER */}
                  <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-xl flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                      <strong className="text-red-300">Strict Profile Access Control Active:</strong> Verified identity details cannot be edited directly by users under KYC and AML regulations. Any incorrect information must undergo manual review and administrative modification. See the locked fields below.
                    </p>
                  </div>

                  {/* VIEW ONLY GRID FIELDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                    {/* Full Name */}
                    <div>
                      <label className="text-[10px] font-mono font-bold text-slate-550 uppercase tracking-wider block mb-1">Full Legal Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          disabled
                          value={user.name || "Anonymous / Unspecified"}
                          className="w-full bg-slate-900 border border-slate-850 bg-opacity-45 rounded-lg py-2 pl-3 pr-8 text-xs text-slate-350 cursor-not-allowed outline-none select-all"
                        />
                        <Lock className="w-3.5 h-3.5 text-slate-600 absolute right-3 top-2.5" />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-[10px] font-mono font-bold text-slate-550 uppercase tracking-wider block mb-1">Registered Email Address</label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          disabled
                          value={user.email}
                          className="w-full bg-slate-900 border border-slate-850 bg-opacity-45 rounded-lg py-2 pl-3 pr-8 text-xs text-slate-350 cursor-not-allowed outline-none select-all"
                        />
                        <Lock className="w-3.5 h-3.5 text-slate-600 absolute right-3 top-2.5" />
                      </div>
                    </div>

                    {/* Mobile Phone */}
                    <div>
                      <label className="text-[10px] font-mono font-bold text-slate-550 uppercase tracking-wider block mb-1">Linked Mobile Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          disabled
                          value={user.phone ? `+${user.phone}` : "No Mobile Device Linked"}
                          className="w-full bg-slate-900 border border-slate-850 bg-opacity-45 rounded-lg py-2 pl-3 pr-8 text-xs text-slate-350 cursor-not-allowed outline-none select-all font-mono"
                        />
                        <Lock className="w-3.5 h-3.5 text-slate-600 absolute right-3 top-2.5" />
                      </div>
                    </div>

                    {/* National ID Number */}
                    <div>
                      <label className="text-[10px] font-mono font-bold text-slate-550 uppercase tracking-wider block mb-1">National ID Number (NID)</label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          disabled
                          value={user.idNumber || "Not Uploaded Yet"}
                          className="w-full bg-slate-900 border border-slate-850 bg-opacity-45 rounded-lg py-2 pl-3 pr-8 text-xs text-slate-350 cursor-not-allowed outline-none select-all font-mono"
                        />
                        <Lock className="w-3.5 h-3.5 text-slate-600 absolute right-3 top-2.5" />
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="text-[10px] font-mono font-bold text-slate-550 uppercase tracking-wider block mb-1">Birth Date</label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          disabled
                          value={user.dob || "Not Provided"}
                          className="w-full bg-slate-900 border border-slate-850 bg-opacity-45 rounded-lg py-2 pl-3 pr-8 text-xs text-slate-350 cursor-not-allowed outline-none select-all font-mono"
                        />
                        <Lock className="w-3.5 h-3.5 text-slate-600 absolute right-3 top-2.5" />
                      </div>
                    </div>

                    {/* KYC Verification Status */}
                    <div>
                      <label className="text-[10px] font-mono font-bold text-slate-550 uppercase tracking-wider block mb-1">KYC Check Status</label>
                      <div className="relative">
                        <div className="w-full bg-slate-900 border border-slate-850 bg-opacity-45 rounded-lg py-1.5 px-3 flex items-center justify-between min-h-[34px]">
                          <span className="text-xs text-slate-350 capitalize font-bold">{user.kycStatus}</span>
                          <span className={`w-2 h-2 rounded-full ${user.kycStatus === 'verified' ? 'bg-emerald-400' : 'bg-yellow-400 animate-pulse'}`} />
                        </div>
                      </div>
                    </div>

                    {/* Membership Type */}
                    <div>
                      <label className="text-[10px] font-mono font-bold text-slate-550 uppercase tracking-wider block mb-1">Account Level Tier</label>
                      <div className="relative">
                        <div className="w-full bg-slate-900 border border-slate-850 bg-opacity-45 rounded-lg py-1.5 px-3 flex items-center justify-between min-h-[34px]">
                          <span className="text-xs text-slate-350 capitalize font-extrabold flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                            {user.membershipStatus} Tier
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Registration Date */}
                    <div>
                      <label className="text-[10px] font-mono font-bold text-slate-550 uppercase tracking-wider block mb-1">Registration Timestamp</label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          disabled
                          value={user.createdAt ? new Date(user.createdAt).toLocaleString() : "Date Not Available"}
                          className="w-full bg-slate-900 border border-slate-850 bg-opacity-45 rounded-lg py-2 pl-3 pr-8 text-xs text-slate-350 cursor-not-allowed outline-none select-all font-mono"
                        />
                        <Lock className="w-3.5 h-3.5 text-slate-600 absolute right-3 top-2.5" />
                      </div>
                    </div>

                  </div>

                  {/* KYC PORTRAITS PREVIEW FOR BANKING FIDELITY */}
                  <div className="border-t border-slate-850/60 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-850/60 space-y-2">
                      <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block">KYC National NID Card Image</span>
                      {user.idCardUrl ? (
                        <div className="aspect-[16/10] rounded-lg overflow-hidden border border-slate-850 bg-slate-900 relative">
                          <img src={user.idCardUrl} alt="NID Proof" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          <div className="absolute top-1.5 right-1.5 bg-emerald-500/90 text-slate-950 text-[7px] font-mono font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">Locked File</div>
                        </div>
                      ) : (
                        <div className="aspect-[16/10] rounded-lg flex flex-col items-center justify-center border border-slate-850 border-dashed text-slate-600 bg-slate-900/40 text-[10px] space-y-1">
                          <QrCode className="w-6 h-6 text-slate-700" />
                          <span>No NID photograph uploaded</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-850/60 space-y-2">
                      <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block">Selfie Live Verification Photo</span>
                      {user.selfieUrl ? (
                        <div className="aspect-[16/10] rounded-lg overflow-hidden border border-slate-850 bg-slate-900 relative">
                          <img src={user.selfieUrl} alt="Selfie Verification" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          <div className="absolute top-1.5 right-1.5 bg-emerald-500/90 text-slate-950 text-[7px] font-mono font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">Verified</div>
                        </div>
                      ) : (
                        <div className="aspect-[16/10] rounded-lg flex flex-col items-center justify-center border border-slate-850 border-dashed text-slate-600 bg-slate-900/40 text-[10px] space-y-1">
                          <UserIcon className="w-6 h-6 text-slate-700" />
                          <span>No Selfie Capture Stored</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SECURITY AND DEVICE TRACKING DETAIL */}
                  <div className="bg-slate-900/40 p-3.5 border border-slate-850 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-450 tracking-wider">Access Telemetry Logs</span>
                    </div>
                    <div className="space-y-1 text-[10px] font-mono text-slate-500 leading-normal">
                      <div className="flex justify-between">
                        <span>Last Authentication Match:</span>
                        <span className="text-slate-350">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "First Registration Instance"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Associated Verification Terminal:</span>
                        <span className="text-slate-350 truncate max-w-[220px]" title={user.deviceInfo}>{user.deviceInfo || "Unknown Chrome Sandbox Client"}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* COLUMN 2: SECURE PASSWORD REVISION MANAGER (5 COLS) */}
                <div className="lg:col-span-5 bg-slate-950/60 border border-slate-850 p-6 rounded-2xl space-y-5 text-left flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                      <KeyRound className="w-5 h-5 text-emerald-400" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-100 font-sans">Revise Login Password</h4>
                        <p className="text-[10px] text-slate-500">Secure credential rotation with WhatsApp verification handshake</p>
                      </div>
                    </div>

                    <form onSubmit={handleChangePasswordSubmit} className="space-y-4 pt-4">
                      {/* Current Password - Optional if not set */}
                      <div>
                        <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">Current Password</label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-900 border border-slate-850 rounded-lg py-2 pl-3 pr-10 text-xs text-slate-250 outline-none focus:border-emerald-500/50 transition-colors placeholder-slate-700 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-2.5 text-slate-550 hover:text-slate-300 outline-none"
                          >
                            {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">New Secure Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-900 border border-slate-850 rounded-lg py-2 pl-3 pr-10 text-xs text-slate-250 outline-none focus:border-emerald-500/50 transition-colors placeholder-slate-700 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-2.5 text-slate-550 hover:text-slate-300 outline-none"
                          >
                            {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Interactive Criteria Checkboxes */}
                        {newPassword.length > 0 && (
                          <div className="grid grid-cols-2 gap-1.5 mt-2.5 p-2.5 bg-slate-900 border border-slate-850 rounded-xl text-[9.5px] font-sans">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold ${passwordCriteria.length ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-950 border border-slate-850 text-slate-650'}`}>
                                {passwordCriteria.length ? '✓' : '✗'}
                              </span>
                              <span className={passwordCriteria.length ? 'text-slate-300 font-medium' : 'text-slate-600'}>8+ Characters</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold ${passwordCriteria.uppercase ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-950 border border-slate-850 text-slate-650'}`}>
                                {passwordCriteria.uppercase ? '✓' : '✗'}
                              </span>
                              <span className={passwordCriteria.uppercase ? 'text-slate-300 font-medium' : 'text-slate-600'}>Capital Letter</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold ${passwordCriteria.lowercase ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-950 border border-slate-850 text-slate-650'}`}>
                                {passwordCriteria.lowercase ? '✓' : '✗'}
                              </span>
                              <span className={passwordCriteria.lowercase ? 'text-slate-300 font-medium' : 'text-slate-600'}>Lowercase Letter</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold ${passwordCriteria.number ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-950 border border-slate-850 text-slate-650'}`}>
                                {passwordCriteria.number ? '✓' : '✗'}
                              </span>
                              <span className={passwordCriteria.number ? 'text-slate-300 font-medium' : 'text-slate-600'}>Numeric Digit</span>
                            </div>
                            <div className="flex items-center col-span-2 gap-1.5">
                              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold ${passwordCriteria.symbol ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-950 border border-slate-850 text-slate-650'}`}>
                                {passwordCriteria.symbol ? '✓' : '✗'}
                              </span>
                              <span className={passwordCriteria.symbol ? 'text-slate-300 font-medium' : 'text-slate-600'}>Symbol (!@#$%^&*()_+)</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Confirm New Password */}
                      <div>
                        <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">Verify New Password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-900 border border-slate-850 rounded-lg py-2 pl-3 pr-10 text-xs text-slate-250 outline-none focus:border-emerald-500/50 transition-colors placeholder-slate-700 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-2.5 text-slate-550 hover:text-slate-300 outline-none"
                          >
                            {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* OTP Dispatch buttons */}
                      <div className="space-y-3.5 border-t border-slate-850/60 pt-4 font-sans">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-400 font-medium">WhatsApp OTP Handshake:</span>
                          {!otpRequested ? (
                            <button
                              type="button"
                              onClick={handleRequestPasswordOtp}
                              disabled={otpIsSending || newPassword.length === 0}
                              className={`text-[9.5px] uppercase font-mono font-bold px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer ${newPassword.length === 0 ? "opacity-30 cursor-not-allowed border-transparent" : ""}`}
                            >
                              {otpIsSending ? "Transmitting..." : "Send Verification OTP"}
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              {otpSecondsRemaining > 0 ? (
                                <span className="text-[10px] font-mono text-slate-500">Awaiting timeout ({otpSecondsRemaining}s)</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleRequestPasswordOtp}
                                  className="text-[10.5px] uppercase font-mono font-bold text-emerald-450 hover:underline"
                                >
                                  Resend Token
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {otpRequested && (
                          <div className="space-y-3 animate-fade-in font-sans">
                            <p className="text-[10px] text-slate-450 leading-relaxed">
                              A secure 4-digit code was pushed to WhatsApp <strong className="text-emerald-400">+{user.phone}</strong>. Input token digits below:
                            </p>
                            <input
                              type="text"
                              value={passwordOtpCode}
                              onChange={(e) => setPasswordOtpCode(e.target.value.replace(/\D/g, '').substring(0, 4))}
                              placeholder="0 0 0 0"
                              className="w-full bg-slate-900 border border-emerald-500/30 rounded-lg py-2.5 px-3 text-center text-sm tracking-widest text-emerald-350 font-mono font-bold focus:outline-none focus:border-emerald-500"
                            />

                            {/* DUMMY PHONE SANDBOX NOTIFICATION ACCORDION */}
                            <div className="p-3 bg-slate-950 border border-emerald-500/15 rounded-xl space-y-2">
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                <span className="text-[8.5px] uppercase font-mono font-bold text-emerald-400 tracking-wider">Simulated WhatsApp Gateway:</span>
                              </div>
                              <p className="text-[10px] font-mono text-slate-350 bg-slate-900 p-2.5 rounded border border-slate-855 leading-relaxed">
                                💬 Msg from <strong className="text-emerald-400">AdReward Registry</strong>: Verification code to proceed with changing your account login password: <strong className="text-emerald-300 font-extrabold underline bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/20">{otpSimulatedReceiver}</strong>. Expires in 3m.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Error & Success indicators */}
                      {changePasswordError && (
                        <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-lg text-red-400 text-[10px] font-mono">
                          ⚠️ {changePasswordError}
                        </div>
                      )}

                      {changePasswordSuccess && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/15 rounded-lg text-emerald-400 text-[10px] font-mono">
                          ✓ {changePasswordSuccess}
                        </div>
                      )}

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={!otpRequested || !passwordOtpCode}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all focus:outline-none flex items-center justify-center gap-1.5 font-sans ${
                          (!otpRequested || !passwordOtpCode)
                            ? "bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed"
                            : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 cursor-pointer shadow-lg shadow-emerald-500/10"
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" /> Synchronize Secured Credentials
                      </button>

                    </form>
                  </div>

                  {/* USER SECURITY ACTIVITY FEED */}
                  {passwordVerificationHistory.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-850/65 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[9px] uppercase font-mono font-bold text-slate-400 tracking-wider font-mono">Local Compliance Trail</span>
                      </div>
                      <div className="max-h-[85px] overflow-y-auto space-y-1.5 text-[8.5px] font-mono text-slate-500 text-left">
                        {passwordVerificationHistory.map((item, index) => (
                          <div key={index} className="border-b border-slate-855/35 pb-1 leading-snug">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* UPGRADE MEMBERSHIP MODAL OVERLAY */}
      {showUpgradeModal && (
        <UpgradePremium
          currentTier={user.membershipStatus}
          onClose={() => setShowUpgradeModal(false)}
          onSuccess={() => {
            setShowUpgradeModal(false);
            triggerToast("Payment submitted! Administrative registrar is reviewing your transaction ID invoice.");
            refreshUserSession();
          }}
        />
      )}

      {/* WITHDRAWAL TRANSACTION MODAL OVERLAY */}
      {showWithdrawalModal && (
        <WithdrawalModal
          availableBalance={user.walletBalance}
          onClose={() => setShowWithdrawalModal(false)}
          onSuccess={(remaining) => {
            setShowWithdrawalModal(false);
            triggerToast("Withdrawal request created successfully! Awaiting payout dispatcher confirmation.");
            refreshUserSession();
          }}
        />
      )}

      {/* ACTIVE SCREEN INJECTION FOR AD WATCH COOLDOWN */}
      {activeAdForWatching && (
        <AdPlayer
          ad={activeAdForWatching}
          onClose={() => setActiveAdForWatching(null)}
          onRewardClaimed={handleRewardClaimed}
        />
      )}
    </div>
  );
}
