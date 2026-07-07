# 🚀 Prochaines Étapes - Backend V2

## ✅ Ce qui est fait

### 1. Infrastructure de Base
- ✅ Projet NestJS initialisé
- ✅ Schéma Prisma complet (16 modèles)
- ✅ Package.json configuré avec toutes les dépendances
- ✅ Variables d'environnement (.env + .env.example)
- ✅ Documentation README.md
- ✅ Guide déploiement VPS complet

### 2. Architecture Définie
- ✅ Stack technique validée (NestJS + Prisma + PostgreSQL)
- ✅ Abandon AWS pour fait maison
- ✅ 16 modèles Prisma couvrant les 3 volets
- ✅ Structure modulaire NestJS

---

## 📋 TODO Immédiat - Phase 1

### Étape 1: Setup Environnement Local (30 min)

```bash
cd backend-v2

# 1. Installer dépendances
npm install

# 2. Démarrer PostgreSQL (Docker)
docker run --name cpro-postgres \
  -e POSTGRES_USER=cpro \
  -e POSTGRES_PASSWORD=cpro2026 \
  -e POSTGRES_DB=cpro \
  -p 5432:5432 \
  -d postgres:16-alpine

# 3. Générer Prisma Client
npm run prisma:generate

# 4. Créer première migration
npm run prisma:migrate

# 5. Vérifier que tout fonctionne
npm run start:dev
```

### Étape 2: Créer Module Prisma (15 min)

```bash
# Générer module Prisma
nest g module prisma
nest g service prisma --no-spec
```

Créer `src/prisma/prisma.service.ts`:
```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### Étape 3: Créer Module Auth (1h)

```bash
# Générer module Auth
nest g module auth
nest g service auth --no-spec
nest g controller auth --no-spec
```

Implémenter:
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `POST /auth/refresh` - Refresh token
- Guard JWT
- Decorator @CurrentUser

### Étape 4: Créer Module Users & Profiles (1h)

```bash
nest g resource users --no-spec
nest g resource profiles --no-spec
```

Implémenter:
- `GET /users/me` - Profil courant
- `PUT /users/me` - Mise à jour profil
- `GET /profiles/:userId` - Profil public

### Étape 5: Créer Module Transactions (1h30)

```bash
nest g resource transactions --no-spec
```

Implémenter:
- `POST /transactions/sync` - Sync batch depuis mobile
- `GET /transactions` - Liste avec filtres
- `GET /transactions/:id` - Détail transaction
- Validation DTO (montant, date, type, etc.)

### Étape 6: Créer Module Dashboard (2h) ⭐ PRIORITÉ

```bash
nest g module dashboard
nest g service dashboard --no-spec
nest g controller dashboard --no-spec
```

Implémenter:
- `GET /dashboard?period=month` - Calculs 8 indicateurs
- Calculs:
  - CA (Σ recettes)
  - RN (CA - CV - CF - Amortissements)
  - Taux de profitabilité ((RN / CA) × 100)
  - Trésorerie (Recettes - Dépenses)
  - Ratio charges ((CV+CF) / CA × 100)
  - Seuil rentabilité (CF / taux marge)
  - Comparaison M vs M-1

### Étape 7: Créer Module Equipments (1h)

```bash
nest g resource equipments --no-spec
```

Implémenter:
- `POST /equipments` - Créer équipement
- `GET /equipments` - Liste
- `PUT /equipments/:id` - Modifier
- `DELETE /equipments/:id` - Supprimer
- Calcul auto amortissements (annuel, mensuel, journalier)

### Étape 8: Créer Module Clients (1h)

```bash
nest g resource clients --no-spec
```

Implémenter:
- `POST /clients` - Créer client
- `GET /clients` - Liste avec soldes crédit
- `PUT /clients/:id` - Modifier
- `GET /clients/:id/transactions` - Historique transactions

### Étape 9: Créer Script Seed (1h30)

Créer `prisma/seed.ts`:
- Seed 30 métiers (avec catégories, formules, équipements)
- Seed 8 amortissements
- Seed 70+ IMF
- Seed 15 glossaire + 5 fiches académie

### Étape 10: Tests & Documentation (1h)

- Tests unitaires modules principaux
- Documentation Swagger auto-générée
- Tests endpoints via Postman/Insomnia

---

## 📊 Estimation Phase 1

| Module | Temps | Priorité |
|---|---|---|
| Setup environnement | 30 min | 🔴 Critique |
| Module Prisma | 15 min | 🔴 Critique |
| Module Auth | 1h | 🔴 Critique |
| Module Users/Profiles | 1h | 🔴 Critique |
| Module Transactions | 1h30 | 🔴 Critique |
| **Module Dashboard** | **2h** | ⭐ **PRIORITÉ** |
| Module Equipments | 1h | 🟠 Haute |
| Module Clients | 1h | 🟠 Haute |
| Script Seed | 1h30 | 🟠 Haute |
| Tests & Docs | 1h | 🟢 Moyenne |
| **TOTAL** | **~11h** | — |

---

## 🎯 Objectif Phase 1

**Backend fonctionnel avec:**
- ✅ Auth JWT complète
- ✅ CRUD Utilisateurs/Profils
- ✅ Sync transactions offline
- ✅ **Dashboard avec 8 indicateurs calculés**
- ✅ CRUD Équipements (calculs amortissements)
- ✅ CRUD Clients (gestion créances)
- ✅ Données seedées (métiers, IMF, académie)

**Prêt pour intégration frontend React Native.**

---

## 🔄 Après Phase 1

### Phase 2: Documents & Prévisions (1 semaine)
- Module Documents (génération PDF)
- Module Forecast (prévisions CA 6 mois)
- Module SavingGoals (simulation épargne)

### Phase 3: Fiscalité DGI (1 semaine)
- Module Fiscal (déclarations)
- Module MoMo (webhook MTN/Moov)
- Module Badges (conformité)
- Dashboard DGI

### Phase 4: Services Pro (1 semaine)
- Module Subscriptions (abonnements)
- Module Missions (audit, conseil)
- Module Admin (dashboard comptable)

---

## 🚀 Commandes Rapides

```bash
# Développement
npm run start:dev

# Build production
npm run build

# Migrations
npm run prisma:migrate

# Seed
npm run prisma:seed

# Tests
npm test

# Prisma Studio (UI BDD)
npm run prisma:studio
```

---

## 📚 Ressources

- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/16/)

---

**Prêt à coder ? On commence par quoi ?** 🚀

1. Setup environnement local ?
2. Module Prisma ?
3. Module Auth ?
4. Directement le Dashboard (si auth déjà OK) ?
