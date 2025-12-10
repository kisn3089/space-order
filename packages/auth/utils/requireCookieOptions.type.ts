export type RequireCookieOptions = {
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none";
  secure: boolean;
  path?: string;
  expires?: Date | undefined;
  encode?: ((val: string) => string) | undefined;
};
