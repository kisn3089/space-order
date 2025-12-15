import * as bcrypt from 'bcrypt';

/**
 * 비밀번호 암호화
 */
export async function encryptPassword(value: string): Promise<string> {
  return await bcrypt.hash(value, 10);
}

/**
 * 로그인 시 비밀번호 검증
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
