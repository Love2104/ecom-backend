import { Pool } from 'pg';
import logger from '../utils/logger';

<<<<<<< HEAD
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
=======
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon in some envs where CA is not present
  }
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
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
<<<<<<< HEAD
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database error:', error);
    console.error('Query:', text);
    console.error('Params:', params);
=======
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
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
    throw error;
  }
};


export default pool;
