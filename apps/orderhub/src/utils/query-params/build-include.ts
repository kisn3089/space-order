import { Injectable } from '@nestjs/common';

export interface IncludeOptions<
  IncludeRecord extends Record<keyof IncludeRecord, any>,
  FilterRecord extends Record<keyof FilterRecord, any>,
> {
  query:
    | {
        include?: keyof IncludeRecord;
        filter?: keyof FilterRecord;
      }
    | undefined;

  includeKeyRecord?: IncludeRecord;
  filterRecord?: FilterRecord;
}

@Injectable()
export class BuildIncludeService {
  build<
    IncludeRecord extends Record<keyof IncludeRecord, any>,
    FilterRecord extends Record<keyof FilterRecord, any>,
  >(options: IncludeOptions<IncludeRecord, FilterRecord>) {
    const { query, includeKeyRecord, filterRecord } = options;
    const { filter, include } = query ?? {};

    if (!include) {
      if (!filter) {
        return { filter: undefined, include: undefined };
      }

      return { filter: filterRecord?.[filter](), include: undefined };
    }

    if (!includeKeyRecord) {
      return {
        filter: filter ? filterRecord?.[filter]() : undefined,
        include: undefined,
      };
    }

    const findIncludeObject = includeKeyRecord[include];
    const findFilterRecord = filter ? filterRecord?.[filter]() : {};

    return { filter: findFilterRecord, include: findIncludeObject };
  }
}
