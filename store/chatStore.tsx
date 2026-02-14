
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Message, Chat, Post, AppState } from '../types';
import { MOCK_USERS } from '../constants';

interface ChatContextType extends AppState {
  login: (username: string) => void;
  logout: () => void;
  setView: (view: 'feed' | 'messages' | 'profile' | 'chat_room') => void;
  setActiveChat: (chatId: string) => void;
  sendMessage: (content: string, attachments?: any[]) => void;
  createPost: (content: string, attachments?: any[]) => void;
  likePost: (postId: string) => void;
  followUser: (userId: string) => void;
  createChat: (userIds: string[]) => string;
  markViewOnceAsSeen: (messageId: string, attachmentId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);
const channel = new BroadcastChannel('zylos_social_v3');

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('zylos_user_v3');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [view, setView] = useState<'feed' | 'messages' | 'profile' | 'chat_room'>('feed');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem('zylos_chats_v3');
    return saved ? JSON.parse(saved) : [];
  });
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('zylos_posts_v3');
    return saved ? JSON.parse(saved) : [
      { id: 'p1', authorId: '2', content: 'Shadow network is expanding. Who else is in?', timestamp: Date.now() - 3600000, likes: [], replies: [], reposts: [] },
      { id: 'p2', authorId: '3', content: 'Encryption protocols updated to V3. Stay safe ghosts.', timestamp: Date.now() - 7200000, likes: [], replies: [], reposts: [] }
    ];
  });
  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('zylos_messages_v3');
    return saved ? JSON.parse(saved) : {};
  });

  // Persistance
  useEffect(() => {
    localStorage.setItem('zylos_chats_v3', JSON.stringify(chats));
    localStorage.setItem('zylos_posts_v3', JSON.stringify(posts));
    localStorage.setItem('zylos_messages_v3', JSON.stringify(messages));
  }, [chats, posts, messages]);

  useEffect(() => {
    const handleSync = (event: MessageEvent) => {
      const { type, payload } = event.data;
      if (type === 'NEW_POST') setPosts(prev => [payload, ...prev]);
      if (type === 'NEW_MESSAGE') {
        const { chatId, message } = payload;
        setMessages(prev => ({ ...prev, [chatId]: [...(prev[chatId] || []), message] }));
      }
    };
    channel.addEventListener('message', handleSync);
    return () => channel.removeEventListener('message', handleSync);
  }, []);

  const login = (username: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      status: 'online',
      following: [],
      followers: []
    };
    setCurrentUser(newUser);
    localStorage.setItem('zylos_user_v3', JSON.stringify(newUser));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('zylos_user_v3');
  };

  const createPost = (content: string, attachments: any[] = []) => {
    if (!currentUser) return;
    const newPost: Post = {
      id: Date.now().toString(),
      authorId: currentUser.id,
      content,
      timestamp: Date.now(),
      likes: [],
      replies: [],
      reposts: []
    };
    setPosts(prev => [newPost, ...prev]);
    channel.postMessage({ type: 'NEW_POST', payload: newPost });
  };

  const likePost = (postId: string) => {
    if (!currentUser) return;
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isLiked = p.likes.includes(currentUser.id);
        return {
          ...p,
          likes: isLiked ? p.likes.filter(id => id !== currentUser.id) : [...p.likes, currentUser.id]
        };
      }
      return p;
    }));
  };

  const followUser = (userId: string) => {
    if (!currentUser) return;
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const isFollowing = u.following.includes(userId);
        return {
          ...u,
          following: isFollowing ? u.following.filter(id => id !== userId) : [...u.following, userId]
        };
      }
      return u;
    }));
  };

  const sendMessage = (content: string, attachments: any[] = []) => {
    if (!currentUser || !activeChatId) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      content,
      timestamp: Date.now(),
      status: 'sent',
      attachments
    };
    setMessages(prev => ({ ...prev, [activeChatId]: [...(prev[activeChatId] || []), newMessage] }));
    channel.postMessage({ type: 'NEW_MESSAGE', payload: { chatId: activeChatId, message: newMessage } });
  };

  const createChat = (userIds: string[]) => {
    const existing = chats.find(c => !c.isGroup && c.participants.includes(userIds[0]) && c.participants.includes(currentUser?.id || ''));
    if (existing) return existing.id;

    const id = Math.random().toString(36).substr(2, 9);
    const newChat: Chat = { id, participants: [currentUser?.id || '', ...userIds], isGroup: false };
    setChats(prev => [newChat, ...prev]);
    return id;
  };

  const markViewOnceAsSeen = (messageId: string, attachmentId: string) => {
    if (!activeChatId) return;
    setMessages(prev => ({
      ...prev,
      [activeChatId]: prev[activeChatId].map(m => {
        if (m.id === messageId && m.attachments) {
          return { ...m, attachments: m.attachments.map(a => a.id === attachmentId ? { ...a, viewed: true } : a) };
        }
        return m;
      })
    }));
  };

  return (
    <ChatContext.Provider value={{
      currentUser, users, chats, posts, messages, activeChatId, view,
      login, logout, setView, setActiveChat: setActiveChatId,
      sendMessage, createPost, likePost, followUser, createChat, markViewOnceAsSeen
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
