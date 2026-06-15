import { createServer } from 'net';
import { spawnSync } from 'child_process';

const BASE_PORT = 4141;

function findAvailablePort(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.on('error', () => resolve(findAvailablePort(port + 1)));
    server.listen(port, () => server.close(() => resolve(port)));
  });
}

const port = await findAvailablePort(BASE_PORT);
if (port !== BASE_PORT) {
  console.log(`Port ${BASE_PORT} in use, using port ${port}`);
}
spawnSync('next', ['dev', '--port', String(port)], { stdio: 'inherit', shell: true });
