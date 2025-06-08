import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CustomSpaceService } from './custom-space.service';
import { CreateCustomSpaceDto } from 'src/common/dto/custom-space/custom-space-dto';
import { UpdateCustomSpaceDto } from 'src/common/dto/custom-space/custom-space-dto';
import {
  JWTUserAuthGaurd,
  StrictUserMatch,
} from 'src/common/middleware/jwt-user-auth.guard';
import {
  CreateWidgetDto,
  UpdateWidgetDto,
} from 'src/common/dto/custom-space/widget-dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserSpacePermissionRole } from 'src/common/enums/user-space-permission-role.enum';

@Controller('api/custom_space')
export class CustomSpaceController {
  constructor(private readonly service: CustomSpaceService) {}

  // -------- Space Management --------
  @UseGuards(JWTUserAuthGaurd)
  @ApiBearerAuth('access-token')
  @StrictUserMatch()
  @Post(':userId')
  create(@Param('userId') userId: string, @Body() dto: CreateCustomSpaceDto) {
    return this.service.createCustomSpace(userId, dto);
  }

  @UseGuards(JWTUserAuthGaurd)
  @ApiBearerAuth('access-token')
  @Get(':spaceId')
  get(@Param('spaceId') spaceId: string) {
    return this.service.getCustomSpaceById(spaceId);
  }

  @UseGuards(JWTUserAuthGaurd)
  @ApiBearerAuth('access-token')
  @Patch(':spaceId')
  update(@Param('spaceId') spaceId: string, @Body() dto: UpdateCustomSpaceDto) {
    return this.service.updateCustomSpace(spaceId, dto);
  }

  @UseGuards(JWTUserAuthGaurd)
  @ApiBearerAuth('access-token')
  @Delete(':spaceId')
  delete(@Param('spaceId') spaceId: string) {
    return this.service.deleteCustomSpace(spaceId);
  }

  // -------- Widget APIs --------
  @UseGuards(JWTUserAuthGaurd)
  @ApiBearerAuth('access-token')
  @Post(':spaceId/widgets')
  addWidgetToSpace(
    @Param('spaceId') spaceId: string,
    @Body() createWidgetDto: CreateWidgetDto,
  ) {
    return this.service.addWidgetToSpace(spaceId, createWidgetDto);
  }

  @UseGuards(JWTUserAuthGaurd)
  @ApiBearerAuth('access-token')
  @Patch('widgets/:widgetId')
  updateWidget(
    @Param('widgetId') widgetId: string,
    @Body() updateWidgetDto: UpdateWidgetDto,
  ) {
    return this.service.updateWidget(widgetId, updateWidgetDto);
  }

  @UseGuards(JWTUserAuthGaurd)
  @ApiBearerAuth('access-token')
  @Delete('widgets/:widgetId')
  removeWidget(@Param('widgetId') widgetId: string) {
    return this.service.removeWidgetFromSpace(widgetId);
  }

  // -------- Permission APIs --------
  @Post(':spaceId/permissions')
  addPermission(
    @Param('spaceId') spaceId: string,
    @Body() body: { userId: string; role: UserSpacePermissionRole },
  ) {
    return this.service.addPermission(spaceId, body.userId, body.role);
  }

  @Patch('permissions/:permissionId')
  updatePermission(
    @Param('permissionId') permissionId: string,
    @Body() body: { role: UserSpacePermissionRole },
  ) {
    return this.service.updatePermission(permissionId, body.role);
  }

  @Delete('permissions/:permissionId')
  removePermission(@Param('permissionId') permissionId: string) {
    return this.service.removePermission(permissionId);
  }
}
