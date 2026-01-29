import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ProductModel } from '../models/Product';
import { AppError } from '../middlewares/errorHandler';
import { processImageUpload } from '../middlewares/upload';

// Get all products with filtering
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, category_id, minPrice, maxPrice, sort, page = 1, limit = 12, supplier_id } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const products = await ProductModel.findAll({
      search: search as string,
      category_id: category_id as string,
      supplier_id: supplier_id as string
    });
    // Note: Model findAll currently doesn't implement pagination or all filters, simplifying for now

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

// Get a single product
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return next(new AppError('Product not found', 404));

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// Create a new product
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new AppError('Validation error', 400, errors.array()));

    const imageUrl = processImageUpload(req);

    if (!req.user || !req.user.id) {
      return next(new AppError('Authentication required', 401));
    }

    const { name, description, price, original_price, stock, category_id } = req.body;

    const productData = {
      supplier_id: req.user.id,
      category_id,
      name,
      description,
      price: parseFloat(price),
      original_price: original_price ? parseFloat(original_price) : undefined,
      stock: parseInt(stock || '0'),
      images: imageUrl ? [imageUrl] : [],
      is_active: true
    };

    const product = await ProductModel.create(productData);
    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// Update product
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productBefore = await ProductModel.findById(req.params.id);
    if (!productBefore) return next(new AppError('Product not found', 404));

    // Check ownership (unless superadmin or manager)
    if (req.user?.role !== 'SUPERADMIN' && req.user?.role !== 'MANAGER' && productBefore.supplier_id !== req.user?.id) {
      return next(new AppError('Not authorized to update this product', 403));
    }

    const imageUrl = processImageUpload(req);
    const updateData: any = { ...req.body };

    if (imageUrl) {
      const currentImages = productBefore.images || [];
      updateData.images = [...currentImages, imageUrl];
    }

    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.stock) updateData.stock = parseInt(updateData.stock);

    const product = await ProductModel.update(req.params.id, updateData);
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productBefore = await ProductModel.findById(req.params.id);
    if (!productBefore) return next(new AppError('Product not found', 404));

    if (req.user?.role !== 'SUPERADMIN' && req.user?.role !== 'MANAGER' && productBefore.supplier_id !== req.user?.id) {
      return next(new AppError('Not authorized to delete this product', 403));
    }

    await ProductModel.delete(req.params.id);
    res.status(200).json({ success: true, message: 'Product removed' });
  } catch (error) {
    next(error);
  }
};
// Get featured products
export const getFeaturedProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string || '8');
    const products = await ProductModel.findFeatured(limit);
    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

// Get new arrivals
export const getNewArrivals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string || '8');
    const products = await ProductModel.findNewArrivals(limit);
    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

// Get products on sale
export const getProductsOnSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string || '8');
    const products = await ProductModel.findOnSale(limit);
    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
};
