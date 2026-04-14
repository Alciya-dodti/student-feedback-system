// ============================================
// routes/feedbackRoutes.js - API ENDPOINTS
// This file defines what happens when someone
// calls POST /feedback, GET /feedback, or DELETE /feedback/:id
// ============================================

const express = require('express');
const router = express.Router();

// Import the Feedback model to interact with MongoDB
const Feedback = require('../models/Feedback');

// ============================================
// POST /feedback
// PURPOSE: Submit new feedback
// WHEN: Student fills the form and clicks Submit
// ============================================
router.post('/', async (req, res) => {
  try {
    // Step 1: Extract data sent from the frontend
    const { studentName, courseName, rating, comments } = req.body;

    // Step 2: Basic validation - check required fields
    if (!studentName || !courseName || !rating) {
      return res.status(400).json({
        message: 'Please provide studentName, courseName, and rating.'
      });
    }

    // Step 3: Create a new Feedback document using our Model
    const newFeedback = new Feedback({
      studentName,
      courseName,
      rating,
      comments
    });

    // Step 4: Save it to MongoDB
    // .save() inserts the document into the "feedbacks" collection
    const savedFeedback = await newFeedback.save();

    // Step 5: Send success response back to frontend
    res.status(201).json({
      message: 'Feedback submitted successfully! ✅',
      feedback: savedFeedback
    });

  } catch (error) {
    // If anything goes wrong, send error response
    res.status(500).json({
      message: 'Server error while submitting feedback.',
      error: error.message
    });
  }
});

// ============================================
// GET /feedback
// PURPOSE: Get all feedback entries
// WHEN: Page loads or after submitting feedback
// ============================================
router.get('/', async (req, res) => {
  try {
    // .find({}) → Fetch ALL documents from "feedbacks" collection
    // .sort({ createdAt: -1 }) → Newest first
    const allFeedback = await Feedback.find({}).sort({ createdAt: -1 });

    // Send the array of feedback as JSON
    res.status(200).json({
      message: 'Feedback fetched successfully!',
      count: allFeedback.length,
      feedback: allFeedback
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error while fetching feedback.',
      error: error.message
    });
  }
});

// ============================================
// DELETE /feedback/:id
// PURPOSE: Delete a specific feedback by its ID
// WHEN: Admin clicks the Delete button on a feedback card
// :id is a URL parameter - e.g., /feedback/64abc123...
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    // Extract the ID from the URL
    const { id } = req.params;

    // .findByIdAndDelete() → Finds document by _id and removes it
    const deletedFeedback = await Feedback.findByIdAndDelete(id);

    // If no document was found with that ID
    if (!deletedFeedback) {
      return res.status(404).json({
        message: 'Feedback not found. Maybe it was already deleted.'
      });
    }

    // Success - feedback was deleted
    res.status(200).json({
      message: 'Feedback deleted successfully! 🗑️',
      deletedFeedback
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error while deleting feedback.',
      error: error.message
    });
  }
});

// Export the router so server.js can use it
module.exports = router;