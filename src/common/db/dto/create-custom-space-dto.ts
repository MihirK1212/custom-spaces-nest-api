import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateCustomSpaceDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;
}