
import React, { useState } from 'react';
import { useChat } from '../store/chatStore';
import { ICONS } from '../constants';
import { Chat, User } from '../types';

const Sidebar: React.FC = () => {
  const { currentUser, chats, users, activeChatId, setActiveChat, createChat, setView, messages } = useChat();
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(u => 
    u.id !== currentUser?.id && 
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleUserClick = (userId: string) => {
    const chatId = createChat([userId]);
    setActiveChat(chatId);
    if (window.innerWidth < 768) {
      setView('chat_room');
    }
  };

  return (
    <div className="w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col bg-slate-950 border-r border-slate-900">
      <div className="p-6 border-b border-slate-900">
        <h2 className="text-xl font-black tracking-tighter italic flex items-center gap-2">
          {ICONS.MessageTab} INBOX
        </h2>
      </div>

      <div className="px-4 py-4">
        <div className="relative group">
          <span className="absolute left-4 top-3 text-slate-700 group-focus-within:text-blue-500 transition-colors">{ICONS.Search}</span>
          <input
            type="text"
            placeholder="Search ghosts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pl-12 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-700 font-bold"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {chats.length === 0 && search.length === 0 ? (
          <div className="p-10 text-center opacity-20">
            <p className="text-[10px] font-black uppercase tracking-widest">No Signals Detected</p>
          </div>
        ) : search.length > 0 ? (
           <div className="space-y-1">
              {filteredUsers.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleUserClick(u.id)}
                  className="w-full px-6 py-4 flex items-center space-x-4 hover:bg-slate-900 transition-colors"
                >
                  <img src={u.avatar} className="w-10 h-10 rounded-xl border border-slate-800" alt="avatar" />
                  <div className="text-left">
                    <p className="text-white font-bold text-sm">{u.username}</p>
                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-tighter">Verified Human</p>
                  </div>
                </button>
              ))}
           </div>
        ) : (
          <div className="space-y-1">
            {chats.map(chat => {
              const partner = users.find(u => chat.participants.includes(u.id) && u.id !== currentUser?.id);
              const lastMsgs = messages[chat.id] || [];
              const lastMsg = lastMsgs[lastMsgs.length - 1];
              const isActive = activeChatId === chat.id;
              
              return (
                <button
                  key={chat.id}
                  onClick={() => { setActiveChat(chat.id); if(window.innerWidth < 768) setView('chat_room'); }}
                  className={`w-full px-6 py-5 flex items-center space-x-4 transition-all relative ${isActive ? 'bg-slate-900' : 'hover:bg-slate-900/50'}`}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_white]"></div>}
                  <img src={partner?.avatar} className="w-12 h-12 rounded-2xl border border-slate-800 flex-shrink-0" alt="avatar" />
                  <div className="flex-1 text-left overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-sm text-white truncate">{partner?.username}</p>
                      {lastMsg && <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">Now</span>}
                    </div>
                    <p className="text-[11px] text-slate-600 truncate font-medium">
                      {lastMsg ? lastMsg.content : 'Ghost link established.'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
