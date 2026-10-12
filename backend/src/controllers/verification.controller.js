import mongoose from "mongoose";
import User from "../models/User.js";
import { successResponse, errorResponse } from "../utils/response.js";

const ID_TYPES = {
  nin: "nin",
  vnin: "nin",
  v_nin: "nin",
  pvc: "pvc",
  voters_card: "pvc",
  drivers_license: "drivers_license",
  driver_license: "drivers_license",
  drivers_licence: "drivers_license",
  passport: "passport",
  international_passport: "passport",
};

const AUTHORITY_BY_ROLE = {
  landlord: ["utility_bill", "proof_of_ownership"],
  agent: ["authorization_letter", "agency_registration"],
};

const REVIEW_DECISIONS = ["verified", "rejected"];

const normalizeToken = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[\s-]+/g, "_");

const isHttpUrl = (value) => {
  try {
    const url = new URL(String(value).trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const isListingRole = (user) => user && (user.role === "landlord" || user.role === "agent");

const agreedToFeePolicy = (value) => value === true || value === "true";

const publicVerification = (verification = {}) => ({
  status: verification.status || "not_submitted",
  id_type: verification.id_type || null,
  id_document_url: verification.id_document_url || null,
  authority_type: verification.authority_type || null,
  authority_document_url: verification.authority_document_url || null,
  prepaid_meter_number: verification.prepaid_meter_number || null,
  zero_upfront_fee_agreed: Boolean(verification.zero_upfront_fee_agreed),
  rejection_reason: verification.rejection_reason || null,
  submitted_at: verification.submitted_at || null,
  reviewed_at: verification.reviewed_at || null,
});

const queueItem = (user) => ({
  id: user._id,
  name: user.name,
  phone: user.phone,
  role: user.role,
  state: user.state,
  lga: user.lga,
  account_verification: publicVerification(user.account_verification),
});

// POST /api/v1/users/me/verification
export const submitAccountVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 401, "User account no longer exists.");
    }

    if (!isListingRole(user)) {
      return errorResponse(res, 403, "Account verification applies to landlords and agents");
    }

    if (user.account_verification?.status === "verified") {
      return errorResponse(res, 400, "This account is already verified");
    }

    const idType = ID_TYPES[normalizeToken(req.body.id_type)];
    if (!idType) {
      return errorResponse(res, 400, "id_type must be nin, pvc, drivers_license, or passport");
    }

    if (!isHttpUrl(req.body.id_document_url)) {
      return errorResponse(res, 400, "id_document_url must be a valid image URL");
    }

    const authorityType = normalizeToken(req.body.authority_type);
    const allowedAuthority = AUTHORITY_BY_ROLE[user.role];
    if (!allowedAuthority.includes(authorityType)) {
      const expected = user.role === "landlord"
        ? "utility_bill or proof_of_ownership"
        : "authorization_letter or agency_registration";
      return errorResponse(res, 400, `authority_type for a ${user.role} must be ${expected}`);
    }

    if (!isHttpUrl(req.body.authority_document_url)) {
      return errorResponse(res, 400, "authority_document_url must be a valid image URL");
    }

    const meterNumber = String(req.body.prepaid_meter_number ?? "").trim();
    if (authorityType === "utility_bill" && !meterNumber) {
      return errorResponse(res, 400, "prepaid_meter_number is required when submitting a utility bill");
    }

    if (!agreedToFeePolicy(req.body.zero_upfront_fee_agreed)) {
      return errorResponse(
        res,
        400,
        "You must agree not to charge corps members inspection or mobilization fees before a site visit",
      );
    }

    user.account_verification = {
      status: "pending",
      id_type: idType,
      id_document_url: String(req.body.id_document_url).trim(),
      authority_type: authorityType,
      authority_document_url: String(req.body.authority_document_url).trim(),
      prepaid_meter_number: authorityType === "utility_bill" ? meterNumber : null,
      zero_upfront_fee_agreed: true,
      rejection_reason: null,
      submitted_at: new Date(),
      reviewed_at: null,
    };
    user.markModified("account_verification");

    await user.save();

    return successResponse(res, 200, "Verification submitted and is pending admin review", {
      account_verification: publicVerification(user.account_verification),
    });
  } catch (error) {
    return errorResponse(res, 500, error.message || "Server error");
  }
};

// GET /api/v1/users/me/verification
export const getAccountVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 401, "User account no longer exists.");
    }

    if (!isListingRole(user)) {
      return errorResponse(res, 403, "Account verification applies to landlords and agents");
    }

    return successResponse(res, 200, "Account verification fetched successfully", {
      account_verification: publicVerification(user.account_verification),
    });
  } catch (error) {
    return errorResponse(res, 500, error.message || "Server error");
  }
};

// GET /api/v1/admin/account-verifications
export const listAccountVerifications = async (req, res) => {
  try {
    const status = req.query.status || "pending";
    const allowed = ["not_submitted", "pending", "verified", "rejected", "all"];
    if (!allowed.includes(status)) {
      return errorResponse(res, 400, `Invalid status. Allowed: ${allowed.join(", ")}`);
    }

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    if (!Number.isInteger(page) || page < 1) {
      return errorResponse(res, 400, "Invalid page");
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      return errorResponse(res, 400, "Invalid limit");
    }

    const filter = { role: { $in: ["landlord", "agent"] } };
    if (status !== "all") {
      filter["account_verification.status"] = status;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ "account_verification.submitted_at": -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return successResponse(res, 200, "Account verifications fetched successfully", {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      results: users.map(queueItem),
    });
  } catch (error) {
    return errorResponse(res, 500, error.message || "Server error");
  }
};

// PATCH /api/v1/admin/account-verifications/:userId
export const reviewAccountVerification = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      return errorResponse(res, 404, "Account not found");
    }

    const decision = normalizeToken(req.body.status);
    if (!REVIEW_DECISIONS.includes(decision)) {
      return errorResponse(res, 400, "status must be verified or rejected");
    }

    const reason = String(req.body.rejection_reason ?? "").trim();
    if (decision === "rejected" && !reason) {
      return errorResponse(res, 400, "rejection_reason is required when rejecting an account");
    }

    const user = await User.findById(userId);
    if (!user || !isListingRole(user)) {
      return errorResponse(res, 404, "Account not found");
    }

    if (user.account_verification?.status !== "pending") {
      return errorResponse(res, 400, "This account has no verification waiting for review");
    }

    user.account_verification.status = decision;
    user.account_verification.rejection_reason = decision === "rejected" ? reason : null;
    user.account_verification.reviewed_at = new Date();
    await user.save();

    const message = decision === "verified"
      ? "Account verified. This landlord or agent can now post listings"
      : "Account verification rejected";

    return successResponse(res, 200, message, {
      account: queueItem(user),
    });
  } catch (error) {
    return errorResponse(res, 500, error.message || "Server error");
  }
};
