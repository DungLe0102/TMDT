import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @ApiPropertyOptional({
    example: 'Khuyến mãi đặc biệt',
    description: 'Tiêu đề thông báo',
  })
  @IsOptional()
  @IsString({ message: 'Tiêu đề thông báo phải là chuỗi ký tự' })
  title?: string;

  @ApiProperty({
    example: 'Giảm giá 20% cho đơn hàng tiếp theo!',
    description: 'Nội dung thông báo',
  })
  @IsNotEmpty({ message: 'Nội dung thông báo không được để trống' })
  @IsString({ message: 'Nội dung thông báo phải là chuỗi ký tự' })
  message: string;
}
