// ధర్మ — ModalOrView wrapper
// When embedded=true: renders children in a full-screen dark View (no popup)
// When embedded=false: renders children in a Modal with overlay + rounded container

import React from 'react';
import { View, Modal, StyleSheet } from 'react-native';

export function ModalOrView({ embedded, visible, onClose, children }) {
  if (embedded) {
    // Full-screen page — uses same cream background as modal so text stays readable
    return (
      <View style={s.embeddedContainer}>
        {children}
      </View>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.modal}>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  embeddedContainer: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    overflow: 'hidden',
  },
});
