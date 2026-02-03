import crypto from 'crypto';
import dotenv from 'dotenv';
import { prisma } from '../db/prisma';

dotenv.config();

const hashPassword = (password: string) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

const main = async () => {
  const email = process.env.ADMIN_EMAIL || 'admin@medistore.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const name = process.env.ADMIN_NAME || 'Admin';

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      name,
      email,
      passwordHash: hashPassword(password),
      role: 'admin',
      status: 'active',
    },
    update: {
      name,
      passwordHash: hashPassword(password),
      role: 'admin',
      status: 'active',
    },
    select: { id: true, name: true, email: true, role: true, status: true },
  });

  process.stdout.write(
    JSON.stringify(
      {
        admin: user,
        login: { email, password },
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
