import { create } from 'zustand';

interface UIState {
  quickAddVisible: boolean;
  quickAddType: 'recette' | 'depense';
  quickAddCategory: string;
  actionsSheetVisible: boolean;
  setQuickAddVisible: (visible: boolean) => void;
  setQuickAddType: (type: 'recette' | 'depense') => void;
  setQuickAddCategory: (category: string) => void;
  setActionsSheetVisible: (visible: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  quickAddVisible: false,
  quickAddType: 'recette',
  quickAddCategory: '',
  actionsSheetVisible: false,
  setQuickAddVisible: (visible: boolean) => set({ quickAddVisible: visible }),
  setQuickAddType: (type) => set({ quickAddType: type }),
  setQuickAddCategory: (category) => set({ quickAddCategory: category }),
  setActionsSheetVisible: (visible) => set({ actionsSheetVisible: visible }),
}));
