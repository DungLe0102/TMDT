import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'a1b2c3d4e5f6',
    description: 'Mã token khôi phục nhận được qua Email',
  })
  @IsNotEmpty({ message: 'Token không được để trống' })
  @IsString({ message: 'Token phải là chuỗi' })
  token: string;

  @ApiProperty({
    example: 'newStrongPassword123',
    description: 'Mật khẩu mới (tối thiểu 6 ký tự)',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  newPassword: string;
}
