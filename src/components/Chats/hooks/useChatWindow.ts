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
  const { isConnected, error: socketError, emit, on, off } = useSocket();
  
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

  // Refs для предотвращения дублирования
  const loadingInitiated = useRef(false);
  const currentChatId = useRef<string>('');
  const loadTimeout = useRef<number | undefined>(undefined);

  // Очистка общих ошибок
  const clearError = useCallback(() => {
    setError(null);
    clearMessagesError();
  }, [clearMessagesError]);

  // Сброс состояния при смене чата
  useEffect(() => {
    if (currentChatId.current !== chatId) {
      console.log(`🔄 Переключение на чат: ${chatId}`);
      
      currentChatId.current = chatId;
      loadingInitiated.current = false;
      
      // Очищаем предыдущий таймаут
      if (loadTimeout.current) {
        window.clearTimeout(loadTimeout.current);
      }
      
      // Сбрасываем состояния
      setLoading(true);
      setError(null);
    }
  }, [chatId]);

  // Отслеживание ошибок сокета
  useEffect(() => {
    if (socketError) {
      console.error(`❌ Ошибка сокета: ${socketError}`);
      setError(`Ошибка подключения: ${socketError}`);
      setLoading(false);
    }
  }, [socketError]);

  // Автоматическая загрузка сообщений при подключении (только один раз за чат)
  useEffect(() => {
    if (isConnected && chatId && !loadingInitiated.current) {
      console.log(`📥 Инициируем загрузку сообщений для чата: ${chatId}`);
      
      loadingInitiated.current = true;
      
      // Debounced загрузка с задержкой
      loadTimeout.current = window.setTimeout(() => {
        console.log(`📥 Выполняем загрузку сообщений для чата: ${chatId}`);
        loadMessages();
        setLoading(false);
      }, 200);
    }
  }, [isConnected, chatId]); // Убираем loadMessages из зависимостей

  // WebSocket обработчики для общих событий (устанавливаем только один раз)
  useEffect(() => {
    if (!chatId) return;

    // Отключение от сокета
    const onDisconnect = () => {
      console.log(`🔌 Отключение от сокета для чата ${chatId}`);
      setError('Подключение потеряно. Попытка переподключения...');
    };

    // Переподключение к сокету
    const onReconnect = () => {
      console.log(`🔌 Переподключение к сокету для чата ${chatId}`);
      setError(null);
      
      // При переподключении сбрасываем флаг и даем возможность загрузить сообщения заново
      loadingInitiated.current = false;
    };

    // Подписка на события
    on('disconnect', onDisconnect);
    on('connect', onReconnect);

    return () => {
      off('disconnect', onDisconnect);
      off('connect', onReconnect);
      
      // Очищаем таймаут при размонтировании
      if (loadTimeout.current) {
        window.clearTimeout(loadTimeout.current);
      }
    };
  }, [chatId, on, off]); // Минимальные зависимости

  // Автоматическое снятие состояния загрузки при получении ошибок сообщений
  useEffect(() => {
    if (messagesError) {
      setLoading(false);
    }
  }, [messagesError]);

  // Убираем периодическую отладку - оставляем только важные моменты
  useEffect(() => {
    console.log('📊 Состояние useChatWindow изменилось:');
    console.log('  - chatId:', chatId);
    console.log('  - isConnected:', isConnected);
    console.log('  - loading:', loading);
    console.log('  - loadingInitiated:', loadingInitiated.current);
    console.log('  - error:', error);
    console.log('  - messagesError:', messagesError);
  }, [chatId, isConnected, loading, error, messagesError]);

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