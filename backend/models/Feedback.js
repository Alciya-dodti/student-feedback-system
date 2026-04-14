// ============================================
// models/Feedback.js - DATABASE SCHEMA
// This defines the "shape" of our data in MongoDB.
// Think of it like a blueprint/template for each feedback document.
// ============================================

const mongoose = require('mongoose');

// Define the Schema (structure of data)
const feedbackSchema = new mongoose.Schema({

  // Student's name - must be provided (required)
  studentName: {
    type: String,
    required: true,   // Cannot be empty
    trim: true        // Removes extra spaces from start/end
  },

  // Course name - must be provided
  courseName: {
    type: String,
    required: true,
    trim: true
  },

  // Rating between 1 and 5
  rating: {
    type: Number,
    required: true,
    min: 1,   // Minimum value allowed
    max: 5    // Maximum value allowed
  },

  // Optional comments from the student
  comments: {
    type: String,
    trim: true,
    default: ''   // If not provided, defaults to empty string
  }

}, {
  // Automatically adds "createdAt" and "updatedAt" timestamps
  timestamps: true
});

// Create the Model from the Schema
// "Feedback" → MongoDB will create a collection called "feedbacks" (auto-pluralized)
const Feedback = mongoose.model('Feedback', feedbackSchema);

// Export so other files can use it
module.exports = Feedback;