import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
<<<<<<< HEAD
=======
import { UserModel } from '../models/User';
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        email?: string;
<<<<<<< HEAD
=======
        name?: string;
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
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
<<<<<<< HEAD
    if (!token) {
      return next(new AppError('Not authorized to access this route', 401));
    }
    try {
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'fallback_secret_key_for_development'
      ) as {
        id: string;
        role: string;
        email?: string;
      };
      req.user = {
        id: decoded.id,
        role: decoded.role,
        email: decoded.email
      };
=======

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

>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
      next();
    } catch (error) {
      return next(new AppError('Invalid or expired token', 401));
    }
  } catch (error) {
    next(error);
  }
};

<<<<<<< HEAD
=======
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// Deprecated admin middleware (kept for compatibility or removal)
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
export const admin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }
<<<<<<< HEAD
  if (req.user.role === 'admin') {
=======
  if (req.user.role === 'SUPERADMIN' || req.user.role === 'MANAGER') {
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
    next();
  } else {
    next(new AppError('Not authorized as an admin', 403));
  }
};
