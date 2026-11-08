import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateProductDto {
    @ApiPropertyOptional({
        example: 'iPhone 15 Pro Max 512GB',
        description: 'Tên sản phẩm',
    })
    @IsOptional()
    @IsString({ message: 'Tên sản phẩm phải là chuỗi ký tự' })
    name?: string;

    @ApiPropertyOptional({
        example: 'Phiên bản bộ nhớ 512GB',
        description: 'Mô tả chi tiết',
    })
    @IsOptional()
    @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
    description?: string;

    @ApiPropertyOptional({
        example: 32990000,
        description: 'Giá sản phẩm',
    })
    @IsOptional()
    @IsNumber({}, { message: 'Giá sản phẩm phải là số' })
    @Min(0, { message: 'Giá sản phẩm không được nhỏ hơn 0' })
    price?: number;

    @ApiPropertyOptional({
        example: 'IP15PM-512-VN',
        description: 'Mã SKU',
    })
    @IsOptional()
    @IsString({ message: 'Mã SKU phải là chuỗi ký tự' })
    sku?: string;

    @ApiPropertyOptional({
        example: 30,
        description: 'Số lượng tồn kho',
    })
    @IsOptional()
    @IsInt({ message: 'Số lượng phải là số nguyên' })
    @Min(0, { message: 'Số lượng không được nhỏ hơn 0' })
    quantity?: number;

    @ApiPropertyOptional({
        example: 1,
        description: 'ID danh mục',
    })
    @IsOptional()
    @IsInt({ message: 'ID danh mục phải là số nguyên' })
    @Min(1, { message: 'ID danh mục không hợp lệ' })
    categoryId?: number;
}
