import { Pool } from 'pg';
import logger from '../utils/logger';

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon in some envs where CA is not present
  }
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
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('--- DATABASE QUERY ---');
    console.log('QUERY:', text);
    console.log('PARAMS:', JSON.stringify(params));
    console.log('DURATION:', duration, 'ms');
    console.log('ROWS:', res.rowCount);
    console.log('----------------------');
    return res;
  } catch (error: any) {
    const duration = Date.now() - start;
    console.error('--- DATABASE ERROR ---');
    console.error('QUERY:', text);
    console.error('PARAMS:', JSON.stringify(params));
    console.error('DURATION:', duration, 'ms');
    console.error('ERROR:', error.message);
    console.error('----------------------');
    throw error;
  }
};


export default pool;
