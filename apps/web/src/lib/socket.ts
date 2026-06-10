import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(role?: string, hotelId?: string): Socket {
  if (!socket) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';
    socket = io(`${wsUrl}/ws`, {
      query: { role, hotelId },
      transports: ['websocket'],
    });
  }
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
