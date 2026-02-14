
import React, { useState, useEffect } from 'react';
import { ChatProvider, useChat } from './store/chatStore';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import SocialFeed from './components/SocialFeed';
import { ICONS } from './constants';

const BottomNav: React.FC = () => {
  const { view, setView } = useChat();
  
  const tabs = [
    { id: 'feed', icon: ICONS.Home },
    { id: 'search', icon: ICONS.Search },
    { id: 'messages', icon: ICONS.MessageTab },
    { id: 'profile', icon: ICONS.User }
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-slate-900 px-6 py-4 flex justify-around items-center z-50">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setView(tab.id as any)}
          className={`p-2 transition-all duration-300 transform ${view === tab.id ? 'text-white scale-110' : 'text-slate-600 hover:text-slate-400'}`}
        >
          {tab.icon}
          {view === tab.id && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>}
        </button>
      ))}
    </div>
  );
};

const MainLayout: React.FC = () => {
  const { currentUser, view, activeChatId } = useChat();

  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* Dynamic Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pb-20 md:pb-0">
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
           <div className="w-full max-w-2xl mx-auto p-8 flex flex-col items-center">
              <img src={currentUser.avatar} className="w-24 h-24 rounded-full border-4 border-slate-800 mb-6" alt="me" />
              <h1 className="text-3xl font-black italic">{currentUser.username}</h1>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">Verified Shadow Ghost</p>
              
              <div className="flex gap-10 mt-10">
                 <div className="text-center">
                    <p className="text-xl font-black">0</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Followers</p>
                 </div>
                 <div className="text-center">
                    <p className="text-xl font-black">0</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Following</p>
                 </div>
              </div>
              
              <button className="mt-10 w-full max-w-xs py-3 rounded-xl border border-slate-800 font-bold text-sm hover:bg-slate-900 transition-all">Edit Identity</button>
           </div>
        )}
      </div>

      {/* Global Bot Protection Simulation Overlay (Cloudflare Turnstile UX) */}
      <div className="fixed top-4 right-4 z-[100] pointer-events-none">
         <div className="bg-slate-900/80 border border-slate-800 px-3 py-2 rounded-lg flex items-center gap-3 text-[10px] font-bold text-slate-500 shadow-2xl backdrop-blur-md">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Cloudflare Protected</span>
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
