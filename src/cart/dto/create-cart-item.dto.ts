import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateCartItemDto {
  @ApiProperty({
    example: 1,
    description: 'ID của sản phẩm cần thêm vào giỏ',
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
  @Min(1, { message: 'Số lượng tối thiểu là 1' })
  quantity: number;
}

