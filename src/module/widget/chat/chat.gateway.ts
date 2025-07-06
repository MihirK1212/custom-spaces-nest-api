import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
    OnGatewayConnection
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateMessageDto } from '../../../common/dto/widget/chat/create-message.dto';

@WebSocketGateway({
    cors: {
        origin: '*'
    }
})
export class ChatGateway implements OnGatewayConnection {
    @WebSocketServer()
    server: Server;

    constructor(private readonly chatService: ChatService) {}

    // Handle new client connections
    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    // Handle clients joining a chat room based on widgetId
    @SubscribeMessage('joinRoom')
    handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody('widgetId') widgetId: string
    ) {
        client.join(widgetId);
        console.log(`Client ${client.id} joined room ${widgetId}`);
        client.emit('joinedRoom', `Successfully joined room ${widgetId}`);
    }

    // Handle new messages
    @SubscribeMessage('sendMessage')
    async handleMessage(
        @MessageBody() createMessageDto: CreateMessageDto
    ): Promise<void> {
        const message = await this.chatService.createMessage(createMessageDto);

        // Broadcast the new message to all clients in the specific widgetId room
        this.server.to(message.widgetId).emit('newMessage', message);
    }
}
