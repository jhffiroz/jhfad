import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, CheckCircle, ShieldAlert, Award, Clock, ArrowRight, X } from 'lucide-react';
import { Ad } from './types';

interface AdPlayerProps {
  ad: Ad;
  onRewardClaimed: (rewardAmount: number) => void;
  onClose: () => void;
}

export default function AdPlayer({ ad, onRewardClaimed, onClose }: AdPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ad.duration);
  const [watchSessionId, setWatchSessionId] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('Initialize Secure Stream...');
  const [questionsAnswered, setQuestionsAnswered] = useState<boolean | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Simple safety verification question for interactive ads to block bots
  const securityQuiz = {
    question: `What was advertised above?`,
    options: [ad.title, `Fresh Fruit Drinks`, `A Foreign Holiday Tour`],
    correctIndex: 0
  };

  useEffect(() => {
    // 1. Initialize ad session in backend when starting
    const startAdSession = async () => {
      try {
        const token = localStorage.getItem('ad_auth_token');
        const res = await fetch('/api/ads/start-watch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ adId: ad.id })
        });
        const data = await res.json();
        
        if (res.ok && data.watchSessionId) {
          setWatchSessionId(data.watchSessionId);
          setIsPlaying(true);
          setStatusText('Streaming verified contents from merchant server...');
        } else {
          setErrorMsg(data.error || 'Failed to initialize safe ad channel.');
        }
      } catch (err) {
        setErrorMsg('Connection offline. Compliance system refused.');
      }
    };

    startAdSession();
  }, [ad]);

  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFinished(true);
          setIsPlaying(false);
          setStatusText('Authentication handshake ready.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  const claimReward = async () => {
    if (ad.adType === 'interactive' && !questionsAnswered) {
      if (selectedAnswer !== ad.title) {
        setErrorMsg("Incorrect verification. Watch and answer correctly to claim.");
        return;
      }
      setQuestionsAnswered(true);
      setErrorMsg(null);
    }

    setClaiming(true);
    setErrorMsg(null);

    try {
      const token = localStorage.getItem('ad_auth_token');
      const res = await fetch('/api/ads/claim-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ watchSessionId })
      });
      const data = await res.json();

      if (res.ok) {
        onRewardClaimed(ad.rewardAmount);
      } else {
        setErrorMsg(data.error || 'Bypass detected. Claim denied.');
      }
    } catch (err) {
      setErrorMsg('Failed to process claim. Security timeout.');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center p-4 z-50 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl relative">
        
        {/* UPPER STATUS STRIP */}
        <div className="bg-slate-950 px-4 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Campaign Direct Stream: {ad.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-xs text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeLeft}s remaining</span>
            </div>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-200 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CONTAINER VIEWPORT FOR REWARDS */}
        <div className="relative aspect-video bg-black flex flex-col justify-center items-center overflow-hidden border-b border-slate-800">
          <img
            src={ad.mediaUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"}
            alt={ad.title}
            className={`w-full h-full object-cover transition-opacity duration-500 ${isPlaying ? 'opacity-80' : 'opacity-40'}`}
            referrerPolicy="no-referrer"
          />

          {!isPlaying && !isFinished && !errorMsg && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-6 text-center">
              <span className="text-xs text-slate-400 mb-1">Authorization required...</span>
              <h3 className="text-slate-100 font-medium font-sans text-sm">{statusText}</h3>
            </div>
          )}

          {isPlaying && (
            <div className="absolute inset-x-2 bottom-2 bg-slate-900/90 text-[11px] text-emerald-400 p-2 rounded border border-emerald-500/20 shadow flex items-center justify-between backdrop-blur">
              <span className="font-mono flex items-center gap-1"><Clock className="w-3.5 h-3.5 animate-spin" /> Stream secure: Compliance timer active.</span>
              <span className="font-bold text-slate-200">{timeLeft}s</span>
            </div>
          )}

          {/* SIMULATED SPONTANEOUS ANNOUNCEMENT OVERLAYS OR AD CAPTIONS */}
          <div className="absolute inset-x-4 top-4 pointer-events-none text-left">
            <span className="bg-slate-950/80 px-2.5 py-1 text-[11px] text-slate-100 font-sans tracking-wide rounded border border-slate-850 shadow uppercase">
              {ad.title}
            </span>
          </div>
        </div>

        {/* BODY WORKSPACE DETAILS */}
        <div className="p-5">
          <div className="mb-4">
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">{ad.adType} Ads</span>
            <h4 className="text-slate-100 font-medium text-base mt-2">{ad.title}</h4>
            <p className="text-slate-400 text-xs mt-1">Watch for exactly 30 seconds to authenticate proof of completion. Rewarding <span className="text-emerald-400 font-sans font-bold">{ad.rewardAmount.toFixed(2)} BDT</span> directly into your point reserve wallet.</p>
          </div>

          {errorMsg && (
            <div className="bg-red-950/50 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-start gap-2 text-xs mb-4">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Compliance Warning</span>
                {errorMsg}
              </div>
            </div>
          )}

          {/* INTERACTIVE QUESTION/VERIFICATION FOR ANTI-BOT */}
          {isFinished && ad.adType === 'interactive' && !questionsAnswered && (
            <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl mb-4 text-xs">
              <p className="text-slate-300 font-medium mb-2 flex items-center gap-1">
                <ShieldAlert className="w-4 h-4 text-amber-500" /> Human Verification Required:
              </p>
              <p className="text-slate-400 mb-3">{securityQuiz.question}</p>
              <div className="space-y-2">
                {securityQuiz.options.map((opt, i) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedAnswer(opt)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                      selectedAnswer === opt 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ACTIVE CLAIMING ACTIONS */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-5">
            <span className="text-xs text-slate-500 font-mono">ID: {ad.id}</span>
            {isFinished ? (
              <button
                onClick={claimReward}
                disabled={claiming}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg flex items-center gap-1.5"
              >
                {claiming ? (
                  <>Claiming...</>
                ) : (
                  <>
                    <Award className="w-4 h-4" /> Claim {ad.rewardAmount.toFixed(2)} BDT
                  </>
                )}
              </button>
            ) : (
              <button
                disabled
                className="px-4 py-2 bg-slate-800 text-slate-500 text-xs rounded-xl cursor-not-allowed flex items-center gap-1"
              >
                Watch ad countdown...
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
