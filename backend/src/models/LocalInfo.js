import mongoose from 'mongoose';

const localInfoSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      required: true,
      trim: true,
    },
    lga: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'transport',
        'ppa',
        'health',
        'security',
        'food',
        'essential_services',
      ],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    source: {
      type: String,
      required: true,
      trim: true,
      default: 'NYSC Connect',
    },
    last_updated: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'hidden'],
      default: 'active',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

localInfoSchema.index({ state: 1, lga: 1, category: 1, status: 1 });

export default mongoose.model('LocalInfo', localInfoSchema);