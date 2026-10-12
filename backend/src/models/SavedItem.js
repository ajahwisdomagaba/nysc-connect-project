import mongoose from 'mongoose';

const savedItemSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    item_type: {
      type: String,
      required: true,
      enum: ['accommodation', 'local_info'],
    },
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'item_model_type',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

// Virtual field for dynamic population based on item_type
savedItemSchema.virtual('item_model_type').get(function () {
  return this.item_type === 'accommodation' ? 'Accommodation' : 'LocalInfo';
});

// Enforce unique bookmark per user per entity
savedItemSchema.index({ user_id: 1, item_type: 1, item_id: 1 }, { unique: true });

export default mongoose.model('SavedItem', savedItemSchema);