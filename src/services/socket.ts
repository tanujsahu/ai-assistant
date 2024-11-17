import { io } from 'socket.io-client';
import { Message } from '../types/chat';

const SOCKET_URL = 'http://localhost:3000';

class SocketService {
  private socket;

  constructor() {
    this.socket = io(SOCKET_URL);
    
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  sendMessage(message: string) {
    return new Promise<Message>((resolve, reject) => {
      this.socket.emit('message', { content: message });

      this.socket.once('bot-response', (response: Message) => {
        resolve(response);
      });

      this.socket.once('error', (error) => {
        reject(error);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export const socketService = new SocketService();