import { Router } from 'express';
import { prisma } from '../db/prisma.js';

const router = Router();

router.get('/', async (_req, res) => {
  const gauges = await prisma.gauge.findMany({ orderBy: { createdAt: 'desc' } });
  const now = new Date();

  const withStatus = gauges.map(g => {
    const daysLeft = Math.ceil((g.expiresAt.getTime() - now.getTime()) / (1000*60*60*24));
    let status: 'ok' | 'due_soon' | 'expired' = 'ok';
    if (daysLeft <= 0) status = 'expired';
    else if (daysLeft <= 7) status = 'due_soon';
    return { ...g, daysLeft, status };
  });

  res.json(withStatus);
});

export default router;
