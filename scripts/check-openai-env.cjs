const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('OPENAI key loaded:', Boolean(process.env.OPENAI_API_KEY));
console.log('STT provider:', process.env.STT_PROVIDER || '');
console.log('STT model:', process.env.STT_MODEL || '');
