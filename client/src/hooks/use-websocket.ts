import { useEffect, useRef, useCallback } from 'react';
import { ws } from '@shared/routes';
import { z } from 'zod';

type WebSocketMessage = {
  type: string;
  payload: unknown;
};

type SlotBookedPayload = {
  expertId: number;
  date: string;
  time: string;
};

type SlotSelectedPayload = {
  expertId: number;
  date: string;
  time: string;
};

export function useWebSocket(url: string) {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Determine the protocol (ws or wss) based on the current page protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}${url}`;

    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log('WebSocket Connected');
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket Disconnected');
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [url]);

  const send = useCallback(<T>(type: string, payload: T) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, payload }));
    }
  }, []);

  const subscribe = useCallback(<T>(type: string, callback: (payload: T) => void) => {
    const handler = (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        if (message.type === type) {
          callback(message.payload as T);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message', error);
      }
    };

    socketRef.current?.addEventListener('message', handler);
    return () => socketRef.current?.removeEventListener('message', handler);
  }, []);

  return { send, subscribe, socket: socketRef.current };
}
