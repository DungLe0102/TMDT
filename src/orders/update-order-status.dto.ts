import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
    @ApiProperty({
        example: 'shipped',
        description: 'Trạng thái đơn hàng',
        enum: ['placed', 'shipped', 'delivered', 'cancelled', 'returned'],
    })
    @IsNotEmpty()
    @IsString()
    @IsIn(['placed', 'shipped', 'delivered', 'cancelled', 'returned'])
    status: string;
}
