-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  description  TEXT,
  price        NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock        INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  image_url    VARCHAR(500),
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status       VARCHAR(30) NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  notes        TEXT,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id          SERIAL PRIMARY KEY,
  order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  unit_price  NUMERIC(10, 2) NOT NULL,
  subtotal    NUMERIC(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

INSERT INTO categories (name, description) VALUES
  ('Electronics',  'Gadgets, devices, and accessories'),
  ('Clothing',     'Men, women, and children apparel'),
  ('Home & Garden','Furniture, tools, and decor'),
  ('Sports',       'Equipment and activewear'),
  ('Books',        'Fiction, non-fiction, and educational')
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, category_id) VALUES
  ('Wireless Headphones',  'Noise-cancelling over-ear headphones',  89.99,  50, 1),
  ('Mechanical Keyboard',  'RGB backlit 104-key mechanical keyboard', 129.99, 30, 1),
  ('Running Shoes',        'Lightweight mesh running shoes',         65.00,  80, 4),
  ('Classic T-Shirt',      '100% cotton unisex t-shirt',             19.99, 200, 2),
  ('Yoga Mat',             'Non-slip 6mm thick yoga mat',            34.99,  60, 4),
  ('LED Desk Lamp',        'Adjustable brightness USB desk lamp',    24.99,  45, 3),
  ('JavaScript Guide',     'Comprehensive JS for beginners',         39.99,  25, 5),
  ('Stainless Water Bottle','BPA-free 1L insulated bottle',          22.50,  90, 3)
ON CONFLICT DO NOTHING;

-- Admin user (password: Admin@123)
INSERT INTO users (name, email, password, role) VALUES
  ('Admin User', 'admin@retail.com',
   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'admin')
ON CONFLICT DO NOTHING;
