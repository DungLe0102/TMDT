import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email người dùng',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: '123456',
        description: 'Mật khẩu tài khoản (tối thiểu 6 ký tự)',
    })
    @IsNotEmpty()
    password: string;
}

