import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporter_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    target_type: {
      type: String,
      required: true,
      enum: ['accommodation', 'local_info'],
    },
    target_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'target_model_type',
    },
    reason: {
      type: String,
      required: true,
      enum: ['outdated', 'incorrect', 'misleading', 'suspicious', 'scam'],
    },
    details: {
      type: String,
      required: [true, 'Report explanation is required'],
      trim: true,
      maxlength: [500, 'Report explanation must be less than 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
      trim: true,
    },
    admin_action: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending',
      trim: true,
    },
    admin_notes: {
      type: String,
      maxlength: [500, 'Admin action details must be less than 500 characters'],
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

// Virtual field for dynamic population of flagged target
reportSchema.virtual('target_model_type').get(function () {
  return this.target_type === 'accommodation' ? 'Accommodation' : 'LocalInfo';
});

reportSchema.index({ target_type: 1, target_id: 1 });
reportSchema.index({ status: 1 });

export default mongoose.model('Report', reportSchema);