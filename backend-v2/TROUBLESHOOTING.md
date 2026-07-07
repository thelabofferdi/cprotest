# 🔧 Troubleshooting Backend V2

## ❌ Problème Actuel: Prisma Client Import

### Erreur
```
Property '$connect' does not exist on type 'PrismaService'
```

### Cause
Problème d'import Prisma Client après génération.

### Solution

**1. Vérifier que Prisma Client est généré:**
```bash
cd /home/hope/labs/cpro/backend-v2
npx prisma generate
```

**2. Vérifier l'import dans `src/prisma/prisma.service.ts`:**
```typescript
import { PrismaClient } from '@prisma/client';
```

**3. Si erreur persiste, essayer:**
```bash
# Nettoyer
rm -rf node_modules/.prisma node_modules/@prisma/client

# Réinstaller
npm install @prisma/client

# Regénérer
npx prisma generate
```

**4. Redémarrer le serveur:**
```bash
pkill -f "nest start"
npm run start:dev
```

---

## ✅ Tests Auth (Une fois serveur OK)

### 1. Test Register

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@cpro.app",
    "password": "test1234"
  }'
```

**Réponse attendue:**
```json
{
  "user": {
    "id": "uuid...",
    "email": "test@cpro.app",
    "role": "USER",
    "createdAt": "..."
  },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "expiresIn": 900
}
```

### 2. Vérifier dans la Base

```bash
# Ouvrir Prisma Studio
npx prisma studio

# Ou en SQL direct
sqlite3 prisma/dev.db "SELECT id, email, role, emailVerified FROM users;"
```

### 3. Test Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@cpro.app",
    "password": "test1234"
  }'
```

### 4. Test Endpoint Protégé (après création)

```bash
# Récupérer le token du login
TOKEN="eyJhbG..."

# Tester endpoint protégé
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/users/me
```

---

## 📝 Note sur OTP Email

**Actuellement:** Pas d'envoi OTP implémenté.

**Workflow actuel:**
1. Register → Créé user avec `emailVerified: false`
2. Login → Fonctionne même sans email vérifié

**Pour ajouter OTP:**

1. Créer `src/auth/otp.service.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class OtpService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendOTP(email: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Stocker code en DB avec expiration
    await this.prisma.otpCode.create({
      data: {
        email,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      },
    });

    // Envoyer email
    await this.resend.emails.send({
      from: 'C\\'PRO <noreply@cpro.app>',
      to: email,
      subject: 'Code de vérification C\\'PRO',
      html: `
        <h1>Bienvenue sur C'PRO</h1>
        <p>Votre code de vérification est : <strong>${code}</strong></p>
        <p>Ce code expire dans 10 minutes.</p>
      `,
    });

    return { sent: true };
  }

  async verifyOTP(email: string, code: string) {
    const otp = await this.prisma.otpCode.findFirst({
      where: {
        email,
        code,
        expiresAt: { gt: new Date() },
        used: false,
      },
    });

    if (!otp) {
      throw new UnauthorizedException('Code invalide ou expiré');
    }

    // Marquer comme utilisé
    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true },
    });

    // Vérifier email user
    await this.prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });

    return { verified: true };
  }
}
```

2. Ajouter model OTP dans Prisma:
```prisma
model OtpCode {
  id        String   @id @default(uuid())
  email     String
  code      String
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
  
  @@map("otp_codes")
}
```

3. Ajouter endpoints:
```typescript
// POST /auth/send-otp
async sendOTP(@Body() dto: { email: string }) {
  return this.otpService.sendOTP(dto.email);
}

// POST /auth/verify-otp
async verifyOTP(@Body() dto: { email: string; code: string }) {
  return this.otpService.verifyOTP(dto.email, dto.code);
}
```

---

## 🚀 Une Fois Serveur Fonctionnel

### Workflow Test Complet

```bash
# 1. Register
RESPONSE=$(curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@cpro.app","password":"test1234"}')

echo $RESPONSE | jq .

# 2. Extraire token
TOKEN=$(echo $RESPONSE | jq -r '.accessToken')
echo "Token: $TOKEN"

# 3. Vérifier en DB
sqlite3 prisma/dev.db "SELECT * FROM users WHERE email='test@cpro.app';"

# 4. Login
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@cpro.app","password":"test1234"}' | jq .

# 5. Test mauvais password
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@cpro.app","password":"wrong"}' | jq .
```

---

## 📊 Vérifications

### Serveur démarre correctement

```bash
# Logs serveur
tail -f /tmp/cpro-server.log

# Chercher ces lignes:
# [Nest] Starting Nest application...
# ✅ PostgreSQL connected (ou SQLite)
# [Nest] Nest application successfully started
# Application is running on: http://localhost:3000
```

### Port 3000 écoute

```bash
netstat -tuln | grep 3000
# ou
lsof -i :3000
```

### Prisma fonctionne

```bash
npx prisma studio
# Ouvre http://localhost:5555
```

---

## 🔍 Debug Common Issues

### 1. "Cannot find module '@prisma/client'"

```bash
npm install @prisma/client
npx prisma generate
```

### 2. "Port 3000 already in use"

```bash
pkill -f "nest start"
# ou
lsof -ti:3000 | xargs kill -9
```

### 3. "Database locked" (SQLite)

```bash
# Fermer Prisma Studio
# Redémarrer serveur
```

### 4. TypeScript errors

```bash
# Nettoyer
rm -rf dist/
npm run build
```

---

**Pour la prochaine session, assure-toi que `npm run start:dev` démarre sans erreur !**
