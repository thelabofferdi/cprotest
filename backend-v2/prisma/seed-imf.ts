import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const IMF_DATA = [
  {
    slug: 'padme',
    nom: 'Association pour la Promotion et l\'Appui au Développement de Micro-Entreprises',
    sigle: 'PADME',
    type: 'imf',
    ville: 'Cotonou',
    quartier: 'Akpakpa',
    telephone: '+229 21 33 53 53',
    email: 'info@padme-benin.org',
    siteWeb: 'www.padme-benin.org',
    description:
      'Leader de la microfinance au Bénin, PADME accompagne les micro et petites entreprises depuis 1993.',
    services: JSON.stringify([
      'micro-credit',
      'epargne',
      'credit-equipement',
      'credit-fonds-roulement',
      'formation',
    ]),
    montantMin: 50000,
    montantMax: 10000000,
    tauxInteret: '12-24% par an',
    ordre: 1,
  },
  {
    slug: 'papme',
    nom: 'Programme d\'Appui aux Petites et Moyennes Entreprises',
    sigle: 'PAPME',
    type: 'imf',
    ville: 'Cotonou',
    telephone: '+229 21 31 05 55',
    description:
      'Institution de microfinance spécialisée dans le financement des PME.',
    services: JSON.stringify([
      'micro-credit',
      'credit-pme',
      'epargne',
      'assurance',
    ]),
    montantMin: 100000,
    montantMax: 15000000,
    tauxInteret: '10-18% par an',
    ordre: 2,
  },
  {
    slug: 'vital-finance',
    nom: 'Vital Finance',
    sigle: 'VF',
    type: 'imf',
    ville: 'Cotonou',
    quartier: 'Cadjèhoun',
    telephone: '+229 21 30 08 08',
    email: 'contact@vitalfinance-benin.com',
    description:
      'Microfinance accessible avec réseau étendu au Bénin.',
    services: JSON.stringify(['micro-credit', 'epargne', 'mobile-money']),
    montantMin: 30000,
    montantMax: 5000000,
    tauxInteret: '15-20% par an',
    ordre: 3,
  },
  {
    slug: 'finadev',
    nom: 'Financière Africaine de Développement',
    sigle: 'FINADEV',
    type: 'imf',
    ville: 'Cotonou',
    telephone: '+229 21 31 22 33',
    description:
      'Spécialisée dans le crédit aux agriculteurs et commerçants.',
    services: JSON.stringify([
      'micro-credit',
      'credit-agricole',
      'epargne',
    ]),
    montantMin: 50000,
    montantMax: 8000000,
    tauxInteret: '14-22% par an',
    ordre: 4,
  },
  {
    slug: 'clcam',
    nom: 'Caisse Locale de Crédit Agricole Mutuel',
    sigle: 'CLCAM',
    type: 'cooperative',
    ville: 'Bohicon',
    telephone: '+229 22 51 00 25',
    description:
      'Réseau de caisses mutuelles d\'épargne et de crédit en milieu rural.',
    services: JSON.stringify([
      'epargne',
      'credit-agricole',
      'micro-credit',
    ]),
    montantMin: 25000,
    montantMax: 3000000,
    tauxInteret: '12-18% par an',
    ordre: 5,
  },
  {
    slug: 'alide',
    nom: 'Agence de Financement des Initiatives de Base',
    sigle: 'ALIDE',
    type: 'imf',
    ville: 'Porto-Novo',
    telephone: '+229 20 21 35 45',
    description:
      'Soutien aux initiatives locales et entrepreneuriat féminin.',
    services: JSON.stringify([
      'micro-credit',
      'epargne',
      'credit-femme',
      'formation',
    ]),
    montantMin: 20000,
    montantMax: 2000000,
    tauxInteret: '15-24% par an',
    ordre: 6,
  },
  {
    slug: 'fececam',
    nom: 'Fédération des Caisses d\'Épargne et de Crédit Agricole Mutuel',
    sigle: 'FECECAM',
    type: 'cooperative',
    ville: 'Cotonou',
    telephone: '+229 21 30 72 72',
    email: 'contact@fececam.bj',
    siteWeb: 'www.fececam.bj',
    description:
      'Plus grand réseau de microfinance mutualiste du Bénin.',
    services: JSON.stringify([
      'epargne',
      'credit-agricole',
      'micro-credit',
      'transfert-argent',
    ]),
    montantMin: 20000,
    montantMax: 5000000,
    tauxInteret: '10-16% par an',
    ordre: 7,
  },
  {
    slug: 'wages',
    nom: 'Women and Association for Gain both Economic and Social',
    sigle: 'WAGES',
    type: 'imf',
    ville: 'Parakou',
    telephone: '+229 23 61 25 36',
    description:
      'Institution ciblant particulièrement les femmes entrepreneures.',
    services: JSON.stringify([
      'micro-credit',
      'credit-femme',
      'epargne',
      'formation',
    ]),
    montantMin: 25000,
    montantMax: 3000000,
    tauxInteret: '18-24% par an',
    ordre: 8,
  },
  {
    slug: 'renaca',
    nom: 'Réseau National des Caisses Rurales d\'Epargne et de Crédit',
    sigle: 'RENACA',
    type: 'cooperative',
    ville: 'Natitingou',
    telephone: '+229 23 82 11 22',
    description:
      'Réseau de caisses rurales dans le Nord-Bénin.',
    services: JSON.stringify(['epargne', 'micro-credit', 'credit-agricole']),
    montantMin: 15000,
    montantMax: 2000000,
    tauxInteret: '14-20% par an',
    ordre: 9,
  },
  {
    slug: 'mecref',
    nom: 'Mutuelles d\'Épargne et de Crédit des Femmes',
    sigle: 'MECREF',
    type: 'cooperative',
    ville: 'Cotonou',
    telephone: '+229 21 32 45 67',
    description:
      'Mutuelles dédiées à l\'autonomisation financière des femmes.',
    services: JSON.stringify(['epargne', 'micro-credit', 'credit-femme']),
    montantMin: 10000,
    montantMax: 1500000,
    tauxInteret: '16-22% par an',
    ordre: 10,
  },
];

async function seedIMF() {
  console.log('🌱 Seeding IMF du Bénin...');

  await prisma.iMF.deleteMany({});

  for (const imf of IMF_DATA) {
    await prisma.iMF.create({
      data: imf,
    });
    console.log(`✅ ${imf.sigle || imf.nom} (${imf.ville}, type: ${imf.type})`);
  }

  console.log(`\n✅ ${IMF_DATA.length} IMF créées !`);
  console.log(`\nRépartition:`);
  console.log(`- IMF: ${IMF_DATA.filter((i) => i.type === 'imf').length}`);
  console.log(
    `- Coopératives: ${IMF_DATA.filter((i) => i.type === 'cooperative').length}`,
  );
}

seedIMF()
  .catch((e) => {
    console.error('❌ Erreur seed IMF:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
