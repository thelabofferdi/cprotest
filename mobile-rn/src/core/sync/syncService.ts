import { transactionsDAO, profileDAO } from '../database/db';
import { api } from '../api/apiClient';

function mapTransactionType(type: unknown, categorie: unknown) {
  if (type === 'depense') return 'DEPENSE';
  if (categorie === 'service') return 'SERVICE';
  if (categorie === 'autre_recette') return 'AUTRE_REVENU';
  return 'VENTE';
}

function mapPaymentMode(mode: unknown) {
  if (mode === 'mobile_money') return 'MOMO';
  if (mode === 'credit') return 'CREDIT';
  return 'CASH';
}

function mapTransactionForBackend(tx: Record<string, unknown>) {
  return {
    type: mapTransactionType(tx.type, tx.categorie),
    montant: Number(tx.montant ?? 0),
    categorie: tx.categorie,
    sousCategorie: tx.sous_categorie,
    quantite: tx.quantite,
    prixUnitaire: tx.prix_unitaire,
    modePaiement: mapPaymentMode(tx.mode_paiement),
    date: tx.date,
    notes: tx.notes,
  };
}

export async function syncPendingTransactions() {
  try {
    const unsynced = await transactionsDAO.getUnsynced();

    if (!unsynced || unsynced.length === 0) {
      return { synced: 0 };
    }

    const cleanTransactions = unsynced
      .filter((tx): tx is Record<string, unknown> => typeof tx === 'object' && tx !== null)
      .map(mapTransactionForBackend);

    const res = await api.syncTransactions(cleanTransactions);
    if (res.data?.failed) {
      throw new Error(`${res.data.failed} transaction(s) non synchronisée(s)`);
    }

    for (const tx of unsynced) {
      if (typeof tx === 'object' && tx !== null && 'tx_id' in tx) {
        await transactionsDAO.markSynced(tx.tx_id as string);
      }
    }

    return { synced: unsynced.length };
  } catch (error) {
    console.error('[Sync] Failed to sync transactions:', error);
    throw error;
  }
}

export async function syncProfile(profile: Record<string, unknown>) {
  try {
    await profileDAO.upsert(profile as any);
    // Also send to cloud if online
    const userId = profile.user_id as string;
    if (userId) {
      await api.updateProfile(profile);
    }
  } catch (error) {
    console.error('[Sync] Failed to sync profile:', error);
    throw error;
  }
}

export async function triggerSync() {
  try {
    return await syncPendingTransactions();
  } catch {
    // Offline — queue for later
    return { synced: 0, queued: true };
  }
}
