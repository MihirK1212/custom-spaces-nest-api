// This gaurd is used to check if the user has the required permission to access the custom space 
// it will take the allowed roles as a parameter and check if the user has one of the allowed roles 
// the user Id will be taken from the jwt token

import { CustomSpaceService } from "src/module/custom-space/custom-space.service";
import { UserSpacePermissionRole } from "../enums/user-space-permission-role.enum";
import { CanActivate, ExecutionContext, Injectable, SetMetadata, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

export const CUSTOM_SPACE_PERMISSION_GAURD_KEY = 'customSpacePermissionGaurd';
export const SetCustomSpaceAllowedRoles = (allowedRoles: UserSpacePermissionRole[]) => SetMetadata(CUSTOM_SPACE_PERMISSION_GAURD_KEY, allowedRoles);

@Injectable()
export class CustomSpacePermissionGaurd implements CanActivate {
    constructor(private readonly customSpaceService: CustomSpaceService, private readonly reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        const allowedRoles = this.reflector.get<UserSpacePermissionRole[]>(
            CUSTOM_SPACE_PERMISSION_GAURD_KEY,
            context.getHandler()
        );
        
        // Handle case where widgetId exists but spaceId doesn't
        if (request.params.widgetId && !request.params.spaceId) {
            // Get the spaceId from the widget
            const widget = await this.customSpaceService.getWidgetById(request.params.widgetId);
            if (!widget) {
                throw new UnauthorizedException('Widget not found');
            }
            request.params.spaceId = widget.space._id.toString();
        }

        // Handle the case where permissionId exists but spaceId doesn't
        if (request.params.permissionId && !request.params.spaceId) {
            // Get the spaceId from the permission
            const permission = await this.customSpaceService.getPermissionById(request.params.permissionId);
            request.params.spaceId = permission.space._id.toString();
        }

        console.log('user',user);
        console.log('allowedRoles',allowedRoles);
        console.log('spaceId',request.params.spaceId);
        console.log('widgetId',request.params.widgetId);
        
        // check for all roles
        for (const role of allowedRoles) {
            const hasPermission = await this.customSpaceService.hasUserRoleInSpace(user.userId, request.params.spaceId, role);
            if (hasPermission) {
                return true;
            }
        }
        throw new UnauthorizedException('You are not authorized to access this space');
    }
}