import { spawn } from 'node:child_process';
const landingPort = process.env.DSKET_LANDING_PORT || '5180';
const demoPort = process.env.DSKET_DEMO_PORT || '5181';
console.log(`랜딩: http://127.0.0.1:${landingPort}/ · 시연: http://127.0.0.1:${landingPort}/demo/`);
const children = [
  spawn('npm', ['--prefix', 'demo', 'run', 'dev', '--', '--port', demoPort], { stdio: 'inherit' }),
  spawn('npm', ['--prefix', 'landing', 'run', 'dev', '--', '--port', landingPort, '--strictPort'], { stdio: 'inherit', env: { ...process.env, DSKET_DEMO_PORT: demoPort } }),
];
let stopping = false;
function stop(code = 0) { if (stopping) return; stopping = true; children.forEach(child => child.kill('SIGTERM')); process.exitCode = code; }
children.forEach(child => { child.on('error', error => { console.error(error.message); stop(1); }); child.on('exit', code => stop(code || 0)); });
process.on('SIGINT', () => stop()); process.on('SIGTERM', () => stop());
