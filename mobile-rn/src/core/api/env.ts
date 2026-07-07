// C'PRO — Configuration API
// Pointe vers le backend-v2 (NestJS + JWT)
// En dev: http://localhost:3000
// Sur device physique: remplacer par l'IP locale ex: http://192.168.1.X:3000
// En prod: https://api.cpro.enarilab.xyz
export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000',
} as const;
