import express from 'express';
import cors from 'cors';
import detect from 'detect-port';
import ordersRouter from './routes/orders.js';
import packetsRouter from './routes/packets.js';
import gaugesRouter from './routes/gauges.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/orders', ordersRouter);
app.use('/api/packets', packetsRouter);
app.use('/api/gauges', gaugesRouter);

const DEFAULT_PORT = Number(process.env.PORT) || 3001;

(async () => {
  try {
    const availablePort = await detect(DEFAULT_PORT);
    const portToUse = availablePort === DEFAULT_PORT ? DEFAULT_PORT : availablePort;
    app.listen(portToUse, () => {
      console.log(
        `✅ InspectFlow API running on http://localhost:${portToUse}${
          portToUse !== DEFAULT_PORT ? ' (default port was busy)' : ''
        }`
      );
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
})();
