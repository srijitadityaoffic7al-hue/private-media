
import React, { useState } from 'react';
import { useChat } from '../store/chatStore';
import { ICONS } from '../constants';
import { Post } from '../types';

const ThreadItem: React.FC<{ post: Post }> = ({ post }) => {
  const { users, currentUser, likePost } = useChat();
  const author = users.find(u => u.id === post.authorId);
  const isLiked = currentUser && post.likes.includes(currentUser.id);

  return (
    <div className="p-4 border-b border-slate-900 flex space-x-3 hover:bg-slate-900/30 transition-colors animate-in fade-in duration-500">
      <div className="flex flex-col items-center">
        <img src={author?.avatar} className="w-10 h-10 rounded-full border border-slate-800" alt="avatar" />
        <div className="w-[2px] flex-1 bg-slate-900 my-2 rounded-full"></div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-1">
            <span className="font-bold text-white text-sm hover:underline cursor-pointer">{author?.username}</span>
            <span className="text-blue-500">{ICONS.Shield}</span>
            <span className="text-slate-600 text-xs">· {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <button className="text-slate-600 hover:text-white transition-colors">{ICONS.More}</button>
        </div>
        <p className="text-slate-200 text-sm leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>
        
        <div className="flex items-center space-x-6 text-slate-500">
          <button 
            onClick={() => likePost(post.id)}
            className={`flex items-center space-x-1.5 transition-all active:scale-125 ${isLiked ? 'text-red-500' : 'hover:text-red-400'}`}
          >
            {ICONS.Heart}
            {post.likes.length > 0 && <span className="text-xs font-bold">{post.likes.length}</span>}
          </button>
          <button className="flex items-center space-x-1.5 hover:text-blue-400">
            {ICONS.Comment}
            <span className="text-xs font-bold">0</span>
          </button>
          <button className="flex items-center space-x-1.5 hover:text-green-400">
            {ICONS.Repeat}
          </button>
          <button className="flex items-center space-x-1.5 hover:text-white">
            {ICONS.Send}
          </button>
        </div>
      </div>
    </div>
  );
};

const SocialFeed: React.FC = () => {
  const { posts, currentUser, createPost } = useChat();
  const [newPostContent, setNewPostContent] = useState('');

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPostContent.trim()) {
      createPost(newPostContent);
      setNewPostContent('');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto min-h-screen bg-slate-950 border-x border-slate-900">
      {/* Header */}
      <div className="sticky top-0 bg-slate-950/80 backdrop-blur-xl z-20 p-4 border-b border-slate-900 flex justify-center">
        <h2 className="text-lg font-black tracking-tighter italic">ZYLOS WORLD</h2>
      </div>

      {/* Composer */}
      <div className="p-4 border-b border-slate-900">
        <div className="flex space-x-3">
          <img src={currentUser?.avatar} className="w-10 h-10 rounded-full border border-slate-800" alt="me" />
          <form onSubmit={handlePost} className="flex-1">
            <textarea
              placeholder="What's your shadow protocol?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="w-full bg-transparent text-white border-none focus:ring-0 resize-none text-sm placeholder-slate-700 min-h-[60px]"
            />
            <div className="flex justify-between items-center mt-2">
              <div className="flex space-x-4 text-slate-500">
                <button type="button" className="hover:text-blue-500 transition-colors">{ICONS.Image}</button>
                <button type="button" className="hover:text-blue-500 transition-colors">{ICONS.Camera}</button>
                <button type="button" className="hover:text-blue-500 transition-colors">{ICONS.Mic}</button>
              </div>
              <button 
                type="submit"
                disabled={!newPostContent.trim()}
                className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest transition-all ${newPostContent.trim() ? 'bg-white text-black hover:bg-slate-200' : 'bg-slate-900 text-slate-700 cursor-not-allowed'}`}
              >
                Post
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Feed */}
      <div className="pb-24">
        {posts.map(post => (
          <ThreadItem key={post.id} post={post} />
        ))}
        {posts.length === 0 && (
          <div className="p-20 text-center opacity-30">
            <p className="text-sm font-bold uppercase tracking-[0.5em]">Silence in the Void</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialFeed;
