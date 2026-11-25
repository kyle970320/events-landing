import { spawnSync } from 'node:child_process';
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
for (const app of ['landing', 'demo']) { const result = spawnSync('npm', ['--prefix', app, 'run', 'build'], { stdio: 'inherit' }); if (result.status !== 0) process.exit(result.status || 1); }
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('landing/dist', 'dist', { recursive: true });
await cp('demo/dist', 'dist/demo', { recursive: true });
// Netlify-compatible SPA fallback. Other hosts need equivalent ordered rules.
await writeFile('dist/_redirects', '/demo/* /demo/index.html 200\n/* /index.html 200\n');
console.log('\n통합 빌드 완료: dist/ (랜딩 /, 시연 /demo/)');
