import { QueryOptions, useQuery } from "@tanstack/react-query";
import { PublicTable } from "@spaceorder/db";
import {
  FetchTableListParams,
  FetchTableUniqueParams,
  httpTables,
} from "./httpTables";

type FetchTableList = {
  queryOptions?: QueryOptions<PublicTable[]>;
  fetchParams: FetchTableListParams;
  enabled?: boolean;
};
const fetchTableList = ({
  queryOptions,
  enabled,
  fetchParams,
}: FetchTableList) => {
  const { queryKey = ["tables", fetchParams], ...restOptions } =
    queryOptions ?? {};
  return useQuery<PublicTable[]>({
    queryKey,
    queryFn: () => httpTables.fetchList(fetchParams),
    select: (data) => data,
    enabled,
    ...restOptions,
  });
};

type FetchTableUnique = {
  queryOptions?: QueryOptions<PublicTable>;
  fetchParams: FetchTableUniqueParams;
};
const fetchTableUnique = ({ fetchParams, queryOptions }: FetchTableUnique) => {
  const { queryKey = ["tables", fetchParams], ...restOptions } =
    queryOptions ?? {};
  return useQuery<PublicTable>({
    queryKey,
    queryFn: () => httpTables.fetchUnique(fetchParams),
    select: (data) => data,
    ...restOptions,
  });
};

export const tablesQuery = {
  fetchTableList,
  fetchTableUnique,
};
