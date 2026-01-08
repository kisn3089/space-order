import { QueryOptions, useQuery } from "@tanstack/react-query";
import { PublicOwner, PublicStore } from "@spaceorder/db";
import { httpStores } from "./httpStore";

type FetchStoreList = {
  queryOptions?: QueryOptions<PublicStore[]>;
  enabled?: boolean;
};
const fetchStoreList = ({ queryOptions, enabled }: FetchStoreList) => {
  const { queryKey = ["stores"], ...restOptions } = queryOptions ?? {};
  return useQuery<PublicStore[]>({
    queryKey,
    queryFn: httpStores.fetchList,
    select: (data) => data,
    enabled,
    ...restOptions,
  });
};

type FetchStoreUnique = {
  queryOptions?: QueryOptions<PublicStore>;
  storeId: string;
};
const fetchStoreUnique = ({ storeId, queryOptions }: FetchStoreUnique) => {
  const { queryKey = ["stores", storeId], ...restOptions } = queryOptions ?? {};
  return useQuery<PublicStore>({
    queryKey,
    queryFn: () => httpStores.fetchUnique(storeId),
    select: (data) => data,
    ...restOptions,
  });
};

export const storesQuery = {
  fetchStoreList,
  fetchStoreUnique,
};
