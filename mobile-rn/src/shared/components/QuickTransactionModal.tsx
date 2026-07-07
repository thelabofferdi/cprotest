import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../hooks/useAuth';
import { useProfileStore } from '../hooks/useProfile';
import { useProfileConfigStore } from '../hooks/useProfileConfig';
import { useTransactionStore } from '../hooks/useTransactions';
import { DEPENSE_CATEGORIES, RECETTE_CATEGORIES } from '../utils/data';
import { getPilotageConfig } from '../utils/pilotage';
import { triggerSync } from '../../core/sync/syncService';
import { theme } from '../../theme';
import type { ModePaiement, Transaction, TransactionType } from '../../types';

interface QuickTransactionModalProps {
  visible: boolean;
  initialType: TransactionType;
  initialCategory?: string;
  onClose: () => void;
  onSaved?: (transaction: Transaction) => void;
}

function parseAmount(value: string): number {
  return Number(value.replace(/\s/g, '').replace(',', '.'));
}

export function QuickTransactionModal({
  visible,
  initialType,
  initialCategory,
  onClose,
  onSaved,
}: QuickTransactionModalProps) {
  const userId = useAuthStore(s => s.userId);
  const profile = useProfileStore(s => s.profile);
  const profileConfig = useProfileConfigStore(s => s.config);
  const addTransaction = useTransactionStore(s => s.addTransaction);
  const [txType, setTxType] = useState<TransactionType>(initialType);
  const [montant, setMontant] = useState('');
  const [categorie, setCategorie] = useState('');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [modePaiement, setModePaiement] = useState<ModePaiement>('especes');
  const [showPaymentMenu, setShowPaymentMenu] = useState(false);
  const [notes, setNotes] = useState('');
  const [client, setClient] = useState('');
  const [dateStr, setDateStr] = useState('2026-06-15');
  const [saving, setSaving] = useState(false);

  const categories = useMemo(
    () => (txType === 'recette' ? RECETTE_CATEGORIES : DEPENSE_CATEGORIES),
    [txType]
  );
  const pilotage = getPilotageConfig({
    metier: profile?.metier,
    economicUnit: profileConfig?.economicUnit,
  });
  const amount = parseAmount(montant);
  const canSave = !!userId && amount > 0 && !!categorie && !saving;

  useEffect(() => {
    if (!visible) return;
    setTxType(initialType);
    setCategorie(initialCategory || '');
    setMontant('');
    setModePaiement('especes');
    setNotes('');
    setClient('');
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setDateStr(`${yyyy}-${mm}-${dd}`);
    setShowCategoryMenu(false);
    setShowPaymentMenu(false);
  }, [initialType, initialCategory, visible]);

  const handleSave = async () => {
    if (!userId || !canSave) return;

    let finalDate = new Date().toISOString();
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        if (!Number.isNaN(d.getTime())) {
          finalDate = d.toISOString();
        }
      }
    } catch {
      // Keep fallback
    }

    const tx: Transaction = {
      txId: `tx_${Date.now()}`,
      userId,
      type: txType,
      montant: amount,
      categorie,
      modePaiement,
      date: finalDate,
      notes: notes.trim() || undefined,
      client: txType === 'recette' ? (client.trim() || undefined) : undefined,
      synced: false,
      createdAt: new Date().toISOString(),
    };

    setSaving(true);
    try {
      await addTransaction(tx);
      await triggerSync();
      onSaved?.(tx);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const getCategoryLabel = (catId: string) => {
    if (!catId) return 'Sélectionner une catégorie';
    return categories.find(cat => cat.id === catId)?.label || catId;
  };

  const getPaymentLabel = (mode: ModePaiement) => {
    if (mode === 'especes') return 'Espèces';
    if (mode === 'mobile_money') return 'Mobile Money';
    return 'Virement';
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: pilotage.primaryColor }]}>{pilotage.fabLabel}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            {/* Type Selector (Recette / Dépense) */}
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeButton, txType === 'recette' && { backgroundColor: `${pilotage.primaryColor}18` }]}
                onPress={() => {
                  setTxType('recette');
                  setCategorie('');
                }}
              >
                <Text style={[styles.typeButtonText, txType === 'recette' && { color: pilotage.primaryColor }]}>
                  Recette
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, txType === 'depense' && { backgroundColor: `${pilotage.primaryColor}18` }]}
                onPress={() => {
                  setTxType('depense');
                  setCategorie('');
                }}
              >
                <Text style={[styles.typeButtonText, txType === 'depense' && { color: pilotage.primaryColor }]}>
                  Dépense
                </Text>
              </TouchableOpacity>
            </View>

            {/* Montant Input */}
            <View style={styles.field}>
              <Text style={styles.label}>Montant</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  value={montant}
                  onChangeText={setMontant}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={theme.colors.border}
                  style={styles.montantInput}
                />
                <Text style={styles.fcfaSuffix}>FCFA</Text>
              </View>
            </View>

            {/* Catégorie Select dropdown */}
            <View style={styles.field}>
              <Text style={styles.label}>Catégorie</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowCategoryMenu(!showCategoryMenu)}
              >
                <Text style={[styles.selectButtonText, !categorie && styles.placeholderText]}>
                  {getCategoryLabel(categorie)}
                </Text>
                <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              {showCategoryMenu && (
                <View style={styles.dropdownMenu}>
                  {categories.map(cat => (
                    <TouchableOpacity
                      key={cat.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setCategorie(cat.id);
                        setShowCategoryMenu(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{cat.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Mode de paiement & Date */}
            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Mode de paiement</Text>
                <TouchableOpacity
                  style={styles.selectButtonSmall}
                  onPress={() => setShowPaymentMenu(!showPaymentMenu)}
                >
                  <Text style={styles.selectButtonTextSmall}>{getPaymentLabel(modePaiement)}</Text>
                  <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                {showPaymentMenu && (
                  <View style={styles.dropdownMenu}>
                    {([
                      ['especes', 'Espèces'],
                      ['mobile_money', 'Mobile Money'],
                      ['credit', 'Virement'],
                    ] as [ModePaiement, string][]).map(([mode, label]) => (
                      <TouchableOpacity
                        key={mode}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setModePaiement(mode);
                          setShowPaymentMenu(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Date</Text>
                <View style={styles.dateInputWrap}>
                  <TextInput
                    value={dateStr}
                    onChangeText={setDateStr}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={theme.colors.border}
                    style={styles.dateInput}
                  />
                </View>
              </View>
            </View>

            {/* Client Input (Optionnel for Recettes) */}
            {txType === 'recette' && (
              <View style={styles.field}>
                <Text style={styles.label}>Client (Optionnel)</Text>
                <View style={styles.dateInputWrap}>
                  <TextInput
                    value={client}
                    onChangeText={setClient}
                    placeholder="Nom du client..."
                    placeholderTextColor={theme.colors.border}
                    style={styles.dateInput}
                  />
                </View>
              </View>
            )}

            {/* Note Input */}
            <View style={styles.field}>
              <Text style={styles.label}>Note (Optionnel)</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Description de la transaction..."
                placeholderTextColor={theme.colors.border}
                multiline
                numberOfLines={2}
                style={styles.notesTextarea}
              />
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={saving}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: pilotage.primaryColor }, !canSave && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!canSave || saving}
            >
              <Ionicons name="save" size={18} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(41, 48, 64, 0.4)',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderColor: theme.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: '92%',
    overflow: 'hidden',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: 'rgba(191, 201, 195, 0.3)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  closeButton: {
    alignItems: 'center',
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  scroll: { gap: 16, padding: 16 },
  typeSelector: {
    backgroundColor: theme.colors.surfaceLow,
    borderRadius: 8,
    flexDirection: 'row',
    padding: 4,
  },
  typeButton: {
    alignItems: 'center',
    borderRadius: 6,
    flex: 1,
    justifyContent: 'center',
    height: 36,
  },
  typeButtonActive: {
    backgroundColor: theme.colors.secondaryContainer,
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  typeButtonTextActive: {
    color: theme.colors.onSecondaryContainer,
  },
  field: { gap: 8 },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  inputWrap: {
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  montantInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    height: 56,
  },
  fcfaSuffix: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  selectButton: {
    backgroundColor: '#FFFFFF',
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  selectButtonText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  placeholderText: {
    color: theme.colors.border,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  selectButtonSmall: {
    backgroundColor: '#FFFFFF',
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  selectButtonTextSmall: {
    fontSize: 14,
    color: theme.colors.text,
  },
  dateInputWrap: {
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 56,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  dateInput: {
    fontSize: 14,
    color: theme.colors.text,
    height: 56,
  },
  notesTextarea: {
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    fontSize: 14,
    color: theme.colors.text,
    minHeight: 64,
    textAlignVertical: 'top',
  },
  dropdownMenu: {
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 4,
    overflow: 'hidden',
    zIndex: 999,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomColor: 'rgba(191, 201, 195, 0.3)',
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  footer: {
    borderTopColor: 'rgba(191, 201, 195, 0.3)',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
