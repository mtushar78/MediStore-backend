import { Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma';

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type MedicineListItem = {
  id: string;
  name: string;
  categoryId: string;
  manufacturer: string;
  unit: string;
  price: number;
  stock: number;
  images: string[];
  isActive: boolean;
  ratingAvg: number;
  ratingCount: number;
};

export type MedicineDetails = MedicineListItem & {
  description: string;
  sellerId: string;
};

const pickSort = (sortBy?: string, sortOrder?: string): Prisma.MedicineOrderByWithRelationInput => {
  const order = sortOrder === 'asc' ? 'asc' : 'desc';
  if (sortBy === 'price') return { price: order };
  if (sortBy === 'ratingAvg') return { ratingAvg: order };
  return { createdAt: order };
};

export const MedicinesService = {
  async listPublic(params: {
    q?: string;
    categoryId?: string;
    manufacturer?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sellerId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{ data: MedicineListItem[]; meta: PaginationMeta }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 12;
    const skip = (page - 1) * limit;

    const where: Prisma.MedicineWhereInput = {
      isActive: true,
      ...(params.q ? { name: { contains: params.q, mode: 'insensitive' } } : {}),
      ...(params.categoryId ? { categoryId: params.categoryId } : {}),
      ...(params.manufacturer ? { manufacturer: { contains: params.manufacturer, mode: 'insensitive' } } : {}),
      ...(params.sellerId ? { sellerId: params.sellerId } : {}),
      ...(params.inStock === true ? { stock: { gt: 0 } } : {}),
      ...(params.minPrice !== undefined || params.maxPrice !== undefined
        ? {
            price: {
              ...(params.minPrice !== undefined ? { gte: params.minPrice } : {}),
              ...(params.maxPrice !== undefined ? { lte: params.maxPrice } : {}),
            },
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      prisma.medicine.count({ where }),
      prisma.medicine.findMany({
        where,
        orderBy: pickSort(params.sortBy, params.sortOrder),
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          categoryId: true,
          manufacturer: true,
          unit: true,
          price: true,
          stock: true,
          images: true,
          isActive: true,
          ratingAvg: true,
          ratingCount: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return {
      data: items,
      meta: { page, limit, total, totalPages },
    };
  },

  async getPublic(id: string): Promise<MedicineDetails | null> {
    return prisma.medicine.findFirst({
      where: { id, isActive: true },
      select: {
        id: true,
        name: true,
        categoryId: true,
        manufacturer: true,
        unit: true,
        price: true,
        stock: true,
        images: true,
        isActive: true,
        ratingAvg: true,
        ratingCount: true,
        description: true,
        sellerId: true,
      },
    });
  },

  async createForSeller(
    sellerId: string,
    payload: {
      name: string;
      slug?: string;
      categoryId: string;
      manufacturer: string;
      unit: string;
      price: number;
      stock: number;
      images: string[];
      description: string;
      isActive: boolean;
    },
  ) {
    return prisma.medicine.create({
      data: {
        name: payload.name,
        slug: payload.slug,
        manufacturer: payload.manufacturer,
        unit: payload.unit,
        price: payload.price,
        stock: payload.stock,
        images: payload.images,
        description: payload.description,
        isActive: payload.isActive,
        category: { connect: { id: payload.categoryId } },
        seller: { connect: { id: sellerId } },
      },
      select: {
        id: true,
        name: true,
        categoryId: true,
        manufacturer: true,
        unit: true,
        price: true,
        stock: true,
        images: true,
        isActive: true,
        ratingAvg: true,
        ratingCount: true,
      },
    });
  },

  async listForSeller(sellerId: string) {
    return prisma.medicine.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        categoryId: true,
        manufacturer: true,
        unit: true,
        price: true,
        stock: true,
        images: true,
        isActive: true,
        ratingAvg: true,
        ratingCount: true,
      },
    });
  },

  async updateForSeller(
    sellerId: string,
    id: string,
    payload: {
      name?: string;
      slug?: string;
      categoryId?: string;
      manufacturer?: string;
      unit?: string;
      price?: number;
      stock?: number;
      images?: string[];
      description?: string;
      isActive?: boolean;
    },
  ) {
    const existing = await prisma.medicine.findFirst({ where: { id, sellerId }, select: { id: true } });
    if (!existing) throw new Error('NOT_FOUND');

    return prisma.medicine.update({
      where: { id },
      data: {
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.slug !== undefined ? { slug: payload.slug } : {}),
        ...(payload.manufacturer !== undefined ? { manufacturer: payload.manufacturer } : {}),
        ...(payload.unit !== undefined ? { unit: payload.unit } : {}),
        ...(payload.price !== undefined ? { price: payload.price } : {}),
        ...(payload.stock !== undefined ? { stock: payload.stock } : {}),
        ...(payload.images !== undefined ? { images: payload.images } : {}),
        ...(payload.description !== undefined ? { description: payload.description } : {}),
        ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
        ...(payload.categoryId ? { category: { connect: { id: payload.categoryId } } } : {}),
      },
      select: {
        id: true,
        name: true,
        categoryId: true,
        manufacturer: true,
        unit: true,
        price: true,
        stock: true,
        images: true,
        isActive: true,
        ratingAvg: true,
        ratingCount: true,
      },
    });
  },

  async deleteForSeller(sellerId: string, id: string) {
    const existing = await prisma.medicine.findFirst({ where: { id, sellerId }, select: { id: true } });
    if (!existing) throw new Error('NOT_FOUND');
    await prisma.medicine.update({ where: { id }, data: { isActive: false } });
  },

  async listAdmin(): Promise<MedicineListItem[]> {
    return prisma.medicine.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        categoryId: true,
        manufacturer: true,
        unit: true,
        price: true,
        stock: true,
        images: true,
        isActive: true,
        ratingAvg: true,
        ratingCount: true,
      },
    });
  },

  async adminUpdate(id: string, payload: { isActive?: boolean; categoryId?: string; stock?: number; price?: number }) {
    try {
      return prisma.medicine.update({
        where: { id },
        data: {
          ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
          ...(payload.stock !== undefined ? { stock: payload.stock } : {}),
          ...(payload.price !== undefined ? { price: payload.price } : {}),
          ...(payload.categoryId ? { category: { connect: { id: payload.categoryId } } } : {}),
        },
        select: {
          id: true,
          name: true,
          categoryId: true,
          manufacturer: true,
          unit: true,
          price: true,
          stock: true,
          images: true,
          isActive: true,
          ratingAvg: true,
          ratingCount: true,
        },
      });
    } catch (e: any) {
      if (String(e?.code) === 'P2025') throw new Error('NOT_FOUND');
      throw e;
    }
  },
};
