require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');


// Routes
const authRoutes = require('./routes/auth');
const itemsRoutes = require('./routes/items');
const ordersRoutes = require('./routes/orders');
const commentsRoutes = require('./routes/comments');
const flagsRoutes = require('./routes/flags');
const notificationsRoutes = require('./routes/notifications');
const userRoutes = require('./routes/userRoutes');
const sellersRoutes = require('./routes/sellers');
const errorHandler = require('./middlewares/errorHandler');
const wishlistRoutes = require("./routes/wishlist");
const authMiddleware = require("./middlewares/auth");

const app = express();

app.use(cors());
// Increase JSON payload limit to handle base64 images (25MB max)
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.use(morgan('dev'));

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/flags', flagsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sellers', sellersRoutes);
pp.use("/api/wishlist", authMiddleware, wishlistRoutes);

app.get('/', (req, res) => res.send('Marketplace API'));

// Fallback / error handling
app.use(errorHandler);

const start = async () => {
  await connectDB();
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
