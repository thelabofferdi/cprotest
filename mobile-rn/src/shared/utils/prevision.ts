// C'PRO — Prevision Engine (ported from Dart)
// Budget prévisionnel, simulation épargne, calcul de prêts

export interface PrevisionResult {
  mois: string;
  caPrevisionnel: number;
  epargneCumulee: number;
}

export interface LoanSimulation {
  mensualite: number;
  totalRembourse: number;
  totalInterets: number;
  echeancier: { mois: number; capital: number; interets: number; restant: number }[];
}

// CA prévisionnel M+n = CA référence × (1 + taux croissance mensuel)^n
export function calculateCAPrevisionnel(
  caReference: number,
  tauxCroissanceMensuel: number,
  moisNombre: number
): number {
  return caReference * Math.pow(1 + tauxCroissanceMensuel, moisNombre);
}

// Budget prévisionnel sur 6 mois
export function calculateBudgetPrevisionnel(
  caReference: number,
  tauxCroissanceMensuel: number,
  epargneMensuelle: number
): PrevisionResult[] {
  const results: PrevisionResult[] = [];
  let epargneCumulee = 0;

  for (let i = 0; i < 6; i++) {
    const caPrev = calculateCAPrevisionnel(caReference, tauxCroissanceMensuel, i);
    epargneCumulee += epargneMensuelle;

    const month = new Date();
    month.setMonth(month.getMonth() + i);

    results.push({
      mois: month.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
      caPrevisionnel: Math.round(caPrev),
      epargneCumulee: Math.round(epargneCumulee),
    });
  }

  return results;
}

// Délai pour atteindre un objectif d'épargne
// Délai (mois) = Montant cible ÷ Capacité d'épargne mensuelle
export function calculateDelaiObjectif(
  montantCible: number,
  capaciteEpargneMensuelle: number
): number {
  return capaciteEpargneMensuelle > 0
    ? Math.ceil(montantCible / capaciteEpargneMensuelle)
    : Infinity;
}

// Simulation de remboursement de prêt
// Mensualité = P × (r × (1+r)^n) / ((1+r)^n – 1)
export function simulateLoan(
  principal: number,
  tauxAnnuel: number,
  dureeMois: number
): LoanSimulation {
  const tauxMensuel = tauxAnnuel / 12 / 100;
  const echeancier: LoanSimulation['echeancier'] = [];

  if (tauxMensuel === 0) {
    // No interest — simple division
    const mensualite = principal / dureeMois;
    let restant = principal;

    for (let i = 1; i <= dureeMois; i++) {
      restant -= mensualite;
      echeancier.push({
        mois: i,
        capital: mensualite,
        interets: 0,
        restant: Math.max(0, restant),
      });
    }

    return {
      mensualite: Math.round(mensualite),
      totalRembourse: principal,
      totalInterets: 0,
      echeancier,
    };
  }

  const puissance = Math.pow(1 + tauxMensuel, dureeMois);
  const mensualite = principal * (tauxMensuel * puissance) / (puissance - 1);

  let restant = principal;
  let totalInterets = 0;

  for (let i = 1; i <= dureeMois; i++) {
    const interets = restant * tauxMensuel;
    const capital = mensualite - interets;
    restant -= capital;
    totalInterets += interets;

    echeancier.push({
      mois: i,
      capital: Math.round(capital),
      interets: Math.round(interets),
      restant: Math.max(0, Math.round(restant)),
    });
  }

  return {
    mensualite: Math.round(mensualite),
    totalRembourse: Math.round(mensualite * dureeMois),
    totalInterets: Math.round(totalInterets),
    echeancier,
  };
}

// Taux de croissance mensuel moyen basé sur l'historique
export function calculateTauxCroissance(
  caMoisPrecedents: number[]
): number {
  if (caMoisPrecedents.length < 2) return 0;

  const taux: number[] = [];
  for (let i = 1; i < caMoisPrecedents.length; i++) {
    if (caMoisPrecedents[i - 1] > 0) {
      taux.push((caMoisPrecedents[i] - caMoisPrecedents[i - 1]) / caMoisPrecedents[i - 1]);
    }
  }

  return taux.length > 0
    ? taux.reduce((sum, t) => sum + t, 0) / taux.length
    : 0;
}

// Alerte mensuelle épargne
export function generateEpargneAlert(
  epargneRequise: number,
  epargneActuelle: number
): string | null {
  if (epargneActuelle < epargneRequise) {
    const manque = epargneRequise - epargneActuelle;
    return `Tu dois épargner ${formatFCFA(manque)} de plus ce mois pour atteindre ton objectif`;
  }
  return null;
}

export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' FCFA';
}
