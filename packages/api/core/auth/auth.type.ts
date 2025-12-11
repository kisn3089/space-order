import { PlainOwner } from "@spaceorder/db";

export type AccessToken = {
  accessToken: string;
  expiresAt: Date;
};

export type SignInRequest = {
  email: string;
  password: string;
};

export type SignInResponse = {
  owner: PlainOwner;
  auth: AccessToken;
};

export type SignInErrorResponse = {
  error: string;
  message: string;
  statusCode: number;
};
