import { PublicOwner, PublicStoreWithTablesAndOrders } from "@spaceorder/db";
import { QueryOptions, useQuery } from "@tanstack/react-query";
import { httpMe } from "./httpMe";

type FetchMeParams = {
  queryOptions?: QueryOptions<PublicOwner>;
  enabled?: boolean;
  accessToken?: string;
};

const findMe = ({ queryOptions, accessToken, enabled }: FetchMeParams) => {
  const { queryKey = ["me"], ...restOptions } = queryOptions ?? {};
  return useQuery<PublicOwner>({
    queryKey,
    queryFn: () => httpMe.fetchMe(accessToken),
    select: (data) => data,
    // enabled: false,
    enabled,
    ...restOptions,
  });
};

type FetchMyOrderListParams = {
  queryOptions?: QueryOptions<PublicStoreWithTablesAndOrders>;
  enabled?: boolean;
};
const fetchMyOrderListAllinclusive = ({
  queryOptions,
  enabled,
}: FetchMyOrderListParams) => {
  const { queryKey = ["me", "all"], ...restOptions } = queryOptions ?? {};
  return useQuery<PublicStoreWithTablesAndOrders>({
    queryKey,
    queryFn: () => httpMe.fetchMyOrderList(),
    select: (data) => data,
    // enabled: false,
    enabled,
    ...restOptions,
  });
};

export const meQuery = {
  findMe,
  fetchMyOrderListAllinclusive,
};
