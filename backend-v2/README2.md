# C'PRO Backend V2

Application backend NestJS + Prisma + PostgreSQL pour la plateforme C'PRO.

## 🚀 Stack Technique

- **Framework**: NestJS 11
- **ORM**: Prisma 6
- **Database**: PostgreSQL 16
- **Auth**: JWT + bcrypt
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Email**: Resend
- **Storage**: Cloudflare R2 (S3-compatible)
- **Push Notifications**: Firebase Cloud Messaging

## 📋 Prérequis

- Node.js 20+
- PostgreSQL 16+
- npm

## 🛠️ Installation Locale

### 1. Installer les dépendances

\`\`\`bash
npm install
\`\`\`

### 2. Configurer les variables d'environnement

\`\`\`bash
cp .env.example .env
# Éditer .env avec vos valeurs
\`\`\`

### 3. Setup PostgreSQL (Docker)

\`\`\`bash
docker run --name cpro-postgres \
  -e POSTGRES_USER=cpro \
  -e POSTGRES_PASSWORD=cpro2026 \
  -e POSTGRES_DB=cpro \
  -p 5432:5432 \
  -d postgres:16-alpine
\`\`\`

### 4. Générer Prisma Client & Migrations

\`\`\`bash
npm run prisma:generate
npm run prisma:migrate
\`\`\`

### 5. Lancer le serveur

\`\`\`bash
npm run start:dev
\`\`\`

API: \`http://localhost:3000\`
Swagger: \`http://localhost:3000/api/docs\`

## 🏗️ Structure

\`\`\`
src/
├── auth/           # Authentification JWT
├── dashboard/      # Tableau de bord (Phase 1)
├── equipments/     # Équipements (Phase 1)
├── clients/        # Clients (Phase 1)
└── ... (autres modules)
\`\`\`

## 🚀 Déploiement VPS

Voir \`DEPLOIEMENT_VPS.md\` pour le guide complet.
