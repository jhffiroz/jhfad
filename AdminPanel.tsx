import React, { useState, useEffect } from 'react';
import { 
  User, 
  Ad, 
  MembershipUpgrade, 
  WithdrawalRequest, 
  AuditLog, 
  MembershipTier,
  KycStatus
} from './types';
import { 
  Users, 
  Tv, 
  ShieldAlert, 
  Shield,
  BarChart, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XSquare, 
  RefreshCw, 
  Eye, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Sparkles,
  Search,
  Lock,
  Unlock,
  ToggleLeft,
  ChevronRight,
  Database,
  Zap
} from 'lucide-react';

interface AdminPanelProps {
  user: User;
  onLogout: () => void;
}

export default function AdminPanel({ user, onLogout }: AdminPanelProps) {
  // Tabs
  const [activeTab, setActiveTab] = useState<'analytics' | 'kyc' | 'upgrades' | 'withdrawals' | 'users' | 'campaigns' | 'audit'>('analytics');
  
  // States
  const [loading, setLoading] = useState(false);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [kycPending, setKycPending] = useState<User[]>([]);
  const [upgradeList, setUpgradeList] = useState<MembershipUpgrade[]>([]);
  const [withdrawalList, setWithdrawalList] = useState<WithdrawalRequest[]>([]);
  const [campaigns, setCampaigns] = useState<Ad[]>([]);
  
  // Create Ad Form
  const [adTitle, setAdTitle] = useState('');
  const [adType, setAdType] = useState<'image' | 'video' | 'interactive'>('video');
  const [adReward, setAdReward] = useState('');
  const [adDuration, setAdDuration] = useState('30');
  const [adCategory, setAdCategory] = useState('Fintech');
  const [adUrl, setAdUrl] = useState('');

  // Search User filters
  const [userSearchText, setUserSearchText] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [expandedUpgradeId, setExpandedUpgradeId] = useState<string | null>(null);

  // User profile editor variables
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editIdNumber, setEditIdNumber] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editMembership, setEditMembership] = useState<MembershipTier>('regular');
  const [editKycStatus, setEditKycStatus] = useState<KycStatus>('not_started');
  const [editBalance, setEditBalance] = useState(0);
  const [editIsBanned, setEditIsBanned] = useState(false);
  const [editReason, setEditReason] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null);

  const startEditingUser = (client: User) => {
    setEditingUserId(client.id);
    setEditName(client.name || '');
    setEditEmail(client.email || '');
    setEditPhone(client.phone || '');
    setEditIdNumber(client.idNumber || '');
    setEditDob(client.dob || '');
    setEditMembership(client.membershipStatus || 'regular');
    setEditKycStatus(client.kycStatus || 'not_started');
    setEditBalance(client.walletBalance || 0);
    setEditIsBanned(!!client.isBanned);
    setEditReason(''); 
    setEditErrorMessage(null);
  };

  const handleUpdateUserProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editReason.trim()) {
      setEditErrorMessage("A detailed modification reason must be filled for compliance audits.");
      return;
    }
    setIsSubmittingEdit(true);
    setEditErrorMessage(null);
    try {
      const token = localStorage.getItem('ad_auth_token');
      const res = await fetch('/api/admin/users/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: editingUserId,
          name: editName,
          email: editEmail,
          phone: editPhone,
          idNumber: editIdNumber,
          dob: editDob,
          membershipStatus: editMembership,
          kycStatus: editKycStatus,
          walletBalance: Number(editBalance),
          isBanned: editIsBanned,
          reason: editReason
        })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast("User profile successfully modified; audit logs registered.");
        setEditingUserId(null);
        fetchAdminRegistries();
      } else {
        setEditErrorMessage(data.error || "Failed revising user identity parameters.");
      }
    } catch {
      setEditErrorMessage("Network connection exception.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Active view states
  const [activeKycFile, setActiveKycFile] = useState<User | null>(null);

  // Success trigger toast
  const [toastText, setToastText] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastText(msg);
    setTimeout(() => setToastText(null), 3000);
  };

  // Fetch all administration registries
  const fetchAdminRegistries = async () => {
    setLoading(true);
    const token = localStorage.getItem('ad_auth_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    // Individual isolated, error-resistant fetch helper
    const fetchSafe = async (url: string, hook: (data: any) => void) => {
      try {
        const res = await fetch(url, { headers });
        if (res.ok) {
          const json = await res.json();
          hook(json);
        } else {
          console.warn(`Administrative endpoint error on: ${url}`, res.status);
        }
      } catch (err) {
        console.error(`Administrative network exception on: ${url}`, err);
      }
    };

    await Promise.all([
      fetchSafe('/api/admin/dashboard-stats', (data) => setAdminStats(data.stats)),
      fetchSafe('/api/admin/audit-logs', (data) => setAuditLogs(data.auditLogs || [])),
      fetchSafe('/api/admin/users', (data) => setUsersList(data.users || [])),
      fetchSafe('/api/admin/kyc-pending', (data) => setKycPending(data.users || [])),
      fetchSafe('/api/admin/upgrades', (data) => setUpgradeList(data.upgrades || [])),
      fetchSafe('/api/admin/withdrawals', (data) => setWithdrawalList(data.withdrawals || [])),
      fetchSafe('/api/ads', (data) => setCampaigns(data.ads || []))
    ]);

    setLoading(false);
  };

  useEffect(() => {
    fetchAdminRegistries();
  }, [activeTab]);

  // Review Upgrade Payment Invoice
  const handleReviewUpgrade = async (upgradeId: string, status: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem('ad_auth_token');
      const res = await fetch('/api/admin/upgrades/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ upgradeId, status })
      });
      if (res.ok) {
        triggerToast(`Invoice successfully set to ${status.toUpperCase()}. Account billing modified.`);
        fetchAdminRegistries();
      }
    } catch {
      triggerToast("Error resolving purchase invoice.");
    }
  };

  // Settle Withdrawal payouts
  const handleReviewWithdrawal = async (withdrawalId: string, status: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem('ad_auth_token');
      const res = await fetch('/api/admin/withdrawals/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ withdrawalId, status })
      });
      if (res.ok) {
        triggerToast(`Payout requisition set to ${status.toUpperCase()}. Wallet balances adjusted.`);
        fetchAdminRegistries();
      }
    } catch {
      triggerToast("Requisition process error.");
    }
  };

  // Review KYC Identity records
  const handleReviewKyc = async (targetUserId: string, status: 'verified' | 'rejected') => {
    try {
      const token = localStorage.getItem('ad_auth_token');
      const res = await fetch('/api/admin/kyc/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId, status })
      });
      if (res.ok) {
        triggerToast(`KYC dossier review verified with status: ${status.toLowerCase()}.`);
        setActiveKycFile(null);
        fetchAdminRegistries();
      }
    } catch {
      triggerToast("KYC dossier indexing database err.");
    }
  };

  // Toggle suspension ban
  const handleToggleBan = async (targetUserId: string) => {
    try {
      const token = localStorage.getItem('ad_auth_token');
      const res = await fetch('/api/admin/users/toggle-ban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId })
      });
      if (res.ok) {
        triggerToast(`Compliance account list updated.`);
        fetchAdminRegistries();
      }
    } catch {
      triggerToast("Administrative ban state failed.");
    }
  };

  // Toggle active Ad campaign
  const handleToggleAd = async (adId: string) => {
    try {
      const token = localStorage.getItem('ad_auth_token');
      const res = await fetch('/api/ads/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ adId })
      });
      if (res.ok) {
        triggerToast("Ad campaign toggled successfully!");
        fetchAdminRegistries();
      }
    } catch {
      triggerToast("Toggle action error.");
    }
  };

  // Create Campaign
  const handleAddCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle || !adReward) {
      triggerToast("Please add title and rewards.");
      return;
    }
    try {
      const token = localStorage.getItem('ad_auth_token');
      const res = await fetch('/api/ads/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: adTitle,
          adType,
          duration: Number(adDuration),
          rewardAmount: Number(adReward),
          category: adCategory,
          mediaUrl: adUrl
        })
      });

      if (res.ok) {
        triggerToast("Advertisement campaign placed online!");
        setAdTitle('');
        setAdReward('');
        setAdUrl('');
        fetchAdminRegistries();
      }
    } catch {
      triggerToast("Failed adding ad campaign.");
    }
  };

  // Delete Campaign
  const handleDeleteAd = async (id: string) => {
    try {
      const token = localStorage.getItem('ad_auth_token');
      const res = await fetch(`/api/ads/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        triggerToast("Campaign terminated.");
        fetchAdminRegistries();
      }
    } catch {
      triggerToast("Termination process error.");
    }
  };

  // Filtering users search
  const filteredUsers = usersList.filter(u => 
    u.email.toLowerCase().includes(userSearchText.toLowerCase()) ||
    (u.name && u.name.toLowerCase().includes(userSearchText.toLowerCase())) ||
    (u.idNumber && u.idNumber.toLowerCase().includes(userSearchText.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1">
      
      {/* TOAST NOTIFIER */}
      {toastText && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 border border-slate-800 text-emerald-400 px-4 py-3 rounded-xl shadow-2xl animate-fade-in flex items-center gap-1.5 font-sans font-medium text-xs">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastText}</span>
        </div>
      )}

      {/* ADMIN UPPER STRIP */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-tr from-purple-500 to-indigo-500 w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-white text-lg shadow-lg">
            A
          </div>
          <div className="space-y-0.5">
            <h2 className="text-lg font-medium text-slate-100 font-sans tracking-tight">System Administration Console</h2>
            <p className="text-xs text-slate-400 font-sans">Credential ID: <span className="font-mono text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-amber-400">{user.id}</span> &bull; Platform Registrar</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminRegistries}
            className="p-2.5 bg-slate-950 hover:bg-slate-850 text-slate-300 rounded-xl transition-all border border-slate-850 flex items-center gap-1.5"
            draggable
          >
            <RefreshCw className={`w-4 h-4 text-teal-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 border border-slate-800 text-slate-350 text-xs font-bold rounded-xl transition-colors"
          >
            Exit Console
          </button>
        </div>
      </div>

      {/* MAIN ADMIN WORKSPACE ROW FLEXBOX LAYOUT (Solves layout collapse and hidden sub-views) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        
        {/* LEFT NAV PANEL BAR */}
        <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-2 block pb-2">Registries Navigation</span>
          
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full text-left px-4 py-2 text-xs font-medium rounded-xl transition-all flex items-center justify-between ${
              activeTab === 'analytics' ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/5 text-emerald-400 border border-emerald-500/10 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-transparent'
            }`}
          >
            <span className="flex items-center gap-2"><BarChart className="w-4 h-4" /> Operations Overview</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveTab('kyc')}
            className={`w-full text-left px-4 py-2 text-xs font-medium rounded-xl transition-all flex items-center justify-between ${
              activeTab === 'kyc' ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/5 text-emerald-400 border border-emerald-500/10 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-transparent'
            }`}
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" /> KYC Verification Queue
              {kycPending.length > 0 && <span className="bg-red-500 text-white font-bold px-1.5 py-0.2 rounded-full text-[9px]">{kycPending.length}</span>}
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveTab('upgrades')}
            className={`w-full text-left px-4 py-2 text-xs font-medium rounded-xl transition-all flex items-center justify-between ${
              activeTab === 'upgrades' ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/5 text-emerald-400 border border-emerald-500/10 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-transparent'
            }`}
          >
            <span className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Upgrade Billings
              {upgradeList.filter(u => u.status === 'pending').length > 0 && (
                <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[9px]">
                  {upgradeList.filter(u => u.status === 'pending').length}
                </span>
              )}
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`w-full text-left px-4 py-2 text-xs font-medium rounded-xl transition-all flex items-center justify-between ${
              activeTab === 'withdrawals' ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/5 text-emerald-400 border border-emerald-500/10 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-transparent'
            }`}
          >
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" /> Cashout Payout Settle
              {withdrawalList.filter(w => w.status === 'pending').length > 0 && (
                <span className="bg-red-500 text-white font-bold px-1.5 py-0.2 rounded-full text-[9px]">
                  {withdrawalList.filter(w => w.status === 'pending').length}
                </span>
              )}
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full text-left px-4 py-2 text-xs font-medium rounded-xl transition-all flex items-center justify-between ${
              activeTab === 'users' ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/5 text-emerald-400 border border-emerald-500/10 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-transparent'
            }`}
          >
            <span className="flex items-center gap-2"><Users className="w-4 h-4" /> User Directory & Ban</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveTab('campaigns')}
            className={`w-full text-left px-4 py-2 text-xs font-medium rounded-xl transition-all flex items-center justify-between ${
              activeTab === 'campaigns' ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/5 text-emerald-400 border border-emerald-500/10 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-transparent'
            }`}
          >
            <span className="flex items-center gap-2"><Tv className="w-4 h-4" /> Campaign Manager</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full text-left px-4 py-2 text-xs font-medium rounded-xl transition-all flex items-center justify-between ${
              activeTab === 'audit' ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/5 text-emerald-400 border border-emerald-500/10 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-transparent'
            }`}
          >
            <span className="flex items-center gap-2"><Database className="w-4 h-4" /> System Audit & Security</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

        </div>

        {/* RIGHT DETAILS WORKSPACE DETAILS (Using flex-1 min-w-0 for perfect horizontal expansion) */}
        <div className="flex-grow flex-1 min-w-0 w-full space-y-6">
          
          {/* TAB 1: ANALYTICS OVERVIEW */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              
              {/* UPPER METRIC ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Accumulated Upgrades</span>
                  <div className="text-xl font-bold text-slate-100 pt-1 font-mono">{(adminStats?.totalRevenue || 0).toFixed(2)} BDT</div>
                  <span className="text-[10px] text-emerald-400 font-sans block pt-1">&bull; Gross merchant collections</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Dispatched Payouts</span>
                  <div className="text-xl font-bold text-slate-100 pt-1 font-mono">{(adminStats?.totalPayouts || 0).toFixed(2)} BDT</div>
                  <span className="text-[10px] text-purple-400 font-sans block pt-1">&bull; Standard bank settlements</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Total Platform Ad Views</span>
                  <div className="text-xl font-bold text-slate-100 pt-1 font-mono">{adminStats?.totalAdViews ?? 0} clicks</div>
                  <span className="text-[10px] text-blue-400 font-sans block pt-1">&bull; Merchant views counted</span>
                </div>

                <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 flex justify-between items-center bg-red-950/10 border-red-500/10">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-red-400 uppercase tracking-widest font-bold block animate-pulse">FRAUD ALERTS</span>
                    <span className="text-xl font-bold text-red-400 block font-sans">{adminStats?.fraudCount ?? 0} threats</span>
                  </div>
                  <ShieldAlert className="w-5 h-5 text-red-500 fill-current" />
                </div>

              </div>

              {/* QUICK STATISTICS DASHBOARD PREVIEW ROW */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <h4 className="text-slate-200 text-sm font-sans font-medium">Compliance Threat Analysis Overview</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Multiple Account Detection</span>
                    <p className="text-xs text-slate-400">Our cybersecurity daemon analyzes user agents, digital canvases, and IP subnets dynamically. No overlap anomalies registered in previous 24 hours.</p>
                  </div>
                  <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Ad Watching Speeds</span>
                    <p className="text-xs text-slate-400">Claims attempted in under 26 seconds trigger instant withholding rules. {adminStats?.fraudCount ?? 0} bypass threat attempts block-listed.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: KYC VERIFICATION FILE LISTING */}
          {activeTab === 'kyc' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-4">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <h3 className="text-slate-100 font-sans font-medium text-sm">Identity Verification (KYC) Approval Queue</h3>
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-sans font-medium">{kycPending.length} dossiers pending</span>
                </div>

                {kycPending.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 flex flex-col items-center justify-center gap-1">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                    <p className="text-sm font-sans font-semibold pt-2">Compliance Queue Clean</p>
                    <p className="text-xs text-slate-600">All registered national ID portfolios have been validated.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {kycPending.map((pendingUser) => (
                      <div key={pendingUser.id} className="bg-slate-950 border border-slate-850/60 rounded-xl p-4 space-y-4 flex flex-col justify-between">
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-200 block font-sans">{pendingUser.name || pendingUser.email}</span>
                            <span className="text-[9px] bg-slate-900 border border-slate-800 px-2 rounded font-mono text-slate-400">usr_id: {pendingUser.id}</span>
                          </div>
                          
                          <div className="text-xs space-y-1 text-slate-400">
                            <p><b>Email:</b> {pendingUser.email}</p>
                            <p><b>Mobile Phone No:</b> {pendingUser.phone || "Not Verified"}</p>
                            <p><b>OCR Extracted NID:</b> {pendingUser.idNumber || "None"}</p>
                            <p><b>OCR DOB:</b> {pendingUser.dob || "None"}</p>
                          </div>
                        </div>

                        {/* SUBMITTED ASSETS PREVIEWS */}
                        <div className="grid grid-cols-2 gap-2 border-t border-b border-slate-900 py-3">
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block">Front National ID Card</span>
                            <img
                              src={pendingUser.idCardUrl || "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&w=200&h=130&q=80"}
                              alt="Front National ID"
                              className="w-full h-16 object-cover rounded border border-slate-800"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block">Verification Selfie</span>
                            <img
                              src={pendingUser.selfieUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"}
                              alt="Biometric Selfie"
                              className="w-full h-16 object-cover rounded border border-slate-800"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>

                        {/* ACTIONS INLINE FOR THE KYC USER */}
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            onClick={() => handleReviewKyc(pendingUser.id, 'rejected')}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 text-xs px-3 py-1.5 rounded-lg transition-all font-sans font-medium"
                          >
                            Reject dossier
                          </button>
                          <button
                            onClick={() => handleReviewKyc(pendingUser.id, 'verified')}
                            className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-xs px-3 py-1.5 rounded-lg transition-all font-sans font-bold shadow-md"
                          >
                            Approve Verify
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: UPGRADE PAYMENTS INVOICE */}
          {activeTab === 'upgrades' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <div>
                  <h3 className="text-slate-100 font-sans font-medium text-sm">Deposit Billings Reconcile Board</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Click any record row to expand and view comprehensive financial audit trails, user phone files, and reference codes.</p>
                </div>
                <span className="text-xs bg-slate-950 text-slate-400 border border-slate-850 px-2 py-0.5 rounded font-mono">Invoice validation</span>
              </div>

              {upgradeList.length === 0 ? (
                <div className="text-center py-12 text-slate-600 font-sans text-xs">
                  No upgrade transaction receipt invoices submitted.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-850 bg-slate-950/10">
                  <table className="w-full text-left text-xs text-slate-400 font-sans border-collapse">
                    <thead className="bg-slate-950 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                      <tr className="border-b border-slate-850">
                        <th className="p-3">Reference & User Contact</th>
                        <th className="p-3">Level Tier</th>
                        <th className="p-3">Method Pay</th>
                        <th className="p-3">BDT Amt</th>
                        <th className="p-3">Transaction ID (TxID)</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Invoice Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upgradeList.map((invoice) => {
                        const isExpanded = expandedUpgradeId === invoice.id;
                        return (
                          <React.Fragment key={invoice.id}>
                            <tr 
                              onClick={() => setExpandedUpgradeId(isExpanded ? null : invoice.id)}
                              className="border-b border-slate-850 bg-slate-950/10 hover:bg-slate-900/40 cursor-pointer transition-colors"
                            >
                              <td className="p-3">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 font-mono font-bold text-slate-350 block w-fit">
                                    {invoice.paymentReference || 'PAY_REF_LEGACY'}
                                  </span>
                                  <span className="font-semibold text-slate-200 block">{invoice.userName || invoice.email}</span>
                                  <span className="text-[9px] text-slate-500 block">{invoice.email}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-mono font-bold ${
                                  invoice.tier === 'elite' ? 'bg-purple-500/10 border-purple-500/10 text-purple-400' :
                                  invoice.tier === 'premium' ? 'bg-indigo-500/10 border-indigo-500/10 text-indigo-400' :
                                  'bg-blue-500/10 border-blue-500/10 text-blue-400'
                                }`}>
                                  {invoice.tier} Upgrade
                                </span>
                              </td>
                              <td className="p-3 uppercase font-mono text-[10px] font-bold">
                                {invoice.paymentMethod === 'bank_qr' ? '⚡ BANGLA QR (BANK)' : invoice.paymentMethod}
                              </td>
                              <td className="p-3 font-mono font-bold text-slate-200">{invoice.amount}.00 BDT</td>
                              <td className="p-3 font-mono text-amber-500 font-extrabold tracking-wider">{invoice.transactionId}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                                  invoice.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' :
                                  invoice.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/10' :
                                  'bg-amber-500/10 text-amber-550 border-amber-500/10'
                                }`}>{invoice.status}</span>
                              </td>
                              <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                                {invoice.status === 'pending' ? (
                                  <div className="inline-flex gap-2">
                                    <button
                                      onClick={() => handleReviewUpgrade(invoice.id, 'rejected')}
                                      className="p-1 hover:bg-slate-800 hover:text-red-400 text-slate-500 rounded border border-slate-850 transition-colors cursor-pointer"
                                      title="Reject purchase"
                                    >
                                      <XSquare className="w-4.5 h-4.5" />
                                    </button>
                                    <button
                                      onClick={() => handleReviewUpgrade(invoice.id, 'approved')}
                                      className="p-1 hover:bg-slate-800 hover:text-emerald-400 text-slate-500 rounded border border-slate-850 transition-colors cursor-pointer"
                                      title="Confirm payment receipt"
                                    >
                                      <CheckCircle className="w-4.5 h-4.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-550 font-semibold uppercase">{invoice.status === 'approved' ? 'Settled ✔' : 'Declined ✘'}</span>
                                )}
                              </td>
                            </tr>

                            {isExpanded && (
                              <tr className="bg-slate-950/80 border-b border-slate-850">
                                <td colSpan={7} className="p-4" onClick={(e) => e.stopPropagation()}>
                                  <div className="bg-slate-900/50 border border-slate-850 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                                    
                                    {/* Left half details */}
                                    <div className="space-y-2 text-left">
                                      <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-500 block">Dossier Details</span>
                                      <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-900">
                                        <div className="flex justify-between items-center border-b border-slate-850 pb-1.5 pt-0.5">
                                          <span className="text-slate-550">Billing Reference No:</span>
                                          <span className="text-slate-300 font-mono font-bold">{invoice.paymentReference || 'PAY_REF_LEGACY'}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-850 py-1.5">
                                          <span className="text-slate-550">Client Full Name:</span>
                                          <span className="text-slate-200 font-semibold">{invoice.userName || 'Profile Registered'}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-850 py-1.5">
                                          <span className="text-slate-550">Contact Email:</span>
                                          <span className="text-slate-350 font-mono text-xs">{invoice.email}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-1.5">
                                          <span className="text-slate-555">Client Phone / WhatsApp:</span>
                                          <span className="text-slate-200 font-mono">{invoice.userPhone || 'No attached digit'}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Right half audit Trails */}
                                    <div className="space-y-2 text-left">
                                      <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-500 block">Financial Audit Timeline</span>
                                      <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-900">
                                        <div className="flex justify-between items-center border-b border-slate-850 pb-1.5 pt-0.5">
                                          <span className="text-slate-555">Request Submitted:</span>
                                          <span className="text-slate-400 font-mono text-[10.5px]">{new Date(invoice.createdAt).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-850 py-1.5">
                                          <span className="text-slate-555">Reconciliation Status:</span>
                                          <span className={`capitalize font-bold ${invoice.status === 'approved' ? 'text-emerald-400' : invoice.status === 'rejected' ? 'text-red-400' : 'text-amber-400'}`}>
                                            {invoice.status}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center pt-1.5">
                                          <span className="text-slate-555">Admin Approval History:</span>
                                          <span className="text-slate-300 font-semibold text-right">
                                            {invoice.reviewedAt ? (
                                              <span className="text-[10px] text-slate-450 block font-mono">
                                                Accepted by Registrar on {new Date(invoice.reviewedAt).toLocaleString()}
                                              </span>
                                            ) : (
                                              <span className="text-amber-500">Awaiting Registrar Review</span>
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WITHDRAWAL SETTLEMENTS */}
          {activeTab === 'withdrawals' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <h3 className="text-slate-100 font-sans font-medium text-sm">Payout Settlement Dashboard</h3>
                <span className="text-xs bg-slate-950 text-slate-400 border border-slate-850 px-2 py-0.5 rounded font-mono">Disbursement register</span>
              </div>

              {withdrawalList.length === 0 ? (
                <div className="text-center py-12 text-slate-600 font-sans text-xs">
                  All withdrawals are settled. Outbox payout request queue is empty.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-850">
                  <table className="w-full text-left text-xs text-slate-400 font-sans">
                    <thead className="bg-slate-950 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                      <tr className="border-b border-slate-850">
                        <th className="p-3">User Client / Email</th>
                        <th className="p-3">Channel Method</th>
                        <th className="p-3">Destination Payout Details</th>
                        <th className="p-3">Settlement Amount</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Dispatcher Transfer Tool</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawalList.map((req) => (
                        <tr key={req.id} className="border-b border-slate-850 bg-slate-950/20 hover:bg-slate-900/40">
                          <td className="p-3 font-semibold text-slate-200">{req.email}</td>
                          <td className="p-3 uppercase font-mono text-[10px]" style={{ color: req.method === 'bank' ? '#60a5fa' : '#34d399' }}>{req.method}</td>
                          <td className="p-3">
                            <span className="font-mono text-slate-300 block">{req.accountNumber}</span>
                            {req.bankName && <span className="text-[10px] text-slate-550 block">{req.bankName} - {req.branchName}</span>}
                          </td>
                          <td className="p-3 font-bold text-emerald-400">{req.amount.toFixed(2)} BDT</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                              req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' :
                              req.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/10' :
                              'bg-amber-500/10 text-amber-550 border-amber-500/10'
                            }`}>{req.status}</span>
                          </td>
                          <td className="p-3 text-right">
                            {req.status === 'pending' && (
                              <div className="inline-flex gap-2">
                                <button
                                  onClick={() => handleReviewWithdrawal(req.id, 'rejected')}
                                  className="p-1 hover:bg-slate-800 hover:text-red-400 text-slate-500 rounded border border-slate-850 transition-colors"
                                  title="Deny & Refund"
                                >
                                  <XSquare className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReviewWithdrawal(req.id, 'approved')}
                                  className="p-1 hover:bg-slate-800 hover:text-emerald-400 text-slate-500 rounded border border-slate-850 transition-colors"
                                  title="Approve & Send Payout"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: USER DIRECTORY & COMPLIANCE BANS */}
          {activeTab === 'users' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850 pb-3">
                <h3 className="text-slate-100 font-sans font-medium text-sm">Identity Directory Ledger</h3>
                <div className="relative max-w-xs w-full">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name, email, NID..."
                    value={userSearchText}
                    onChange={(e) => setUserSearchText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-4 py-1.5 text-slate-200 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-850">
                <table className="w-full text-left text-xs text-slate-400 font-sans">
                  <thead className="bg-slate-950 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    <tr className="border-b border-slate-850">
                      <th className="p-3">User Identity</th>
                      <th className="p-3">KYC Dossier</th>
                      <th className="p-3">Membership Tier</th>
                      <th className="p-3">Withdrawable Balance</th>
                      <th className="p-3">Daily Ad Limit Views</th>
                      <th className="p-3 text-right">Compliance Control</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((client) => {
                      const isExpanded = expandedUserId === client.id;
                      return (
                        <React.Fragment key={client.id}>
                          <tr 
                            onClick={() => setExpandedUserId(isExpanded ? null : client.id)}
                            className="border-b border-slate-850 bg-slate-950/20 hover:bg-slate-900/40 cursor-pointer transition-colors"
                          >
                            <td className="p-3">
                              <span className="font-semibold text-slate-200 block flex items-center gap-1.5">
                                {client.name || 'Anonymous User'}
                                <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-900 px-1 py-0.5 rounded border border-slate-850">{client.id}</span>
                              </span>
                              <span className="text-[10px] text-slate-550 block">{client.email}</span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold border ${
                                client.kycStatus === 'verified' ? 'bg-emerald-500/10 border-emerald-500/10 text-emerald-400' :
                                client.kycStatus === 'pending_verification' ? 'bg-amber-500/10 border-amber-500/10 text-amber-500' :
                                'bg-slate-900 border-slate-850 text-slate-500'
                              }`}>{client.kycStatus}</span>
                            </td>
                            <td className="p-3 capitalize font-bold text-slate-300">{client.membershipStatus}</td>
                            <td className="p-3 font-mono font-bold text-slate-200">{client.walletBalance.toFixed(2)} BDT</td>
                            <td className="p-3 font-mono">{client.dailyAdsWatched} completed</td>
                            <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                              {client.email !== "admin@adreward.com" && (
                                <button
                                  onClick={() => handleToggleBan(client.id)}
                                  className={`p-1.5 rounded-lg border transition-all inline-flex items-center gap-1 text-[10px] font-bold cursor-pointer ${
                                    client.isBanned 
                                      ? 'bg-red-500 text-white border-red-500' 
                                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-red-400 hover:border-red-500/20'
                                  }`}
                                >
                                  {client.isBanned ? (
                                    <><Lock className="w-3.5 h-3.5" /> BANNED</>
                                  ) : (
                                    <><Unlock className="w-3.5 h-3.5" /> ACTIVE</>
                                  )}
                                </button>
                              )}
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr className="bg-slate-950 border-b border-slate-850">
                              <td colSpan={6} className="p-4" onClick={(e) => e.stopPropagation()}>
                                <div className="bg-slate-900/50 border border-slate-850 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                  {/* Section columns */}
                                  <div className="space-y-2 text-left">
                                    <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-500 block">Personal Profile & Contact</span>
                                    <div className="space-y-1">
                                      <div className="flex justify-between items-center border-b border-slate-850 py-1">
                                        <span className="text-slate-550 mr-2">User ID:</span>
                                        <span className="text-slate-300 font-mono font-bold">{client.id}</span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-slate-850 py-1">
                                        <span className="text-slate-550 mr-2">Full Name:</span>
                                        <span className="text-slate-200 font-semibold">{client.name || 'Not Provided'}</span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-slate-850 py-1">
                                        <span className="text-slate-550 mr-2">Email Address:</span>
                                        <span className="text-slate-350 font-mono">{client.email}</span>
                                      </div>
                                      <div className="flex justify-between items-center py-1">
                                        <span className="text-slate-555 mr-2">Mobile Phone:</span>
                                        <span className="text-slate-200 font-mono font-semibold">{client.phone || 'Not Supplied'}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-2 text-left">
                                    <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-500 block">National KYC Dossier</span>
                                    <div className="space-y-1">
                                      <div className="flex justify-between items-center border-b border-slate-850 py-1">
                                        <span className="text-slate-555 mr-2">National ID Nu:</span>
                                        <span className="text-slate-200 font-mono font-bold">{client.idNumber || 'Not Uploaded'}</span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-slate-850 py-1">
                                        <span className="text-slate-555 mr-2">Date of Birth:</span>
                                        <span className="text-slate-205 font-mono">{client.dob || 'Not Provided'}</span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-slate-850 py-1">
                                        <span className="text-slate-555 mr-2">KYC Verify Status:</span>
                                        <span className={`capitalize font-bold ${client.kycStatus === 'verified' ? 'text-emerald-400' : client.kycStatus === 'rejected' ? 'text-indigo-400' : 'text-amber-400'}`}>{client.kycStatus}</span>
                                      </div>
                                      <div className="flex justify-between items-center py-1">
                                        <span className="text-slate-555 mr-2">Registration Date:</span>
                                        <span className="text-slate-400 font-mono text-[10.5px]">{client.createdAt ? new Date(client.createdAt).toLocaleString() : 'N/A'}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-2 text-left">
                                    <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-500 block">Audit Tracking & Stats</span>
                                    <div className="space-y-1">
                                      <div className="flex justify-between items-center border-b border-slate-850 py-1">
                                        <span className="text-slate-555 mr-2">Wallet Balance:</span>
                                        <span className="text-slate-100 font-mono font-bold">{client.walletBalance.toFixed(2)} BDT</span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-slate-850 py-1">
                                        <span className="text-slate-555 mr-2">Membership Status:</span>
                                        <span className="text-cyan-400 font-extrabold capitalize">{client.membershipStatus}</span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-slate-850 py-1">
                                        <span className="text-slate-555 mr-2">Last Login:</span>
                                        <span className="text-slate-350 font-mono text-[10px] text-right truncate max-w-[130px]">{client.lastLoginAt ? new Date(client.lastLoginAt).toLocaleString() : 'No logins'}</span>
                                      </div>
                                      <div className="flex justify-between items-center py-1">
                                        <span className="text-slate-555 mr-2">Verified Device:</span>
                                        <span className="text-slate-400 text-[9px] block text-right truncate max-w-[130px]" title={client.deviceInfo || 'Unknown'}>{client.deviceInfo || 'Unknown'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="border-t border-slate-850/60 my-4" />

                                {editingUserId === client.id ? (
                                  <form onSubmit={handleUpdateUserProfile} className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4 text-left">
                                    <div className="flex items-center gap-1.5 border-b border-slate-850 pb-2">
                                      <Shield className="w-4 h-4 text-amber-500" />
                                      <h5 className="font-bold text-slate-100 text-[11px] uppercase tracking-wider font-sans">KYC Profile Modification & Ledger Adjustment</h5>
                                    </div>

                                    {editErrorMessage && (
                                      <div className="p-2.5 bg-red-500/5 border border-red-500/10 text-red-400 rounded-lg text-[10px] font-mono">
                                        ⚠️ {editErrorMessage}
                                      </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
                                      {/* Row 1 */}
                                      <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-mono font-bold text-slate-500">Legal Name</label>
                                        <input
                                          type="text"
                                          value={editName}
                                          onChange={(e) => setEditName(e.target.value)}
                                          className="w-full bg-slate-900 border border-slate-850 rounded-lg py-1.5 px-3 text-xs text-slate-200 outline-none focus:border-amber-500/40"
                                        />
                                      </div>

                                      <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-mono font-bold text-slate-500">Registered Email</label>
                                        <input
                                          type="email"
                                          value={editEmail}
                                          onChange={(e) => setEditEmail(e.target.value)}
                                          className="w-full bg-slate-900 border border-slate-850 rounded-lg py-1.5 px-3 text-xs text-slate-200 outline-none focus:border-amber-500/40"
                                        />
                                      </div>

                                      <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-mono font-bold text-slate-500">Mobile Phone</label>
                                        <input
                                          type="text"
                                          value={editPhone}
                                          onChange={(e) => setEditPhone(e.target.value)}
                                          className="w-full bg-slate-900 border border-slate-850 rounded-lg py-1.5 px-3 text-xs text-slate-200 outline-none focus:border-amber-500/40"
                                        />
                                      </div>

                                      {/* Row 2 */}
                                      <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-mono font-bold text-slate-500">National ID NID</label>
                                        <input
                                          type="text"
                                          value={editIdNumber}
                                          onChange={(e) => setEditIdNumber(e.target.value)}
                                          className="w-full bg-slate-900 border border-slate-850 rounded-lg py-1.5 px-3 text-xs text-slate-200 outline-none focus:border-amber-500/40"
                                        />
                                      </div>

                                      <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-mono font-bold text-slate-500">Birth Date</label>
                                        <input
                                          type="text"
                                          value={editDob}
                                          onChange={(e) => setEditDob(e.target.value)}
                                          placeholder="DD / MM / YYYY"
                                          className="w-full bg-slate-900 border border-slate-850 rounded-lg py-1.5 px-3 text-xs text-slate-200 outline-none focus:border-amber-500/40"
                                        />
                                      </div>

                                      <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-mono font-bold text-slate-500 font-mono">Wallet Credit Balance (BDT)</label>
                                        <input
                                          type="number"
                                          step="0.01"
                                          value={editBalance}
                                          onChange={(e) => setEditBalance(Number(e.target.value))}
                                          className="w-full bg-slate-900 border border-slate-850 rounded-lg py-1.5 px-3 text-xs text-slate-200 outline-none focus:border-amber-500/40"
                                        />
                                      </div>

                                      {/* Row 3 */}
                                      <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-mono font-bold text-slate-500 font-mono">KYC Status</label>
                                        <select
                                          value={editKycStatus}
                                          onChange={(e) => setEditKycStatus(e.target.value as KycStatus)}
                                          className="w-full bg-slate-900 border border-slate-850 rounded-lg py-1.5 px-3 text-xs text-slate-200 outline-none focus:border-amber-500/40"
                                        >
                                          <option value="not_started">Not Started</option>
                                          <option value="pending_verification">Pending Verification</option>
                                          <option value="verified">Verified Compliance</option>
                                          <option value="rejected">Rejected / Failed</option>
                                        </select>
                                      </div>

                                      <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-mono font-bold text-slate-500 font-mono">Account Level Tier</label>
                                        <select
                                          value={editMembership}
                                          onChange={(e) => setEditMembership(e.target.value as MembershipTier)}
                                          className="w-full bg-slate-900 border border-slate-850 rounded-lg py-1.5 px-3 text-xs text-slate-200 outline-none focus:border-amber-500/40"
                                        >
                                          <option value="regular">Regular Level</option>
                                          <option value="standard">Standard Level</option>
                                          <option value="premium">Premium Level</option>
                                          <option value="elite">Elite VIP Level</option>
                                        </select>
                                      </div>

                                      <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-mono font-bold text-slate-500 font-mono">Security Access Lock</label>
                                        <select
                                          value={editIsBanned ? "true" : "false"}
                                          onChange={(e) => setEditIsBanned(e.target.value === "true")}
                                          className="w-full bg-slate-900 border border-slate-850 rounded-lg py-1.5 px-3 text-xs text-slate-200 outline-none focus:border-amber-500/40"
                                        >
                                          <option value="false">Active (Access Granted)</option>
                                          <option value="true">Banned / Interdicted (Access Forbidden)</option>
                                        </select>
                                      </div>
                                    </div>

                                    {/* MANDATORY REASON SECTION */}
                                    <div className="space-y-1">
                                      <label className="text-[9px] uppercase font-mono font-bold text-amber-500 block">Audit-Logging Adjustment Reason (Mandatory)</label>
                                      <textarea
                                        value={editReason}
                                        onChange={(e) => setEditReason(e.target.value)}
                                        rows={2}
                                        placeholder="Provide specific manual NID verification notes or recovery case descriptions..."
                                        className="w-full bg-slate-900 border border-amber-500/20 rounded-lg py-2 px-3 text-xs text-slate-200 outline-none focus:border-amber-500/50 placeholder-slate-705"
                                      />
                                    </div>

                                    <div className="flex gap-2 justify-end pt-2">
                                      <button
                                        type="button"
                                        onClick={() => setEditingUserId(null)}
                                        className="px-3.5 py-1.5 text-[11px] font-bold rounded-lg border border-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
                                      >
                                        Abort Editing
                                      </button>
                                      <button
                                        type="submit"
                                        disabled={isSubmittingEdit}
                                        className="px-4 py-1.5 text-[11px] font-bold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-600 transition-colors cursor-pointer flex items-center gap-1.5 font-sans"
                                      >
                                        <Shield className="w-3.5 h-3.5" />
                                        {isSubmittingEdit ? "Writing Logs..." : "Commit Secure Change"}
                                      </button>
                                    </div>
                                  </form>
                                ) : (
                                  <div className="flex justify-end">
                                    <button
                                      onClick={() => startEditingUser(client)}
                                      className="px-4 py-2 text-xs font-bold font-sans rounded-xl bg-slate-950 border border-slate-850 hover:border-amber-550 text-amber-500 hover:text-amber-400 flex items-center gap-1.5 shadow-md hover:shadow-amber-500/5 transition-all duration-200 cursor-pointer"
                                    >
                                      <Shield className="w-3.5 h-3.5" /> Modify Personal Credentials & KYC Files
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: CAMPAIGN MANAGER */}
          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              
              {/* CREATE NEW AD FORM */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                  <Plus className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-slate-200 text-sm font-sans font-medium">Add New Merchant Campaign Ad</h4>
                </div>

                <form onSubmit={handleAddCampaign} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Campaign Name Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Banglalink Mobile Recharge Offer"
                      value={adTitle}
                      onChange={(e) => setAdTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Ad Format Type</label>
                    <select
                      value={adType}
                      onChange={(e: any) => setAdType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none"
                    >
                      <option value="video">video</option>
                      <option value="image">image</option>
                      <option value="interactive">interactive</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Reward (BDT)</label>
                    <input
                      type="number"
                      required
                      step="any"
                      placeholder="Reward BDT value"
                      value={adReward}
                      onChange={(e) => setAdReward(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Category</label>
                    <input
                      type="text"
                      required
                      placeholder="Fintech, FMCG etc"
                      value={adCategory}
                      onChange={(e) => setAdCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-12 space-y-1">
                    <label className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Unsplash / Image Media URL link</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={adUrl}
                      onChange={(e) => setAdUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-200 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-12 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Launch Campaign
                    </button>
                  </div>

                </form>
              </div>

              {/* VIEW ACTIVE AD CAMPAIGNS LIST */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <h4 className="text-slate-200 text-sm font-sans font-medium">Running Merchant Campaigns</h4>
                  <span className="text-xs text-slate-500 font-mono">Operations tracker</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-850">
                  <table className="w-full text-left text-xs text-slate-400 font-sans">
                    <thead className="bg-slate-950 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                      <tr className="border-b border-slate-850">
                        <th className="p-3">Ad Title Campaigns</th>
                        <th className="p-3">Format</th>
                        <th className="p-3">Duration</th>
                        <th className="p-3">Reward Amount</th>
                        <th className="p-3">Engagement Views</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Settings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((adObj) => (
                        <tr key={adObj.id} className="border-b border-slate-850 bg-slate-950/20 hover:bg-slate-900/40">
                          <td className="p-3">
                            <span className="font-semibold text-slate-200 block">{adObj.title}</span>
                            <span className="text-[10px] text-slate-550 block capitalize">{adObj.category}</span>
                          </td>
                          <td className="p-3 font-mono text-[10.5px] uppercase text-sky-400">{adObj.adType}</td>
                          <td className="p-3 font-mono">{adObj.duration}s</td>
                          <td className="p-3 font-bold font-sans text-emerald-400">{adObj.rewardAmount.toFixed(2)} BDT</td>
                          <td className="p-3 font-mono font-bold text-slate-200">{adObj.viewsCount} views</td>
                          <td className="p-3">
                            <button
                              onClick={() => handleToggleAd(adObj.id)}
                              className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border transition-all ${
                                adObj.enabled ? 'bg-emerald-500/10 border-emerald-505/10 text-emerald-400' : 'bg-slate-900 border-slate-850 text-slate-500'
                              }`}
                            >
                              {adObj.enabled ? 'Enabled' : 'Disabled'}
                            </button>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteAd(adObj.id)}
                              className="p-1 text-slate-550 hover:text-red-400 hover:bg-slate-850 rounded transition-colors"
                              title="Delete campaign"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* TAB 7: SYSTEM AUDIT & SECURITY LOGS */}
          {activeTab === 'audit' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <div className="flex items-center gap-1.5">
                  <Database className="w-5 h-5 text-purple-400" />
                  <h3 className="text-slate-100 font-sans font-medium text-sm">Enterprise Cybersecurity Audit Logs</h3>
                </div>
                <span className="text-[10px] bg-slate-950 border border-slate-850 text-slate-500 px-2.5 py-0.5 font-bold font-mono rounded">IP tracking logs</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-850">
                <table className="w-full text-[11px] text-slate-350 font-sans">
                  <thead className="bg-slate-950 text-[9px] text-slate-550 uppercase font-bold tracking-wider">
                    <tr className="border-b border-slate-850 text-left">
                      <th className="p-3">Timestamp (UTC)</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Action Signatures</th>
                      <th className="p-3">Audit Details Descriptions</th>
                      <th className="p-3 font-mono">Terminal IP Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="border-b border-slate-850 bg-slate-950/10 hover:bg-slate-900/40">
                        <td className="p-3 text-slate-500 font-mono whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold border ${
                            log.category === 'system' ? 'bg-purple-500/10 border-purple-500/10 text-purple-400' :
                            log.category === 'payment' ? 'bg-teal-500/10 border-teal-500/10 text-teal-400' :
                            log.category === 'kyc' ? 'bg-amber-500/10 border-amber-500/10 text-amber-500' :
                            log.category === 'auth' ? 'bg-blue-500/10 border-blue-500/10 text-blue-400' :
                            'bg-slate-900 border-slate-800 text-slate-400'
                          }`}>{log.category}</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-205">{log.action}</td>
                        <td className="p-3 text-slate-400">{log.details}</td>
                        <td className="p-3 font-mono text-slate-600">{log.ipAddress || '127.0.0.1'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
