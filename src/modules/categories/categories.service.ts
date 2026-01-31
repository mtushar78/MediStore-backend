import { Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma';

const slugify = (name: string) => {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

export type CategoryPublic = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
};

export const CategoriesService = {
  async listPublic(isActive?: boolean): Promise<CategoryPublic[]> {
    return prisma.category.findMany({
      where: {
        ...(isActive === undefined ? {} : { isActive }),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        isActive: true,
      },
    });
  },

  async create(payload: { name: string; description?: string }): Promise<CategoryPublic> {
    const slugBase = slugify(payload.name);
    const slug = slugBase || cryptoRandomSlug();

    return prisma.category.create({
      data: {
        name: payload.name,
        slug,
        description: payload.description,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        isActive: true,
      },
    });
  },

  async update(id: string, payload: { name?: string; description?: string; isActive?: boolean }): Promise<CategoryPublic> {
    const data: Prisma.CategoryUpdateInput = {
      ...(payload.name ? { name: payload.name, slug: slugify(payload.name) } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
      ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
    };

    return prisma.category.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        isActive: true,
      },
    });
  },

  async remove(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  },
};

const cryptoRandomSlug = () => {
  return `cat-${Math.random().toString(36).slice(2, 10)}`;
};
