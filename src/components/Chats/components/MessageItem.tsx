import React from 'react';
import './MessageItem.css';

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

interface MessageItemProps {
  message: ChatMessage;
  status?: string;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  status
}) => {
  if (message.is_deleted) {
    return (
      <div className={`message-container ${message.is_own ? 'own-message' : 'other-message'}`}>
        <div className="message-bubble deleted-message">
          <div className="message-text deleted-text">Сообщение удалено</div>
          <div className="message-meta">
            <span className="timestamp">{message.sent_at}</span>
          </div>
        </div>
      </div>
    );
  }
  

  return (
    <div className={`message-container ${message.is_own ? 'own-message' : 'other-message'}`}>
      <div className={`message-bubble message-type-${message.message_type}`}>
        {!message.is_own && (
          <div className="sender-name">{message.sender_name}</div>
        )}
        <div className="message-text">{message.message_text}</div>
        <div className="message-meta">
          <span className="timestamp">{message.sent_at}</span>
          {message.is_own && status && (
            <span className={`status ${status}`}>
              {status === 'sent' && '✓'}
              {status === 'delivered' && '✓✓'}
              {status === 'read' && '✓✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;