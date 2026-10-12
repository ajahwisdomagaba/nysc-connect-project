import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { errorResponse } from '../utils/response.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 401, 'Authentication token missing. Please log in.');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return errorResponse(res, 500, 'JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id || decoded._id);

    if (!user) {
      return errorResponse(res, 401, 'User account no longer exists.');
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 401, 'Invalid or expired token.');
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.map(r => r.toUpperCase()).includes(req.user.role?.toUpperCase())) {
      return errorResponse(res, 403, 'Forbidden. You lack permission for this action.');
    }
    next();
  };
};