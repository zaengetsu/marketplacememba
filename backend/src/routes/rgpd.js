const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');

// GET /api/rgpd/data - Données utilisateur (RGPD)
router.get('/data', authenticate, async (req, res) => {
  try {
    // Ici vous collecteriez toutes les données de l'utilisateur
    const userData = {
      personal: {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email
      },
      orders: [], // À récupérer de la base
      payments: [] // À récupérer de la base
    };

    res.json({
      success: true,
      data: userData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données'
    });
  }
});

module.exports = router; 