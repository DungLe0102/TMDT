import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
    @ApiProperty({
        example: 'Điện tử',
        description: 'Tên danh mục',
    })
    @IsNotEmpty()
    @IsString()
    name: string;
}
