import { createRouter, createWebHistory, RouteLocationNormalized, NavigationGuardNext } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/privacy-policy",
      name: "privacy-policy",
      component: () => import("../views/PrivacyPolicyView.vue"),
    },
    {
      path: "/contact",
      name: "contact",
      component: () => import("../views/ContactView.vue"),
    },
    {
      path: "/faq",
      name: "faq",
      component: () => import("../views/FAQView.vue"),
    },
    {
      path: "/shipping",
      name: "shipping",
      component: () => import("../views/ShippingView.vue"),
    },
    {
      path: "/products",
      name: "products",
      component: () => import("../views/ProductsView.vue"),
    },
    {
      path: "/products/:id",
      name: "product-detail",
      component: () => import("../views/ProductDetailView.vue"),
    },
    {
      path: "/cart",
      name: "cart",
      component: () => import("../views/CartView.vue"),
    },
    {
      path: "/admin",
      name: "admin",
      component: () => import("../views/admin/AdminDashboard.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/products",
      name: "admin-products",
      component: () => import("../views/admin/AdminProductsView.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/products/new",
      name: "admin-product-create",
      component: () => import("../views/admin/AdminProductForm.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/products/:id/edit",
      name: "admin-product-edit",
      component: () => import("../views/admin/AdminProductForm.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/orders",
      name: "orders",
      component: () => import("../views/OrdersView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/orders/:id",
      name: "order-detail",
      component: () => import("../views/OrderDetailView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/order-confirmation/:id",
      name: "order-confirmation",
      component: () => import("../views/OrderConfirmationView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/invoices",
      name: "invoices",
      component: () => import("../views/InvoicesView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("../views/ProfileView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/favorites",
      name: "favorites",
      component: () => import("../views/FavoritesView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/categories",
      name: "categories",
      component: () => import("../views/CategoriesView.vue"),
    },
    {
      path: "/deals",
      name: "deals",
      component: () => import("../views/DealsView.vue"),
    },
    {
      path: "/about",
      name: "about",
      component: () => import("../views/AboutView.vue"),
    },
    {
      path: "/forgot-password",
      name: "ForgotPassword",
      component: () => import("@/views/ForgotPassword.vue"),
    },
    {
      path: "/reset-password/:token",
      name: "ResetPassword",
      component: () => import("@/views/ResetPassword.vue"),
    },
    {
      path: "/verify-email",
      name: "VerifyEmail",
      component: () => import("@/views/VerifyEmailView.vue"),
    },
    {
      path: "/admin/users",
      name: "admin-users",
      component: () => import("@/views/admin/AdminUsersView.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/users/new",
      name: "admin-user-create",
      component: () => import("@/views/admin/AdminUserForm.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/orders",
      name: "admin-orders",
      component: () => import("@/views/admin/AdminOrdersView.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/analytics",
      name: "admin-analytics",
      component: () => import("@/views/admin/AdminAnalyticsView.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/users",
      name: "admin-users",
      component: () => import("@/views/admin/AdminUsersView.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/users/new",
      name: "admin-user-create",
      component: () => import("@/views/admin/AdminUserForm.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/orders",
      name: "admin-orders",
      component: () => import("@/views/admin/AdminOrdersView.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/analytics",
      name: "admin-analytics",
      component: () => import("@/views/admin/AdminAnalyticsView.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
});

// Garde de navigation pour l'authentification
router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const authStore = useAuthStore();

  // Vérifier l'authentification si pas encore fait
  if (!authStore.user && localStorage.getItem("auth_token")) {
    try {
      await authStore.checkAuth();
    } catch (error) {
      console.warn("Erreur lors de la vérification d'auth:", error);
    }
  }

  // Vérifier si la route nécessite une authentification
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Rediriger vers la page d'accueil
    next("/");
    return;
  }

  // Vérifier si la route nécessite des privilèges admin
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    // Rediriger vers la page d'accueil
    next("/");
    return;
  }

  next();
});

export default router;
