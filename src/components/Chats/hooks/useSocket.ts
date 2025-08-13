import { useEffect, useState, useCallback } from 'react';
import { socketService } from '../services/socketService';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = socketService.connect();

    const onConnect = () => {
      setIsConnected(true);
      setError(null);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onConnectError = (error: any) => {
      setError('Ошибка подключения: проверьте авторизацию');
      setIsConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
    };
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    socketService.emit(event, data);
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    socketService.on(event, callback);
  }, []);

  const off = useCallback((event: string, callback?: (data: any) => void) => {
    socketService.off(event, callback);
  }, []);

  return {
    isConnected,
    error,
    emit,
    on,
    off
  };
};