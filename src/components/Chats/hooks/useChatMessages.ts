import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './useSocket';

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
  const messagesRef = useRef<ChatMessage[]>([]);
  const pageRef = useRef(1);
  const loadedRef = useRef(false);

  // Синхронизация состояния
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Загрузка сообщений
  const loadMessages = useCallback(async () => {
    if (!chatId || loadingMessages) return;
    
    try {
      setLoadingMessages(true);
      setMessagesError(null);
      
      console.log(`📥 Загрузка сообщений для чата ${chatId}`);
      
      // Эмулируем загрузку через WebSocket или API
      // В реальном приложении здесь будет вызов API
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          page: 1,
          limit: 50
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setHasMoreMessages(data.has_more || false);
        pageRef.current = 1;
        loadedRef.current = true;
      } else {
        throw new Error('Ошибка загрузки сообщений');
      }
      
    } catch (error) {
      console.error('❌ Ошибка загрузки сообщений:', error);
      setMessagesError('Ошибка загрузки сообщений');
    } finally {
      setLoadingMessages(false);
    }
  }, [chatId, loadingMessages]);

  // Загрузка дополнительных сообщений
  const loadMoreMessages = useCallback(async () => {
    if (!chatId || !hasMoreMessages || loadingMessages) return;
    
    try {
      setLoadingMessages(true);
      
      const nextPage = pageRef.current + 1;
      
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          page: nextPage,
          limit: 50
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const newMessages = data.messages || [];
        
        setMessages(prev => [...newMessages, ...prev]);
        setHasMoreMessages(data.has_more || false);
        pageRef.current = nextPage;
      }
      
    } catch (error) {
      console.error('❌ Ошибка загрузки дополнительных сообщений:', error);
      setMessagesError('Ошибка загрузки сообщений');
    } finally {
      setLoadingMessages(false);
    }
  }, [chatId, hasMoreMessages, loadingMessages]);

  // Отправка сообщения
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !chatId || sendingMessage || !isConnected) return;
    
    try {
      setSendingMessage(true);
      setMessagesError(null);
      
      console.log(`📤 Отправка сообщения в чат ${chatId}`);
      
      emit('send_message', {
        chat_id: chatId,
        message_text: text.trim(),
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
    setMessages([]);
    setMessagesError(null);
    setHasMoreMessages(true);
    setSendingMessage(false);
    pageRef.current = 1;
    loadedRef.current = false;
  }, [chatId]);

  // WebSocket обработчики
  useEffect(() => {
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

    // Ошибка сообщения
    const onMessageError = (data: { error: string }) => {
      setSendingMessage(false);
      setMessagesError(data.error);
    };

    // Подписка на события
    on('new_message', onNewMessage);
    on('message_sent', onMessageSent);
    on('message_error', onMessageError);

    return () => {
      off('new_message', onNewMessage);
      off('message_sent', onMessageSent);
      off('message_error', onMessageError);
    };
  }, [chatId, on, off]);

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