import { TokenPayload } from '@spaceorder/db';

export function isAdmin(role: TokenPayload['role']): boolean {
  return role === 'admin';
}
