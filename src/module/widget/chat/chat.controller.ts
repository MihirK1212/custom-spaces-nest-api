import { Controller, Get, Param, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PaginationDto } from '../../../common/dto/widget/chat/pagination.dto';
import { UserSpacePermissionRole } from 'src/common/enums/user-space-permission-role.enum';
import { UseGuards } from '@nestjs/common';
import { JWTUserAuthGaurd } from 'src/common/middleware/jwt-user-auth.guard';
import { CustomSpacePermissionGaurd, SetCustomSpaceAllowedRoles } from 'src/common/middleware/custom-space-permission-gaurd';

@Controller('api/widgets/chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JWTUserAuthGaurd, CustomSpacePermissionGaurd)
  @SetCustomSpaceAllowedRoles([
      UserSpacePermissionRole.READ,
      UserSpacePermissionRole.OWNER,
      UserSpacePermissionRole.ADMIN,
      UserSpacePermissionRole.WRITE
  ])
  @Get(':widgetId/messages')
  @UsePipes(new ValidationPipe({ transform: true })) // Enables validation and default values for PaginationDto
  getMessages(
    @Param('widgetId') widgetId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.chatService.getMessages(widgetId, paginationDto);
  }
}