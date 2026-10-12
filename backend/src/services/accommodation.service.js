import Accommodation from '../models/Accommodation.js';
import { buildAccommodationQuery } from '../utils/buildAccommodationQuery.js';
import { buildPaginationResponse, validatePagination } from '../utils/pagination.js';

const resolveSort = (sortValue = 'newest') => {
  switch (sortValue) {
    case 'newest':
      return { created_at: -1 };
    case 'price_asc':
      return { price: 1 };
    case 'price_desc':
      return { price: -1 };
    default:
      throw new Error('Invalid sort');
  }
};

export const searchAccommodations = async ({
  state,
  lga,
  minPrice,
  maxPrice,
  accommodationType,
  amenities,
  page = 1,
  limit = 10,
  sort = 'newest',
  user = {},
}) => {
  const { page: safePage, limit: safeLimit, skip } = validatePagination({ page, limit });
  const filters = buildAccommodationQuery({
    state,
    lga,
    minPrice,
    maxPrice,
    accommodationType,
    amenities,
    userState: user.state,
    userLga: user.lga,
  });

  const sortOptions = resolveSort(sort);

  const [results, total] = await Promise.all([
    Accommodation.find(filters)
      .sort(sortOptions)
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Accommodation.countDocuments(filters),
  ]);

  return {
    ...buildPaginationResponse({ total, page: safePage, limit: safeLimit }),
    results: results.map((listing) => ({
      ...listing,
      last_updated: listing.last_updated_at ?? listing.created_at ?? null,
    })),
  };
};
