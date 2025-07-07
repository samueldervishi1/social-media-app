import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { getUserIdFromServer } from '../auth/authUtils';

let stompClient = null;

export const startNotificationWebSocket = async (onNotification) => {
  const userId = await getUserIdFromServer();
  if (!userId) return;

  if (stompClient && stompClient.active) {
    console.warn('STOMP client already active');
    return;
  }

  stompClient = new Client({
    webSocketFactory: () => new SockJS(import.meta.env.VITE_API_URL + 'ws'),
    reconnectDelay: 5000,
    debug: () => {},

    onConnect: (_frame) => {
      try {
        stompClient.subscribe(`/topic/notifications/${userId}`, (message) => {
          const payload = JSON.parse(message.body);
          console.log('Notification:', payload);
          if (onNotification) onNotification(payload);
        });
      } catch (err) {
        console.error('Failed to subscribe:', err.message);
      }
    },

    onStompError: (frame) => {
      console.error('STOMP error:', frame.headers['message']);
    },

    onWebSocketError: (event) => {
      console.error('WebSocket error:', event);
    },
  });

  stompClient.activate();
};

export const stopNotificationWebSocket = () => {
  if (stompClient && stompClient.active) {
    stompClient.deactivate();
    stompClient = null;
  }
};
