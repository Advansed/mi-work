import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from './useSocket';

export interface UseTypingProps {
  chatId: string;
}

export interface UseTypingReturn {
  typingUsers: string[];
  startTyping: () => void;
  stopTyping: () => void;
  isTyping: boolean;
}

export const useTyping = ({ chatId }: UseTypingProps): UseTypingReturn => {
  // Состояние
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Рефы
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentlyTypingRef = useRef(false);
  
  // Socket
  const { isConnected, emit, on, off } = useSocket();

  // Начать печать
  const startTyping = useCallback(() => {
    if (!isConnected || !chatId || currentlyTypingRef.current) return;
    
    console.log(`⌨️ Начало печати в чате ${chatId}`);
    currentlyTypingRef.current = true;
    setIsTyping(true);
    emit('typing_start', { chat_id: chatId });
    
    // Автоматически останавливаем через 3 секунды бездействия
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [isConnected, chatId, emit]);

  // Остановить печать
  const stopTyping = useCallback(() => {
    if (!isConnected || !chatId || !currentlyTypingRef.current) return;
    
    console.log(`⌨️ Остановка печати в чате ${chatId}`);
    currentlyTypingRef.current = false;
    setIsTyping(false);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    emit('typing_stop', { chat_id: chatId });
  }, [isConnected, chatId, emit]);

  // Продление времени печати
  const extendTyping = useCallback(() => {
    if (!currentlyTypingRef.current) {
      startTyping();
      return;
    }
    
    // Продляем таймер если уже печатаем
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [startTyping, stopTyping]);

  // Сброс состояния при смене чата
  useEffect(() => {
    // Останавливаем печать если она была активна
    if (currentlyTypingRef.current) {
      stopTyping();
    }
    
    // Очищаем список печатающих пользователей
    setTypingUsers([]);
    setIsTyping(false);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [chatId, stopTyping]);

  // WebSocket обработчики
  useEffect(() => {
    // Индикатор печати других пользователей
    const onUserTyping = (data: { 
      chat_id: string; 
      user_id: string; 
      user_name?: string;
      typing: boolean; 
    }) => {
      if (data.chat_id === chatId && data.user_id) {
        const userName = data.user_name || data.user_id;
        
        setTypingUsers(prev => {
          if (data.typing) {
            // Добавляем пользователя если его еще нет в списке
            return prev.includes(userName) ? prev : [...prev, userName];
          } else {
            // Убираем пользователя из списка
            return prev.filter(user => user !== userName);
          }
        });
      }
    };

    // Подписка на события
    on('user_typing', onUserTyping);

    return () => {
      off('user_typing', onUserTyping);
    };
  }, [chatId, on, off]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (currentlyTypingRef.current) {
        stopTyping();
      }
    };
  }, [stopTyping]);

  // Возвращаем API с дополнительным методом extendTyping для удобства
  return {
    typingUsers,
    startTyping,
    stopTyping,
    isTyping,
    // Скрытый метод для внутреннего использования
    extendTyping
  } as UseTypingReturn & { extendTyping: () => void };
};