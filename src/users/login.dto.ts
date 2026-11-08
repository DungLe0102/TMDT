import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email người dùng',
    })
    @IsNotEmpty({ message: 'Email không được để trống' })
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    email: string;

    @ApiProperty({
        example: '123456',
        description: 'Mật khẩu tài khoản (tối thiểu 6 ký tự)',
    })
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    password: string;
}
