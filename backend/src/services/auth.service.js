import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createPool } from '../config/database.js';

const pool = createPool();

export async function registerUser({ email, password }) {
  const hash = await bcrypt.hash(password, 12);
  const [result] = await pool.execute(
    'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    [email, hash]
  );
  const userId = result.insertId;
  return issueToken({ id: userId, email });
}

export async function loginUser({ email, password }) {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  const user = rows[0];
  if (!user) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  return issueToken({ id: user.id, email: user.email });
}

function issueToken({ id, email }) {
  const token = jwt.sign(
    { sub: String(id), email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  return { token, email };
}
