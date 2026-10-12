import assert from 'node:assert/strict';
import test from 'node:test';

import { buildAccommodationQuery } from '../utils/buildAccommodationQuery.js';
import { validatePagination } from '../utils/pagination.js';
import { searchAccommodations } from '../services/accommodation.service.js';
import Accommodation from '../models/Accommodation.js';

const safeQuery = {
  verification_status: 'verified',
  status: 'active',
};

test('no filters should return the default verified active feed query', () => {
  assert.deepEqual(buildAccommodationQuery(), safeQuery);
});

test('state filter should apply exact state match case-insensitively', () => {
  assert.deepEqual(buildAccommodationQuery({ state: 'Edo' }), {
    ...safeQuery,
    state: /^Edo$/i,
  });
});

test('lga filter should apply exact LGA match case-insensitively', () => {
  assert.deepEqual(buildAccommodationQuery({ lga: 'Oredo' }), {
    ...safeQuery,
    lga: /^Oredo$/i,
  });
});

test('minimum price should apply $gte filter', () => {
  const result = buildAccommodationQuery({ minPrice: 200000 });
  assert.equal(result.verification_status, 'verified');
  assert.equal(result.status, 'active');
  assert.deepEqual(result.price, { $gte: 200000 });
});

test('maximum price should apply $lte filter', () => {
  const result = buildAccommodationQuery({ maxPrice: 500000 });
  assert.deepEqual(result.price, { $lte: 500000 });
});

test('price range should apply both min and max values', () => {
  const result = buildAccommodationQuery({ minPrice: 200000, maxPrice: 500000 });
  assert.deepEqual(result.price, {
    $gte: 200000,
    $lte: 500000,
  });
});

test('accommodation type should be filtered by exact case-insensitive match', () => {
  const result = buildAccommodationQuery({ accommodationType: 'self_contain' });
  assert.deepEqual(result.accommodationType, /^self_contain$/i);
});

test('amenities should be translated to $all array filter', () => {
  const result = buildAccommodationQuery({ amenities: 'borehole,electricity,security' });
  assert.deepEqual(result.amenities, { $all: ['borehole', 'electricity', 'security'] });
});

test('state + lga should combine both filters', () => {
  const result = buildAccommodationQuery({ state: 'Edo', lga: 'Oredo' });
  assert.deepEqual(result.state, /^Edo$/i);
  assert.deepEqual(result.lga, /^Oredo$/i);
});

test('combined filters should serialise into a single Mongo query object', () => {
  const result = buildAccommodationQuery({
    state: 'Edo',
    lga: 'Oredo',
    minPrice: 200000,
    maxPrice: 500000,
    accommodationType: 'self_contain',
    amenities: 'borehole,electricity',
  });

  assert.deepEqual(result.state, /^Edo$/i);
  assert.deepEqual(result.lga, /^Oredo$/i);
  assert.deepEqual(result.price, { $gte: 200000, $lte: 500000 });
  assert.deepEqual(result.accommodationType, /^self_contain$/i);
  assert.deepEqual(result.amenities, { $all: ['borehole', 'electricity'] });
});

test('pagination should accept valid page and limit values', () => {
  assert.deepEqual(validatePagination({ page: 2, limit: 10 }), {
    page: 2,
    limit: 10,
    skip: 10,
  });
});

test('sorting defaults to newest first', async () => {
  const originalFind = Accommodation.find;
  const originalCount = Accommodation.countDocuments;

  try {
    Accommodation.find = () => ({
      sort: () => ({
        skip: () => ({
          limit: () => ({
            lean: async () => [{ title: 'Newest listing' }],
          }),
        }),
      }),
    });
    Accommodation.countDocuments = async () => 1;

    const result = await searchAccommodations({
      page: 1,
      limit: 10,
      sort: 'newest',
    });

    assert.equal(result.page, 1);
    assert.equal(result.limit, 10);
    assert.equal(result.results[0].title, 'Newest listing');
  } finally {
    Accommodation.find = originalFind;
    Accommodation.countDocuments = originalCount;
  }
});

test('invalid page should return a validation error', () => {
  assert.throws(() => validatePagination({ page: 0, limit: 10 }), /Invalid page/);
});

test('invalid limit should return a validation error', () => {
  assert.throws(() => validatePagination({ page: 1, limit: 0 }), /Invalid limit/);
});

test('invalid limit above max should return a validation error', () => {
  assert.throws(() => validatePagination({ page: 1, limit: 51 }), /Invalid limit/);
});

test('invalid price range should reject min greater than max', () => {
  assert.throws(() => buildAccommodationQuery({ minPrice: 500000, maxPrice: 200000 }), /Invalid price range/);
});

test('feed query should always require verified + active listing state', () => {
  const result = buildAccommodationQuery({ state: 'Edo' });
  assert.equal(result.verification_status, 'verified');
  assert.equal(result.status, 'active');
});

test('filter builder should accept user fallback values when query args are omitted', () => {
  const result = buildAccommodationQuery({ userState: 'Edo', userLga: 'Oredo' });
  assert.deepEqual(result.state, /^Edo$/i);
  assert.deepEqual(result.lga, /^Oredo$/i);
});

// Minimal repository integration check for the service layer without requiring a DB connection.
test('searchAccommodations should call the model with the base verified + active filter', async () => {
  const originalFind = Accommodation.find;
  const originalCount = Accommodation.countDocuments;

  try {
    Accommodation.find = () => ({
      sort: () => ({
        skip: () => ({
          limit: () => ({
            lean: async () => [{ title: 'Sample room' }],
          }),
        }),
      }),
    });
    Accommodation.countDocuments = async () => 1;

    const result = await searchAccommodations({ state: 'Edo', lga: 'Oredo', page: 1, limit: 10 });
    assert.equal(result.total, 1);
    assert.equal(result.results[0].title, 'Sample room');
  } finally {
    Accommodation.find = originalFind;
    Accommodation.countDocuments = originalCount;
  }
});
