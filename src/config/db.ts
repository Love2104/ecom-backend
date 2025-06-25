import { Pool } from 'pg';
import logger from '../utils/logger';

// Create a new pool instance
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Connect to the database
export const connectDB = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    logger.info('PostgreSQL connected');
    client.release();
  } catch (error) {
    logger.error('PostgreSQL connection error:', error);
    throw error;
  }
};

// Execute a query
export const query = async (text: string, params?: any[]): Promise<any> => {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    logger.debug(`Executed query: ${text}`);
    logger.debug(`Duration: ${duration}ms, Rows: ${res.rowCount}`);
    
    return res;
  } catch (error) {
    logger.error('Query error:', error);
    throw error;
  }
};

export default pool;