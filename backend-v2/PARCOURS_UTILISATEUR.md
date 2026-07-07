# 📱 Parcours Utilisateur C'PRO - Récit Narratif

> **C'PRO** : L'application qui aide les micro-entrepreneurs africains à gérer leur activité simplement, même sans formation comptable.

---

## 🎯 **3 Profils, 3 Expériences Personnalisées**

C'PRO adapte son interface et ses fonctionnalités selon le type d'activité de l'utilisateur :

| Profil | Métiers | Besoin Principal | Dashboard |
|--------|---------|------------------|-----------|
| 🔴 **PRODUCTEUR** | Boulanger, Restaurant, Élevage, Agriculture | Trésorerie constante | TRESORERIE |
| 🟡 **COMMERCANT** | Couturier, Coiffeur, Épicerie | Suivi des marges | BENEFICE |
| 🟢 **PRESTATAIRE** | Mécanicien, Menuisier, Transport | Gestion simple | SIMPLE |

---

## 🔴 **Parcours PRODUCTEUR : Mama Adjoa, Boulangère**

> *"J'ai besoin de cash tous les jours pour acheter farine, sucre, œufs. Si je n'ai pas de trésorerie, ma boutique ferme."*

### Profil Métier
- **Profil** : PRODUCTEUR
- **Besoin financement** : ÉLEVÉ
- **Types** : Fonds de roulement, Équipement
- **Fréquence cash** : Quotidien
- **Cycle vente** : 1 jour
- **Marge typique** : 35%

### Ce que Mama Adjoa voit

#### Dashboard TRESORERIE 🔴
```
┌─────────────────────────────────────────┐
│  📊 Tableau de Bord Trésorerie         │
│  ═══════════════════════════════════════│
│                                         │
│  💰 TRÉSORERIE ACTUELLE                 │
│  ┌─────────────────────────────────┐    │
│  │  125 000 FCFA                   │    │
│  │  ▲ +15 000 vs hier              │    │
│  └─────────────────────────────────┘    │
│                                         │
│  📈 Entrées du jour   :  85 000 FCFA    │
│  📉 Sorties du jour   :  70 000 FCFA    │
│  ─────────────────────────────────      │
│  Solde jour           : +15 000 FCFA    │
│                                         │
│  ⚠️ ALERTES TRÉSORERIE                  │
│  ┌─────────────────────────────────┐    │
│  │ 🔴 Stock farine bas (2 sacs)    │    │
│  │ 🟡 3 clients vous doivent 22k   │    │
│  │ 🟢 Trésorerie OK (>100k)        │    │
│  └─────────────────────────────────┘    │
│                                         │
│  📊 Prévision J+7 : ~140 000 FCFA       │
│                                         │
└─────────────────────────────────────────┘
```

#### Modules Actifs
- ✅ **Stock** : Suivi des matières premières (farine, sucre, levure)
- ✅ **Fournisseurs** : Liste des fournisseurs avec prix
- ✅ **Financement** : Accès aux IMF pour fonds de roulement
- ✅ **Clients** : Gestion des crédits clients

#### Alertes Configurées
- 🔴 Stock bas (quand farine < 3 sacs)
- 🔴 Trésorerie basse (< 50 000 FCFA)
- 🟡 Crédit client (rappel relance)

#### Financement Visible
- **Section financement** : ✅ Visible et mise en avant
- **Types proposés** : Fonds de roulement, Crédit équipement
- **Message** : *"Votre activité nécessite une gestion fine de la trésorerie"*

### Scénario Type

**6h du matin** : Mama Adjoa ouvre l'app avant d'allumer le four.

Elle voit immédiatement :
- Sa trésorerie : 125 000 FCFA ✅
- Alerte stock : 2 sacs de farine restants 🔴
- Elle doit appeler son fournisseur

**10h** : Vente de 200 pains (30 000 FCFA en espèces)
- L'app enregistre, catégorie "Vente de pain"
- Trésorerie mise à jour : 155 000 FCFA

**14h** : Achat farine chez le fournisseur (45 000 FCFA)
- Mode paiement : Cash
- Catégorie : "Achat farine"
- Trésorerie : 110 000 FCFA

**18h** : Un client paie par MTN MoMo
- Elle scanne le SMS → OCR extrait tout
- Preuve photo stockée

**En fin de journée** : Le dashboard montre le bénéfice du jour ET la projection de trésorerie.

---

## 🟡 **Parcours COMMERCANT : Monsieur Kodjo, Couturier**

> *"Je travaille sur commande. Mon besoin de trésorerie dépend des commandes en cours. Je veux savoir si chaque commande me rapporte."*

### Profil Métier
- **Profil** : COMMERCANT
- **Besoin financement** : MOYEN
- **Types** : Fonds de roulement (achat tissus)
- **Fréquence cash** : Par commande
- **Cycle vente** : 7 jours
- **Marge typique** : 50%

### Ce que Monsieur Kodjo voit

#### Dashboard BENEFICE 🟡
```
┌─────────────────────────────────────────┐
│  📊 Tableau de Bord Bénéfice           │
│  ═══════════════════════════════════════│
│                                         │
│  💰 BÉNÉFICE DU MOIS                    │
│  ┌─────────────────────────────────┐    │
│  │  285 000 FCFA                   │    │
│  │  Marge : 52%  📈                │    │
│  └─────────────────────────────────┘    │
│                                         │
│  📈 Revenus       :   550 000 FCFA      │
│  📉 Charges       :   265 000 FCFA      │
│  ─────────────────────────────────      │
│  Bénéfice net     :  +285 000 FCFA      │
│                                         │
│  📋 COMMANDES EN COURS                  │
│  ┌─────────────────────────────────┐    │
│  │ 3 commandes • 180 000 FCFA      │    │
│  │ └ Mariage Sossou : 85 000 (J-3) │    │
│  │ └ Uniforme école : 60 000 (J-5) │    │
│  │ └ Retouches lot  : 35 000 (J-2) │    │
│  └─────────────────────────────────┘    │
│                                         │
│  💳 Acomptes reçus : 90 000 FCFA        │
│  📊 Objectif : 71% de 400k             │
│  ████████████████░░░░░░░░               │
│                                         │
└─────────────────────────────────────────┘
```

#### Modules Actifs
- ✅ **Commandes** : Suivi des travaux en cours
- ✅ **Clients** : Historique et fidélité
- ✅ **Acomptes** : Suivi des avances reçues

#### Alertes Configurées
- 🟡 Commande en retard (deadline passée)
- 🟡 Crédit client (relance paiement)

#### Financement Visible
- **Section financement** : ✅ Visible
- **Types proposés** : Fonds de roulement (achat tissus en gros)
- **Message** : *"Suivez vos marges pour optimiser votre activité"*

### Scénario Type

**Lundi** : Nouvelle commande mariage (85 000 FCFA)
- Client : Madame Sossou
- Acompte reçu : 40 000 FCFA (50%)
- Date livraison : Vendredi

**Mercredi** : Achat tissus (35 000 FCFA)
- Le système calcule automatiquement la marge de cette commande
- Marge prévisionnelle : 50 000 FCFA (59%)

**Vendredi** : Livraison et paiement solde
- Reçu : 45 000 FCFA
- Commande marquée "terminée"
- Bénéfice réalisé affiché dans le dashboard

**En fin de semaine** : Il voit son bénéfice par commande, pas juste un total global. Il sait que la commande mariage lui a rapporté 50 000 FCFA.

---

## 🟢 **Parcours PRESTATAIRE : Papa Cosme, Zémidjan**

> *"J'ai ma moto, je fais mes courses. Pas besoin de stock ni de commandes. Je veux juste voir ce que je gagne chaque jour."*

### Profil Métier
- **Profil** : PRESTATAIRE
- **Besoin financement** : FAIBLE
- **Types** : Équipement (moto, outils)
- **Fréquence cash** : Quotidien
- **Cycle vente** : 0 jour (immédiat)
- **Marge typique** : 65%

### Ce que Papa Cosme voit

#### Dashboard SIMPLE 🟢
```
┌─────────────────────────────────────────┐
│  📊 Tableau de Bord Simple             │
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
│  ┌─────────────────────────────────┐    │
│  │  Lun : 12 000 │ Mar : 15 500    │    │
│  │  Mer : 11 000 │ Jeu : 14 200    │    │
│  │  Ven : 18 500 │ Sam : -         │    │
│  │  ────────────────────           │    │
│  │  Total : 71 200 FCFA            │    │
│  └─────────────────────────────────┘    │
│                                         │
│  🏍️ MA MOTO                            │
│  ├ Kilométrage : ~250 km/jour          │
│  ├ Carburant semaine : 18 000 FCFA     │
│  └ Prochaine vidange : J-5             │
│                                         │
└─────────────────────────────────────────┘
```

#### Modules Actifs
- ✅ **Équipements** : Suivi moto (amortissement, entretien)
- ✅ **Prestations** : Compteur courses (optionnel)
- ✅ **Carburant** : Suivi dépenses carburant

#### Alertes Configurées
- 🔧 Maintenance équipement (vidange, pneus)
- 📋 Assurance expiration

#### Financement Visible
- **Section financement** : ❌ Masquée par défaut
- **Raison** : Besoin faible, évite la surcharge d'interface
- **Accessible** : Menu → Financement (si besoin)

### Scénario Type

**6h** : Papa Cosme démarre sa journée
- Il n'a pas besoin de voir un dashboard complexe
- Juste : combien j'ai gagné hier ?

**Toute la journée** : Il fait ses courses
- Il enregistre rapidement : "Course" + montant
- Ou ne rien enregistrer et faire le total le soir

**Soir** : Il note le total des courses (18 500 FCFA)
- Il note le carburant acheté (2 500 FCFA)
- Le dashboard calcule son gain net : 16 000 FCFA

**Dimanche** : Il voit sa semaine
- Gain total : 71 200 FCFA
- Rappel : vidange dans 5 jours

L'app est **simple** parce que son activité l'est. Pas de stock à gérer, pas de commandes à suivre, pas de crédit client complexe.

---

## 📱 **Onboarding Personnalisé**

### Étape 1 : Choix du métier
```
┌─────────────────────────────────────────┐
│  💼 Quel est votre métier ?             │
│  ═══════════════════════════════════════│
│                                         │
│  🔴 PRODUCTEURS (Trésorerie quotidienne)│
│  ┌─────────────────────────────────┐    │
│  │ 🍞 Boulanger / Boulangerie      │    │
│  │ 🍽️ Restauration / Maquis        │    │
│  │ 🐔 Élevage                       │    │
│  │ 🌾 Agriculture / Maraîchage     │    │
│  └─────────────────────────────────┘    │
│                                         │
│  🟡 COMMERCANTS (Achat-revente/Service) │
│  ┌─────────────────────────────────┐    │
│  │ 👗 Couturier / Couturière       │    │
│  │ 💇 Coiffeur / Coiffeuse         │    │
│  │ 🏪 Épicerie / Boutique          │    │
│  └─────────────────────────────────┘    │
│                                         │
│  🟢 PRESTATAIRES (Service simple)       │
│  ┌─────────────────────────────────┐    │
│  │ 🔧 Mécanicien / Garage          │    │
│  │ 🪚 Menuisier                    │    │
│  │ 🏍️ Transport (Zémidjan, Taxi)   │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### Étape 2 : Explication du profil
```
┌─────────────────────────────────────────┐
│  🍞 Boulanger / Boulangerie             │
│  ═══════════════════════════════════════│
│                                         │
│  Votre profil : PRODUCTEUR 🔴           │
│                                         │
│  Votre activité nécessite :             │
│  • Une gestion fine de la trésorerie    │
│  • Un suivi des stocks matières         │
│  • Des achats quotidiens réguliers      │
│                                         │
│  C'PRO va :                             │
│  ✅ Afficher votre trésorerie en temps  │
│     réel sur le dashboard               │
│  ✅ Vous alerter quand le stock est bas │
│  ✅ Vous proposer des financements      │
│     adaptés (fonds de roulement)        │
│                                         │
│  📊 Marge typique : 35%                 │
│  💰 Cycle : Achat matin → Vente soir    │
│                                         │
│  [C'est mon métier ✓]  [← Changer]      │
│                                         │
└─────────────────────────────────────────┘
```

### Étape 3 : Configuration automatique

L'app configure automatiquement :
- Le type de dashboard (TRESORERIE / BENEFICE / SIMPLE)
- Les modules actifs
- Les alertes pertinentes
- La visibilité du financement
- Les catégories de transactions

**L'utilisateur n'a rien à configurer.** Tout est adapté à son métier.

---

## 🔧 **API Configuration**

### GET /config/my-dashboard

Retourne la configuration personnalisée selon le métier de l'utilisateur :

```json
{
  "profil": "PRODUCTEUR",
  "dashboardType": "TRESORERIE",
  "besoinFinancement": "ELEVE",
  "typeFinancement": ["fonds-roulement", "equipement"],
  "frequenceCash": "quotidien",
  "modulesActifs": ["stock", "fournisseurs", "financement", "clients"],
  "alertesActives": ["stock-bas", "tresorerie-basse", "credit-client"],
  "margeTypique": 0.35,
  "cycleVenteJours": 1,
  "metier": {
    "slug": "boulanger",
    "nom": "Boulanger / Boulangerie",
    "icon": "🍞"
  },
  "features": {
    "showFinancementSection": true,
    "showStockModule": true,
    "showCommandesModule": false,
    "showEquipementsModule": false,
    "showClientsModule": true,
    "showFournisseursModule": true,
    "showTresorerieAlert": true,
    "showStockAlert": true,
    "showCreditAlert": true
  },
  "ui": {
    "dashboardLayout": "tresorerie",
    "primaryColor": "#E53935",
    "profilLabel": "Producteur",
    "profilDescription": "Votre activité nécessite une gestion fine de la trésorerie"
  }
}
```

---

## 📋 **Tableau Récapitulatif des 10 Métiers**

| Métier | Profil | Dashboard | Financement | Modules Clés | Alertes |
|--------|--------|-----------|-------------|--------------|---------|
| 🍞 Boulanger | 🔴 PRODUCTEUR | TRESORERIE | ELEVE | Stock, Fournisseurs | Stock bas, Tréso basse |
| 🍽️ Restaurant | 🔴 PRODUCTEUR | TRESORERIE | ELEVE | Stock, Fournisseurs | Stock bas, Tréso basse |
| 🐔 Élevage | 🔴 PRODUCTEUR | TRESORERIE | ELEVE | Stock, Cycle prod | Stock bas, Fin cycle |
| 🌾 Agriculture | 🔴 PRODUCTEUR | TRESORERIE | ELEVE | Stock, Cycle prod | Tréso basse, Fin saison |
| 👗 Couturier | 🟡 COMMERCANT | BENEFICE | MOYEN | Commandes, Acomptes | Retard commande |
| 💇 Coiffeur | 🟡 COMMERCANT | BENEFICE | FAIBLE | Clients, Prestations | Stock produits |
| 🏪 Épicerie | 🟡 COMMERCANT | BENEFICE | MOYEN | Stock, Fournisseurs | Stock bas, Crédit |
| 🔧 Mécanicien | 🟢 PRESTATAIRE | SIMPLE | FAIBLE | Équipements, Prestations | Maintenance |
| 🪚 Menuisier | 🟢 PRESTATAIRE | SIMPLE | FAIBLE | Équipements, Commandes | Retard commande |
| 🏍️ Transport | 🟢 PRESTATAIRE | SIMPLE | FAIBLE | Équipements, Carburant | Maintenance, Assurance |

---

## 🎯 **Philosophie de Conception**

### 1. **Le bon outil pour le bon usage**
Un zémidjan n'a pas besoin d'un module de gestion des stocks. Une boulangère n'a pas besoin de suivre des commandes sur 2 semaines. L'app s'adapte.

### 2. **Financement contextuel**
- PRODUCTEUR : Besoin constant → Financement visible et promu
- COMMERCANT : Besoin ponctuel → Financement accessible
- PRESTATAIRE : Besoin rare → Financement masqué (évite la surcharge)

### 3. **Complexité progressive**
- Dashboard SIMPLE : Revenus - Dépenses = Gain (3 chiffres)
- Dashboard BENEFICE : + Marges, Objectifs, Comparaisons
- Dashboard TRESORERIE : + Flux, Prévisions, Alertes stocks

### 4. **Éducation intégrée**
Chaque profil a des fiches pédagogiques adaptées :
- PRODUCTEUR : "Gérer sa trésorerie", "Négocier avec ses fournisseurs"
- COMMERCANT : "Calculer ses marges", "Fixer ses prix"
- PRESTATAIRE : "Amortir ses équipements", "Suivre ses dépenses"

---

## 🚀 **Impact Attendu**

| Profil | Avant C'PRO | Avec C'PRO |
|--------|-------------|------------|
| 🔴 PRODUCTEUR | Ne sait pas s'il a assez pour demain | Voit sa trésorerie en temps réel, anticipe |
| 🟡 COMMERCANT | Ne sait pas si une commande est rentable | Voit sa marge par commande |
| 🟢 PRESTATAIRE | Note sur papier, perd les comptes | Voit son gain journalier simplement |

---

## 📱 **Prochaines Étapes**

### Backend ✅ Terminé
- [x] Modèle Metier avec profils
- [x] Seed des 10 métiers avec configuration
- [x] Endpoint `/config/my-dashboard`
- [x] Documentation parcours différenciés

### Mobile (À implémenter)
- [ ] Écran sélection métier avec groupement par profil
- [ ] Dashboard adaptatif (3 layouts)
- [ ] Affichage conditionnel des modules
- [ ] Système d'alertes personnalisées
- [ ] Onboarding explicatif du profil

---

**C'PRO : Une app, trois expériences. Adaptée à votre réalité.**

*Document mis à jour le 2026-06-10*
