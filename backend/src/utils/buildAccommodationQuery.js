const normalizeValue = (value) => String(value ?? '').trim();

const escapeRegExp = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseAmenities = (amenities) => {
  if (!amenities) {
    return [];
  }

  if (Array.isArray(amenities)) {
    return amenities
      .map((item) => normalizeValue(item))
      .filter(Boolean);
  }

  return String(amenities)
    .split(',')
    .map((item) => normalizeValue(item))
    .filter(Boolean);
};

export const buildAccommodationQuery = ({
  state,
  lga,
  minPrice,
  maxPrice,
  accommodationType,
  amenities,
  userState,
  userLga,
} = {}) => {
  const filters = {
    verification_status: 'verified',
    status: 'active',
  };

  const selectedState = normalizeValue(state) || normalizeValue(userState);
  if (selectedState) {
    filters.state = new RegExp(`^${escapeRegExp(selectedState)}$`, 'i');
  }

  const selectedLga = normalizeValue(lga) || normalizeValue(userLga);
  if (selectedLga) {
    filters.lga = new RegExp(`^${escapeRegExp(selectedLga)}$`, 'i');
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const parsedMinPrice = minPrice === undefined || minPrice === '' ? undefined : Number(minPrice);
    const parsedMaxPrice = maxPrice === undefined || maxPrice === '' ? undefined : Number(maxPrice);

    if (
      (minPrice !== undefined && minPrice !== '' && Number.isNaN(parsedMinPrice)) ||
      (maxPrice !== undefined && maxPrice !== '' && Number.isNaN(parsedMaxPrice))
    ) {
      throw new Error('Invalid price range');
    }

    if (
      parsedMinPrice !== undefined &&
      parsedMaxPrice !== undefined &&
      parsedMinPrice > parsedMaxPrice
    ) {
      throw new Error('Invalid price range');
    }

    if (parsedMinPrice !== undefined || parsedMaxPrice !== undefined) {
      filters.price = {};

      if (parsedMinPrice !== undefined) {
        filters.price.$gte = parsedMinPrice;
      }

      if (parsedMaxPrice !== undefined) {
        filters.price.$lte = parsedMaxPrice;
      }
    }
  }

  const normalizedType = normalizeValue(accommodationType);
  if (normalizedType) {
    filters.accommodationType = new RegExp(`^${escapeRegExp(normalizedType)}$`, 'i');
  }

  const amenityValues = parseAmenities(amenities);
  if (amenityValues.length) {
    filters.amenities = { $all: amenityValues };
  }

  return filters;
};
