import { PublicOrder } from "@spaceorder/db";
import { QueryOptions, useQuery } from "@tanstack/react-query";
import {
  FetchOrderListParams,
  FetchOrderUniqueParams,
  httpOrders,
} from "./httpOrders";

type FetchOrderList = {
  fetchParams: FetchOrderListParams;
  queryOptions?: QueryOptions<PublicOrder[]>;
  enabled?: boolean;
};

const fetchOrderList = ({
  queryOptions,
  fetchParams,
  enabled,
}: FetchOrderList) => {
  const { queryKey = ["orders", fetchParams], ...restOptions } =
    queryOptions ?? {};
  return useQuery<PublicOrder[]>({
    queryKey,
    queryFn: () => httpOrders.fetchList(fetchParams),
    select: (data) => data,
    enabled,
    ...restOptions,
  });
};

type FetchOrderUnique = {
  fetchParams: FetchOrderUniqueParams;
  queryOptions?: QueryOptions<PublicOrder>;
  enabled?: boolean;
};
const fetchOrderUnique = ({
  queryOptions,
  fetchParams,
  enabled,
}: FetchOrderUnique) => {
  const { queryKey = ["order", fetchParams], ...restOptions } =
    queryOptions ?? {};
  return useQuery<PublicOrder>({
    queryKey,
    queryFn: () => httpOrders.fetchUnique(fetchParams),
    select: (data) => data,
    enabled,
    ...restOptions,
  });
};

export const orderQuery = {
  fetchOrderList,
  fetchOrderUnique,
};
