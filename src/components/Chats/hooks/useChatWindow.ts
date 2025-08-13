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
  isJoined: boolean;
  
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
  retryJoin: () => void;
}

export const useChatWindow = ({ chatId }: UseChatWindowProps): UseChatWindowReturn => {
  // Общие состояния
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  
  // Рефы
  const isJoinedRef = useRef(false);
  const joinAttemptRef = useRef(false);
  
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

  // Присоединение к чату
  const joinChatRoom = useCallback(() => {
    if (!isConnected || !chatId || isJoinedRef.current || joinAttemptRef.current) {
      return;
    }
    
    joinAttemptRef.current = true;
    setError(null);
    
    console.log(`🚪 Присоединение к чату: ${chatId}`);
    emit('join_chat', { chat_id: chatId });
  }, [isConnected, chatId, emit]);

  // Повторная попытка присоединения
  const retryJoin = useCallback(() => {
    isJoinedRef.current = false;
    joinAttemptRef.current = false;
    setIsJoined(false);
    setError(null);
    joinChatRoom();
  }, [joinChatRoom]);

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
    setIsJoined(false);
    isJoinedRef.current = false;
    joinAttemptRef.current = false;
    
    return () => {
      isJoinedRef.current = false;
      joinAttemptRef.current = false;
    };
  }, [chatId]);

  // Присоединение к чату при подключении
  useEffect(() => {
    if (isConnected && chatId && !isJoinedRef.current) {
      joinChatRoom();
    }
  }, [isConnected, chatId, joinChatRoom]);

  // WebSocket обработчики для общих событий
  useEffect(() => {
    // Успешное присоединение к чату
    const onChatJoined = (data: { success: boolean; chat_id: string }) => {
      if (data.chat_id === chatId && data.success) {
        console.log(`✅ Успешно присоединились к чату ${chatId}`);
        isJoinedRef.current = true;
        joinAttemptRef.current = false;
        setIsJoined(true);
        setError(null);
        
        // Загружаем сообщения после успешного присоединения
        setTimeout(() => {
          loadMessages();
          setLoading(false);
        }, 100);
      }
    };

    // Ошибка присоединения к чату
    const onJoinError = (data: { error: string }) => {
      console.error(`❌ Ошибка присоединения к чату: ${data.error}`);
      setError(`Ошибка присоединения: ${data.error}`);
      setLoading(false);
      setIsJoined(false);
      isJoinedRef.current = false;
      joinAttemptRef.current = false;
    };

    // Отключение от сокета
    const onDisconnect = () => {
      console.log(`🔌 Отключение от сокета`);
      setIsJoined(false);
      isJoinedRef.current = false;
      joinAttemptRef.current = false;
    };

    // Переподключение к сокету
    const onReconnect = () => {
      console.log(`🔌 Переподключение к сокету`);
      if (chatId) {
        // Небольшая задержка перед повторным присоединением
        setTimeout(() => {
          retryJoin();
        }, 500);
      }
    };

    // Подписка на события
    on('chat_joined', onChatJoined);
    on('join_error', onJoinError);
    on('disconnect', onDisconnect);
    on('connect', onReconnect);

    return () => {
      off('chat_joined', onChatJoined);
      off('join_error', onJoinError);
      off('disconnect', onDisconnect);
      off('connect', onReconnect);
    };
  }, [chatId, loadMessages, retryJoin, on, off]);

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
    isJoined,
    
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
    clearError,
    retryJoin
  };
};