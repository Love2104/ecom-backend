// src/types/express/index.d.ts
import 'express';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      role: string;
      email?: string;
    };
  }
}
