import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsInt, IsString, Min } from 'class-validator';

export class CreateProductDto {
    @ApiProperty({
        example: 'iPhone 15 Pro Max',
        description: 'Tên sản phẩm',
    })
    @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
    @IsString({ message: 'Tên sản phẩm phải là chuỗi ký tự' })
    name: string;

    @ApiProperty({
        example: 'Smartphone cao cấp của Apple',
        description: 'Mô tả chi tiết',
    })
    @IsNotEmpty({ message: 'Mô tả không được để trống' })
    @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
    description: string;

    @ApiProperty({
        example: 29990000,
        description: 'Giá sản phẩm (VNĐ)',
    })
    @IsNotEmpty({ message: 'Giá sản phẩm không được để trống' })
    @IsNumber({}, { message: 'Giá sản phẩm phải là số' })
    @Min(0, { message: 'Giá sản phẩm không được nhỏ hơn 0' })
    price: number;

    @ApiProperty({
        example: 'IP15PM-256-VN',
        description: 'Mã kho SKU',
    })
    @IsNotEmpty({ message: 'Mã SKU không được để trống' })
    @IsString({ message: 'Mã SKU phải là chuỗi ký tự' })
    sku: string;

    @ApiProperty({
        example: 50,
        description: 'Số lượng tồn kho',
    })
    @IsNotEmpty({ message: 'Số lượng không được để trống' })
    @IsInt({ message: 'Số lượng phải là số nguyên' })
    @Min(0, { message: 'Số lượng không được nhỏ hơn 0' })
    quantity: number;

    @ApiProperty({
        example: 1,
        description: 'ID danh mục sản phẩm',
    })
    @IsNotEmpty({ message: 'ID danh mục không được để trống' })
    @IsInt({ message: 'ID danh mục phải là số nguyên' })
    @Min(1, { message: 'ID danh mục không hợp lệ' })
    categoryId: number;
}
