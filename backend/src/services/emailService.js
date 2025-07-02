require('dotenv').config();
const transporter = require('../utils/mailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.isEnabled = !!(process.env.MAIL_USER && process.env.MAIL_PASSWORD);

    if (!this.isEnabled) {
      console.log('📧 Service Email désactivé - Pas de configuration SMTP');
      logger.info('Email service disabled - no SMTP configuration');
      return;
    }
    this.transporter = transporter;

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

    const verificationUrl = `http://localhost:5173/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: email,
      subject: 'Confirmation de votre adresse email',
      html: `
        <p>Merci de vous être inscrit.</p>
        <p>Cliquez sur le lien ci-dessous pour activer votre compte :</p>
        <p><a href="${verificationUrl}">Activer mon compte</a></p>
        <p>Ou copiez ce lien dans votre navigateur :<br>${verificationUrl}</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Email de vérification envoyé à ${email}`);
    } catch (error) {
      logger.error('❌ Erreur lors de l\'envoi de l\'email de vérification :', error);
    }
  }

  async sendPasswordResetEmail(email, token) {
    if (!this.isEnabled) return;

    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <p>Vous avez demandé une réinitialisation de mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
        <p><a href="${resetUrl}">Réinitialiser mon mot de passe</a></p>
        <p>Ou copiez ce lien dans votre navigateur :<br>${resetUrl}</p>
        <p>Ce lien expire dans 1 heure.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Email de réinitialisation envoyé à ${email}`);
    } catch (error) {
      logger.error('❌ Erreur lors de l\'envoi de l\'email de réinitialisation :', error);
    }
  }

  async sendNewProductAlert(userEmail, product, userData) {
    if (!this.isEnabled) return;

    const productUrl = `http://localhost:5173/products/${product.id}`;

    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: userEmail,
      subject: `Nouveau produit : ${product.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Nouveau produit disponible !</h2>
          
          <div style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden; margin: 20px 0;">
            <img src="http://localhost:4000${product.images[0] || '/placeholder.jpg'}" alt="${product.name}" style="width: 100%; height: 200px; object-fit: cover;">
            
            <div style="padding: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #333;">${product.name}</h3>
              <p style="color: #666; margin: 0 0 15px 0;">${product.description}</p>
              
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  ${product.isOnSale ? 
                    `<span style="color: #e74c3c; font-size: 18px; font-weight: bold;">${product.salePrice}€</span>
                     <span style="text-decoration: line-through; color: #999; margin-left: 10px;">${product.price}€</span>` :
                    `<span style="color: #2c3e50; font-size: 18px; font-weight: bold;">${product.price}€</span>`
                  }
                </div>
                <a href="${productUrl}" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Voir le produit</a>
              </div>
            </div>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Alerte nouveau produit envoyée à ${userEmail}`);
    } catch (error) {
      logger.error('❌ Erreur lors de l\'envoi de l\'alerte produit :', error);
    }
  }

  async sendOrderStatusUpdate(email, order, oldStatus, newStatus) {
    if (!this.isEnabled) return;

    const statusLabels = {
      'pending': 'En attente',
      'confirmed': 'Confirmée',
      'shipped': 'Expédiée',
      'delivered': 'Livrée',
      'cancelled': 'Annulée'
    };

    const statusMessages = {
      'confirmed': 'Votre commande a été confirmée et sera bientôt préparée.',
      'shipped': 'Votre commande a été expédiée ! Vous devriez la recevoir sous peu.',
      'delivered': 'Votre commande a été livrée avec succès.',
      'cancelled': 'Votre commande a été annulée. Si vous avez des questions, contactez notre service client.'
    };

    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: email,
      subject: `Mise à jour de votre commande #${order.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Mise à jour de votre commande</h2>
          
          <p>Bonjour ${order.user.firstName || 'Cher client'},</p>
          
          <p>Le statut de votre commande <strong>#${order.id}</strong> a été mis à jour :</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Ancien statut :</strong> ${statusLabels[oldStatus] || oldStatus}</p>
            <p style="margin: 10px 0 0 0;"><strong>Nouveau statut :</strong> <span style="color: #28a745;">${statusLabels[newStatus] || newStatus}</span></p>
          </div>
          
          <p>${statusMessages[newStatus] || 'Le statut de votre commande a été mis à jour.'}</p>
          
          <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Détails de la commande :</h3>
            <p><strong>Numéro :</strong> #${order.id}</p>
            <p><strong>Total :</strong> ${order.total}€</p>
            <p><strong>Date :</strong> ${new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
          </div>
          
          <p>Vous pouvez suivre votre commande en vous connectant à votre compte sur notre site.</p>
          
          <p style="color: #666; font-size: 0.9em;">
            Si vous avez des questions, n'hésitez pas à nous contacter.<br>
            Merci de votre confiance !
          </p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Email de mise à jour de statut envoyé à ${email} pour la commande ${order.id}`);
    } catch (error) {
      logger.error('❌ Erreur lors de l\'envoi de l\'email de mise à jour de statut :', error);
    }
  }
}

module.exports = new EmailService();
