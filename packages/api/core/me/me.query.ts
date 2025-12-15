import { PlainOwner } from "@spaceorder/db";
import { QueryOptions, useQuery } from "@tanstack/react-query";
import { httpMe } from "./httpMe";

type FindAll = {
  queryOptions?: QueryOptions<PlainOwner>;
  enabled?: boolean;
  accessToken?: string;
};
const findMe = ({ queryOptions, accessToken, enabled }: FindAll) => {
  const { queryKey = ["me"], ...restOptions } = queryOptions ?? {};
  return useQuery<PlainOwner>({
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
