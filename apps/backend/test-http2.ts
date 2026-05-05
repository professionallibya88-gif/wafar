import axios from 'axios';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from './src/config/auth';
import { sequelize } from './src/database';
import { userService } from './src/services/UserService';
import * as bcrypt from 'bcryptjs';

async function test() {
  try {
    await sequelize.authenticate();
    const { adminRepository, userRepository } = await import('./src/repositories');
    const admin = await adminRepository.findOne({ is_active: true });
    if (!admin) {
      console.log('No admin found');
      return;
    }
    
    // Create a dummy user directly via repo
    const user = await userRepository.create({
      full_name: 'Test User',
      phone: '0911234567',
      password: await bcrypt.hash('123456', 10),
      role: 'retailer',
      is_active: true,
    });
    
    console.log('Created user:', user.id);
    
    const token = jwt.sign({ id: admin.id, isAdmin: true }, getJwtSecret(), { expiresIn: '1h' });
    const res = await axios.delete(`http://localhost:5050/api/admin/users/${user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Delete Success:', res.data);
  } catch (err: any) {
    if (err.response) {
      console.error('Delete Error response:', err.response.status, err.response.data);
    } else {
      console.error('Delete Error:', err.message);
    }
  } finally {
    await sequelize.close();
  }
}
test();