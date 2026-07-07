import { create } from 'zustand';
import { api } from '../../core/api/apiClient';
import type { ProfileDashboardConfig } from '../../types';
import { getFallbackDashboardConfig } from '../utils/segmentation';

interface ProfileConfigState {
  config: ProfileDashboardConfig | null;
  loading: boolean;
  error: string | null;
  source: 'backend-profile' | 'backend-metier' | 'fallback' | null;
  loadConfig: (metier?: string) => Promise<void>;
}

function isDashboardConfig(data: unknown): data is ProfileDashboardConfig {
  return Boolean(
    data &&
    typeof data === 'object' &&
    'economicUnit' in data &&
    'subscription' in data &&
    'metier' in data,
  );
}

export const useProfileConfigStore = create<ProfileConfigState>((set) => ({
  config: null,
  loading: false,
  error: null,
  source: null,

  loadConfig: async (metier?: string) => {
    set({ loading: true, error: null });
    try {
      const res = await api.getMyDashboardConfig();
      if (isDashboardConfig(res.data)) {
        set({ config: res.data, loading: false, source: 'backend-profile' });
        return;
      }

      throw new Error('Configuration dashboard invalide');
    } catch (profileErr) {
      if (metier) {
        try {
          const res = await api.getMetierDashboardConfig(metier);
          const data = res.data;
          if (isDashboardConfig(data)) {
            set({ config: data, loading: false, source: 'backend-metier' });
            return;
          }
        } catch {
          // Fallback below keeps the app usable offline or against an older API.
        }
      }

      const fallback = getFallbackDashboardConfig(metier);
      set({
        config: fallback,
        loading: false,
        error: String(profileErr),
        source: 'fallback',
      });
    }
  },
}));
