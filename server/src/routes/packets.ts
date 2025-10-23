import { Router } from 'express';

const router = Router();

router.post('/', (req, res) => {
  const { orderId } = req.body as { orderId?: string };
  if (!orderId) return res.status(400).json({ error: 'orderId is required' });

  const packet = {
    orderId,
    sopLinks: [
      'SOP-THREAD-GENERAL.pdf',
      'SOP-NDT-MT-LEVEL2.pdf'
    ],
    checklist: [
      'Verify gauge calibration',
      'Confirm thread spec vs order',
      'Record measurements',
      'Sign inspector certificate'
    ]
  };

  res.json(packet);
});

export default router;
