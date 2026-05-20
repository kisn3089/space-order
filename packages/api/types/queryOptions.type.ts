import { UseQueryOptions } from "@tanstack/react-query";

export type QueryOptions<T> = Omit<UseQueryOptions<T>, "queryFn" | "select">;

export type Exception = {
  status: number;
  error: string;
  message: string | string[];
  code?: string;
  path: string;
  timestamp: string;
  details?: unknown;
};
