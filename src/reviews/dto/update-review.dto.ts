import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateReviewDto {
  @ApiPropertyOptional({
    example: 4,
    description: 'Điểm đánh giá cập nhật (1 đến 5)',
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsInt({ message: 'Điểm đánh giá phải là số nguyên' })
  @Min(1, { message: 'Điểm tối thiểu là 1 sao' })
  @Max(5, { message: 'Điểm tối đa là 5 sao' })
  rating?: number;

  @ApiPropertyOptional({
    example: 'Chất lượng ổn, giao hàng hơi chậm một chút.',
    description: 'Nội dung bình luận cập nhật',
  })
  @IsOptional()
  @IsString({ message: 'Nội dung bình luận phải là chuỗi ký tự' })
  comment?: string;
}
