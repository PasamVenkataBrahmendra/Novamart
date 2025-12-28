
import express from 'express';
import mongoose, { ConnectOptions } from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// --- Middleware ---
app.use(cors({
  origin: (process.env as any).FRONTEND_URL || '*', 
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}) as any);

app.use(express.json() as any);

// --- Security Helpers ---
const generateToken = (userId: string) => {
    return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({id: userId, iat: Date.now()}))}.signature`;
};

// --- MongoDB Schemas ---
const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String,
  rating: Number,
  reviewsCount: Number,
  stock: Number,
  tags: [String]
});

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: String,
  items: Array,
  total: Number,
  status: { 
    type: String, 
    enum: ['Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Processing' 
  },
  date: { type: Date, default: Date.now },
  shippingAddress: String
});

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  passwordHash: String 
});

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);
const User = mongoose.model('User', userSchema);

// --- Database Seeder ---
const seedDatabase = async () => {
  try {
    const count = await Product.countDocuments();
    if (count > 0) {
      console.log(`📊 Database already has ${count} products. Skipping seed.`);
      return;
    }

    console.log('🌱 Seeding database with 1,000 products...');
    
    const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Mobiles', 'Accessories', 'Grocery', 'Appliances', 'Health', 'Beauty', 'Sports', 'Books'];
    const ADJECTIVES = ['Premium', 'Ultra', 'Classic', 'Modern', 'Eco', 'Smart', 'Sleek', 'Durable', 'Elite', 'Titanium'];
    const TYPES: Record<string, string[]> = {
      'Electronics': ['Headphones', 'Speaker', 'Monitor', 'Keyboard', 'Mouse'],
      'Fashion': ['Sneakers', 'Jacket', 'T-Shirt', 'Jeans', 'Watch'],
      'Home': ['Desk', 'Lamp', 'Chair', 'Vacuum', 'Purifier'],
      'Mobiles': ['Smartphone', 'Foldable', 'Tablet'],
      'Accessories': ['Wallet', 'Watch', 'Bag', 'Sunglasses']
    };

    const productsToInsert = [];
    for (let i = 1; i <= 1000; i++) {
      const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      const types = TYPES[category] || ['Item'];
      const type = types[Math.floor(Math.random() * types.length)];
      const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
      
      productsToInsert.push({
        id: i.toString(),
        name: `${adj} ${type} ${1000 + i}`,
        description: `High-quality ${adj.toLowerCase()} ${type.toLowerCase()} designed for modern performance and durability in the ${category.toLowerCase()} segment.`,
        price: parseFloat((Math.random() * (1500 - 20) + 20).toFixed(2)),
        category,
        image: `https://images.unsplash.com/photo-${1500000000000 + (i % 500)}?auto=format&fit=crop&q=80&w=600&sig=${i}`,
        rating: parseFloat((Math.random() * (5 - 3.5) + 3.5).toFixed(1)),
        reviewsCount: Math.floor(Math.random() * 2000),
        stock: Math.floor(Math.random() * 100),
        tags: [category.toLowerCase(), type.toLowerCase(), adj.toLowerCase()]
      });
    }

    await Product.insertMany(productsToInsert);
    console.log('✅ Successfully seeded 1,000 products into MongoDB Atlas.');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
};

// --- API Routes ---

app.get('/api/health', (req: any, res: any) => {
  res.json({ 
    status: 'active', 
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date() 
  });
});

app.post('/api/auth/login', async (req: any, res: any) => {
  const { email } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        id: `u-${Math.random().toString(36).substr(2, 9)}`,
        email,
        name: email.split('@')[0],
        role: email.includes('admin') ? 'admin' : 'user',
        passwordHash: 'hashed_placeholder'
      });
      await user.save();
    }
    const token = generateToken(user.id);
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, token });
  } catch (err) {
    res.status(500).json({ error: 'Auth failed' });
  }
});

app.get('/api/products', async (req: any, res: any) => {
  try {
    const { category, search } = req.query;
    let query: any = {};
    if (category && category !== 'All') query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }
    const products = await Product.find(query).limit(100);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/orders', async (req: any, res: any) => {
  try {
    const orderData = {
      ...req.body,
      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      date: new Date()
    };
    const newOrder = new Order(orderData);
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ error: 'Order creation failed' });
  }
});

app.get('/api/orders/user/:userId', async (req: any, res: any) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.patch('/api/orders/:id/status', async (req: any, res: any) => {
  try {
    const { status } = req.body;
    await Order.findOneAndUpdate({ id: req.params.id }, { status });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Update failed' });
  }
});

// --- Server Start ---
const PORT = (process.env as any).PORT || 5000;
const MONGODB_URI = (process.env as any).MONGODB_URI;

if (!MONGODB_URI) {
  console.error('CRITICAL: MONGODB_URI is missing from environment variables.');
} else {
  const options: ConnectOptions = { dbName: 'novamart' };

  mongoose.connect(MONGODB_URI, options)
    .then(async () => {
      console.log('✅ Connected to MongoDB Atlas Successfully');
      await seedDatabase();
      app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch(err => {
      console.error('❌ MongoDB Connection Error:', err.message);
      app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} (DB OFFLINE)`));
    });
}
