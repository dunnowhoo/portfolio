// Jalankan sendiri di terminal: npm run hash-password
// Meminta username + password (tidak ditampilkan), membuat hash argon2id,
// lalu menyimpan ADMIN_USERNAME dan ADMIN_PASSWORD_HASH_B64 ke .env.local.
import fs from 'node:fs';
import readline from 'node:readline';
import { hash } from '@node-rs/argon2';

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => {
        if (s.includes(question)) rl.output.write(question);
        else if (s.includes('\n') || s.includes('\r')) rl.output.write('\n');
        else rl.output.write('*');
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

const username = (await ask('Username Dōjō: ')).trim();
const p1 = await ask('Password (min. 12 karakter): ', true);
const p2 = await ask('Ulangi password: ', true);
if (!username) { console.error('Username kosong.'); process.exit(1); }
if (p1 !== p2) { console.error('Password tidak sama.'); process.exit(1); }
if (p1.length < 12) { console.error('Password minimal 12 karakter.'); process.exit(1); }

const h = await hash(p1, { memoryCost: 19456, timeCost: 2, parallelism: 1 }); // argon2id
const b64 = Buffer.from(h).toString('base64');

const FILE = '.env.local';
let env = fs.existsSync(FILE) ? fs.readFileSync(FILE, 'utf8') : '';
const set = (k, v) => {
  const re = new RegExp(`^${k}=.*$`, 'm');
  if (re.test(env)) env = env.replace(re, `${k}=${v}`);
  else env += `${env && !env.endsWith('\n') ? '\n' : ''}${k}=${v}\n`;
};
set('ADMIN_USERNAME', username);
set('ADMIN_PASSWORD_HASH_B64', b64);
fs.writeFileSync(FILE, env);
console.log('Tersimpan di .env.local: ADMIN_USERNAME, ADMIN_PASSWORD_HASH_B64');
