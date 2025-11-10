import createApp from './app';
import config from './config/environment';
import logger from './utils/logger';
import DatabaseClient from './config/database';

const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    const dbClient = DatabaseClient.getInstance();
    const isConnected = await dbClient.testConnection();
    
    if (!isConnected) {
      logger.warn('Database connection test failed. Server will start but may not function properly.');
    }

    // Create Express app
    const app = createApp();

    // Start listening
    const server = app.listen(config.PORT, () => {
      logger.info(`🚀 Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
      logger.info(`📝 API available at http://localhost:${config.PORT}/api`);
      logger.info(`🏥 Health check at http://localhost:${config.PORT}/api/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
