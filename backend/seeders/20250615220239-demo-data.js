'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insertion des catégories sportives MambaFit
    const categories = await queryInterface.bulkInsert('Categories', [
      {
        name: 'Chaussures',
        slug: 'chaussures',
        description: 'Chaussures de sport pour tous types d\'activités : running, fitness, basketball, tennis et plus encore.',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Musculation',
        slug: 'musculation',
        description: 'Équipements de musculation : haltères, barres, machines et accessoires pour développer votre force.',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Yoga & Pilates',
        slug: 'yoga-pilates',
        description: 'Tapis, blocs, sangles et accessoires pour vos séances de yoga et pilates en toute sérénité.',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Électronique Sport',
        slug: 'electronique-sport',
        description: 'Montres connectées, écouteurs, capteurs et gadgets high-tech pour optimiser vos performances.',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Accessoires',
        slug: 'accessoires',
        description: 'Sacs de sport, gourdes, serviettes et tous les accessoires indispensables à votre pratique sportive.',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Nutrition',
        slug: 'nutrition',
        description: 'Compléments alimentaires, protéines, vitamines et produits nutritionnels pour sportifs.',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cardio',
        slug: 'cardio',
        description: 'Tapis de course, vélos d\'appartement, elliptiques et équipements cardio pour votre home gym.',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sports de Combat',
        slug: 'sports-combat',
        description: 'Gants, sacs de frappe, protections et équipements pour la boxe, MMA et arts martiaux.',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    // Insertion des produits sportifs MambaFit
    await queryInterface.bulkInsert('Products', [
      // Chaussures (categoryId: 1)
      {
        name: 'Chaussures de Running Nike Air Zoom',
        description: 'Chaussures de course haute performance avec technologie Zoom Air pour un amorti réactif et une propulsion optimale. Mesh respirant et semelle en caoutchouc durable.',
        price: 149.99,
        salePrice: 119.99,
        isOnSale: true,
        stockQuantity: 45,
        categoryId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Baskets Cross-Training Adidas',
        description: 'Chaussures polyvalentes pour l\'entraînement croisé, avec support latéral renforcé et semelle antidérapante. Parfaites pour le fitness et la musculation.',
        price: 89.99,
        salePrice: 69.99,
        isOnSale: true,
        stockQuantity: 32,
        categoryId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Musculation (categoryId: 2)
      {
        name: 'Haltères Ajustables 20kg',
        description: 'Set d\'haltères ajustables de 5 à 20kg par haltère. Système de verrouillage rapide et sécurisé. Parfait pour l\'entraînement à domicile.',
        price: 199.99,
        isOnSale: false,
        stockQuantity: 15,
        categoryId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Barre de Traction Murale',
        description: 'Barre de traction robuste à fixer au mur, supporte jusqu\'à 150kg. Poignées antidérapantes et installation facile.',
        price: 79.99,
        salePrice: 59.99,
        isOnSale: true,
        stockQuantity: 28,
        categoryId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Kettlebell 16kg',
        description: 'Kettlebell en fonte avec revêtement vinyle pour protéger le sol. Poignée ergonomique pour une prise en main optimale.',
        price: 49.99,
        isOnSale: false,
        stockQuantity: 22,
        categoryId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Yoga & Pilates (categoryId: 3)
      {
        name: 'Tapis de Yoga Premium',
        description: 'Tapis de yoga antidérapant en caoutchouc naturel, épaisseur 6mm. Surface texturée pour une adhérence parfaite, même en cas de transpiration.',
        price: 79.99,
        salePrice: 59.99,
        isOnSale: true,
        stockQuantity: 38,
        categoryId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Kit Blocs de Yoga',
        description: 'Set de 2 blocs de yoga en mousse haute densité avec sangle d\'étirement. Idéal pour améliorer l\'alignement et approfondir les postures.',
        price: 29.99,
        isOnSale: false,
        stockQuantity: 45,
        categoryId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Électronique Sport (categoryId: 4)
      {
        name: 'Montre Connectée Fitness',
        description: 'Montre intelligente avec suivi GPS, cardiofréquencemètre, 50+ modes sport et autonomie 7 jours. Étanche jusqu\'à 50m.',
        price: 299.99,
        salePrice: 249.99,
        isOnSale: true,
        stockQuantity: 18,
        categoryId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Écouteurs Sport Bluetooth',
        description: 'Écouteurs sans fil résistants à la transpiration avec crochets d\'oreille. Autonomie 8h et étui de charge inclus.',
        price: 89.99,
        salePrice: 69.99,
        isOnSale: true,
        stockQuantity: 35,
        categoryId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Accessoires (categoryId: 5)
      {
        name: 'Sac de Sport Adidas',
        description: 'Sac de sport spacieux 50L avec compartiment chaussures séparé, poche latérale et bandoulière ajustable. Matière résistante à l\'eau.',
        price: 45.99,
        isOnSale: false,
        stockQuantity: 67,
        categoryId: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Gourde Isotherme 750ml',
        description: 'Gourde en acier inoxydable gardant les boissons froides 24h ou chaudes 12h. Bouchon étanche et mousqueton inclus.',
        price: 24.99,
        salePrice: 19.99,
        isOnSale: true,
        stockQuantity: 89,
        categoryId: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Nutrition (categoryId: 6)
      {
        name: 'Protéine Whey Isolate 2kg',
        description: 'Protéine en poudre haute qualité, 90% de protéines, faible en lactose. Saveur vanille naturelle, mélange instantané.',
        price: 89.99,
        salePrice: 69.99,
        isOnSale: true,
        stockQuantity: 43,
        categoryId: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'BCAA 2:1:1 - 300g',
        description: 'Acides aminés essentiels en poudre, ratio optimal 2:1:1. Saveur fruits rouges, sans sucre ajouté. Idéal pendant l\'entraînement.',
        price: 34.99,
        isOnSale: false,
        stockQuantity: 56,
        categoryId: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Cardio (categoryId: 7)
      {
        name: 'Vélo d\'Appartement Connecté',
        description: 'Vélo d\'intérieur avec écran tactile 10", résistance magnétique 32 niveaux et cours en ligne inclus. Structure robuste jusqu\'à 120kg.',
        price: 899.99,
        salePrice: 749.99,
        isOnSale: true,
        stockQuantity: 8,
        categoryId: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Corde à Sauter Pro',
        description: 'Corde à sauter avec roulements à billes, poignées ergonomiques et câble ajustable. Compteur intégré et poids dans les poignées.',
        price: 19.99,
        salePrice: 14.99,
        isOnSale: true,
        stockQuantity: 78,
        categoryId: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Sports de Combat (categoryId: 8)
      {
        name: 'Gants de Boxe Cuir 12oz',
        description: 'Gants de boxe professionnels en cuir véritable, 12oz, avec lacets. Rembourrage multi-couches et ventilation optimisée.',
        price: 129.99,
        isOnSale: false,
        stockQuantity: 22,
        categoryId: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sac de Frappe 120cm',
        description: 'Sac de frappe lourd 35kg, hauteur 120cm. Cuir synthétique résistant, chaîne de suspension incluse. Parfait pour l\'entraînement intensif.',
        price: 189.99,
        salePrice: 149.99,
        isOnSale: true,
        stockQuantity: 12,
        categoryId: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Produits supplémentaires pour enrichir le catalogue

      // Chaussures supplémentaires (categoryId: 1)
      {
        name: 'Chaussures de Basketball Jordan',
        description: 'Chaussures de basketball haute performance avec technologie Air et support de cheville renforcé. Design iconique et adhérence maximale sur parquet.',
        price: 179.99,
        salePrice: 159.99,
        isOnSale: true,
        stockQuantity: 25,
        categoryId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Chaussures de Tennis Wilson',
        description: 'Chaussures de tennis avec semelle spéciale terre battue, support latéral et amorti au talon. Durabilité exceptionnelle pour les joueurs intensifs.',
        price: 119.99,
        isOnSale: false,
        stockQuantity: 18,
        categoryId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Chaussures de Randonnée Merrell',
        description: 'Chaussures de randonnée imperméables avec semelle Vibram et protection des orteils. Confort longue durée pour tous terrains.',
        price: 139.99,
        salePrice: 109.99,
        isOnSale: true,
        stockQuantity: 31,
        categoryId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Musculation supplémentaire (categoryId: 2)
      {
        name: 'Banc de Musculation Ajustable',
        description: 'Banc de musculation inclinable et déclinable, structure robuste jusqu\'à 200kg. Rembourrage haute densité et pieds antidérapants.',
        price: 249.99,
        salePrice: 199.99,
        isOnSale: true,
        stockQuantity: 12,
        categoryId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Set de Disques Olympiques 100kg',
        description: 'Set complet de disques olympiques en fonte : 2x25kg, 2x20kg, 2x15kg, 2x10kg, 2x5kg. Diamètre standard 50mm.',
        price: 399.99,
        isOnSale: false,
        stockQuantity: 8,
        categoryId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Élastiques de Résistance Set',
        description: 'Kit de 5 élastiques de résistance avec poignées, ancrage de porte et guide d\'exercices. Résistance de 10 à 50 lbs par élastique.',
        price: 39.99,
        salePrice: 29.99,
        isOnSale: true,
        stockQuantity: 55,
        categoryId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Yoga & Pilates supplémentaire (categoryId: 3)
      {
        name: 'Ballon de Pilates 65cm',
        description: 'Ballon de gym anti-éclatement avec pompe incluse. Surface antidérapante et résistance jusqu\'à 300kg. Parfait pour le pilates et la rééducation.',
        price: 34.99,
        salePrice: 24.99,
        isOnSale: true,
        stockQuantity: 42,
        categoryId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Roue de Yoga Dharma',
        description: 'Roue de yoga en bois naturel avec rembourrage TPE. Diamètre 32cm, parfaite pour les étirements du dos et l\'ouverture du cœur.',
        price: 89.99,
        isOnSale: false,
        stockQuantity: 16,
        categoryId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Électronique Sport supplémentaire (categoryId: 4)
      {
        name: 'Ceinture Cardiofréquencemètre',
        description: 'Ceinture thoracique Bluetooth et ANT+ pour mesure précise de la fréquence cardiaque. Compatible avec toutes les montres et apps.',
        price: 59.99,
        salePrice: 44.99,
        isOnSale: true,
        stockQuantity: 28,
        categoryId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Balance Connectée Intelligente',
        description: 'Balance intelligente avec analyse corporelle complète : poids, IMC, masse graisseuse, masse musculaire. App mobile incluse.',
        price: 79.99,
        salePrice: 59.99,
        isOnSale: true,
        stockQuantity: 24,
        categoryId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Accessoires supplémentaires (categoryId: 5)
      {
        name: 'Serviette Microfibre Sport',
        description: 'Serviette ultra-absorbante en microfibre, séchage rapide et compacte. Dimensions 80x40cm avec pochette de transport.',
        price: 16.99,
        salePrice: 12.99,
        isOnSale: true,
        stockQuantity: 95,
        categoryId: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Gants d\'Entraînement Cuir',
        description: 'Gants de musculation en cuir véritable avec rembourrage palm et fermeture velcro. Protection optimale et grip renforcé.',
        price: 29.99,
        isOnSale: false,
        stockQuantity: 47,
        categoryId: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Nutrition supplémentaire (categoryId: 6)
      {
        name: 'Créatine Monohydrate 500g',
        description: 'Créatine monohydrate pure micronisée, sans goût. Améliore la force et la puissance musculaire. Qualité pharmaceutique.',
        price: 24.99,
        salePrice: 19.99,
        isOnSale: true,
        stockQuantity: 67,
        categoryId: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Shaker Protéine 700ml',
        description: 'Shaker avec boule de mélange et compartiment à poudre intégré. Sans BPA, gradué et couvercle étanche. Design ergonomique.',
        price: 12.99,
        isOnSale: false,
        stockQuantity: 123,
        categoryId: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Cardio supplémentaire (categoryId: 7)
      {
        name: 'Tapis de Course Électrique',
        description: 'Tapis de course pliable avec moteur 2.5HP, vitesse 1-16 km/h, inclinaison électrique et programmes d\'entraînement intégrés.',
        price: 1299.99,
        salePrice: 999.99,
        isOnSale: true,
        stockQuantity: 5,
        categoryId: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Insertion d'utilisateurs de test
    await queryInterface.bulkInsert('Users', [
      {
        firstName: 'Admin',
        lastName: 'MambaFit',
        email: 'admin@mambafit.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIfy', // password123
        role: 'ROLE_ADMIN',
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Alexandre',
        lastName: 'Martin',
        email: 'alexandre.martin@mambafit.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIfy', // password123
        role: 'ROLE_ADMIN',
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Sarah',
        lastName: 'Dubois',
        email: 'sarah.dubois@mambafit.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIfy', // password123
        role: 'ROLE_STORE_KEEPER',
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Thomas',
        lastName: 'Leroy',
        email: 'thomas.leroy@mambafit.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIfy', // password123
        role: 'ROLE_ADMIN',
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Client',
        lastName: 'Test',
        email: 'client@test.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIfy', // password123
        role: 'ROLE_USER',
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    console.log('✅ Données MambaFit insérées avec succès !');
    console.log('📦 8 catégories sportives créées');
    console.log('🏃‍♂️ 33 produits sportifs ajoutés');
    console.log('👥 5 utilisateurs de test créés');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Products', null, {});
    await queryInterface.bulkDelete('Categories', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};

