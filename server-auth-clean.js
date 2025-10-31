import { sendWelcomeEmail, verifyEmailTransport } from './mailer.js';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import pg from 'pg';

const { Pool } = pg;

const PORT = Number(process.env.PORT || 8080);
const CORS_ORIGINS = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// ----- DB client (vanilla pg; Drizzle ready later) -----
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL missing in .env');
  process.exit(1);
}
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function ensureTables() {
  // Minimal tables that match your front-end expectations
  await pool.query(`
    create extension if not exists "pgcrypto";
    create table if not exists users (
      id uuid primary key default gen_random_uuid(),
      email varchar(255) not null unique,
      password_hash text not null,
      name varchar(255) not null,
      is_active boolean default true,
      email_verified boolean default false,
      created_at timestamp default now(),
      updated_at timestamp default now()
    );
  `);
  await pool.query(`
    create table if not exists user_sessions (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references users(id) on delete cascade,
      session_token text not null unique,
      expires_at timestamp not null,
      created_at timestamp default now(),
      is_active boolean default true
    );
  `);
}

// ----- App -----
const app = express();
app.use(express.json());
app.set('trust proxy', true);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (CORS_ORIGINS.length === 0 || CORS_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: false
}));

app.get('/health', async (req, res) => {
  try {
    await pool.query('select 1');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
});

// ---- Auth endpoints ----
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, password required' });
    }

    // Check duplicate
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name`,
      [email, passwordHash, name]
    );

    const user = rows[0];

    // Respond immediately
    res.json({ user });

    // Fire-and-forget welcome email
    setImmediate(async () => {
      try {
        await sendWelcomeEmail({ to: email, name });
        console.log('[welcome] sent to', email);
      } catch (e) {
        console.error('[welcome] send failed:', e);
      }
    });
  } catch (e) {
    console.error('[register] error:', e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing email/password' });

    const { rows } = await pool.query(`select id, email, name, password_hash from users where email=$1 and is_active=true`, [email.toLowerCase()]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const sessionToken = nanoid(48);
    const days = Number(process.env.SESSION_DAYS || 14);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await pool.query(
      `insert into user_sessions (user_id, session_token, expires_at) values ($1,$2,$3)`,
      [user.id, sessionToken, expiresAt]
    );

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      sessionToken,
      expiresAt: expiresAt.toISOString()
    });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.post('/auth/logout', async (req, res) => {
  try {
    const { sessionToken } = req.body || {};
    if (!sessionToken) return res.status(400).json({ error: 'Missing sessionToken' });
    await pool.query(`update user_sessions set is_active=false where session_token=$1`, [sessionToken]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// Email transport health
app.get('/health/email', async (req, res) => {
  try {
    await verifyEmailTransport();
    res.json({ ok: true });
  } catch (e) {
    console.error('[health/email]', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});


// ----- Boot -----
// Tables already exist in Neon, skip ensureTables
app.listen(PORT, () => {
  console.log(`Auth API listening on ${PORT}`);
  console.log(`Email API: ${process.env.EMAIL_API_URL || 'https://api.organitrafficboost.com'}`);
});
