import * as bcrypt from 'bcrypt';

/**
 * Hashes a plaintext password using bcrypt.
 *
 * @param value - The plaintext password to hash
 * @returns The bcrypt hash of `value`
 */
export async function encryptPassword(value: string): Promise<string> {
  return await bcrypt.hash(value, 10);
}

/**
 * Verify whether a plaintext password matches a bcrypt hash.
 *
 * @param plainPassword - The plaintext password to verify
 * @param hashedPassword - The bcrypt hashed password to compare against
 * @returns `true` if `plainPassword` matches `hashedPassword`, `false` otherwise
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * 이메일로 Admin 찾기 (로그인용)
 */
//   async findByEmail(email: string) {
//     return await this.prismaService.admin.findUnique({
//       where: { email },
//     });
//   }