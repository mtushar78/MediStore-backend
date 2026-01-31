import { OrderStatus, PaymentMethod, Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma';

export type OrderSummary = {
  id: string;
  customerId: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: Date;
};

export type SellerOrderItemView = {
  id: string;
  orderId: string;
  orderStatus: OrderStatus;
  createdAt: Date;
  customerId: string;
  medicineId: string;
  nameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
};

const calcTotals = (items: Array<{ price: number; quantity: number }>) => {
  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const shippingFee = 0;
  const total = subtotal + shippingFee;
  return { subtotal, shippingFee, total };
};

export const OrdersService = {
  async createOrder(payload: {
    customerId: string;
    items: Array<{ medicineId: string; quantity: number }>;
    shippingAddress: Prisma.InputJsonValue;
    paymentMethod: PaymentMethod;
  }) {
    return prisma.$transaction(async (tx) => {
      const ids = payload.items.map((i) => i.medicineId);

      const medicines = await tx.medicine.findMany({
        where: { id: { in: ids }, isActive: true },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          sellerId: true,
        },
      });

      if (medicines.length !== ids.length) {
        throw new Error('INVALID_MEDICINE');
      }

      const medicineById = new Map(medicines.map((m) => [m.id, m]));

      for (const item of payload.items) {
        const m = medicineById.get(item.medicineId);
        if (!m) throw new Error('INVALID_MEDICINE');
        if (m.stock < item.quantity) throw new Error('INSUFFICIENT_STOCK');
      }

      for (const item of payload.items) {
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: { stock: { decrement: item.quantity } },
          select: { id: true },
        });
      }

      const totals = calcTotals(
        payload.items.map((it) => ({ price: medicineById.get(it.medicineId)!.price, quantity: it.quantity })),
      );

      const order = await tx.order.create({
        data: {
          customerId: payload.customerId,
          subtotal: totals.subtotal,
          shippingFee: totals.shippingFee,
          total: totals.total,
          shippingAddress: payload.shippingAddress,
          paymentMethod: payload.paymentMethod,
          status: OrderStatus.PLACED,
          items: {
            create: payload.items.map((it) => {
              const m = medicineById.get(it.medicineId)!;
              return {
                medicineId: m.id,
                sellerId: m.sellerId,
                nameSnapshot: m.name,
                priceSnapshot: m.price,
                quantity: it.quantity,
              };
            }),
          },
        },
        select: {
          id: true,
          customerId: true,
          subtotal: true,
          shippingFee: true,
          total: true,
          paymentMethod: true,
          status: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              medicineId: true,
              sellerId: true,
              nameSnapshot: true,
              priceSnapshot: true,
              quantity: true,
            },
          },
        },
      });

      await tx.cartItem.deleteMany({ where: { cart: { customerId: payload.customerId } } });
      return order;
    });
  },

  async listMyOrders(customerId: string, opts: { status?: OrderStatus; page?: number; limit?: number }) {
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 12;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      customerId,
      ...(opts.status ? { status: opts.status } : {}),
    };

    const [total, items] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          customerId: true,
          subtotal: true,
          shippingFee: true,
          total: true,
          paymentMethod: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
  },

  async getMyOrder(customerId: string, id: string) {
    return prisma.order.findFirst({
      where: { id, customerId },
      select: {
        id: true,
        customerId: true,
        subtotal: true,
        shippingFee: true,
        total: true,
        paymentMethod: true,
        status: true,
        shippingAddress: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            medicineId: true,
            sellerId: true,
            nameSnapshot: true,
            priceSnapshot: true,
            quantity: true,
          },
        },
      },
    });
  },

  async cancelMyOrder(customerId: string, id: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id, customerId },
        select: { id: true, status: true, items: { select: { medicineId: true, quantity: true } } },
      });
      if (!order) throw new Error('NOT_FOUND');
      if (order.status !== OrderStatus.PLACED) throw new Error('CANNOT_CANCEL');

      await tx.order.update({ where: { id }, data: { status: OrderStatus.CANCELLED }, select: { id: true } });

      for (const it of order.items) {
        await tx.medicine.update({
          where: { id: it.medicineId },
          data: { stock: { increment: it.quantity } },
          select: { id: true },
        });
      }

      return { id, status: OrderStatus.CANCELLED };
    });
  },

  async listSellerOrderItems(sellerId: string, opts: { status?: OrderStatus; page?: number; limit?: number }) {
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 12;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderItemWhereInput = {
      sellerId,
      ...(opts.status ? { order: { status: opts.status } } : {}),
    };

    const [total, items] = await Promise.all([
      prisma.orderItem.count({ where }),
      prisma.orderItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          orderId: true,
          createdAt: true,
          medicineId: true,
          nameSnapshot: true,
          priceSnapshot: true,
          quantity: true,
          sellerId: true,
          order: { select: { status: true, customerId: true } },
        },
      }),
    ]);

    const mapped: SellerOrderItemView[] = items.map((it) => ({
      id: it.id,
      orderId: it.orderId,
      orderStatus: it.order.status,
      createdAt: it.createdAt,
      customerId: it.order.customerId,
      medicineId: it.medicineId,
      nameSnapshot: it.nameSnapshot,
      priceSnapshot: it.priceSnapshot,
      quantity: it.quantity,
    }));

    return { items: mapped, meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
  },

  async sellerUpdateOrderStatus(sellerId: string, orderId: string, status: OrderStatus) {
    const hasItem = await prisma.orderItem.findFirst({ where: { orderId, sellerId }, select: { id: true } });
    if (!hasItem) throw new Error('NOT_ALLOWED');

    try {
      return prisma.order.update({
        where: { id: orderId },
        data: { status },
        select: { id: true, status: true },
      });
    } catch (e: any) {
      if (String(e?.code) === 'P2025') throw new Error('NOT_FOUND');
      throw e;
    }
  },

  async adminListOrders(opts: { status?: OrderStatus; page?: number; limit?: number }) {
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 12;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      ...(opts.status ? { status: opts.status } : {}),
    };

    const [total, items] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          customerId: true,
          subtotal: true,
          shippingFee: true,
          total: true,
          paymentMethod: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
  },

  async adminUpdateOrderStatus(orderId: string, status: OrderStatus) {
    try {
      return prisma.order.update({
        where: { id: orderId },
        data: { status },
        select: { id: true, status: true },
      });
    } catch (e: any) {
      if (String(e?.code) === 'P2025') throw new Error('NOT_FOUND');
      throw e;
    }
  },
};


