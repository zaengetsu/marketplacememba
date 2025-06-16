<template>
  <footer class="bg-gray-900 text-white mt-16">
    <div class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- À propos -->
        <div>
          <h3 class="text-lg font-semibold mb-4">À propos</h3>
          <p class="text-gray-400 text-sm">
            Notre plateforme e-commerce offre une expérience d'achat moderne et sécurisée, 
            conforme aux réglementations RGPD.
          </p>
        </div>

        <!-- Liens rapides -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Liens rapides</h3>
          <ul class="space-y-2 text-sm">
            <li><router-link to="/" class="text-gray-400 hover:text-white transition-colors">Accueil</router-link></li>
            <li><router-link to="/products" class="text-gray-400 hover:text-white transition-colors">Produits</router-link></li>
            <li><router-link to="/cart" class="text-gray-400 hover:text-white transition-colors">Panier</router-link></li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Support</h3>
          <ul class="space-y-2 text-sm">
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Contact</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Livraison</a></li>
          </ul>
        </div>

        <!-- Légal -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Légal</h3>
          <ul class="space-y-2 text-sm">
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">CGV</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Politique de confidentialité</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">RGPD</a></li>
          </ul>
        </div>
      </div>

      <hr class="border-gray-800 my-8">

      <div class="flex flex-col md:flex-row justify-between items-center">
        <p class="text-gray-400 text-sm">
          © 2024 E-Commerce Platform. Tous droits réservés.
        </p>
        <div class="flex space-x-4 mt-4 md:mt-0">
          <span class="text-gray-400 text-sm">Paiement sécurisé avec Stripe</span>
        </div>
      </div>
    </div>
  </footer>
</template> 