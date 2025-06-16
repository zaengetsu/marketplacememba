// Service Email désactivé temporairement
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.isEnabled = false;
    console.log('📧 Service Email désactivé - Pas de configuration SMTP');
    logger.info('Email service disabled - no SMTP configuration');
  }

  async verifyConnection() {
    // Ne fait rien - service désactivé
    return;
  }

  // Toutes les méthodes d'email ne font rien mais ne génèrent pas d'erreur
  async sendVerificationEmail(email, token, userData) {
    console.log('📧 Email de vérification (désactivé) pour:', email);
    return Promise.resolve();
  }

  async sendPasswordResetEmail(email, token, userData) {
    console.log('📧 Email de réinitialisation (désactivé) pour:', email);
    return Promise.resolve();
  }

  async sendAccountLockedEmail(email, userData) {
    console.log('📧 Email de compte verrouillé (désactivé) pour:', email);
    return Promise.resolve();
  }

  async sendNewProductAlert(email, product, userData) {
    console.log('📧 Email d\'alerte produit (désactivé) pour:', email);
    return Promise.resolve();
  }

  async sendRestockAlert(email, product, userData) {
    console.log('📧 Email de restock (désactivé) pour:', email);
    return Promise.resolve();
  }

  async sendPriceChangeAlert(email, product, oldPrice, userData) {
    console.log('📧 Email de changement de prix (désactivé) pour:', email);
    return Promise.resolve();
  }

  async sendOrderConfirmation(email, order, userData) {
    console.log('📧 Email de confirmation de commande (désactivé) pour:', email);
    return Promise.resolve();
  }

  async sendNewsletter(email, content, userData) {
    console.log('📧 Newsletter (désactivée) pour:', email);
    return Promise.resolve();
  }

  async sendDataDeletionConfirmation(email, userData) {
    console.log('📧 Email de suppression de données (désactivé) pour:', email);
    return Promise.resolve();
  }

  async sendWelcomeEmail(userEmail, userName) {
    console.log('📧 Email de bienvenue (désactivé) pour:', userEmail);
    return Promise.resolve();
  }

  async sendPasswordReset(userEmail, userName, resetToken) {
    console.log('📧 Email de réinitialisation de mot de passe (désactivé) pour:', userEmail);
    return Promise.resolve();
  }

  async sendShippingNotification(userEmail, userName, trackingNumber, orderNumber) {
    console.log('📧 Email de notification d\'expédition (désactivé) pour:', userEmail);
    return Promise.resolve();
  }
}

module.exports = new EmailService(); 