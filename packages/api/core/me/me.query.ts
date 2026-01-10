import {
  PublicOwner,
  PublicStoreWithTablesAndOrders,
  PublicTable,
} from "@spaceorder/db";
import { QueryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const { queryKey = ["me", "all"], ...restOptions } = queryOptions ?? {};

  return useQuery<PublicStoreWithTablesAndOrders>({
    queryKey,
    queryFn: async () => {
      const store = await httpMe.fetchMyOrderList();

      if (store.publicId && store.tables) {
        store.tables.forEach((table) => {
          if (table.tableSessions && table.tableSessions[0]) {
            queryClient.setQueryData(
              ["orders", { storeId: store.publicId, tableId: table.publicId }],
              table.tableSessions[0].orders
            );
          }
        });

        queryClient.setQueryData(
          ["tables", { storeId: store.publicId }],
          store.tables
        );
      }

      return store;
    },
    select: (data) => data,
    enabled,
    ...restOptions,
  });
};

export const meQuery = {
  findMe,
  fetchMyOrderListAllinclusive,
};
