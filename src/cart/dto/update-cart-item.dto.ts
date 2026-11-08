import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({
    example: 3,
    description: 'Số lượng sản phẩm mới (tối thiểu 1)',
    minimum: 1,
  })
  @IsNotEmpty({ message: 'Số lượng không được để trống' })
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng tối thiểu là 1' })
  quantity: number;
}

