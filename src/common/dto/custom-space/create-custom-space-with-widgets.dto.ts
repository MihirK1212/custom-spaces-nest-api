import { IsString, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { WidgetType } from 'src/common/enums/widget-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWidgetInlineDto {
    @ApiProperty({ description: 'Widget Type', example: 'money_split' })
    @IsString()
    widgetType: WidgetType;

    @ApiProperty({
        description: 'Widget Display Name',
        example: 'Holiday Money Split'
    })
    @IsString()
    displayName?: string;

    @ApiProperty({
        description: 'Widget Description',
        example: 'Holiday Money Split'
    })
    @IsString()
    description?: string;
}

export class CreateCustomSpaceWithWidgetsDto {
    @ApiProperty({
        description: 'Custom Space Name',
        example: 'Summer Vacation'
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'Custom Space Description',
        example: 'Planning for Summer Vacation'
    })
    @IsString()
    description?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateWidgetInlineDto)
    widgets: CreateWidgetInlineDto[];
}
