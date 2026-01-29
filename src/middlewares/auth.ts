import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { UserModel } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        email?: string;
        name?: string;
      };
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized to access this route', 401));
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallback_secret_key_for_development'
      ) as { id: string; role: string };

      // Fetch user from DB
      const user = await UserModel.findById(decoded.id);

      if (!user) {
        return next(new AppError('The user belonging to this token no longer exists.', 401));
      }

      // Check if user changed password after token was issued? (Optional enhancement)

      req.user = {
        id: user.id,
        role: user.role,
        email: user.email,
        name: user.name
      };

      next();
    } catch (error) {
      return next(new AppError('Invalid or expired token', 401));
    }
  } catch (error) {
    next(error);
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// Deprecated admin middleware (kept for compatibility or removal)
export const admin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }
  if (req.user.role === 'SUPERADMIN' || req.user.role === 'MANAGER') {
    next();
  } else {
    next(new AppError('Not authorized as an admin', 403));
  }
};
