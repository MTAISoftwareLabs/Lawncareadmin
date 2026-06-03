import { apiRequest } from "./queryClient";

export { queryClient, apiRequest } from "./queryClient";

export const api = {
  auth: {
    signup: (data: any) => apiRequest("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data: any) => apiRequest("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
    logout: () => apiRequest("/api/auth/logout", { method: "POST" }),
    me: () => apiRequest("/api/auth/me"),
    quickRegister: (phone: string) => apiRequest("/api/auth/quick-register", { method: "POST", body: JSON.stringify({ phone }) }),
  },
  products: {
    getAll: (params?: { category?: string; featured?: boolean; minPrice?: number; maxPrice?: number; minRating?: number; sortBy?: string }) => {
      const query = new URLSearchParams();
      if (params?.category) query.set("category", params.category);
      if (params?.featured) query.set("featured", "true");
      if (params?.minPrice !== undefined) query.set("minPrice", params.minPrice.toString());
      if (params?.maxPrice !== undefined) query.set("maxPrice", params.maxPrice.toString());
      if (params?.minRating !== undefined) query.set("minRating", params.minRating.toString());
      if (params?.sortBy) query.set("sortBy", params.sortBy);
      return apiRequest(`/api/products?${query}`);
    },
    getById: (id: number) => apiRequest(`/api/products/${id}`),
    search: (query: string) => apiRequest(`/api/products/search?q=${encodeURIComponent(query)}`),
    getPopular: (limit: number = 8) => apiRequest(`/api/products/popular?limit=${limit}`),
  },
  cart: {
    get: () => apiRequest("/api/cart"),
    add: (productId: number, quantity: number = 1) => 
      apiRequest("/api/cart", { method: "POST", body: JSON.stringify({ productId, quantity }) }),
    update: (id: number, quantity: number) => 
      apiRequest(`/api/cart/${id}`, { method: "PUT", body: JSON.stringify({ quantity }) }),
    remove: (id: number) => apiRequest(`/api/cart/${id}`, { method: "DELETE" }),
  },
  orders: {
    create: (data: any) => apiRequest("/api/orders", { method: "POST", body: JSON.stringify(data) }),
    createGuest: (data: any) => apiRequest("/api/orders/guest", { method: "POST", body: JSON.stringify(data) }),
    getAll: () => apiRequest("/api/orders"),
    getById: (id: number) => apiRequest(`/api/orders/${id}`),
  },
  payment: {
    createOrder: (amount: number) => apiRequest("/api/payment/create-order", { method: "POST", body: JSON.stringify({ amount }) }),
    verify: (orderId: number) => apiRequest("/api/payment/verify", { method: "POST", body: JSON.stringify({ orderId }) }),
  },
  addresses: {
    getAll: () => apiRequest("/api/user/addresses"),
    create: (data: any) => apiRequest("/api/user/addresses", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => apiRequest(`/api/user/addresses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => apiRequest(`/api/user/addresses/${id}`, { method: "DELETE" }),
  },
  integrations: {
    get: (provider: string) => apiRequest(`/api/integrations/${provider}`),
  },
  wishlist: {
    getAll: () => apiRequest("/api/wishlist"),
    add: (productId: number) => apiRequest("/api/wishlist", { method: "POST", body: JSON.stringify({ productId }) }),
    remove: (id: number) => apiRequest(`/api/wishlist/${id}`, { method: "DELETE" }),
  },
  reviews: {
    getByProduct: (productId: number) => apiRequest(`/api/products/${productId}/reviews`),
    create: (productId: number, data: any) => apiRequest(`/api/products/${productId}/reviews`, { method: "POST", body: JSON.stringify(data) }),
  },
  returns: {
    getAll: () => apiRequest("/api/returns"),
    create: (data: any) => apiRequest("/api/returns", { method: "POST", body: JSON.stringify(data) }),
  },
  promoCodes: {
    validate: (code: string, amount: number) => apiRequest("/api/promo-codes/validate", { method: "POST", body: JSON.stringify({ code, amount }) }),
  },
  banners: {
    getAll: () => apiRequest("/api/banners"),
  },
  recentlyViewed: {
    getAll: () => {
      const sessionId = localStorage.getItem("sessionId") || "";
      return apiRequest(`/api/products/recently-viewed?sessionId=${sessionId}&limit=8`);
    },
  },
  faqs: {
    getAll: (category?: string) => {
      const query = category ? `?category=${encodeURIComponent(category)}` : '';
      return apiRequest(`/api/faqs${query}`);
    },
  },
  pages: {
    getBySlug: (slug: string) => apiRequest(`/api/pages/${slug}`),
  },
  flashSales: {
    getActive: () => apiRequest("/api/flash-sales/active"),
  },
  blog: {
    getAll: () => apiRequest("/api/blog"),
    getBySlug: (slug: string) => apiRequest(`/api/blog/${slug}`),
  },
  admin: {
    products: {
      getAll: () => apiRequest("/api/admin/products"),
      getLowStock: (threshold: number = 10) => apiRequest(`/api/admin/products/low-stock?threshold=${threshold}`),
      create: (data: any) => apiRequest("/api/admin/products", { method: "POST", body: JSON.stringify(data) }),
      update: (id: number, data: any) => apiRequest(`/api/admin/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
      delete: (id: number) => apiRequest(`/api/admin/products/${id}`, { method: "DELETE" }),
    },
    categories: {
      getAll: () => apiRequest("/api/admin/categories"),
      create: (data: any) => apiRequest("/api/admin/categories", { method: "POST", body: JSON.stringify(data) }),
      update: (id: number, data: any) => apiRequest(`/api/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
      delete: (id: number) => apiRequest(`/api/admin/categories/${id}`, { method: "DELETE" }),
    },
    orders: {
      getAll: () => apiRequest("/api/admin/orders"),
      updateStatus: (id: number, status: string) => apiRequest(`/api/admin/orders/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),
    },
    users: {
      getAll: () => apiRequest("/api/admin/users"),
      updateRole: (id: number, role: string) => apiRequest(`/api/admin/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) }),
      delete: (id: number) => apiRequest(`/api/admin/users/${id}`, { method: "DELETE" }),
    },
    returns: {
      getAll: () => apiRequest("/api/admin/returns"),
      update: (id: number, data: any) => apiRequest(`/api/admin/returns/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    },
    promoCodes: {
      getAll: () => apiRequest("/api/admin/promo-codes"),
      create: (data: any) => apiRequest("/api/admin/promo-codes", { method: "POST", body: JSON.stringify(data) }),
      delete: (id: number) => apiRequest(`/api/admin/promo-codes/${id}`, { method: "DELETE" }),
    },
    banners: {
      getAll: () => apiRequest("/api/admin/banners"),
      create: (data: any) => apiRequest("/api/admin/banners", { method: "POST", body: JSON.stringify(data) }),
      update: (id: number, data: any) => apiRequest(`/api/admin/banners/${id}`, { method: "PUT", body: JSON.stringify(data) }),
      delete: (id: number) => apiRequest(`/api/admin/banners/${id}`, { method: "DELETE" }),
    },
    settings: {
      getLandingPage: () => apiRequest("/api/settings/landing-page"),
      updateLandingPage: (data: any) => apiRequest("/api/admin/settings/landing-page", { method: "PUT", body: JSON.stringify(data) }),
    },
    integrations: {
      getAll: () => apiRequest("/api/admin/integrations"),
      save: (data: any) => apiRequest("/api/admin/integrations", { method: "POST", body: JSON.stringify(data) }),
    },
    faqs: {
      getAll: () => apiRequest("/api/admin/faqs"),
      create: (data: any) => apiRequest("/api/admin/faqs", { method: "POST", body: JSON.stringify(data) }),
      update: (id: number, data: any) => apiRequest(`/api/admin/faqs/${id}`, { method: "PUT", body: JSON.stringify(data) }),
      delete: (id: number) => apiRequest(`/api/admin/faqs/${id}`, { method: "DELETE" }),
    },
    pages: {
      getAll: () => apiRequest("/api/admin/pages"),
      create: (data: any) => apiRequest("/api/admin/pages", { method: "POST", body: JSON.stringify(data) }),
      update: (id: number, data: any) => apiRequest(`/api/admin/pages/${id}`, { method: "PUT", body: JSON.stringify(data) }),
      delete: (id: number) => apiRequest(`/api/admin/pages/${id}`, { method: "DELETE" }),
    },
    analytics: {
      getOverview: () => apiRequest("/api/admin/analytics/overview"),
      getSalesTrends: () => apiRequest("/api/admin/analytics/sales-trends"),
      getTopProducts: () => apiRequest("/api/admin/analytics/top-products"),
      getOrderStatus: () => apiRequest("/api/admin/analytics/order-status"),
      getCategoryPerformance: () => apiRequest("/api/admin/analytics/category-performance"),
    },
    flashSales: {
      getAll: () => apiRequest("/api/admin/flash-sales"),
      create: (data: any) => apiRequest("/api/admin/flash-sales", { method: "POST", body: JSON.stringify(data) }),
      update: (id: number, data: any) => apiRequest(`/api/admin/flash-sales/${id}`, { method: "PUT", body: JSON.stringify(data) }),
      delete: (id: number) => apiRequest(`/api/admin/flash-sales/${id}`, { method: "DELETE" }),
    },
    blog: {
      getAll: () => apiRequest("/api/admin/blog"),
      create: (data: any) => apiRequest("/api/admin/blog", { method: "POST", body: JSON.stringify(data) }),
      update: (id: number, data: any) => apiRequest(`/api/admin/blog/${id}`, { method: "PUT", body: JSON.stringify(data) }),
      delete: (id: number) => apiRequest(`/api/admin/blog/${id}`, { method: "DELETE" }),
    },
  },
};
