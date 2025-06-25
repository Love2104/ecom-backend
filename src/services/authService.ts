import jwt, { SignOptions } from 'jsonwebtoken';
import { StringValue } from 'ms'; // ✅ Needed for expiresIn type
import { UserModel, UserInput, UserOutput } from '../models/User';
import { AppError } from '../middlewares/errorHandler';

export class AuthService {
  // Register a new user
  static async register(userData: UserInput): Promise<{ user: UserOutput; token: string }> {
    const existingUser = await UserModel.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    const user = await UserModel.create(userData);
    const token = this.generateToken(user.id, user.role);

    return { user, token };
  }

  // Login user
  static async login(email: string, password: string): Promise<{ user: UserOutput; token: string }> {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isMatch = await UserModel.comparePassword(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

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

  // ✅ Generate JWT token with type-safe `expiresIn`
  static generateToken(id: string, role: string): string {
    const secret = process.env.JWT_SECRET;
    const expiresInEnv = process.env.JWT_EXPIRES_IN || '30d';

    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const options: SignOptions = {
      expiresIn: expiresInEnv as StringValue,
    };

    return jwt.sign({ id, role }, secret, options);
  }
}
