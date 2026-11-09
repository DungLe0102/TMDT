import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    example: 5,
    description: 'Điểm đánh giá từ 1 đến 5 sao',
    minimum: 1,
    maximum: 5,
  })
  @IsNotEmpty({ message: 'Điểm đánh giá không được để trống' })
  @IsInt({ message: 'Điểm đánh giá phải là số nguyên' })
  @Min(1, { message: 'Điểm tối thiểu là 1 sao' })
  @Max(5, { message: 'Điểm tối đa là 5 sao' })
  rating: number;

  @ApiProperty({
    example: 'Sản phẩm dùng rất tốt, đóng gói cẩn thận!',
    description: 'Nội dung bình luận / đánh giá',
  })
  @IsNotEmpty({ message: 'Nội dung bình luận không được để trống' })
  @IsString({ message: 'Nội dung bình luận phải là chuỗi ký tự' })
  comment: string;
}

