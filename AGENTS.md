# C'PRO

- Stack: NestJS 11, TypeScript, Prisma 6, PostgreSQL/SQLite, React Native (Expo SDK 54), Zustand, AWS CDK (legacy), Flutter (legacy)
- Mobile-first accounting & business management platform for informal micro-entrepreneurs in Benin. Mid-migration from AWS Lambda+DynamoDB (old) to NestJS+PostgreSQL (backend-v2) and Flutter (mobile/) to React Native/Expo (mobile-rn).

## Commands

### backend-v2/
- build: `npm run build` (nest build)
- lint: `npm run lint` (eslint --fix)
- test: `npm run test` (jest)
- test:e2e: `npm run test:e2e`
- dev: `npm run start:dev` (nest start --watch)
- prisma:generate: `npm run prisma:generate`
- prisma:migrate: `npm run prisma:migrate`
- prisma:seed: `npm run prisma:seed`

### mobile-rn/
- dev: `npm run start` (expo start --host lan)
- android: `npm run android`
- ios: `npm run ios`
- web: `npm run web`

## Conventions
- **Code style**: Prettier (single quotes, trailing commas), ESLint, NestJS modular pattern
- **Naming**: kebab-case files, PascalCase classes, kebab-case directories
- **API prefix**: `/api/v1`
- **Database**: Prisma with snake_case table names (`@@map`), UUID v4 IDs, French table names
- **Mobile**: Expo Router file-based routing, Zustand stores in `src/shared/hooks/`, path alias `@/` -> `src/`
- **Language**: French (docs, code, comments)
- **TypeScript**: Strict mode (mobile), ES2023 target (backend), experimental decorators (NestJS)
- **License**: UNLICENSED (private)

## Architecture
```
cpro/
├── backend-v2/          # NEW NestJS backend (active)
│   ├── prisma/          # Schema (16+ models), seeds, dev.db
│   ├── src/
│   │   ├── auth/        # JWT+bcrypt auth
│   │   ├── dashboard/   # 8 KPI indicators
│   │   ├── transactions/# CRUD + sync
│   │   ├── profile/     # Profile CRUD
│   │   ├── equipments/  # Equipment + depreciation
│   │   ├── clients/     # Client credit tracking
│   │   ├── config/      # App config
│   │   ├── academy/     # Glossary + education
│   │   ├── financing/   # IMF/micro-finance
│   │   ├── upload/      # File upload (logos, proofs)
│   │   ├── notifications/# FCM push
│   │   ├── expert/      # Expert requests
│   │   └── ocr/         # OCR (MoMo SMS parsing)
│   └── test/            # E2E tests
├── mobile-rn/           # NEW React Native/Expo app (active)
│   ├── app/             # Expo Router (auth, onboarding, tabs)
│   └── src/             # API client, auth, sync, components, hooks, utils, theme
├── backend/             # OLD AWS Lambda (dead)
├── mobile/              # OLD Flutter app (dead)
├── infra/               # OLD AWS CDK stacks (dead)
└── docs/                # Architecture plans, research PDFs
```

## Gotchas
- **Mid-migration**: Two backends (`backend/` old Lambda, `backend-v2/` new NestJS) and two mobile apps (`mobile/` Flutter old, `mobile-rn/` React Native new) coexist; old code is dead but not removed yet.
- **Prisma dual-provider**: schema.prisma uses SQLite for dev; production uses PostgreSQL. Must switch provider + URL.
- **Auth mismatch**: backend-v2 uses JWT+bcrypt; mobile-rn still references Cognito (AWS) — integration gap.
- **Hardcoded IP**: `mobile-rn` start script hardcodes `192.168.1.72` LAN IP.
- **No Docker**: Missing Dockerfile/docker-compose; deployment planned via Railway.app.
- **No CI/CD**: No GitHub Actions or CI config found.
- **Redis optional**: `ioredis` dependency present but env vars optional.
- **mobile-rn still uses Cognito**: authService.ts has not been updated to match new backend auth.
