
import React from 'react';
import { ChatProvider, useChat } from './store/chatStore';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import SocialFeed from './components/SocialFeed';
import { ICONS } from './constants';

const BottomNav: React.FC = () => {
  const { view, setView } = useChat();
  
  const tabs = [
    { id: 'feed', icon: ICONS.Home, label: 'Feed' },
    { id: 'search', icon: ICONS.Search, label: 'Search' },
    { id: 'messages', icon: ICONS.MessageTab, label: 'Inbox' },
    { id: 'profile', icon: ICONS.User, label: 'Profile' }
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-2xl border-t border-white/[0.03] px-2 py-3 flex justify-around items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setView(tab.id as any)}
          className={`relative flex flex-col items-center p-2 transition-all duration-300 group ${
            view === tab.id ? 'text-white' : 'text-slate-600 hover:text-slate-400'
          }`}
        >
          <div className={`transition-transform duration-300 ${view === tab.id ? 'scale-110 -translate-y-1' : 'group-hover:scale-105'}`}>
            {tab.icon}
          </div>
          <span className={`text-[8px] font-black uppercase mt-1 tracking-widest transition-opacity duration-300 ${view === tab.id ? 'opacity-100' : 'opacity-0'}`}>
            {tab.label}
          </span>
          {view === tab.id && (
            <div className="absolute -top-3 w-8 h-[2px] bg-white rounded-full shadow-[0_0_15px_white] animate-in fade-in zoom-in duration-500"></div>
          )}
        </button>
      ))}
    </div>
  );
};

const MainLayout: React.FC = () => {
  const { currentUser, view, logout } = useChat();

  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden relative selection:bg-blue-500/30">
      {/* Dynamic Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pb-24 md:pb-0">
        {view === 'feed' && <SocialFeed />}
        {view === 'messages' && (
          <div className="flex flex-1 overflow-hidden h-full">
            <Sidebar />
            <div className="hidden md:flex flex-1">
              <ChatWindow />
            </div>
          </div>
        )}
        {view === 'chat_room' && <ChatWindow />}
        {view === 'profile' && (
           <div className="w-full max-w-2xl mx-auto p-12 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="relative mb-8 group">
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <img src={currentUser.avatar} className="relative w-28 h-28 rounded-full border-4 border-slate-900 shadow-2xl" alt="me" />
                <div className="absolute bottom-1 right-1 bg-blue-600 p-1 rounded-full border-4 border-slate-950">
                  {ICONS.Shield}
                </div>
              </div>
              
              <h1 className="text-4xl font-black italic tracking-tighter mb-1 uppercase">{currentUser.username}</h1>
              <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Protocol Online
              </p>
              
              <div className="flex gap-12 mt-12 bg-slate-900/40 p-6 rounded-3xl border border-white/[0.03] backdrop-blur-md">
                 <div className="text-center group cursor-pointer">
                    <p className="text-2xl font-black group-hover:text-blue-400 transition-colors">0</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Shadows</p>
                 </div>
                 <div className="w-[1px] bg-slate-800"></div>
                 <div className="text-center group cursor-pointer">
                    <p className="text-2xl font-black group-hover:text-blue-400 transition-colors">0</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Echoes</p>
                 </div>
              </div>
              
              <div className="w-full max-w-sm mt-12 space-y-3">
                <button className="w-full py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 shadow-xl">
                  Modify Ghost Identity
                </button>
                <button 
                  onClick={logout}
                  className="w-full py-4 rounded-2xl border border-red-500/20 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-500/10 transition-all active:scale-95"
                >
                  Terminate Session
                </button>
              </div>
           </div>
        )}
        {view === 'search' && (
           <div className="p-8 text-center opacity-30 mt-20">
              <div className="mb-6 flex justify-center">{ICONS.Search}</div>
              <p className="text-xs font-black uppercase tracking-[0.5em]">Scanning Grid...</p>
           </div>
        )}
      </div>

      {/* Cloudflare/Security Status HUD */}
      <div className="fixed top-4 right-4 z-[100] hidden sm:flex items-center gap-2">
         <div className="bg-slate-900/90 border border-white/10 px-4 py-2 rounded-full flex items-center gap-3 text-[9px] font-black text-slate-400 shadow-2xl backdrop-blur-xl">
            <span className="flex items-center gap-1.5 uppercase tracking-tighter">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Secure Edge
            </span>
            <div className="w-[1px] h-3 bg-slate-800"></div>
            <span className="uppercase tracking-tighter opacity-50">v3.0.1-STABLE</span>
         </div>
      </div>

      <BottomNav />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ChatProvider>
      <MainLayout />
    </ChatProvider>
  );
};

export default App;
