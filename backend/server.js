// ============================================
// server.js - MAIN ENTRY POINT
// This is where everything starts.
// It sets up Express, connects to MongoDB,
// and starts listening for requests.
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import our feedback routes
const feedbackRoutes = require('./routes/feedbackRoutes');

// Create the Express app
const app = express();
const PORT = 3000;

// ---- MIDDLEWARE ----
// These run on EVERY request before it reaches the route handler

// cors: Allows our frontend (running on a different port) to talk to this backend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// express.json(): Parses incoming JSON request bodies
// Without this, req.body would be undefined
app.use(express.json());

// ---- DATABASE CONNECTION ----
// Connect to MongoDB (make sure MongoDB is running locally)
mongoose.connect('mongodb+srv://alciya:alciya123@cluster0.l3zdv18.mongodb.net/?appName=Cluster0')
  .then(() => {
    console.log('✅ Connected to MongoDB successfully!');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
  });

// ---- ROUTES ----
// All routes starting with /feedback will be handled by feedbackRoutes
app.use('/feedback', feedbackRoutes);

// Root route - just to test if server is running
app.get('/', (req, res) => {
  res.json({ message: 'Student Feedback System API is running! 🚀' });
});

// ---- START SERVER ----
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});