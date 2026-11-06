import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
    @ApiPropertyOptional({
        example: 'newpassword123',
        description: 'Mật khẩu mới (tùy chọn)',
        minLength: 6,
    })
    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;

    @ApiPropertyOptional({
        example: 'Xin chào, tôi là John Doe',
        description: 'Thông tin cá nhân / giới thiệu',
    })
    @IsOptional()
    @IsString()
    profile?: string;
}
