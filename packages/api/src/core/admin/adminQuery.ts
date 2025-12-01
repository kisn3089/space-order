import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { httpAdmin } from "@spaceorder/api/core/admin/httpAdmin";
import { Admin } from "@spaceorder/db/client";

type GetAdminListQuery = Omit<UseQueryOptions<Admin[]>, "queryFn" | "select">;
export const getAdminListQuery = (queryOptions?: GetAdminListQuery) => {
  const { queryKey = ["admins"], ...restOptions } = queryOptions ?? {};
  return useQuery<Admin[]>({
    queryKey,
    queryFn: httpAdmin.getAdminList,
    select: (data: Admin[]) => data,
    ...restOptions,
  });
};

// export const
