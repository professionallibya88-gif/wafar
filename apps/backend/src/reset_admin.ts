import './database/models/index';
import { adminRepository } from './repositories/index';
import * as bcrypt from 'bcryptjs';

async function reset() {
  const admin = await adminRepository.findOne({ role: 'super_admin' });
  if (admin) {
    const password = await bcrypt.hash('000000', 12);
    await adminRepository.updateById(admin.id, { password });
    console.log('Password reset to 000000!');
  } else {
    console.log('Admin not found!');
  }
}
reset()
  .catch(console.error)
  .finally(() => process.exit(0));
