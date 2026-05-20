import { AxiosResponse } from "axios";
import { http } from "../../axios";

const prefix = "stores/v1/sessions";

async function createSession(
  qrCode: string
): Promise<AxiosResponse<{ sessionToken: string }>> {
  return await http.post<{ sessionToken: string }>(`${prefix}`, {
    qrCode,
  });
}

export const httpSession = {
  createSession,
};
