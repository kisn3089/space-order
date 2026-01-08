import { QueryOptions, useQuery } from "@tanstack/react-query";
import { PublicOwner } from "@spaceorder/db";
import { httpOwners } from "./httpOwners";

type FetchOwnerList = {
  queryOptions?: QueryOptions<PublicOwner[]>;
  enabled?: boolean;
};
const fetchOwnerList = ({ queryOptions, enabled }: FetchOwnerList) => {
  const { queryKey = ["owners"], ...restOptions } = queryOptions ?? {};
  return useQuery<PublicOwner[]>({
    queryKey,
    queryFn: httpOwners.fetchList,
    select: (data) => data,
    enabled,
    ...restOptions,
  });
};

type FetchOwnerUnique = {
  queryOptions?: QueryOptions<PublicOwner>;
  publicId: string;
};
const fetchOwnerUnique = ({ publicId, queryOptions }: FetchOwnerUnique) => {
  const { queryKey = ["owners"], ...restOptions } = queryOptions ?? {};
  return useQuery<PublicOwner>({
    queryKey,
    queryFn: () => httpOwners.fetchUnique(publicId),
    select: (data) => data,
    ...restOptions,
  });
};

export const ownersQuery = {
  fetchOwnerList,
  fetchOwnerUnique,
};
