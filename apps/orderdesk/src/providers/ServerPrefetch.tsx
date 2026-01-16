"use server";

import { getAccessToken } from "@/app/common/servers/getAccessToken";
import { http } from "@spaceorder/api";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

type ServerPrefetchProps = {
  url: string;
  children: React.ReactNode;
};
export default async function ServerPrefetch({
  url,
  children,
}: ServerPrefetchProps) {
  const queryClient = new QueryClient();
  const accessToken = await getAccessToken();

  await queryClient.prefetchQuery({
    queryKey: [url],
    queryFn: async () =>
      await http
        .get(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
