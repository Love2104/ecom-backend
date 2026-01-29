import { query } from '../config/db';

export interface CartItem {
    id: string;
    cart_id: string;
    product_id: string;
    variant_id?: string;
    quantity: number;
    created_at: Date;
    updated_at: Date;
    product?: {
        name: string;
        price: number;
        image_url: string;
        slug: string;
        stock_quantity: number;
    };
}

export interface Cart {
    id: string;
    user_id?: string;
    session_id?: string;
    created_at: Date;
    updated_at: Date;
    items?: CartItem[];
}

export class CartModel {
    static async create(userId?: string, sessionId?: string): Promise<Cart> {
        const result = await query(
            'INSERT INTO carts (user_id, session_id) VALUES ($1, $2) RETURNING *',
            [userId || null, sessionId || null]
        );
        return result.rows[0];
    }

    static async findByUserId(userId: string): Promise<Cart | null> {
        const result = await query('SELECT * FROM carts WHERE user_id = $1', [userId]);
        if (result.rows.length === 0) return null;
        return this.attachItems(result.rows[0]);
    }

    static async findBySessionId(sessionId: string): Promise<Cart | null> {
        const result = await query('SELECT * FROM carts WHERE session_id = $1', [sessionId]);
        if (result.rows.length === 0) return null;
        return this.attachItems(result.rows[0]);
    }

    private static async attachItems(cart: Cart): Promise<Cart> {
        const itemsResult = await query(
            `SELECT ci.*, 
              p.name as product_name, p.price, p.image_url, p.slug, p.stock_quantity
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1
       ORDER BY ci.created_at ASC`,
            [cart.id]
        );

        cart.items = itemsResult.rows.map((row: any) => ({
            id: row.id,
            cart_id: row.cart_id,
            product_id: row.product_id,
            variant_id: row.variant_id,
            quantity: row.quantity,
            created_at: row.created_at,
            updated_at: row.updated_at,
            product: {
                name: row.product_name,
                price: row.price,
                image_url: row.image_url,
                slug: row.slug,
                stock_quantity: row.stock_quantity
            }
        }));
        return cart;
    }

    static async addItem(cartId: string, productId: string, quantity: number, variantId?: string): Promise<CartItem> {
        // Check if exists
        const existing = await query(
            'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2 AND variant_id IS NOT DISTINCT FROM $3',
            [cartId, productId, variantId || null]
        );

        if (existing.rows.length > 0) {
            const newQuantity = existing.rows[0].quantity + quantity;
            const result = await query(
                'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
                [newQuantity, existing.rows[0].id]
            );
            return result.rows[0];
        } else {
            const result = await query(
                'INSERT INTO cart_items (cart_id, product_id, variant_id, quantity) VALUES ($1, $2, $3, $4) RETURNING *',
                [cartId, productId, variantId || null, quantity]
            );
            return result.rows[0];
        }
    }

    static async updateItemQuantity(itemId: string, quantity: number): Promise<CartItem | null> {
        if (quantity <= 0) {
            await query('DELETE FROM cart_items WHERE id = $1', [itemId]);
            return null;
        }
        const result = await query(
            'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [quantity, itemId]
        );
        return result.rows[0] || null;
    }

    static async removeItem(itemId: string): Promise<boolean> {
        const result = await query('DELETE FROM cart_items WHERE id = $1', [itemId]);
        return result.rowCount > 0;
    }

    static async clearCart(cartId: string): Promise<void> {
        await query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    }
}
