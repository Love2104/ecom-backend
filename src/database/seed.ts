import dotenv from 'dotenv';
dotenv.config();

import { query } from '../config/db';
import logger from '../utils/logger';

const seedProducts = async () => {
    try {
        logger.info('Starting database seeding...');

        // Clear existing products
        await query('DELETE FROM order_items');
        await query('DELETE FROM products');

        logger.info('Cleared existing products.');

        const products = [
            {
                name: 'Wireless Noise-Cancelling Headphones',
                description: 'Premium wireless headphones with industry-leading noise cancellation, 30-hour battery life, and superior sound quality.',
                price: 299.99,
                original_price: 349.99,
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
                category: 'Electronics',
                discount: 14,
                rating: 4.8,
                stock: 50,
                tags: ['headphones', 'audio', 'wireless']
            },
            {
                name: 'Smart Fitness Watch',
                description: 'Track your workouts, heart rate, and sleep with this advanced smart fitness watch. Water-resistant and 7-day battery life.',
                price: 149.50,
                original_price: 199.50,
                image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop',
                category: 'Wearables',
                discount: 25,
                rating: 4.5,
                stock: 30,
                tags: ['fitness', 'watch', 'smart']
            },
            {
                name: 'Ergonomic Office Chair',
                description: 'Designed for comfort and productivity. Adjustable lumbar support, breathable mesh back, and cushioned seat.',
                price: 249.00,
                original_price: 299.00,
                image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=1000&auto=format&fit=crop',
                category: 'Furniture',
                discount: 17,
                rating: 4.7,
                stock: 15,
                tags: ['office', 'furniture', 'chair']
            },
            {
                name: 'Professional Camera DSLR',
                description: 'Capture stunning photos and videos with this professional DSLR camera. Includes 18-55mm lens kit.',
                price: 899.99,
                original_price: 999.99,
                image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop',
                category: 'Cameras',
                discount: 10,
                rating: 4.9,
                stock: 10,
                tags: ['camera', 'dslr', 'photography']
            },
            {
                name: 'Gaming Mechanical Keyboard',
                description: 'RGB mechanical keyboard with tactile switches for the ultimate gaming experience. Durable aluminum frame.',
                price: 129.99,
                original_price: 159.99,
                image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=1000&auto=format&fit=crop',
                category: 'Electronics',
                discount: 19,
                rating: 4.6,
                stock: 40,
                tags: ['keyboard', 'gaming', 'rgb']
            }
        ];

        for (const product of products) {
            await query(
                `INSERT INTO products (name, description, price, original_price, image, category, discount, rating, stock, tags) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [
                    product.name,
                    product.description,
                    product.price,
                    product.original_price,
                    product.image,
                    product.category,
                    product.discount,
                    product.rating,
                    product.stock,
                    product.tags
                ]
            );
        }

        logger.info(`Successfully seeded ${products.length} products.`);
        process.exit(0);
    } catch (error) {
        logger.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedProducts();
