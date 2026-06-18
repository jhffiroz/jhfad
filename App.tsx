import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  Phone, 
  User as UserIcon, 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  Eye, 
  EyeOff, 
  Sparkles,
  Zap,
  ArrowRight,
  Tv,
  Globe2,
  MessageSquare,
  Timer,
  RefreshCw,
  Send,
  Layers
} from 'lucide-react';
import { User } from './types';
import UserDashboard from './UserDashboard';
import AdminPanel from './AdminPanel';
import KycCapture from './KycCapture';
import LandingPage from './LandingPage';

export default function App() {
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [isRegistrar, setIsRegistrar] = useState(false);
  const [view, setView] = useState<'login' | 'register'>('login');
  const [showLanding, setShowLanding] = useState(true);
  
  // Login Form States
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);

  // Register Wizard Form States
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regOtp, setRegOtp] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [registrationMode, setRegistrationMode] = useState<'form' | 'kyc_camera' | 'otp_verify'>('form');
  const [verificationMethod, setVerificationMethod] = useState<'whatsapp' | 'email'>('whatsapp');

  // Configurable WhatsApp OTP verification states
  const [otpExpiryConfig, setOtpExpiryConfig] = useState<number>(3); // 3 to 5 minutes configurable
  const [otpSecondsRemaining, setOtpSecondsRemaining] = useState<number>(180);
  const [otpResendsLeft, setOtpResendsLeft] = useState<number>(3);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [whatsappVerificationToken, setWhatsappVerificationToken] = useState<string>('');
  const [otpSimulatedReceiver, setOtpSimulatedReceiver] = useState<string>('');
  const [otpLogs, setOtpLogs] = useState<string[]>([]);
  const [otpIsSending, setOtpIsSending] = useState<boolean>(false);
  const [otpIsVerifying, setOtpIsVerifying] = useState<boolean>(false);

  // Countdown timer for active WhatsApp OTP
  useEffect(() => {
    let timer: any;
    if (registrationMode === 'otp_verify' && otpSent && otpSecondsRemaining > 0) {
      timer = setInterval(() => {
        setOtpSecondsRemaining((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [registrationMode, otpSent, otpSecondsRemaining]);

  // KYC captured cache for registration
  const [kycData, setKycData] = useState<{ idCardBase64: string; selfieBase64: string; extracted: { name: string; idNumber: string; dob: string } } | null>(null);

  // Quick Action Notification Toast
  const [noticeToast, setNoticeToast] = useState<string | null>(null);

  // Active KYC trigger modal inside user profile
  const [showDashboardKyc, setShowDashboardKyc] = useState(false);

  useEffect(() => {
    // Check for previous session token
    const token = localStorage.getItem('ad_auth_token');
    if (token) {
      loadProfileUsingToken(token);
    }
  }, []);

  const triggerToast = (msg: string) => {
    setNoticeToast(msg);
    setTimeout(() => setNoticeToast(null), 3000);
  };

  const loadProfileUsingToken = async (token: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setActiveUser(data.user);
        setIsRegistrar(data.user.email === 'admin@adreward.com');
      } else {
        localStorage.removeItem('ad_auth_token');
      }
    } catch {
      console.warn("Client offline. Session bypassed.");
    }
  };

  // Enforce rigid password complexity rules
  const passwordCriteria = {
    length: regPassword.length >= 8,
    uppercase: /[A-Z]/.test(regPassword),
    lowercase: /[a-z]/.test(regPassword),
    number: /[0-9]/.test(regPassword),
    symbol: /[^A-Za-z0-9]/.test(regPassword)
  };
  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppError(null);
    if (!emailInput || !passwordInput) {
      setAppError("Please fill out all credentials.");
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim(), password: passwordInput })
      });
      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('ad_auth_token', data.token);
        setActiveUser(data.user);
        setIsRegistrar(data.user.email === 'admin@adreward.com');
        triggerToast(`Welcome back, ${data.user.name || data.user.email}!`);
      } else {
        setAppError(data.error || "Authentication declined. Retry credentials.");
      }
    } catch {
      setAppError("System server offline. Check connection.");
    }
  };

  // Handles wizard transition to camera capture
  const handleNextToKyc = (e: React.FormEvent) => {
    e.preventDefault();
    setAppError(null);
    if (!regEmail || !regPhone || !regPassword) {
      setAppError("Email, mobile number, and password required.");
      return;
    }
    if (!isPasswordValid) {
      setAppError("Satisfy all strict security pass criteria below first.");
      return;
    }
    setRegistrationMode('kyc_camera');
  };

  // Sends the real OTP by contacting the /api/otp/send backend endpoint
  const sendWhatsAppOtp = async (phoneToVerifyCheck: string, durationMinutes: number, isResend = false, targetMethod?: 'whatsapp' | 'email') => {
    if (!phoneToVerifyCheck) return;
    setOtpIsSending(true);
    setAppError(null);
    const activeMethod = targetMethod || verificationMethod;
    const chLabel = activeMethod === 'email' ? 'Email' : 'WhatsApp';
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneToVerifyCheck.trim(),
          email: regEmail.trim(),
          expiryMinutes: durationMinutes,
          method: activeMethod
        })
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setOtpSecondsRemaining(durationMinutes * 60);
        setOtpSimulatedReceiver(data.serverSimulatedMessage || `[SIMULATION] Verification OTP sent via secure ${chLabel} channel to ${activeMethod === 'email' ? regEmail : phoneToVerifyCheck}`);
        
        const timestamp = new Date().toLocaleTimeString();
        if (isResend) {
          setOtpResendsLeft((prev) => Math.max(0, prev - 1));
          setOtpLogs((prev) => [...prev, `[${timestamp}] Resent ${chLabel} OTP to ${activeMethod === 'email' ? regEmail : phoneToVerifyCheck} (${otpResendsLeft - 1} left)`]);
        } else {
          setOtpLogs([`[${timestamp}] Dispatched secure ${chLabel} OTP code to ${activeMethod === 'email' ? regEmail : phoneToVerifyCheck}`]);
        }
        triggerToast(`${chLabel} Verification OTP dispatched successfully!`);
      } else {
        const timestamp = new Date().toLocaleTimeString();
        setOtpLogs((prev) => [...prev, `[${timestamp}] Failed sending OTP: ${data.error}`]);
        setAppError(data.error || "Failed sending verification packet.");
      }
    } catch {
      setAppError(`System network issue. Could not dispatch ${chLabel} OTP packet.`);
    } finally {
      setOtpIsSending(false);
    }
  };

  // Verifies the submitted OTP against /api/otp/verify to receive a secure token
  const verifyWhatsAppOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!regOtp.trim()) {
      setAppError(`Enter the 4-digit verification code sent to your ${verificationMethod === 'email' ? 'Email' : 'WhatsApp'} channel.`);
      return;
    }
    setOtpIsVerifying(true);
    setAppError(null);
    const chLabel = verificationMethod === 'email' ? 'Email' : 'WhatsApp';
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: regPhone.trim(),
          email: regEmail.trim(),
          method: verificationMethod,
          code: regOtp.trim()
        })
      });
      const data = await res.json();
      const timestamp = new Date().toLocaleTimeString();

      if (res.ok && data.verificationToken) {
        setWhatsappVerificationToken(data.verificationToken);
        setOtpLogs((prev) => [...prev, `[${timestamp}] ${chLabel} Verification successful! Secure cryptographic token registered.`]);
        triggerToast(`${chLabel} verification complete! Activate account below.`);
      } else {
        setOtpLogs((prev) => [...prev, `[${timestamp}] Verification failed: ${data.error || 'Invalid code'}`]);
        setAppError(data.error || "Incorrect OTP token. Please retry.");
      }
    } catch {
      setAppError("Verification check failed due to technical server issue.");
    } finally {
      setOtpIsVerifying(false);
    }
  };

  // Receives National ID snapshot, selfie biometric and raw OCR details from KycCapture
  const handleKycCaptured = (idCard: string, selfie: string, ocr: { name: string; idNumber: string; dob: string }) => {
    setKycData({
      idCardBase64: idCard,
      selfieBase64: selfie,
      extracted: ocr
    });
    setRegistrationMode('otp_verify');
    setRegOtp('');
    setWhatsappVerificationToken('');
    // Dispatch the first OTP with the current config expiry
    sendWhatsAppOtp(regPhone, otpExpiryConfig, false);
  };

  // Submit final payload after successful WhatsApp OTP verification check finishes
  const handleFinalVerifyAndCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppError(null);

    if (!whatsappVerificationToken) {
      setAppError("Please complete WhatsApp OTP verification first by entering the code and clicking 'Verify Code'.");
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail.trim(),
          password: regPassword,
          phone: regPhone.trim(),
          name: kycData?.extracted.name,
          idNumber: kycData?.extracted.idNumber,
          dob: kycData?.extracted.dob,
          idCardUrl: kycData?.idCardBase64,
          selfieUrl: kycData?.selfieBase64,
          verificationToken: whatsappVerificationToken
        })
      });
      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('ad_auth_token', data.token);
        setActiveUser(data.user);
        setIsRegistrar(data.user.email === 'admin@adreward.com');
        triggerToast("Account created with automated identity matching verified!");
      } else {
        setAppError(data.error || "Registry denied.");
      }
    } catch {
      setAppError("Failed saving user. Backend endpoint unreachable.");
    }
  };

  // Quick sandbox fast-track access shortcut to sample client directories
  const autoSetupMockUser = (type: 'user' | 'admin') => {
    if (type === 'admin') {
      setEmailInput('jhfboss');
      setPasswordInput('3624');
    } else {
      setEmailInput('user@adreward.com');
      setPasswordInput('User@1234');
    }
    triggerToast(`Auto-populated profile credentials: ${type === 'admin' ? 'jhfboss (Admin)' : 'Test Member'}`);
  };

  const handleLogoutAction = () => {
    localStorage.removeItem('ad_auth_token');
    setActiveUser(null);
    setIsRegistrar(false);
    triggerToast("Session logged out successfully.");
  };

  if (!activeUser && showLanding) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
        {/* GLOBAL TOAST NOTICE */}
        {noticeToast && (
          <div className="fixed top-4 right-4 z-50 bg-slate-900 border border-slate-800 text-slate-200 px-4 py-3 rounded-xl shadow-2xl animate-fade-in flex items-center gap-2 max-w-sm">
            <div className="bg-emerald-500/15 text-emerald-400 p-1 rounded-md">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-sans font-medium">{noticeToast}</span>
          </div>
        )}
        <LandingPage 
          onEnterApp={(mode) => {
            setView(mode);
            setShowLanding(false);
          }} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* GLOBAL TOAST NOTICE */}
      {noticeToast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 border border-slate-800 text-slate-200 px-4 py-3 rounded-xl shadow-2xl animate-fade-in flex items-center gap-2 max-w-sm">
          <div className="bg-emerald-500/15 text-emerald-400 p-1 rounded-md">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-sans font-medium">{noticeToast}</span>
        </div>
      )}

      {/* NAV HEADER BAR */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-400 p-2 rounded-xl text-slate-950 shadow-md">
            <Tv className="w-5 h-5 font-bold" />
          </div>
          <div>
            <h1 className="text-sm font-bold font-sans tracking-tight text-slate-100 leading-tight">JHF AD REWARD PLATFORM</h1>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono">2026 Enterprise Edition</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <Globe2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secure DNS Node SSL ACTIVE</span>
          </div>
          {activeUser && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-850 px-3 py-1 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 block animate-pulse" />
              <span className="text-xs font-mono font-medium text-slate-300">{activeUser.email}</span>
            </div>
          )}
        </div>
      </header>

      {/* CORE FRAME CONTAINER */}
      <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full">
        {activeUser ? (
          /* ROUTE RENDERER */
          isRegistrar ? (
            <AdminPanel 
              user={activeUser} 
              onLogout={handleLogoutAction} 
            />
          ) : (
            <UserDashboard 
              user={activeUser} 
              onLogout={handleLogoutAction} 
              onUserChange={(updated) => setActiveUser(updated)}
              onKycTrigger={() => setShowDashboardKyc(true)}
              showKycCapture={showDashboardKyc}
              setShowKycCapture={setShowDashboardKyc}
            />
          )
        ) : (
          /* ANONYMOUS SYSTEM LOGIN/REGISTER FORMS */
          <div className="max-w-md mx-auto my-6 bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-2xl p-6 relative">
            
            <div className="text-center pb-6">
              <h2 className="text-xl font-medium text-slate-100 font-sans tracking-tight">
                {view === 'login' ? 'Authentication Registry' : 'Identity Account Creation'}
              </h2>
              <p className="text-xs text-slate-400 mt-1.5">
                {view === 'login' 
                  ? 'Access your ad earnings, completed histories, and bank gateways.' 
                  : 'Capture National ID cards and live selfies to automatically approve KYC.'}
              </p>
              <button
                type="button"
                onClick={() => setShowLanding(true)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-sans cursor-pointer"
              >
                &larr; Back to Website Homepage
              </button>
            </div>

            {appError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-start gap-2.5 text-xs mb-5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{appError}</span>
              </div>
            )}

            {view === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Account Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. jahid@gmail.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    <span>Account Password</span>
                    <span className="text-slate-550 lowercase">Min 8 characters</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-500 hover:text-slate-400 absolute right-3 top-3"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-5 py-3 bg-emerald-500 hover:bg-emerald-600 font-bold text-xs text-slate-950 rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 pt-3.5"
                >
                  Authorize Profile Login <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-4 border-t border-slate-800 text-center">
                  <p className="text-xs text-slate-400">
                    New user?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setView('register');
                        setRegistrationMode('form');
                        setAppError(null);
                      }}
                      className="text-emerald-400 hover:text-emerald-350 transition-colors font-medium"
                    >
                      Complete Camera ID KYC Code &rarr;
                    </button>
                  </p>
                </div>

                {/* FAST ACCESS SANDBOX PROFILE CARDS ACCORDION */}
                <div className="mt-6 bg-slate-950 p-4 border border-teal-500/10 rounded-xl space-y-3">
                  <div className="flex items-center gap-1 text-[10px] text-teal-400 uppercase tracking-wider font-extrabold">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Fast-Track Sandbox bypass profiles:
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                    Use these click buttons to sample full-stack files (Admin panels, upgrade bill approvals, KYC review cameras) with pre-configured points.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => autoSetupMockUser('user')}
                      className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-850 hover:border-emerald-500/20 transition-all text-left"
                    >
                      <span className="text-[10px] text-slate-200 font-bold block">Test Member Account</span>
                      <span className="text-[9px] text-slate-500 block font-mono">1,250 BDT, KYC verified</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => autoSetupMockUser('admin')}
                      className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-850 hover:border-purple-500/20 transition-all text-left"
                    >
                      <span className="text-[10px] text-slate-200 font-bold block">Ad registrar Admin</span>
                      <span className="text-[9px] text-slate-500 block font-mono">Control approvals & ads</span>
                    </button>
                  </div>
                </div>

              </form>
            ) : (
              /* REGISTRATION WIZARD FLOWS */
              <div>
                
                {registrationMode === 'form' && (
                  <form onSubmit={handleNextToKyc} className="space-y-4">
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Your Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                        <input
                          type="email"
                          required
                          placeholder="jahid@gmail.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-slate-205 text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Mobile phone number</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                        <input
                          type="tel"
                          required
                          placeholder="+8801700000000"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-slate-205 text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-505 uppercase tracking-widest font-bold block font-sans">Set Password Credentials</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-505 absolute left-3 top-3.5" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          placeholder="Password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-10 pr-10 py-2.5 text-slate-202 text-sm focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="text-slate-505 hover:text-slate-300 absolute right-3 top-3"
                        >
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* PASS CRITERIA HUD BLOCK */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-[10.5px] space-y-1.5">
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider font-extrabold block">Security Compliance Requirements</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${passwordCriteria.length ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 border border-slate-800 text-slate-600'}`}>
                            {passwordCriteria.length ? '✓' : '✗'}
                          </span>
                          <span className={passwordCriteria.length ? 'text-slate-300' : 'text-slate-600'}>Min 8 characters</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${passwordCriteria.uppercase ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 border border-slate-800 text-slate-600'}`}>
                            {passwordCriteria.uppercase ? '✓' : '✗'}
                          </span>
                          <span className={passwordCriteria.uppercase ? 'text-slate-300' : 'text-slate-600'}>Uppercase letter</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${passwordCriteria.lowercase ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 border border-slate-800 text-slate-600'}`}>
                            {passwordCriteria.lowercase ? '✓' : '✗'}
                          </span>
                          <span className={passwordCriteria.lowercase ? 'text-slate-300' : 'text-slate-600'}>Lowercase letter</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${passwordCriteria.number ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 border border-slate-800 text-slate-600'}`}>
                            {passwordCriteria.number ? '✓' : '✗'}
                          </span>
                          <span className={passwordCriteria.number ? 'text-slate-300' : 'text-slate-600'}>Numeric digit</span>
                        </div>
                        <div className="flex items-center gap-1.5 col-span-2">
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${passwordCriteria.symbol ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 border border-slate-800 text-slate-600'}`}>
                            {passwordCriteria.symbol ? '✓' : '✗'}
                          </span>
                          <span className={passwordCriteria.symbol ? 'text-slate-300' : 'text-slate-600'}>Special Character (!@#$%^&*)</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!isPasswordValid}
                      className={`w-full px-4 py-3 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 pt-3.5 ${
                        isPasswordValid 
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 cursor-pointer' 
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-850'
                      }`}
                    >
                      Configure Camera KYC Verification <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="pt-4 border-t border-slate-800 text-center">
                      <p className="text-xs text-slate-400">
                        Already have access?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setView('login');
                            setAppError(null);
                          }}
                          className="text-emerald-400 hover:text-emerald-355 font-medium transition-colors"
                        >
                          Security Login Portal &larr;
                        </button>
                      </p>
                    </div>

                  </form>
                )}

                {registrationMode === 'kyc_camera' && (
                  <div className="fixed inset-0 bg-slate-955/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="w-full max-w-xl">
                      <KycCapture
                        onCaptureCompleted={handleKycCaptured}
                        onCancel={() => setRegistrationMode('form')}
                      />
                    </div>
                  </div>
                )}
                {registrationMode === 'otp_verify' && (
                  <div className="space-y-4">
                    {/* CONFIRMATION BANNER */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl space-y-1">
                      <span className="font-semibold text-xs block flex items-center gap-1.5 uppercase tracking-wider">
                        <Check className="w-3.5 h-3.5" /> National ID OCR Cleared
                      </span>
                      <p className="text-[11px] leading-relaxed">
                        Hello <b>{kycData?.extracted.name}</b>, your ID number {kycData?.extracted.idNumber} matches official registry files.
                      </p>
                            {/* VERIFICATION CHANNEL SWITCHER */}
                    <div className="bg-slate-900/60 border border-slate-850 p-3.5 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                          1. Select Verification Method (যেকোনো একটি ভেরিফাই করুন)
                        </span>
                        <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-900/40 font-mono font-bold">1/2 Methods Required</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={otpIsSending || whatsappVerificationToken !== ''}
                          onClick={() => {
                            setVerificationMethod('whatsapp');
                            setRegOtp('');
                            sendWhatsAppOtp(regPhone, otpExpiryConfig, false, 'whatsapp');
                          }}
                          className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                            verificationMethod === 'whatsapp'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-extrabold'
                              : 'bg-slate-950 text-slate-400 border border-slate-900/80 hover:text-slate-200'
                          } disabled:opacity-50`}
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          WhatsApp Verification
                        </button>
                        <button
                          type="button"
                          disabled={otpIsSending || whatsappVerificationToken !== ''}
                          onClick={() => {
                            setVerificationMethod('email');
                            setRegOtp('');
                            sendWhatsAppOtp(regPhone, otpExpiryConfig, false, 'email');
                          }}
                          className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                            verificationMethod === 'email'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-extrabold'
                              : 'bg-slate-950 text-slate-400 border border-slate-900/80 hover:text-slate-200'
                          } disabled:opacity-50`}
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Email Verification
                        </button>
                      </div>
                    </div>

                    {/* CONFIGURABLE EXPIRY & SESSION STATS */}
                    <div className="font-sans space-y-3 bg-slate-950/60 border border-slate-850 p-4 rounded-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-3">
                        <span className="text-[10.5px] uppercase tracking-wider text-slate-500 font-bold block">2. Configure {verificationMethod === 'email' ? 'Email' : 'WhatsApp'} Expiry</span>
                        
                        {/* Selector for 3, 4, 5 minutes configuration */}
                        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                          {[3, 4, 5].map((minutes) => {
                            const isSelected = otpExpiryConfig === minutes;
                            return (
                              <button
                                key={minutes}
                                type="button"
                                disabled={otpIsSending || whatsappVerificationToken !== ''}
                                onClick={() => {
                                  setOtpExpiryConfig(minutes);
                                  sendWhatsAppOtp(regPhone, minutes, false);
                                }}
                                className={`px-2.5 py-1 text-[10.5px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                                  isSelected 
                                    ? 'bg-emerald-500 text-slate-950 font-extrabold' 
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                                }`}
                                title={`Set expiration to ${minutes} minutes`}
                              >
                                {minutes} Min
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* COUNTDOWN TIMER */}
                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-1.5 text-slate-350 text-xs">
                          <Timer className={`w-4 h-4 ${otpSecondsRemaining < 30 ? 'text-red-400 animate-pulse' : 'text-slate-400'}`} />
                          <span>Session Active Ticket Time:</span>
                        </div>
                        <span className={`font-mono font-extrabold text-sm ${otpSecondsRemaining < 30 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                          {Math.floor(otpSecondsRemaining / 60).toString().padStart(2, '0')}:{(otpSecondsRemaining % 60).toString().padStart(2, '0')}
                        </span>
                      </div>

                      {/* WHATSAPP OTP ATTEMPT PROGRESS */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-850/40">
                        <span>Resend tokens quota left:</span>
                        <span className="font-bold text-slate-300 font-mono">{otpResendsLeft} / 3 attempts</span>
                      </div>
                    </div>

                    {/* INTERACTIVE WHATSAPP MESSAGE PUSH ACCORDION (For seamless testing preview) */}
                    <div className="bg-slate-950 border border-emerald-500/20 rounded-2xl overflow-hidden p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] uppercase font-mono font-bold tracking-wider text-emerald-400 flex items-center gap-1.5">
                          {verificationMethod === 'email' ? <Mail className="w-3.5 h-3.5 text-emerald-500" /> : <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />} Incoming {verificationMethod === 'email' ? 'Email' : 'WhatsApp'} Secure Push
                        </span>
                        <span className="text-[8.5px] bg-emerald-950/80 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-900/30">Active Simulation Link</span>
                      </div>

                      {/* WhatsApp Chat Bubble style */}
                      <div className="bg-[#0b141a] border border-slate-850/60 p-3 rounded-xl space-y-1 relative">
                        <div className="flex items-center gap-1.5 justify-start text-[10px] text-emerald-450 font-sans border-b border-slate-850/40 pb-1.5 mb-1.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          <strong className="text-slate-200">AdReward Registrar Service ({verificationMethod === 'email' ? 'Email' : 'WhatsApp'})</strong>
                          <span className="text-slate-400">&bull; Today at {new Date().toLocaleTimeString().slice(0, 5)}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                          {otpSimulatedReceiver || "Awaiting authorization system payload sequence..."}
                        </p>
                      </div>
                    </div>

                    {/* INPUT & VERIFICATION FORM STATUS */}
                    <div className="space-y-3.5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block text-center">Enter 4-Digit {verificationMethod === 'email' ? 'Email' : 'WhatsApp'} Token</label>
                        
                        <div className="flex items-center gap-2 max-w-[280px] mx-auto">
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="e.g. 5291"
                            disabled={whatsappVerificationToken !== '' || otpIsVerifying}
                            value={regOtp}
                            onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, ''))}
                            className={`flex-1 text-center bg-slate-950 border rounded-xl px-4 py-2.5 text-slate-205 font-mono tracking-widest text-lg focus:outline-none focus:border-emerald-500 block ${
                              whatsappVerificationToken !== '' ? 'border-emerald-500/30 bg-emerald-950/10 text-emerald-400' : 'border-slate-850'
                            }`}
                          />
                          
                          {/* Verify Code Button */}
                          {whatsappVerificationToken === '' ? (
                            <button
                              type="button"
                              onClick={() => verifyWhatsAppOtp()}
                              disabled={otpIsVerifying || otpSecondsRemaining === 0}
                              className="px-4 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-bold text-xs rounded-xl transition-colors select-none cursor-pointer border border-slate-700"
                            >
                              {otpIsVerifying ? 'Verifying...' : 'Verify Code'}
                            </button>
                          ) : (
                            <span className="p-2.5 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-900 flex items-center justify-center">
                              <ShieldCheck className="w-6 h-6" />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* RESEND TRIGGER BUTTON */}
                      {whatsappVerificationToken === '' && (
                        <div className="text-center">
                          <button
                            type="button"
                            disabled={otpIsSending || otpResendsLeft === 0}
                            onClick={() => sendWhatsAppOtp(regPhone, otpExpiryConfig, true)}
                            className="text-xs text-slate-450 hover:text-slate-200 transition-colors inline-flex items-center gap-1.5 underline underline-offset-4 decoration-slate-800 hover:decoration-slate-400 cursor-pointer disabled:text-slate-650 disabled:no-underline disabled:cursor-not-allowed"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${otpIsSending ? 'animate-spin' : ''}`} /> Resend {verificationMethod === 'email' ? 'Email' : 'WhatsApp'} OTP
                          </button>
                        </div>
                      )}
                    </div>              </div>

                    {/* LIVE AUDIT LOGS TRAIL PANEL */}
                    <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-3.5 space-y-2">
                      <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-550 block">Audit Activity Traces Logs</span>
                      <div className="max-h-[85px] overflow-y-auto space-y-1 font-mono text-[9px] text-slate-500">
                        {otpLogs.map((log, index) => (
                          <p key={index} className="leading-snug">{log}</p>
                        ))}
                      </div>
                    </div>

                    {/* ACTIONS: PREVENT ACTIONS UNTIL WHATSAPP OTP VERIFIED */}
                    <form onSubmit={handleFinalVerifyAndCreate} className="space-y-3 pt-3 border-t border-slate-850">
                      <button
                        type="submit"
                        disabled={whatsappVerificationToken === ''}
                        className={`w-full px-5 py-3 font-bold text-xs rounded-xl shadow-lg transition-all pt-3.5 select-none ${
                          whatsappVerificationToken !== '' 
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 cursor-pointer animate-pulse' 
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-850/50'
                        }`}
                      >
                        Approve Security Checks & Open Wallet &rarr;
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setRegistrationMode('form');
                          setOtpSent(false);
                        }}
                        className="w-full text-center text-xs text-slate-500 hover:text-slate-355 transition-colors cursor-pointer"
                      >
                        Change Registration Details
                      </button>
                    </form>
                  </div>
                )}

              </div>
            )}

          </div>
        )}
      </main>

      {/* FOOTER BAR */}
      <footer className="border-t border-slate-900 bg-slate-950/40 py-6 mt-12 text-center text-[10.5px] text-slate-550 space-y-2">
        <p className="font-mono">Copyright &copy; 2026 JHF AD REWARD PLATFORM Ltd. All rights reserved.</p>
        <div className="flex justify-center gap-4 text-slate-500">
          <a href="#" className="hover:text-slate-400">Cyber Resilience Audits</a>
          <span>&bull;</span>
          <a href="#" className="hover:text-slate-400">Anti-Scamp Compliance Guidelines</a>
          <span>&bull;</span>
          <a href="#" className="hover:text-slate-400">Bangladeshi Merchant Policy</a>
        </div>
      </footer>
    </div>
  );
}
