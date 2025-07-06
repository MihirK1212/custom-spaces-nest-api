import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { Message } from '../../../common/entity/widget/chat/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}