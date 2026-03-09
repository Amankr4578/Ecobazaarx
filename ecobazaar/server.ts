import express from 'express';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import db, { initDb } from './db.js';
import { mlModule } from './mlModule.js';

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'eco-bazar-secret-key-2024';

// --- Swagger Configuration ---

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EcoBazarX API',
      version: '1.0.0',
      description: 'API Documentation for EcoBazarX Milestone 3',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./server.ts'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Initialize Database
initDb();

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// --- Middleware ---

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

const authorizeRole = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

// Centralized Error Handling Middleware
const errorHandler = (err: any, req: any, res: any, next: any) => {
  console.error('API Error:', err);
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({
    error: message,
    status,
    timestamp: new Date().toISOString()
  });
};

// --- Auth Module ---

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               name: { type: string }
 *     responses:
 *       201: { description: User registered }
 */
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)');
    const info = stmt.run(email, hashedPassword, name);
    res.status(201).json({ id: info.lastInsertRowid, message: 'User registered successfully' });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 */
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

/**
 * @openapi
 * /api/auth/social:
 *   post:
 *     summary: Social login (Google/LinkedIn)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               name: { type: string }
 *               provider: { type: string }
 *     responses:
 *       200: { description: Login successful }
 */
app.post('/api/auth/social', async (req, res) => {
  const { email, name, provider } = req.body;
  
  try {
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    
    if (!user) {
      // Create new user for social login
      const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);
      const result = db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)')
        .run(email, dummyPassword, name, 'user');
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as any;
    }
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Social login failed' });
  }
});

// --- User Management Module ---

/**
 * @openapi
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: User profile data }
 */
app.get('/api/users/profile', authenticateToken, (req: any, res) => {
  try {
    const user = db.prepare('SELECT id, email, name, role, phone, address, city, state, zip_code, country, bio, profile_image, sustainability_preferences, created_at FROM users WHERE id = ?').get(req.user.id) as any;
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (user.sustainability_preferences) {
      try {
        user.sustainability_preferences = JSON.parse(user.sustainability_preferences);
      } catch (e) {
        user.sustainability_preferences = null;
      }
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * @openapi
 * /api/users/profile:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               address: { type: string }
 *               city: { type: string }
 *               state: { type: string }
 *               zip_code: { type: string }
 *               country: { type: string }
 *               bio: { type: string }
 *               profile_image: { type: string }
 *               sustainability_preferences: { type: object }
 *     responses:
 *       200: { description: Profile updated }
 */
app.put('/api/users/profile', authenticateToken, async (req: any, res) => {
  const { 
    name, email, phone, address, city, state, zip_code, country, bio, profile_image, sustainability_preferences 
  } = req.body;
  
  console.log(`Updating profile for user ID: ${req.user.id}`);
  
  try {
    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(req.user.id);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    const stmt = db.prepare(`
      UPDATE users 
      SET name = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, zip_code = ?, country = ?, bio = ?, profile_image = ?, sustainability_preferences = ? 
      WHERE id = ?
    `);
    
    const prefsString = typeof sustainability_preferences === 'object' && sustainability_preferences !== null
      ? JSON.stringify(sustainability_preferences) 
      : (typeof sustainability_preferences === 'string' ? sustainability_preferences : null);

    const result = stmt.run(
      name || '', 
      email || '', 
      phone || null, 
      address || null, 
      city || null, 
      state || null, 
      zip_code || null, 
      country || null, 
      bio || null, 
      profile_image || null, 
      prefsString, 
      req.user.id
    );

    console.log(`Profile update result for user ${req.user.id}:`, result);
    
    const updatedUser = db.prepare('SELECT id, email, name, role, phone, address, city, state, zip_code, country, bio, profile_image, sustainability_preferences, created_at FROM users WHERE id = ?').get(req.user.id) as any;
    
    if (updatedUser && updatedUser.sustainability_preferences) {
      try {
        updatedUser.sustainability_preferences = JSON.parse(updatedUser.sustainability_preferences);
      } catch (e) {
        // Keep as string if parsing fails
      }
    }
    
    console.log(`Profile updated successfully for user ID: ${req.user.id}`);
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error: any) {
    console.error('Profile Update Error:', error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Email already in use by another account' });
    } else {
      res.status(500).json({ error: 'Failed to update profile: ' + (error.message || 'Unknown error') });
    }
  }
});

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of users }
 */
app.get('/api/users', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const users = db.prepare('SELECT id, email, name, role, created_at FROM users').all();
  res.json(users);
});

app.get('/api/users/:id', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const user = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.put('/api/users/:id', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const { name, email, role } = req.body;
  try {
    const stmt = db.prepare('UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?');
    stmt.run(name, email, role, req.params.id);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', authenticateToken, authorizeRole(['admin']), (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// --- Product Management Module ---

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200: { description: List of products }
 */
app.get('/api/products', (req, res) => {
  const products = db.prepare('SELECT * FROM products WHERE is_visible = 1').all();
  res.json(products);
});

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Product data }
 *       404: { description: Product not found }
 */
app.get('/api/products/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_visible = 1').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.post('/api/products', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const { 
    name, brand, category, price, image, carbon_score, emission_factor, sustainability_level, description,
    materials, manufacture_date, expected_lifespan, repairability_score, recycling_instructions,
    lifecycle_stages, purchase_count, sales_trend, points_value, price_comparison
  } = req.body;
  
  const stmt = db.prepare(`
    INSERT INTO products (
      name, brand, category, price, image, carbon_score, emission_factor, sustainability_level, description,
      materials, manufacture_date, expected_lifespan, repairability_score, recycling_instructions,
      lifecycle_stages, purchase_count, sales_trend, points_value, price_comparison
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const info = stmt.run(
    name, brand, category, price, image, carbon_score, emission_factor, sustainability_level, description,
    JSON.stringify(materials || []), manufacture_date, expected_lifespan, repairability_score, recycling_instructions,
    JSON.stringify(lifecycle_stages || []), purchase_count || 0, JSON.stringify(sales_trend || []), points_value || 0, 
    JSON.stringify(price_comparison || [])
  );
  res.status(201).json({ id: info.lastInsertRowid, message: 'Product added successfully' });
});

app.put('/api/products/:id', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const { 
    name, brand, category, price, image, carbon_score, emission_factor, sustainability_level, description,
    materials, manufacture_date, expected_lifespan, repairability_score, recycling_instructions,
    lifecycle_stages, purchase_count, sales_trend, points_value, price_comparison
  } = req.body;
  
  try {
    const stmt = db.prepare(`
      UPDATE products 
      SET name = ?, brand = ?, category = ?, price = ?, image = ?, carbon_score = ?, emission_factor = ?, sustainability_level = ?, description = ?,
          materials = ?, manufacture_date = ?, expected_lifespan = ?, repairability_score = ?, recycling_instructions = ?,
          lifecycle_stages = ?, purchase_count = ?, sales_trend = ?, points_value = ?, price_comparison = ?
      WHERE id = ?
    `);
    
    stmt.run(
      name, brand, category, price, image, carbon_score, emission_factor, sustainability_level, description,
      JSON.stringify(materials || []), manufacture_date, expected_lifespan, repairability_score, recycling_instructions,
      JSON.stringify(lifecycle_stages || []), purchase_count || 0, JSON.stringify(sales_trend || []), points_value || 0, 
      JSON.stringify(price_comparison || []),
      req.params.id
    );
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', authenticateToken, authorizeRole(['admin']), (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// --- Carbon Footprint Calculation Engine & Prediction API ---

app.post('/api/carbon/calculate', (req, res) => {
  const { weight, material, usage_frequency, transport_distance } = req.body;
  
  // Use ML Module for prediction
  try {
    const result = mlModule.predict({ weight, material, usage_frequency, transport_distance });
    
    let level = 'Low';
    if (result.prediction > 10) level = 'High';
    else if (result.prediction > 5) level = 'Medium';

    res.json({
      predicted_emission: result.prediction,
      confidence: result.confidence,
      model_version: result.model_version,
      sustainability_score: Math.max(0, 100 - (result.prediction * 5)),
      classification: level,
      factors_used: { material, weight, usage_frequency, transport_distance }
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// --- Machine Learning Module Endpoints ---

app.post('/api/ml/train', authenticateToken, authorizeRole(['admin']), (req, res) => {
  try {
    // Fetch all products to create a training set
    const products = db.prepare('SELECT weight, category, carbon_score, emission_factor FROM products').all() as any[];
    
    if (products.length < 5) {
      return res.status(400).json({ error: 'Not enough data to train model. Need at least 5 products.' });
    }

    const trainingData = products.map(p => ({
      weight: p.weight || 1.0,
      material: p.category || 'plastic', // Using category as a proxy for material if not available
      usage_frequency: 10, // Default value
      transport_distance: 100, // Default value
      carbon_emission: p.carbon_score / 10 // Normalizing score to a target emission value
    }));

    mlModule.train(trainingData);
    res.json({ 
      message: 'Model training completed successfully',
      evaluation: mlModule.evaluate()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/ml/status', authenticateToken, (req, res) => {
  res.json(mlModule.evaluate());
});

// --- Carbon Footprint Calculation Engine & Prediction API ---

/**
 * @openapi
 * /api/predict/carbon:
 *   post:
 *     summary: Predict carbon footprint for a product
 *     tags: [ML & Predictions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weight: { type: number }
 *               material: { type: string }
 *               usage_frequency: { type: number }
 *               transport_distance: { type: number }
 *     responses:
 *       200: { description: Prediction result }
 */
app.post('/api/predict/carbon', (req, res) => {
  const { weight, material, usage_frequency, transport_distance } = req.body;
  
  if (!weight || !material) {
    return res.status(400).json({ error: 'Missing required fields: weight and material' });
  }

  try {
    const result = mlModule.predict({ 
      weight: parseFloat(weight), 
      material, 
      usage_frequency: parseFloat(usage_frequency || 1), 
      transport_distance: parseFloat(transport_distance || 0) 
    });
    
    // Sustainability Score Output (0-100)
    const sustainabilityScore = Math.max(0, Math.min(100, 100 - (result.prediction * 4)));

    res.json({
      carbon_prediction: result.prediction,
      sustainability_score: parseFloat(sustainabilityScore.toFixed(2)),
      emission_classification: result.classification,
      confidence: result.confidence,
      model_metadata: {
        version: result.model_version,
        status: 'Verified'
      }
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// --- Recommendation Engine Module ---

app.get('/api/recommendations/:productId', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.productId) as any;
  if (!product) return res.status(404).json({ error: 'Product not found' });

  // Suggest alternatives in the same category with lower carbon score (better)
  // Wait, in this app higher carbon score is better.
  // So we want products with carbon_score > product.carbon_score
  const alternatives = db.prepare(`
    SELECT * FROM products 
    WHERE category = ? AND id != ? AND carbon_score > ? AND is_visible = 1
    ORDER BY carbon_score DESC
    LIMIT 5
  `).all(product.category, product.id, product.carbon_score);

  // If not enough alternatives, fill with top rated products from same category
  if (alternatives.length < 5) {
    const existingIds = alternatives.map((a: any) => a.id).concat([product.id]);
    const fillers = db.prepare(`
      SELECT * FROM products 
      WHERE category = ? AND id NOT IN (${existingIds.join(',')}) AND is_visible = 1
      ORDER BY carbon_score DESC
      LIMIT ?
    `).all(product.category, 5 - alternatives.length);
    alternatives.push(...fillers);
  }

  // If still not enough, fill with top rated products from any category
  if (alternatives.length < 5) {
    const existingIds = alternatives.map((a: any) => a.id).concat([product.id]);
    const globalFillers = db.prepare(`
      SELECT * FROM products 
      WHERE id NOT IN (${existingIds.join(',')}) AND is_visible = 1
      ORDER BY carbon_score DESC
      LIMIT ?
    `).all(5 - alternatives.length);
    alternatives.push(...globalFillers);
  }

  res.json(alternatives);
});

// --- User Activity & Tracking Module ---

app.post('/api/activity', authenticateToken, (req: any, res) => {
  const { product_id, action_type } = req.body;
  const product = db.prepare('SELECT carbon_score FROM products WHERE id = ?').get(product_id) as any;
  
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const stmt = db.prepare(`
    INSERT INTO user_activity (user_id, product_id, action_type, carbon_impact)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(req.user.id, product_id, action_type, product.carbon_score);

  // Update product counters
  if (action_type === 'view') {
    db.prepare('UPDATE products SET view_count = view_count + 1 WHERE id = ?').run(product_id);
  } else if (action_type === 'purchase') {
    db.prepare('UPDATE products SET purchase_count = purchase_count + 1 WHERE id = ?').run(product_id);
  } else if (action_type === 'like') {
    db.prepare('UPDATE products SET like_count = like_count + 1 WHERE id = ?').run(product_id);
  } else if (action_type === 'unlike') {
    db.prepare('UPDATE products SET like_count = MAX(0, like_count - 1) WHERE id = ?').run(product_id);
  }
  
  res.status(201).json({ message: 'Activity tracked successfully' });
});

app.get('/api/activity/stats', authenticateToken, (req: any, res) => {
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total_actions,
      SUM(carbon_impact) as total_carbon_footprint,
      AVG(carbon_impact) as avg_carbon_impact
    FROM user_activity 
    WHERE user_id = ?
  `).get(req.user.id);
  
  const history = db.prepare(`
    SELECT a.*, p.name as product_name 
    FROM user_activity a
    JOIN products p ON a.product_id = p.id
    WHERE a.user_id = ?
    ORDER BY a.created_at DESC
    LIMIT 10
  `).all(req.user.id);

  res.json({ stats, history });
});

app.get('/api/activity/community', (req, res) => {
  try {
    const communityHistory = db.prepare(`
      SELECT a.*, p.name as product_name, u.name as user_name
      FROM user_activity a
      JOIN products p ON a.product_id = p.id
      JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 20
    `).all();

    res.json(communityHistory);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Vite Middleware ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  // Orders API
app.post('/api/orders', authenticateToken, (req, res) => {
  const { totalAmount, discountAmount, platformFee, items } = req.body;
  const userId = (req as any).user.id;
  const orderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  try {
    db.prepare(`
      INSERT INTO orders (id, user_id, total_amount, discount_amount, platform_fee, items, tracking_info)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(orderId, userId, totalAmount, discountAmount, platformFee, JSON.stringify(items), JSON.stringify({
      status: 'Order Placed',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      updates: [
        { status: 'Order Placed', time: new Date().toISOString(), description: 'Your order has been successfully placed.' }
      ]
    }));

    // Also track purchase activity for each item
    for (const item of items) {
      const product = db.prepare('SELECT carbon_score FROM products WHERE id = ?').get(item.productId) as any;
      const carbonImpact = product ? product.carbon_score : 0;
      
      db.prepare(`
        INSERT INTO user_activity (user_id, product_id, action_type, carbon_impact)
        VALUES (?, ?, ?, ?)
      `).run(userId, item.productId, 'purchase', carbonImpact);
      
      db.prepare('UPDATE products SET purchase_count = purchase_count + 1 WHERE id = ?').run(item.productId);
    }

    res.status(201).json({ id: orderId, message: 'Order placed successfully' });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.get('/api/orders/history', authenticateToken, (req: any, res) => {
  try {
    const orders = db.prepare(`
      SELECT * FROM orders 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(req.user.id);
    
    res.json(orders.map((o: any) => ({
      ...o,
      items: JSON.parse(o.items),
      tracking_info: o.tracking_info ? JSON.parse(o.tracking_info) : null
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/:id', authenticateToken, (req: any, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id) as any;
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    res.json({
      ...order,
      items: JSON.parse(order.items),
      tracking_info: order.tracking_info ? JSON.parse(order.tracking_info) : null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders/:id/pay', authenticateToken, (req: any, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id) as any;
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    const tracking = order.tracking_info ? JSON.parse(order.tracking_info) : { updates: [] };
    tracking.updates.push({
      status: 'Payment Successful',
      time: new Date().toISOString(),
      description: 'Payment has been received and confirmed.'
    });
    tracking.status = 'Processing';

    db.prepare('UPDATE orders SET status = ?, tracking_info = ? WHERE id = ?')
      .run('paid', JSON.stringify(tracking), req.params.id);
    
    res.json({ message: 'Payment successful' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`EcoBazar Backend running on http://localhost:${PORT}`);
  });

  // Apply Error Handler
  app.use(errorHandler);
}

startServer();
