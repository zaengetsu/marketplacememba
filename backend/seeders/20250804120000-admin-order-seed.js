'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Création d'un admin
    const [adminId] = await queryInterface.bulkInsert('Users', [{
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@marketplace.com',
      password: '$2b$12$hjE3eRTgPwVRcZTTwwCEPed.tISHaBKk3AhbREA30bj.BdMjzIsLK', // password123
      role: 'ROLE_ADMIN',
      isActive: true,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: ['id'] });

    // Création d'un utilisateur client
    const [userId] = await queryInterface.bulkInsert('Users', [{
      firstName: 'Client',
      lastName: 'Test',
      email: 'client@marketplace.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIfy', // password123
      role: 'ROLE_USER',
      isActive: true,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: ['id'] });

    // Création d'une commande passée par le client
    const [orderId] = await queryInterface.bulkInsert('Orders', [{
      userId: userId.id || userId,
      status: 'delivered',
      total: 199.99,
      shippingCost: 10.00,
      shippingAddress: JSON.stringify({ address: '10 avenue de France', city: 'Lyon', zip: '69000' }),
      billingAddress: JSON.stringify({ address: '10 avenue de France', city: 'Lyon', zip: '69000' }),
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: ['id'] });

    // Création d'une facture liée à la commande
    await queryInterface.bulkInsert('Invoices', [{
      orderId: orderId.id || orderId,
      invoiceNumber: 'INV-2025-0002',
      amount: 199.99,
      status: 'paid',
      issuedAt: new Date(),
      dueAt: new Date(),
      paidAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Invoices', { invoiceNumber: 'INV-2025-0002' }, {});
    await queryInterface.bulkDelete('Orders', { total: 199.99, shippingCost: 10.00 }, {});
    await queryInterface.bulkDelete('Users', { email: ['admin@marketplace.com', 'client@marketplace.com'] }, {});
  }
};
