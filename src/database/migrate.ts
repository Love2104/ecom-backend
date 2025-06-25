import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { query } from '../config/db';
import logger from '../utils/logger';

const runMigration = async () => {
  try {
    logger.info('Starting database migration...');

    // Read the schema.sql file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the SQL
    await query(schema);

    logger.info('Database migration completed successfully.');
    process.exit(0);
  } catch (error) {
    logger.error('Error during migration:', error);
    process.exit(1);
  }
};

// Connect to the database and run migration
runMigration();