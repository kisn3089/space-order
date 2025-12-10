export type SignInRequest = {
  email: string;
  password: string;
};

export type SignInResponse = {
  accessToken: string;
  expiresAt: Date;
};

export type SignInErrorResponse = {
  error: string;
  message: string;
  statusCode: number;
};
