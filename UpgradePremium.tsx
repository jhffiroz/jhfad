import React, { useState } from 'react';
import { Sparkles, Check, Wallet, CircleDollarSign, ArrowRight, ShieldCheck, X, Copy, QrCode, Smartphone } from 'lucide-react';
import { MembershipTier } from './types';

interface UpgradePremiumProps {
  currentTier: MembershipTier;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpgradePremium({ currentTier, onClose, onSuccess }: UpgradePremiumProps) {
  const [selectedTier, setSelectedTier] = useState<Exclude<MembershipTier, 'regular'>>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'bank_qr'>('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedRefText, setCopiedRefText] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generate a persistent, random, unique checkout reference ID for this payment session
  const [paymentReference] = useState(() => {
    const r = Math.floor(100000 + Math.random() * 900000);
    return `PAY_REF_${r}`;
  });

  const pricingMap: Record<Exclude<MembershipTier, 'regular'>, { price: number; limit: number; features: string[] }> = {
    standard: {
      price: 500,
      limit: 30,
      features: [
        "Earn up to 30 advertisements daily",
        "Higher direct tier multipliers",
        "Standard payout channels optimized",
        "Digital badge insignia status"
      ]
    },
    premium: {
      price: 1000,
      limit: 50,
      features: [
        "Earn up to 50 advertisements daily",
        "1.5x Multiplier earnings per ad watched",
        "Priority payout dispatch within 6 hours",
        "Direct email ticket registrar priority",
        "Biometric fraud protection exceptions"
      ]
    },
    elite: {
      price: 2000,
      limit: 100,
      features: [
        "Earn up to 100 advertisements daily",
        "2x Maximum multiplier payouts",
        "Instant merchant automatic payout approval",
        "Exclusive VIP account management desk",
        "Zero fee withdraw transactions optimization"
      ]
    }
  };

  // Simulating typical Bangladeshi merchant agency numbers
  const merchantNumbers = {
    bkash: "01783-492837 (Merchant Pay)",
    nagad: "01948-294711 (Merchant Pay)",
    rocket: "01822-224483 (B2B Pay)"
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleSubmitUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim() || transactionId.trim().length < 8) {
      setErrorMessage("Enter a valid original mobile merchant transaction ID code (minimum 8 characters).");
      return;
    }

    setErrorMessage(null);
    setSubmitting(true);

    try {
      const token = localStorage.getItem('ad_auth_token');
      const res = await fetch('/api/memberships/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tier: selectedTier,
          paymentMethod,
          transactionId: transactionId.trim(),
          amount: pricingMap[selectedTier].price,
          paymentReference
        })
      });
      const data = await res.json();

      if (res.ok) {
        onSuccess();
      } else {
        setErrorMessage(data.error || "Verification issue encountered.");
      }
    } catch (err) {
      setErrorMessage("Network issue. Upgrade request could not sync with platform records.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl relative my-8">
        
        {/* CLOSE BUTTON */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 md:p-8 space-y-6">
          
          <div className="text-center">
            <div className="bg-emerald-500/10 w-fit px-3 py-1 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider rounded-full mx-auto mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Unleash Premium Benefits
            </div>
            <h3 className="text-slate-100 font-sans font-medium text-lg md:text-xl">Elevate Your Account Tier Membership</h3>
            <p className="text-slate-400 text-xs mt-1">Select your preferred campaign coverage tier to multiply daily reward thresholds.</p>
          </div>

          {/* GRID TIER TILES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['standard', 'premium', 'elite'] as const).map((tier) => {
              const details = pricingMap[tier];
              const isSelected = selectedTier === tier;
              const isCurrent = currentTier === tier;

              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedTier(tier)}
                  className={`border text-left p-4 rounded-xl flex flex-col justify-between transition-all relative ${
                    isCurrent 
                      ? 'border-slate-800 bg-slate-950/40 opacity-70 cursor-default' 
                      : isSelected 
                        ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/5' 
                        : 'border-slate-800 bg-slate-950/80 hover:border-slate-755 hover:bg-slate-950'
                  }`}
                  disabled={isCurrent}
                >
                  {isCurrent && (
                    <span className="absolute -top-2 right-2 bg-slate-800 text-slate-300 text-[8px] font-bold px-1.5 rounded border border-slate-700 uppercase">
                      Current
                    </span>
                  )}

                  <div className="space-y-1 w-full">
                    <span className={`text-[9px] uppercase font-bold tracking-widest font-mono ${
                      tier === 'elite' ? 'text-purple-400' : tier === 'premium' ? 'text-teal-400' : 'text-blue-400'
                    }`}>{tier}</span>
                    
                    <div className="flex items-baseline gap-1 pt-1">
                      <span className="text-2xl font-bold font-sans text-slate-100">{details.price}</span>
                      <span className="text-[10px] text-slate-500 font-bold">BDT</span>
                    </div>

                    <span className="text-[10px] text-slate-400 block pt-1.5">{details.limit} Ads / day</span>
                  </div>

                  <div className="border-t border-slate-850 pt-3 mt-4 w-full">
                    <ul className="text-[10px] text-slate-400 space-y-1.5 list-none">
                      {details.features.slice(0, 3).map((feat, i) => (
                        <li key={i} className="flex items-start gap-1 line-clamp-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmitUpgrade} className="space-y-5 pt-5 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-slate-200">Merchant Payment Gateways</h4>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-950/40 border border-emerald-900/35 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3 h-3" /> Secure Bangla QR Standards
              </span>
            </div>

            {/* PAYMENT LOGO SELECTOR (MFS + Bank QR) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'bkash', label: 'bKash Pay', desc: 'MFS Wallet', color: 'text-pink-400', border: 'hover:border-pink-500/40' },
                { id: 'nagad', label: 'Nagad Pay', desc: 'MFS Wallet', color: 'text-orange-400', border: 'hover:border-orange-500/40' },
                { id: 'rocket', label: 'Rocket Pay', desc: 'MFS Wallet', color: 'text-indigo-400', border: 'hover:border-indigo-500/40' },
                { id: 'bank_qr', label: 'Banking QR', desc: 'Bangla QR App', color: 'text-teal-400', border: 'hover:border-teal-500/40' }
              ].map((method) => {
                const active = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(method.id as any);
                      setErrorMessage(null);
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      active 
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/5' 
                        : `border-slate-800 bg-slate-950/60 ${method.border} hover:bg-slate-900/50`
                    }`}
                  >
                    {method.id === 'bank_qr' ? (
                      <QrCode className="w-4 h-4 text-teal-400 mb-0.5" />
                    ) : (
                      <Smartphone className={`w-4 h-4 ${method.color} mb-0.5`} />
                    )}
                    <span className={`text-[11px] font-sans font-bold capitalize tracking-wider ${method.color}`}>{method.label}</span>
                    <span className="text-[8px] text-slate-500 uppercase font-bold text-center">{method.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* UPGRADE DETAILS & LARGE MERCHANT QR CODE INTERACTIVE PREVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-slate-950 border border-slate-850 p-5 rounded-2xl">
              
              {/* Left Column: Merchant QR Visualizer */}
              <div className="md:col-span-5 flex flex-col items-center justify-center text-center space-y-3 border-b md:border-b-0 md:border-r border-slate-850 pb-5 md:pb-0 md:pr-5">
                <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-500">Scan QR Code To Pay</span>
                
                {/* QR Container Frame with simulated laser scanner */}
                <div className="relative w-44 h-44 bg-white p-3.5 rounded-xl shadow-2xl flex items-center justify-center overflow-hidden group">
                  <img 
                    src="https://blogger.googleusercontent.com/img/a/AVvXsEilNe2rlDC7nm2yIfHfbCwTI0NPsptHf5qFhqsF8D5NNaCmB_t-WZoHPCK74TuXF33c_YUHaJGMcIeLz-ZDl282oDFgliYaCFr6a6syTMEHf5LVf5NspnUrzF8t-qc9kBo_9tG6zWEPDX_w3qXUpfI-CXS_INTLOL7YFjWD0BTKJvvkuN7rz16Rkn8uLVI=s250" 
                    alt="Bangla QR Merchant Code" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain select-none"
                  />
                  {/* Holographic glowing scan line running infinitely */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_10px_2px_#10b981] animate-[bounce_3s_infinite]" />
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 capitalize font-medium">{paymentMethod === 'bank_qr' ? 'Bangla QR Standard' : `${paymentMethod} Merchant Wallet`}</span>
                  <p className="text-emerald-400 font-mono font-bold text-sm tracking-tight">{pricingMap[selectedTier].price}.00 BDT</p>
                </div>
              </div>

              {/* Right Column: Dynamic Guidelines and Instructions */}
              <div className="md:col-span-7 space-y-3.5 text-left text-xs text-slate-400 flex flex-col justify-center">
                
                {/* Secure reference generation section */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-550 block">1. Set Transaction Invoice Reference</span>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    You MUST attach this unique reference code when sending money or scanning QR so we can identify your deposit:
                  </p>
                  
                  <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                    <div className="space-y-0.5">
                      <span className="text-[8px] uppercase font-bold text-slate-500 font-mono">Reference/Ref Field Input</span>
                      <span className="text-xs font-mono font-extrabold text-emerald-400 tracking-wider block">{paymentReference}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(paymentReference);
                        setCopiedRefText(true);
                        setTimeout(() => setCopiedRefText(false), 2000);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-lg transition-colors flex items-center gap-1 font-sans text-[10px] font-bold border border-slate-700 select-none cursor-pointer"
                    >
                      <Copy className="w-3 h-3" /> {copiedRefText ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Account details or dynamic numbers depending on selected gateway */}
                <div className="space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-900/80 leading-normal">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-550 block">2. Scanner Guidelines</span>
                  
                  {paymentMethod === 'bank_qr' ? (
                    <p className="text-[11px] text-slate-350">
                      Open City Bank, Prime Bank, MTB, NexusPay, or any Bangladeshi bank app. Scan the Merchant QR on the left. Pay exactly <strong className="text-slate-100 font-bold">{pricingMap[selectedTier].price} BDT</strong>. Include reference <strong className="text-emerald-400 font-mono font-bold">{paymentReference}</strong>, then input transaction ID code below.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      <p className="text-[11px] text-slate-350">
                        Scan the QR image via your <strong className="text-slate-200 capitalize font-bold">{paymentMethod}</strong> mobile app or proceed with standard Merchant Send Money:
                      </p>
                      
                      <div className="flex items-center justify-between bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-900">
                        <span className="text-[10px] font-mono text-slate-400">
                          {paymentMethod === 'bkash' ? '01783-492837 (Merchant Pay)' : 
                           paymentMethod === 'nagad' ? '01948-294711 (Merchant Pay)' : 
                           '01822-224483 (B2B Pay)'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const num = paymentMethod === 'bkash' ? '01783492837' : paymentMethod === 'nagad' ? '01948294711' : '01822224483';
                            handleCopy(num);
                          }}
                          className="text-slate-500 hover:text-slate-300 p-0.5 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {copiedText && (
                        <span className="text-[9px] text-emerald-400 block text-right">Merchant number copied!</span>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* TRANSACTION ID INPUT (financial protection validation matching) */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">3. Input Mobile or Bank Transaction ID (TxID)</label>
              <input
                type="text"
                placeholder="e.g. TR_91A2B3C4DE, BP9372B1029"
                required
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-200 font-mono text-sm focus:outline-none focus:border-emerald-500 block"
              />
              <span className="text-[9.5px] text-slate-500 block">We double check every submitted transaction ID directly against banking registries. Submitting fraudulent transaction IDs will result in permanent suspension of account operations.</span>
            </div>

            {errorMessage && (
              <div className="text-xs text-red-400 bg-red-950/20 p-2.5 rounded-lg border border-red-500/15">
                {errorMessage}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-850 text-slate-400 hover:text-slate-200 text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                disabled={submitting}
              >
                Back To Dashboard
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-500 text-slate-900 hover:bg-emerald-600 font-bold text-xs rounded-xl transition-all shadow-lg flex items-center gap-1.5 cursor-pointer"
                disabled={submitting}
              >
                {submitting ? 'Authenticating payment...' : `Submit Payment Request (+${selectedTier.toUpperCase()})`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
