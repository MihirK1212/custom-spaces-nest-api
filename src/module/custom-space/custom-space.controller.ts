import { Body, Controller, Post } from '@nestjs/common';
import { CustomSpaceService } from './custom-space.service';
import { CreateCustomSpaceDto } from 'src/common/data/dto/create-custom-space-dto';

@Controller('api/custom_space')
export class CustomSpaceController {
  constructor(private readonly customSpaceService: CustomSpaceService) {}

  @Post()
  async createCustomSpace(@Body() createCustomSpaceDto: CreateCustomSpaceDto) {
    return this.customSpaceService.createCustomSpace(createCustomSpaceDto);
  }
}
