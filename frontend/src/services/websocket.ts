import { io, Socket } from 'socket.io-client';
import { store } from '../store/store';
import type { RootState } from '../store/store';

class WebSocketService {
  private socket: Socket | null = null;
  private url: string;

  constructor() {
    this.url = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
  }

  connect() {
    const state = store.getState() as RootState;
    const token = state.auth.token;
    const tenantId = state.tenant.currentTenantId;

    if (!token || !tenantId) {
      console.warn('Cannot connect: missing token or tenantId');
      return;
    }

    this.socket = io(this.url, {
      auth: {
        token,
        tenantId,
      },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event: string, data?: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

export const websocketService = new WebSocketService();

