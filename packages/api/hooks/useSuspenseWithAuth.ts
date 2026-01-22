import { useAuthInfo } from "@spaceorder/auth";
import {
  useSuspenseQuery,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query";
import { http } from "../core";

type QueryParams<Data, Error> = {
  queryOptions?: UseSuspenseQueryOptions<Data, Error>;
  onSuccess?: (data: Data) => void;
};
export default function useSuspenseWithAuth<Data, Error = any>(
  url: string,
  queryParams?: QueryParams<Data, Error>
) {
  const { authInfo } = useAuthInfo();

  const { queryOptions, onSuccess } = queryParams ?? {};
  return useSuspenseQuery<Data, Error>({
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
    ...queryOptions,
  });
}
