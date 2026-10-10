import { Sequelize } from 'sequelize';
import 'dotenv/config';

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'collaborative_task_manager',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    multipleStatements: true,
  },
});

export default sequelize;
