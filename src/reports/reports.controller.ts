import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service.js';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@ApiTags('Reports & Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  @ApiOperation({ summary: '[Admin] Báo cáo doanh số và đơn hàng theo thời gian' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Ngày bắt đầu (ISO String: YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Ngày kết thúc (ISO String: YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Lấy báo cáo doanh thu thành công' })
  getSalesReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getSalesReport(startDate, endDate);
  }

  @Get('analytics')
  @ApiOperation({ summary: '[Admin] Tổng quan thống kê toàn hệ thống (Users, Products, Orders, Revenue)' })
  @ApiResponse({ status: 200, description: 'Lấy dữ liệu phân tích hệ thống thành công' })
  getAnalytics() {
    return this.reportsService.getAnalytics();
  }
}
