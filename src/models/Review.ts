import { query } from '../config/db';

export interface Review {
    id: string;
    product_id: string;
    user_id: string;
    rating: number; // 1 to 5
    comment?: string;
    images?: string[];
    is_approved: boolean;
    created_at: Date;
    updated_at: Date;
    user?: {
        name: string;
        avatar_url?: string;
    };
}

export interface ReviewInput {
    product_id: string;
    user_id: string;
    rating: number;
    comment?: string;
    images?: string[];
}

export class ReviewModel {
    static async create(reviewData: ReviewInput): Promise<Review> {
        const result = await query(
            `INSERT INTO reviews (product_id, user_id, rating, comment, images) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [
                reviewData.product_id,
                reviewData.user_id,
                reviewData.rating,
                reviewData.comment || null,
                reviewData.images ? JSON.stringify(reviewData.images) : '[]'
            ]
        );

        // Trigger update of product average rating (could be done via DB trigger or here)
        await this.updateProductRating(reviewData.product_id);

        return result.rows[0];
    }

    static async findByProductId(productId: string): Promise<Review[]> {
        const result = await query(
            `SELECT r.*, u.name as user_name, u.avatar_url 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.product_id = $1 AND r.is_approved = TRUE 
       ORDER BY r.created_at DESC`,
            [productId]
        );

        return result.rows.map((row: any) => ({
            ...row,
            user: {
                name: row.user_name,
                avatar_url: row.avatar_url
            }
        }));
    }

    static async findByUserId(userId: string): Promise<Review[]> {
        const result = await query('SELECT * FROM reviews WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        return result.rows;
    }

    static async delete(id: string, userId: string): Promise<boolean> {
        const result = await query('DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING product_id', [id, userId]);
        if (result.rows.length > 0) {
            await this.updateProductRating(result.rows[0].product_id);
            return true;
        }
        return false;
    }

    private static async updateProductRating(productId: string): Promise<void> {
        // Calculate new average and count
        const stats = await query(
            'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE product_id = $1 AND is_approved = TRUE',
            [productId]
        );

        const avg = parseFloat(stats.rows[0].avg_rating || '0');
        const count = parseInt(stats.rows[0].count || '0');

        await query(
            'UPDATE products SET average_rating = $1, total_reviews = $2 WHERE id = $3',
            [avg, count, productId]
        );
    }
}
