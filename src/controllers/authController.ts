import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserModel } from '../models/User';
<<<<<<< HEAD
import { AppError } from '../middlewares/errorHandler';
=======
import { ManagerKeyModel } from '../models/ManagerKey';
import { AppError } from '../middlewares/errorHandler';
import { emailService } from '../services/emailService';
import { query } from '../config/db';
import bcrypt from 'bcryptjs';
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)

const generateToken = (id: string, role: string): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '30d';

  if (!secret) throw new Error('JWT_SECRET not defined');

  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign({ id, role }, secret, options);
};

<<<<<<< HEAD
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
=======
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register Buyer (Default)
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new AppError('Validation error', 400, errors.array()));
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)

    const { name, email, password } = req.body;

    const existingUser = await UserModel.findByEmail(email);
<<<<<<< HEAD
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
=======
    if (existingUser) return next(new AppError('User already exists', 400));

    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = await UserModel.create({
      name,
      email,
      password,
      role: 'BUYER', // Default
      otp_code: otpCode,
      otp_expires_at: otpExpires
    });

    await emailService.sendOTP(email, otpCode);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Verify OTP sent to email.',
      userId: user.id
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
    });
  } catch (error) {
    next(error);
  }
};

<<<<<<< HEAD
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
=======
// Verify OTP
export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;
    const user = await UserModel.findByEmail(email);

    if (!user) return next(new AppError('User not found', 404));
    if (user.is_verified) return res.status(200).json({ success: true, message: 'Already verified' });

    if (!user.otp_code || !user.otp_expires_at || user.otp_code !== otp || new Date() > new Date(user.otp_expires_at)) {
      return next(new AppError('Invalid or expired OTP', 400));
    }

    // Verify user
    await UserModel.update(user.id, { is_verified: true, otp_code: undefined, otp_expires_at: undefined });

    const token = generateToken(user.id, user.role);
    res.status(200).json({ success: true, token, user });
  } catch (error) {
    next(error);
  }
};

// Login (Buyer/Supplier/Superadmin)
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findByEmail(email);

    if (!user) return next(new AppError('Invalid credentials', 401));

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return next(new AppError('Invalid credentials', 401));

    if (!user.is_verified) return next(new AppError('Account not verified', 403));

    const token = generateToken(user.id, user.role);
    res.status(200).json({ success: true, token, user });
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
  } catch (error) {
    next(error);
  }
};

<<<<<<< HEAD
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

=======
// Manager Login with Key
export const managerLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key_code, password } = req.body;

    // Ensure key_code exists before processing
    if (!key_code) {
      return next(new AppError('Manager Key is required', 400));
    }

    const normalizedKey = key_code.trim().toUpperCase().replace(/\s+/g, '-');

    console.log(`[ManagerLogin] Input: '${key_code}' normalized to: '${normalizedKey}'`);

    // Find manager key
    const managerKey = await ManagerKeyModel.findByKey(normalizedKey);
    if (!managerKey) {
      console.log(`[ManagerLogin] Key not found in DB: '${normalizedKey}'`);
      return next(new AppError(`Invalid Manager Key. We received '${normalizedKey}' (converted from '${key_code}'). Please check for typos.`, 401));
    }

    // Find user linked to this key
    const userResult = await query('SELECT * FROM users WHERE manager_key_id = $1', [managerKey.id]);
    const user = userResult.rows[0];

    if (!user) return next(new AppError('No manager found for this key', 404));

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return next(new AppError('Invalid credentials', 401));

    const token = generateToken(user.id, user.role);
    res.status(200).json({ success: true, token, user });

  } catch (error) {
    next(error);
  }
};

// Create Manager (Superadmin only)
export const createManager = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body; // Superadmin provides these
    const superadminId = req.user!.id;

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) return next(new AppError('User already exists', 400));

    // Generate Key
    const key = await ManagerKeyModel.create({
      created_by: superadminId,
      assigned_email: email
    });

    // Create User linked to Key
    const user = await UserModel.create({
      name: 'Manager',
      email,
      password, // Temp password
      role: 'MANAGER',
      is_verified: true, // Auto verified
      manager_key_id: key.id
    });

    await ManagerKeyModel.markAsUsed(key.id);

    // Email credentials
    // Note: ensure sendManagerCredentials exists in emailService
    await emailService.sendManagerCredentials(email, key.key_code, password);

    res.status(201).json({ success: true, message: 'Manager created', key: key.key_code });
  } catch (error) {
    next(error);
  }
};

// Request Supplier Status
export const requestSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { business_name, gst_number } = req.body;

    const user = await UserModel.update(req.user!.id, {
      supplier_status: 'PENDING',
      business_name,
      gst_number
    });

    res.status(200).json({ success: true, message: 'Supplier request submitted', user });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserModel.findById(req.user!.id);
    if (!user) return next(new AppError('User not found', 404));
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

<<<<<<< HEAD
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
=======
// Forgot Password
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findByEmail(email);

    if (!user) {
      // For security reasons, don't reveal if user exists
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, an OTP has been sent.'
      });
    }

    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await UserModel.update(user.id, {
      otp_code: otpCode,
      otp_expires_at: otpExpires
    });

    // Send specialized reset email
    await emailService.sendPasswordReset(email, otpCode);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email.'
    });
  } catch (error) {
    next(error);
  }
};

// Reset Password
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, password } = req.body;
    const user = await UserModel.findByEmail(email);

    if (!user) return next(new AppError('User not found', 404));

    if (!user.otp_code || !user.otp_expires_at || user.otp_code !== otp || new Date() > new Date(user.otp_expires_at)) {
      return next(new AppError('Invalid or expired OTP', 400));
    }

    // Update password and clear OTP
    await UserModel.update(user.id, {
      password: password,
      otp_code: undefined,
      otp_expires_at: undefined
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successful. Please login with your new password.'
    });
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
  } catch (error) {
    next(error);
  }
};
