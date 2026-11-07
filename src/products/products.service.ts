import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity.js';
import { Category } from './category.entity.js';
import { CreateProductDto, UpdateProductDto, CreateCategoryDto, UpdateCategoryDto } from './dto/index.js';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
        @InjectRepository(Category)
        private categoriesRepository: Repository<Category>,
    ) { }

    async createProduct(createProductDto: CreateProductDto): Promise<Product> {
        const { categoryId, ...rest } = createProductDto;
        const category = await this.categoriesRepository.findOne({ where: { id: categoryId } });
        if (!category) {
            throw new NotFoundException(`Không tìm thấy danh mục với ID ${categoryId}`);
        }
        const product = this.productsRepository.create({ ...rest, category });
        return this.productsRepository.save(product);
    }

    async findAllProducts(): Promise<Product[]> {
        return this.productsRepository.find({ relations: { category: true } });
    }

    async findProductById(id: number): Promise<Product> {
        const product = await this.productsRepository.findOne({ where: { id }, relations: { category: true } });
        if (!product) {
            throw new NotFoundException(`Không tìm thấy sản phẩm với ID ${id}`);
        }
        return product;
    }

    async updateProduct(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
        const product = await this.findProductById(id);
        const { categoryId, ...rest } = updateProductDto;
        if (categoryId) {
            const category = await this.categoriesRepository.findOne({ where: { id: categoryId } });
            if (!category) {
                throw new NotFoundException(`Không tìm thấy danh mục với ID ${categoryId}`);
            }
            product.category = category;
        }
        Object.assign(product, rest);
        return this.productsRepository.save(product);
    }

    async removeProduct(id: number): Promise<void> {
        const product = await this.findProductById(id);
        try {
            await this.productsRepository.remove(product);
        } catch (error: any) {
            if (error.code === '23503') {
                throw new BadRequestException('Không thể xóa sản phẩm đã có trong đơn hàng.');
            }
            throw error;
        }
    }

    async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
        const category = this.categoriesRepository.create(createCategoryDto);
        return this.categoriesRepository.save(category);
    }

    async findAllCategories(): Promise<Category[]> {
        return this.categoriesRepository.find({ relations: { products: true } });
    }

    async findCategoryById(id: number): Promise<Category> {
        const category = await this.categoriesRepository.findOne({ where: { id }, relations: { products: true } });
        if (!category) {
            throw new NotFoundException(`Không tìm thấy danh mục với ID ${id}`);
        }
        return category;
    }

    async updateCategory(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        const category = await this.findCategoryById(id);
        Object.assign(category, updateCategoryDto);
        return this.categoriesRepository.save(category);
    }

    async removeCategory(id: number): Promise<void> {
        const category = await this.findCategoryById(id);
        try {
            await this.categoriesRepository.remove(category);
        } catch (error: any) {
            if (error.code === '23503') {
                throw new BadRequestException('Không thể xóa danh mục này vì đang có sản phẩm thuộc về nó.');
            }
            throw error;
        }
    }
}
