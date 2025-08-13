import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from './useSocket';

// Типы для сообщений
export interface ChatMessage {
  message_id: string;
  chat_id: string;
  sender_id: string;
  sender_name?: string;
  message_text: string;
  sent_at: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  is_own?: boolean;
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
  loadMessages: (offset?: number, isLoadMore?: boolean) => void;
  clearMessagesError: () => void;
}

export const useChatMessages = ({ chatId }: UseChatMessagesProps): UseChatMessagesReturn => {
  // Состояние
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [messagesOffset, setMessagesOffset] = useState(0);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  
  // Рефы
  const loadingMessagesRef = useRef(false);
  
  // Socket
  const { isConnected, emit, on, off } = useSocket();

  // Загрузка сообщений
  const loadMessages = useCallback((offset = 0, isLoadMore = false) => {
    if (loadingMessagesRef.current || !isConnected || !chatId) return;
    
    loadingMessagesRef.current = true;
    setMessagesError(null);
    
    console.log(`📥 Загрузка сообщений для чата ${chatId}, offset: ${offset}`);
    emit('get_messages', {
      chat_id: chatId,
      limit: 50,
      offset: offset
    });
  }, [isConnected, chatId, emit]);

  // Загрузка дополнительных сообщений
  const loadMoreMessages = useCallback(() => {
    if (hasMoreMessages && !loadingMessagesRef.current) {
      loadMessages(messagesOffset, true);
    }
  }, [hasMoreMessages, messagesOffset, loadMessages]);

  // Отправка сообщения
  const sendMessage = useCallback(async (text: string): Promise<void> => {
    if (!text.trim() || !isConnected || !chatId || sendingMessage) {
      return;
    }

    setSendingMessage(true);
    setMessagesError(null);

    try {
      console.log(`📤 Отправка сообщения в чат ${chatId}`);
      emit('send_message', {
        chat_id: chatId,
        message_text: text.trim(),
        message_type: 'text'
      });
    } catch (err) {
      console.error('❌ Ошибка отправки сообщения:', err);
      setMessagesError('Ошибка отправки сообщения');
      setSendingMessage(false);
    }
  }, [isConnected, chatId, sendingMessage, emit]);

  // Очистка ошибки
  const clearMessagesError = useCallback(() => {
    setMessagesError(null);
  }, []);

  // Сброс состояния при смене чата
  useEffect(() => {
    setMessages([]);
    setMessagesOffset(0);
    setHasMoreMessages(false);
    setSendingMessage(false);
    setMessagesError(null);
    loadingMessagesRef.current = false;
  }, [chatId]);

  // WebSocket обработчики
  useEffect(() => {
    // История сообщений
    const onMessagesHistory = (data: { 
      chat_id: string; 
      messages: ChatMessage[]; 
      has_more: boolean;
    }) => {
      if (data.chat_id === chatId) {
        console.log(`📨 Получена история сообщений: ${data.messages.length} шт.`);
        
        setMessages(prev => {
          // Если это загрузка дополнительных сообщений (offset > 0)
          if (messagesOffset > 0) {
            return [...data.messages.reverse(), ...prev];
          }
          // Если это первая загрузка
          return data.messages.reverse();
        });
        
        setHasMoreMessages(data.has_more);
        setMessagesOffset(prev => prev + data.messages.length);
        loadingMessagesRef.current = false;
      }
    };

    // Новое сообщение
    const onNewMessage = (message: ChatMessage) => {
      if (message.chat_id === chatId) {
        console.log(`📨 Новое сообщение в чате ${chatId}`);
        setMessages(prev => [...prev, message]);
      }
    };

    // Подтверждение отправки
    const onMessageSent = (data: { success: boolean; message_id: string }) => {
      console.log(`✅ Сообщение отправлено: ${data.message_id}`);
      setSendingMessage(false);
    };

    // Ошибки
    const onMessageError = (data: { error: string }) => {
      console.error(`❌ Ошибка сообщения: ${data.error}`);
      setMessagesError(data.error);
      setSendingMessage(false);
    };

    const onMessagesError = (data: { error: string }) => {
      console.error(`❌ Ошибка загрузки сообщений: ${data.error}`);
      setMessagesError(data.error);
      loadingMessagesRef.current = false;
    };

    // Подписка на события
    on('messages_history', onMessagesHistory);
    on('new_message', onNewMessage);
    on('message_sent', onMessageSent);
    on('message_error', onMessageError);
    on('messages_error', onMessagesError);

    return () => {
      off('messages_history', onMessagesHistory);
      off('new_message', onNewMessage);
      off('message_sent', onMessageSent);
      off('message_error', onMessageError);
      off('messages_error', onMessagesError);
    };
  }, [chatId, messagesOffset, on, off]);

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