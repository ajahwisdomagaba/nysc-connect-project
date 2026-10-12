import Report from '../models/Report.js';
import Accommodation from '../models/Accommodation.js';
import LocalInfo from '../models/LocalInfo.js';
import { successResponse, errorResponse } from '../utils/response.js';

const REVIEWED_STATUSES = ['reviewed', 'resolved'];
const REVIEWED_ACTIONS = ['resolved'];

const hideScamTarget = async (report) => {
  if (report.target_type === 'accommodation') {
    await Accommodation.findByIdAndUpdate(report.target_id, { status: 'Hidden' });
    return;
  }

  if (report.target_type === 'local_info') {
    await LocalInfo.findByIdAndUpdate(report.target_id, { status: 'hidden' });
  }
};

// POST /api/v1/reports
export const createReport = async (req, res, next) => {
  try {
    const { target_type, target_id, reason, details } = req.body;

    if (!target_type || !target_id || !reason || !details) {
      return errorResponse(res, 400, 'target_type, target_id, reason, and details are required');
    }

    const validTargetTypes = ['accommodation', 'local_info'];
    if (!validTargetTypes.includes(target_type)) {
      return errorResponse(res, 400, `Invalid target_type. Allowed: ${validTargetTypes.join(', ')}`);
    }

    const validReasons = ['outdated', 'incorrect', 'misleading', 'suspicious', 'scam'];
    if (!validReasons.includes(reason)) {
      return errorResponse(res, 400, `Invalid reason. Allowed: ${validReasons.join(', ')}`);
    }

    if (details.trim().length > 500) {
      return errorResponse(res, 400, 'Details cannot exceed 500 characters');
    }

    // Verify target existence if targeting accommodation
    if (target_type === 'accommodation') {
      const accommodation = await Accommodation.findById(target_id);
      if (!accommodation) {
        return errorResponse(res, 404, 'Accommodation listing not found');
      }
    }

    const report = await Report.create({
      reporter_id: req.user._id,
      target_type,
      target_id,
      reason,
      details: details.trim(),
      status: 'pending',
      admin_action: 'pending',
    });

    return successResponse(res, 201, 'Report submitted successfully', report);
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/admin/reports (or GET /api/v1/reports/admin)
export const getAdminReports = async (req, res, next) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status !== 'all') {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate('reporter_id', 'name phone')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Report.countDocuments(filter),
    ]);

    return successResponse(res, 200, 'Reports retrieved successfully', {
      total,
      page: Number(page),
      limit: Number(limit),
      reports,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/admin/reports/:id (or PATCH /api/v1/reports/admin/:id)
export const moderateReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, admin_action, admin_notes } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return errorResponse(res, 404, 'Report not found');
    }

    const validStatuses = ['pending', 'reviewed', 'resolved', 'dismissed'];
    if (status && !validStatuses.includes(status)) {
      return errorResponse(res, 400, `Invalid status. Allowed: ${validStatuses.join(', ')}`);
    }

    const validActions = ['pending', 'resolved', 'dismissed'];
    if (admin_action && !validActions.includes(admin_action)) {
      return errorResponse(res, 400, `Invalid admin_action. Allowed: ${validActions.join(', ')}`);
    }

    if (admin_notes && admin_notes.trim().length > 500) {
      return errorResponse(res, 400, 'admin_notes cannot exceed 500 characters');
    }

    if (status) report.status = status;
    if (admin_action) report.admin_action = admin_action;
    if (admin_notes) report.admin_notes = admin_notes.trim();

    const adminConfirmedScam =
      report.reason === 'scam' &&
      report.status !== 'dismissed' &&
      report.admin_action !== 'dismissed' &&
      (REVIEWED_STATUSES.includes(report.status) || REVIEWED_ACTIONS.includes(report.admin_action));

    if (adminConfirmedScam) {
      await hideScamTarget(report);
    }

    await report.save();

    return successResponse(res, 200, 'Report moderated successfully', report);
  } catch (error) {
    next(error);
  }
};