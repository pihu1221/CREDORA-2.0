import { spawn } from 'child_process';
import http from 'http';

const server = spawn('node', ['dist/server.js'], { env: { ...process.env, NODE_ENV: 'production', PORT: '3001' } });

server.stdout.on('data', data => console.log(`stdout: ${data}`));
server.stderr.on('data', data => console.error(`stderr: ${data}`));

setTimeout(() => {
  http.get('http://localhost:3001/api/health', (res) => {
    let data = '';
    res.on('data', (d) => data += d);
    res.on('end', () => {
      console.log('Production Health API:', data);
      server.kill();
      process.exit(0);
    });
  }).on('error', (err) => {
    console.error('Fetch error:', err.message);
    server.kill();
    process.exit(1);
  });
}, 3000);
