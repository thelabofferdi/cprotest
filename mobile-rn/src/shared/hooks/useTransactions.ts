import { create } from 'zustand';
import { transactionsDAO } from '../../core/database/db';
import type { Transaction } from '../../types';

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  loadTransactions: (userId: string) => Promise<void>;
  addTransaction: (tx: Transaction) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  loading: false,
  error: null,

  loadTransactions: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const result = await transactionsDAO.getAll(userId);
      set({ transactions: result as Transaction[], loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  addTransaction: async (tx: Transaction) => {
    try {
      await transactionsDAO.create(tx as any);
      const userId = tx.userId;
      await get().loadTransactions(userId);
    } catch (err) {
      set({ error: String(err) });
    }
  },
}));
