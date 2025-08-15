import React from 'react';
import { Chat } from '../types/chat';
import styles from '../styles/Chats.module.css';

interface ChatsListProps {
  chats: Chat[];
  loading: boolean;
  error: string | null;
  onChatClick: (chatId: any) => void;
  onCreateGroup: () => void;
}

export const ChatsList: React.FC<ChatsListProps> = ({
  chats,
  loading,
  error,
  onChatClick,
  onCreateGroup
}) => {
  if (loading) {
    return (
      <div className={styles.emptyState}>
        <p>Загрузка чатов...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.emptyState}>
        <p>Ошибка: {error}</p>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>Нет чатов</p>
        <button className={styles.fab} onClick={onCreateGroup}>
          +
        </button>
      </div>
    );
  }

  return (
    <div className={styles.chatsList}>
      {chats.map(chat => (
        <div 
          key={chat.chat_id}
          className={styles.chatItem}
          onClick={() => onChatClick({chatId: chat.chat_id, name: chat.chat_name})}
        >
          <div className={styles.chatAvatar}>
            {chat.chat_name.charAt(0).toUpperCase()}
          </div>
          <div className={styles.chatInfo}>
            <div className={styles.chatName}>{chat.chat_name}</div>
            <div className={styles.lastMessage}>{chat.last_message}</div>
          </div>
          <div className={styles.chatMeta}>
            <div className={styles.time}>{chat.last_message_time}</div>
            {chat.unread_count > 0 && (
              <div className={styles.unreadBadge}>{chat.unread_count}</div>
            )}
          </div>
        </div>
      ))}
      <button className={styles.fab} onClick={onCreateGroup}>
        +
      </button>
    </div>
  );
};