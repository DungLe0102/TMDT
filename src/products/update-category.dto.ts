import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
    @ApiPropertyOptional({
        example: 'Đồ gia dụng',
        description: 'Tên danh mục mới',
    })
    @IsOptional()
    @IsString()
    name?: string;
}
