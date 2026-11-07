import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto {
    @ApiPropertyOptional({
        example: 'iPhone 15 Pro Max 512GB',
        description: 'Tên sản phẩm',
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({
        example: 'Phiên bản bộ nhớ 512GB',
        description: 'Mô tả chi tiết',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        example: 32990000,
        description: 'Giá sản phẩm',
    })
    @IsOptional()
    @IsNumber()
    price?: number;

    @ApiPropertyOptional({
        example: 'IP15PM-512-VN',
        description: 'Mã SKU',
    })
    @IsOptional()
    @IsString()
    sku?: string;

    @ApiPropertyOptional({
        example: 30,
        description: 'Số lượng tồn kho',
    })
    @IsOptional()
    @IsNumber()
    quantity?: number;

    @ApiPropertyOptional({
        example: 1,
        description: 'ID danh mục',
    })
    @IsOptional()
    @IsNumber()
    categoryId?: number;
}
