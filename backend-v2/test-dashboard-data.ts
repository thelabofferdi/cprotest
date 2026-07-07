import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestData() {
  // Récupérer l'user hulbofo
  const user = await prisma.user.findUnique({
    where: { email: 'hulbofo@gmail.com' },
  });

  if (!user) {
    console.log('❌ User hulbofo@gmail.com non trouvé');
    return;
  }

  console.log('✅ User trouvé:', user.id);

  // Créer un profil avec objectif
  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      nom: 'BOFO',
      prenom: 'Hulbot',
      telephone: '+22890000000',
      telephoneMomo: '+22890000000',
      metierSlug: 'commerce-general',
      lieu: 'Cotonou',
      capitalDepart: 500000,
      modeFinancement: 'PROPRE',
      devise: 'XOF',
      objectifCaMensuel: 2000000, // 2M FCFA
    },
    update: {
      objectifCaMensuel: 2000000,
    },
  });

  console.log('✅ Profil créé/mis à jour');

  // Créer des équipements
  const now = new Date();
  const equipment1 = await prisma.equipment.create({
    data: {
      userId: user.id,
      nom: 'Ordinateur portable',
      typeSlug: 'informatique',
      valeurAchat: 500000,
      dureeVieAns: 3,
      dateAchat: new Date(now.getFullYear() - 1, 0, 1),
      amortAnnuel: 166666.67,
      amortMensuel: 13888.89,
      amortJournalier: 456.62,
      valeurResiduelle: 333333.33,
      isActive: true,
    },
  });

  const equipment2 = await prisma.equipment.create({
    data: {
      userId: user.id,
      nom: 'Moto',
      typeSlug: 'vehicule',
      valeurAchat: 800000,
      dureeVieAns: 5,
      dateAchat: new Date(now.getFullYear(), 0, 1),
      amortAnnuel: 160000,
      amortMensuel: 13333.33,
      amortJournalier: 438.36,
      valeurResiduelle: 640000,
      isActive: true,
    },
  });

  console.log('✅ 2 équipements créés');

  // Créer des clients
  const client1 = await prisma.client.create({
    data: {
      userId: user.id,
      nom: 'DJOSSOU',
      prenom: 'Jean',
      telephone: '+22997123456',
      soldeCredit: 0,
    },
  });

  const client2 = await prisma.client.create({
    data: {
      userId: user.id,
      nom: 'AGOSSOU',
      prenom: 'Marie',
      telephone: '+22997654321',
      soldeCredit: 50000,
      limitCredit: 100000,
    },
  });

  console.log('✅ 2 clients créés');

  // Créer des transactions du mois en cours
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Ventes
  const transactions: any[] = [];
  for (let i = 1; i <= 15; i++) {
    transactions.push(
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'VENTE',
          montant: 50000 + Math.random() * 100000,
          categorie: 'VENTE_PRODUIT',
          modePaiement: i % 3 === 0 ? 'MOMO' : 'CASH',
          clientId: i % 2 === 0 ? client1.id : null,
          date: new Date(now.getFullYear(), now.getMonth(), i),
        },
      }),
    );
  }

  // Services
  for (let i = 1; i <= 5; i++) {
    transactions.push(
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'SERVICE',
          montant: 30000 + Math.random() * 50000,
          categorie: 'SERVICE_PRESTATION',
          modePaiement: 'MOMO',
          date: new Date(now.getFullYear(), now.getMonth(), i * 2),
        },
      }),
    );
  }

  // Dépenses fixes
  transactions.push(
    prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'DEPENSE',
        montant: 50000,
        categorie: 'FIXE',
        sousCategorie: 'LOYER',
        modePaiement: 'CASH',
        notes: 'Loyer boutique',
        date: new Date(now.getFullYear(), now.getMonth(), 1),
      },
    }),
  );

  transactions.push(
    prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'DEPENSE',
        montant: 15000,
        categorie: 'FIXE',
        sousCategorie: 'SALAIRE',
        modePaiement: 'MOMO',
        notes: 'Salaire aide',
        date: new Date(now.getFullYear(), now.getMonth(), 1),
      },
    }),
  );

  // Dépenses variables
  for (let i = 1; i <= 10; i++) {
    transactions.push(
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'DEPENSE',
          montant: 20000 + Math.random() * 40000,
          categorie: 'VARIABLE',
          sousCategorie: 'STOCK',
          modePaiement: 'CASH',
          notes: `Achat stock ${i}`,
          date: new Date(now.getFullYear(), now.getMonth(), i + 5),
        },
      }),
    );
  }

  await Promise.all(transactions);

  console.log(`✅ ${transactions.length} transactions créées`);

  // Résumé
  const stats = {
    user: user.email,
    profile: true,
    equipments: 2,
    clients: 2,
    transactions: transactions.length,
  };

  console.log('\n📊 Données de test créées:');
  console.log(JSON.stringify(stats, null, 2));
  console.log('\n✅ Testez maintenant: GET /dashboard?period=month');
}

createTestData()
  .catch((e) => {
    console.error('❌ Erreur:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
