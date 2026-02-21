import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  online: boolean;
  joinExpertRoom: (expertId: number) => void;
  leaveExpertRoom: (expertId: number) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  online: false,
  joinExpertRoom: () => {},
  leaveExpertRoom: () => {}
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    // FIX: process.env ko import.meta.env se replace karo
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001'; // Also changed REACT_APP_ to VITE_ for Vite
    
    const socketIo = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketIo.on('connect', () => {
      console.log('🔌 Socket connected');
      setOnline(true);
    });

    socketIo.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setOnline(false);
    });

    socketIo.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, []);

  const joinExpertRoom = (expertId: number) => {
    if (socket && online) {
      socket.emit('join-expert', expertId);
      console.log(`Joined expert room: ${expertId}`);
    }
  };

  const leaveExpertRoom = (expertId: number) => {
    if (socket && online) {
      socket.emit('leave-expert', expertId);
      console.log(`Left expert room: ${expertId}`);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, online, joinExpertRoom, leaveExpertRoom }}>
      {children}
    </SocketContext.Provider>
  );
};