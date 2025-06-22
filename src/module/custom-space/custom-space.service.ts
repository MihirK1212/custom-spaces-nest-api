import {
    Injectable,
    InternalServerErrorException,
    NotFoundException
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

@Injectable()
export class CustomSpaceService {
    constructor(
        @InjectModel(CustomSpace.name)
        private customSpaceModel: Model<CustomSpace>,
        @InjectModel(Widget.name) private widgetModel: Model<Widget>,
        @InjectModel(SpacePermission.name)
        private permissionModel: Model<SpacePermission>
    ) {}

    async createSpaceWithWidgets(
        userId: string,
        dto: CreateCustomSpaceWithWidgetsDto
    ): Promise<CustomSpace> {
        const session = await this.customSpaceModel.db.startSession();
        session.startTransaction();

        try {
            // 1. Create the space
            const createdSpace = await this.customSpaceModel.create(
                [
                    {
                        name: dto.name,
                        description: dto.description,
                        widgets: []
                    }
                ],
                { session }
            );

            const space = createdSpace[0];

            // 2. Add permission
            const permission = await this.permissionModel.create(
                [
                    {
                        userId: userId,
                        space: space._id,
                        role: UserSpacePermissionRole.OWNER
                    }
                ],
                { session }
            );

            // Link permission to the space
            space.permissions.push(permission[0]._id);

            // 3. Create widgets and attach them to the space
            const widgetsToInsert = dto.widgets.map((widget) => ({
                ...widget,
                space: space._id
            }));

            const widgets = await this.widgetModel.insertMany(widgetsToInsert, {
                session
            });

            const widgetIds = widgets.map((w) => w._id);

            // 4. Link widgets to space
            space.widgets = widgetIds;
            await space.save({ session });

            // 5. Commit
            await session.commitTransaction();
            return space;
        } catch (error) {
            await session.abortTransaction();
            throw new InternalServerErrorException(
                `Failed to create space with widgets ${error}`
            );
        } finally {
            session.endSession();
        }
    }

    async getUniqueSpacesForUser(userId: string): Promise<CustomSpace[]> {
        // Step 1: Fetch all permissions for the user
        const userPermissions = await this.permissionModel
            .find({ userId: [userId, '*'] })
            .lean();

        // Step 2: Extract unique space IDs
        const uniqueSpaceIds = [
            ...new Set(userPermissions.map((p) => p.space.toString()))
        ];

        if (uniqueSpaceIds.length === 0) {
            return [];
        }

        // Step 3: Fetch and return spaces
        const spaces = await this.customSpaceModel
            .find({ _id: { $in: uniqueSpaceIds } })
            .lean()
            .populate('widgets')
            .populate('permissions');

        return spaces;
    }

    async hasUserRoleInSpace(
        userId: string,
        spaceId: string,
        role: string
    ): Promise<boolean> {
        const permission = await this.permissionModel
            .findOne({
                userId,
                space: spaceId,
                role
            })
            .lean();

        return !!permission;
    }

    async updateCustomSpace(spaceId: string, updateDto: UpdateCustomSpaceDto) {
        return this.customSpaceModel.findByIdAndUpdate(spaceId, updateDto, {
            new: true
        });
    }

    async deleteCustomSpace(spaceId: string) {
        await this.customSpaceModel.findByIdAndDelete(spaceId);
        await this.widgetModel.deleteMany({ space: spaceId });
        await this.permissionModel.deleteMany({ space: spaceId });
    }

    async addWidgetToSpace(
        spaceId: string,
        createWidgetDto: CreateWidgetDto
    ): Promise<Widget> {
        const newWidget = new this.widgetModel({
            space: spaceId,
            ...createWidgetDto
        });
        const savedWidget = await newWidget.save();

        await this.customSpaceModel.findByIdAndUpdate(spaceId, {
            $addToSet: { widgets: savedWidget._id }
        });
        return savedWidget;
    }

    async removeWidgetFromSpace(widgetId: string): Promise<void> {
        const widget = await this.widgetModel.findById(widgetId);
        if (!widget) throw new NotFoundException('Widget not found');

        await this.customSpaceModel.findByIdAndUpdate(widget.space, {
            $pull: { widgets: widget._id }
        });

        await this.widgetModel.findByIdAndDelete(widgetId);
    }

    async updateWidget(
        widgetId: string,
        updateWidgetDto: UpdateWidgetDto
    ): Promise<Widget> {
        const updatedWidget = await this.widgetModel.findByIdAndUpdate(
            widgetId,
            { $set: updateWidgetDto },
            { new: true }
        );
        if (!updatedWidget) throw new NotFoundException('Widget not found');
        return updatedWidget;
    }

    // async getSpacesGroupedByPermission(
    //     userId: string
    // ): Promise<Record<string, CustomSpace[]>> {
    //     const userPermissions = await this.permissionModel
    //         .find({ userId: [userId, '*'] })
    //         .lean();

    //     const permissionMap: Record<string, Types.ObjectId[]> = {};
    //     for (const perm of userPermissions) {
    //         if (!permissionMap[perm.role]) {
    //             permissionMap[perm.role] = [];
    //         }
    //         permissionMap[perm.role].push(perm.space);
    //     }

    //     // Step 3: For each role, fetch the corresponding spaces
    //     const result: Record<string, CustomSpace[]> = {};
    //     for (const [role, spaceIds] of Object.entries(permissionMap)) {
    //         const spaces = await this.customSpaceModel
    //             .find({ _id: { $in: spaceIds } })
    //             .lean()
    //             .populate('widgets')
    //             .populate('permissions');
    //         result[role] = spaces;
    //     }

    //     return result;
    // }

    // async getCustomSpaceById(spaceId: string) {
    //     return this.customSpaceModel
    //         .findById(spaceId)
    //         .populate('widgets')
    //         .populate('permissions')
    //         .exec();
    // }

    // async createCustomSpace(userId: string, createDto: CreateCustomSpaceDto) {
    //     const created = new this.customSpaceModel(createDto);
    //     const newCustomSpace = await created.save();
    //     await this.addPermission(
    //         newCustomSpace.id,
    //         userId,
    //         UserSpacePermissionRole.OWNER
    //     );
    //     return newCustomSpace;
    // }

    // async getCustomSpacesWithPermissions(spaceId: string) {
    //     return this.customSpaceModel
    //         .findById(spaceId)
    //         .populate('widgets')
    //         .populate('permissions')
    //         .exec();
    // }

    // async addPermission(
    //     spaceId: string,
    //     userId: string,
    //     role: UserSpacePermissionRole
    // ) {
    //     const permission = new this.permissionModel({
    //         space: spaceId,
    //         userId,
    //         role
    //     });
    //     await permission.save();
    //     await this.customSpaceModel.findByIdAndUpdate(spaceId, {
    //         $addToSet: { permissions: permission._id }
    //     });
    //     return permission;
    // }

    // async updatePermission(
    //     permissionId: string,
    //     role: UserSpacePermissionRole
    // ) {
    //     return this.permissionModel.findByIdAndUpdate(
    //         permissionId,
    //         { role },
    //         { new: true }
    //     );
    // }

    // async removePermission(permissionId: string) {
    //     const permission =
    //         await this.permissionModel.findByIdAndDelete(permissionId);
    //     if (permission) {
    //         await this.customSpaceModel.findByIdAndUpdate(permission.space, {
    //             $pull: { permissions: permission._id }
    //         });
    //     }
    //     return permission;
    // }
}
