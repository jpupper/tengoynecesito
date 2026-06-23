const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const auth = require('../middleware/auth');

// GET /api/users/profile/:userId - View any user's profile
router.get('/profile/:userId', async (req, res) => {
  try {
    let profile = await UserProfile.findOne({ userId: req.params.userId });
    if (!profile) {
      // Return basic profile if not stored locally yet
      return res.json({ success: true, profile: null, message: 'Usuario sin perfil completo' });
    }
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/me - Get own profile (requires auth)
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    let profile = await UserProfile.findOne({ userId });
    
    if (!profile) {
      // Create profile on first access
      profile = new UserProfile({
        userId,
        username: req.user.username || req.user.name || 'user',
        displayName: req.user.username || req.user.name || 'User',
        bio: '',
        avatar: '',
        location: ''
      });
      await profile.save();
    }

    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/me - Update own profile
router.put('/me', auth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { displayName, bio, avatar, location } = req.body;

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: { displayName, bio, avatar, location } },
      { new: true, upsert: true }
    );

    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
