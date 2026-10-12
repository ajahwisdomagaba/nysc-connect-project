import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      minLength: 10,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
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
    ppa_name: {
      type: String,
      default: null,
      trim: true,
    },
    ppa_proximity: {
      type: String,
      default: null,
      trim: true,
    },
    role: {
      type: String,
      enum: ["corps_member", "landlord", "agent", "admin"],
      default: "corps_member",
    },
    account_verification: {
      status: {
        type: String,
        enum: ["not_submitted", "pending", "verified", "rejected"],
        default: "not_submitted",
      },
      id_type: {
        type: String,
        enum: ["nin", "pvc", "drivers_license", "passport"],
      },
      id_document_url: {
        type: String,
        trim: true,
      },
      authority_type: {
        type: String,
        enum: [
          "utility_bill",
          "proof_of_ownership",
          "authorization_letter",
          "agency_registration",
        ],
      },
      authority_document_url: {
        type: String,
        trim: true,
      },
      prepaid_meter_number: {
        type: String,
        trim: true,
        default: null,
      },
      zero_upfront_fee_agreed: {
        type: Boolean,
        default: false,
      },
      rejection_reason: {
        type: String,
        trim: true,
        default: null,
      },
      submitted_at: {
        type: Date,
        default: null,
      },
      reviewed_at: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

UserSchema.virtual("ppa")
  .get(function () {
    return this.ppa_name ?? null;
  })
  .set(function (value) {
    this.ppa_name = value ?? null;
  });

UserSchema.index({ status: 1, lga: 1 });
UserSchema.index({ role: 1, "account_verification.status": 1 });

export default mongoose.model("User", UserSchema);
