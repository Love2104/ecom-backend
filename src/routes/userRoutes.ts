import express from 'express';
import { getUsers, deleteUser, getSupplierRequests, updateSupplierStatus, demoteSupplier } from '../controllers/userController';
import { protect, restrictTo } from '../middlewares/auth';

const router = express.Router();

// Restricted to SUPERADMIN and MANAGER
router.use(protect);
router.use(restrictTo('SUPERADMIN', 'MANAGER'));

router.get('/', getUsers);
router.get('/supplier-requests', getSupplierRequests);
router.patch('/:id/status', updateSupplierStatus);
router.patch('/:id/demote', demoteSupplier);
router.delete('/:id', deleteUser);

export default router;
