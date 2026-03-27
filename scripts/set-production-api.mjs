import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const targetFile = path.join(
  rootDir,
  'frontend',
  'src',
  'environments',
  'environment.prod.generated.ts'
);

const apiUrl = process.env.FRONTEND_API_URL?.trim() || 'https://your-render-service.onrender.com/api';

const fileContent = `export const environment = {
  production: true,
  apiUrl: '${apiUrl}'
};
`;

await mkdir(path.dirname(targetFile), { recursive: true });
await writeFile(targetFile, fileContent, 'utf8');

console.log(`Wrote production API URL to ${targetFile}`);
