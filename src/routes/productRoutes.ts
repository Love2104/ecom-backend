import express from 'express';
import { 
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getNewArrivals,
  getProductsOnSale,
  getRelatedProducts
} from '../controllers/productController';
import { protect, admin } from '../middlewares/auth';
import { 
  createProductValidator, 
  updateProductValidator 
} from '../utils/validators';

const router = express.Router();

// ✅ Public static routes first
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/on-sale', getProductsOnSale);

// ✅ Dynamic routes AFTER static routes
router.get('/:id/related', getRelatedProducts);
router.get('/:id', getProductById);

// ✅ Admin routes
router.post('/', protect, admin, createProductValidator, createProduct);
router.put('/:id', protect, admin, updateProductValidator, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router;
