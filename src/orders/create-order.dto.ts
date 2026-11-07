import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsArray, ArrayNotEmpty, ValidateNested, Min } from 'class-validator';

export class OrderItemDto {
    @ApiProperty({
        example: 1,
        description: 'ID của sản phẩm',
    })
    @IsNotEmpty()
    @IsNumber()
    productId: number;

    @ApiProperty({
        example: 2,
        description: 'Số lượng mua (tối thiểu 1)',
        minimum: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    quantity: number;
}

export class CreateOrderDto {
    @ApiProperty({
        example: 1,
        description: 'ID người dùng đặt đơn',
    })
    @IsNotEmpty()
    @IsNumber()
    userId: number;

    @ApiProperty({
        type: [OrderItemDto],
        description: 'Danh sách các mặt hàng trong đơn hàng',
    })
    @IsNotEmpty()
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}
