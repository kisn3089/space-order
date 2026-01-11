import { PublicOrderWithItem } from "@spaceorder/db";
import { QueryOptions, useMutation, useQuery } from "@tanstack/react-query";
import {
  FetchOrderParams,
  FetchOrderUniqueParams,
  httpOrders,
} from "./httpOwnerOrders";

type FetchOrderList = {
  fetchParams: FetchOrderParams;
  queryOptions?: QueryOptions<PublicOrderWithItem[]>;
  enabled?: boolean;
};

const fetchOrderList = ({
  queryOptions,
  fetchParams,
  enabled,
}: FetchOrderList) => {
  const { queryKey = ["owner", "orders", fetchParams], ...restOptions } =
    queryOptions ?? {};
  return useQuery<PublicOrderWithItem[]>({
    queryKey,
    queryFn: () => httpOrders.fetchList(fetchParams),
    select: (data) => data,
    enabled,
    ...restOptions,
  });
};

type FetchOrderUnique = {
  fetchParams: FetchOrderUniqueParams;
  queryOptions?: QueryOptions<PublicOrderWithItem>;
  enabled?: boolean;
};

const fetchOrderUnique = ({
  queryOptions,
  fetchParams,
  enabled,
}: FetchOrderUnique) => {
  const { queryKey = ["owner", "order", fetchParams], ...restOptions } =
    queryOptions ?? {};
  return useQuery<PublicOrderWithItem>({
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
