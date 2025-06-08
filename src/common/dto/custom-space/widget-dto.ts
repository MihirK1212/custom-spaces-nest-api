import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { WidgetType } from 'src/common/enums/widget-type.enum';


export class CreateWidgetDto {
  @ApiProperty({ description: 'Widget Type', example: 'money_split' })
  @IsString()
  @IsNotEmpty()
  widgetType: WidgetType;

  @ApiProperty({ description: 'Widget Display Name', example: 'Holiday Money Split' })
  @IsString()
  displayName?: string;

  @ApiProperty({ description: 'Widget Description', example: 'Holiday Money Split' })
  @IsString()
  description?: string;
}


export class UpdateWidgetDto {
  @ApiProperty({ description: 'Widget Type', example: 'money_split' })
  @IsString()
  widgetType?: WidgetType;

  @ApiProperty({ description: 'Widget Display Name', example: 'Holiday Money Split' })
  @IsString()
  displayName?: string;

  @ApiProperty({ description: 'Widget Description', example: 'Holiday Money Split' })
  @IsString()
  description?: string;
}
