import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class VietQRWebhookDto {
    @ApiProperty({
        example: 29990000,
        description: 'Số tiền chuyển khoản thực tế',
    })
    @IsNotEmpty({ message: 'Số tiền không được để trống' })
    @IsNumber({}, { message: 'Số tiền phải là số' })
    @Min(1, { message: 'Số tiền chuyển khoản phải lớn hơn 0' })
    amount: number;

    @ApiProperty({
        example: 'DH1 Chuyen tien mua iPhone',
        description: 'Nội dung chuyển khoản (chứa mã đơn hàng dạng DH<id>)',
    })
    @IsNotEmpty({ message: 'Nội dung giao dịch không được để trống' })
    @IsString({ message: 'Nội dung giao dịch phải là chuỗi ký tự' })
    description: string;

    @ApiProperty({
        example: 'FT26110812345678',
        description: 'Mã tham chiếu / Mã giao dịch ngân hàng',
    })
    @IsNotEmpty({ message: 'Mã giao dịch không được để trống' })
    @IsString({ message: 'Mã giao dịch phải là chuỗi ký tự' })
    transactionId: string;

    @ApiPropertyOptional({
        example: '107704070005803',
        description: 'Số tài khoản người nhận',
    })
    @IsOptional()
    @IsString({ message: 'Số tài khoản phải là chuỗi ký tự' })
    accountNumber?: string;
}
