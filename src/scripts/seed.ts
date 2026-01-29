import dotenv from 'dotenv';
dotenv.config();
import { query } from '../config/db';
import { UserModel } from '../models/User';
import bcrypt from 'bcryptjs';
import { ManagerKeyModel } from '../models/ManagerKey';
import { v4 as uuidv4 } from 'uuid';

const seed = async () => {
    try {
        console.log('🌱 Seeding database...');

        // 1. Create Superadmin (love@gmail.com / Love@2004)
        const superAdminEmail = 'love@gmail.com';
        const superAdminPass = 'Love@2004';

        let adminId: string;
        const existingAdmin = await UserModel.findByEmail(superAdminEmail);

        if (existingAdmin) {
            console.log('ℹ️ Superadmin already exists.');
            adminId = existingAdmin.id;
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(superAdminPass, salt);
            const res = await query(
                `INSERT INTO users (name, email, password_hash, role, is_verified)
         VALUES ($1, $2, $3, 'SUPERADMIN', true)
         RETURNING id`,
                ['Super Admin', superAdminEmail, hashedPassword]
            );
            adminId = res.rows[0].id;
            console.log('✅ Superadmin created (love@gmail.com).');
        }

        // 2. Create 2 Managers with Keys
        for (let i = 1; i <= 2; i++) {
            const keyCode = `MGR-KEY-${uuidv4().slice(0, 8).toUpperCase()}`;
            // Verify if key already exists or just create new one
            await ManagerKeyModel.create({
                key_code: keyCode,
                created_by: adminId,
                assigned_email: `manager${i}@shopease.com`
            });
            console.log(`✅ Manager Key ${i} created: ${keyCode}`);
        }

        // 3. Create Categories
        const categories = [
            { name: 'Electronics', slug: 'electronics', image: 'https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?auto=format&fit=crop&w=500' },
            { name: 'Fashion', slug: 'fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=500' },
            { name: 'Home & Living', slug: 'home-living', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=500' }
        ];

        const categoryMap: Record<string, string> = {};

        for (const cat of categories) {
            const check = await query('SELECT id FROM categories WHERE slug = $1', [cat.slug]);
            let catId;
            if (check.rows.length === 0) {
                const res = await query(
                    'INSERT INTO categories (name, slug, image_url) VALUES ($1, $2, $3) RETURNING id',
                    [cat.name, cat.slug, cat.image]
                );
                catId = res.rows[0].id;
                console.log(`✅ Category '${cat.name}' created.`);
            } else {
                catId = check.rows[0].id;
            }
            categoryMap[cat.name] = catId;
        }

        // 4. Create Supplier
        const supplierEmail = 'supplier@shopease.com';
        let supplierId;
        const existingSupplier = await UserModel.findByEmail(supplierEmail);
        if (!existingSupplier) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash('Supplier@123', salt);
            const res = await query(
                `INSERT INTO users (name, email, password_hash, role, is_verified, supplier_status, business_name, gst_number)
             VALUES ($1, $2, $3, 'SUPPLIER', true, 'APPROVED', 'Prime Supplies', 'GSTIN12345')
             RETURNING id`,
                ['Demo Supplier', supplierEmail, hash]
            );
            supplierId = res.rows[0].id;
            console.log('✅ Supplier created.');
        } else {
            supplierId = existingSupplier.id;
        }

        // 5. Create 10 Premium Products
        const products = [
            { name: 'Sony WH-1000XM5', cat: 'Electronics', price: 29999, img: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=500' },
            { name: 'MacBook Air M2', cat: 'Electronics', price: 99900, img: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=500' },
            { name: 'Samsung S24 Ultra', cat: 'Electronics', price: 129000, img: 'https://images.unsplash.com/photo-1610945265078-3858a0820dc3?auto=format&fit=crop&w=500' },
            { name: 'Nike Air Jordan', cat: 'Fashion', price: 12500, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500' },
            { name: 'Levis Denim Jacket', cat: 'Fashion', price: 4500, img: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=500' },
            { name: 'Ray-Ban Aviator', cat: 'Fashion', price: 8900, img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=500' },
            { name: 'Herman Miller Chair', cat: 'Home & Living', price: 45000, img: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=500' },
            { name: 'Dyson Air Purifier', cat: 'Home & Living', price: 32000, img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=500' },
            { name: 'Philips Hue Bulbs', cat: 'Home & Living', price: 3500, img: 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=500' },
            { name: 'iPad Pro 12.9', cat: 'Electronics', price: 85000, img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=500' }
        ];

        for (const p of products) {
            const catId = categoryMap[p.cat];
            const check = await query('SELECT id FROM products WHERE name = $1', [p.name]);
            if (check.rows.length === 0) {
                await query(
                    `INSERT INTO products (supplier_id, category_id, name, description, price, stock, images, is_active)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
                    [supplierId, catId, p.name, `Premium ${p.name} - Official Global Version`, p.price, 50, [p.img]]
                );
                console.log(`✅ Product '${p.name}' created.`);
            }
        }

        console.log('✨ Seeding completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seed();
