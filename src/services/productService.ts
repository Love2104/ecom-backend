import { ProductModel, ProductInput, Product } from '../models/Product';
import { AppError } from '../middlewares/errorHandler';

export class ProductService {
  // Get all products with filtering
  static async getProducts(filters?: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ products: Product[]; total: number }> {
    return await ProductModel.findAll(filters);
  }

  // Get a single product
  static async getProductById(id: string): Promise<Product> {
    const product = await ProductModel.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  // Create a new product
  static async createProduct(productData: ProductInput): Promise<Product> {
    return await ProductModel.create(productData);
  }

  // Update a product
  static async updateProduct(id: string, productData: Partial<ProductInput>): Promise<Product> {
    const product = await ProductModel.update(id, productData);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  // Delete a product
  static async deleteProduct(id: string): Promise<void> {
    const success = await ProductModel.delete(id);
    if (!success) {
      throw new AppError('Product not found', 404);
    }
  }

  // Get featured products
  static async getFeaturedProducts(limit: number = 4): Promise<Product[]> {
    return await ProductModel.getFeatured(limit);
  }

  // Get new arrivals
  static async getNewArrivals(limit: number = 4): Promise<Product[]> {
    return await ProductModel.getNewArrivals(limit);
  }

  // Get products on sale
  static async getProductsOnSale(limit: number = 4): Promise<Product[]> {
    return await ProductModel.getOnSale(limit);
  }

  // Get related products
  static async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    const product = await this.getProductById(productId);
    return await ProductModel.getRelated(product.category, productId, limit);
  }
}