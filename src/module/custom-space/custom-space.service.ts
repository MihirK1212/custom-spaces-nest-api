import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    BadRequestException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCustomSpaceDto } from 'src/common/dto/custom-space/custom-space-dto';
import { UpdateCustomSpaceDto } from 'src/common/dto/custom-space/custom-space-dto';
import { CustomSpace } from 'src/common/entity/custom-space/custom-space.schema';
import { SpacePermission } from 'src/common/entity/custom-space/space-permission.schema';
import { Widget } from 'src/common/entity/custom-space/widget.schema';
import {
    CreateWidgetDto,
    UpdateWidgetDto
} from 'src/common/dto/custom-space/widget-dto';
import { UserSpacePermissionRole } from 'src/common/enums/user-space-permission-role.enum';
import { CreateCustomSpaceWithWidgetsDto } from 'src/common/dto/custom-space/create-custom-space-with-widgets.dto';
import { UserService } from '../user/user.service';
import {
    SpacePermissionWithUser,
    SpaceCreationResult
} from 'src/common/interface/custom-space.interface';
import { User } from 'src/common/entity/user/user.model';

@Injectable()
export class CustomSpaceService {
    constructor(
        @InjectModel(CustomSpace.name)
        private readonly customSpaceModel: Model<CustomSpace>,
        @InjectModel(Widget.name)
        private readonly widgetModel: Model<Widget>,
        @InjectModel(SpacePermission.name)
        private readonly permissionModel: Model<SpacePermission>,
        private readonly userService: UserService
    ) {}

    async createSpaceWithWidgets(
        userId: string,
        dto: CreateCustomSpaceWithWidgetsDto
    ): Promise<CustomSpace> {
        const session = await this.customSpaceModel.db.startSession();
        session.startTransaction();

        try {
            const result = await this._createSpaceWithWidgetsInternal(
                userId,
                dto,
                session
            );
            await session.commitTransaction();
            return result.space;
        } catch (error) {
            await session.abortTransaction();
            throw new InternalServerErrorException(
                `Failed to create space with widgets: ${error.message}`
            );
        } finally {
            session.endSession();
        }
    }

    private async _createSpaceWithWidgetsInternal(
        userId: string,
        dto: CreateCustomSpaceWithWidgetsDto,
        session: any
    ): Promise<SpaceCreationResult> {
        // Validate input
        if (!userId || !dto.name) {
            throw new BadRequestException(
                'User ID and space name are required'
            );
        }

        // Create the space
        const [createdSpace] = await this.customSpaceModel.create(
            [
                {
                    name: dto.name,
                    description: dto.description,
                    widgets: [],
                    permissions: []
                }
            ],
            { session }
        );

        // Create owner permission
        const [permission] = await this.permissionModel.create(
            [
                {
                    userId,
                    space: createdSpace._id,
                    role: UserSpacePermissionRole.OWNER
                }
            ],
            { session }
        );

        // Link permission to space
        createdSpace.permissions.push(permission._id);

        // Create widgets if provided
        let widgets: Widget[] = [];
        if (dto.widgets && dto.widgets.length > 0) {
            const widgetsToInsert = dto.widgets.map((widget) => ({
                ...widget,
                space: createdSpace._id
            }));

            widgets = await this.widgetModel.insertMany(widgetsToInsert, {
                session
            });
            const widgetIds = widgets.map((widget) => (widget as any)._id);
            createdSpace.widgets = widgetIds;
        }

        // Save the updated space
        await createdSpace.save({ session });

        return { space: createdSpace, widgets, permission };
    }

    async getUniqueSpacesForUser(userId: string): Promise<CustomSpace[]> {
        if (!userId) {
            throw new BadRequestException('User ID is required');
        }

        // Fetch all permissions for the user (including wildcard permissions)
        const userPermissions = await this.permissionModel
            .find({ userId: { $in: [userId, '*'] } })
            .lean();

        if (userPermissions.length === 0) {
            return [];
        }

        // Extract unique space IDs
        const uniqueSpaceIds = [
            ...new Set(
                userPermissions.map((permission) => permission.space.toString())
            )
        ];

        // Fetch and return spaces with populated widgets and permissions
        return this.customSpaceModel
            .find({ _id: { $in: uniqueSpaceIds } })
            .lean()
            .populate('widgets')
            .populate('permissions');
    }

    async hasUserRoleInSpace(
        userId: string,
        spaceId: string,
        role: UserSpacePermissionRole
    ): Promise<boolean> {
        if (!userId || !spaceId || !role) {
            return false;
        }

        const permission = await this.permissionModel
            .findOne({
                userId,
                space: new Types.ObjectId(spaceId),
                role
            })
            .lean();

        return !!permission;
    }

    async updateCustomSpace(
        spaceId: string,
        updateDto: UpdateCustomSpaceDto
    ): Promise<CustomSpace> {
        if (!spaceId) {
            throw new BadRequestException('Space ID is required');
        }

        const updatedSpace = await this.customSpaceModel.findByIdAndUpdate(
            spaceId,
            updateDto,
            { new: true, runValidators: true }
        );

        if (!updatedSpace) {
            throw new NotFoundException(`Space with ID ${spaceId} not found`);
        }

        return updatedSpace;
    }

    async deleteCustomSpace(spaceId: string): Promise<void> {
        if (!spaceId) {
            throw new BadRequestException('Space ID is required');
        }

        const space = await this.customSpaceModel.findById(spaceId);
        if (!space) {
            throw new NotFoundException(`Space with ID ${spaceId} not found`);
        }

        // Delete in parallel for better performance
        await Promise.all([
            this.customSpaceModel.findByIdAndDelete(spaceId),
            this.widgetModel.deleteMany({ space: spaceId }),
            this.permissionModel.deleteMany({ space: spaceId })
        ]);
    }

    async addWidgetToSpace(
        spaceId: string,
        createWidgetDto: CreateWidgetDto
    ): Promise<Widget> {
        if (!spaceId) {
            throw new BadRequestException('Space ID is required');
        }

        // Verify space exists
        const space = await this.customSpaceModel.findById(spaceId);
        if (!space) {
            throw new NotFoundException(`Space with ID ${spaceId} not found`);
        }

        const newWidget = new this.widgetModel({
            space: spaceId,
            ...createWidgetDto
        });

        const savedWidget = await newWidget.save();

        // Add widget to space
        await this.customSpaceModel.findByIdAndUpdate(spaceId, {
            $addToSet: { widgets: (savedWidget as any)._id }
        });

        return savedWidget;
    }

    async removeWidgetFromSpace(widgetId: string): Promise<void> {
        if (!widgetId) {
            throw new BadRequestException('Widget ID is required');
        }

        const widget = await this.widgetModel.findById(widgetId);
        if (!widget) {
            throw new NotFoundException(`Widget with ID ${widgetId} not found`);
        }

        // Remove widget from space and delete widget in parallel
        await Promise.all([
            this.customSpaceModel.findByIdAndUpdate(widget.space, {
                $pull: { widgets: (widget as any)._id }
            }),
            this.widgetModel.findByIdAndDelete(widgetId)
        ]);
    }

    async updateWidget(
        widgetId: string,
        updateWidgetDto: UpdateWidgetDto
    ): Promise<Widget> {
        if (!widgetId) {
            throw new BadRequestException('Widget ID is required');
        }

        const updatedWidget = await this.widgetModel.findByIdAndUpdate(
            widgetId,
            { $set: updateWidgetDto },
            { new: true, runValidators: true }
        );

        if (!updatedWidget) {
            throw new NotFoundException(`Widget with ID ${widgetId} not found`);
        }

        return updatedWidget;
    }

    async getPermissionsForSpace(
        spaceId: string
    ): Promise<SpacePermissionWithUser[]> {
        if (!spaceId) {
            throw new BadRequestException('Space ID is required');
        }

        const permissions = await this.permissionModel.find({
            space: new Types.ObjectId(spaceId)
        });

        const permissionsWithUsers = await Promise.all(
            permissions.map(async (permission) => {
                try {
                    const user = await this.userService.getUser({
                        where: { id: permission.userId }
                    });

                    return {
                        permissionId: permission._id.toString(),
                        user: {
                            userId: permission.userId,
                            username: user.username,
                            email: user.email,
                            profilePictureUrl: user.profilePictureUrl
                        },
                        role: permission.role
                    };
                } catch (error) {
                    return null;
                }
            })
        );

        return permissionsWithUsers;
    }

    async addPermission(
        spaceId: string,
        userId: string,
        role: UserSpacePermissionRole
    ): Promise<SpacePermission> {
        if (!spaceId || !userId || !role) {
            throw new BadRequestException(
                'Space ID, user ID, and role are required'
            );
        }

        // Verify space exists
        const space = await this.customSpaceModel.findById(spaceId);
        if (!space) {
            throw new NotFoundException(`Space with ID ${spaceId} not found`);
        }

        // Check if permission already exists
        const existingPermission = await this.permissionModel.findOne({
            space: new Types.ObjectId(spaceId),
            userId
        });

        if (existingPermission) {
            throw new BadRequestException(
                `Permission already exists for user ${userId} in space ${spaceId}`
            );
        }

        const permission = new this.permissionModel({
            space: new Types.ObjectId(spaceId),
            userId,
            role
        });

        await permission.save();

        // Add permission to space
        await this.customSpaceModel.findByIdAndUpdate(spaceId, {
            $addToSet: { permissions: (permission as any)._id }
        });

        return permission;
    }

    async updatePermission(
        permissionId: string,
        role: UserSpacePermissionRole
    ): Promise<SpacePermission> {
        if (!permissionId || !role) {
            throw new BadRequestException(
                'Permission ID and role are required'
            );
        }

        const updatedPermission = await this.permissionModel.findByIdAndUpdate(
            permissionId,
            { role },
            { new: true, runValidators: true }
        );

        if (!updatedPermission) {
            throw new NotFoundException(
                `Permission with ID ${permissionId} not found`
            );
        }

        return updatedPermission;
    }

    async removePermission(
        permissionId: string
    ): Promise<SpacePermission | null> {
        if (!permissionId) {
            throw new BadRequestException('Permission ID is required');
        }

        const permission =
            await this.permissionModel.findByIdAndDelete(permissionId);

        if (permission) {
            // Remove permission from space
            await this.customSpaceModel.findByIdAndUpdate(permission.space, {
                $pull: { permissions: (permission as any)._id }
            });
        }

        return permission;
    }

    async getValidUsersForWidget(
        widgetId: string,
        roles: UserSpacePermissionRole[]
    ): Promise<User[]> {
        const widget = await this.widgetModel
            .findById(widgetId)
            .populate('space');
        if (!widget) {
            throw new NotFoundException(`Widget with ID ${widgetId} not found`);
        }
        const space = widget.space;
        const permissions = await this.permissionModel.find({
            space: space._id
        });
        const validUsers = permissions
            .filter((permission) => roles.includes(permission.role))
            .map((permission) => permission.userId);
        const users = await Promise.all(
            validUsers.map((userId) =>
                this.userService.getUser({ where: { id: userId } })
            )
        );
        return users.filter((user) => user !== null);
    }

    async getWidgetById(widgetId: string): Promise<Widget> {
        return this.widgetModel.findById(widgetId).populate('space');
    }

    async getPermissionById(permissionId: string): Promise<SpacePermission> {
        return this.permissionModel.findById(permissionId).populate('space');
    }
}
