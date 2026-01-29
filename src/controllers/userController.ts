import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User';
import { AppError } from '../middlewares/errorHandler';
import { query } from '../config/db';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { role } = req.query;
        const users = await UserModel.findAll(role as string);

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        // Prevent deleting self
        if (req.user?.id === id) {
            return next(new AppError('Cannot delete yourself', 400));
        }

        // Fetch user to check role
        const targetUser = await UserModel.findById(id);
        if (!targetUser) {
            return next(new AppError('User not found', 404));
        }

        // Deletion restrictions
        if (req.user?.role === 'MANAGER') {
            if (targetUser.role === 'SUPERADMIN' || targetUser.role === 'MANAGER') {
                return next(new AppError('Managers cannot delete admins or other managers', 403));
            }
            // Allow deleting suppliers or buyers - explicitly requested: manager can only remove supplier
            if (targetUser.role !== 'SUPPLIER') {
                // If they can't delete buyers either, it would be stricter. 
                // The request says "manger can only be remvove supplier"
                return next(new AppError('Managers can only remove suppliers', 403));
            }
        }

        const success = await UserModel.delete(id);

        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error) {
        next(error);
    }
};
export const getSupplierRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await UserModel.getSupplierRequests();
        res.status(200).json({ success: true, count: users.length, users });
    } catch (error) {
        next(error);
    }
};

export const updateSupplierStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return next(new AppError('Invalid status', 400));
        }

        const user = await UserModel.updateSupplierStatus(id, status);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

export const demoteSupplier = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id);
        if (!user) return next(new AppError('User not found', 404));

        if (user.role !== 'SUPPLIER') {
            return next(new AppError('User is not a supplier', 400));
        }

        // Soft-delete all products created by this supplier
        await query(
            'UPDATE products SET is_deleted = true, is_active = false, updated_at = NOW() WHERE supplier_id = $1',
            [id]
        );

        // Demote the supplier to buyer
        const updatedUser = await UserModel.update(id, {
            role: 'BUYER',
            supplier_status: 'NONE'
        });

        res.status(200).json({
            success: true,
            user: updatedUser,
            message: 'Supplier demoted to buyer and all their products have been removed'
        });
    } catch (error) {
        next(error);
    }
};
