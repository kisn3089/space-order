import { useAuthInfo } from "@spaceorder/auth";
import { QueryOptions, useQuery } from "@tanstack/react-query";
import { http } from "../core";

type QueryParams<Data, Error> = {
  queryOptions?: QueryOptions<Data, Error>;
  enabled?: boolean;
  onSuccess?: (data: Data) => void;
};
export default function useQueryWithAuth<Data, Error = any>(
  url: string,
  queryParams?: QueryParams<Data, Error>
) {
  const { authInfo } = useAuthInfo();

  const { queryOptions, enabled, onSuccess } = queryParams ?? {};
  return useQuery<Data, Error>({
    queryKey: [url],
    queryFn: async () => {
      const result = await http
        .get(url, {
          headers: {
            Authorization: `Bearer ${authInfo.accessToken}`,
          },
        })
        .then((res) => res.data);
      if (onSuccess) {
        onSuccess(result);
      }
      return result;
    },
    enabled,
    ...queryOptions,
  });
}
