import detect from 'detect-port';
import { spawn } from 'child_process';

const desired = Number(process.env.PORT) || 3000;
const port = await detect(desired);

if (port !== desired) {
  console.log(`⚠️  Port ${desired} busy. Starting Next.js on ${port} instead.`);
} else {
  console.log(`✅ Starting Next.js on ${port}`);
}

const child = spawn('next', ['dev', '-p', String(port)], { stdio: 'inherit' });
child.on('exit', (code) => process.exit(code ?? 0));
