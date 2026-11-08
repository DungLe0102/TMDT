import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
    @ApiProperty({
        example: 'shipped',
        description: 'Trạng thái đơn hàng',
        enum: ['placed', 'paid', 'shipped', 'delivered', 'cancelled', 'returned'],
    })
    @IsNotEmpty({ message: 'Trạng thái không được để trống' })
    @IsString({ message: 'Trạng thái phải là chuỗi ký tự' })
    @IsIn(['placed', 'paid', 'shipped', 'delivered', 'cancelled', 'returned'], {
        message: 'Trạng thái không hợp lệ. Phải là một trong: placed, paid, shipped, delivered, cancelled, returned',
    })
    status: string;
}
