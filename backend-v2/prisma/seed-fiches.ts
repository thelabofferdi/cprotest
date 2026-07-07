import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FICHES_DATA = [
  {
    slug: 'comprendre-son-benefice',
    titre: 'Comprendre son bénéfice',
    description:
      'Apprenez à calculer et analyser le bénéfice de votre activité',
    categorie: 'compta-base',
    duree: 5,
    ordre: 1,
    contenu: JSON.stringify({
      sections: [
        {
          titre: 'Qu\'est-ce que le bénéfice ?',
          texte:
            'Le bénéfice, c\'est ce qui reste dans votre poche après avoir payé toutes vos dépenses. C\'est la vraie récompense de votre travail.',
        },
        {
          titre: 'Formule simple',
          formule: 'Bénéfice = Revenus - Charges',
          exemple: {
            revenus: 500000,
            charges: 350000,
            benefice: 150000,
            devise: 'FCFA',
          },
        },
        {
          titre: 'Les revenus',
          liste: [
            'Ventes de produits',
            'Prestations de services',
            'Autres recettes',
          ],
        },
        {
          titre: 'Les charges',
          liste: [
            'Achats de matières premières',
            'Loyer',
            'Électricité et eau',
            'Salaires',
            'Amortissements',
          ],
        },
        {
          titre: 'Pourquoi c\'est important ?',
          points: [
            'Savoir si votre activité est rentable',
            'Prendre de bonnes décisions',
            'Prévoir vos impôts',
            'Planifier vos investissements',
          ],
        },
      ],
    }),
  },
  {
    slug: 'gerer-sa-tresorerie',
    titre: 'Gérer sa trésorerie au quotidien',
    description:
      'Maîtrisez votre argent disponible et évitez les problèmes de cash',
    categorie: 'gestion-tresorerie',
    duree: 7,
    ordre: 2,
    contenu: JSON.stringify({
      sections: [
        {
          titre: 'La trésorerie, c\'est quoi ?',
          texte:
            'C\'est l\'argent que vous avez réellement disponible : en caisse, au compte bancaire ou en Mobile Money.',
        },
        {
          titre: 'Pourquoi c\'est différent du bénéfice ?',
          exemple:
            'Vous pouvez avoir un bon bénéfice mais pas d\'argent disponible si vos clients paient à crédit ou si vous avez acheté beaucoup de stock.',
        },
        {
          titre: 'Règles d\'or',
          liste: [
            'Suivez votre caisse tous les jours',
            'Séparez argent personnel et argent professionnel',
            'Gardez toujours une réserve de sécurité (1-2 mois de charges)',
            'Limitez les crédits clients',
            'Payez vos fournisseurs à temps pour garder leur confiance',
          ],
        },
        {
          titre: 'Signes de danger',
          alertes: [
            'Caisse qui baisse régulièrement',
            'Difficulté à payer les charges',
            'Emprunts pour payer les dépenses courantes',
            'Stock qui augmente sans ventes',
          ],
        },
      ],
    }),
  },
  {
    slug: 'fixer-ses-prix',
    titre: 'Fixer ses prix de vente',
    description:
      'Apprenez à calculer vos prix pour couvrir vos coûts et dégager une marge',
    categorie: 'gestion-tresorerie',
    duree: 6,
    ordre: 3,
    contenu: JSON.stringify({
      sections: [
        {
          titre: 'Les éléments du prix',
          composantes: [
            'Coût d\'achat ou de production',
            'Charges variables',
            'Part des charges fixes',
            'Marge bénéficiaire',
          ],
        },
        {
          titre: 'Méthode simple : le coefficient multiplicateur',
          exemple: {
            coutAchat: 1000,
            coefficient: 2,
            prixVente: 2000,
            explication:
              'Pour un coût d\'achat de 1000 FCFA, avec un coefficient de 2, vous vendez à 2000 FCFA. Votre marge est 1000 FCFA (50%).',
          },
        },
        {
          titre: 'Vérifiez votre prix',
          questions: [
            'Est-ce que je couvre tous mes coûts ?',
            'Qu\'est-ce que font mes concurrents ?',
            'Mes clients peuvent-ils payer ce prix ?',
            'Ma marge me permet-elle de vivre et d\'investir ?',
          ],
        },
        {
          titre: 'Erreurs à éviter',
          liste: [
            'Prix trop bas : vous travaillez à perte',
            'Prix trop élevé : vous n\'avez pas de clients',
            'Oublier certaines charges dans le calcul',
            'Ne jamais revoir ses prix',
          ],
        },
      ],
    }),
  },
  {
    slug: 'tenir-ses-comptes',
    titre: 'Tenir ses comptes simplement',
    description:
      'Les bases pour suivre son argent sans se compliquer',
    categorie: 'compta-base',
    duree: 8,
    ordre: 4,
    contenu: JSON.stringify({
      sections: [
        {
          titre: 'Pourquoi tenir ses comptes ?',
          raisons: [
            'Savoir combien vous gagnez vraiment',
            'Repérer les problèmes rapidement',
            'Préparer vos déclarations fiscales',
            'Convaincre une banque ou un partenaire',
          ],
        },
        {
          titre: 'Minimum à noter chaque jour',
          liste: [
            'Toutes les ventes (avec détails)',
            'Tous les achats et dépenses',
            'Argent en caisse en fin de journée',
            'Crédits donnés ou remboursés',
          ],
        },
        {
          titre: 'Les documents à garder',
          documents: [
            'Factures d\'achat',
            'Reçus de paiement',
            'Relevés bancaires',
            'Cahier de caisse',
          ],
        },
        {
          titre: 'Avec C\'PRO',
          avantages: [
            'Enregistrez vos transactions en 30 secondes',
            'Synchronisation automatique mobile/serveur',
            'Calculs automatiques du bénéfice',
            'Rapports instantanés',
          ],
        },
      ],
    }),
  },
];

async function seedFiches() {
  console.log('🌱 Seeding fiches pédagogiques...');

  await prisma.fichePedagogique.deleteMany({});

  for (const fiche of FICHES_DATA) {
    await prisma.fichePedagogique.create({
      data: fiche,
    });
    console.log(`✅ ${fiche.titre} (${fiche.categorie}, ~${fiche.duree}min)`);
  }

  console.log(`\n✅ ${FICHES_DATA.length} fiches créées !`);
}

seedFiches()
  .catch((e) => {
    console.error('❌ Erreur seed fiches:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
