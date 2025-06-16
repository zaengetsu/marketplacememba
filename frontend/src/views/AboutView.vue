<template>
  <div class="about-view min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-orange-500 to-red-600 text-white">
      <div class="container mx-auto px-4 py-16">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-4">MambaFit</h1>
          <p class="text-xl md:text-2xl mb-8">Votre partenaire pour une vie active et saine</p>
          <div class="flex justify-center">
            <div class="w-24 h-1 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-16">
      <!-- Mission Section -->
      <div class="mb-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Notre Mission</h2>
          <p class="text-lg text-gray-600 max-w-3xl mx-auto">
            Chez MambaFit, nous croyons que chacun mérite d'avoir accès aux meilleurs équipements sportifs 
            pour atteindre ses objectifs de fitness et de bien-être. Notre mission est de démocratiser 
            le sport en rendant les équipements de qualité accessibles à tous.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">🎯</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Excellence</h3>
            <p class="text-gray-600">
              Nous sélectionnons uniquement les meilleurs produits pour garantir 
              votre satisfaction et vos performances.
            </p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">🤝</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Accessibilité</h3>
            <p class="text-gray-600">
              Des prix justes et des promotions régulières pour rendre le sport 
              accessible à tous les budgets.
            </p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">💪</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Motivation</h3>
            <p class="text-gray-600">
              Nous vous accompagnons dans votre parcours fitness avec des conseils 
              et un support personnalisé.
            </p>
          </div>
        </div>
      </div>

      <!-- Story Section -->
      <div class="mb-16">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-6">Notre Histoire</h2>
            <div class="space-y-4 text-gray-600">
              <p>
                MambaFit est né en 2020 de la passion de trois amis sportifs qui ont constaté 
                le manque d'accessibilité aux équipements de sport de qualité en France.
              </p>
              <p>
                Inspirés par l'esprit "Mamba" - cette mentalité de dépassement de soi popularisée 
                par Kobe Bryant - nous avons décidé de créer une plateforme qui permettrait à 
                chacun d'accéder aux meilleurs équipements pour atteindre ses objectifs.
              </p>
              <p>
                Aujourd'hui, nous sommes fiers de servir plus de 50 000 clients satisfaits 
                et de proposer plus de 1 000 produits de qualité professionnelle.
              </p>
            </div>
          </div>
          
          <div class="relative">
            <img
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop"
              alt="Notre équipe"
              class="rounded-lg shadow-lg"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-lg"></div>
          </div>
        </div>
      </div>

      <!-- Values Section -->
      <div class="mb-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Nos Valeurs</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <div class="text-3xl mb-4">🏆</div>
            <h3 class="font-semibold text-gray-900 mb-2">Qualité</h3>
            <p class="text-sm text-gray-600">
              Produits testés et approuvés par des professionnels
            </p>
          </div>
          
          <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <div class="text-3xl mb-4">⚡</div>
            <h3 class="font-semibold text-gray-900 mb-2">Rapidité</h3>
            <p class="text-sm text-gray-600">
              Livraison express et service client réactif
            </p>
          </div>
          
          <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <div class="text-3xl mb-4">🌱</div>
            <h3 class="font-semibold text-gray-900 mb-2">Durabilité</h3>
            <p class="text-sm text-gray-600">
              Engagement pour des produits éco-responsables
            </p>
          </div>
          
          <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <div class="text-3xl mb-4">❤️</div>
            <h3 class="font-semibold text-gray-900 mb-2">Passion</h3>
            <p class="text-sm text-gray-600">
              Une équipe passionnée de sport et de bien-être
            </p>
          </div>
        </div>
      </div>

      <!-- Team Section -->
      <div class="mb-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Notre Équipe</h2>
          <p class="text-lg text-gray-600">
            Rencontrez les passionnés qui font vivre MambaFit au quotidien
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="relative mb-4">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face"
                alt="Alexandre Martin"
                class="w-32 h-32 rounded-full mx-auto object-cover"
              />
              <div class="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-1/2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm">
                👨‍💼
              </div>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-1">Alexandre Martin</h3>
            <p class="text-orange-600 font-medium mb-2">CEO & Fondateur</p>
            <p class="text-sm text-gray-600">
              Ancien athlète de haut niveau, Alexandre a créé MambaFit pour partager 
              sa passion du sport et rendre l'excellence accessible à tous.
            </p>
          </div>
          
          <div class="text-center">
            <div class="relative mb-4">
              <img
                src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face"
                alt="Sarah Dubois"
                class="w-32 h-32 rounded-full mx-auto object-cover"
              />
              <div class="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-1/2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm">
                🎨
              </div>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-1">Sarah Dubois</h3>
            <p class="text-orange-600 font-medium mb-2">Directrice Marketing</p>
            <p class="text-sm text-gray-600">
              Experte en marketing digital et passionnée de fitness, Sarah développe 
              notre image de marque et nos campagnes créatives.
            </p>
          </div>
          
          <div class="text-center">
            <div class="relative mb-4">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
                alt="Thomas Leroy"
                class="w-32 h-32 rounded-full mx-auto object-cover"
              />
              <div class="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-1/2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm">
                💻
              </div>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-1">Thomas Leroy</h3>
            <p class="text-orange-600 font-medium mb-2">CTO</p>
            <p class="text-sm text-gray-600">
              Développeur full-stack et amateur de crossfit, Thomas assure le 
              développement technique de notre plateforme e-commerce.
            </p>
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="mb-16">
        <div class="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg p-8 text-white">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div class="text-3xl md:text-4xl font-bold mb-2">50K+</div>
              <div class="text-sm md:text-base">Clients satisfaits</div>
            </div>
            <div>
              <div class="text-3xl md:text-4xl font-bold mb-2">1000+</div>
              <div class="text-sm md:text-base">Produits disponibles</div>
            </div>
            <div>
              <div class="text-3xl md:text-4xl font-bold mb-2">98%</div>
              <div class="text-sm md:text-base">Taux de satisfaction</div>
            </div>
            <div>
              <div class="text-3xl md:text-4xl font-bold mb-2">24h</div>
              <div class="text-sm md:text-base">Livraison express</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Section -->
      <div class="mb-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Contactez-nous</h2>
          <p class="text-lg text-gray-600">
            Une question ? Notre équipe est là pour vous aider
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">📧</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Email</h3>
            <p class="text-gray-600 mb-2">contact@mambafit.fr</p>
            <p class="text-sm text-gray-500">Réponse sous 24h</p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">📞</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Téléphone</h3>
            <p class="text-gray-600 mb-2">01 23 45 67 89</p>
            <p class="text-sm text-gray-500">Lun-Ven 9h-18h</p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">📍</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Adresse</h3>
            <p class="text-gray-600 mb-2">123 Rue du Sport<br>75001 Paris</p>
            <p class="text-sm text-gray-500">Showroom sur RDV</p>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="text-center">
        <div class="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h3 class="text-2xl font-bold text-gray-900 mb-4">
            Prêt à commencer votre transformation ?
          </h3>
          <p class="text-gray-600 mb-6">
            Découvrez notre sélection d'équipements et commencez votre parcours fitness dès aujourd'hui
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link
              to="/products"
              class="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all font-medium"
            >
              Découvrir nos produits
            </router-link>
            <router-link
              to="/deals"
              class="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Voir les offres
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No specific logic needed for this static about page
</script>

<style scoped>
/* Additional styles if needed */
</style> 