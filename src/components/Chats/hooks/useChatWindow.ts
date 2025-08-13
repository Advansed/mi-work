import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from './useSocket';
import { useChatMessages, ChatMessage } from './useChatMessages';
import { useTyping } from './useTyping';

export interface UseChatWindowProps {
  chatId: string;
}

export interface UseChatWindowReturn {
  // Состояния
  loading: boolean;
  error: string | null;
  
  // Сообщения
  messages: ChatMessage[];
  sendingMessage: boolean;
  hasMoreMessages: boolean;
  messagesError: string | null;
  
  // Печать
  typingUsers: string[];
  isTyping: boolean;
  
  // Методы сообщений
  sendMessage: (text: string) => Promise<void>;
  loadMoreMessages: () => void;
  
  // Методы печати
  startTyping: () => void;
  stopTyping: () => void;
  
  // Общие методы
  clearError: () => void;
}

export const useChatWindow = ({ chatId }: UseChatWindowProps): UseChatWindowReturn => {
  // Общие состояния
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Socket
  const { isConnected, emit, on, off } = useSocket();
  
  // Специализированные хуки
  const {
    messages,
    sendingMessage,
    hasMoreMessages,
    messagesError,
    sendMessage,
    loadMoreMessages,
    loadMessages,
    clearMessagesError
  } = useChatMessages({ chatId });
  
  const {
    typingUsers,
    isTyping,
    startTyping,
    stopTyping
  } = useTyping({ chatId });

  // Очистка общих ошибок
  const clearError = useCallback(() => {
    setError(null);
    clearMessagesError();
  }, [clearMessagesError]);

  // Сброс состояния при смене чата
  useEffect(() => {
    console.log(`🔄 Переключение на чат: ${chatId}`);
    
    // Сбрасываем состояния
    setLoading(true);
    setError(null);
  }, [chatId]);

  // Автоматическая загрузка сообщений при подключении
  useEffect(() => {
    console.log('load')
    console.log( isConnected, chatId )
    if (isConnected && chatId) {
      console.log(`📥 Загрузка сообщений для чата: ${chatId}`);
      
      // Загружаем сообщения сразу
      setTimeout(() => {
        loadMessages();
        setLoading(false);
      }, 100);
    }
  }, [isConnected, chatId, loadMessages]);

  // WebSocket обработчики для общих событий
  useEffect(() => {
    // Отключение от сокета
    const onDisconnect = () => {
      console.log(`🔌 Отключение от сокета`);
    };

    // Переподключение к сокету
    const onReconnect = () => {
      console.log(`🔌 Переподключение к сокету`);
      if (chatId) {
        // Небольшая задержка перед повторной загрузкой сообщений
        setTimeout(() => {
          loadMessages();
        }, 500);
      }
    };

    // Подписка на события
    on('disconnect', onDisconnect);
    on('connect', onReconnect);

    return () => {
      off('disconnect', onDisconnect);
      off('connect', onReconnect);
    };
  }, [chatId, loadMessages, emit, on, off]);

  // Автоматическое снятие состояния загрузки при получении ошибок сообщений
  useEffect(() => {
    if (messagesError) {
      setLoading(false);
    }
  }, [messagesError]);

  return {
    // Общие состояния
    loading,
    error: error || messagesError,
    
    // Сообщения
    messages,
    sendingMessage,
    hasMoreMessages,
    messagesError,
    
    // Печать
    typingUsers,
    isTyping,
    
    // Методы сообщений
    sendMessage,
    loadMoreMessages,
    
    // Методы печати
    startTyping,
    stopTyping,
    
    // Общие методы
    clearError
  };
};