
export type MessageStatus = 'sent' | 'delivered' | 'seen';

export interface User {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  isVerified?: boolean;
  following: string[]; // User IDs
  followers: string[]; // User IDs
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
  likes: string[]; // User IDs
  replies: Post[];
  reposts: string[]; // User IDs
  attachments?: Attachment[];
}

export interface Chat {
  id: string;
  participants: string[]; // User IDs
  lastMessage?: Message;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  chats: Chat[];
  posts: Post[];
  messages: Record<string, Message[]>; // chatId: messages[]
  activeChatId: string | null;
  view: 'feed' | 'messages' | 'profile' | 'chat_room';
}
