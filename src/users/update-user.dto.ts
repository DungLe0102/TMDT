import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
    @ApiPropertyOptional({
        example: 'newpassword123',
        description: 'Mật khẩu mới (tùy chọn)',
        minLength: 6,
    })
    @IsOptional()
    @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    password?: string;

    @ApiPropertyOptional({
        example: 'Xin chào, tôi là John Doe',
        description: 'Thông tin cá nhân / giới thiệu',
    })
    @IsOptional()
    @IsString({ message: 'Thông tin giới thiệu phải là chuỗi ký tự' })
    profile?: string;
}
