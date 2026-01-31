import { prisma } from '../../db/prisma';

export type CartItemView = {
  medicineId: string;
  quantity: number;
  medicine: {
    id: string;
    name: string;
    price: number;
    stock: number;
    images: string[];
    isActive: boolean;
  };
};

export type CartView = {
  id: string;
  customerId: string;
  items: CartItemView[];
};

export const CartService = {
  async getOrCreate(customerId: string) {
    return prisma.cart.upsert({
      where: { customerId },
      create: { customerId },
      update: {},
      select: { id: true, customerId: true },
    });
  },

  async getCart(customerId: string): Promise<CartView> {
    const cart = await prisma.cart.upsert({
      where: { customerId },
      create: { customerId },
      update: {},
      select: {
        id: true,
        customerId: true,
        items: {
          orderBy: { createdAt: 'desc' },
          select: {
            medicineId: true,
            quantity: true,
            medicine: {
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                images: true,
                isActive: true,
              },
            },
          },
        },
      },
    });
    return cart;
  },

  async addItem(customerId: string, medicineId: string, quantity: number): Promise<CartView> {
    const cart = await this.getOrCreate(customerId);
    await prisma.cartItem.upsert({
      where: { cartId_medicineId: { cartId: cart.id, medicineId } },
      create: { cartId: cart.id, medicineId, quantity },
      update: { quantity: { increment: quantity } },
      select: { id: true },
    });
    return this.getCart(customerId);
  },

  async updateItem(customerId: string, medicineId: string, quantity: number): Promise<CartView> {
    const cart = await this.getOrCreate(customerId);
    await prisma.cartItem.update({
      where: { cartId_medicineId: { cartId: cart.id, medicineId } },
      data: { quantity },
      select: { id: true },
    });
    return this.getCart(customerId);
  },

  async removeItem(customerId: string, medicineId: string): Promise<CartView> {
    const cart = await this.getOrCreate(customerId);
    await prisma.cartItem.delete({
      where: { cartId_medicineId: { cartId: cart.id, medicineId } },
    });
    return this.getCart(customerId);
  },

  async clear(customerId: string): Promise<void> {
    const cart = await this.getOrCreate(customerId);
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  },
};


