// C'PRO — Financial Engine (ported from Dart)
// All calculations run locally, no network dependency

export interface Transaction {
  type: 'recette' | 'depense';
  montant: number;
  categorie: string;
  sousCategorie?: string;
  date: string;
}

export interface Equipment {
  valeurAchat: number;
  dureeVieAns: number;
}

export interface FinancialIndicators {
  chiffreAffaires: number;
  chargesVariables: number;
  chargesFixes: number;
  margeSurCoutsVariables: number;
  tauxDeMarge: number;
  resultatNet: number;
  rentabiliteEconomique: number;
  rentabiliteFinanciere: number;
  tauxProfitabilite: number;
  seuilRentabilite: number;
  delaiRecuperation: number;
  tresorerieNette: number;
  amortissementAnnuel: number;
  amortissementQuotidien: number;
}

// CA = Σ Recettes
export function calculateCA(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'recette')
    .reduce((sum, t) => sum + t.montant, 0);
}

// CV = Σ Dépenses liées à la production
const CV_CATEGORIES = ['intrants', 'transport', 'matieres_premieres', 'carburant', 'semences', 'aliments_betail', 'tissu', 'farine'];
export function calculateCV(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'depense' && isVariableCost(t))
    .reduce((sum, t) => sum + t.montant, 0);
}

function isVariableCost(t: Transaction): boolean {
  return CV_CATEGORIES.some(cat => t.categorie.toLowerCase().includes(cat));
}

// CF = Σ Loyer + Salaires fixes + Taxes
const CF_CATEGORIES = ['loyer', 'salaires', 'taxes', 'main', 'infrastructure'];
export function calculateCF(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'depense' && isFixedCost(t))
    .reduce((sum, t) => sum + t.montant, 0);
}

function isFixedCost(t: Transaction): boolean {
  return CF_CATEGORIES.some(cat => t.categorie.toLowerCase().includes(cat));
}

// MCV = CA - CV
export function calculateMCV(ca: number, cv: number): number {
  return ca - cv;
}

// TM = (MCV / CA) × 100
export function calculateTauxDeMarge(ca: number, mcv: number): number {
  return ca > 0 ? (mcv / ca) * 100 : 0;
}

// RN = CA - CV - CF - Amortissements
export function calculateResultatNet(
  ca: number,
  cv: number,
  cf: number,
  amortissements: number
): number {
  return ca - cv - cf - amortissements;
}

// RE = (RN / Capital Investi) × 100
export function calculateRentabiliteEconomique(
  resultatNet: number,
  capitalInvesti: number
): number {
  return capitalInvesti > 0 ? (resultatNet / capitalInvesti) * 100 : 0;
}

// RF = (RN / Fonds Propres) × 100
export function calculateRentabiliteFinanciere(
  resultatNet: number,
  fondsPropres: number
): number {
  return fondsPropres > 0 ? (resultatNet / fondsPropres) * 100 : 0;
}

// TP = (RN / CA) × 100
export function calculateTauxProfitabilite(
  resultatNet: number,
  ca: number
): number {
  return ca > 0 ? (resultatNet / ca) * 100 : 0;
}

// SR = CF / TM (en FCFA de CA minimum)
export function calculateSeuilRentabilite(
  chargesFixes: number,
  tauxDeMarge: number
): number {
  return tauxDeMarge > 0 ? (chargesFixes / tauxDeMarge) * 100 : 0;
}

// DR = Capital Investi / RN mensuel moyen
export function calculateDelaiRecuperation(
  capitalInvesti: number,
  resultatNetMensuel: number
): number {
  return resultatNetMensuel > 0 ? capitalInvesti / resultatNetMensuel : Infinity;
}

// Amortissement linéaire annuel = Valeur achat / Durée de vie
export function calculateAmortissementAnnuel(
  valeurAchat: number,
  dureeVieAns: number
): number {
  return dureeVieAns > 0 ? valeurAchat / dureeVieAns : 0;
}

// Amortissement quotidien = Amortissement annuel / 365
export function calculateAmortissementQuotidien(
  valeurAchat: number,
  dureeVieAns: number
): number {
  return calculateAmortissementAnnuel(valeurAchat, dureeVieAns) / 365;
}

// Total amortissements pour une liste d'équipements
export function calculateTotalAmortissements(equipments: Equipment[]): number {
  return equipments.reduce((sum, eq) => {
    return sum + calculateAmortissementAnnuel(eq.valeurAchat, eq.dureeVieAns);
  }, 0);
}

// TN = Recettes encaissées - Dépenses décaissées
export function calculateTresorerieNette(transactions: Transaction[]): number {
  const recettes = transactions
    .filter(t => t.type === 'recette')
    .reduce((sum, t) => sum + t.montant, 0);
  const depenses = transactions
    .filter(t => t.type === 'depense')
    .reduce((sum, t) => sum + t.montant, 0);
  return recettes - depenses;
}

// Ratio Charges/CA = (Total charges / CA) × 100
export function calculateRatioChargesCA(ca: number, charges: number): number {
  return ca > 0 ? (charges / ca) * 100 : 0;
}

// Calculate all indicators at once
export function calculateAllIndicators(
  transactions: Transaction[],
  capitalInvesti: number,
  fondsPropres: number,
  equipments: Equipment[]
): FinancialIndicators {
  const ca = calculateCA(transactions);
  const cv = calculateCV(transactions);
  const cf = calculateCF(transactions);
  const amortAnnuel = calculateTotalAmortissements(equipments);
  const amortQuotidien = amortAnnuel / 365;
  const mcv = calculateMCV(ca, cv);
  const tm = calculateTauxDeMarge(ca, mcv);
  const rn = calculateResultatNet(ca, cv, cf, amortAnnuel);

  return {
    chiffreAffaires: ca,
    chargesVariables: cv,
    chargesFixes: cf,
    margeSurCoutsVariables: mcv,
    tauxDeMarge: tm,
    resultatNet: rn,
    rentabiliteEconomique: calculateRentabiliteEconomique(rn, capitalInvesti),
    rentabiliteFinanciere: calculateRentabiliteFinanciere(rn, fondsPropres),
    tauxProfitabilite: calculateTauxProfitabilite(rn, ca),
    seuilRentabilite: calculateSeuilRentabilite(cf, tm),
    delaiRecuperation: calculateDelaiRecuperation(capitalInvesti, rn / 12), // monthly avg
    tresorerieNette: calculateTresorerieNette(transactions),
    amortissementAnnuel: amortAnnuel,
    amortissementQuotidien: amortQuotidien,
  };
}

// Format FCFA for display
export function formatFCFA(amount: number | null | undefined): string {
  const safeAmount = Number.isFinite(amount) ? Number(amount) : 0;
  return new Intl.NumberFormat('fr-FR').format(Math.round(safeAmount)) + ' FCFA';
}

// Format percentage for display
export function formatPercent(value: number | null | undefined): string {
  const safeValue = Number.isFinite(value) ? Number(value) : 0;
  return safeValue.toFixed(1) + '%';
}
