// Scripts that require DB connection should initialize the repository layer
import { adminRepository } from './repositories/index';
import * as bcrypt from 'bcryptjs';
import { SINGLE_ADMIN_PASSWORD } from './repositories/AdminRepository';

export async function reset() {
  try {
    const password = await bcrypt.hash(SINGLE_ADMIN_PASSWORD, 12);
    await adminRepository.enforceSingleAdmin(password);
  } catch (error) {
    // Ignore error
  }
}
// Empty file or removed console logs
