import {
  WebSocketGateway, WebSocketServer, OnGatewayConnection,
  OnGatewayDisconnect, SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/ws',
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);
  private roleRooms = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    const role = client.handshake.query.role as string;
    const hotelId = client.handshake.query.hotelId as string;

    if (role) {
      client.join(`role:${role}`);
      this.logger.log(`Client ${client.id} joined role:${role}`);
    }
    if (hotelId) {
      client.join(`hotel:${hotelId}`);
    }
    client.join('broadcast');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    client.emit('pong', { timestamp: Date.now() });
  }

  broadcast(event: string, data: unknown) {
    this.server?.to('broadcast').emit(event, data);
  }

  broadcastToRole(role: string, event: string, data: unknown) {
    this.server?.to(`role:${role}`).emit(event, data);
  }

  broadcastToHotel(hotelId: string, event: string, data: unknown) {
    this.server?.to(`hotel:${hotelId}`).emit(event, data);
  }
}
