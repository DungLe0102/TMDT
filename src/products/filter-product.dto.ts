import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class FilterProductDto {
  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm theo tên hoặc mô tả sản phẩm' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ description: 'Lọc theo ID danh mục' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;

  @ApiPropertyOptional({ description: 'Giá tối thiểu' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Giá tối đa' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Đánh giá tối thiểu (1 đến 5 sao)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  minRating?: number;
}

