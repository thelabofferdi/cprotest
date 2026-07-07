import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';
import type { Transaction, UserProfile } from '../../types';

let db: SQLiteDatabase | null = null;

type DbValue = string | number | boolean | null;
type DbRecord = Record<string, DbValue>;
type DbRow = Record<string, unknown>;

export function getDatabase(): SQLiteDatabase {
  if (!db) {
    db = openDatabaseSync('cpro.db');
    initializeDatabase();
  }
  return db;
}

function initializeDatabase() {
  if (!db) return;

  db.runSync(`CREATE TABLE IF NOT EXISTS user_profiles (
    user_id TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    metier TEXT NOT NULL,
    lieu TEXT NOT NULL,
    capital_depart REAL NOT NULL,
    mode_financement TEXT NOT NULL,
    devise TEXT DEFAULT 'XOF',
    photo_url TEXT,
    logo_url TEXT,
    logo_preset TEXT,
    created_at TEXT NOT NULL
  )`);

  ensureColumn('user_profiles', 'photo_url', 'TEXT');
  ensureColumn('user_profiles', 'logo_url', 'TEXT');
  ensureColumn('user_profiles', 'logo_preset', 'TEXT');

  db.runSync(`CREATE TABLE IF NOT EXISTS transactions (
    tx_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('recette', 'depense')),
    montant REAL NOT NULL,
    categorie TEXT NOT NULL,
    sous_categorie TEXT,
    mode_paiement TEXT NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    quantite INTEGER,
    prix_unitaire REAL,
    client TEXT,
    synced INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  )`);

  db.runSync(`CREATE INDEX IF NOT EXISTS idx_tx_user_date 
    ON transactions(user_id, date)`);

  db.runSync(`CREATE INDEX IF NOT EXISTS idx_tx_synced 
    ON transactions(synced)`);

  db.runSync(`CREATE TABLE IF NOT EXISTS equipments (
    equip_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    nom TEXT NOT NULL,
    valeur_achat REAL NOT NULL,
    duree_vie_ans INTEGER NOT NULL,
    date_achat TEXT NOT NULL,
    amortissement_quotidien REAL NOT NULL
  )`);

  db.runSync(`CREATE TABLE IF NOT EXISTS documents (
    doc_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    titre TEXT NOT NULL,
    client_nom TEXT,
    client_adresse TEXT,
    client_telephone TEXT,
    lignes_json TEXT NOT NULL,
    total_ht REAL NOT NULL,
    tva REAL NOT NULL,
    total_ttc REAL NOT NULL,
    statut TEXT DEFAULT 'brouillon',
    created_at TEXT NOT NULL
  )`);

  db.runSync(`CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY,
    operation TEXT NOT NULL CHECK(operation IN ('create', 'update', 'delete')),
    entity TEXT NOT NULL,
    payload TEXT NOT NULL,
    synced INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  )`);

  db.runSync(`CREATE TABLE IF NOT EXISTS financial_goals (
    goal_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    montant_cible REAL NOT NULL,
    epargne_par_mois REAL NOT NULL,
    date_objectif TEXT NOT NULL
  )`);
}

function ensureColumn(table: string, column: string, type: string) {
  if (!db) return;
  try {
    db.runSync(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  } catch {
    // Existing installs already have the column after the first migration pass.
  }
}

function normalizeTransactionForDb(tx: Partial<Transaction> & DbRecord): DbRecord {
  const row: DbRecord = {};

  Object.entries(tx).forEach(([key, value]) => {
    const dbKey = ({
      txId: 'tx_id',
      userId: 'user_id',
      sousCategorie: 'sous_categorie',
      modePaiement: 'mode_paiement',
      prixUnitaire: 'prix_unitaire',
      createdAt: 'created_at',
    } as Record<string, string>)[key] ?? key;

    row[dbKey] = key === 'synced' ? (value ? 1 : 0) : value;
  });

  return row;
}

function normalizeProfileForDb(profile: Partial<UserProfile> & DbRecord): DbRecord {
  const row: DbRecord = {};

  Object.entries(profile).forEach(([key, value]) => {
    const dbKey = ({
      userId: 'user_id',
      capitalDepart: 'capital_depart',
      modeFinancement: 'mode_financement',
      photoUrl: 'photo_url',
      logoUrl: 'logo_url',
      logoPreset: 'logo_preset',
      createdAt: 'created_at',
    } as Record<string, string>)[key] ?? key;

    row[dbKey] = value;
  });

  return row;
}

function mapTransactionFromDb(row: DbRow): Transaction {
  return {
    txId: String(row.txId ?? row.tx_id),
    userId: String(row.userId ?? row.user_id),
    type: row.type as Transaction['type'],
    montant: Number(row.montant ?? 0),
    categorie: String(row.categorie ?? ''),
    sousCategorie: row.sousCategorie ?? row.sous_categorie
      ? String(row.sousCategorie ?? row.sous_categorie)
      : undefined,
    modePaiement: (row.modePaiement ?? row.mode_paiement) as Transaction['modePaiement'],
    date: String(row.date ?? ''),
    notes: row.notes ? String(row.notes) : undefined,
    quantite: row.quantite === null || row.quantite === undefined ? undefined : Number(row.quantite),
    prixUnitaire: row.prixUnitaire ?? row.prix_unitaire
      ? Number(row.prixUnitaire ?? row.prix_unitaire)
      : undefined,
    client: row.client ? String(row.client) : undefined,
    synced: Boolean(row.synced),
    createdAt: String(row.createdAt ?? row.created_at ?? ''),
  };
}

function mapProfileFromDb(row: DbRow | null): UserProfile | null {
  if (!row) return null;

  return {
    userId: String(row.userId ?? row.user_id),
    nom: String(row.nom ?? ''),
    metier: row.metier as UserProfile['metier'],
    lieu: String(row.lieu ?? ''),
    capitalDepart: Number(row.capitalDepart ?? row.capital_depart ?? 0),
    modeFinancement: (row.modeFinancement ?? row.mode_financement) as UserProfile['modeFinancement'],
    devise: 'XOF',
    photoUrl: row.photoUrl ?? row.photo_url ? String(row.photoUrl ?? row.photo_url) : null,
    logoUrl: row.logoUrl ?? row.logo_url ? String(row.logoUrl ?? row.logo_url) : null,
    logoPreset: row.logoPreset ?? row.logo_preset ? String(row.logoPreset ?? row.logo_preset) : null,
    createdAt: String(row.createdAt ?? row.created_at ?? ''),
  };
}

// Transactions DAO
export const transactionsDAO = {
  async getAll(userId: string, fromDate?: string, toDate?: string) {
    const database = getDatabase();
    let query = 'SELECT * FROM transactions WHERE user_id = ?';
    const params: any[] = [userId];

    if (fromDate) {
      query += ' AND date >= ?';
      params.push(fromDate);
    }
    if (toDate) {
      query += ' AND date <= ?';
      params.push(toDate);
    }
    query += ' ORDER BY date DESC';

    const rows = await database.getAllAsync(query, params);
    return rows.map(row => mapTransactionFromDb(row as DbRow));
  },

  async create(tx: Record<string, string | number | boolean | null | undefined>) {
    const database = getDatabase();
    const dbTx = normalizeTransactionForDb(tx as Partial<Transaction> & DbRecord);
    const keys = Object.keys(dbTx).filter(key => dbTx[key] !== undefined);
    const values = keys.map(key => dbTx[key]) as (string | number | null | Uint8Array | boolean)[];
    const placeholders = keys.map(() => '?').join(', ');

    await database.runAsync(
      `INSERT INTO transactions (${keys.join(', ')}) VALUES (${placeholders})`,
      values
    );
  },

  async markSynced(txId: string) {
    const database = getDatabase();
    await database.runAsync(
      'UPDATE transactions SET synced = 1 WHERE tx_id = ?',
      [txId]
    );
  },

  async getUnsynced() {
    const database = getDatabase();
    return await database.getAllAsync(
      'SELECT * FROM transactions WHERE synced = 0'
    );
  },
};

// Profile DAO
export const profileDAO = {
  async get(userId: string) {
    const database = getDatabase();
    const row = await database.getFirstAsync(
      'SELECT * FROM user_profiles WHERE user_id = ?',
      [userId]
    );
    return mapProfileFromDb(row as DbRow | null);
  },

  async upsert(profile: Record<string, string | number | boolean | null | undefined>) {
    const database = getDatabase();
    const dbProfile = normalizeProfileForDb(profile as Partial<UserProfile> & DbRecord);
    const keys = Object.keys(dbProfile).filter(key => dbProfile[key] !== undefined);
    const values = keys.map(key => dbProfile[key]) as (string | number | null | Uint8Array | boolean)[];
    const placeholders = keys.map(() => '?').join(', ');
    const updates = keys.map(k => `${k} = excluded.${k}`).join(', ');

    await database.runAsync(
      `INSERT INTO user_profiles (${keys.join(', ')}) VALUES (${placeholders})
       ON CONFLICT(user_id) DO UPDATE SET ${updates}`,
      values
    );
  },
};

// Equipments DAO
export const equipmentsDAO = {
  async getAll(userId: string) {
    const database = getDatabase();
    return await database.getAllAsync(
      'SELECT * FROM equipments WHERE user_id = ?',
      [userId]
    );
  },

  async create(equip: Record<string, string | number | boolean | null>) {
    const database = getDatabase();
    const keys = Object.keys(equip);
    const values = Object.values(equip) as (string | number | null | Uint8Array | boolean)[];
    const placeholders = keys.map(() => '?').join(', ');

    await database.runAsync(
      `INSERT INTO equipments (${keys.join(', ')}) VALUES (${placeholders})`,
      values
    );
  },
};
