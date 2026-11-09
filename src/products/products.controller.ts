import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service.js';
import { CreateProductDto, UpdateProductDto, CreateCategoryDto, UpdateCategoryDto, FilterProductDto } from './dto/index.js';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@ApiTags('Products & Categories')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get('search')
    @ApiOperation({ summary: '[Mọi người] Tìm kiếm sản phẩm theo tên hoặc mô tả' })
    searchProducts(@Query('query') query: string) {
        return this.productsService.searchProducts(query || '');
    }

    @Get('filter')
    @ApiOperation({ summary: '[Mọi người] Lọc sản phẩm theo danh mục, khoảng giá, rating' })
    filterProducts(@Query() filterDto: FilterProductDto) {
        return this.productsService.filterProducts(filterDto);
    }

    @Get()
    @ApiOperation({ summary: '[Mọi người] Lấy danh sách tất cả sản phẩm' })
    findAllProducts() {
        return this.productsService.findAllProducts();
    }

    @Get(':id')
    @ApiOperation({ summary: '[Mọi người] Xem chi tiết sản phẩm theo ID' })
    @ApiParam({ name: 'id', description: 'ID sản phẩm' })
    findProductById(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findProductById(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Admin] Tạo sản phẩm mới' })
    @ApiResponse({ status: 201, description: 'Tạo sản phẩm thành công' })
    @ApiResponse({ status: 403, description: 'Chỉ Admin mới có quyền tạo sản phẩm' })
    createProduct(@Body() createProductDto: CreateProductDto) {
        return this.productsService.createProduct(createProductDto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Admin] Cập nhật thông tin sản phẩm' })
    @ApiParam({ name: 'id', description: 'ID sản phẩm' })
    @ApiResponse({ status: 403, description: 'Chỉ Admin mới có quyền' })
    updateProduct(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
        return this.productsService.updateProduct(id, updateProductDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Admin] Xóa sản phẩm theo ID' })
    @ApiParam({ name: 'id', description: 'ID sản phẩm' })
    @ApiResponse({ status: 403, description: 'Chỉ Admin mới có quyền' })
    removeProduct(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.removeProduct(id);
    }

    @Get('categories')
    @ApiOperation({ summary: '[Mọi người] Lấy danh sách tất cả danh mục' })
    findAllCategories() {
        return this.productsService.findAllCategories();
    }

    @Get('categories/:id')
    @ApiOperation({ summary: '[Mọi người] Xem chi tiết danh mục theo ID' })
    @ApiParam({ name: 'id', description: 'ID danh mục' })
    findCategoryById(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findCategoryById(id);
    }

    @Post('categories')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Admin] Tạo danh mục sản phẩm mới' })
    @ApiResponse({ status: 201, description: 'Tạo danh mục thành công' })
    @ApiResponse({ status: 403, description: 'Chỉ Admin mới có quyền' })
    createCategory(@Body() createCategoryDto: CreateCategoryDto) {
        return this.productsService.createCategory(createCategoryDto);
    }

    @Patch('categories/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Admin] Cập nhật danh mục' })
    @ApiParam({ name: 'id', description: 'ID danh mục' })
    @ApiResponse({ status: 403, description: 'Chỉ Admin mới có quyền' })
    updateCategory(@Param('id', ParseIntPipe) id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
        return this.productsService.updateCategory(id, updateCategoryDto);
    }

    @Delete('categories/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Admin] Xóa danh mục theo ID' })
    @ApiParam({ name: 'id', description: 'ID danh mục' })
    @ApiResponse({ status: 403, description: 'Chỉ Admin mới có quyền' })
    removeCategory(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.removeCategory(id);
    }
}
