import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
    @ApiProperty({
        example: 'Điện tử',
        description: 'Tên danh mục',
    })
    @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
    @IsString({ message: 'Tên danh mục phải là chuỗi ký tự' })
    name: string;
}
