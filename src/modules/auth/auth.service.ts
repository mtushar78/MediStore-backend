import crypto from 'crypto';
import { prisma } from '../../db/prisma';
import { signJwt } from '../../shared/auth/jwt';

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'seller';
};

type LoginPayload = {
  email: string;
  password: string;
};

const hashPassword = (password: string) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export const AuthService = {
  async register(payload: RegisterPayload) {
    const passwordHash = hashPassword(payload.password);

    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        passwordHash,
        role: payload.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) throw new Error('JWT_ACCESS_SECRET_NOT_SET');
    const accessToken = signJwt({ sub: user.id, role: user.role }, secret);

    return { user, accessToken };
  },

  async login(payload: LoginPayload) {
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        passwordHash: true,
      },
    });

    if (!user) throw new Error('INVALID_CREDENTIALS');
    if (user.status === 'banned') throw new Error('USER_BANNED');

    const passwordHash = hashPassword(payload.password);
    if (user.passwordHash !== passwordHash) throw new Error('INVALID_CREDENTIALS');

    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) throw new Error('JWT_ACCESS_SECRET_NOT_SET');
    const accessToken = signJwt({ sub: user.id, role: user.role }, secret);

    const { passwordHash: _ph, ...safeUser } = user;
    return { user: safeUser, accessToken };
  },
};
