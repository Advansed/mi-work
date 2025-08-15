import React, { useState } from 'react';
import { ChatsList } from './components/ChatsList';
import { ChatWindow } from './components/ChatWindow';
import { useChats } from './hooks/useChats';
import { NavigationView } from './types/chat';
import styles from './styles/Chats.module.css';

export const Chats: React.FC = () => {
  const [currentView, setCurrentView] = useState<NavigationView>('chats-list');
  const [selectedChatId, setSelectedChatId] = useState<any | null>(null);
  
  const { chats, loading, error, refetchChats } = useChats();

  const handleChatClick = (chatId: any) => {
    console.log(chatId )
    setSelectedChatId(chatId);
    setCurrentView('chat-window');
  };

  const handleBackToChats = () => {
    setCurrentView('chats-list');
    setSelectedChatId(null);
  };

  const handleCreateGroup = () => {
    // Заглушка для создания группы
    console.log('Создание группы');
  };

  return (
    <div className={styles.chatsApp}>

      <main className={styles.main}>
        {currentView === 'chats-list' ? (
          <ChatsList
            chats={chats}
            loading={loading}
            error={error}
            onChatClick={handleChatClick}
            onCreateGroup={handleCreateGroup}
          />
        ) : (
          <ChatWindow
            chatId={selectedChatId.chatId}
            chatName={selectedChatId.name}
            onBack={handleBackToChats}
          />
        )}
      </main>
    </div>
  );
};