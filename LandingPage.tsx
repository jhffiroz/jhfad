import React, { useState } from 'react';
import { 
  Tv, 
  ShieldCheck, 
  Zap, 
  Wallet, 
  ArrowRight, 
  ArrowUpRight, 
  Check, 
  Users, 
  Lock, 
  Sparkles, 
  HelpCircle, 
  Mail, 
  MessageSquare,
  ShieldAlert,
  Coins
} from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onEnterApp: (mode: 'login' | 'register') => void;
}

export default function LandingPage({ onEnterApp }: LandingPageProps) {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [submittedContact, setSubmittedContact] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const testimonials = [
    { name: 'Sabbir Ahmed', role: 'Premium Gold Member', location: 'Dhaka', text: 'Watching ads on JHF has been an absolute game changer. The payouts are credited instantly, and support for bKash is seamless!' },
    { name: 'Nusrat Jahan', role: 'Premium Bronze Member', location: 'Chittagong', text: 'I was skeptical about the KYC security at first, but knowing that they protect our assets with face biometrics and strict NID uniqueness gives me extreme confidence!' },
    { name: 'Fahim Faisal', role: 'Premium Silver Member', location: 'Sylhet', text: 'The interface is amazingly detailed and the cyber style looks incredibly premium. Best BDT rewards network in Bangladesh!' }
  ];

  const pricingTiers = [
    {
      name: 'Regular',
      multiplier: '1.0x Payouts',
      price: 'Free',
      color: 'border-slate-800/80 text-slate-400 bg-slate-900/25',
      features: ['Access up to 5 Standard Ads / Day', ' bKash & Nagad Cashouts', 'Standard KYC Verification', 'Full Watch Protection Trail']
    },
    {
      name: 'Bronze Club',
      multiplier: '1.5x Payouts',
      price: '500 BDT',
      color: 'border-amber-600/30 text-amber-500 bg-amber-950/10 shadow-[0_0_15px_rgba(217,119,6,0.05)]',
      features: ['1.5x Multipled Earnings per view', 'Access Premium High-Yield Ads', 'Priority KYC Review within 2 hours', 'Withdrawal Processing Priority']
    },
    {
      name: 'Silver Club',
      multiplier: '2.0x Payouts',
      price: '1,200 BDT',
      color: 'border-cyan-600/30 text-cyan-400 bg-cyan-950/10 shadow-[0_0_20px_rgba(6,182,212,0.05)]',
      features: ['Double (2.0x) Reward Factor on watched ads', 'Unlimited High-Earning Ad Queues', 'Instant SMS Alerts on payouts', 'Dedicated Telegram VIP Channel Access']
    },
    {
      name: 'Gold Club',
      multiplier: '3.0x Payouts',
      price: '2,500 BDT',
      color: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/10 shadow-[0_0_25px_rgba(16,185,129,0.15)]',
      features: ['Triple (3.0x) Ultimate Payout rate', 'Elite VIP Partner Campaigns', 'Instant real-time payment settlement', 'Overlord Support Response Guaranteed']
    }
  ];

  const faqItems = [
    { q: 'Is this platform legally compliant in Bangladesh?', a: 'Yes. We enforce rigorous NID identity vaulting to prevent fraudulent secondary accounts and tax evaders, aligning fully with mobile financial services and compliance regulations.' },
    { q: 'How does the "One NID = One Account" rule operate?', a: 'Our automated server databases cross-validate ID number entries. Attempting to scan or register a second account using a previously verified ID number or selfie biometric gets flagged instantly as system fraud.' },
    { q: 'Are there withdrawals processing limits?', a: 'Standard users have a lower daily withdrawal range, while our Bronze, Silver, and Gold VIP Club memberships unlock larger ceiling cashouts with zero transaction processing friction.' },
    { q: 'How does the camera OCR extraction work?', a: 'When capturing your NID card, our system crops the card boundaries, corrects skew levels, boosts text contrast, and employs Gemini neural models to automatically structure your Name, DOB, and NID.' }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactName && contactEmail && contactMsg) {
      setSubmittedContact(true);
      setTimeout(() => setSubmittedContact(false), 4000);
      setContactName('');
      setContactEmail('');
      setContactMsg('');
    }
  };

  return (
    <div className="space-y-24 pb-12 overflow-hidden text-slate-100 bg-[#030712] font-sans">
      {/* HERO SECTION WITH CYBER CHROMATIC SHIELD */}
      <section className="relative pt-12 pb-20 px-4 flex flex-col items-center text-center overflow-hidden">
        {/* Subtle Neon Background Grid & Flares */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-35" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[200px] h-[200px] bg-cyan-600/10 rounded-full blur-[80px]" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-350 text-[10px] font-mono tracking-wider font-extrabold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse block" />
            SECURE AD MULTIPLIER NETWORKS &bull; TRUSTED GLOBAL KYC
          </div>

          <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-slate-50 font-sans leading-tight">
            Earn High-Reward BDT 
            <span className="block mt-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent font-bold">
              Watching Global Campaigns
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto font-sans leading-relaxed">
            The first Bangladeshi premium ad wallet protected by elite military-grade biometric KYC, 
            instant mobile financial payouts, and double/triple VIP multiplication tiers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onEnterApp('register')}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-semibold text-xs rounded-xl hover:opacity-95 shadow-[0_0_20px_rgba(34,197,94,0.15)] flex items-center justify-center gap-1.5 hover:scale-[1.02] transition-all"
            >
              Get Started (Free Account) <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEnterApp('login')}
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 border border-slate-850 text-slate-200 font-semibold text-xs rounded-xl hover:bg-slate-850 flex items-center justify-center gap-1.5 hover:scale-[1.02] transition-all"
            >
              Secure Partner Console Login <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto pt-8 border-t border-slate-900/50">
            <div className="p-4 bg-slate-950/20 rounded-xl border border-slate-900">
              <span className="block text-2xl font-bold font-mono text-cyan-400">12,400+</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold block mt-0.5">Active Partners</span>
            </div>
            <div className="p-4 bg-slate-950/20 rounded-xl border border-slate-900">
              <span className="block text-2xl font-bold font-mono text-emerald-400">34.1 Lakh</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold block mt-0.5">Total Paid BDT</span>
            </div>
            <div className="p-4 bg-slate-950/20 rounded-xl border border-slate-900">
              <span className="block text-2xl font-bold font-mono text-purple-400">0.02 Sec</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold block mt-0.5">Instant Settlement</span>
            </div>
            <div className="p-4 bg-slate-950/20 rounded-xl border border-slate-900">
              <span className="block text-2xl font-bold font-mono text-amber-500">100%</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold block mt-0.5">NID Anti-Fraud</span>
            </div>
          </div>
        </div>

        {/* Floating Glowing Mockup Box */}
        <div className="relative mt-20 max-w-5xl mx-auto w-full group">
          <div className="absolute inset-x-0 bottom-0 top-1/4 bg-gradient-to-t from-emerald-500/10 via-purple-600/5 to-transparent blur-[60px] rounded-2xl pointer-events-none" />
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:scale-102 transition duration-700 pointer-events-none" />
          
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 md:p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4 text-left">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
                <span className="text-[10.5px] text-slate-500 font-mono ml-2">JHF_REWARDS_CORE_ENGINE_V2_PREVIEW.SH</span>
              </div>
              <span className="text-[9px] text-slate-500 bg-slate-900 border border-slate-850 px-2 py-0.5 rounded uppercase font-bold tracking-wider">SECURE SHIELDED ENVIRONMENT</span>
            </div>

            {/* Inner Dashboard Glass Representation */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-left font-sans text-xs">
              <div className="md:col-span-4 bg-slate-900/40 border border-slate-850/60 p-4 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Verified Deposit Balance</span>
                  <Wallet className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <span className="text-2xl font-bold font-mono text-slate-100">14,250.00 <span className="text-xs text-emerald-400">BDT</span></span>
                  <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" /> Gold VIP Club Active (3.0x Booster Active)
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-900/60 flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Daily Ad Watches Left</span>
                  <span className="text-emerald-400 font-mono">15 of 20</span>
                </div>
              </div>

              <div className="md:col-span-8 bg-slate-900/40 border border-slate-850/60 p-4 rounded-xl space-y-3 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-900/60 pb-2">
                  <span className="font-semibold text-slate-200">Active Campaign Player</span>
                  <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-550/15 font-mono px-2 py-0.5 rounded font-extrabold uppercase tracking-wide">Ready to Watch</span>
                </div>
                <div className="flex items-center gap-4 bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                  <div className="w-16 h-12 rounded bg-slate-900 flex-shrink-0 flex items-center justify-center border border-slate-800">
                    <Tv className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-200 block">bKash Digital Savings Smart-Watch</span>
                    <span className="text-[10px] text-slate-500 block">Earn rate: 22.50 BDT &bull; Duration: 30s</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <div className="flex items-center gap-1 text-slate-500">
                    <Coins className="w-3.5 h-3.5 text-amber-500" /> High-Reward Campaign Pool
                  </div>
                  <span className="text-slate-400">BDT rewards automatically update on complete timers.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE VALUE BENTO FEATURE CARDS */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-3 mb-16">
          <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest font-extrabold block">CYBERSECURITY ACCELERATED</span>
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-slate-100">Engineered Beyond Traditional Limits</h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">No loopholes, no spoof scripts. Pure architectural security combined with beautiful fluid speed mechanics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-slate-950 border border-slate-900 p-6 rounded-2xl space-y-4 hover:border-slate-800 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-slate-200 font-medium text-base">Anti-Spoof Ad Player</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Equipped with a real-time server active watch ledger. Client timers are checked continuously against server timestamps. Speed bypass and focus cheating hacks are automatically rejected.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-950 border border-slate-900 p-6 rounded-2xl space-y-4 hover:border-slate-800 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-slate-200 font-medium text-base">Automated Neural ID Scanner</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Our camera NID engine takes a high-res crop of the ID card, aligns perspective, and leverages AI model parameters to extract name, date of birth, and index number within 2.5 seconds flat.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-950 border border-slate-900 p-6 rounded-2xl space-y-4 hover:border-slate-800 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="text-slate-200 font-medium text-base">Instant Mobile Payouts</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Cashout straight into bKash, Nagad, or Rocket. Approved withdrawals process instantly through our admin dashboard queuing with cryptographic confirmation.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="bg-slate-950/25 border-y border-slate-900 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-3 mb-16">
            <span className="text-[10px] text-purple-400 font-mono uppercase tracking-widest font-extrabold block">SYSTEM ONBOARDING</span>
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-slate-100">Open Your Secure Earnings Wallet in Minutes</h2>
            <p className="text-xs text-slate-400">Three high-fidelity steps designed to prevent system fraud while keeping registration fast and frictionless.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-emerald-500/10 via-purple-500/10 to-transparent z-0" />
            
            {/* Step 1 */}
            <div className="relative z-10 text-center space-y-4">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-200 font-bold font-mono flex items-center justify-center mx-auto shadow-md">
                1
              </div>
              <h4 className="text-slate-200 font-medium font-sans text-sm">Enter Credentials</h4>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">Input your email and Bangladesh telephone number. Construct a robust compliance password meeting security guidelines.</p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 text-center space-y-4">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-200 font-bold font-mono flex items-center justify-center mx-auto shadow-md">
                2
              </div>
              <h4 className="text-slate-200 font-medium font-sans text-sm">Face ID Biometrics</h4>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">Position your ID card clearly in camera boundaries, do the blink/smile live selfie biometric test, and verify neural OCR fields.</p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 text-center space-y-4">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-200 font-bold font-mono flex items-center justify-center mx-auto shadow-md">
                3
              </div>
              <h4 className="text-slate-200 font-medium font-sans text-sm">Verify OTP Token</h4>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">Confirm receipt of the SMS OTP activation token, enter your secure code, and unlock your premium ad campaign earning boards instantly!</p>
            </div>
          </div>
        </div>
      </section>

      {/* MEMBERSHIP VIP CLUBS COMPILATION BOX */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-3 mb-16">
          <span className="text-[10px] text-amber-500 font-mono uppercase tracking-widest font-extrabold block">EARNINGS MULTIPLIERS</span>
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-slate-100">Upgrade Your Earning Power</h2>
          <p className="text-xs text-slate-400">Join our VIP Clubs to instantly multiply your watch reward cashouts. Choose a tier that fits your pacing.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingTiers.map((tier) => (
            <div 
              key={tier.name}
              className={`p-6 border rounded-2xl transition-all hover:scale-[1.01] flex flex-col justify-between h-[360px] ${tier.color}`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-slate-100 font-sans tracking-tight font-medium text-sm">{tier.name}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    tier.name === 'Gold Club' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/15' :
                    tier.name === 'Silver Club' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-550/15' :
                    tier.name === 'Bronze Club' ? 'bg-amber-600/20 text-amber-500 border border-amber-600/15' :
                    'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}>
                    {tier.multiplier}
                  </span>
                </div>
                <div>
                  <span className="text-2xl font-mono font-bold text-slate-50">{tier.price}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Deposit Verification Required</span>
                </div>
                <div className="space-y-2 pt-2 border-t border-slate-900/60">
                  {tier.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-1.5 text-[10.5px]">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="text-slate-400">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => onEnterApp('register')}
                className={`w-full py-2 bg-slate-950 hover:bg-slate-900 text-[11px] font-sans font-medium text-slate-250 border border-slate-850 rounded-xl transition-colors tracking-wide block text-center mt-3`}
              >
                Launch Account
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* KYC AND FRAUD PREVENTION SHIELD (Enterprise Vetting Highlight) */}
      <section className="bg-slate-950/40 border border-slate-900 max-w-5xl mx-auto rounded-3xl p-8 relative overflow-hidden px-6">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-red-650/5 rounded-full blur-[90px]" />
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10 text-left">
          <div className="md:col-span-4 flex justify-center">
            <div className="w-24 h-24 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400 shadow-lg">
              <ShieldAlert className="w-12 h-12" />
            </div>
          </div>
          <div className="md:col-span-8 space-y-4">
            <span className="text-[10px] text-red-400 font-mono font-extrabold uppercase tracking-wide">SEC AUDIT compliance ledger</span>
            <h3 className="text-xl font-medium tracking-tight text-slate-100">Zero Multi-Account Tolerance</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              To defend our advertising seed merchant networks, we block automated crawlers, emulation device hubs, and users scanning identical National ID coordinates under secondary credentials.
              <b> Attempts to cheat reward parameters or bypass active KYC layers will lead to instant, structural account closure and ban files.</b>
            </p>
            <div className="flex flex-wrap gap-4 text-[10.5px] font-mono text-slate-500 pt-2">
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-red-400" /> One NID One ID</span>
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-red-400" /> Liveness Checks</span>
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-red-400" /> Device IP Logging</span>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-3 mb-16">
          <span className="text-[10px] text-teal-400 font-mono uppercase tracking-widest font-extrabold block">COMMUNITY TRUST REVIEWS</span>
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-slate-100">What Our Earners Genuinely Say</h2>
          <p className="text-xs text-slate-400">Verifiably logged earning feedback from users navigating Dhaka, Chittagong, and Sylhet.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-900 p-6 rounded-2xl space-y-4 hover:border-slate-850/60 transition-all flex flex-col justify-between">
              <p className="text-slate-300 font-sans text-xs italic leading-relaxed">
                "{t.text}"
              </p>
              <div className="pt-4 border-t border-slate-900/60 flex justify-between items-center text-[11px]">
                <div>
                  <span className="font-bold text-slate-200 block">{t.name}</span>
                  <span className="text-slate-500 text-[10px] block">{t.location}, BD</span>
                </div>
                <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 text-[8.5px] px-2 py-0.5 rounded font-extrabold uppercase font-mono">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-3xl mx-auto px-6">
        <div className="text-center space-y-3 mb-12">
          <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest block font-extrabold">FAQ ENGINE</span>
          <h2 className="text-2xl font-medium tracking-tight text-slate-100">Got Queries? We Answer.</h2>
          <p className="text-xs text-slate-400">Answers regarding identity vault validation, payout constraints, and campaign reward calculations.</p>
        </div>

        <div className="space-y-3 text-left">
          {faqItems.map((item, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden transition-all">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-slate-200 text-xs font-semibold hover:bg-slate-900/50 transition-colors focus:outline-none"
                >
                  <span>{item.q}</span>
                  <HelpCircle className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-900/30">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CONTACT SECTION FIELD */}
      <section className="max-w-xl mx-auto px-6">
        <div className="bg-slate-950 border border-slate-900 p-6 rounded-2xl relative shadow-2xl text-left space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <div>
              <h4 className="text-slate-100 text-sm font-semibold">Direct Communication Gateway</h4>
              <p className="text-[10px] text-slate-500">Connecting partners directly to our client liaison managers.</p>
            </div>
          </div>

          {submittedContact ? (
            <div className="py-8 text-center text-emerald-400 flex flex-col items-center justify-center gap-2">
              <Check className="w-8 h-8 rounded-full bg-emerald-500/20 p-1.5" />
              <span className="text-xs font-bold font-sans">Message Dispatched Safely!</span>
              <p className="text-[10.5px] text-slate-500 max-w-xs leading-relaxed">Our client desk will evaluate your query and reach out dynamically to your email coordinates within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Your Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Jahid Hasan"
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Secure Contact Email</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g. jahid@gmail.com"
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Support Details</label>
                <textarea
                  required
                  rows={3}
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  placeholder="Specify details here..."
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-1.5"
              >
                Send Message <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
