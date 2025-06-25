import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { AppError } from '../middlewares/errorHandler';

const generateToken = (id: string, role: string): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '30d';

  if (!secret) throw new Error('JWT_SECRET not defined');

  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign({ id, role }, secret, options);
};

// Register and login logic (unchanged from your version)



// Register a new user
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation error', 400, errors.array()));
    }

    const { name, email, password } = req.body;

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return next(new AppError('User already exists', 400));
    }

    const user = await UserModel.create({ name, email, password });
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation error', 400, errors.array()));
    }

    const { email, password } = req.body;
    const user = await UserModel.findByEmail(email);

    if (!user || !(await UserModel.comparePassword(password, user.password))) {
      return next(new AppError('Invalid credentials', 401));
    }

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await UserModel.findById(req.user!.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;
    const updatedUser = await UserModel.update(req.user!.id, {
      name,
      email,
      password,
    });

    if (!updatedUser) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    next(error);
  }
};
