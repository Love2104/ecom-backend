import jwt from 'jsonwebtoken';
import { UserModel, UserInput, UserOutput } from '../models/User';
import { AppError } from '../middlewares/errorHandler';

export class AuthService {
  // Register a new user
  static async register(userData: UserInput): Promise<{ user: UserOutput; token: string }> {
    // Check if user already exists
    const existingUser = await UserModel.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    // Create user
    const user = await UserModel.create(userData);

    // Generate token
    const token = this.generateToken(user.id, user.role);

    return { user, token };
  }

  // Login user
  static async login(email: string, password: string): Promise<{ user: UserOutput; token: string }> {
    // Check if user exists
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if password matches
    const isMatch = await UserModel.comparePassword(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate token
    const token = this.generateToken(user.id, user.role);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      },
      token
    };
  }

  // Generate JWT token
  static generateToken(id: string, role: string): string {
    return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
  }
}