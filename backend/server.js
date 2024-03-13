const cookieParser = require('cookie-parser');
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const problemRoutes = require('./routes/problemRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const compilerRouter = require('./helpers/compiler');

require('dotenv').config();

const app = express();

mongoose.connect(process.env.DB_URL, {});

const db = mongoose.connection;

db.on('error', (error) => {
    console.error('db error:', error);
});

db.once('open', () => {
    console.log('db connected');
    const PORT = 8000;
    app.listen(PORT, () => {
        console.log('server is running');
    });
});

app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 'default-src \'self\'');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

app.use('/api', compilerRouter);
app.use('/uploads', express.static('uploads'));
app.use('/api', problemRoutes);
app.use('/api', submissionRoutes);
app.use(userRoutes);
app.use(uploadRoutes);

module.exports = app;
