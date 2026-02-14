
import React, { useState, useEffect, useCallback } from 'react';
import { useChat } from '../store/chatStore';
import { ICONS } from '../constants';

const AuthScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const { login } = useChat();

  const generateCaptcha = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous characters like 0, O, 1, I
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setCaptchaAnswer('');
  }, []);

  const handleStartLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length >= 3) {
      generateCaptcha();
      setIsVerifying(true);
    }
  };

  const handleVerify = () => {
    if (captchaAnswer.toUpperCase() === captchaCode) {
      login(username.trim());
    } else {
      alert("Invalid verification code. Please try again.");
      generateCaptcha();
    }
  };

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 px-6 animate-in fade-in zoom-in duration-300">
        <div className="w-full max-w-md bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800 text-center">
          <div className="mb-6 inline-flex p-4 bg-blue-500/10 text-blue-500 rounded-full">
            {ICONS.Shield}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Human Validation</h2>
          <p className="text-slate-400 mb-8 text-sm">Enter the code below to prove you are a biological entity.</p>
          
          <div className="relative mb-6 group">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 font-black text-3xl tracking-[0.3em] text-blue-400 select-none flex items-center justify-center italic overflow-hidden relative">
              {/* CAPTCHA Visual Noise simulation */}
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:10px_10px]"></div>
              <span className="transform -skew-x-12">{captchaCode}</span>
            </div>
            <button 
              onClick={generateCaptcha}
              className="absolute -top-2 -right-2 bg-slate-800 hover:bg-slate-700 p-2 rounded-full border border-slate-700 text-slate-400 hover:text-white transition-all shadow-lg"
              title="Refresh Code"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
            </button>
          </div>

          <input
            type="text"
            autoFocus
            autoComplete="off"
            value={captchaAnswer}
            onChange={(e) => setCaptchaAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 px-4 mb-6 focus:ring-2 focus:ring-blue-500 outline-none text-center font-bold tracking-widest placeholder-slate-700 uppercase"
            placeholder="Type code here..."
          />
          
          <div className="flex space-x-3">
             <button 
               onClick={() => setIsVerifying(false)} 
               className="flex-1 py-3 text-slate-500 hover:text-white transition-colors font-bold text-xs uppercase tracking-widest"
             >
               Back
             </button>
             <button 
               onClick={handleVerify} 
               className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl shadow-lg transition-all active:scale-95 text-sm uppercase tracking-tighter"
             >
               Verify Matrix
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 px-6">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-pulse"></div>
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800">
        <div className="flex justify-center mb-8">
          <div className="p-5 bg-blue-600 rounded-2xl text-white shadow-2xl shadow-blue-900/40 transform -rotate-6">
            {ICONS.Shield}
          </div>
        </div>
        <h1 className="text-4xl font-black text-center text-white mb-2 tracking-tight italic">ZYLOS</h1>
        <p className="text-slate-500 text-center mb-10 font-medium tracking-[0.1em] uppercase text-[10px]">Global Shadow Network</p>
        
        <form onSubmit={handleStartLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">
              Ghost Identity
            </label>
            <input
              type="text"
              required
              minLength={3}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-700 font-medium"
              placeholder="Enter unique ghost_handle"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-white hover:bg-slate-200 text-black font-black py-4 rounded-2xl transition-all shadow-xl active:scale-95 text-lg uppercase tracking-tighter"
          >
            Access Network
          </button>
        </form>
        
        <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col items-center space-y-4 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
          <div className="flex items-center space-x-4">
             <span className="flex items-center gap-1.5">{ICONS.Lock} AES-256</span>
             <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
             <span className="flex items-center gap-1.5">{ICONS.ViewOnce} Zero-Knowledge</span>
          </div>
          <p className="opacity-50 tracking-widest">No Data Logs • No Identity Links</p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
