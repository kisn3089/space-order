import { Injectable } from '@nestjs/common';

type PrismaIncludeRecord<T extends object> = Record<PropertyKey, T[keyof T]>;
type WhereConditionFactoryRecord<Factory extends () => unknown> = Record<
  PropertyKey,
  Factory
>;

interface QueryBuildOptions<
  IncludeRecord extends PrismaIncludeRecord<IncludeRecord>,
  FilterRecord extends WhereConditionFactoryRecord<
    () => ReturnType<FilterRecord[keyof FilterRecord]>
  >,
> {
  query?: { include?: keyof IncludeRecord; filter?: keyof FilterRecord };
  includeRecord?: IncludeRecord;
  filterRecord?: FilterRecord;
}

type QueryBuildResult<
  IncludeRecord extends PrismaIncludeRecord<IncludeRecord>,
  FilterRecord extends WhereConditionFactoryRecord<
    () => ReturnType<FilterRecord[keyof FilterRecord]>
  >,
> = {
  include: IncludeRecord[keyof IncludeRecord] | undefined;
  filter: ReturnType<FilterRecord[keyof FilterRecord]> | undefined;
};

@Injectable()
export class QueryParamsBuilderService {
  build<
    IncludeRecord extends PrismaIncludeRecord<IncludeRecord>,
    FilterRecord extends WhereConditionFactoryRecord<
      () => ReturnType<FilterRecord[keyof FilterRecord]>
    >,
  >(
    options: QueryBuildOptions<IncludeRecord, FilterRecord>,
  ): QueryBuildResult<IncludeRecord, FilterRecord> {
    const { query, includeRecord, filterRecord } = options;

    const includeKey = query?.include;
    const filterKey = query?.filter;

    const filterFn = filterKey ? filterRecord?.[filterKey] : undefined;
    const filterValue = filterFn ? filterFn() : undefined;

    if (!includeKey || !includeRecord) {
      return { include: undefined, filter: filterValue };
    }

    return { include: includeRecord[includeKey], filter: filterValue };
  }
}
