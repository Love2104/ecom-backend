import dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';

console.log('Testing DB connection...');
console.log('URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@')); // Hide password

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000 // 5s timeout
});

pool.connect()
    .then(client => {
        console.log('✅ Connected successfully to DB!');
        client.release();
        pool.end();
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    });
