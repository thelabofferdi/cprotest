export const METIERS = [
  { id: 'boulanger', label: 'Boulangerie', icon: '🍞' },
  { id: 'restaurant', label: 'Restauration / maquis', icon: '🍽️' },
  { id: 'elevage', label: 'Élevage', icon: '🐔' },
  { id: 'agriculture', label: 'Agriculture / maraîchage', icon: '🌾' },
  { id: 'riziculture', label: 'Riziculture', icon: '🌾' },
  { id: 'couturier', label: 'Couture', icon: '🧵' },
  { id: 'coiffeur', label: 'Coiffure', icon: '💇' },
  { id: 'epicerie', label: 'Épicerie / boutique', icon: '🏪' },
  { id: 'patisserie', label: 'Pâtisserie', icon: '🎂' },
  { id: 'vendeur_huile', label: "Vente d'huile", icon: '🛢️' },
  { id: 'vente_en_ligne', label: 'Vente en ligne', icon: '📱' },
  { id: 'producteur_jus', label: 'Production de jus', icon: '🥤' },
  { id: 'mecanique', label: 'Mécanique / garage', icon: '🔧' },
  { id: 'menuiserie', label: 'Menuiserie', icon: '🪚' },
  { id: 'transport', label: 'Transport', icon: '🏍️' },
  { id: 'etudiant_revendeur', label: 'Étudiant revendeur', icon: '🎒' },
  { id: 'autre', label: 'Autre', icon: '💼' },
] as const;

export const RECETTE_CATEGORIES = [
  { id: 'vente', label: 'Vente', icon: 'cash-outline' },
  { id: 'service', label: 'Service', icon: 'briefcase-outline' },
  { id: 'acompte', label: 'Acompte', icon: 'receipt-outline' },
  { id: 'remboursement', label: 'Remboursement', icon: 'return-up-back-outline' },
  { id: 'autre_recette', label: 'Autre', icon: 'add-circle-outline' },
] as const;

export const DEPENSE_CATEGORIES = [
  { id: 'intrants', label: 'Intrants / Matières premières', icon: '📦',
    sousCategories: ['Semences', 'Aliments bétail', 'Farine', 'Tissu', 'Carburant achat'] },
  { id: 'transport', label: 'Transport & Mobilité', icon: '🚗',
    sousCategories: ['Carburant', 'Taxi', 'Mototaxi', 'Convoyage'] },
  { id: 'main', label: "Main-d'œuvre", icon: '👷',
    sousCategories: ['Salaires journaliers', 'Aides familiales', 'MO saisonnière'] },
  { id: 'loyer', label: 'Loyer & Infrastructure', icon: '🏠',
    sousCategories: ['Place de marché', 'Box', 'Terrain', 'Kiosque'] },
  { id: 'equipement', label: 'Équipement & Outils', icon: '🛠️',
    sousCategories: ['Achat matériel', 'Réparation', 'Maintenance'] },
  { id: 'taxes', label: 'Taxes & Contributions', icon: '📋',
    sousCategories: ['DGI', 'Mairie', 'Cotisations', 'Droits de place'] },
  { id: 'dettes', label: 'Remboursement dettes', icon: '💳',
    sousCategories: ['Tontine', 'Microfinance', 'CLCAM', 'IMF'] },
  { id: 'imprevus', label: 'Dépenses imprévues', icon: '⚡',
    sousCategories: ['Urgences médicales', 'Pertes marchandises', 'Vols'] },
] as const;

export function getTransactionCategoryLabel(categoryId: string): string {
  const categories = [...RECETTE_CATEGORIES, ...DEPENSE_CATEGORIES];
  return categories.find(category => category.id === categoryId)?.label ?? categoryId;
}

export const EQUIPEMENTS_DEFAULT = [
  { nom: 'Moto (zémidjan, livraison)', dureeVieAns: 5, valeurType: 400000 },
  { nom: 'Tricycle / Pousse-pousse', dureeVieAns: 4, valeurType: 150000 },
  { nom: 'Congélateur / Réfrigérateur', dureeVieAns: 7, valeurType: 200000 },
  { nom: 'Équipement coiffure / couture', dureeVieAns: 5, valeurType: 100000 },
  { nom: 'Table de vente / étalage', dureeVieAns: 3, valeurType: 30000 },
  { nom: 'Four / Matériel de cuisson', dureeVieAns: 5, valeurType: 80000 },
  { nom: 'Matériel agricole', dureeVieAns: 2, valeurType: 20000 },
  { nom: 'Smartphone / Tablette', dureeVieAns: 3, valeurType: 90000 },
] as const;
