import './database/models/index';
import { adminRepository } from './repositories/index';
import * as bcrypt from 'bcryptjs';

async function reset() {
  const admin = await adminRepository.findOne({ role: 'super_admin' });
  if (admin) {
    admin.password = await bcrypt.hash('admin1234', 12);
    await adminRepository.updateById(admin.id, { password: admin.password });
    console.log('Password reset!');
  } else {
    console.log('Admin not found!');
  }
}
reset()
  .catch(console.error)
  .finally(() => process.exit(0));
