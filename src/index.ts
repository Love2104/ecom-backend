import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import logger from './utils/logger';
import { connectDB } from './config/db';

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB()
  .then(() => {
    // Start the server
    app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error('Failed to connect to the database:', error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});