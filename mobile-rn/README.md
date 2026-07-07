# C'PRO — React Native (Expo)

Application mobile React Native pour les micro-entrepreneurs informels béninois.

## Architecture

```
mobile-rn/
├── app/                    # Expo Router (file-based routing)
│   ├── (auth)/             # Login, OTP, Register
│   └── (tabs)/             # Dashboard, Journal, Documents, Bons Plans, Académie
├── src/
│   ├── core/               # Services fondamentaux
│   │   ├── api/            # Axios client + JWT interceptor
│   │   ├── auth/           # Cognito authentication
│   │   ├── database/       # Expo SQLite (offline-first)
│   │   ├── sync/           # Sync queue → DynamoDB
│   │   └── notifications/  # Push + local notifications
│   ├── features/           # Features par module
│   ├── shared/
│   │   ├── components/     # UI réutilisable (Button, Card, Input)
│   │   ├── hooks/          # Zustand stores (auth, transactions, profile)
│   │   ├── utils/          # FinancialEngine, PrevisionEngine, data
│   │   └── theme/          # Design system Material 3
│   └── types/              # TypeScript types
├── .env                    # Variables d'environnement
└── app.json                # Expo config
```

## Stack

- **Framework** : Expo SDK 54 + React Native 0.81
- **Language** : TypeScript 5.9
- **State** : Zustand
- **Database** : Expo SQLite (offline-first)
- **Navigation** : Expo Router (file-based)
- **Auth** : AWS Cognito (SDK v3)
- **HTTP** : Axios + JWT interceptor
- **Charts** : react-native-chart-kit
- **Notifications** : Expo Notifications

## Setup

```bash
cd mobile-rn
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Remplir avec les valeurs depuis outputs.json

# Lancer en dev
npx expo start

# Build APK
npx expo run:android --variant release
# OU avec EAS Build
eas build --platform android --profile preview
```

## Backend

Le backend AWS (Lambda + DynamoDB + Cognito + S3) est **inchangé**. 
L'app React Native appelle les mêmes endpoints API que la version Flutter.

## Migration depuis Flutter

| Flutter | → | React Native |
|---------|---|--------------|
| Riverpod | → | Zustand |
| Drift (SQLite) | → | Expo SQLite |
| GoRouter | → | Expo Router |
| Dio | → | Axios |
| fl_chart | → | react-native-chart-kit |
| flutter_local_notifications | → | expo-notifications |
| flutter_secure_storage | → | expo-secure-store |

*C'PRO Beta v1.0 — React Native — Avril 2026*
