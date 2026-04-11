import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, IFrame, IMessage } from '@stomp/stompjs';
import { useAuthStore } from '../store/authStore';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://api.20.244.84.62.nip.io/ws';

export interface Message {
  id: number;
  groupId: number;
  senderId: number;
  senderName: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  fileUrl?: string;
  fileName?: string;
  replyToId?: number;
  replyTo?: any;
  edited: boolean;
  deleted: boolean;
  pinned: boolean;
  reactions?: string;
  createdAt: string;
}

export interface TypingIndicator {
  groupId: number;
  userId: number;
  userName: string;
  typing: boolean;
}

/**
 * Custom hook for WebSocket communication via STOMP.
 */
export const useChatWebSocket = (groupId: number | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const stompClient = useRef<Client | null>(null);
  const { token, user } = useAuthStore();

  const connect = useCallback(() => {
    if (!token) return;

    // Destroy existing client if any
    if (stompClient.current) {
        stompClient.current.deactivate();
    }

    const client = new Client({
      // Using /api/ws to match unified Gateway routing
      webSocketFactory: () => new WebSocket(`${import.meta.env.VITE_WS_URL}/ws?token=${token}`),
      connectHeaders: {
        token: token // Some brokers prefer it in the header too
      },
      debug: (str) => {
        // console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame: IFrame) => {
      console.log('[Chat WS] Connected: ' + frame);
      setIsConnected(true);

      if (groupId) {
        // 1. Subscribe to group messages
        client.subscribe(`/topic/group/${groupId}`, (message: IMessage) => {
          const newMessage = JSON.parse(message.body);
          setMessages((prev) => [newMessage, ...prev]);
        });

        // 2. Subscribe to typing indicators
        client.subscribe(`/topic/group/${groupId}/typing`, (message: IMessage) => {
          const indicator = JSON.parse(message.body);
          if (indicator.userId !== user?.id) {
            setTypingUsers((prev) => {
              const filtered = prev.filter(u => u.userId !== indicator.userId);
              return indicator.typing ? [...filtered, indicator] : filtered;
            });
          }
        });

        // 3. Subscribe to deletions/edits
        client.subscribe(`/topic/group/${groupId}/delete`, (message: IMessage) => {
            const deletedMessage = JSON.parse(message.body);
            setMessages((prev) => prev.map(m => m.id === deletedMessage.id ? deletedMessage : m));
        });

        client.subscribe(`/topic/group/${groupId}/edit`, (message: IMessage) => {
            const editedMessage = JSON.parse(message.body);
            setMessages((prev) => prev.map(m => m.id === editedMessage.id ? editedMessage : m));
        });
      }
    };

    client.onStompError = (frame) => {
      console.error('[Chat WS] Broker error', frame.headers['message']);
      console.error('[Chat WS] Details', frame.body);
    };

    client.onDisconnect = () => {
      console.log('[Chat WS] Disconnected');
      setIsConnected(false);
    };

    client.activate();
    stompClient.current = client;
  }, [token, groupId, user?.id]);

  useEffect(() => {
    connect();
    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, [connect]);

  // --- External Actions ---

  const sendMessage = (content: string, replyToId?: number) => {
    if (stompClient.current?.connected && groupId) {
      stompClient.current.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({
          groupId,
          content,
          type: 'TEXT',
          replyToId
        })
      });
    }
  };

  const sendTyping = (isTyping: boolean) => {
    if (stompClient.current?.connected && groupId) {
      stompClient.current.publish({
        destination: '/app/chat.typing',
        body: JSON.stringify({
          groupId,
          typing: isTyping
        })
      });
    }
  };

  return {
    messages,
    setMessages,
    typingUsers,
    isConnected,
    sendMessage,
    sendTyping
  };
};
