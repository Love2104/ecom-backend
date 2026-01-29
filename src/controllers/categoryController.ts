import { Request, Response, NextFunction } from 'express';
import { query } from '../config/db';

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await query('SELECT * FROM categories ORDER BY name ASC');
        res.status(200).json({
            success: true,
            count: result.rows.length,
            categories: result.rows
        });
    } catch (error) {
        next(error);
    }
};
