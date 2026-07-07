import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GLOSSAIRE_DATA = [
  {
    terme: 'Amortissement',
    definition:
      'Répartition du coût d\'un bien durable sur sa durée d\'utilisation. Permet de constater la perte de valeur d\'un équipement année après année.',
    exemple:
      'Un four acheté 500 000 FCFA avec une durée de vie de 5 ans s\'amortit de 100 000 FCFA par an.',
    categorie: 'comptabilite',
    ordre: 1,
  },
  {
    terme: 'Chiffre d\'affaires (CA)',
    definition:
      'Total des ventes réalisées sur une période. C\'est l\'argent qui entre dans votre activité.',
    exemple:
      'Si vous vendez 500 pains à 150 FCFA le mardi, votre CA du jour est 75 000 FCFA.',
    categorie: 'comptabilite',
    ordre: 2,
  },
  {
    terme: 'Charge',
    definition:
      'Dépenses nécessaires pour faire fonctionner l\'activité (achats, loyer, salaires, etc.).',
    exemple: 'Achat de farine, paiement du loyer, électricité.',
    categorie: 'comptabilite',
    ordre: 3,
  },
  {
    terme: 'Revenu',
    definition:
      'Argent reçu de la vente de produits ou services. Synonyme de recette ou vente.',
    exemple: 'Vente de vêtements, services de coiffure, vente de repas.',
    categorie: 'comptabilite',
    ordre: 4,
  },
  {
    terme: 'Bénéfice',
    definition:
      'Ce qui reste après avoir payé toutes les charges. Bénéfice = Revenus - Charges.',
    exemple: 'Si vous gagnez 200 000 FCFA et dépensez 150 000, votre bénéfice est 50 000 FCFA.',
    categorie: 'comptabilite',
    ordre: 5,
  },
  {
    terme: 'Marge',
    definition:
      'Différence entre le prix de vente et le coût d\'achat. Indique combien vous gagnez sur chaque vente.',
    exemple: 'Vous achetez un produit 1000 FCFA, vous le vendez 1500 FCFA → marge de 500 FCFA.',
    categorie: 'comptabilite',
    ordre: 6,
  },
  {
    terme: 'Trésorerie',
    definition:
      'Argent disponible immédiatement (en caisse ou au compte bancaire). C\'est votre cash.',
    exemple: 'Vous avez 150 000 FCFA en caisse + 80 000 FCFA au compte = trésorerie de 230 000 FCFA.',
    categorie: 'gestion',
    ordre: 7,
  },
  {
    terme: 'Crédit client',
    definition:
      'Argent que vos clients vous doivent. Vente à crédit non encore encaissée.',
    exemple: 'Un client achète pour 50 000 FCFA et promet de payer dans 2 semaines.',
    categorie: 'gestion',
    ordre: 8,
  },
  {
    terme: 'Stock',
    definition:
      'Marchandises ou matières premières que vous possédez mais pas encore vendues.',
    exemple: 'Tissus en réserve, sacs de farine, produits finis non vendus.',
    categorie: 'gestion',
    ordre: 9,
  },
  {
    terme: 'Point mort (seuil de rentabilité)',
    definition:
      'Montant de ventes nécessaire pour couvrir toutes vos charges. Au-delà, c\'est du bénéfice.',
    exemple:
      'Si vos charges fixes sont 300 000 FCFA/mois et votre marge 40%, il vous faut vendre pour 750 000 FCFA.',
    categorie: 'gestion',
    ordre: 10,
  },
  {
    terme: 'Charges fixes',
    definition:
      'Dépenses qui ne changent pas selon votre activité (loyer, abonnements, salaires fixes).',
    exemple: 'Loyer boutique 50 000 FCFA/mois (même si vous ne vendez rien).',
    categorie: 'gestion',
    ordre: 11,
  },
  {
    terme: 'Charges variables',
    definition:
      'Dépenses qui augmentent avec l\'activité (achats matières premières, commissions).',
    exemple: 'Plus vous produisez de pain, plus vous achetez de farine.',
    categorie: 'gestion',
    ordre: 12,
  },
  {
    terme: 'TVA',
    definition:
      'Taxe sur la Valeur Ajoutée. Impôt collecté sur vos ventes et reversé à l\'État.',
    exemple: 'Au Bénin, la TVA est généralement de 18%.',
    categorie: 'fiscal',
    ordre: 13,
  },
  {
    terme: 'Impôt sur les bénéfices',
    definition:
      'Taxe calculée sur le bénéfice de votre entreprise.',
    exemple: 'Si votre bénéfice annuel est 1 000 000 FCFA, l\'impôt sera un % de ce montant.',
    categorie: 'fiscal',
    ordre: 14,
  },
  {
    terme: 'Capital',
    definition:
      'Somme d\'argent investie au départ pour lancer l\'activité.',
    exemple: 'Vous démarrez avec 500 000 FCFA pour acheter équipements et stock initial.',
    categorie: 'gestion',
    ordre: 15,
  },
];

async function seedGlossaire() {
  console.log('🌱 Seeding glossaire...');

  await prisma.termeGlossaire.deleteMany({});

  for (const terme of GLOSSAIRE_DATA) {
    await prisma.termeGlossaire.create({
      data: terme,
    });
    console.log(`✅ ${terme.terme} (${terme.categorie})`);
  }

  console.log(`\n✅ ${GLOSSAIRE_DATA.length} termes créés !`);
}

seedGlossaire()
  .catch((e) => {
    console.error('❌ Erreur seed glossaire:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
