import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductsService } from './products.service.js';
import { CreateProductDto, UpdateProductDto, CreateCategoryDto, UpdateCategoryDto } from './dto/index.js';

@ApiTags('Products & Categories')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @ApiOperation({ summary: 'Tạo sản phẩm mới' })
    @ApiResponse({ status: 201, description: 'Tạo sản phẩm thành công' })
    createProduct(@Body() createProductDto: CreateProductDto) {
        return this.productsService.createProduct(createProductDto);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách tất cả sản phẩm' })
    findAllProducts() {
        return this.productsService.findAllProducts();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Xem chi tiết sản phẩm theo ID' })
    @ApiParam({ name: 'id', description: 'ID sản phẩm' })
    findProductById(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findProductById(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật thông tin sản phẩm' })
    @ApiParam({ name: 'id', description: 'ID sản phẩm' })
    updateProduct(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
        return this.productsService.updateProduct(id, updateProductDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa sản phẩm theo ID' })
    @ApiParam({ name: 'id', description: 'ID sản phẩm' })
    removeProduct(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.removeProduct(id);
    }

    @Post('categories')
    @ApiOperation({ summary: 'Tạo danh mục sản phẩm mới' })
    @ApiResponse({ status: 201, description: 'Tạo danh mục thành công' })
    createCategory(@Body() createCategoryDto: CreateCategoryDto) {
        return this.productsService.createCategory(createCategoryDto);
    }

    @Get('categories')
    @ApiOperation({ summary: 'Lấy danh sách tất cả danh mục' })
    findAllCategories() {
        return this.productsService.findAllCategories();
    }

    @Get('categories/:id')
    @ApiOperation({ summary: 'Xem chi tiết danh mục theo ID' })
    @ApiParam({ name: 'id', description: 'ID danh mục' })
    findCategoryById(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findCategoryById(id);
    }

    @Patch('categories/:id')
    @ApiOperation({ summary: 'Cập nhật danh mục' })
    @ApiParam({ name: 'id', description: 'ID danh mục' })
    updateCategory(@Param('id', ParseIntPipe) id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
        return this.productsService.updateCategory(id, updateCategoryDto);
    }

    @Delete('categories/:id')
    @ApiOperation({ summary: 'Xóa danh mục theo ID' })
    @ApiParam({ name: 'id', description: 'ID danh mục' })
    removeCategory(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.removeCategory(id);
    }
}
