import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Orders (match the ones you already show in the UI)
  await prisma.order.upsert({
    where: { id: '441' },
    update: {},
    create: { id: '441', partNumber: 'PN-8821', requiredThread: '2-3/8" 8RD', status: 'QUEUED' }
  });
  await prisma.order.upsert({
    where: { id: '442' },
    update: { status: 'IN_PROGRESS' },
    create: { id: '442', partNumber: 'PN-8822', requiredThread: '3-1/2" 8RD', status: 'IN_PROGRESS' }
  });
  await prisma.order.upsert({
    where: { id: '443' },
    update: {},
    create: { id: '443', partNumber: 'PN-9001', requiredThread: 'NC38', status: 'QUEUED' }
  });

  // Gauges (example data)
  const now = new Date();
  const days = (n: number) => new Date(now.getTime() + n*24*60*60*1000);

  await prisma.gauge.upsert({
    where: { id: 'g1' },
    update: {},
    create: {
      id: 'g1',
      name: 'Thread Plug Gauge - 2-3/8" 8RD',
      lastCalibrated: days(-60),
      calibrationIntervalDays: 90,
      expiresAt: days(30)
    }
  });
  await prisma.gauge.upsert({
    where: { id: 'g2' },
    update: {},
    create: {
      id: 'g2',
      name: 'Ring Gauge - NC38',
      lastCalibrated: days(-100),
      calibrationIntervalDays: 90,
      expiresAt: days(-10) // expired
    }
  });

  // Example users
  await prisma.user.upsert({
    where: { id: 'u1' },
    update: {},
    create: { id: 'u1', name: 'Sam', role: 'INSPECTOR' }
  });
  await prisma.user.upsert({
    where: { id: 'u2' },
    update: {},
    create: { id: 'u2', name: 'Alex', role: 'SUPERVISOR' }
  });
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
