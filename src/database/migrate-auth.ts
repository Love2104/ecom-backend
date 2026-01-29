
import dotenv from 'dotenv';
dotenv.config();

import { query } from '../config/db';
import logger from '../utils/logger';

const runMigration = async () => {
    try {
        logger.info('Starting Auth migration...');

        // Add columns if they don't exist
        await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS otp_code VARCHAR(10),
      ADD COLUMN IF NOT EXISTS otp_expires TIMESTAMP WITH TIME ZONE;
    `);

        // Mark existing users as verified so they aren't locked out
        await query(`UPDATE users SET is_verified = TRUE WHERE is_verified IS NULL`);

        logger.info('Auth migration completed successfully.');
        process.exit(0);
    } catch (error) {
        logger.error('Error during migration:', error);
        process.exit(1);
    }
};

runMigration();
