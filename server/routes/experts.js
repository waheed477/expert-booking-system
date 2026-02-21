const express = require('express');
const router = express.Router();
const Expert = require('../models/Expert');

// Get all experts with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filters
    const filter = {};
    if (req.query.category && req.query.category !== 'all') {
      filter.category = req.query.category;
    }
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    // Get experts from database
    const experts = await Expert.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ rating: -1 });

    const total = await Expert.countDocuments(filter);

    console.log(`Found ${experts.length} experts, total ${total}`); // Debug log

    res.json({
      data: experts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching experts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get expert by ID
router.get('/:id', async (req, res) => {
  try {
    const expert = await Expert.findById(req.params.id);
    if (!expert) {
      return res.status(404).json({ error: 'Expert not found' });
    }
    res.json(expert);
  } catch (error) {
    console.error('Error fetching expert:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;