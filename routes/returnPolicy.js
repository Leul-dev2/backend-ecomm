import express from 'express';
import ReturnPolicy from '../models/ReturnPolicy.js';

const router = express.Router();

// GET /api/return-policy
router.get('/', async (req, res) => {
  try {
    const policy = await ReturnPolicy.findOne();
    if (!policy) {
      return res.status(404).json({ message: 'No return policy found' });
    }
    res.json(policy);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
