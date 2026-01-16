export interface TokenPayload extends DomainTokenPayload {
  sub: string;
  role: 'owner' | 'admin';
  typ: 'Bearer';
  aud?: string[];
  iss?: string;
}

interface DomainTokenPayload {
  email?: string;
  username?: string;
  // [TODO:] verify 추가 필요
}
