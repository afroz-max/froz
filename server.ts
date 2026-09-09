import express from 'express';
import 'dotenv/config';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const allowedOrigins = (process.env.FRONTEND_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function requireEnv(name: 'DATABASE_URL' | 'JWT_SECRET'): string {
  const value = process.env[name];
  if (!value) {
    console.error(`${name} is required. Set it in the environment before starting FROZ.`);
    process.exit(1);
  }
  return value;
}

const DATABASE_URL = requireEnv('DATABASE_URL');
const JWT_SECRET = requireEnv('JWT_SECRET');

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

const pool = new Pool({ connectionString: DATABASE_URL, connectionTimeoutMillis: 3000 });

// Initialize PostgreSQL Database Connection and Schema
async function initDB() {
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS professional_profiles (
          id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users(id) ON DELETE CASCADE,
          profile_picture TEXT,
          professional_name VARCHAR(255) NOT NULL,
          city VARCHAR(100) NOT NULL,
          area VARCHAR(100) NOT NULL,
          skills TEXT NOT NULL,
          service_category VARCHAR(100) NOT NULL,
          short_description TEXT NOT NULL,
          experience VARCHAR(100) NOT NULL,
          portfolio TEXT,
          expected_price DECIMAL(10,2),
          is_hidden BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS collaboration_requests (
          id SERIAL PRIMARY KEY,
          sender_id INT REFERENCES users(id) ON DELETE CASCADE,
          professional_id INT REFERENCES professional_profiles(id) ON DELETE CASCADE,
          service VARCHAR(100) NOT NULL,
          message TEXT NOT NULL,
          status VARCHAR(20) DEFAULT 'Pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE UNIQUE INDEX IF NOT EXISTS professional_profiles_user_id_key
          ON professional_profiles (user_id);
      `);
      console.log('Successfully connected to PostgreSQL database and verified schema.');
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('PostgreSQL connection failed:', err.message);
    console.error('Ensure PostgreSQL is running and DATABASE_URL points to a reachable database.');
    await pool.end();
    throw err;
  }
}

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parseOptionalPrice(value: unknown): number | null | undefined {
  if (value === null || value === undefined || value === '') return null;
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 && price <= 99999999.99 ? price : undefined;
}

function isValidProfilePicture(value: unknown): boolean {
  return value === null || value === undefined || value === '' ||
    (typeof value === 'string' && /^data:image\/(png|jpeg|jpg|webp);base64,/.test(value) && value.length <= 3 * 1024 * 1024);
}

function reportServerError(operation: string, error: unknown, res: express.Response) {
  console.error(`${operation} failed:`, error);
  return res.status(500).json({ error: 'Internal server error. Please try again.' });
}

// Middleware to authenticate JWT
interface AuthRequest extends express.Request {
  user?: { id: number; email: string; name: string };
}

function authenticateToken(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired session. Please log in again.' });
    }
    req.user = user;
    next();
  });
}

// --- API ROUTES (PostgreSQL Only) ---

// 1. Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    if (!pool) {
      return res.status(500).json({ error: 'Database connection not initialized.' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, password_hash]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.json({ message: 'Registration successful', user });
  } catch (err: any) {
    if (err?.code === '23505') {
      return res.status(400).json({ error: 'Email is already registered.' });
    }
    return reportServerError('Registration', err, res);
  }
});

// 2. Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (!pool) {
      return res.status(500).json({ error: 'Database connection not initialized.' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email, created_at: user.created_at },
    });
  } catch (err: any) {
    return reportServerError('Login', err, res);
  }
});

// 3. Get Current User
app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!pool) return res.status(500).json({ error: 'Database connection error.' });
    const result = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [req.user?.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    return res.json({ user: result.rows[0] });
  } catch (err: any) {
    return reportServerError('Current user lookup', err, res);
  }
});

// 4. Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// 5. Create Professional Profile
app.post('/api/profiles', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const {
      profile_picture,
      professional_name,
      city,
      area,
      skills,
      service_category,
      short_description,
      experience,
      portfolio,
      expected_price,
    } = req.body;

    if (typeof professional_name !== 'string' || !professional_name.trim() ||
        typeof city !== 'string' || !city.trim() ||
        typeof area !== 'string' || !area.trim() ||
        typeof skills !== 'string' || !skills.trim() ||
        typeof service_category !== 'string' || !service_category.trim()) {
      return res.status(400).json({ error: 'Please fill in Name, Service Category, City, Area, and Skills.' });
    }

    const price = parseOptionalPrice(expected_price);
    if (price === undefined) {
      return res.status(400).json({ error: 'Expected price must be a valid non-negative number.' });
    }
    if (!isValidProfilePicture(profile_picture)) {
      return res.status(400).json({ error: 'Profile image must be a supported image smaller than 2 MB.' });
    }

    if (!pool) return res.status(500).json({ error: 'Database connection error.' });

    const existing = await pool.query('SELECT id FROM professional_profiles WHERE user_id = $1', [req.user?.id]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'You already have a professional profile. You can edit it instead.' });
    }

    const finalShortDesc = short_description || `Available for ${service_category} in ${area}, ${city}`;
    const finalExp = experience || 'Available';

    const result = await pool.query(
      `INSERT INTO professional_profiles 
       (user_id, profile_picture, professional_name, city, area, skills, service_category, short_description, experience, portfolio, expected_price, is_hidden) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, false) 
       RETURNING *`,
      [
        req.user?.id,
        profile_picture || '',
        professional_name,
        city,
        area,
        skills,
        service_category,
        finalShortDesc,
        finalExp,
        portfolio || '',
        price,
      ]
    );
    return res.status(201).json({ message: 'Professional profile created successfully', profile: result.rows[0] });
  } catch (err: any) {
    if (err?.code === '23505') {
      return res.status(400).json({ error: 'You already have a professional profile. You can edit it instead.' });
    }
    return reportServerError('Profile creation', err, res);
  }
});

// 6. Get Current User's Professional Profile
app.get('/api/profiles/me/detail', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!pool) return res.status(500).json({ error: 'Database connection error.' });
    const result = await pool.query('SELECT * FROM professional_profiles WHERE user_id = $1', [req.user?.id]);
    return res.json({ profile: result.rows[0] || null });
  } catch (err: any) {
    return reportServerError('Current profile lookup', err, res);
  }
});

// 7. Edit Professional Profile
app.put('/api/profiles/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const profileId = parseId(req.params.id);
    const {
      profile_picture,
      professional_name,
      city,
      area,
      skills,
      service_category,
      short_description,
      experience,
      portfolio,
      expected_price,
    } = req.body;

    if (!profileId) return res.status(400).json({ error: 'Invalid professional profile ID.' });
    if (typeof professional_name !== 'string' || !professional_name.trim() ||
        typeof city !== 'string' || !city.trim() ||
        typeof area !== 'string' || !area.trim() ||
        typeof skills !== 'string' || !skills.trim() ||
        typeof service_category !== 'string' || !service_category.trim()) {
      return res.status(400).json({ error: 'Name, service category, city, area, and skills are required.' });
    }
    const price = parseOptionalPrice(expected_price);
    if (price === undefined) {
      return res.status(400).json({ error: 'Expected price must be a valid non-negative number.' });
    }
    if (!isValidProfilePicture(profile_picture)) {
      return res.status(400).json({ error: 'Profile image must be a supported image smaller than 2 MB.' });
    }

    const check = await pool.query('SELECT user_id FROM professional_profiles WHERE id = $1', [profileId]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Professional profile not found.' });
    if (check.rows[0].user_id !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized to modify this profile.' });
    }

    const result = await pool.query(
      `UPDATE professional_profiles 
       SET profile_picture = COALESCE($1, profile_picture),
           professional_name = $2,
           city = $3,
           area = $4,
           skills = $5,
           service_category = $6,
           short_description = $7,
           experience = $8,
           portfolio = $9,
           expected_price = $10,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 RETURNING *`,
      [
        profile_picture,
        professional_name,
        city,
        area,
        skills,
        service_category,
        short_description,
        experience,
        portfolio,
        price,
        profileId,
      ]
    );
    return res.json({ message: 'Profile updated successfully', profile: result.rows[0] });
  } catch (err: any) {
    return reportServerError('Profile update', err, res);
  }
});

// 8. Hide / Show Professional Profile
app.patch('/api/profiles/:id/visibility', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const profileId = parseId(req.params.id);
    const { is_hidden } = req.body;

    if (!profileId) return res.status(400).json({ error: 'Invalid professional profile ID.' });
    if (typeof is_hidden !== 'boolean') {
      return res.status(400).json({ error: 'Profile visibility must be a boolean.' });
    }

    const check = await pool.query('SELECT user_id FROM professional_profiles WHERE id = $1', [profileId]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Professional profile not found.' });
    if (check.rows[0].user_id !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized to modify this profile.' });
    }

    const result = await pool.query(
      'UPDATE professional_profiles SET is_hidden = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [is_hidden, profileId]
    );
    return res.json({ message: 'Profile visibility updated', profile: result.rows[0] });
  } catch (err: any) {
    return reportServerError('Profile visibility update', err, res);
  }
});

// 9. Delete Professional Profile
app.delete('/api/profiles/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const profileId = parseId(req.params.id);

    if (!profileId) return res.status(400).json({ error: 'Invalid professional profile ID.' });

    const check = await pool.query('SELECT user_id FROM professional_profiles WHERE id = $1', [profileId]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Professional profile not found.' });
    if (check.rows[0].user_id !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this profile.' });
    }

    await pool.query('DELETE FROM professional_profiles WHERE id = $1', [profileId]);
    return res.json({ message: 'Professional profile deleted successfully.' });
  } catch (err: any) {
    return reportServerError('Profile deletion', err, res);
  }
});

// 10. Search Professionals
app.get('/api/profiles/search', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { service_category, skill, city, area } = req.query;

    if (!pool) return res.status(500).json({ error: 'Database connection error.' });

    let query = 'SELECT p.* FROM professional_profiles p WHERE p.is_hidden = false';
    const params: any[] = [];
    let paramIndex = 1;

    if (service_category && service_category !== 'All') {
      query += ` AND p.service_category ILIKE $${paramIndex++}`;
      params.push(`%${service_category}%`);
    }
    if (skill && String(skill).trim() !== '') {
      query += ` AND (p.skills ILIKE $${paramIndex++} OR p.professional_name ILIKE $${paramIndex++} OR p.short_description ILIKE $${paramIndex++})`;
      const term = `%${skill}%`;
      params.push(term, term, term);
    }
    if (city && String(city).trim() !== '') {
      query += ` AND p.city ILIKE $${paramIndex++}`;
      params.push(`%${city}%`);
    }
    if (area && String(area).trim() !== '') {
      query += ` AND p.area ILIKE $${paramIndex++}`;
      params.push(`%${area}%`);
    }
    query += ' ORDER BY p.created_at DESC';

    const result = await pool.query(query, params);
    return res.json({ profiles: result.rows });
  } catch (err: any) {
    return reportServerError('Professional search', err, res);
  }
});

// 11. View Professional Profile Details
app.get('/api/profiles/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const profileId = parseId(req.params.id);

    if (!profileId) return res.status(400).json({ error: 'Invalid professional profile ID.' });

    const result = await pool.query(
      'SELECT p.* FROM professional_profiles p WHERE p.id = $1 AND p.is_hidden = false',
      [profileId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Professional profile not found.' });
    return res.json({ profile: result.rows[0] });
  } catch (err: any) {
    return reportServerError('Profile lookup', err, res);
  }
});

// 12. Send Collaboration Request
app.post('/api/requests', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { professional_id, service, message } = req.body;
    const profIdNum = parseId(String(professional_id));

    if (!profIdNum || typeof service !== 'string' || !service.trim() || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Professional ID, service, and message are required.' });
    }

    if (!pool) return res.status(500).json({ error: 'Database connection error.' });

    const profCheck = await pool.query('SELECT * FROM professional_profiles WHERE id = $1', [profIdNum]);
    if (profCheck.rows.length === 0) return res.status(404).json({ error: 'Professional profile not found.' });
    const professional = profCheck.rows[0];
    if (professional.is_hidden) {
      return res.status(404).json({ error: 'Professional profile not found.' });
    }
    if (professional.user_id === req.user?.id) {
      return res.status(400).json({ error: 'You cannot send a collaboration request to your own profile.' });
    }

    const result = await pool.query(
      `INSERT INTO collaboration_requests (sender_id, professional_id, service, message, status) 
       VALUES ($1, $2, $3, $4, 'Pending') RETURNING *`,
      [req.user?.id, profIdNum, service, message]
    );
    return res.status(201).json({ message: 'Collaboration request sent successfully', request: result.rows[0] });
  } catch (err: any) {
    return reportServerError('Request creation', err, res);
  }
});

// 13. Accept Request
app.patch('/api/requests/:id/accept', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const requestId = parseId(req.params.id);

    if (!requestId) return res.status(400).json({ error: 'Invalid collaboration request ID.' });

    const reqCheck = await pool.query(
      `SELECT r.*, p.user_id as prof_user_id FROM collaboration_requests r 
       JOIN professional_profiles p ON r.professional_id = p.id WHERE r.id = $1`,
      [requestId]
    );
    if (reqCheck.rows.length === 0) return res.status(404).json({ error: 'Collaboration request not found.' });
    if (reqCheck.rows[0].prof_user_id !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized to accept this request.' });
    }
    if (reqCheck.rows[0].status !== 'Pending') {
      return res.status(409).json({ error: 'This collaboration request has already been decided.' });
    }

    const result = await pool.query(
      "UPDATE collaboration_requests SET status = 'Accepted' WHERE id = $1 AND status = 'Pending' RETURNING *",
      [requestId]
    );
    if (result.rows.length === 0) {
      return res.status(409).json({ error: 'This collaboration request has already been decided.' });
    }
    return res.json({ message: 'Request accepted successfully.', request: result.rows[0] });
  } catch (err: any) {
    return reportServerError('Request acceptance', err, res);
  }
});

// 14. Decline Request
app.patch('/api/requests/:id/decline', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const requestId = parseId(req.params.id);

    if (!requestId) return res.status(400).json({ error: 'Invalid collaboration request ID.' });

    const reqCheck = await pool.query(
      `SELECT r.*, p.user_id as prof_user_id FROM collaboration_requests r 
       JOIN professional_profiles p ON r.professional_id = p.id WHERE r.id = $1`,
      [requestId]
    );
    if (reqCheck.rows.length === 0) return res.status(404).json({ error: 'Collaboration request not found.' });
    if (reqCheck.rows[0].prof_user_id !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized to decline this request.' });
    }
    if (reqCheck.rows[0].status !== 'Pending') {
      return res.status(409).json({ error: 'This collaboration request has already been decided.' });
    }

    const result = await pool.query(
      "UPDATE collaboration_requests SET status = 'Declined' WHERE id = $1 AND status = 'Pending' RETURNING *",
      [requestId]
    );
    if (result.rows.length === 0) {
      return res.status(409).json({ error: 'This collaboration request has already been decided.' });
    }
    return res.json({ message: 'Request declined.', request: result.rows[0] });
  } catch (err: any) {
    return reportServerError('Request decline', err, res);
  }
});

// 15. Get Sent Requests
app.get('/api/requests/sent', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!pool) return res.status(500).json({ error: 'Database connection error.' });

    const result = await pool.query(
            `SELECT r.*, p.professional_name, p.city, p.area, p.service_category,
              CASE WHEN r.status = 'Accepted' THEN u.email ELSE NULL END as professional_email 
       FROM collaboration_requests r 
       JOIN professional_profiles p ON r.professional_id = p.id 
       JOIN users u ON p.user_id = u.id 
       WHERE r.sender_id = $1 
       ORDER BY r.created_at DESC`,
      [req.user?.id]
    );
    return res.json({ requests: result.rows });
  } catch (err: any) {
    return reportServerError('Sent request lookup', err, res);
  }
});

// 16. Get Received Requests
app.get('/api/requests/received', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!pool) return res.status(500).json({ error: 'Database connection error.' });

    const result = await pool.query(
            `SELECT r.*, p.professional_name, u.name as sender_name,
              CASE WHEN r.status = 'Accepted' THEN u.email ELSE NULL END as sender_email 
       FROM collaboration_requests r 
       JOIN professional_profiles p ON r.professional_id = p.id 
       JOIN users u ON r.sender_id = u.id 
       WHERE p.user_id = $1 
       ORDER BY r.created_at DESC`,
      [req.user?.id]
    );
    return res.json({ requests: result.rows });
  } catch (err: any) {
    return reportServerError('Received request lookup', err, res);
  }
});

// Vite middleware setup for development / production
async function startServer() {
  await initDB();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const publicPath = path.join(process.cwd(), 'dist', 'public');
    app.use(express.static(publicPath, { index: 'index.html' }));
    app.use((req, res, next) => {
      if (req.path.startsWith('/api/') || req.path.startsWith('/assets/')) {
        return next();
      }
      if (req.method === 'GET') {
        return res.sendFile(path.join(publicPath, 'index.html'));
      }
      return next();
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FROZ server running on 0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('FROZ failed to start:', err.message);
  process.exit(1);
});
