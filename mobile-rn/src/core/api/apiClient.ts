// C'PRO — API Client (backend-v2)
// Tous les endpoints correspondent au backend NestJS + JWT
import axios from 'axios';
import * as SecureStore from '../../shared/utils/secureStore';
import { ENV } from './env';

const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Interceptor Request — injecter le JWT ─────────────────────────────────
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('cpro_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Interceptor Response — gérer les 401 (token expiré) ──────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token!);
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('cpro_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        // TODO: implémenter l'endpoint /auth/refresh côté backend
        // Pour l'instant, si 401 → forcer logout
        throw new Error('Token expired');
      } catch (err) {
        processQueue(err, null);
        // Supprimer les tokens
        await SecureStore.deleteItemAsync('cpro_access_token');
        await SecureStore.deleteItemAsync('cpro_refresh_token');
        await SecureStore.deleteItemAsync('cpro_user_id');
        await SecureStore.deleteItemAsync('cpro_user_email');
        console.error('[API] Session expirée - veuillez vous reconnecter');
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── API Methods ────────────────────────────────────────────────────────────

export const api = {

  // ── Auth ────────────────────────────────────────────────────────────────
  getMe: async () => {
    return apiClient.get('/auth/me');
  },

  // ── Profile ─────────────────────────────────────────────────────────────
  // GET /profile → retourne le profil de l'utilisateur connecté
  getProfile: async () => {
    return apiClient.get('/profile');
  },
  // PUT /profile/upsert → créer ou mettre à jour le profil
  upsertProfile: async (profile: unknown) => {
    return apiClient.put('/profile/upsert', profile);
  },
  // PUT /profile → mise à jour partielle
  updateProfile: async (profile: unknown) => {
    return apiClient.put('/profile', profile);
  },

  // ── Dashboard ───────────────────────────────────────────────────────────
  // GET /dashboard?period=month → indicateurs financiers calculés côté serveur
  getDashboard: async (period: 'month' | 'week' | 'year' = 'month') => {
    return apiClient.get(`/dashboard?period=${period}`);
  },

  // ── Transactions ────────────────────────────────────────────────────────
  getTransactions: async () => {
    return apiClient.get('/transactions');
  },
  // POST /transactions/sync → synchroniser les transactions locales
  syncTransactions: async (transactions: unknown[]) => {
    return apiClient.post('/transactions/sync', { transactions });
  },

  // ── Équipements ─────────────────────────────────────────────────────────
  getEquipments: async () => {
    return apiClient.get('/equipments');
  },
  createEquipment: async (equip: unknown) => {
    return apiClient.post('/equipments', equip);
  },

  // ── Clients ─────────────────────────────────────────────────────────────
  getClients: async () => {
    return apiClient.get('/clients');
  },
  createClient: async (client: unknown) => {
    return apiClient.post('/clients', client);
  },

  // ── Configuration (métiers, amortissements) ─────────────────────────────
  // GET /config/metiers → liste des métiers avec catégories
  getMetiers: async () => {
    return apiClient.get('/config/metiers');
  },
  // GET /config/metiers/:slug → métier spécifique
  getMetierBySlug: async (slug: string) => {
    return apiClient.get(`/config/metiers/${slug}`);
  },
  // GET /config/my-dashboard → segmentation profil, options et plan recommandé
  getMyDashboardConfig: async () => {
    return apiClient.get('/config/my-dashboard');
  },
  // GET /config/metier/:slug → configuration dashboard pour un métier
  getMetierDashboardConfig: async (slug: string) => {
    return apiClient.get(`/config/metier/${slug}`);
  },
  // GET /config/metiers-par-profil → configurations dashboard groupées par profil
  getMetiersDashboardConfigs: async () => {
    return apiClient.get('/config/metiers-par-profil');
  },
  // GET /config/subscription-plans → plans C'PRO
  getSubscriptionPlans: async () => {
    return apiClient.get('/config/subscription-plans');
  },
  // GET /config/amortissements → types d'amortissements
  getAmortissements: async () => {
    return apiClient.get('/config/amortissements');
  },

  // ── Académie ────────────────────────────────────────────────────────────
  // GET /academy/glossaire → liste des termes financiers
  getGlossaire: async () => {
    return apiClient.get('/academy/glossaire');
  },
  // GET /academy/fiches → fiches pédagogiques
  getFichesPedagogiques: async () => {
    return apiClient.get('/academy/fiches');
  },

  // ── Financement (IMF) ───────────────────────────────────────────────────
  // GET /financing/imf → institutions de microfinance du Bénin
  getIMFs: async () => {
    return apiClient.get('/financing/imf');
  },

  // ── Assistance expert ─────────────────────────────────────────────────
  createExpertRequest: async (payload: {
    reason: string;
    details?: string;
    context?: Record<string, unknown>;
  }) => {
    return apiClient.post('/expert-requests', payload);
  },
  getExpertRequests: async () => {
    return apiClient.get('/expert-requests');
  },

  // ── Notifications ───────────────────────────────────────────────────────
  getNotifications: async () => {
    return apiClient.get('/notifications');
  },
  getUnreadCount: async () => {
    return apiClient.get('/notifications/unread-count');
  },
  markAsRead: async (id: string) => {
    return apiClient.put(`/notifications/${id}/read`);
  },
  registerPushToken: async (token: string, platform: string, deviceId?: string) => {
    return apiClient.post('/notifications/register-token', { token, platform, deviceId });
  },

  // ── Upload ──────────────────────────────────────────────────────────────
  uploadProfilePhoto: async (formData: FormData) => {
    return apiClient.post('/upload/profile-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadLogo: async (formData: FormData) => {
    return apiClient.post('/upload/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default apiClient;
