export type SignInRequest = {
  email: string;
  password: string;
};

export type SignInResponse = {
  accessToken: string;
  expiresAt: Date;
};
