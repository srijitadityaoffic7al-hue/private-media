
export type MessageStatus = 'sent' | 'delivered' | 'seen' | 'failed';
export type P2PStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface User {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  isVerified?: boolean;
  following: string[];
  followers: string[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  name: string;
  size: number;
  viewOnce?: boolean;
  viewed?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
  status: MessageStatus;
  attachments?: Attachment[];
  autoDeleteAt?: number;
  isDeleted?: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  timestamp: number;
  likes: string[];
  replies: Post[];
  reposts: string[];
  attachments?: Attachment[];
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  p2pStatus?: P2PStatus;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  chats: Chat[];
  posts: Post[];
  messages: Record<string, Message[]>;
  activeChatId: string | null;
  view: 'feed' | 'messages' | 'profile' | 'chat_room' | 'search';
}
