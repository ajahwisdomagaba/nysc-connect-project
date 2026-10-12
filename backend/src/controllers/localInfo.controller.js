import mongoose from 'mongoose';
import LocalInfo from '../models/LocalInfo.js'; 

// Read the allowed values from the schema so the model stays the single source of truth
const CATEGORIES = LocalInfo.schema.path('category').enumValues;

// Fields an admin may set on create. Anything else in req.body is ignored.
const CREATE_FIELDS = [
  'state', 'lga', 'category', 'title', 'description', 'details', 'source', 'status',
];

const fail = (res, code, message) => res.status(code).json({ status: 'error', message });

const catchAsync = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    if (err.name === 'ValidationError') {
      return fail(res, 400, Object.values(err.errors).map((e) => e.message).join(', '));
    }
    if (err.name === 'CastError') return fail(res, 400, `Invalid value for ${err.path}`);
    console.error(err);
    return fail(res, 500, 'Something went wrong');
  });

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Case-insensitive exact match
const exact = (value) => new RegExp(`^${escapeRegex(String(value).trim())}$`, 'i');

// GET /api/v1/local-info?category=&state=&lga=&q=&page=&limit=
export const listLocalInfo = catchAsync(async (req, res) => {
  const { category, state, lga, q } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);

  const filter = { status: 'active' };

  if (category) {
    if (!CATEGORIES.includes(category)) {
      return fail(res, 400, `Invalid category. Use one of: ${CATEGORIES.join(', ')}`);
    }
    filter.category = category;
  }
  if (state) filter.state = exact(state);
  if (lga) filter.lga = exact(lga);
  if (q) {
    const rx = new RegExp(escapeRegex(String(q).trim()), 'i');
    filter.$or = [{ title: rx }, { description: rx }];
  }

  const [items, total] = await Promise.all([
    LocalInfo.find(filter)
      .sort({ last_updated: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    LocalInfo.countDocuments(filter),
  ]);

  return res.json({
    status: 'success',
    total,
    page,
    pages: Math.ceil(total / limit),
    results: items.length,
    data: items,
  });
});

// GET /api/v1/local-info/categories
export const getCategories = (req, res) =>
  res.json({ status: 'success', data: CATEGORIES });

// GET /api/v1/local-info/:id
export const getLocalInfo = catchAsync(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return fail(res, 404, 'Entry not found');

  // Hidden entries are only visible to admins
  const filter = { _id: id };
  if (req.user.role !== 'admin') filter.status = 'active';

  const doc = await LocalInfo.findOne(filter).lean();
  if (!doc) return fail(res, 404, 'Entry not found');

  return res.json({ status: 'success', data: doc });
});

// POST /api/v1/local-info  (admin only; enforced in the route)
export const createLocalInfo = catchAsync(async (req, res) => {
  const data = {};
  for (const key of CREATE_FIELDS) {
    if (req.body[key] !== undefined) data[key] = req.body[key];
  }

  if (
    data.details !== undefined &&
    (typeof data.details !== 'object' || data.details === null || Array.isArray(data.details))
  ) {
    return fail(res, 400, 'details must be an object');
  }

  if (!String(data.source || '').trim()) {
    data.source = 'NYSC Connect';
  }

  const doc = await LocalInfo.create({ ...data, last_updated: new Date() });
  return res.status(201).json({ status: 'success', data: doc });
});
