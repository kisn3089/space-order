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
  shouldSuccess?: boolean;
};
export default async function ServerPrefetch({
  url,
  children,
  shouldSuccess,
}: ServerPrefetchProps) {
  const queryClient = new QueryClient();
  const accessToken = await getAccessToken();

  const fetchData = async () => {
    return http
      .get(url, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((res) => res.data);
  };

  /**
   * shouldSuccess가 true인 경우 fetchQuery를 사용하는데 실패할 경우 상위 컴포넌트에서
   * 에러 처리를 할 수 있도록 하기 위함이다.
   * 그렇지 않은 경우 prefetchQuery를 사용하여 에러가 발생하더라도 무시하고 클라이언트에서 시도한다.
   *
   * @see {@link file://./(navigator)/error.tsx}
   */
  await (shouldSuccess
    ? queryClient.fetchQuery({ queryKey: [url], queryFn: fetchData })
    : queryClient.prefetchQuery({ queryKey: [url], queryFn: fetchData }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
