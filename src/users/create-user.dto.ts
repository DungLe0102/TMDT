import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsIn } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({
        example: 'john@example.com',
        description: 'Email người dùng',
    })
    @IsNotEmpty({ message: 'Email không được để trống' })
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    email: string;

    @ApiProperty({
        example: '123456',
        description: 'Mật khẩu (tối thiểu 6 ký tự)',
        minLength: 6,
    })
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    password: string;

    @ApiProperty({
        example: 'customer',
        description: 'Vai trò người dùng',
        enum: ['admin', 'customer'],
        default: 'customer',
    })
    @IsNotEmpty({ message: 'Vai trò không được để trống' })
    @IsIn(['admin', 'customer'], { message: 'Vai trò chỉ có thể là admin hoặc customer' })
    role: string;
}
