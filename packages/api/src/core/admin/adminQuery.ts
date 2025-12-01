import { QueryOptions, useQuery } from "@tanstack/react-query";
import { httpAdmin } from "@spaceorder/api/core/admin/httpAdmin";
import { Admin } from "@spaceorder/db/client";

const findAll = (queryOptions?: QueryOptions<Admin[]>) => {
  const { queryKey = ["admins"], ...restOptions } = queryOptions ?? {};
  return useQuery<Admin[]>({
    queryKey,
    queryFn: httpAdmin.findAll,
    select: (data) => data,
    ...restOptions,
  });
};

type FindOneProps = {
  queryOptions?: QueryOptions<Admin>;
  publicId: string;
};
const findOne = ({ publicId, queryOptions }: FindOneProps) => {
  const { queryKey = ["admin"], ...restOptions } = queryOptions ?? {};
  return useQuery<Admin>({
    queryKey,
    queryFn: () => httpAdmin.findOne(publicId),
    select: (data) => data,
    ...restOptions,
  });
};

export const adminQuery = {
  findAll,
  findOne,
};
