import type { GlossaireEntry } from '../../types';

export const GLOSSAIRE: GlossaireEntry[] = [
  {
    id: 'ca',
    terme: "Chiffre d'Affaires (CA)",
    definition: "La somme totale de toutes tes ventes sur une période. C'est l'argent qui entre avant de déduire les dépenses.",
    exemple: 'Si tu vends 100 pains à 200 FCFA chacun, ton CA = 20 000 FCFA',
    formule: 'CA = Σ Recettes journalières',
  },
  {
    id: 'cv',
    terme: 'Charges Variables (CV)',
    definition: 'Les dépenses qui changent selon ton activité. Plus tu produces, plus elles augmentent.',
    exemple: 'La farine pour le pain, le carburant pour le zémidjan',
    formule: 'CV = Σ Dépenses liées à la production',
  },
  {
    id: 'cf',
    terme: 'Charges Fixes (CF)',
    definition: 'Les dépenses que tu dois payer même si tu ne vends rien. Elles ne changent pas beaucoup.',
    exemple: 'Le loyer du kiosque, les salaires fixes, les taxes',
    formule: 'CF = Σ Loyer + Salaires fixes + Taxes',
  },
  {
    id: 'rn',
    terme: 'Résultat Net (RN)',
    definition: "Ce qu'il te reste vraiment après avoir tout payé, y compris l'usure de ton matériel. C'est ton vrai bénéfice.",
    exemple: 'CA 500 000 - CV 200 000 - CF 150 000 - Amort. 50 000 = RN 100 000 FCFA',
    formule: 'RN = CA – CV – CF – Amortissements',
  },
  {
    id: 'tm',
    terme: 'Taux de Marge (%)',
    definition: 'Le pourcentage de ton CA qui te reste après avoir payé les dépenses variables. Plus il est élevé, mieux c\'est.',
    exemple: 'Un taux de 40% signifie que sur 1000 FCFA vendus, tu gardes 400 FCFA',
    formule: 'TM = ((CA - CV) / CA) × 100',
  },
  {
    id: 'tp',
    terme: 'Taux de Profitabilité (%)',
    definition: 'Le pourcentage de bénéfice par rapport au CA. Il indique combien tu gagnes vraiment sur chaque vente.',
    exemple: 'Un taux de 15% = sur 1000 FCFA de ventes, tu gagnes 150 FCFA nets',
    formule: 'TP = (RN / CA) × 100',
  },
  {
    id: 'sr',
    terme: 'Seuil de Rentabilité (SR)',
    definition: 'Le montant minimum de CA que tu dois atteindre pour ne pas perdre d\'argent. En dessous, tu es en perte.',
    exemple: 'Si ton SR est 300 000 FCFA, tu dois vendre au moins ça pour être rentable',
    formule: 'SR = CF / Taux de Marge × 100',
  },
  {
    id: 're',
    terme: 'Rentabilité Économique (%)',
    definition: 'Compare ton bénéfice à ton investissement de départ. Ça montre si ton business est un bon placement.',
    exemple: 'RE 20% = pour 100 000 FCFA investis, tu gagnes 20 000 FCFA',
    formule: 'RE = (RN / Capital Investi) × 100',
  },
  {
    id: 'tn',
    terme: 'Trésorerie Nette',
    definition: "L'argent disponible réellement dans ta caisse. Ce qui est encaissé moins ce qui est décaissé.",
    exemple: 'Tu as reçu 500 000 et dépensé 350 000 → Trésorerie = 150 000 FCFA',
    formule: 'TN = Recettes encaissées – Dépenses décaissées',
  },
  {
    id: 'amort',
    terme: 'Amortissement',
    definition: "L'usure de ton matériel calculée en argent. Une moto de 400 000 FCFA qui dure 5 ans perd 80 000 FCFA/an de valeur.",
    exemple: 'Moto 400 000 FCFA / 5 ans = 80 000 FCFA/an = 219 FCFA/jour',
    formule: 'A = Valeur d\'achat / Durée de vie (ans)',
  },
];
