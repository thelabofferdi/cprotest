import { create } from 'zustand';
import { profileDAO } from '../../core/database/db';
import { api } from '../../core/api/apiClient';
import type { ModeFinancement, UserProfile } from '../../types';

type BackendProfile = {
  userId: string;
  nom: string;
  metierSlug: string;
  lieu: string;
  capitalDepart: number;
  modeFinancement: 'PROPRE' | 'EMPRUNT' | 'MIXTE' | string;
  devise?: 'XOF';
  photoUrl?: string | null;
  logoUrl?: string | null;
  createdAt: string;
};

type ProfileIdentity = Pick<UserProfile, 'photoUrl' | 'logoUrl' | 'logoPreset'>;

interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  loadProfile: (userId: string) => Promise<void>;
  saveProfile: (profile: UserProfile) => Promise<void>;
  updateIdentity: (identity: Partial<ProfileIdentity>) => Promise<void>;
}

function toBackendMode(mode: ModeFinancement) {
  if (mode === 'fonds_propres') return 'PROPRE';
  if (mode === 'emprunt') return 'EMPRUNT';
  return 'MIXTE';
}

function fromBackendMode(mode: string): ModeFinancement {
  if (mode === 'PROPRE') return 'fonds_propres';
  if (mode === 'EMPRUNT') return 'emprunt';
  return 'mixte';
}

function mapBackendProfile(profile: BackendProfile): UserProfile {
  return {
    userId: profile.userId,
    nom: profile.nom,
    metier: profile.metierSlug as UserProfile['metier'],
    lieu: profile.lieu,
    capitalDepart: profile.capitalDepart,
    modeFinancement: fromBackendMode(profile.modeFinancement),
    devise: profile.devise ?? 'XOF',
    photoUrl: profile.photoUrl ?? null,
    logoUrl: profile.logoUrl ?? null,
    createdAt: profile.createdAt,
  };
}

function mapProfilePayload(profile: UserProfile) {
  return {
    nom: profile.nom,
    metierSlug: profile.metier,
    lieu: profile.lieu,
    capitalDepart: profile.capitalDepart,
    modeFinancement: toBackendMode(profile.modeFinancement),
    devise: profile.devise,
  };
}

function mergeIdentity(profile: UserProfile, previous?: UserProfile | null): UserProfile {
  return {
    ...profile,
    photoUrl: profile.photoUrl ?? previous?.photoUrl ?? null,
    logoUrl: profile.logoUrl ?? previous?.logoUrl ?? null,
    logoPreset: profile.logoPreset ?? previous?.logoPreset ?? null,
  };
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  loading: false,
  error: null,

  loadProfile: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const localProfile = await profileDAO.get(userId).catch(() => null);
      const res = await api.getProfile();
      const backendProfile = mergeIdentity(mapBackendProfile(res.data as BackendProfile), localProfile as UserProfile | null);
      await profileDAO.upsert(backendProfile as any);
      set({ profile: backendProfile, loading: false });
    } catch (err) {
      try {
        const result = await profileDAO.get(userId);
        if (result) {
          set({ profile: result as UserProfile, error: String(err), loading: false });
          return;
        }
      } catch {
        // Keep the original backend error as the actionable failure.
      }

      set({ profile: null, error: String(err), loading: false });
    }
  },

  saveProfile: async (profile: UserProfile) => {
    set({ loading: true, error: null });
    try {
      const profileWithIdentity = mergeIdentity(profile, get().profile);
      await api.upsertProfile(mapProfilePayload(profile));
      await profileDAO.upsert(profileWithIdentity as any);
      set({ profile: profileWithIdentity, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
      throw err;
    }
  },

  updateIdentity: async (identity: Partial<ProfileIdentity>) => {
    const current = get().profile;
    if (!current) throw new Error('Profil introuvable');

    const next: UserProfile = {
      ...current,
      ...identity,
    };

    await profileDAO.upsert(next as any);
    set({ profile: next });
  },
}));
