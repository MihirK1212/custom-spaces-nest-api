import { CustomSpace } from "../entity/custom-space/custom-space.schema";
import { Widget } from "../entity/custom-space/widget.schema";
import { UserSpacePermissionRole } from "../enums/user-space-permission-role.enum";
import { SpacePermission } from "../entity/custom-space/space-permission.schema";


export interface SpacePermissionWithUser {
    permissionId: string;
    user: {
        userId: string;
        username: string;
        email: string | null;
        profilePictureUrl: string | null;
    };
    role: UserSpacePermissionRole;
}

export interface SpaceCreationResult {
    space: CustomSpace;
    widgets: Widget[];
    permission: SpacePermission;
}
