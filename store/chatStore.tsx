
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, Message, Chat, Post, AppState, P2PStatus } from '../types';
import { MOCK_USERS } from '../constants';
import Peer, { DataConnection } from 'peerjs';

interface ChatContextType extends AppState {
  login: (username: string) => void;
  logout: () => void;
  setView: (view: AppState['view']) => void;
  setActiveChat: (chatId: string) => void;
  sendMessage: (content: string, attachments?: any[]) => void;
  createPost: (content: string, attachments?: any[]) => void;
  likePost: (postId: string) => void;
  followUser: (userId: string) => void;
  createChat: (userIds: string[]) => string;
  markViewOnceAsSeen: (messageId: string, attachmentId: string) => void;
  isLoading: boolean;
  peerId: string | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<AppState['view']>('feed');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [peerId, setPeerId] = useState<string | null>(null);
  
  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<Record<string, DataConnection>>({}); // partnerPeerId -> connection

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('zylos_user_v3');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [chats, setChats] = useState<Chat[]>(() => JSON.parse(localStorage.getItem('zylos_chats_v3') || '[]'));
  const [posts, setPosts] = useState<Post[]>(() => JSON.parse(localStorage.getItem('zylos_posts_v3') || '[]'));
  const [messages, setMessages] = useState<Record<string, Message[]>>(() => JSON.parse(localStorage.getItem('zylos_messages_v3') || '{}'));

  // Initialize P2P when logged in
  useEffect(() => {
    if (currentUser && !peerRef.current) {
      // Use username as Peer ID (must be unique globally)
      const pId = `zylos_${currentUser.username.toLowerCase()}`;
      const peer = new Peer(pId);
      
      peer.on('open', (id) => {
        console.log('P2P Node Online:', id);
        setPeerId(id);
      });

      peer.on('connection', (conn) => {
        setupConnection(conn);
      });

      peer.on('error', (err) => {
        console.error('P2P Error:', err);
      });

      peerRef.current = peer;
    }

    return () => {
      if (!currentUser && peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    };
  }, [currentUser]);

  const setupConnection = (conn: DataConnection) => {
    conn.on('open', () => {
      console.log('P2P Linked with:', conn.peer);
      connectionsRef.current[conn.peer] = conn;
      
      // Update chat status to connected
      setChats(prev => prev.map(c => {
        if (c.participants.some(p => `zylos_${p}` === conn.peer)) {
          return { ...c, p2pStatus: 'connected' };
        }
        return c;
      }));
    });

    conn.on('data', (data: any) => {
      console.log('P2P Data Received:', data);
      if (data.type === 'CHAT_MSG') {
        const { chatId, message } = data;
        setMessages(prev => ({ ...prev, [chatId]: [...(prev[chatId] || []), message] }));
      }
    });

    conn.on('close', () => {
      console.log('P2P Disconnected:', conn.peer);
      delete connectionsRef.current[conn.peer];
    });
  };

  const login = (username: string) => {
    const newUser: User = {
      id: username.toLowerCase(),
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
    if (peerRef.current) peerRef.current.destroy();
    setCurrentUser(null);
    localStorage.removeItem('zylos_user_v3');
    setView('feed');
  };

  const sendMessage = (content: string, attachments: any[] = []) => {
    if (!currentUser || !activeChatId) return;
    
    const activeChat = chats.find(c => c.id === activeChatId);
    if (!activeChat) return;

    const partnerId = activeChat.participants.find(p => p !== currentUser.id);
    if (!partnerId) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      content,
      timestamp: Date.now(),
      status: 'sent',
      attachments
    };

    // Save locally
    setMessages(prev => ({ ...prev, [activeChatId]: [...(prev[activeChatId] || []), newMessage] }));

    // Send via P2P
    const partnerPeerId = `zylos_${partnerId.toLowerCase()}`;
    let conn = connectionsRef.current[partnerPeerId];

    if (!conn || !conn.open) {
      console.log('Establishing new P2P link...');
      conn = peerRef.current!.connect(partnerPeerId);
      setupConnection(conn);
    }

    // Attempt to send immediately if open, or wait for open
    const sendData = () => {
      conn.send({
        type: 'CHAT_MSG',
        chatId: activeChatId,
        message: newMessage
      });
    };

    if (conn.open) {
      sendData();
    } else {
      conn.on('open', sendData);
    }
  };

  const createChat = (userIds: string[]) => {
    const partnerId = userIds[0];
    const existing = chats.find(c => !c.isGroup && c.participants.includes(partnerId) && c.participants.includes(currentUser?.id || ''));
    if (existing) return existing.id;

    const id = `chat_${currentUser?.id}_${partnerId}`;
    const newChat: Chat = { 
      id, 
      participants: [currentUser?.id || '', partnerId], 
      isGroup: false,
      p2pStatus: 'disconnected'
    };
    setChats(prev => [newChat, ...prev]);
    return id;
  };

  // Rest of the methods...
  const createPost = (content: string) => {
    if (!currentUser) return;
    const newPost: Post = { id: `post_${Date.now()}`, authorId: currentUser.id, content, timestamp: Date.now(), likes: [], replies: [], reposts: [] };
    setPosts(prev => [newPost, ...prev]);
  };
  const likePost = (postId: string) => { /* Logic */ };
  const followUser = (userId: string) => { /* Logic */ };
  const markViewOnceAsSeen = (mId: string, aId: string) => { /* Logic */ };

  useEffect(() => {
    localStorage.setItem('zylos_chats_v3', JSON.stringify(chats));
    localStorage.setItem('zylos_posts_v3', JSON.stringify(posts));
    localStorage.setItem('zylos_messages_v3', JSON.stringify(messages));
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [chats, posts, messages]);

  return (
    <ChatContext.Provider value={{
      currentUser, users, chats, posts, messages, activeChatId, view, isLoading, peerId,
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
