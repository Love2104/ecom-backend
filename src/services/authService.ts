import jwt, { SignOptions } from 'jsonwebtoken';
import { UserModel, UserInput, UserOutput } from '../models/User';
import { AppError } from '../middlewares/errorHandler';

export class AuthService {
  static async register(userData: UserInput): Promise<{ user: UserOutput; token: string }> {
    const existingUser = await UserModel.findByEmail(userData.email);
    if (existingUser) throw new AppError('User already exists', 400);
    const user = await UserModel.create(userData);
    const token = this.generateToken(user.id, user.role);
    return { user, token };
  }

  static async login(email: string, password: string): Promise<{ user: UserOutput; token: string }> {
    const user = await UserModel.findByEmail(email);
    if (!user || !(await UserModel.comparePassword(password, user.password))) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = this.generateToken(user.id, user.role);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
      token,
    };
  }

  static generateToken(id: string, role: string): string {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '30d';

    if (!secret) throw new Error('JWT_SECRET is not defined');

    const options: SignOptions = {
      expiresIn: expiresIn as SignOptions['expiresIn'],
    };

    return jwt.sign({ id, role }, secret, options);
  }
}
