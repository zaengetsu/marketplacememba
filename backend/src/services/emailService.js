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

    // Remplace l'URL par celle de ton frontend si besoin
    const verificationUrl = `http://localhost:5173/verify-email?token=${token}`; // adapte l'URL si besoin

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
      logger.error('❌ Erreur lors de l’envoi de l’email de vérification :', error);
    }
  }

  async sendPasswordResetEmail(email, token, userData) {
    if (!this.isEnabled) return;

    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
      <p>Bonjour,</p>
      <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
      <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
      <p><a href="${resetUrl}">Réinitialiser mon mot de passe</a></p>
      <p>Si vous n'avez pas demandé cette action, ignorez simplement ce message.</p>
    `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Email de réinitialisation envoyé à ${email}`);
    } catch (error) {
      logger.error('❌ Erreur lors de l’envoi de l’email de réinitialisation :', error);
    }
  }

  async sendAccountLockedEmail(email, userData) {
    if (!this.isEnabled) return;

    const name = userData?.firstName
      ? `${userData.firstName} ${userData.lastName || ''}`.trim()
      : 'client';

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "Votre compte a été verrouillé",
      text: `Bonjour ${name},\n\nVotre compte a été verrouillé suite à plusieurs tentatives de connexion échouées. Merci de contacter le support pour le réactiver.\n\nCordialement,\nL'équipe Marketplace`,
      html: `<p>Bonjour <b>${name}</b>,</p>
           <p>Votre compte a été <b>verrouillé</b> suite à plusieurs tentatives de connexion échouées.</p>
           <p>Merci de contacter le support pour le réactiver.</p>
           <p>Cordialement,<br>L'équipe Marketplace</p>`
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Email de compte verrouillé envoyé à ${email}`);
    } catch (error) {
      logger.error('❌ Erreur lors de l’envoi de l’email de compte verrouillé :', error);
    }
  }

  async sendNewProductAlert(email, product, userData) {
    if (!this.isEnabled) return;

    const name = userData?.firstName
      ? `${userData.firstName} ${userData.lastName || ''}`.trim()
      : 'client';

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: `Nouveau produit disponible : ${product.name}`,
      text: `Bonjour ${name},\n\nUn nouveau produit "${product.name}" est maintenant disponible sur notre boutique !\n\nDescription : ${product.description}\nPrix : ${product.price} €\n\nVenez vite le découvrir !\n\nCordialement,\nL'équipe Marketplace`,
      html: `<p>Bonjour <b>${name}</b>,</p>
           <p>Un nouveau produit <b>${product.name}</b> est maintenant disponible sur notre boutique !</p>
           <p>Description : ${product.description}<br>Prix : <b>${product.price} €</b></p>
           <p><a href="${process.env.FRONTEND_URL}/product/${product.id}">Voir le produit</a></p>
           <p>Cordialement,<br>L'équipe Marketplace</p>`
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Alerte nouveau produit envoyée à ${email}`);
    } catch (error) {
      logger.error('❌ Erreur lors de l’envoi de l’alerte nouveau produit :', error);
    }
  }

  async sendRestockAlert(email, product, userData) {
    if (!this.isEnabled) return;

    const name = userData?.firstName
      ? `${userData.firstName} ${userData.lastName || ''}`.trim()
      : 'client';

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: `Produit de retour en stock : ${product.name}`,
      text: `Bonjour ${name},\n\nLe produit "${product.name}" est de nouveau disponible !\n\nPrix : ${product.price} €\n\nProfitez-en vite !\n\nCordialement,\nL'équipe Marketplace`,
      html: `<p>Bonjour <b>${name}</b>,</p>
           <p>Le produit <b>${product.name}</b> est de nouveau disponible !</p>
           <p>Prix : <b>${product.price} €</b></p>
           <p><a href="${process.env.FRONTEND_URL}/product/${product.id}">Voir le produit</a></p>
           <p>Cordialement,<br>L'équipe Marketplace</p>`
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Alerte restock envoyée à ${email}`);
    } catch (error) {
      logger.error('❌ Erreur lors de l’envoi de l’alerte restock :', error);
    }
  }

  async sendPriceChangeAlert(email, product, oldPrice, userData) {
    if (!this.isEnabled) return;

    const name = userData?.firstName
      ? `${userData.firstName} ${userData.lastName || ''}`.trim()
      : 'client';

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: `Changement de prix : ${product.name}`,
      text: `Bonjour ${name},\n\nLe prix du produit "${product.name}" a changé :\nAncien prix : ${oldPrice} €\nNouveau prix : ${product.price} €\n\nProfitez-en !\n\nCordialement,\nL'équipe Marketplace`,
      html: `<p>Bonjour <b>${name}</b>,</p>
           <p>Le prix du produit <b>${product.name}</b> a changé !</p>
           <p>Ancien prix : <s>${oldPrice} €</s><br>Nouveau prix : <b>${product.price} €</b></p>
           <p><a href="${process.env.FRONTEND_URL}/product/${product.id}">Voir le produit</a></p>
           <p>Cordialement,<br>L'équipe Marketplace</p>`
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Alerte changement de prix envoyée à ${email}`);
    } catch (error) {
      logger.error('❌ Erreur lors de l’envoi de l’alerte changement de prix :', error);
    }
  }

  async sendOrderConfirmation(email, order, user, invoicePath) {
    if (!this.isEnabled) return;

    const name = user?.firstName
      ? `${user.firstName} ${user.lastName || ''}`.trim()
      : 'client';

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: `Confirmation de votre commande #${order.id}`,
      text: `Bonjour ${name},

Merci pour votre commande sur Marketplace !

Détails de la commande :
- Numéro de commande : ${order.id}
- Montant total : ${order.total} €

Votre commande est confirmée et sera traitée dans les plus brefs délais.

Cordialement,
L'équipe Marketplace
`,
      html: `
      <div style="font-family: Arial, sans-serif; color: #222;">
        <h2>Merci pour votre commande !</h2>
        <p>Bonjour <b>${name}</b>,</p>
        <p>Votre commande <b>#${order.id}</b> a bien été confirmée.</p>
        <table style="margin: 16px 0;">
          <tr>
            <td style="padding: 4px 8px;">Numéro de commande :</td>
            <td style="padding: 4px 8px;"><b>${order.id}</b></td>
          </tr>
          <tr>
            <td style="padding: 4px 8px;">Montant total :</td>
            <td style="padding: 4px 8px;"><b>${order.total} €</b></td>
          </tr>
        </table>
        <p>Votre commande est confirmée et sera traitée dans les plus brefs délais.</p>
        <p style="margin-top:32px;">Cordialement,<br>L'équipe Marketplace</p>
      </div>
    `,
      attachments: invoicePath ? [{
        filename: `facture-${order.id}.pdf`,
        path: invoicePath
      }] : []
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
      from: process.env.MAIL_USER,
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
      from: process.env.MAIL_USER,
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
      from: process.env.MAIL_USER,
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

  async sendPasswordChangedEmail(email, userData) {
    if (!this.isEnabled) return;

    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: email,
      subject: 'Votre mot de passe a été modifié',
      html: `
      <p>Bonjour,</p>
      <p>Votre mot de passe vient d'être modifié.</p>
      <p>Si ce n'est pas vous, <a href="http://localhost:5173/forgot-password">cliquez ici pour réinitialiser votre mot de passe</a>.</p>
    `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Email de notification de changement de mot de passe envoyé à ${email}`);
    } catch (error) {
      logger.error('❌ Erreur lors de l’envoi de l’email de notification de changement de mot de passe :', error);
    }
  }
}

module.exports = new EmailService();
