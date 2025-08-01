'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Récupérer l'utilisateur cible
    const [user] = await queryInterface.sequelize.query(
      "SELECT id FROM \"Users\" WHERE email = 'ibrahim.ouahabi@outlook.fr' LIMIT 1;",
      { type: Sequelize.QueryTypes.SELECT }
    );
    if (!user) throw new Error('Utilisateur non trouvé');

    // Créer une commande
    const [orderId] = await queryInterface.bulkInsert('Orders', [{
      userId: user.id,
      status: 'delivered',
      total: 120.00,
      shippingCost: 10.00,
      shippingAddress: JSON.stringify({ address: '1 rue de Paris', city: 'Paris', zip: '75000' }),
      billingAddress: JSON.stringify({ address: '1 rue de Paris', city: 'Paris', zip: '75000' }),
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: ['id'] });

    // Créer une facture liée à la commande
    await queryInterface.bulkInsert('Invoices', [{
      orderId: orderId.id || orderId, // selon le dialecte
      invoiceNumber: 'INV-2025-0001',
      amount: 120.00,
      status: 'paid',
      issuedAt: new Date(),
      dueAt: new Date(),
      paidAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Invoices', { invoiceNumber: 'INV-2025-0001' }, {});
    await queryInterface.bulkDelete('Orders', { total: 120.00, shippingCost: 10.00 }, {});
  }
};
