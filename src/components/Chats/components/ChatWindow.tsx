import React, { useState, useRef, useEffect } from 'react';
import { useChatWindow } from '../hooks/useChatWindow';
import styles from '../styles/Chats.module.css';
import { ChatMessage } from '../hooks/useChatMessages';

interface ChatWindowProps {
  chatId: string;
  onBack: () => void;
}

// Компонент отдельного сообщения
const MessageItem: React.FC<{ message: ChatMessage; isOwn: boolean }> = ({ message, isOwn }) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`${styles.message} ${isOwn ? styles.messageOwn : styles.messageOther}`}>
      {!isOwn && (
        <div className={styles.messageSender}>
          {message.sender_name || 'Пользователь'}
        </div>
      )}
      <div className={styles.messageText}>
        {message.message_text}
      </div>
      <div className={styles.messageTime}>
        {formatTime(message.sent_at)}
      </div>
    </div>
  );
};

// Компонент поля ввода сообщения
const MessageInput: React.FC<{
  onSendMessage: (text: string) => void;
  onStartTyping: () => void;
  onStopTyping: () => void;
  sendingMessage: boolean;
  disabled: boolean;
}> = ({ onSendMessage, onStartTyping, onStopTyping, sendingMessage, disabled }) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputText(value);

    // Управление индикатором печати
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onStartTyping();
    }

    // Сброс таймера
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Остановка печати через 1 секунду бездействия
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onStopTyping();
      }
    }, 1000);
  };

  const handleSendMessage = () => {
    const text = inputText.trim();
    if (!text || sendingMessage || disabled) return;

    onSendMessage(text);
    setInputText('');
    
    // Останавливаем индикатор печати
    if (isTyping) {
      setIsTyping(false);
      onStopTyping();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBlur = () => {
    // Останавливаем печать при потере фокуса
    if (isTyping) {
      setIsTyping(false);
      onStopTyping();
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.messageInput}>
      <input
        type="text"
        placeholder={disabled ? "Подключение..." : "Введите сообщение..."}
        className={styles.input}
        value={inputText}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        onBlur={handleBlur}
        disabled={disabled || sendingMessage}
      />
      <button
        className={styles.sendButton}
        onClick={handleSendMessage}
        disabled={!inputText.trim() || sendingMessage || disabled}
      >
        {sendingMessage ? '...' : '→'}
      </button>
    </div>
  );
};

// Компонент индикатора печати
const TypingIndicator: React.FC<{ typingUsers: string[] }> = ({ typingUsers }) => {
  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} печатает...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} и ${typingUsers[1]} печатают...`;
    } else {
      return `${typingUsers[0]} и еще ${typingUsers.length - 1} печатают...`;
    }
  };

  return (
    <div className={styles.typingIndicator}>
      {getTypingText()}
    </div>
  );
};

// Основной компонент ChatWindow
export const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, onBack }) => {
  const {
    loading,
    error,
    isJoined,
    messages,
    sendingMessage,
    hasMoreMessages,
    typingUsers,
    sendMessage,
    loadMoreMessages,
    startTyping,
    stopTyping,
    clearError,
    retryJoin
  } = useChatWindow({ chatId });

  // Рефы для автопрокрутки
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Автопрокрутка к новым сообщениям
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  // Проверка нужности автопрокрутки при скролле пользователем
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setAutoScroll(isNearBottom);

    // Загрузка старых сообщений при скролле вверх
    if (scrollTop === 0 && hasMoreMessages) {
      loadMoreMessages();
    }
  };

  // Определение владельца сообщения (заглушка - нужно получать current_user_id)
  const isOwnMessage = (message: ChatMessage): boolean => {
    // TODO: Сравнивать с текущим пользователем
    // const currentUserId = getCurrentUserId();
    // return message.sender_id === currentUserId;
    return message.is_own || false;
  };

  // Обработка отправки сообщения
  const handleSendMessage = async (text: string) => {
    try {
      await sendMessage(text);
      setAutoScroll(true); // Включаем автопрокрутку при отправке
    } catch (err) {
      console.error('Ошибка отправки сообщения:', err);
    }
  };

  return (
    <div className={styles.chatWindow}>
      {/* Шапка чата */}
      <header className={styles.chatHeader}>
        <button className={styles.backButton} onClick={onBack}>
          ←
        </button>
        <h2>Чат {chatId}</h2>
        {!isJoined && (
          <span className={styles.connectionStatus}>
            {loading ? 'Подключение...' : 'Не подключен'}
          </span>
        )}
      </header>

      {/* Область сообщений */}
      <div 
        className={styles.messagesArea}
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {/* Состояние загрузки */}
        {loading && (
          <div className={styles.loadingMessages}>
            <p>Загрузка сообщений...</p>
          </div>
        )}

        {/* Ошибка */}
        {error && (
          <div className={styles.errorMessage}>
            <p>{error}</p>
            <button onClick={clearError} className={styles.clearErrorButton}>
              Закрыть
            </button>
            {!isJoined && (
              <button onClick={retryJoin} className={styles.retryButton}>
                Повторить подключение
              </button>
            )}
          </div>
        )}

        {/* Пустое состояние */}
        {!loading && !error && messages.length === 0 && (
          <div className={styles.emptyState}>
            <p>Сообщений пока нет</p>
            <p>Начните разговор!</p>
          </div>
        )}

        {/* Индикатор загрузки старых сообщений */}
        {hasMoreMessages && (
          <div className={styles.loadMoreIndicator}>
            <button onClick={loadMoreMessages} className={styles.loadMoreButton}>
              Загрузить предыдущие сообщения
            </button>
          </div>
        )}

        {/* Список сообщений */}
        {messages.map((message) => (
          <MessageItem
            key={message.message_id}
            message={message}
            isOwn={isOwnMessage(message)}
          />
        ))}

        {/* Индикатор печати */}
        <TypingIndicator typingUsers={typingUsers} />

        {/* Невидимый элемент для автопрокрутки */}
        <div ref={messagesEndRef} />
      </div>

      {/* Поле ввода сообщения */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onStartTyping={startTyping}
        onStopTyping={stopTyping}
        sendingMessage={sendingMessage}
        disabled={!isJoined}
      />
    </div>
  );
};