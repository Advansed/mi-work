import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';
import { Chat } from '../types/chat';

export const useChats = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isConnected, error: socketError, emit, on, off } = useSocket();

  // Показываем ошибку соединения если есть
  useEffect(() => {
    if (socketError) {
      setError(socketError);
      setLoading(false);
    }
  }, [socketError]);

  useEffect(() => {
    if (isConnected) {
      emit('get_user_chats');
    }
  }, [isConnected, emit]);

  useEffect(() => {
    const onChatsList = (data: { chats: Chat[] }) => {
      console.log(data)
      setChats(data.chats);
      setLoading(false);
      setError(null);
    };

    const onNewChat = (chat: Chat) => {
      setChats(prev => [chat, ...prev]);
    };

    const onChatUpdated = (updatedChat: Chat) => {
      setChats(prev => prev.map(chat => 
        chat.chat_id === updatedChat.chat_id ? updatedChat : chat
      ));
    };

    const onChatDeleted = (chatId: string) => {
      setChats(prev => prev.filter(chat => chat.chat_id !== chatId));
    };

    const onError = (data: { error: string }) => {
      setError(data.error);
      setLoading(false);
    };

    on('user_chats', onChatsList);
    on('new_chat', onNewChat);
    on('chat_updated', onChatUpdated);
    on('chat_deleted', onChatDeleted);
    on('chats_error', onError);

    return () => {
      off('user_chats', onChatsList);
      off('new_chat', onNewChat);
      off('chat_updated', onChatUpdated);
      off('chat_deleted', onChatDeleted);
      off('chats_error', onError);
    };
  }, [on, off]);

  const refetchChats = () => {
    if (isConnected) {
      setLoading(true);
      emit('get_user_chats');
    }
  };

  return {
    chats,
    loading,
    error,
    refetchChats
  };
};