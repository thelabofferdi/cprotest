import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const AMORTISSEMENTS_DATA = [
  {
    slug: 'materiel-informatique',
    nom: 'Matériel informatique',
    description: 'Ordinateurs, serveurs, équipements IT',
    dureeVieAns: 3,
    exemples: JSON.stringify([
      'Ordinateur portable',
      'PC de bureau',
      'Serveur',
      'Imprimante',
      'Scanner',
    ]),
    ordre: 1,
  },
  {
    slug: 'mobilier-bureau',
    nom: 'Mobilier de bureau',
    description: 'Bureaux, chaises, armoires',
    dureeVieAns: 10,
    exemples: JSON.stringify([
      'Bureau',
      'Chaise de bureau',
      'Armoire',
      'Étagère',
      'Table de réunion',
    ]),
    ordre: 2,
  },
  {
    slug: 'vehicules',
    nom: 'Véhicules',
    description: 'Voitures, motos, véhicules utilitaires',
    dureeVieAns: 5,
    exemples: JSON.stringify([
      'Voiture',
      'Moto',
      'Camionnette',
      'Tricycle',
    ]),
    ordre: 3,
  },
  {
    slug: 'machines-outils',
    nom: 'Machines et outils',
    description: 'Équipements de production et outillage',
    dureeVieAns: 7,
    exemples: JSON.stringify([
      'Machine à coudre',
      'Four boulangerie',
      'Perceuse',
      'Scie électrique',
      'Fraiseuse',
    ]),
    ordre: 4,
  },
  {
    slug: 'equipement-commercial',
    nom: 'Équipement commercial',
    description: 'Matériel pour commerce et vente',
    dureeVieAns: 5,
    exemples: JSON.stringify([
      'Réfrigérateur commercial',
      'Vitrine réfrigérée',
      'Caisse enregistreuse',
      'Présentoir',
      'Balance',
    ]),
    ordre: 5,
  },
  {
    slug: 'batiment-construction',
    nom: 'Bâtiments et constructions',
    description: 'Locaux commerciaux, entrepôts',
    dureeVieAns: 20,
    exemples: JSON.stringify([
      'Local commercial',
      'Atelier',
      'Entrepôt',
      'Kiosque',
    ]),
    ordre: 6,
  },
  {
    slug: 'materiel-agricole',
    nom: 'Matériel agricole',
    description: 'Équipements pour l\'agriculture',
    dureeVieAns: 8,
    exemples: JSON.stringify([
      'Motoculteur',
      'Pulvérisateur',
      'Système d\'irrigation',
      'Serre',
      'Charrue',
    ]),
    ordre: 7,
  },
  {
    slug: 'equipement-restauration',
    nom: 'Équipement de restauration',
    description: 'Matériel de cuisine professionnelle',
    dureeVieAns: 7,
    exemples: JSON.stringify([
      'Cuisinière professionnelle',
      'Frigo restaurant',
      'Four à pizza',
      'Batterie de cuisine pro',
      'Mixeur industriel',
    ]),
    ordre: 8,
  },
];

async function seedAmortissements() {
  console.log('🌱 Seeding types d\'amortissement...');

  // Nettoyer les anciennes données
  await prisma.typeAmortissement.deleteMany({});

  for (const typeData of AMORTISSEMENTS_DATA) {
    const tauxAnnuel = (100 / typeData.dureeVieAns);

    const type = await prisma.typeAmortissement.create({
      data: {
        ...typeData,
        tauxAnnuel: parseFloat(tauxAnnuel.toFixed(2)),
      },
    });

    console.log(
      `✅ ${type.nom}: ${type.dureeVieAns} ans (taux: ${type.tauxAnnuel}%)`,
    );
  }

  console.log(`\n✅ ${AMORTISSEMENTS_DATA.length} types d'amortissement créés !`);
}

seedAmortissements()
  .catch((e) => {
    console.error('❌ Erreur seed amortissements:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
