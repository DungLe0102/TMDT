import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsIn } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({
        example: 'john@example.com',
        description: 'Email người dùng',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: '123456',
        description: 'Mật khẩu (tối thiểu 6 ký tự)',
        minLength: 6,
    })
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiProperty({
        example: 'customer',
        description: 'Vai trò người dùng',
        enum: ['admin', 'customer'],
        default: 'customer',
    })
    @IsNotEmpty()
    @IsIn(['admin', 'customer'])
    role: string;
}
