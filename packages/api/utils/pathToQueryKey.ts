const VERSION_PATTERN = /^v\d+$/;

type QueryParams = Record<string, string | string[]>;
type QueryKeySegment = string | QueryParams;

export const pathToQueryKey = (path: string): readonly QueryKeySegment[] => {
  const [pathname, search] = path.split("?");
  const segments = pathname.split("/").filter(Boolean);

  const baseKey: QueryKeySegment[] =
    segments.length >= 2 && VERSION_PATTERN.test(segments[1])
      ? [`${segments[0]}/${segments[1]}`, ...segments.slice(2)]
      : [...segments];

  if (search) {
    const params = parseSearchParams(search);
    if (Object.keys(params).length > 0) {
      baseKey.push(params);
    }
  }

  return baseKey;
};

const parseSearchParams = (search: string): QueryParams => {
  const params: QueryParams = {};
  const searchParams = new URLSearchParams(search);
  for (const key of new Set(searchParams.keys())) {
    const values = searchParams.getAll(key);
    params[key] = values.length === 1 ? values[0] : values;
  }
  return params;
};
