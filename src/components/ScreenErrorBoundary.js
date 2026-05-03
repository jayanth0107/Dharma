// ధర్మ — Per-Screen Error Boundary
// Wraps individual screens to catch crashes without killing the whole app

import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';

export class ScreenErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (__DEV__) console.warn('Screen crash:', this.props.screenName, error);
    // Fire-and-forget crash report. trackEvent is safe — analytics
    // failures are swallowed downstream so a broken sink can't recurse
    // into another crash. Trim payload aggressively (Firestore docs are
    // free up to ~1MB but we don't want stack-trace explosions).
    try {
      const { trackEvent } = require('../utils/analytics');
      trackEvent('app_crash', {
        screen: this.props.screenName || 'unknown',
        message: String(error?.message || error || 'unknown error').slice(0, 500),
        // First 6 frames only — enough to identify the call site without
        // bloating Firestore. Symbolicated stacks live in dev tools.
        stack: String(error?.stack || '').split('\n').slice(0, 6).join('\n').slice(0, 1000),
        componentStack: String(errorInfo?.componentStack || '').split('\n').slice(0, 6).join('\n').slice(0, 600),
      });
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={s.container}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={DarkColors.saffron} />
          <Text style={s.title}>ఏదో తప్పు జరిగింది</Text>
          <Text style={s.subtitle}>Something went wrong in {this.props.screenName || 'this section'}</Text>
          <TouchableOpacity
            style={s.btn}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={s.btnText}>మళ్ళీ ప్రయత్నించండి / Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const s = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: DarkColors.bg,
    justifyContent: 'center', alignItems: 'center', padding: 30,
  },
  title: { fontSize: 18, fontWeight: '600', color: DarkColors.gold, marginTop: 16 },
  subtitle: { fontSize: 13, color: DarkColors.textMuted, marginTop: 8, textAlign: 'center' },
  btn: {
    marginTop: 20, backgroundColor: DarkColors.saffron,
    paddingVertical: 12, paddingHorizontal: 28, borderRadius: 16,
  },
  btnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
