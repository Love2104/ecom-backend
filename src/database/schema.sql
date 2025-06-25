-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  image VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  discount INTEGER DEFAULT 0,
  rating DECIMAL(3, 1) DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  shipping_address JSONB NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  method VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_reference VARCHAR(100) NOT NULL UNIQUE,
  payment_details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sample Products Data
INSERT INTO products (name, description, price, original_price, image, category, discount, rating, stock, tags)
VALUES
  ('Smartphone X', 'Latest smartphone with advanced features', 799.99, 899.99, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'Electronics', 10, 4.5, 50, ARRAY['smartphone', 'electronics', 'gadget']),
  ('Wireless Headphones', 'Noise-cancelling wireless headphones', 199.99, 249.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'Electronics', 20, 4.3, 100, ARRAY['headphones', 'audio', 'wireless']),
  ('Smart Watch', 'Fitness tracking smart watch', 149.99, 179.99, 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=2944&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'Electronics', 15, 4.2, 75, ARRAY['watch', 'fitness', 'wearable']),
  ('Laptop Pro', 'High-performance laptop for professionals', 1299.99, 1499.99, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'Electronics', 12, 4.7, 30, ARRAY['laptop', 'computer', 'work']),
  ('Casual T-Shirt', 'Comfortable cotton t-shirt', 24.99, 29.99, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2880&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'Clothing', 15, 4.0, 200, ARRAY['tshirt', 'casual', 'clothing']),
  ('Running Shoes', 'Lightweight running shoes', 89.99, 109.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'Footwear', 18, 4.4, 80, ARRAY['shoes', 'running', 'sports']),
  ('Coffee Maker', 'Automatic drip coffee maker', 49.99, 59.99, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'Home', 15, 4.1, 60, ARRAY['coffee', 'kitchen', 'appliance']),
  ('Backpack', 'Durable backpack for everyday use', 39.99, 49.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'Accessories', 20, 4.2, 120, ARRAY['backpack', 'bag', 'travel']),
  ('Smart Speaker', 'Voice-controlled smart speaker', 79.99, 99.99, 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?q=80&w=2938&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'Electronics', 20, 4.3, 40, ARRAY['speaker', 'smart home', 'audio']),
  ('Yoga Mat', 'Non-slip yoga mat', 29.99, 34.99, 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'Fitness', 15, 4.0, 100, ARRAY['yoga', 'fitness', 'exercise']),
  ('Digital Camera', 'High-resolution digital camera', 599.99, 699.99, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2938&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'Electronics', 15, 4.6, 25, ARRAY['camera', 'photography', 'digital']),
  ('Desk Lamp', 'Adjustable LED desk lamp', 34.99, 44.99, 'https://images.unsplash.com/photo-1534381734677-c82e2637f588?q=80&w=2000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'Home', 22, 4.1, 70, ARRAY['lamp', 'lighting', 'desk'])
ON CONFLICT DO NOTHING;

-- Create admin user (password: admin123)
INSERT INTO users (name, email, password, role)
VALUES ('Admin User', 'admin@example.com', '$2a$10$eCj7J0Xn7nHfkvdRxFOK0uZs.EUcO7DlwQMcgdHJwi/JFGlYhEfVe', 'admin')
ON CONFLICT DO NOTHING;