import { Controller, Post, Body, Get, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { CreateUserDto, UpdateUserDto, LoginDto } from './dto/index.js';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';
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
}
