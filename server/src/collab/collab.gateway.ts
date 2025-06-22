// server/src/collab/collab.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

interface RoomParticipant {
  socketId: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class CollabGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private rooms: Map<string, RoomParticipant[]> = new Map();

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);

    // Remove user from all rooms they were in
    this.rooms.forEach((participants, roomId) => {
      const participantIndex = participants.findIndex(
        (p) => p.socketId === client.id,
      );
      if (participantIndex !== -1) {
        participants.splice(participantIndex, 1);

        // If room is empty, remove it
        if (participants.length === 0) {
          this.rooms.delete(roomId);
        } else {
          // Broadcast updated participant list
          this.broadcastParticipants(roomId);
        }
      }
    });
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { sessionId: string; user: RoomParticipant['user'] },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('User joined room:', data.sessionId, data.user.name);

    // Join the socket room
    client.join(data.sessionId);

    // Add user to our room tracking
    if (!this.rooms.has(data.sessionId)) {
      this.rooms.set(data.sessionId, []);
    }

    const room = this.rooms.get(data.sessionId)!;
    room.push({
      socketId: client.id,
      user: data.user,
    });

    // Broadcast updated participant list to all users in the room
    this.broadcastParticipants(data.sessionId);
  }

  @SubscribeMessage('codeUpdate')
  handleCodeUpdate(
    @MessageBody()
    data: { sessionId: string; delta: string; user: RoomParticipant['user'] },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Broadcasting code update from:', data.user.name);

    // Broadcast to all other users in the room
    client.to(data.sessionId).emit('codeUpdate', {
      sessionId: data.sessionId,
      delta: data.delta,
      user: data.user,
    });
  }

  @SubscribeMessage('cursorUpdate')
  handleCursorUpdate(
    @MessageBody()
    data: {
      sessionId: string;
      cursor: { line: number; ch: number; user: RoomParticipant['user'] };
    },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Broadcasting cursor update from:', data.cursor.user.name);

    // Broadcast to all other users in the room
    client.to(data.sessionId).emit('cursorUpdate', {
      sessionId: data.sessionId,
      cursor: data.cursor,
    });
  }

  @SubscribeMessage('selectionUpdate')
  handleSelectionUpdate(
    @MessageBody()
    data: {
      sessionId: string;
      selection: { from: number; to: number; user: RoomParticipant['user'] };
    },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(
      'Broadcasting selection update from:',
      data.selection.user.name,
    );

    // Broadcast to all other users in the room
    client.to(data.sessionId).emit('selectionUpdate', {
      sessionId: data.sessionId,
      selection: data.selection,
    });
  }

  @SubscribeMessage('chatMessage')
  handleChatMessage(
    @MessageBody()
    data: {
      sessionId: string;
      message: string;
      sender: RoomParticipant['user'];
    },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Broadcasting chat message from:', data.sender.name);

    client.to(data.sessionId).emit('chatMessage', {
      sessionId: data.sessionId,
      message: data.message,
      sender: data.sender,
    });
  }

  @SubscribeMessage('selectionClear')
  handleSelectionClear(
    @MessageBody() data: { sessionId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Broadcasting selection clear for user:', data.userId);

    // Broadcast to all other users in the room
    client.to(data.sessionId).emit('selectionClear', {
      sessionId: data.sessionId,
      userId: data.userId,
    });
  }

  private broadcastParticipants(roomId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      const participants = room.map((p) => p.user);
      // Broadcast to all users in the room
      this.server.to(roomId).emit('participantsUpdate', {
        sessionId: roomId,
        participants: participants,
      });
    }
  }
}
