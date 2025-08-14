import { useEffect, useState, useCallback, useRef } from 'react';
import { socketService } from '../services/socketService';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Используем ref для предотвращения множественных подписок
  const handlersSet = useRef(false);

  useEffect(() => {
    // Предотвращаем множественную установку обработчиков
    if (handlersSet.current) {
      return;
    }

    console.log('🚀 useSocket useEffect запущен');
    
    const socket = socketService.connect();
    
    if (!socket) {
      console.error('❌ socketService.connect() вернул null');
      setError('Ошибка создания сокета');
      return;
    }

    console.log('🔗 Socket создан, устанавливаем обработчики');

    const onConnect = () => {
      console.log('✅ useSocket: socket connected');
      console.log('🆔 Socket ID:', socket.id);
      setIsConnected(true);
      setError(null);
    };

    const onDisconnect = (reason: string) => {
      console.log('🔌 useSocket: socket disconnected, причина:', reason);
      setIsConnected(false);
      
      // Не показываем ошибку для нормального отключения
      if (reason !== 'io client disconnect') {
        setError(`Соединение потеряно: ${reason}`);
      }
    };

    const onConnectError = (error: any) => {
      console.error('❌ useSocket: socket connect error');
      console.error('📋 Детали ошибки:', error);
      
      let errorMessage = 'Ошибка подключения';
      
      if (error?.message) {
        errorMessage += `: ${error.message}`;
      } else if (typeof error === 'string') {
        errorMessage += `: ${error}`;
      } else {
        errorMessage += ': проверьте авторизацию';
      }
      
      setError(errorMessage);
      setIsConnected(false);
    };

    // Устанавливаем обработчики только один раз
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    // Проверяем начальное состояние
    console.log('🔍 Начальное состояние сокета:');
    console.log('  - connected:', socket.connected);
    console.log('  - disconnected:', socket.disconnected);
    
    if (socket.connected) {
      console.log('✅ Сокет уже был подключен');
      setIsConnected(true);
      setError(null);
    }

    // Дополнительные обработчики для отладки
    socket.on('reconnect', (attemptNumber: number) => {
      console.log(`🔄 useSocket: reconnect после ${attemptNumber} попыток`);
      setIsConnected(true);
      setError(null);
    });

    socket.on('reconnect_error', (error: any) => {
      console.error('❌ useSocket: reconnect_error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('❌ useSocket: reconnect_failed');
      setError('Не удалось переподключиться к серверу');
    });

    // Отмечаем что обработчики установлены
    handlersSet.current = true;

    return () => {
      console.log('🧹 useSocket cleanup');
      
      // Снимаем флаг только если это окончательная очистка
      handlersSet.current = false;
      
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('reconnect');
      socket.off('reconnect_attempt');
      socket.off('reconnect_error');
      socket.off('reconnect_failed');
    };
  }, []); // Пустой массив зависимостей - выполняется только один раз

  const emit = useCallback((event: string, data?: any) => {
    console.log(`📤 useSocket.emit: ${event}`, data);
    socketService.emit(event, data);
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    console.log(`👂 useSocket.on: подписка на ${event}`);
    socketService.on(event, callback);
  }, []);

  const off = useCallback((event: string, callback?: (data: any) => void) => {
    console.log(`👋 useSocket.off: отписка от ${event}`);
    socketService.off(event, callback);
  }, []);

  // Логируем только критические изменения состояния
  useEffect(() => {
    console.log('📊 useSocket состояние изменилось:');
    console.log('  - isConnected:', isConnected);
    console.log('  - error:', error);
  }, [isConnected, error]);

  return {
    isConnected,
    error,
    emit,
    on,
    off
  };
};