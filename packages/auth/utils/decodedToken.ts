import { TokenPayloadDecoded } from "@spaceorder/db";
import { jwtDecode } from "jwt-decode";

export function isExpired(token: string | undefined): boolean {
  if (!token) return true;

  const decodedToken = jwtDecode<TokenPayloadDecoded>(token);
  if (Date.now() >= decodedToken.exp * 1000) {
    return true;
  }

  return false;
}
