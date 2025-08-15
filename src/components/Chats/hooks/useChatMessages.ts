import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './useSocket';
import { Store } from '../../Store';

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_name: string;
  message_text: string;
  sent_at: string;
  message_type: number;
  is_deleted: boolean;
  is_own: boolean;
}

export interface UseChatMessagesProps {
  chatId: string;
}

export interface UseChatMessagesReturn {
  messages: ChatMessage[];
  sendingMessage: boolean;
  hasMoreMessages: boolean;
  messagesError: string | null;
  sendMessage: (text: string) => Promise<void>;
  loadMoreMessages: () => void;
  loadMessages: () => void;
  clearMessagesError: () => void;
}

export const useChatMessages = ({ chatId }: UseChatMessagesProps): UseChatMessagesReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const { isConnected, emit, on, off } = useSocket();
  
  // Refs для предотвращения дублирования запросов
  const messagesRef = useRef<ChatMessage[]>([]);
  const pageRef = useRef(1);
  const loadedRef = useRef(false);
  const currentChatId = useRef<string>('');
  const requestInProgress = useRef(false);

  // Синхронизация состояния
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Загрузка сообщений через WebSocket с защитой от дублирования
  const loadMessages = useCallback(async () => {
    // Проверяем все условия перед запросом
    if (!chatId || 
        !isConnected || 
        loadingMessages || 
        requestInProgress.current ||
        currentChatId.current === chatId && loadedRef.current) {
      return;
    }
    
    try {
      setLoadingMessages(true);
      setMessagesError(null);
      requestInProgress.current = true;
      
      emit('get_messages', {
        chat_id: chatId,
        user_id:  Store.getState().login.userId,
        limit: 50,
        offset: 0
      });
      
    } catch (error) {
      console.error('❌ Ошибка загрузки сообщений:', error);
      setMessagesError('Ошибка загрузки сообщений');
      setLoadingMessages(false);
      requestInProgress.current = false;
    }
  }, [chatId, isConnected, loadingMessages, emit]);

  // Загрузка дополнительных сообщений через WebSocket
  const loadMoreMessages = useCallback(async () => {
    if (!chatId || 
        !hasMoreMessages || 
        loadingMessages || 
        !isConnected ||
        requestInProgress.current) return;
    
    try {
      setLoadingMessages(true);
      requestInProgress.current = true;
      
      const offset = messagesRef.current.length;
      
      emit('get_messages', {
        chat_id: chatId,
        limit: 50,
        offset: offset
      });
      
    } catch (error) {
      setMessagesError('Ошибка загрузки сообщений');
      setLoadingMessages(false);
      requestInProgress.current = false;
    }
  }, [chatId, hasMoreMessages, loadingMessages, isConnected, emit]);

  // Отправка сообщения
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !chatId || sendingMessage || !isConnected) return;
    
    try {
      setSendingMessage(true);
      setMessagesError(null);
      
      
      emit('send_message', {
        chat_id:        chatId,
        user_id:        Store.getState().userId,
        message_text:   text.trim(),
        message_type: 1
      });
      
    } catch (error) {
      console.error('❌ Ошибка отправки сообщения:', error);
      setMessagesError('Ошибка отправки сообщения');
      setSendingMessage(false);
    }
  }, [chatId, sendingMessage, isConnected, emit]);

  // Очистка ошибок
  const clearMessagesError = useCallback(() => {
    setMessagesError(null);
  }, []);

  // Сброс состояния при смене чата
  useEffect(() => {
    if (currentChatId.current !== chatId) {
      
      currentChatId.current = chatId;
      
      setMessages([]);
      setMessagesError(null);
      setHasMoreMessages(true);
      setSendingMessage(false);
      setLoadingMessages(false);
      
      pageRef.current = 1;
      loadedRef.current = false;
      requestInProgress.current = false;
    }
  }, [chatId]);

  // WebSocket обработчики (устанавливаем только один раз)
  useEffect(() => {
    // История сообщений
    const onMessagesHistory = (data: { 
      chat_id: string; 
      messages: ChatMessage[]; 
      has_more: boolean;
    }) => {
      if (data.chat_id === chatId) {
        if (loadedRef.current) {
          // Это загрузка дополнительных сообщений (добавляем в начало)
          setMessages(prev => [...data.messages, ...prev]);
        } else {
          // Это первая загрузка (заменяем все)
          setMessages(data.messages || []);
          loadedRef.current = true;
        }
        
        setHasMoreMessages(data.has_more || false);
        setLoadingMessages(false);
        requestInProgress.current = false;
      }
    };

    // Новое сообщение
    const onNewMessage = (data: ChatMessage) => {
      if (data.chat_id === chatId) {
        setMessages(prev => [...prev, data]);
      }
    };

    // Подтверждение отправки
    const onMessageSent = (data: { success: boolean; message_id?: string }) => {
      setSendingMessage(false);
      if (!data.success) {
        setMessagesError('Ошибка отправки сообщения');
      }
    };

    // Ошибка сообщений
    const onMessagesError = (data: { error: string }) => {
      console.error(`❌ Ошибка получения сообщений:`, data.error);
      setMessagesError(data.error);
      setLoadingMessages(false);
      setSendingMessage(false);
      requestInProgress.current = false;
    };

    // Ошибка отправки сообщения
    const onMessageError = (data: { error: string }) => {
      console.error(`❌ Ошибка отправки сообщения:`, data.error);
      setSendingMessage(false);
      setMessagesError(data.error);
    };

    // Подписка на события
    on('messages_history', onMessagesHistory);
    on('new_message', onNewMessage);
    on('message_sent', onMessageSent);
    on('messages_error', onMessagesError);
    on('message_error', onMessageError);

    return () => {
      off('messages_history', onMessagesHistory);
      off('new_message', onNewMessage);
      off('message_sent', onMessageSent);
      off('messages_error', onMessagesError);
      off('message_error', onMessageError);
    };
  }, [chatId, on, off]); // Минимальные зависимости

  return {
    messages,
    sendingMessage,
    hasMoreMessages,
    messagesError,
    sendMessage,
    loadMoreMessages,
    loadMessages,
    clearMessagesError
  };
};