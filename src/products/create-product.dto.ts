import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
    @ApiProperty({
        example: 'iPhone 15 Pro Max',
        description: 'Tên sản phẩm',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        example: 'Smartphone cao cấp của Apple',
        description: 'Mô tả chi tiết',
    })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({
        example: 29990000,
        description: 'Giá sản phẩm (VNĐ)',
    })
    @IsNotEmpty()
    @IsNumber()
    price: number;

    @ApiProperty({
        example: 'IP15PM-256-VN',
        description: 'Mã kho SKU',
    })
    @IsNotEmpty()
    @IsString()
    sku: string;

    @ApiProperty({
        example: 50,
        description: 'Số lượng tồn kho',
    })
    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @ApiProperty({
        example: 1,
        description: 'ID danh mục sản phẩm',
    })
    @IsNotEmpty()
    @IsNumber()
    categoryId: number;
}
