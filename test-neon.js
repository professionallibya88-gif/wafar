const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'neondb',
  'neondb_owner',
  'npg_8qwI9XEnbxSf',
  {
    host: 'ep-blue-surf-alhqmmt6-pooler.c-3.eu-central-1.aws.neon.tech',
    port: 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  });