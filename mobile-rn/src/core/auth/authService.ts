// C'PRO — Auth Service (backend-v2 / JWT)
// Remplace l'ancienne intégration AWS Cognito
import axios from 'axios';
import * as SecureStore from '../../shared/utils/secureStore';
import { ENV } from '../api/env';

const BASE = ENV.API_BASE_URL;

const AUTH_KEYS = {
  ACCESS_TOKEN: 'cpro_access_token',
  REFRESH_TOKEN: 'cpro_refresh_token',
  USER_ID: 'cpro_user_id',
  USER_EMAIL: 'cpro_user_email',
  EMAIL_VERIFIED: 'cpro_email_verified',
} as const;

// ─── Register ──────────────────────────────────────────────────────────────
// POST /auth/register → { user, accessToken, refreshToken, message }
// Le backend envoie automatiquement un OTP par email
export async function signUp(email: string, password: string) {
  const res = await axios.post(`${BASE}/auth/register`, { email, password });
  const { user, accessToken, refreshToken } = res.data;

  // Stocker les tokens immédiatement
  await SecureStore.setItemAsync(AUTH_KEYS.ACCESS_TOKEN, accessToken);
  await SecureStore.setItemAsync(AUTH_KEYS.REFRESH_TOKEN, refreshToken);
  await SecureStore.setItemAsync(AUTH_KEYS.USER_ID, user.id);
  await SecureStore.setItemAsync(AUTH_KEYS.USER_EMAIL, user.email);
  await SecureStore.setItemAsync(AUTH_KEYS.EMAIL_VERIFIED, 'false');

  return { userId: user.id, email: user.email };
}

// ─── Login ─────────────────────────────────────────────────────────────────
// POST /auth/login → { user, accessToken, refreshToken }
export async function signIn(email: string, password: string) {
  const res = await axios.post(`${BASE}/auth/login`, { email, password });
  const { user, accessToken, refreshToken } = res.data;

  await SecureStore.setItemAsync(AUTH_KEYS.ACCESS_TOKEN, accessToken);
  await SecureStore.setItemAsync(AUTH_KEYS.REFRESH_TOKEN, refreshToken);
  await SecureStore.setItemAsync(AUTH_KEYS.USER_ID, user.id);
  await SecureStore.setItemAsync(AUTH_KEYS.USER_EMAIL, user.email);
  await SecureStore.setItemAsync(
    AUTH_KEYS.EMAIL_VERIFIED,
    user.emailVerified ? 'true' : 'false'
  );

  return {
    accessToken,
    refreshToken,
    userId: user.id,
    email: user.email,
    emailVerified: user.emailVerified as boolean,
  };
}

// ─── OTP Verification ──────────────────────────────────────────────────────
// POST /auth/verify-otp → { verified: true, message }
export async function verifyOTP(email: string, code: string) {
  const res = await axios.post(`${BASE}/auth/verify-otp`, { email, code });
  if (res.data?.verified) {
    await SecureStore.setItemAsync(AUTH_KEYS.EMAIL_VERIFIED, 'true');
  }
  return res.data;
}

// ─── Send OTP ──────────────────────────────────────────────────────────────
// POST /auth/send-otp → { message }
export async function sendOTP(email: string) {
  const res = await axios.post(`${BASE}/auth/send-otp`, { email });
  return res.data;
}

// ─── Resend OTP ────────────────────────────────────────────────────────────
// POST /auth/resend-otp → { message }
export async function resendOTP(email: string) {
  const res = await axios.post(`${BASE}/auth/resend-otp`, { email });
  return res.data;
}

// ─── Sign Out ──────────────────────────────────────────────────────────────
export async function signOut() {
  await SecureStore.deleteItemAsync(AUTH_KEYS.ACCESS_TOKEN);
  await SecureStore.deleteItemAsync(AUTH_KEYS.REFRESH_TOKEN);
  await SecureStore.deleteItemAsync(AUTH_KEYS.USER_ID);
  await SecureStore.deleteItemAsync(AUTH_KEYS.USER_EMAIL);
  await SecureStore.deleteItemAsync(AUTH_KEYS.EMAIL_VERIFIED);
}

// ─── Helpers ───────────────────────────────────────────────────────────────
export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(AUTH_KEYS.ACCESS_TOKEN);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(AUTH_KEYS.REFRESH_TOKEN);
}

export async function getUserId(): Promise<string | null> {
  return SecureStore.getItemAsync(AUTH_KEYS.USER_ID);
}

export async function getUserEmail(): Promise<string | null> {
  return SecureStore.getItemAsync(AUTH_KEYS.USER_EMAIL);
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await SecureStore.getItemAsync(AUTH_KEYS.ACCESS_TOKEN);
  return !!token;
}

export async function isEmailVerified(): Promise<boolean> {
  const val = await SecureStore.getItemAsync(AUTH_KEYS.EMAIL_VERIFIED);
  return val === 'true';
}

// ─── Alias pour compatibilité (anciennement getIdToken) ───────────────────
export const getIdToken = getAccessToken;
