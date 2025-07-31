const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { User } = require('../../models');
const { authenticate } = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/roleAuth');
const logger = require('../utils/logger');

// GET /api/users/profile - Profil de l'utilisateur connecté
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil'
    });
  }
});

// PUT /api/users/profile - Modifier le profil
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, birthDate } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      email: email || user.email,
      phone: typeof phone !== 'undefined' ? phone : user.phone,
      birthDate: typeof birthDate !== 'undefined' ? birthDate : user.birthDate
    });
    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        birthDate: user.birthDate
      }
    });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil'
    });
  }
});

// Suppression du compte utilisateur (droit à l'oubli)
router.delete('/me', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    // Supprimer les commandes de l'utilisateur
    const { Order, User } = require('../../models');
    await Order.destroy({ where: { userId } });
    // Supprimer l'utilisateur
    await User.destroy({ where: { id: userId } });
    res.json({ success: true, message: 'Compte et données supprimés.' });
  } catch (error) {
    logger.error('Erreur suppression compte RGPD:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression du compte.' });
  }
});

// Export des données personnelles (droit d'accès)
router.get('/me/export', authenticate, async (req, res) => {
  try {
    const { User, Order } = require('../../models');
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    const orders = await Order.findAll({ where: { userId: req.user.id } });
    res.json({
      success: true,
      data: {
        user,
        orders
      }
    });
  } catch (error) {
    logger.error('Erreur export données RGPD:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'export des données.' });
  }
});

module.exports = router; 