import { Controller, Get, Param, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PaginationDto } from '../../../common/dto/widget/chat/pagination.dto';

@Controller('api/widgets/chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':widgetId/messages')
  @UsePipes(new ValidationPipe({ transform: true })) // Enables validation and default values for PaginationDto
  getMessages(
    @Param('widgetId') widgetId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.chatService.getMessages(widgetId, paginationDto);
  }
}