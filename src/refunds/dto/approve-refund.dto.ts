import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ApproveRefundDto {
    @ApiPropertyOptional({ example: 'Đã xác nhận lỗi sản phẩm và duyệt hoàn tiền qua VietQR Pro', description: 'Ghi chú của admin khi phê duyệt' })
    @IsOptional()
    @IsString({ message: 'Ghi chú phải là chuỗi' })
    adminNote?: string;
}
