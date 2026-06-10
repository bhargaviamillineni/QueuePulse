import { io } from 'socket.io-client';
import { API_URL } from './api';

export function createQueueSocket(tokenNumber) {
  const socket = io(API_URL, { 
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });
  
  socket.on('connect', () => {
    console.log('Socket connected');
    if (tokenNumber) {
      socket.emit('queue:subscribe', { tokenNumber });
    }
  });
  
  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });
  
  return socket;
}
