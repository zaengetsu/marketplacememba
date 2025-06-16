const express = require('express');
const router = express.Router();
const { Product } = require('../../models');
const { authenticate } = require('../middlewares/auth');
const logger = require('../utils/logger');

// GET /api/cart - Récupérer le panier (session ou utilisateur connecté)
router.get('/', async (req, res) => {
  try {
    // Pour l'instant, on utilise les sessions
    const cart = req.session.cart || [];
    
    res.json({
      success: true,
      data: {
        items: cart,
        totalItems: cart.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
    });

  } catch (error) {
    logger.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du panier'
    });
  }
});

// POST /api/cart/add - Ajouter un produit au panier
router.post('/add', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'ID du produit requis'
      });
    }

    // Vérifier que le produit existe et est disponible
    const product = await Product.findOne({
      where: { 
        id: productId,
        isActive: true 
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé ou indisponible'
      });
    }

    // Vérifier le stock
    if (product.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Stock insuffisant'
      });
    }

    // Initialiser le panier s'il n'existe pas
    if (!req.session.cart) {
      req.session.cart = [];
    }

    // Vérifier si le produit est déjà dans le panier
    const existingItem = req.session.cart.find(item => item.productId === productId);
    
    if (existingItem) {
      // Vérifier le stock total
      const newQuantity = existingItem.quantity + quantity;
      if (product.stockQuantity < newQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Stock insuffisant pour cette quantité'
        });
      }
      existingItem.quantity = newQuantity;
    } else {
      // Ajouter le nouveau produit
      req.session.cart.push({
        productId: product.id,
        name: product.name,
        price: product.isOnSale && product.salePrice ? product.salePrice : product.price,
        quantity: quantity,
        image: product.images?.[0] || null
      });
    }

    res.json({
      success: true,
      message: 'Produit ajouté au panier',
      data: {
        items: req.session.cart,
        totalItems: req.session.cart.reduce((sum, item) => sum + item.quantity, 0)
      }
    });

  } catch (error) {
    logger.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout au panier'
    });
  }
});

// PUT /api/cart/update - Mettre à jour la quantité d'un produit
router.put('/update', async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'ID du produit et quantité valide requis'
      });
    }

    if (!req.session.cart) {
      return res.status(404).json({
        success: false,
        message: 'Panier vide'
      });
    }

    const itemIndex = req.session.cart.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé dans le panier'
      });
    }

    if (quantity === 0) {
      // Supprimer l'item
      req.session.cart.splice(itemIndex, 1);
    } else {
      // Vérifier le stock
      const product = await Product.findByPk(productId);
      if (product && product.stockQuantity < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Stock insuffisant'
        });
      }
      
      req.session.cart[itemIndex].quantity = quantity;
    }

    res.json({
      success: true,
      message: 'Panier mis à jour',
      data: {
        items: req.session.cart,
        totalItems: req.session.cart.reduce((sum, item) => sum + item.quantity, 0)
      }
    });

  } catch (error) {
    logger.error('Error updating cart:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du panier'
    });
  }
});

// DELETE /api/cart/remove/:productId - Supprimer un produit du panier
router.delete('/remove/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    if (!req.session.cart) {
      return res.status(404).json({
        success: false,
        message: 'Panier vide'
      });
    }

    const itemIndex = req.session.cart.findIndex(item => item.productId == productId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé dans le panier'
      });
    }

    req.session.cart.splice(itemIndex, 1);

    res.json({
      success: true,
      message: 'Produit retiré du panier',
      data: {
        items: req.session.cart,
        totalItems: req.session.cart.reduce((sum, item) => sum + item.quantity, 0)
      }
    });

  } catch (error) {
    logger.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du panier'
    });
  }
});

// DELETE /api/cart/clear - Vider le panier
router.delete('/clear', async (req, res) => {
  try {
    req.session.cart = [];

    res.json({
      success: true,
      message: 'Panier vidé',
      data: {
        items: [],
        totalItems: 0
      }
    });

  } catch (error) {
    logger.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du vidage du panier'
    });
  }
});

module.exports = router; 