import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ProductModel } from '../models/Product';
import { AppError } from '../middlewares/errorHandler';
import { processImageUpload } from '../middlewares/upload';

// Get all products with filtering
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { 
      search, 
      category, 
      minPrice, 
      maxPrice, 
      sort, 
      page = 1, 
      limit = 12 
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const { products, total } = await ProductModel.findAll({
      search: search as string,
      category: category as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort: sort as string,
      limit: Number(limit),
      offset
    });

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      products
    });
  } catch (error) {
    next(error);
  }
};

// Get a single product
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await ProductModel.findById(req.params.id);

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

// Create a new product
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation error', 400, errors.array()));
    }

    // Process image upload (file or URL)
    const imageUrl = processImageUpload(req);
    if (!imageUrl) {
      return next(new AppError('Product image is required', 400));
    }

    // Parse tags if they exist
    let tags = [];
    if (req.body.tags) {
      try {
        tags = JSON.parse(req.body.tags);
      } catch (e) {
        // If parsing fails, try to split by comma
        tags = req.body.tags.split(',').map((tag: string) => tag.trim());
      }
    }

    // Prepare product data
    const productData = {
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      original_price: req.body.original_price ? parseFloat(req.body.original_price) : undefined,
      image: imageUrl,
      category: req.body.category,
      discount: req.body.discount ? parseInt(req.body.discount) : 0,
      stock: parseInt(req.body.stock),
      tags: tags
    };

    const product = await ProductModel.create(productData);

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

// Update a product
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation error', 400, errors.array()));
    }

    // Process image if provided
    const imageUrl = processImageUpload(req);
    
    // Parse tags if they exist
    let tags;
    if (req.body.tags) {
      try {
        tags = JSON.parse(req.body.tags);
      } catch (e) {
        // If parsing fails, try to split by comma
        tags = req.body.tags.split(',').map((tag: string) => tag.trim());
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.price) updateData.price = parseFloat(req.body.price);
    if (req.body.original_price) updateData.original_price = parseFloat(req.body.original_price);
    if (req.body.category) updateData.category = req.body.category;
    if (req.body.stock) updateData.stock = parseInt(req.body.stock);
    if (req.body.discount) updateData.discount = parseInt(req.body.discount);
    if (tags) updateData.tags = tags;
    if (imageUrl) updateData.image = imageUrl;

    const product = await ProductModel.update(req.params.id, updateData);

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

// Delete a product
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const success = await ProductModel.delete(req.params.id);

    if (!success) {
      return next(new AppError('Product not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Product removed'
    });
  } catch (error) {
    next(error);
  }
};

// Get featured products
export const getFeaturedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 4;
    const products = await ProductModel.getFeatured(limit);

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

// Get new arrivals
export const getNewArrivals = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 4;
    const products = await ProductModel.getNewArrivals(limit);

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

// Get products on sale
export const getProductsOnSale = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 4;
    const products = await ProductModel.getOnSale(limit);

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

// Get related products
export const getRelatedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const limit = req.query.limit ? Number(req.query.limit) : 4;
    
    const product = await ProductModel.findById(id);
    
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    const products = await ProductModel.getRelated(product.category, id, limit);

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};