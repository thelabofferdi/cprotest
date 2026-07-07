# 📱 Scénarios d'Utilisation par Profil

> Ce document décrit ce que chaque type d'utilisateur **voit** et **ne voit pas** dans C'PRO, et pourquoi.

---

## 🔴 PRODUCTEUR — Mama Adjoa, Boulangère

### Contexte
Mama Adjoa vend du pain tous les jours. Elle achète farine, sucre, levure le matin et vend tout au comptoir dans la journée. Son stress : avoir assez de cash pour les achats du lendemain.

### Ce qu'elle voit en ouvrant l'app

```
┌─────────────────────────────────────────┐
│  📊 Tableau de Bord                     │
│  ═══════════════════════════════════════│
│                                         │
│  💰 TRÉSORERIE ACTUELLE                 │
│  ┌─────────────────────────────────┐    │
│  │  125 000 FCFA                   │    │
│  │  ▲ +15 000 vs hier              │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ⚠️ ALERTES                             │
│  ┌─────────────────────────────────┐    │
│  │ 🔴 Stock farine bas (2 sacs)    │    │
│  │ 🟡 3 clients vous doivent 22k   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  📈 Entrées du jour   :  85 000 FCFA    │
│  📉 Sorties du jour   :  70 000 FCFA    │
│                                         │
└─────────────────────────────────────────┘
```

### Modules visibles
- ✅ **Stock** — Elle suit ses sacs de farine, levure, sucre
- ✅ **Fournisseurs** — Elle a 2-3 fournisseurs réguliers
- ✅ **Clients** — Certains achètent à crédit (maquis du coin)
- ✅ **Financement** — Elle a parfois besoin de fonds de roulement

### Alertes actives
- 🔴 Stock bas (farine < 3 sacs)
- 🔴 Trésorerie basse (< 50 000 FCFA)
- 🟡 Crédit client (relance paiements)

### Ce qu'elle NE VOIT PAS

| Élément masqué | Pourquoi |
|----------------|----------|
| Module "Commandes en cours" | Elle vend au comptoir, pas sur commande |
| Module "Acomptes" | Pas de travail sur devis |
| Module "Équipements" en accueil | Son four est là, pas besoin d'y penser chaque jour |
| Module "Carburant" | Elle ne roule pas |
| Module "Prestations" | Elle ne facture pas à l'heure |
| Alerte "Retard commande" | Elle n'a pas de commandes planifiées |
| Alerte "Maintenance équipement" | Pas prioritaire au quotidien |

### Son besoin principal
> *"Est-ce que j'ai assez de cash pour acheter ma farine demain matin ?"*

---

## 🟡 COMMERCANT — Monsieur Kodjo, Couturier

### Contexte
Monsieur Kodjo travaille sur commande. Un client vient, commande un costume, paie un acompte (50%), et revient chercher 1-2 semaines plus tard. Son stress : savoir si chaque commande est rentable et ne pas oublier les deadlines.

### Ce qu'il voit en ouvrant l'app

```
┌─────────────────────────────────────────┐
│  📊 Tableau de Bord                     │
│  ═══════════════════════════════════════│
│                                         │
│  💰 BÉNÉFICE DU MOIS                    │
│  ┌─────────────────────────────────┐    │
│  │  285 000 FCFA                   │    │
│  │  Marge : 52%  📈                │    │
│  └─────────────────────────────────┘    │
│                                         │
│  📋 COMMANDES EN COURS                  │
│  ┌─────────────────────────────────┐    │
│  │ 3 commandes • 180 000 FCFA      │    │
│  │ └ Mariage Sossou : 85k (J-3) ⚠️ │    │
│  │ └ Uniforme école : 60k (J-5)    │    │
│  │ └ Retouches lot  : 35k (J-2)    │    │
│  └─────────────────────────────────┘    │
│                                         │
│  💳 Acomptes reçus : 90 000 FCFA        │
│  💵 Reste à encaisser : 90 000 FCFA     │
│                                         │
└─────────────────────────────────────────┘
```

### Modules visibles
- ✅ **Commandes** — Suivi des travaux en cours avec deadlines
- ✅ **Clients** — Historique, fidélité, contacts
- ✅ **Acomptes** — Qui a payé quoi, combien reste dû
- ✅ **Financement** — Parfois besoin d'acheter du tissu en gros

### Alertes actives
- 🟡 Retard commande (deadline passée ou proche)
- 🟡 Crédit client (solde impayé)

### Ce qu'il NE VOIT PAS

| Élément masqué | Pourquoi |
|----------------|----------|
| Vue "Trésorerie temps réel" | Son cash dépend des livraisons, pas du flux minute par minute |
| Alerte "Trésorerie basse" | Il a des acomptes, son modèle est différent |
| Module "Stock matières" | Il achète le tissu par commande, pas de stock permanent |
| Module "Cycle de production" | Il n'élève pas de poulets sur 90 jours |
| Module "Carburant" | Il ne roule pas |
| Module "Équipements" en accueil | Sa machine à coudre est là, stable |
| Alerte "Stock bas" | Pas de stock à surveiller |

### Son besoin principal
> *"Est-ce que cette commande mariage va me rapporter ? Combien me reste à encaisser ?"*

---

## 🟢 PRESTATAIRE — Papa Cosme, Zémidjan

### Contexte
Papa Cosme a sa moto. Il fait des courses toute la journée, reçoit du cash immédiatement. Pas de stock, pas de commandes, pas de crédit client. Son stress : savoir combien il a gagné et entretenir sa moto.

### Ce qu'il voit en ouvrant l'app

```
┌─────────────────────────────────────────┐
│  📊 Tableau de Bord                     │
│  ═══════════════════════════════════════│
│                                         │
│  💰 AUJOURD'HUI                         │
│  ┌─────────────────────────────────┐    │
│  │  Recettes : 18 500 FCFA         │    │
│  │  Dépenses :  5 200 FCFA         │    │
│  │  ────────────────────           │    │
│  │  Gain     : 13 300 FCFA  ✅     │    │
│  └─────────────────────────────────┘    │
│                                         │
│  📅 CETTE SEMAINE                       │
│  │ Lun: 12k │ Mar: 15k │ Mer: 11k │    │
│  │ Jeu: 14k │ Ven: 18k │           │    │
│  │ Total : 71 200 FCFA             │    │
│                                         │
│  🏍️ MA MOTO                            │
│  ├ 🔧 Prochaine vidange : J-5          │
│  └ 📋 Assurance expire : 15 jours      │
│                                         │
└─────────────────────────────────────────┘
```

### Modules visibles
- ✅ **Équipements** — Sa moto, son outil de travail
- ✅ **Prestations** — Compteur de courses (optionnel)
- ✅ **Carburant** — Suivi dépenses essence

### Alertes actives
- 🔧 Maintenance équipement (vidange, pneus, chaîne)
- 📋 Expiration assurance

### Ce qu'il NE VOIT PAS

| Élément masqué | Pourquoi |
|----------------|----------|
| Module "Stock" | Il n'a rien à stocker |
| Module "Fournisseurs" | Il n'achète pas de matières premières |
| Module "Clients" avec crédit | Il est payé cash immédiatement |
| Module "Commandes" | Pas de travail planifié à l'avance |
| Module "Acomptes" | Pas de paiements échelonnés |
| Section "Financement" en accueil | Pas de besoin de fonds de roulement |
| Alerte "Trésorerie basse" | Son modèle est simple : courses = cash direct |
| Alerte "Stock bas" | Pas de stock |
| Alerte "Crédit client" | Pas de crédit |
| Vue complexe avec marges | Il veut juste : recettes - dépenses = gain |

### Son besoin principal
> *"Combien j'ai gagné aujourd'hui ? Ma moto va bien ?"*

---

## 📊 Tableau Récapitulatif

### Modules par profil

| Module | PRODUCTEUR 🔴 | COMMERCANT 🟡 | PRESTATAIRE 🟢 |
|--------|:-------------:|:-------------:|:--------------:|
| Stock matières | ✅ | ⚪ (épicerie) | ❌ |
| Fournisseurs | ✅ | ⚪ (épicerie) | ❌ |
| Commandes | ❌ | ✅ | ⚪ (menuisier) |
| Acomptes | ❌ | ✅ | ⚪ (menuisier) |
| Clients (crédit) | ✅ | ✅ | ❌ |
| Équipements | ⚪ | ❌ | ✅ |
| Carburant | ❌ | ❌ | ✅ (transport) |
| Cycle production | ✅ (élevage) | ❌ | ❌ |
| Financement (accueil) | ✅ | ✅ | ❌ |

✅ = Visible | ⚪ = Selon métier | ❌ = Masqué

### Alertes par profil

| Alerte | PRODUCTEUR 🔴 | COMMERCANT 🟡 | PRESTATAIRE 🟢 |
|--------|:-------------:|:-------------:|:--------------:|
| Stock bas | ✅ | ⚪ (épicerie) | ❌ |
| Trésorerie basse | ✅ | ❌ | ❌ |
| Crédit client | ✅ | ✅ | ❌ |
| Retard commande | ❌ | ✅ | ⚪ (menuisier) |
| Maintenance équipement | ❌ | ❌ | ✅ |
| Expiration assurance | ❌ | ❌ | ✅ (transport) |

### Type de dashboard

| Profil | Dashboard | Focus principal |
|--------|-----------|-----------------|
| 🔴 PRODUCTEUR | TRESORERIE | Flux cash entrant/sortant |
| 🟡 COMMERCANT | BENEFICE | Marges et rentabilité |
| 🟢 PRESTATAIRE | SIMPLE | Gain quotidien |

---

## 🎯 Philosophie : Moins = Mieux

### Pourquoi masquer des fonctionnalités ?

1. **Moins de confusion** — Un zémidjan qui voit "Gestion des stocks" se demande ce que c'est
2. **Adoption plus rapide** — 3 boutons au lieu de 10 = prise en main immédiate
3. **Pertinence** — Chaque écran répond à un vrai besoin du métier
4. **Confiance** — L'utilisateur sent que l'app "comprend" son activité

### Le principe

> *"Ne montre que ce qui aide. Cache ce qui distrait."*

Un producteur n'a pas besoin de penser aux équipements chaque matin.
Un prestataire n'a pas besoin de voir des alertes de stock.
Un commerçant n'a pas besoin de stresser sur sa trésorerie à la minute.

**Chaque profil voit l'app comme si elle avait été faite uniquement pour lui.**

---

## 🔧 Implémentation Technique

### Endpoint de configuration

```
GET /config/my-dashboard
```

Retourne la configuration UI selon le métier de l'utilisateur connecté :

```json
{
  "profil": "PRODUCTEUR",
  "dashboardType": "TRESORERIE",
  "modulesActifs": ["stock", "fournisseurs", "financement", "clients"],
  "alertesActives": ["stock-bas", "tresorerie-basse", "credit-client"],
  "features": {
    "showFinancementSection": true,
    "showStockModule": true,
    "showCommandesModule": false,
    "showEquipementsModule": false,
    "showClientsModule": true,
    "showTresorerieAlert": true,
    "showStockAlert": true
  }
}
```

### Utilisation côté mobile

```typescript
const config = await api.get('/config/my-dashboard');

// Afficher/masquer les modules
{config.features.showStockModule && <StockModule />}
{config.features.showCommandesModule && <CommandesModule />}
{config.features.showEquipementsModule && <EquipementsModule />}

// Choisir le layout du dashboard
switch(config.dashboardType) {
  case 'TRESORERIE': return <DashboardTresorerie />;
  case 'BENEFICE': return <DashboardBenefice />;
  case 'SIMPLE': return <DashboardSimple />;
}
```

---

*Document créé le 2026-06-10*
