import mongoose from 'mongoose';

const TYPES = [
  'single-room',
  'self-contain',
  'room-and-parlour',
  'one-bedroom',
  'two-bedroom',
  'shared-apartment',
];

// status = is the listing live? | verification_status = has an admin approved it?
const STATUSES = ['active', 'flagged', 'hidden', 'archived'];
const VERIFICATION_STATUSES = ['pending', 'verified', 'rejected', 'flagged'];

const AMENITIES = [
  'water_borehole',
  'electricity',
  'prepaid_meter',
  'security',
  'fenced',
  'tiled',
  'water_supply',
  'parking',
  'shared_flat',
];

const PROPERTY_INFO = [
  'fenced',
  'gated',
  'running_water',
  'prepaid_meter',
  'close_to_market',
  'motorable_road',
];

const accommodationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 2000,
    },
    accommodationType: {
      type: String,
      enum: TYPES,
      default: 'self-contain',
    },

    // Price mappings (price serves as annual rent for search compatibility)
    price: {
      type: Number,
      required: [true, 'Annual rent price is required'],
      min: 1,
    },
    caution_fee: {
      type: Number,
      default: 0,
      min: 0,
    },
    agency_fee: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Location: Supports both ObjectId refs and direct string names for MVP flexibility
    state: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'State',
      required: [true, 'State is required'],
      trim: true,
    },
    lga: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'Lga',
      required: [true, 'LGA is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    ppa_proximity: {
      type: String,
      default: null,
      trim: true,
    },
    landmark: {
      type: String,
      default: null,
      trim: true,
    },

    // Media Pipeline: Multi-image upload handlers (capped at 3 per listing)
    photos: {
      type: [mongoose.Schema.Types.Mixed],
      validate: {
        validator: (arr) => !arr || arr.length <= 3,
        message: 'A listing can have at most 3 images',
      },
      default: [],
    },

    // Features / Amenities
    amenities: {
      type: [String],
      default: [],
    },
    property_info: {
      type: [String],
      default: [],
    },

    // Source & Contacts
    source: {
      type: String,
      default: 'Direct Lodge Contact',
      trim: true,
    },
    contact_phone: {
      type: String,
      trim: true,
    },
    contact_whatsapp: {
      type: String,
      default: null,
      trim: true,
    },

    // Moderation & Ownership
    status: {
      type: String,
      enum: STATUSES,
      default: 'active',
      lowercase: true,
    },
    verification_status: {
      type: String,
      enum: VERIFICATION_STATUSES,
      default: 'pending',
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    last_updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    last_updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field: alias annualRent <-> price
accommodationSchema.virtual('annualRent')
  .get(function () { return this.price; })
  .set(function (v) { this.price = v; });

accommodationSchema.virtual('last_updated').get(function () {
  return this.last_updated_at;
});

// Search Pipeline & Moderation Indexes
accommodationSchema.index({ state: 1, lga: 1, status: 1 });
accommodationSchema.index({ price: 1 });
accommodationSchema.index({ status: 1, verification_status: 1, state: 1, price: 1 });
accommodationSchema.index({ amenities: 1 });
accommodationSchema.index({ landlord: 1 });

const Accommodation = mongoose.model('Accommodation', accommodationSchema);

export { TYPES, STATUSES, VERIFICATION_STATUSES, AMENITIES, PROPERTY_INFO };
export default Accommodation;