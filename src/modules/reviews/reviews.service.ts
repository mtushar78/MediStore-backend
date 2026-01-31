import { prisma } from '../../db/prisma';

export const ReviewsService = {
  async listForMedicine(medicineId: string, opts: { page?: number; limit?: number }) {
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 12;
    const skip = (page - 1) * limit;

    const where = { medicineId };
    const [total, items] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          medicineId: true,
          orderId: true,
          customerId: true,
          rating: true,
          comment: true,
          createdAt: true,
        },
      }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
  },

  async listMe(customerId: string, opts: { page?: number; limit?: number }) {
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 12;
    const skip = (page - 1) * limit;

    const where = { customerId };
    const [total, items] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          medicineId: true,
          orderId: true,
          customerId: true,
          rating: true,
          comment: true,
          createdAt: true,
        },
      }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
  },

  async create(customerId: string, payload: { medicineId: string; orderId: string; rating: number; comment?: string }) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: payload.orderId, customerId },
        select: { id: true, status: true, items: { select: { medicineId: true } } },
      });
      if (!order) throw new Error('ORDER_NOT_FOUND');
      if (order.status !== 'DELIVERED') throw new Error('ORDER_NOT_DELIVERED');

      const hasMedicine = order.items.some((it) => it.medicineId === payload.medicineId);
      if (!hasMedicine) throw new Error('NOT_PURCHASED');

      try {
        const review = await tx.review.create({
          data: {
            customerId,
            orderId: payload.orderId,
            medicineId: payload.medicineId,
            rating: payload.rating,
            comment: payload.comment,
          },
          select: {
            id: true,
            medicineId: true,
            orderId: true,
            customerId: true,
            rating: true,
            comment: true,
            createdAt: true,
          },
        });

        const agg = await tx.review.aggregate({
          where: { medicineId: payload.medicineId },
          _avg: { rating: true },
          _count: { rating: true },
        });

        await tx.medicine.update({
          where: { id: payload.medicineId },
          data: {
            ratingAvg: agg._avg.rating ?? 0,
            ratingCount: agg._count.rating,
          },
          select: { id: true },
        });

        return review;
      } catch (e: any) {
        if (String(e?.code) === 'P2002') throw new Error('DUPLICATE_REVIEW');
        throw e;
      }
    });
  },
};


