import { io, Socket } from 'socket.io-client';
import { Store } from '../../Store';

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (!this.socket) {
      // Получаем токен из Store
      const storeState = Store.getState();
      const token = storeState.login?.token;
      
      console.log('🔗 Подключение к WebSocket...');
      
      // Проверяем localStorage как запасной вариант
      let finalToken = token;
      if (!finalToken) {
        try {
          const loginDataStr = localStorage.getItem('loginData');
          if (loginDataStr) {
            const loginData = JSON.parse(loginDataStr);
            finalToken = loginData.token;
          }
        } catch (e) {
          console.error('❌ Ошибка парсинга loginData:', e);
        }
      }

      if (!finalToken) {
        console.error('❌ Токен авторизации не найден!');
      }

      this.socket = io('https://fhd.aostng.ru', {
        path: '/dashboard/socket.io/',
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling'],
        query: {
          token: finalToken
        }
      });

      // Добавляем обработчики событий для отладки
      this.socket.on('connect', () => {
        console.log('✅ Socket.IO подключен успешно');
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Socket.IO отключен:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Ошибка подключения Socket.IO:', error);
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 Socket.IO переподключен после ${attemptNumber} попыток`);
      });

      this.socket.on('reconnect_error', (error) => {
        console.error(`❌ Ошибка переподключения Socket.IO:`, error);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('❌ Не удалось переподключиться к Socket.IO');
      });
    }
    
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Отключение Socket.IO');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data?: any): void {
    if (this.socket && this.socket.connected) {
      console.log(`📤 ${event}`, data ? Object.keys(data) : '');
      this.socket.emit(event, data);
    } else {
      console.warn(`⚠️ Не удается отправить ${event}: сокет не подключен`);
    }
  }

  on(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (data: any) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();