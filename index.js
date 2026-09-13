require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// --- ATLAS CONNECTION ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Atlas Connected!'))
  .catch((e) => console.log('❌ Atlas Error:', e));

// --- MODELS ---
const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  password: String
}));

const Character = mongoose.model('Character', new mongoose.Schema({
  userId: String,
  name: String,
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 }
}));

const QuestLog = mongoose.model('QuestLog', new mongoose.Schema({
  userId: String,
  text: String,
  xp: Number,
  date: { type: Date, default: Date.now }
}));

const Inventory = mongoose.model('Inventory', new mongoose.Schema({
  userId: String,
  item: String,
  count: Number
}));

// --- AUTH MIDDLEWARE ---
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), 'secret123');
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// --- ROUTES ---
app.get('/', (req, res) => {
  res.send('Life-RPG Backend Running + Atlas Connected!');
});

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ username, password: hashed });
  res.json({ message: 'User created', userId: user._id });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: 'User not found' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ error: 'Wrong password' });
  const token = jwt.sign({ id: user._id, username }, 'secret123');
  res.json({ token });
});

app.get('/api/inventory', auth, async (req, res) => {
  const myInv = await Inventory.find({ userId: req.user.id });
  res.json(myInv);
});

app.post('/api/inventory', auth, async (req, res) => {
  const newItem = await Inventory.create({ userId: req.user.id, ...req.body });
  res.json(newItem);
});

app.get('/api/quests', auth, async (req, res) => {
  const logs = await QuestLog.find({ userId: req.user.id }).sort({ date: -1 });
  res.json(logs);
});

app.post('/api/quests', auth, async (req, res) => {
  const log = await QuestLog.create({ userId: req.user.id, ...req.body });
  res.json(log);
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});