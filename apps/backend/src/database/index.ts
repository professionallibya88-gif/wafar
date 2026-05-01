import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';
import logger from '../config/logger';

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? (msg) => logger.info(msg) : false,
    dialectOptions: {
      statement_timeout: 30000,
      query_timeout: 30000,
    },
    pool: {
      max: 25,
      min: 5,
      acquire: 30000,
      idle: 10000,
      evict: 1000,
    },
    define: {
      underscored: true,
      timestamps: true,
      paranoid: true,
    },
    retry: {
      max: 3,
      match: [
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
      ],
    },
  }
);

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Unable to connect to the database:', message);
    throw error;
  }
};

export const syncDatabase = async () => {
  try {
    // تحميل النماذج والعلاقات
    await import('./models/index');

    const shouldAlter =
      process.env.NODE_ENV === 'development' && process.env.DB_AUTO_ALTER === 'true';
    await sequelize.sync({ alter: shouldAlter });
    logger.info(`Database synchronized successfully (alter=${shouldAlter}).`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Failed to sync database:', message);
    throw error;
  }
};
