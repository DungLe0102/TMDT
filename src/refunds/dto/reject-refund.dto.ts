import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RejectRefundDto {
    @ApiProperty({ example: 'Sản phẩm đã quá hạn đổi trả 7 ngày hoặc lỗi do phía người sử dụng', description: 'Lý do từ chối yêu cầu hoàn tiền' })
    @IsNotEmpty({ message: 'Lý do từ chối không được để trống' })
    @IsString({ message: 'Lý do từ chối phải là chuỗi ký tự' })
    @MinLength(5, { message: 'Lý do từ chối phải có ít nhất 5 ký tự' })
    reason: string;
}
