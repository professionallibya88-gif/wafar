import { userService } from './src/services/UserService';
import { sequelize } from './src/database';

async function run() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    const userId = 'bc42bc53-ba7d-49a4-b891-db8b6b5b39ef';
    await userService.deleteUser(userId);
    console.log('Success');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await sequelize.close();
  }
}

run();