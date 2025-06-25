# ShopEase E-Commerce API

This is the backend API for the ShopEase e-commerce application, built with Node.js, Express, TypeScript, and PostgreSQL.

## API Base URL

The API is hosted at: https://ecom-backend-40dr.onrender.com

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/auth/register` | Register a new user | `{ name, email, password }` | `{ success, token, user }` |
| POST | `/api/auth/login` | Login a user | `{ email, password }` | `{ success, token, user }` |
| GET | `/api/auth/me` | Get current user | - | `{ success, user }` |
| PUT | `/api/auth/profile` | Update user profile | `{ name, email, password }` | `{ success, user }` |

### Product Endpoints

| Method | Endpoint | Description | Query Parameters | Response |
|--------|----------|-------------|------------------|----------|
| GET | `/api/products` | Get all products | `search, category, minPrice, maxPrice, sort, page, limit` | `{ success, count, total, page, pages, products }` |
| GET | `/api/products/:id` | Get a single product | - | `{ success, product }` |
| GET | `/api/products/featured` | Get featured products | `limit` | `{ success, count, products }` |
| GET | `/api/products/new-arrivals` | Get new arrivals | `limit` | `{ success, count, products }` |
| GET | `/api/products/on-sale` | Get products on sale | `limit` | `{ success, count, products }` |
| GET | `/api/products/:id/related` | Get related products | `limit` | `{ success, count, products }` |
| POST | `/api/products` | Create a product (admin) | `{ name, description, price, image, category, stock, ... }` | `{ success, product }` |
| PUT | `/api/products/:id` | Update a product (admin) | `{ name, price, ... }` | `{ success, product }` |
| DELETE | `/api/products/:id` | Delete a product (admin) | - | `{ success, message }` |

### Order Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/orders` | Create a new order | `{ items, shipping_address, payment_method }` | `{ success, order }` |
| GET | `/api/orders/my-orders` | Get user's orders | - | `{ success, count, orders }` |
| GET | `/api/orders/:id` | Get order by ID | - | `{ success, order }` |
| PUT | `/api/orders/:id/status` | Update order status (admin) | `{ status }` | `{ success, order }` |

### Payment Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/payments/create-intent` | Create payment intent | `{ orderId, method }` | `{ success, payment, upi? }` |
| POST | `/api/payments/verify-upi` | Verify UPI payment | `{ paymentReference }` | `{ success, payment }` |
| POST | `/api/payments/process-card` | Process card payment | `{ paymentId, cardDetails }` | `{ success, payment }` |
| GET | `/api/payments/:id` | Get payment status | - | `{ success, payment }` |

## Authentication

All protected endpoints require a JWT token to be included in the request headers: