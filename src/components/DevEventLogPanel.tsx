import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FileText, MessageCircle, Trash2, X } from 'lucide-react-native';

import { colors, radius, spacing, typography } from '../data/theme';
import { clearEventLog, exportEventLogText, trackLocalEvent } from '../services/localEventLog';
import { AppButton } from './AppButton';

type DevEventLogPanelProps = {
  onFeedbackPress: (eventLogText?: string) => void;
};

export function DevEventLogPanel({ onFeedbackPress }: DevEventLogPanelProps) {
  const [exportText, setExportText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const openExport = async () => {
    setLoading(true);
    const text = await exportEventLogText();
    setExportText(text);
    setModalVisible(true);
    setLoading(false);
  };

  const clearLog = () => {
    Alert.alert(
      'Test günlüğünü temizle',
      'Yerel alpha olay günlüğü silinecek. Öğrenme ilerlemen etkilenmez.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: () => {
            void clearEventLog();
          },
        },
      ],
    );
  };

  const sendFeedback = async () => {
    const text = await exportEventLogText();
    trackLocalEvent({ type: 'feedback_opened', screen: 'Profile', action: 'open_feedback' });
    onFeedbackPress(text);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Alpha test günlüğü</Text>
      <Text style={styles.body}>
        Gizli anahtar veya ses kaydı içermez. Mesaj, cevap metni ve kişisel bilgi kaydedilmez.
      </Text>
      <AppButton
        icon={FileText}
        loading={loading}
        onPress={() => void openExport()}
        title="Alpha logunu dışa aktar"
        variant="secondary"
      />
      <AppButton
        icon={Trash2}
        onPress={clearLog}
        title="Test günlüğünü temizle"
        variant="secondary"
      />
      <AppButton
        icon={MessageCircle}
        onPress={() => void sendFeedback()}
        title="Geri bildirim gönder"
      />

      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Yerel test günlüğü</Text>
                <Text style={styles.modalHint}>Kopyalamak için metne uzun bas.</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <X color={colors.deepViolet} size={20} />
              </Pressable>
            </View>
            <TextInput
              editable={false}
              multiline
              scrollEnabled
              selectTextOnFocus
              style={styles.logBox}
              value={exportText}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  body: {
    ...typography.body,
    color: colors.muted,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(30,27,58,0.42)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    gap: spacing.md,
    maxHeight: '82%',
    padding: spacing.lg,
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  modalTitle: {
    ...typography.heading,
    color: colors.deepViolet,
  },
  modalHint: {
    ...typography.small,
    color: colors.muted,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: colors.lavender,
    borderRadius: radius.sm,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  logBox: {
    ...typography.small,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.deepViolet,
    minHeight: 280,
    padding: spacing.md,
    textAlignVertical: 'top',
  },
});
