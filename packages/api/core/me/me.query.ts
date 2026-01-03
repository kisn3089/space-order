import { PublicOwner } from "@spaceorder/db";
import { QueryOptions, useQuery } from "@tanstack/react-query";
import { httpMe } from "./httpMe";

type FindAll = {
  queryOptions?: QueryOptions<PublicOwner>;
  enabled?: boolean;
  accessToken?: string;
};
const findMe = ({ queryOptions, accessToken, enabled }: FindAll) => {
  const { queryKey = ["me"], ...restOptions } = queryOptions ?? {};
  return useQuery<PublicOwner>({
    queryKey,
    queryFn: () => httpMe.me(accessToken),
    select: (data) => data,
    // enabled: false,
    enabled,
    ...restOptions,
  });
};

export const meQuery = {
  findMe,
};
