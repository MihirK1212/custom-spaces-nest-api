import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCustomSpaceDto } from 'src/common/data/dto/create-custom-space-dto';
import { CustomSpace } from 'src/common/data/entity/custom-space.schema';

@Injectable()
export class CustomSpaceService {
  constructor(
    @InjectModel(CustomSpace.name) private customSpaceModel: Model<CustomSpace>,
  ) {}
  async createCustomSpace(createCustomSpaceDto: CreateCustomSpaceDto) {
    const createdSpace = new this.customSpaceModel(createCustomSpaceDto);
    return createdSpace.save();
  }
}
