import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards
} from '@nestjs/common';
import { CustomSpaceService } from './custom-space.service';
import { CreateCustomSpaceDto } from 'src/common/dto/custom-space/custom-space-dto';
import { UpdateCustomSpaceDto } from 'src/common/dto/custom-space/custom-space-dto';
import {
    JWTUserAuthGaurd,
    StrictUserMatch
} from 'src/common/middleware/jwt-user-auth.guard';
import {
    CreateWidgetDto,
    UpdateWidgetDto
} from 'src/common/dto/custom-space/widget-dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserSpacePermissionRole } from 'src/common/enums/user-space-permission-role.enum';
import { CreateCustomSpaceWithWidgetsDto } from 'src/common/dto/custom-space/create-custom-space-with-widgets.dto';

@Controller('api/custom_space')
export class CustomSpaceController {
    constructor(private readonly service: CustomSpaceService) {}

    @ApiOperation({ summary: 'Create custom space with widgets' })
    @UseGuards(JWTUserAuthGaurd)
    @ApiBearerAuth('access-token')
    @StrictUserMatch()
    @Post(':userId/full-create')
    createSpaceWithWidgets(
        @Param('userId') userId: string,
        @Body() dto: CreateCustomSpaceWithWidgetsDto
    ) {
        return this.service.createSpaceWithWidgets(userId, dto);
    }

    @ApiOperation({ summary: 'Get all spaces for user' })
    @UseGuards(JWTUserAuthGaurd)
    @ApiBearerAuth('access-token')
    @StrictUserMatch()
    @Get(':userId')
    getSpacesForUser(@Param('userId') userId: string) {
        return this.service.getUniqueSpacesForUser(userId);
    }

    @ApiOperation({ summary: 'Update custom space metadata' })
    @UseGuards(JWTUserAuthGaurd)
    @ApiBearerAuth('access-token')
    @Patch(':spaceId')
    updateCustomSpace(
        @Param('spaceId') spaceId: string,
        @Body() dto: UpdateCustomSpaceDto
    ) {
        return this.service.updateCustomSpace(spaceId, dto);
    }

    @ApiOperation({ summary: 'Delete custom space' })
    @UseGuards(JWTUserAuthGaurd)
    @ApiBearerAuth('access-token')
    @Delete(':spaceId')
    deleteCustomSpace(@Param('spaceId') spaceId: string) {
        return this.service.deleteCustomSpace(spaceId);
    }

    @ApiOperation({ summary: 'Add Widget to custom space' })
    @UseGuards(JWTUserAuthGaurd)
    @ApiBearerAuth('access-token')
    @Post(':spaceId/widget')
    addWidgetToSpace(
        @Param('spaceId') spaceId: string,
        @Body() dto: CreateWidgetDto
    ) {
        return this.service.addWidgetToSpace(spaceId, dto);
    }

    @ApiOperation({ summary: 'Delete Widget from custom space' })
    @UseGuards(JWTUserAuthGaurd)
    @ApiBearerAuth('access-token')
    @Delete('widget/:widgetId')
    removeWidgetFromSpace(@Param('widgetId') widgetId: string) {
        return this.service.removeWidgetFromSpace(widgetId);
    }

    @UseGuards(JWTUserAuthGaurd)
    @ApiBearerAuth('access-token')
    @Patch('widget/:widgetId')
    updateWidget(
        @Param('widgetId') widgetId: string,
        @Body() updateWidgetDto: UpdateWidgetDto
    ) {
        return this.service.updateWidget(widgetId, updateWidgetDto);
    }

    // @UseGuards(JWTUserAuthGaurd)
    // @ApiBearerAuth('access-token')
    // @StrictUserMatch()
    // @Post(':userId')
    // create(@Param('userId') userId: string, @Body() dto: CreateCustomSpaceDto) {
    //     return this.service.createCustomSpace(userId, dto);
    // }

    // @UseGuards(JWTUserAuthGaurd)
    // @ApiBearerAuth('access-token')
    // @Get(':spaceId')
    // get(@Param('spaceId') spaceId: string) {
    //     return this.service.getCustomSpaceById(spaceId);
    // }

    // @Post(':spaceId/permissions')
    // addPermission(
    //     @Param('spaceId') spaceId: string,
    //     @Body() body: { userId: string; role: UserSpacePermissionRole }
    // ) {
    //     return this.service.addPermission(spaceId, body.userId, body.role);
    // }

    // @Patch('permissions/:permissionId')
    // updatePermission(
    //     @Param('permissionId') permissionId: string,
    //     @Body() body: { role: UserSpacePermissionRole }
    // ) {
    //     return this.service.updatePermission(permissionId, body.role);
    // }

    // @Delete('permissions/:permissionId')
    // removePermission(@Param('permissionId') permissionId: string) {
    //     return this.service.removePermission(permissionId);
    // }
}
