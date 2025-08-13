import React from 'react';
import styles from '../styles/Chats.module.css';

interface ChatWindowProps {
  chatId: string;
  onBack: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, onBack }) => {
  return (
    <div className={styles.chatWindow}>
      <header className={styles.chatHeader}>
        <button className={styles.backButton} onClick={onBack}>
          ←
        </button>
        <h2>Чат {chatId}</h2>
      </header>
      
      <div className={styles.messagesArea}>
        <div className={styles.emptyState}>
          <p>Сообщения будут здесь</p>
        </div>
      </div>
      
      <div className={styles.messageInput}>
        <input 
          type="text" 
          placeholder="Введите сообщение..."
          className={styles.input}
        />
        <button className={styles.sendButton}>
          →
        </button>
      </div>
    </div>
  );
};