import axios from 'axios';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from './src/config/auth';
import { sequelize } from './src/database';
import { userRepository, adminRepository, supplierRepository } from './src/repositories';
import * as bcrypt from 'bcryptjs';

async function test() {
  try {
    await sequelize.authenticate();
    const admin = await adminRepository.findOne({ is_active: true });
    
    // Create user
    const user = await userRepository.create({
      full_name: 'Supplier Test',
      phone: '0919998889',
      password: await bcrypt.hash('123456', 10),
      role: 'supplier',
      is_active: true,
    });
    
    // Create supplier
    await supplierRepository.create({
      user_id: user.id,
      company_name: 'Test Company',
      commercial_register: '123456',
      tax_number: '123456',
      contact_person: 'Test Person',
      contact_phone: '0919998889',
      address: 'Tripoli',
      city: 'Tripoli',
      is_approved: true
    });
    
    console.log('Created supplier user:', user.id);
    const token = jwt.sign({ id: admin!.id, isAdmin: true }, getJwtSecret(), { expiresIn: '1h' });
    
    const res = await axios.delete(`http://localhost:5050/api/admin/users/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` }
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