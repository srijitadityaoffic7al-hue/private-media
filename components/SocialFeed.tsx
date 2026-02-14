
import React, { useState, useEffect } from 'react';
import { useChat } from '../store/chatStore';
import { ICONS } from '../constants';
import { Post } from '../types';
import { getSmartReply } from '../services/geminiService';

const ThreadItem: React.FC<{ post: Post }> = ({ post }) => {
  const { users, currentUser, likePost, followUser } = useChat();
  const author = users.find(u => u.id === post.authorId);
  const isLiked = currentUser && post.likes.includes(currentUser.id);
  const isAuthorMe = currentUser?.id === post.authorId;

  return (
    <div className="p-4 border-b border-slate-900/50 flex space-x-3 hover:bg-white/[0.02] transition-colors group animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col items-center">
        <div className="relative">
          <img 
            src={author?.avatar} 
            className="w-10 h-10 rounded-full border border-slate-800 object-cover" 
            alt="avatar" 
          />
          {author?.status === 'online' && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-slate-950 rounded-full"></div>
          )}
        </div>
        <div className="w-[1.5px] flex-1 bg-slate-800/50 my-2 rounded-full group-last:hidden"></div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center space-x-1.5 min-w-0">
            <span className="font-bold text-white text-[14px] hover:underline cursor-pointer truncate">{author?.username || 'Unknown Ghost'}</span>
            {author?.isVerified !== false && <span className="text-blue-500 flex-shrink-0">{ICONS.Shield}</span>}
            <span className="text-slate-600 text-xs whitespace-nowrap">· {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          {!isAuthorMe && (
            <button 
              onClick={() => author && followUser(author.id)}
              className="text-[11px] font-black uppercase tracking-tighter text-blue-500 hover:text-blue-400 transition-colors"
            >
              Follow
            </button>
          )}
        </div>
        <p className="text-slate-200 text-[14px] leading-relaxed mb-3 whitespace-pre-wrap selection:bg-blue-500/30">
          {post.content}
        </p>
        
        <div className="flex items-center space-x-8 text-slate-500">
          <button 
            onClick={() => likePost(post.id)}
            className={`flex items-center space-x-2 transition-all active:scale-150 ${isLiked ? 'text-red-500' : 'hover:text-red-400'}`}
          >
            <span className={isLiked ? 'fill-current' : ''}>{ICONS.Heart}</span>
            {post.likes.length > 0 && <span className="text-xs font-bold tabular-nums">{post.likes.length}</span>}
          </button>
          <button className="flex items-center space-x-2 hover:text-blue-400 transition-colors">
            {ICONS.Comment}
            <span className="text-xs font-bold">0</span>
          </button>
          <button className="flex items-center space-x-2 hover:text-green-400 transition-colors">
            {ICONS.Repeat}
          </button>
          <button className="flex items-center space-x-2 hover:text-white transition-colors">
            {ICONS.Send}
          </button>
        </div>
      </div>
    </div>
  );
};

const SocialFeed: React.FC = () => {
  const { posts, currentUser, createPost, isLoading } = useChat();
  const [newPostContent, setNewPostContent] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPostContent.trim()) {
      createPost(newPostContent);
      setNewPostContent('');
    }
  };

  const simulateRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1200);
  };

  return (
    <div className="w-full max-w-2xl mx-auto min-h-screen bg-slate-950/50 backdrop-blur-3xl border-x border-slate-900 shadow-2xl relative">
      {/* Header */}
      <div 
        className="sticky top-0 bg-slate-950/80 backdrop-blur-xl z-30 p-4 border-b border-slate-900 flex justify-between items-center cursor-pointer"
        onClick={simulateRefresh}
      >
        <div className="w-8"></div>
        <h2 className="text-xl font-black tracking-tighter italic select-none">ZYLOS</h2>
        <div className="w-8 flex justify-end">
           {isRefreshing && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
        </div>
      </div>

      {/* Composer */}
      <div className="p-4 border-b border-slate-900 animate-in slide-in-from-top-2 duration-700">
        <div className="flex space-x-3">
          <img src={currentUser?.avatar} className="w-10 h-10 rounded-full border border-slate-800 shadow-lg" alt="me" />
          <form onSubmit={handlePost} className="flex-1">
            <textarea
              placeholder="What's happening in the shadows?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="w-full bg-transparent text-white border-none focus:ring-0 resize-none text-[15px] placeholder-slate-700 min-h-[40px] mt-1 scrollbar-hide"
            />
            <div className="flex justify-between items-center mt-3">
              <div className="flex space-x-5 text-slate-600">
                <button type="button" className="hover:text-blue-500 transition-all hover:scale-110">{ICONS.Image}</button>
                <button type="button" className="hover:text-blue-500 transition-all hover:scale-110">{ICONS.Camera}</button>
                <button type="button" className="hover:text-blue-500 transition-all hover:scale-110">{ICONS.Mic}</button>
                <button type="button" className="hover:text-blue-500 transition-all hover:scale-110">{ICONS.Plus}</button>
              </div>
              <button 
                type="submit"
                disabled={!newPostContent.trim()}
                className={`px-5 py-1.5 rounded-full font-black text-[12px] uppercase tracking-wider transition-all transform active:scale-95 ${
                  newPostContent.trim() 
                    ? 'bg-white text-black hover:bg-slate-200 shadow-lg' 
                    : 'bg-slate-900 text-slate-700 cursor-not-allowed opacity-50'
                }`}
              >
                Post
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Feed */}
      <div className="pb-32">
        {isLoading ? (
          <div className="space-y-4 p-4">
             {[1,2,3,4].map(i => (
               <div key={i} className="animate-pulse flex space-x-3">
                 <div className="rounded-full bg-slate-900 h-10 w-10"></div>
                 <div className="flex-1 space-y-3 py-1">
                   <div className="h-2 bg-slate-900 rounded w-1/4"></div>
                   <div className="h-2 bg-slate-900 rounded w-3/4"></div>
                 </div>
               </div>
             ))}
          </div>
        ) : (
          <>
            {posts.map(post => (
              <ThreadItem key={post.id} post={post} />
            ))}
            {posts.length === 0 && (
              <div className="p-24 text-center">
                <div className="text-slate-800 mb-4 inline-block animate-bounce">{ICONS.Shield}</div>
                <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-700">The void is silent</p>
                <p className="text-[10px] text-slate-800 mt-2 font-bold uppercase">Establishing ghost protocol...</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SocialFeed;
