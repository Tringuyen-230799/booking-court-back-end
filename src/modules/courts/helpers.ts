import { QueryCourtsSchema } from './courts.schema';

interface CourtQuery {
  search?: string;
  sportType?: number[] | string[];
  amenities?: number[] | string[];
  minPrice?: number | string;
  maxPrice?: number | string;
  rating?: number;
}

export const convertCourtQueryList = (query: CourtQuery): QueryCourtsSchema => {
  const convertedQuery: QueryCourtsSchema = {
    search: query.search,
    sportTypes: converNumArray(query?.sportType),
    amenities: converNumArray(query?.amenities),
    priceRange: {
      max: Number(query.maxPrice),
      min: Number(query.minPrice),
    },
    rating: Number(query.rating) || undefined,
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
