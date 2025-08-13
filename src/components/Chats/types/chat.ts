export interface Chat {
  chat_id: string;
  chat_name: string;
  chat_type: 'group' | 'private';
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export interface SocketResponse {
  success: boolean;
  data: any;
  message: string;
}

export type NavigationView = 'chats-list' | 'chat-window';