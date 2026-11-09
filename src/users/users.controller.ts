import { Controller, Post, Body, Get, Patch, Delete, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { CreateUserDto, UpdateUserDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/index.js';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service.js';
import type { User } from './user.entity.js';

interface RequestWithUser extends Request {
    user: User;
}

@ApiTags('Users & Auth')
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
    ) { }

    @Post('register')
    @ApiOperation({ summary: 'Đăng ký tài khoản người dùng mới' })
    @ApiResponse({ status: 201, description: 'Đăng ký thành công.' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
    async register(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Đăng nhập để nhận JWT Bearer token' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 200, description: 'Đăng nhập thành công, trả về access_token.' })
    @ApiResponse({ status: 401, description: 'Email hoặc mật khẩu không chính xác.' })
    async login(@Body() body: LoginDto) {
        return this.authService.login(body.email, body.password);
    }

    @Post('forgot-password')
    @ApiOperation({ summary: 'Gửi yêu cầu khôi phục mật khẩu qua Email' })
    @ApiResponse({ status: 200, description: 'Đã gửi mã khôi phục mật khẩu nếu email tồn tại.' })
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.usersService.forgotPassword(forgotPasswordDto);
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Đặt lại mật khẩu mới bằng Token khôi phục' })
    @ApiResponse({ status: 200, description: 'Đổi mật khẩu thành công.' })
    @ApiResponse({ status: 400, description: 'Token không hợp lệ hoặc đã hết hạn.' })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.usersService.resetPassword(resetPasswordDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Lấy thông tin cá nhân hiện tại' })
    @ApiResponse({ status: 200, description: 'Thông tin tài khoản đăng nhập.' })
    @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc token không hợp lệ.' })
    async getProfile(@Req() req: RequestWithUser) {
        return req.user;
    }

    @UseGuards(JwtAuthGuard)
    @Patch('profile')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cập nhật thông tin tài khoản cá nhân' })
    @ApiResponse({ status: 200, description: 'Cập nhật thành công.' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
    async updateProfile(@Req() req: RequestWithUser, @Body() updateUserDto: UpdateUserDto) {
        const user = req.user;
        await this.usersService.update(user.id, updateUserDto);
        return this.usersService.findOneByEmail(user.email);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('profile')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xoá tài khoản cá nhân' })
    @ApiResponse({ status: 200, description: 'Xoá tài khoản thành công.' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
    async deleteProfile(@Req() req: RequestWithUser) {
        const user = req.user;
        await this.usersService.remove(user.id);
        return { message: 'Xoá tài khoản thành công' };
    }

    // --- Admin User Management Endpoints ---

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Admin] Lấy danh sách toàn bộ người dùng' })
    async findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Admin] Xem thông tin người dùng theo ID' })
    @ApiParam({ name: 'id', description: 'ID người dùng' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.findOneById(id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Admin] Xóa người dùng theo ID' })
    @ApiParam({ name: 'id', description: 'ID người dùng cần xóa' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.usersService.remove(id);
        return { message: `Đã xóa người dùng #${id} thành công` };
    }
}
