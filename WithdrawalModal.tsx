import React, { useState } from 'react';
import { Wallet, Landmark, CheckCircle, ShieldAlert, ArrowRight, ShieldCheck, X } from 'lucide-react';

interface WithdrawalModalProps {
  availableBalance: number;
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
}

export default function WithdrawalModal({ availableBalance, onClose, onSuccess }: WithdrawalModalProps) {
  const [method, setMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'bank'>('bkash');
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  
  // Bank fields
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numeralAmt = Number(amount);
    
    if (numeralAmt < 500) {
      setErrorMsg("Minimum withdrawal allowance is BDT 500.");
      return;
    }

    if (numeralAmt > availableBalance) {
      setErrorMsg("Insufficient wallet balance available.");
      return;
    }

    if (!accountNumber) {
      setErrorMsg("Account details required.");
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);

    try {
      const token = localStorage.getItem('ad_auth_token');
      const res = await fetch('/api/withdrawals/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          method,
          amount: numeralAmt,
          accountNumber,
          bankName: method === 'bank' ? bankName : undefined,
          branchName: method === 'bank' ? branchName : undefined
        })
      });
      const data = await res.json();

      if (res.ok) {
        onSuccess(data.remainingBalance);
      } else {
        setErrorMsg(data.error || "Compliance block triggered for request.");
      }
    } catch (err) {
      setErrorMsg("Timeout connecting to payout API.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 md:p-8 space-y-6">
          <div className="text-center">
            <div className="bg-blue-500/15 text-blue-400 px-3 py-1 border border-blue-500/10 text-[9px] font-bold uppercase tracking-wider rounded-full w-fit mx-auto mb-2 flex items-center gap-1">
              <Landmark className="w-3 h-3" /> Encrypted Payout Gateway
            </div>
            <h3 className="text-slate-100 font-sans font-medium text-lg">Withdraw Earnings</h3>
            <p className="text-slate-400 text-xs mt-1">Convert earned ad points back to your mobile bank account.</p>
          </div>

          <div className="bg-slate-950 p-4 border border-slate-850/60 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Withdrawable Balance</span>
              <span className="text-lg font-bold font-sans text-slate-200 block pt-0.5">{availableBalance.toFixed(2)} BDT</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 px-2.5 py-1 text-[10px] text-slate-400 font-sans rounded">
              Min: 500 BDT
            </div>
          </div>

          <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
            {/* METHOD SELECTOR */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-550 uppercase tracking-widest font-bold block">payout transfer method</label>
              <div className="grid grid-cols-4 gap-2">
                {(['bkash', 'nagad', 'rocket', 'bank'] as const).map((meth) => {
                  const active = method === meth;
                  return (
                    <button
                      key={meth}
                      type="button"
                      onClick={() => {
                        setMethod(meth);
                        setAccountNumber('');
                      }}
                      className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-1 capitalize transition-all ${
                        active 
                          ? 'border-emerald-500 bg-emerald-500/5' 
                          : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900'
                      }`}
                    >
                      <span className="text-[10px] text-slate-200 font-sans font-bold">{meth}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AMOUNT */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-550 uppercase tracking-widest font-bold block">withdraw value BDT</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Minimum value 500"
                  required
                  min="500"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-4 pr-12 py-2.5 text-slate-200 font-sans text-sm focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-4 top-3 text-[10px] text-slate-500 uppercase font-bold text-center">BDT</span>
              </div>
            </div>

            {/* BANK ACCOUNT EXTRA INPUT DETAILS */}
            {method === 'bank' ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Bank Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dutch Bangla Bank Ltd"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Branch Location</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kawran Bazar branch"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Bank Routing Nu / Account</label>
                    <input
                      type="text"
                      required
                      placeholder="Account digit keys"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-200 font-mono text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-505 uppercase tracking-widest font-bold block">Recipient mobile number</label>
                <input
                  type="tel"
                  placeholder="e.g. 01711223344"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-200 font-sans text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {errorMsg && (
              <div className="text-xs text-red-400 bg-red-950/20 p-2.5 rounded-lg border border-red-500/15 text-center">
                {errorMsg}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-850 text-slate-400 hover:text-slate-200 text-xs rounded-xl hover:bg-slate-800 transition-colors"
                disabled={submitting}
              >
                Back To Dashboard
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-500 text-slate-900 hover:bg-emerald-600 font-bold text-xs rounded-xl transition-all shadow-lg flex items-center gap-1.5"
                disabled={submitting}
              >
                {submitting ? 'Confirming authorization...' : 'Initiate Withdrawal Payout'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
