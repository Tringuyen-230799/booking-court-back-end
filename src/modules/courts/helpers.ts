import { QueryCourtsSchema } from './courts.schema';

interface CourtQuery {
  search?: string;
  sportType?: number[] | string[];
  amenities?: number[] | string[];
  min?: number;
  max?: number;
  rating?: number;
  page?: number | string;
  limit?: number | string;
}

export const convertCourtQueryList = (query: CourtQuery): QueryCourtsSchema => {
  const convertedQuery: QueryCourtsSchema = {
    search: query.search,
    sportTypes: converNumArray(query?.sportType),
    amenities: converNumArray(query?.amenities),
    max: Number(query.max) || undefined,
    min: Number(query.min) || 0,
    rating: Number(query.rating) || undefined,
    page: Number(query.page) || 1,
    limit: Number(query.limit) || 10,
  };

  return convertedQuery;
};

const converNumArray = (
  arr: (string | number)[] | string | number | undefined,
): number[] | undefined => {
  if (Array.isArray(arr)) {
    return arr.map((item) => Number(item));
  } else if (arr !== undefined) {
    return [Number(arr)];
  }
  return undefined;
};
