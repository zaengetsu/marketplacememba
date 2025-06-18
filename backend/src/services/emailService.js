require('dotenv').config();
const transporter = require('../utils/mailer'); 
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.isEnabled = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);

    if (!this.isEnabled) {
      console.log('📧 Service Email désactivé - Pas de configuration SMTP');
      logger.info('Email service disabled - no SMTP configuration');
      return;
    }
    this.transporter = transporter

    this.verifyConnection();
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      logger.info('✅ Connexion au service SMTP vérifiée');
    } catch (err) {
      logger.error('❌ Erreur lors de la vérification SMTP :', err);
    }
  }

  async sendVerificationEmail(email, token, userData) {
  if (!this.isEnabled) return;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Confirmation de votre adresse email',
    html: `<p>Merci de vous être inscrit. Voici votre token de vérification : <b>${token}</b></p>`
  };

  try {
    await this.transporter.sendMail(mailOptions);
    logger.info(`📧 Email de vérification envoyé à ${email}`);
  } catch (error) {
    logger.error('❌ Erreur lors de l’envoi de l’email de vérification :', error);
  }
}

  async sendPasswordResetEmail(email, token, userData) {
    if (!this.isEnabled) return;
    // À implémenter si besoin
  }

  async sendAccountLockedEmail(email, userData) {
    if (!this.isEnabled) return;
    // À implémenter si besoin
  }

  async sendNewProductAlert(email, product, userData) {
    if (!this.isEnabled) return;
    // À implémenter si besoin
  }

  async sendRestockAlert(email, product, userData) {
    if (!this.isEnabled) return;
    // À implémenter si besoin
  }

  async sendPriceChangeAlert(email, product, oldPrice, userData) {
    if (!this.isEnabled) return;
    // À implémenter si besoin
  }

  async sendOrderConfirmation(email, order, userData) {
    if (!this.isEnabled) return;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Confirmation de votre commande #${order.id}`,
      text: `Bonjour ${userData?.name || 'client'},\n\nMerci pour votre commande ! Voici les détails :\n\n- Numéro de commande : ${order.id}\n- Montant total : ${order.total} €\n\nCordialement,\nL'équipe Marketplace`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Confirmation envoyée à ${email}`);
    } catch (error) {
      logger.error('❌ Erreur lors de l’envoi de l’email de confirmation :', error);
    }
  }

  async sendNewsletter(email, content, userData) {
    if (!this.isEnabled) return;
    // À implémenter si besoin
  }

  async sendDataDeletionConfirmation(email, userData) {
    if (!this.isEnabled) return;
    // À implémenter si besoin
  }

  async sendWelcomeEmail(userEmail, userName) {
    if (!this.isEnabled) return;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Bienvenue sur Marketplace !',
      text: `Bonjour ${userName || ''},\n\nBienvenue sur notre marketplace !\nNous sommes ravis de vous compter parmi nous.\n\nCordialement,\nL'équipe Marketplace`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Email de bienvenue envoyé à ${userEmail}`);
    } catch (error) {
      logger.error('❌ Erreur lors de l’envoi de l’email de bienvenue :', error);
    }
  }

  async sendPasswordReset(userEmail, userName, resetToken) {
    if (!this.isEnabled) return;

    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Réinitialisation de votre mot de passe',
      text: `Bonjour ${userName || ''},\n\nVoici le lien pour réinitialiser votre mot de passe :\n${resetUrl}\n\nCe lien est valable 1 heure.\n\nCordialement,\nL'équipe Marketplace`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Email de réinitialisation envoyé à ${userEmail}`);
    } catch (error) {
      logger.error('❌ Erreur lors de l’envoi de l’email de réinitialisation :', error);
    }
  }

  async sendShippingNotification(userEmail, userName, trackingNumber, orderNumber) {
    if (!this.isEnabled) return;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Votre commande #${orderNumber} a été expédiée`,
      text: `Bonjour ${userName || ''},\n\nVotre commande #${orderNumber} a été expédiée.\nNuméro de suivi : ${trackingNumber}\n\nCordialement,\nL'équipe Marketplace`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Email d'expédition envoyé à ${userEmail}`);
    } catch (error) {
      logger.error('❌ Erreur lors de l’envoi de l’email d’expédition :', error);
    }
  }
}

module.exports = new EmailService();
