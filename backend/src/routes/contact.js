const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// POST /api/contact - Réception du formulaire de contact
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Tous les champs sont obligatoires.' });
    }

    // Configure le transporteur nodemailer avec les variables d'environnement génériques
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT) || 587,
      secure: false, // true pour 465, false pour 587 ou autres
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
      }
    });

    // Prépare l'email
    const mailOptions = {
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: process.env.MAIL_USER, // reçoit sur l'adresse de l'admin
      replyTo: email, // pour pouvoir répondre à l'expéditeur
      subject: `Nouveau message de contact de ${name}`,
      text: `Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    };

    // Envoi de l'email
    await transporter.sendMail(mailOptions);
    logger.info('Contact email envoyé', { name, email });
    res.json({ success: true, message: 'Message envoyé avec succès.' });
  } catch (error) {
    logger.error('Erreur envoi contact:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi du message.' });
  }
});

module.exports = router;
