import { adminRepository } from './src/repositories';
import * as bcrypt from 'bcryptjs';

async function reset() {
  const admin = await adminRepository.findByEmail('0911111111@waffer.local');
  if (admin) {
    const hashedPassword = await bcrypt.hash('Admin123!@#', 10);
    await adminRepository.updateById(admin.id, { password: hashedPassword });
    console.log('Password reset successfully');
  } else {
    console.log('Admin not found');
  }
  process.exit(0);
}

reset();
