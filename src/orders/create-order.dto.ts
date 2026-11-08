import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsInt, IsArray, ArrayNotEmpty, ValidateNested, Min, IsOptional } from 'class-validator';

export class OrderItemDto {
    @ApiProperty({
        example: 1,
        description: 'ID của sản phẩm',
    })
    @IsNotEmpty({ message: 'ID sản phẩm không được để trống' })
    @IsInt({ message: 'ID sản phẩm phải là số nguyên' })
    @Min(1, { message: 'ID sản phẩm không hợp lệ' })
    productId: number;

    @ApiProperty({
        example: 2,
        description: 'Số lượng mua (tối thiểu 1)',
        minimum: 1,
    })
    @IsNotEmpty({ message: 'Số lượng không được để trống' })
    @IsInt({ message: 'Số lượng phải là số nguyên' })
    @Min(1, { message: 'Số lượng mua tối thiểu là 1' })
    quantity: number;
}

export class CreateOrderDto {
    @ApiPropertyOptional({
        example: 1,
        description: 'ID người dùng đặt đơn (mặc định lấy theo tài khoản đang đăng nhập; Admin có thể chỉ định)',
    })
    @IsOptional()
    @IsInt({ message: 'User ID phải là số nguyên' })
    @Min(1, { message: 'User ID không hợp lệ' })
    userId?: number;

    @ApiProperty({
        type: [OrderItemDto],
        description: 'Danh sách các mặt hàng trong đơn hàng',
    })
    @IsNotEmpty({ message: 'Danh sách sản phẩm không được để trống' })
    @IsArray({ message: 'Danh sách sản phẩm phải là một mảng' })
    @ArrayNotEmpty({ message: 'Đơn hàng phải có ít nhất 1 sản phẩm' })
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}
