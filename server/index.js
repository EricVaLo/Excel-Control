require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// static
app.use('/public', express.static(path.join(__dirname, '..', 'public')));
app.use('/', express.static(path.join(__dirname, '..', 'views')));

// routes
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// arrancar
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});