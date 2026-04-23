// ధర్మ — ClearableInput — TextInput with embedded clear (×) button
// Drop-in replacement for TextInput with a cross button at the right edge

import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';

export function ClearableInput({ value, onChangeText, style, containerStyle, iconSize = 16, ...props }) {
  const showClear = value && value.length > 0;

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, style, showClear && { paddingRight: 36 }]}
        {...props}
      />
      {showClear && (
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={() => onChangeText('')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Clear input"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="close-circle" size={iconSize} color={DarkColors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative' },
  input: {},
  clearBtn: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
