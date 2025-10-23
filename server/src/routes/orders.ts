import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { z } from 'zod';

const router = Router();

// helper: start/end of today in local time
function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// GET /api/orders/today?status=QUEUED
router.get('/today', async (req, res) => {
  const { start, end } = todayRange();

  const statusParam = req.query.status as
    | 'QUEUED'
    | 'IN_PROGRESS'
    | 'DONE'
    | undefined;

  const where: any = {
    createdAt: { gte: start, lte: end },
  };
  if (statusParam) where.status = statusParam;

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  res.json(orders);
});

// GET /api/orders?status=QUEUED (general list with optional status)
router.get('/', async (req, res) => {
  const statusParam = req.query.status as
    | 'QUEUED'
    | 'IN_PROGRESS'
    | 'DONE'
    | undefined;

  const where: any = {};
  if (statusParam) where.status = statusParam;

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  res.json(orders);
});

// POST /api/orders
// body: { id(optional), partNumber, requiredThread, status(optional) }
const createOrderSchema = z.object({
  id: z.string().optional(), // allow manual id like "444"; else we'll generate one
  partNumber: z.string().min(1),
  requiredThread: z.string().min(1),
  status: z.enum(['QUEUED', 'IN_PROGRESS', 'DONE']).default('QUEUED'),
});

router.post('/', async (req, res) => {
  const parse = createOrderSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid order', details: parse.error.flatten() });
  }
  const data = parse.data;

  // if no id provided, use an auto string (cuid-like simple)
  const id =
    data.id ??
    String(Math.floor(400 + Math.random() * 600)); // e.g., "441" style simple demo

  const created = await prisma.order.create({
    data: {
      id,
      partNumber: data.partNumber,
      requiredThread: data.requiredThread,
      status: data.status,
    },
  });

  res.status(201).json(created);
});

export default router;
