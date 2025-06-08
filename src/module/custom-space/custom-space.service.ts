import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCustomSpaceDto } from 'src/common/dto/custom-space/custom-space-dto';
import { UpdateCustomSpaceDto } from 'src/common/dto/custom-space/custom-space-dto';
import { CustomSpace } from 'src/common/entity/custom-space/custom-space.schema';
import { SpacePermission } from 'src/common/entity/custom-space/space-permission.schema';
import { Widget } from 'src/common/entity/custom-space/widget.schema';
import { CreateWidgetDto, UpdateWidgetDto } from 'src/common/dto/custom-space/widget-dto';
import { UserSpacePermissionRole } from 'src/common/enums/user-space-permission-role.enum';

@Injectable()
export class CustomSpaceService {
  constructor(
    @InjectModel(CustomSpace.name) private customSpaceModel: Model<CustomSpace>,
    @InjectModel(Widget.name) private widgetModel: Model<Widget>,
    @InjectModel(SpacePermission.name)
    private permissionModel: Model<SpacePermission>,
  ) {}

  async createCustomSpace(userId:string, createDto: CreateCustomSpaceDto) {
    const created = new this.customSpaceModel(createDto);
    const newCustomSpace = await created.save();
    await this.addPermission(newCustomSpace.id, userId, UserSpacePermissionRole.OWNER);
    return newCustomSpace
  }

  async getCustomSpaceById(spaceId: string) {
    return this.customSpaceModel
      .findById(spaceId)
      .populate('widgets')
      .populate('permissions')
      .exec();
  }

  async updateCustomSpace(spaceId: string, updateDto: UpdateCustomSpaceDto) {
    return this.customSpaceModel.findByIdAndUpdate(spaceId, updateDto, {
      new: true,
    });
  }

  async deleteCustomSpace(spaceId: string) {
    await this.customSpaceModel.findByIdAndDelete(spaceId);
    await this.widgetModel.deleteMany({ space: spaceId });
    await this.permissionModel.deleteMany({ space: spaceId });
  }

  // ---------------- Widgets ----------------
  async addWidgetToSpace(
    spaceId: string,
    createWidgetDto: CreateWidgetDto,
  ): Promise<Widget> {
    const newWidget = new this.widgetModel({
        space: spaceId,
        ...createWidgetDto
    });
    const savedWidget = await newWidget.save();

    await this.customSpaceModel.findByIdAndUpdate(spaceId, {
      $addToSet: { widgets: savedWidget._id },
    });
    return savedWidget;
  }

  async removeWidgetFromSpace(widgetId: string): Promise<void> {
    const widget = await this.widgetModel.findById(widgetId);
    if (!widget) throw new NotFoundException('Widget not found');

    await this.customSpaceModel.findByIdAndUpdate(widget.space, {
      $pull: { widgets: widget._id },
    });

    await this.widgetModel.findByIdAndDelete(widgetId);
  }

  async updateWidget(
    widgetId: string,
    updateWidgetDto: UpdateWidgetDto,
  ): Promise<Widget> {
    const updatedWidget = await this.widgetModel.findByIdAndUpdate(
      widgetId,
      { $set: updateWidgetDto },
      { new: true },
    );
    if (!updatedWidget) throw new NotFoundException('Widget not found');
    return updatedWidget;
  }

  // ---------------- Permissions ----------------
  async addPermission(spaceId: string, userId: string, role: UserSpacePermissionRole) {
    const permission = new this.permissionModel({
      space: spaceId,
      userId,
      role,
    });
    await permission.save();
    await this.customSpaceModel.findByIdAndUpdate(spaceId, {
      $addToSet: { permissions: permission._id },
    });
    return permission;
  }

  async updatePermission(permissionId: string, role: UserSpacePermissionRole) {
    return this.permissionModel.findByIdAndUpdate(
      permissionId,
      { role },
      { new: true },
    );
  }

  async removePermission(permissionId: string) {
    const permission =
      await this.permissionModel.findByIdAndDelete(permissionId);
    if (permission) {
      await this.customSpaceModel.findByIdAndUpdate(permission.space, {
        $pull: { permissions: permission._id },
      });
    }
    return permission;
  }
}
