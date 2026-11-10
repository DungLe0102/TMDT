import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsString, Min, MinLength } from 'class-validator';

export class CreateRefundRequestDto {
    @ApiProperty({ example: 1, description: 'ID của đơn hàng muốn yêu cầu hoàn tiền' })
    @IsNotEmpty({ message: 'Mã đơn hàng không được để trống' })
    @IsInt({ message: 'Mã đơn hàng phải là số nguyên' })
    @Min(1, { message: 'Mã đơn hàng không hợp lệ' })
    orderId: number;

    @ApiProperty({ example: 150000, description: 'Số tiền muốn yêu cầu hoàn (VND)' })
    @IsNotEmpty({ message: 'Số tiền không được để trống' })
    @IsNumber({}, { message: 'Số tiền phải là dạng số' })
    @Min(1000, { message: 'Số tiền hoàn tối thiểu là 1.000 VND' })
    amount: number;

    @ApiProperty({ example: 'Sản phẩm giao bị lỗi màn hình, không hoạt động được', description: 'Lý do chi tiết yêu cầu hoàn tiền' })
    @IsNotEmpty({ message: 'Lý do hoàn tiền không được để trống' })
    @IsString({ message: 'Lý do phải là chuỗi ký tự' })
    @MinLength(5, { message: 'Lý do phải có ít nhất 5 ký tự' })
    reason: string;

    @ApiProperty({ example: '107704070005803', description: 'Số tài khoản ngân hàng nhận tiền hoàn' })
    @IsNotEmpty({ message: 'Số tài khoản ngân hàng không được để trống' })
    @IsString({ message: 'Số tài khoản phải là chuỗi ký tự' })
    bankAccount: string;

    @ApiProperty({ example: 'HDBank', description: 'Tên ngân hàng thụ hưởng' })
    @IsNotEmpty({ message: 'Tên ngân hàng không được để trống' })
    @IsString({ message: 'Tên ngân hàng phải là chuỗi ký tự' })
    bankName: string;

    @ApiProperty({ example: 'LE XUAN DUNG', description: 'Tên chủ tài khoản thụ hưởng' })
    @IsNotEmpty({ message: 'Tên chủ tài khoản không được để trống' })
    @IsString({ message: 'Tên chủ tài khoản phải là chuỗi ký tự' })
    accountHolderName: string;
}
