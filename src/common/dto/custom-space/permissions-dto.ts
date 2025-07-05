import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { UserSpacePermissionRole } from "src/common/enums/user-space-permission-role.enum";


export class AddPermissionDto {
    @ApiProperty({ description: 'User ID', example: '123' })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({ description: 'Role', example: 'admin' })
    @IsString()
    @IsNotEmpty()
    role: UserSpacePermissionRole;
}

export class UpdatePermissionDto {
    @ApiProperty({ description: 'Role', example: 'admin' })
    @IsString()
    @IsNotEmpty()
    role: UserSpacePermissionRole;
}

