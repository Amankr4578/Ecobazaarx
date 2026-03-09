import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('ecobazar.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
export function initDb() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip_code TEXT,
      country TEXT,
      bio TEXT,
      profile_image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Ensure new columns exist for existing databases
  const userTableInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
  const columns = userTableInfo.map(c => c.name);
  
  if (!columns.includes('phone')) db.exec('ALTER TABLE users ADD COLUMN phone TEXT');
  if (!columns.includes('address')) db.exec('ALTER TABLE users ADD COLUMN address TEXT');
  if (!columns.includes('city')) db.exec('ALTER TABLE users ADD COLUMN city TEXT');
  if (!columns.includes('state')) db.exec('ALTER TABLE users ADD COLUMN state TEXT');
  if (!columns.includes('zip_code')) db.exec('ALTER TABLE users ADD COLUMN zip_code TEXT');
  if (!columns.includes('country')) db.exec('ALTER TABLE users ADD COLUMN country TEXT');
  if (!columns.includes('bio')) db.exec('ALTER TABLE users ADD COLUMN bio TEXT');
  if (!columns.includes('profile_image')) db.exec('ALTER TABLE users ADD COLUMN profile_image TEXT');
  if (!columns.includes('sustainability_preferences')) db.exec('ALTER TABLE users ADD COLUMN sustainability_preferences TEXT');

  db.exec(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);

  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT,
      carbon_score REAL NOT NULL,
      emission_factor REAL NOT NULL,
      sustainability_level TEXT NOT NULL, -- Low, Medium, High
      description TEXT,
      materials TEXT, -- JSON array
      manufacture_date TEXT,
      expected_lifespan TEXT,
      repairability_score REAL,
      recycling_instructions TEXT,
      lifecycle_stages TEXT, -- JSON array
      purchase_count INTEGER DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      sales_trend TEXT, -- JSON array
      points_value INTEGER DEFAULT 0,
      price_comparison TEXT, -- JSON array
      is_visible INTEGER DEFAULT 1, -- 1 for true, 0 for false
      like_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_products_carbon_score ON products(carbon_score)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_products_visibility ON products(is_visible)`);

  // Ensure is_visible column exists for existing databases
  const productTableInfo = db.prepare("PRAGMA table_info(products)").all() as any[];
  const productColumns = productTableInfo.map(c => c.name);
  if (!productColumns.includes('is_visible')) db.exec('ALTER TABLE products ADD COLUMN is_visible INTEGER DEFAULT 1');
  if (!productColumns.includes('like_count')) db.exec('ALTER TABLE products ADD COLUMN like_count INTEGER DEFAULT 0');

  // Orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      discount_amount REAL NOT NULL,
      platform_fee REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      items TEXT NOT NULL, -- JSON array of items
      tracking_info TEXT, -- JSON object for tracking
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Ensure tracking_info column exists
  const orderTableInfo = db.prepare("PRAGMA table_info(orders)").all() as any[];
  const orderColumns = orderTableInfo.map(c => c.name);
  if (!orderColumns.includes('tracking_info')) db.exec('ALTER TABLE orders ADD COLUMN tracking_info TEXT');

  // User Activity table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      action_type TEXT NOT NULL, -- 'view', 'purchase'
      carbon_impact REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_activity_user_id ON user_activity(user_id)`);

  // Seed initial user if empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    db.prepare(`
      INSERT INTO users (id, email, password, name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(1, 'demo@ecobazar.com', 'hashed_password', 'Eco Warrior', 'user');
  }

  // Seed initial products if empty or less than 20
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
  if (productCount.count < 20) {
    db.exec(`DELETE FROM products`); // Clear existing to avoid duplicates if re-seeding
    const insertProduct = db.prepare(`
      INSERT INTO products (
        name, brand, category, price, image, carbon_score, emission_factor, sustainability_level, description,
        materials, manufacture_date, expected_lifespan, repairability_score, recycling_instructions,
        lifecycle_stages, purchase_count, sales_trend, points_value, price_comparison, is_visible
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const initialProducts = [
      [
        'Bamboo Toothbrush', 'EcoLife', 'Personal Care', 4.99, 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&q=80&w=400', 95, 0.05, 'High', 'Sustainable bamboo toothbrush with soft bristles.',
        JSON.stringify(['Bamboo', 'Nylon-6']), '2024-01-15', '3 Months', 9.5, 'Compost handle, recycle bristles.',
        JSON.stringify([{ stage: 'Sourcing', description: 'FSC Certified Bamboo', location: 'China', icon: 'leaf' }]),
        1250, JSON.stringify([{ month: 'Jan', sales: 450 }, { month: 'Feb', sales: 520 }]), 50,
        JSON.stringify([
          { site: 'Amazon', price: 6.99, url: 'https://amazon.com', isBestValue: false },
          { site: 'Flipkart', price: 5.50, url: 'https://flipkart.com', isBestValue: false },
          { site: 'Myntra', price: 7.00, url: 'https://myntra.com', isBestValue: false },
          { site: 'EcoBazaar', price: 4.99, url: '#', isBestValue: true }
        ]), 1
      ],
      [
        'Natural Deodorant', 'PureScent', 'Personal Care', 9.50, 'https://images.unsplash.com/photo-1556229167-7313a24039c8?auto=format&fit=crop&q=80&w=400', 91, 0.12, 'High', 'Plastic-free aluminum-free deodorant.',
        JSON.stringify(['Coconut Oil', 'Shea Butter', 'Essential Oils']), '2024-02-05', '6 Months', 4.0, 'Cardboard tube is compostable.',
        JSON.stringify([{ stage: 'Mixing', description: 'Cold-pressed ingredients', location: 'USA', icon: 'leaf' }]),
        2500, JSON.stringify([{ month: 'Jan', sales: 700 }, { month: 'Feb', sales: 850 }]), 40,
        JSON.stringify([
          { site: 'Amazon', price: 12.99, url: 'https://amazon.com', isBestValue: false },
          { site: 'Flipkart', price: 11.50, url: 'https://flipkart.com', isBestValue: false },
          { site: 'Myntra', price: 14.00, url: 'https://myntra.com', isBestValue: false },
          { site: 'EcoBazaar', price: 9.50, url: '#', isBestValue: true }
        ]), 1
      ],
      [
        'Organic Cotton Swabs', 'EcoLife', 'Personal Care', 3.50, 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?auto=format&fit=crop&q=80&w=400', 98, 0.02, 'High', 'Biodegradable cotton swabs with paper sticks.',
        JSON.stringify(['Organic Cotton', 'Recycled Paper']), '2024-03-01', 'Indefinite', 10.0, 'Compostable.',
        JSON.stringify([{ stage: 'Production', description: 'Zero-waste facility', location: 'Germany', icon: 'factory' }]),
        1800, JSON.stringify([{ month: 'Jan', sales: 300 }, { month: 'Feb', sales: 420 }]), 20,
        JSON.stringify([{ site: 'EcoBazaar', price: 3.50, url: '#', isBestValue: true }]), 1
      ],
      [
        'Eco-Friendly Floss', 'PureScent', 'Personal Care', 6.00, 'https://images.unsplash.com/photo-1559594882-7b588d324f3d?auto=format&fit=crop&q=80&w=400', 94, 0.06, 'High', 'Vegan silk floss in a glass jar.',
        JSON.stringify(['Corn Silk', 'Candelilla Wax']), '2024-01-10', 'Indefinite', 9.0, 'Compostable floss.',
        JSON.stringify([{ stage: 'Coating', description: 'Natural wax coating', location: 'USA', icon: 'sun' }]),
        950, JSON.stringify([{ month: 'Jan', sales: 150 }, { month: 'Feb', sales: 210 }]), 30,
        JSON.stringify([{ site: 'EcoBazaar', price: 6.00, url: '#', isBestValue: true }]), 1
      ],
      [
        'Bamboo Hair Brush', 'EcoLife', 'Personal Care', 15.00, 'https://images.unsplash.com/photo-1590159763121-7c9fd312190d?auto=format&fit=crop&q=80&w=400', 92, 0.08, 'High', 'Natural bamboo hair brush with wooden bristles.',
        JSON.stringify(['Bamboo', 'Natural Rubber']), '2024-02-15', '5 Years', 8.5, 'Compostable handle.',
        JSON.stringify([{ stage: 'Carving', description: 'Sustainable bamboo carving', location: 'China', icon: 'factory' }]),
        720, JSON.stringify([{ month: 'Jan', sales: 120 }, { month: 'Feb', sales: 180 }]), 60,
        JSON.stringify([{ site: 'EcoBazaar', price: 15.00, url: '#', isBestValue: true }]), 1
      ],
      [
        'Invisible Personal Care Item', 'GhostBrand', 'Personal Care', 99.99, 'https://images.unsplash.com/photo-1556229167-7313a24039c8?auto=format&fit=crop&q=80&w=400', 50, 1.5, 'Medium', 'This product should not be visible.',
        JSON.stringify(['Plastic']), '2024-01-01', '1 Year', 2.0, 'Landfill.',
        JSON.stringify([{ stage: 'Production', description: 'Standard manufacturing', location: 'Unknown', icon: 'factory' }]),
        10, JSON.stringify([{ month: 'Jan', sales: 1 }]), 0,
        JSON.stringify([{ site: 'EcoBazaar', price: 99.99, url: '#', isBestValue: true }]), 0
      ],
      [
        'Glass Water Bottle', 'ClearAqua', 'Kitchen', 18.00, 'https://images.unsplash.com/photo-1602143399827-7211aa9ad945?auto=format&fit=crop&q=80&w=400', 92, 0.1, 'High', 'Reusable borosilicate glass bottle.',
        JSON.stringify(['Borosilicate Glass', 'Silicone']), '2024-01-05', '10+ Years', 9.0, 'Recycle glass, reuse silicone.',
        JSON.stringify([{ stage: 'Production', description: 'Low-emission glass blowing', location: 'Italy', icon: 'factory' }]),
        1500, JSON.stringify([{ month: 'Jan', sales: 300 }, { month: 'Feb', sales: 450 }]), 150,
        JSON.stringify([
          { site: 'Amazon', price: 22.00, url: 'https://amazon.com', isBestValue: false },
          { site: 'Flipkart', price: 19.50, url: 'https://flipkart.com', isBestValue: false },
          { site: 'Myntra', price: 25.00, url: 'https://myntra.com', isBestValue: false },
          { site: 'EcoBazaar', price: 18.00, url: '#', isBestValue: true }
        ]), 1
      ],
      [
        'Beeswax Food Wraps', 'HoneyHome', 'Kitchen', 14.99, 'https://images.unsplash.com/photo-1591123720164-de1348028a82?auto=format&fit=crop&q=80&w=400', 94, 0.08, 'High', 'Natural alternative to plastic wrap.',
        JSON.stringify(['Organic Cotton', 'Beeswax', 'Jojoba Oil', 'Tree Resin']), '2024-01-25', '1 Year', 6.0, 'Compostable at end of life.',
        JSON.stringify([{ stage: 'Coating', description: 'Hand-dipped in small batches', location: 'UK', icon: 'sun' }]),
        1800, JSON.stringify([{ month: 'Jan', sales: 400 }, { month: 'Feb', sales: 550 }]), 80,
        JSON.stringify([
          { site: 'Amazon', price: 19.99, url: 'https://amazon.com', isBestValue: false },
          { site: 'Flipkart', price: 17.00, url: 'https://flipkart.com', isBestValue: false },
          { site: 'Myntra', price: 22.00, url: 'https://myntra.com', isBestValue: false },
          { site: 'EcoBazaar', price: 14.99, url: '#', isBestValue: true }
        ]), 1
      ],
      [
        'Bamboo Cutlery Set', 'TravelEco', 'Kitchen', 11.99, 'https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?auto=format&fit=crop&q=80&w=400', 96, 0.04, 'High', 'Portable bamboo utensil set.',
        JSON.stringify(['Bamboo', 'Cotton Pouch']), '2024-01-20', '5 Years', 9.0, 'Compostable utensils.',
        JSON.stringify([{ stage: 'Finishing', description: 'Natural oil polish', location: 'Vietnam', icon: 'sun' }]),
        1100, JSON.stringify([{ month: 'Jan', sales: 250 }, { month: 'Feb', sales: 380 }]), 60,
        JSON.stringify([
          { site: 'Amazon', price: 16.99, url: 'https://amazon.com', isBestValue: false },
          { site: 'Flipkart', price: 14.50, url: 'https://flipkart.com', isBestValue: false },
          { site: 'Myntra', price: 18.00, url: 'https://myntra.com', isBestValue: false },
          { site: 'EcoBazaar', price: 11.99, url: '#', isBestValue: true }
        ]), 1
      ],
      [
        'Stainless Steel Straws', 'ClearAqua', 'Kitchen', 8.00, 'https://images.unsplash.com/photo-1592861956120-e524fc739696?auto=format&fit=crop&q=80&w=400', 90, 0.15, 'High', 'Set of 4 stainless steel straws with cleaning brush.',
        JSON.stringify(['Stainless Steel']), '2024-02-10', 'Indefinite', 10.0, 'Recyclable metal.',
        JSON.stringify([{ stage: 'Production', description: 'Precision metalwork', location: 'Korea', icon: 'factory' }]),
        2200, JSON.stringify([{ month: 'Jan', sales: 500 }, { month: 'Feb', sales: 650 }]), 40,
        JSON.stringify([{ site: 'EcoBazaar', price: 8.00, url: '#', isBestValue: true }]), 1
      ],
      [
        'Silicone Food Bags', 'HoneyHome', 'Kitchen', 22.00, 'https://images.unsplash.com/photo-1605648916319-cf082f7524a1?auto=format&fit=crop&q=80&w=400', 88, 0.2, 'High', 'Reusable silicone storage bags.',
        JSON.stringify(['Food-grade Silicone']), '2024-03-05', '5+ Years', 8.0, 'Recycle at specialty centers.',
        JSON.stringify([{ stage: 'Molding', description: 'Heat-resistant molding', location: 'USA', icon: 'zap' }]),
        1300, JSON.stringify([{ month: 'Jan', sales: 280 }, { month: 'Feb', sales: 350 }]), 100,
        JSON.stringify([{ site: 'EcoBazaar', price: 22.00, url: '#', isBestValue: true }]), 1
      ],
      [
        'Recycled Paper Notebook', 'GreenNotes', 'Stationery', 12.50, 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=400', 88, 0.15, 'High', '100% recycled paper notebook.',
        JSON.stringify(['Recycled Paper', 'Soy Ink']), '2024-02-10', 'Indefinite', 8.0, 'Recycle with paper waste.',
        JSON.stringify([{ stage: 'Production', description: 'Closed-loop recycling', location: 'USA', icon: 'factory' }]),
        840, JSON.stringify([{ month: 'Jan', sales: 210 }, { month: 'Feb', sales: 315 }]), 75,
        JSON.stringify([
          { site: 'Amazon', price: 15.99, url: 'https://amazon.com', isBestValue: false },
          { site: 'Flipkart', price: 14.00, url: 'https://flipkart.com', isBestValue: false },
          { site: 'Myntra', price: 18.50, url: 'https://myntra.com', isBestValue: false },
          { site: 'EcoBazaar', price: 12.50, url: '#', isBestValue: true }
        ]), 1
      ],
      [
        'Organic Cotton T-Shirt', 'PureWear', 'Clothing', 24.99, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400', 82, 0.4, 'Medium', 'Soft organic cotton t-shirt.',
        JSON.stringify(['Organic Cotton']), '2024-03-01', '3-5 Years', 7.5, 'Donate or textile recycling.',
        JSON.stringify([{ stage: 'Farming', description: 'Pesticide-free cotton', location: 'India', icon: 'sun' }]),
        2100, JSON.stringify([{ month: 'Jan', sales: 600 }, { month: 'Feb', sales: 750 }]), 100,
        JSON.stringify([
          { site: 'Amazon', price: 29.99, url: 'https://amazon.com', isBestValue: false },
          { site: 'Flipkart', price: 27.50, url: 'https://flipkart.com', isBestValue: false },
          { site: 'Myntra', price: 32.00, url: 'https://myntra.com', isBestValue: false },
          { site: 'EcoBazaar', price: 24.99, url: '#', isBestValue: true }
        ]), 1
      ],
      [
        'Solar Power Bank', 'SunCharge', 'Electronics', 45.00, 'https://images.unsplash.com/photo-1611241893603-3c359704e0ee?auto=format&fit=crop&q=80&w=400', 75, 0.8, 'Medium', 'Portable solar-powered charger.',
        JSON.stringify(['Recycled Plastic', 'Lithium Ion', 'Solar Cells']), '2023-11-20', '4-6 Years', 6.0, 'E-waste recycling center.',
        JSON.stringify([{ stage: 'Assembly', description: 'Renewable energy plant', location: 'Vietnam', icon: 'zap' }]),
        560, JSON.stringify([{ month: 'Jan', sales: 120 }, { month: 'Feb', sales: 180 }]), 250,
        JSON.stringify([
          { site: 'Amazon', price: 55.00, url: 'https://amazon.com', isBestValue: false },
          { site: 'Flipkart', price: 49.99, url: 'https://flipkart.com', isBestValue: false },
          { site: 'Myntra', price: 59.00, url: 'https://myntra.com', isBestValue: false },
          { site: 'EcoBazaar', price: 45.00, url: '#', isBestValue: true }
        ]), 1
      ],
      [
        'Eco Yoga Mat', 'ZenEarth', 'Fitness', 35.00, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400', 85, 0.3, 'High', 'Natural rubber yoga mat.',
        JSON.stringify(['Natural Rubber', 'Jute']), '2023-12-15', '5 Years', 7.0, 'Biodegradable in industrial compost.',
        JSON.stringify([{ stage: 'Harvesting', description: 'Sustainable rubber tapping', location: 'Thailand', icon: 'leaf' }]),
        620, JSON.stringify([{ month: 'Jan', sales: 150 }, { month: 'Feb', sales: 210 }]), 200,
        JSON.stringify([
          { site: 'Amazon', price: 45.00, url: 'https://amazon.com', isBestValue: false },
          { site: 'Flipkart', price: 39.00, url: 'https://flipkart.com', isBestValue: false },
          { site: 'Myntra', price: 48.00, url: 'https://myntra.com', isBestValue: false },
          { site: 'EcoBazaar', price: 35.00, url: '#', isBestValue: true }
        ]), 1
      ],
      [
        'Hemp Backpack', 'WildTrail', 'Accessories', 55.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400', 89, 0.2, 'High', 'Durable hemp fiber backpack.',
        JSON.stringify(['Hemp Fiber', 'Recycled Polyester']), '2024-02-20', '8 Years', 8.5, 'Repairable stitching, recycle polyester.',
        JSON.stringify([{ stage: 'Weaving', description: 'Traditional hemp weaving', location: 'Nepal', icon: 'factory' }]),
        430, JSON.stringify([{ month: 'Jan', sales: 80 }, { month: 'Feb', sales: 120 }]), 300,
        JSON.stringify([
          { site: 'Amazon', price: 75.00, url: 'https://amazon.com', isBestValue: false },
          { site: 'Flipkart', price: 65.00, url: 'https://flipkart.com', isBestValue: false },
          { site: 'Myntra', price: 80.00, url: 'https://myntra.com', isBestValue: false },
          { site: 'EcoBazaar', price: 55.00, url: '#', isBestValue: true }
        ]), 1
      ],
      [
        'Biodegradable Phone Case', 'PureCase', 'Electronics', 19.99, 'https://images.unsplash.com/photo-1586105251261-72a75665ff2f?auto=format&fit=crop&q=80&w=400', 98, 0.02, 'High', 'Compostable flax-based phone case.',
        JSON.stringify(['Flax Shive', 'Plant-based Biopolymer']), '2024-03-10', '2 Years', 5.0, '100% Home Compostable.',
        JSON.stringify([{ stage: 'Molding', description: 'Zero-waste injection molding', location: 'Canada', icon: 'zap' }]),
        3200, JSON.stringify([{ month: 'Jan', sales: 950 }, { month: 'Feb', sales: 1100 }]), 100,
        JSON.stringify([
          { site: 'Amazon', price: 29.99, url: 'https://amazon.com', isBestValue: false },
          { site: 'Flipkart', price: 24.50, url: 'https://flipkart.com', isBestValue: false },
          { site: 'Myntra', price: 28.00, url: 'https://myntra.com', isBestValue: false },
          { site: 'EcoBazaar', price: 19.99, url: '#', isBestValue: true }
        ]), 1
      ],
      [
        'Recycled Sunglasses', 'OceanEyes', 'Accessories', 39.00, 'https://images.unsplash.com/photo-1511499767390-903390e62bc0?auto=format&fit=crop&q=80&w=400', 80, 0.5, 'Medium', 'Sunglasses made from ocean plastic.',
        JSON.stringify(['Recycled HDPE', 'Polarized Lenses']), '2023-11-30', '5 Years', 6.5, 'Return to manufacturer for recycling.',
        JSON.stringify([{ stage: 'Collection', description: 'Ocean plastic recovery', location: 'Indonesia', icon: 'globe' }]),
        780, JSON.stringify([{ month: 'Jan', sales: 140 }, { month: 'Feb', sales: 220 }]), 250,
        JSON.stringify([
          { site: 'Amazon', price: 59.00, url: 'https://amazon.com', isBestValue: false },
          { site: 'Flipkart', price: 49.00, url: 'https://flipkart.com', isBestValue: false },
          { site: 'Myntra', price: 65.00, url: 'https://myntra.com', isBestValue: false },
          { site: 'EcoBazaar', price: 39.00, url: '#', isBestValue: true }
        ]), 1
      ],
      [
        'Organic Bed Sheets', 'SoftEarth', 'Home', 85.00, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400', 83, 0.35, 'Medium', '300 thread count organic cotton.',
        JSON.stringify(['Organic Cotton']), '2024-02-28', '10 Years', 8.0, 'Recycle as rags or textile waste.',
        JSON.stringify([{ stage: 'Spinning', description: 'Wind-powered spinning', location: 'Turkey', icon: 'zap' }]),
        340, JSON.stringify([{ month: 'Jan', sales: 50 }, { month: 'Feb', sales: 90 }]), 500,
        JSON.stringify([
          { site: 'Amazon', price: 110.00, url: 'https://amazon.com', isBestValue: false },
          { site: 'Flipkart', price: 99.00, url: 'https://flipkart.com', isBestValue: false },
          { site: 'Myntra', price: 125.00, url: 'https://myntra.com', isBestValue: false },
          { site: 'EcoBazaar', price: 85.00, url: '#', isBestValue: true }
        ]), 1
      ],
      [
        'Cork Yoga Block', 'ZenEarth', 'Fitness', 15.99, 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=400', 97, 0.03, 'High', 'Sustainable cork support block.',
        JSON.stringify(['Natural Cork']), '2024-03-05', 'Indefinite', 9.5, '100% Biodegradable.',
        JSON.stringify([{ stage: 'Harvesting', description: 'Bark stripping (no trees cut)', location: 'Portugal', icon: 'leaf' }]),
        520, JSON.stringify([{ month: 'Jan', sales: 110 }, { month: 'Feb', sales: 160 }]), 100,
        JSON.stringify([
          { site: 'Amazon', price: 22.99, url: 'https://amazon.com', isBestValue: false },
          { site: 'Flipkart', price: 19.00, url: 'https://flipkart.com', isBestValue: false },
          { site: 'Myntra', price: 24.00, url: 'https://myntra.com', isBestValue: false },
          { site: 'EcoBazaar', price: 15.99, url: '#', isBestValue: true }
        ]), 1
      ]
    ];

    for (const p of initialProducts) {
      insertProduct.run(...p);
    }

    // Seed initial user activity if empty
    const activityCount = db.prepare('SELECT COUNT(*) as count FROM user_activity').get() as { count: number };
    if (activityCount.count === 0) {
      const insertActivity = db.prepare(`
        INSERT INTO user_activity (user_id, product_id, action_type, carbon_impact, created_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      const now = new Date();
      const mockActivities = [
        [1, 1, 'purchase', 95, new Date(now.getTime() - 1000 * 60 * 30).toISOString()], // 30 mins ago
        [1, 2, 'view', 88, new Date(now.getTime() - 1000 * 60 * 60).toISOString()], // 1 hour ago
        [1, 3, 'purchase', 82, new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString()], // 2 hours ago
        [1, 4, 'view', 75, new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString()], // 5 hours ago
        [1, 5, 'purchase', 92, new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString()], // 1 day ago
      ];

      for (const activity of mockActivities) {
        insertActivity.run(...activity);
      }
    }
  }
}

export default db;
