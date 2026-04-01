// SocketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-toastify';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_API_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    newSocket.on('notification', (data) => {
      toast.info(data.message);
    });

    newSocket.on('receiveMessage', (data) => {
      toast.info(`New message from ${data.from}: ${data.message}`);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const joinRoom = (userData) => {
    if (socket) {
      socket.emit('join', userData);
    }
  };

  const sendMessage = (to, message, from) => {
    if (socket) {
      socket.emit('sendMessage', { to, message, from });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinRoom, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
};