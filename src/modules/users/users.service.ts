import { Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma';

export type UserMe = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  phone?: string | null;
  address?: unknown;
};

export type UpdateMePayload = {
  name?: string;
  phone?: string;
  address?: Prisma.JsonObject;
};

export const UsersService = {
  async getMe(userId: string): Promise<UserMe | null> {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        address: true,
      },
    });
  },

  async updateMe(userId: string, payload: UpdateMePayload): Promise<UserMe> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        ...(payload.name ? { name: payload.name } : {}),
        ...(payload.phone ? { phone: payload.phone } : {}),
        ...(payload.address !== undefined ? { address: payload.address } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        address: true,
      },
    });
  },
};
