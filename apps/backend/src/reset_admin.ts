import './database/models/index';
import { adminRepository } from './repositories/index';
import * as bcrypt from 'bcryptjs';

export async function reset() {
  try {
    const admin = await adminRepository.findOne({ role: 'super_admin' });
    if (!admin) {
      return;
    }

    const password = await bcrypt.hash('000000', 12);
    await adminRepository.updateById(admin.id, { password });
  } catch (error) {
    // Ignore error
  }
}
// Empty file or removed console logs
