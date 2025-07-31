const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/roleAuth');

// GET /api/alerts - Alertes système
router.get('/', authenticate, requirePermission('analytics:read'), async (req, res) => {
  try {
    // Simulation d'alertes
    const alerts = [
      {
        id: 1,
        type: 'stock',
        message: 'Stock faible pour certains produits',
        level: 'warning',
        createdAt: new Date()
      }
    ];

    res.json({
      success: true,
      data: alerts
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des alertes'
    });
  }
});

module.exports = router; 