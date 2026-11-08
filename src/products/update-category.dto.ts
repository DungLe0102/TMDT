import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
    @ApiPropertyOptional({
        example: 'Đồ gia dụng',
        description: 'Tên danh mục mới',
    })
    @IsOptional()
    @IsString({ message: 'Tên danh mục phải là chuỗi ký tự' })
    @IsNotEmpty({ message: 'Tên danh mục không được để rỗng nếu được truyền' })
    name?: string;
}
