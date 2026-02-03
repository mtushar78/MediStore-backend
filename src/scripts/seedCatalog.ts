import crypto from 'crypto';
import dotenv from 'dotenv';
import { prisma } from '../db/prisma';

dotenv.config();

const hashPassword = (password: string) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

type SeedCategory = {
  name: string;
  description?: string;
};

const categories: SeedCategory[] = [
  { name: 'Pain Relief', description: 'Analgesics for headaches, muscle pain and general aches.' },
  { name: 'Cold & Flu', description: 'Symptom relief for cold, cough, fever and flu.' },
  { name: 'Allergy', description: 'Antihistamines and related allergy relief.' },
  { name: 'Digestive Health', description: 'For acidity, reflux, diarrhea, constipation and gut comfort.' },
  { name: 'Vitamins & Supplements', description: 'Daily vitamins, minerals and supplements.' },
  { name: 'Diabetes Care', description: 'Medicines and supplies to help manage diabetes.' },
  { name: 'Heart & Blood Pressure', description: 'Medicines for cardiovascular health.' },
  { name: 'Skin Care', description: 'Topicals for acne, rashes, fungal infections and irritation.' },
  { name: 'Eye Care', description: 'Drops and ointments for dry eyes and irritation.' },
  { name: 'Antibiotics', description: 'Prescription antibiotics (dummy catalog items).' },
];

const manufacturerPool = [
  'Square Pharmaceuticals',
  'Beximco Pharma',
  'Incepta Pharmaceuticals',
  'Renata Limited',
  'ACI Limited',
  'Aristopharma',
  'ACME Laboratories',
  'Healthcare Pharmaceuticals',
];

const unitPool = ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops', 'powder'];

const pick = <T>(arr: T[], index: number) => arr[index % arr.length];

const makeMedicineName = (categoryName: string, i: number) => {
  const base = categoryName
    .replace(/&/g, 'and')
    .replace(/\s+/g, ' ')
    .trim();
  return `${base} Med ${String(i).padStart(2, '0')}`;
};

const main = async () => {
  const sellerEmail = process.env.SEED_SELLER_EMAIL || 'seller@medistore.local';
  const sellerPassword = process.env.SEED_SELLER_PASSWORD || 'seller1234';
  const sellerName = process.env.SEED_SELLER_NAME || 'Demo Seller';

  // Ensure we have a seller (medicines require sellerId)
  const seller = await prisma.user.upsert({
    where: { email: sellerEmail },
    create: {
      name: sellerName,
      email: sellerEmail,
      passwordHash: hashPassword(sellerPassword),
      role: 'seller',
      status: 'active',
    },
    update: {
      name: sellerName,
      passwordHash: hashPassword(sellerPassword),
      role: 'seller',
      status: 'active',
    },
    select: { id: true, email: true, name: true },
  });

  // Upsert categories
  const upsertedCategories = await Promise.all(
    categories.map((c) =>
      prisma.category.upsert({
        where: { slug: slugify(c.name) },
        create: {
          name: c.name,
          slug: slugify(c.name),
          description: c.description,
          isActive: true,
        },
        update: {
          name: c.name,
          description: c.description,
          isActive: true,
        },
        select: { id: true, name: true, slug: true },
      }),
    ),
  );

  // Create at least 50 medicines across categories.
  // We'll create 5 medicines per category * 10 categories = 50.
  const medicinesInput = upsertedCategories.flatMap((cat, catIndex) => {
    return Array.from({ length: 5 }).map((_, j) => {
      const n = catIndex * 5 + j + 1;
      const name = makeMedicineName(cat.name, n);
      const slug = slugify(`${name}-${cat.slug}`);
      const manufacturer = pick(manufacturerPool, n);
      const unit = pick(unitPool, n);
      const price = 20 + (n % 10) * 7.5 + catIndex * 3;
      const stock = 10 + (n % 15) * 3;
      const description = `Dummy product: ${name}. Category: ${cat.name}. Manufacturer: ${manufacturer}.`;

      // Keep images non-empty; some UIs expect at least one image.
      const images = [
        `https://picsum.photos/seed/${encodeURIComponent(slug)}/600/400`,
      ];

      return {
        name,
        slug,
        categoryId: cat.id,
        sellerId: seller.id,
        manufacturer,
        unit,
        price,
        stock,
        images,
        description,
        isActive: true,
      };
    });
  });

  // Idempotent insert: upsert each medicine by unique slug
  const createdOrUpdated = await Promise.all(
    medicinesInput.map((m) =>
      prisma.medicine.upsert({
        where: { slug: m.slug },
        create: m,
        update: {
          name: m.name,
          categoryId: m.categoryId,
          sellerId: m.sellerId,
          manufacturer: m.manufacturer,
          unit: m.unit,
          price: m.price,
          stock: m.stock,
          images: m.images,
          description: m.description,
          isActive: true,
        },
        select: { id: true, name: true, slug: true, categoryId: true },
      }),
    ),
  );

  process.stdout.write(
    JSON.stringify(
      {
        seller: {
          id: seller.id,
          email: seller.email,
          name: seller.name,
          login: { email: sellerEmail, password: sellerPassword },
        },
        categories: upsertedCategories,
        medicinesCount: createdOrUpdated.length,
      },
      null,
      2,
    ) + '\n',
  );
};

main()
  .catch(async (e) => {
    process.stderr.write(String(e) + '\n');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
