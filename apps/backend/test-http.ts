import axios from 'axios';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from './src/config/auth';
import { sequelize } from './src/database';

async function test() {
  try {
    await sequelize.authenticate();
    const { adminRepository } = await import('./src/repositories');
    const admin = await adminRepository.findOne({ is_active: true });
    if (!admin) {
      console.log('No admin found');
      return;
    }
    const token = jwt.sign({ id: admin.id, isAdmin: true }, getJwtSecret(), { expiresIn: '1h' });
    const res = await axios.delete('http://localhost:5050/api/admin/users/bc42bc53-ba7d-49a4-b891-db8b6b5b39ef', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Success:', res.data);
  } catch (err: any) {
    if (err.response) {
      console.error('Error response:', err.response.status, err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  } finally {
    await sequelize.close();
  }
}
test();