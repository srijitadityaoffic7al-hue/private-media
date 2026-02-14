
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../store/chatStore';
import { ICONS } from '../constants';
import { Message } from '../types';

const MessageBubble: React.FC<{ message: Message; isMe: boolean }> = ({ message, isMe }) => {
  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-6 px-4 group animate-in slide-in-from-bottom-2 duration-300`}>
      <div className={`px-5 py-3 rounded-2xl shadow-xl transition-all ${
        isMe ? 'bg-white text-black rounded-tr-none font-medium' : 'bg-slate-900 text-slate-100 rounded-tl-none border border-slate-800'
      }`}>
        <p className="text-sm leading-relaxed">{message.content}</p>
        <div className={`flex items-center space-x-2 mt-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[9px] font-black opacity-40 uppercase tracking-widest">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isMe && <span className={`opacity-40 transition-colors ${message.status === 'sent' ? 'text-blue-500' : ''}`}>{ICONS.Sent}</span>}
        </div>
      </div>
    </div>
  );
};

const ChatWindow: React.FC = () => {
  const { activeChatId, chats, users, currentUser, messages, sendMessage, setView } = useChat();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find(c => c.id === activeChatId);
  const partner = users.find(u => activeChat?.participants.includes(u.id) && u.id !== currentUser?.id);
  const currentMessages = activeChatId ? messages[activeChatId] || [] : [];
  
  const p2pStatus = activeChat?.p2pStatus || 'disconnected';

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [currentMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText('');
    }
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 opacity-20">
        <div className="animate-pulse">{ICONS.MessageTab}</div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] mt-4">Select Communication Node</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
      <div className="px-6 py-4 border-b border-slate-900 bg-slate-950/80 backdrop-blur-xl flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setView('messages')}
            className="md:hidden p-2 -ml-2 text-slate-400"
          >
            {ICONS.Back}
          </button>
          <div className="relative">
            <img src={partner?.avatar} className={`w-10 h-10 rounded-full border border-slate-800 transition-all ${p2pStatus === 'connected' ? 'ring-2 ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : ''}`} alt="avatar" />
            {p2pStatus === 'connected' && (
               <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full border-2 border-slate-950 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
               </div>
            )}
          </div>
          <div className="flex flex-col">
            <h3 className="font-black text-white text-sm tracking-tight leading-none mb-1">{partner?.username}</h3>
            <span className={`text-[9px] font-black uppercase tracking-widest ${
              p2pStatus === 'connected' ? 'text-green-500' : 
              p2pStatus === 'connecting' ? 'text-yellow-500' : 'text-slate-500'
            }`}>
              {p2pStatus === 'connected' ? 'P2P Secure' : p2pStatus === 'connecting' ? 'Dialing...' : 'Encrypted Link'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button className="p-2 text-slate-500 hover:text-white transition-colors">{ICONS.Video}</button>
           <button className="p-2 text-slate-500 hover:text-white transition-colors">{ICONS.More}</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-10 pb-6 custom-scrollbar">
        {currentMessages.length === 0 && (
           <div className="flex flex-col items-center justify-center p-12 text-center opacity-30 grayscale">
              <div className="p-4 bg-slate-900 rounded-full mb-4">{ICONS.Lock}</div>
              <p className="text-[10px] font-black uppercase tracking-widest">Channel Initialized</p>
              <p className="text-[9px] mt-2 max-w-xs leading-relaxed uppercase">End-to-end encryption active. No logs are stored on Zylos servers.</p>
           </div>
        )}
        {currentMessages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isMe={msg.senderId === currentUser?.id} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-6 py-6 bg-slate-950 border-t border-slate-900">
        <form onSubmit={handleSend} className="flex items-end gap-3 bg-slate-900 border border-slate-800 p-2 rounded-2xl focus-within:border-white/20 transition-all">
          <button type="button" className="p-2 text-slate-600 hover:text-blue-500">{ICONS.Plus}</button>
          <textarea
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
            placeholder="Type encrypted signal..."
            className="flex-1 bg-transparent border-none text-white focus:ring-0 resize-none py-2 text-sm font-medium placeholder-slate-700 max-h-32"
          />
          <button 
            type="submit" 
            disabled={!inputText.trim()}
            className={`p-2 rounded-xl transition-all ${inputText.trim() ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-slate-700'}`}
          >
            {ICONS.Send}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
