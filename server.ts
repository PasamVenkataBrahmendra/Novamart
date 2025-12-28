
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// --- Middleware ---
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Restrict this in production for security
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// --- Security Helpers ---
const generateToken = (userId: string) => {
    // Simulate a JWT token string
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

// --- API Routes ---

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'active', timestamp: new Date() }));

// Auth
app.post('/api/auth/login', async (req, res) => {
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

// Products
app.get('/api/products', async (req, res) => {
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

// Orders
app.post('/api/orders', async (req, res) => {
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

app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await Order.findOneAndUpdate({ id: req.params.id }, { status });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Update failed' });
  }
});

// --- Server Start ---
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.log('⚠️ MONGODB_URI not found in environment. Server will start in mock-only mode or require a local DB.');
}

mongoose.connect(MONGODB_URI || 'mongodb://localhost:27017/novamart')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    // In many cloud environments, we want the process to stay alive to show health logs 
    // but we can't serve real DB requests.
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} (DATABASE OFFLINE)`));
  });
