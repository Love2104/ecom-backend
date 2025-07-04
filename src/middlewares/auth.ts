import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        email?: string;
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
      next();
    } catch (error) {
      return next(new AppError('Invalid or expired token', 401));
    }
  } catch (error) {
    next(error);
  }
};

export const admin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }
  if (req.user.role === 'admin') {
    next();
  } else {
    next(new AppError('Not authorized as an admin', 403));
  }
};
