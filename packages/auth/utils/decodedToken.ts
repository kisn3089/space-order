import { TokenPayloadDecoded } from "@spaceorder/db";
import { jwtDecode } from "jwt-decode";

export function isExpired(token: string | undefined) {
  if (!token) return false;

  const decodedToken = jwtDecode<TokenPayloadDecoded>(token ?? "");
  if (Date.now() >= decodedToken.exp * 1000) {
    return true;
  }
}
