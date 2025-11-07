import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { Message } from '../../../common/entity/widget/chat/message.entity';
import { AuthModule } from 'src/module/auth/auth.module';
import { UserModule } from 'src/module/user/user.module';
import { forwardRef } from '@nestjs/common';
import { CustomSpaceModule } from 'src/module/custom-space/custom-space.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Message]),
        forwardRef(() => AuthModule),
        UserModule,
        CustomSpaceModule
    ],
    controllers: [ChatController],
    providers: [ChatService, ChatGateway]
})
export class ChatModule {}
