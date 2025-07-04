import { Pool } from 'pg';
import logger from '../utils/logger';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

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
