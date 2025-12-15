import { QueryOptions, useQuery } from "@tanstack/react-query";
import { PlainOwner } from "@spaceorder/db";
import { httpOwners } from "./httpOnwers";

type FindAll = { queryOptions?: QueryOptions<PlainOwner[]>; enabled?: boolean };
const findAll = ({ queryOptions, enabled }: FindAll) => {
  const { queryKey = ["owners"], ...restOptions } = queryOptions ?? {};
  return useQuery<PlainOwner[]>({
    queryKey,
    queryFn: httpOwners.findAll,
    select: (data) => data,
    enabled,
    ...restOptions,
  });
};

type FindOne = {
  queryOptions?: QueryOptions<PlainOwner>;
  publicId: string;
};
const findOne = ({ publicId, queryOptions }: FindOne) => {
  const { queryKey = ["owners"], ...restOptions } = queryOptions ?? {};
  return useQuery<PlainOwner>({
    queryKey,
    queryFn: () => httpOwners.findOne(publicId),
    select: (data) => data,
    ...restOptions,
  });
};

export const ownersQuery = {
  findAll,
  findOne,
};
