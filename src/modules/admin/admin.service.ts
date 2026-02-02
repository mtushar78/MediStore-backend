import { Prisma, UserRole, UserStatus } from '@prisma/client';
import { prisma } from '../../db/prisma';

export const AdminService = {
  async listUsers(opts: {
    role?: UserRole;
    status?: UserStatus;
    q?: string;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'name' | 'email';
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 12;
    const skip = (page - 1) * limit;
    const order = opts.sortOrder === 'asc' ? 'asc' : 'desc';

    const where: Prisma.UserWhereInput = {
      ...(opts.role ? { role: opts.role } : {}),
      ...(opts.status ? { status: opts.status } : {}),
      ...(opts.q
        ? {
            OR: [
              { name: { contains: opts.q, mode: 'insensitive' } },
              { email: { contains: opts.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.UserOrderByWithRelationInput =
      opts.sortBy === 'name'
        ? { name: order }
        : opts.sortBy === 'email'
          ? { email: order }
          : { createdAt: order };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          phone: true,
          address: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return { users, meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
  },

  async getUser(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async updateUserStatus(id: string, status: UserStatus) {
    try {
      return await prisma.user.update({
        where: { id },
        data: { status },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          updatedAt: true,
        },
      });
    } catch (e: any) {
      if (String(e?.code) === 'P2025') return null;
      throw e;
    }
  },

  async deleteReview(id: string) {
    try {
      const review = await prisma.review.delete({
        where: { id },
        select: { id: true, medicineId: true },
      });

      const agg = await prisma.review.aggregate({
        where: { medicineId: review.medicineId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await prisma.medicine.update({
        where: { id: review.medicineId },
        data: {
          ratingAvg: agg._avg.rating ?? 0,
          ratingCount: agg._count.rating,
        },
        select: { id: true },
      });

      return { id: review.id };
    } catch (e: any) {
      if (String(e?.code) === 'P2025') return null;
      throw e;
    }
  },
};
