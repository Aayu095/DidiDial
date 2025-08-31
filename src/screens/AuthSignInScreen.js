import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../providers/AuthProvider';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../config/theme';

export default function AuthSignInScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setBusy(true);
    setError('');
    try {
      await signIn(email, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      setError(e?.message || 'Sign in failed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.welcomeEmoji}>🙏</Text>
        <Text style={styles.title}>दीदीडायल में आपका फिर से स्वागत है</Text>
        <Text style={styles.subtitle}>Welcome back to Dididial</Text>
        <Text style={styles.description}>अपनी सीखने की यात्रा जारी रखें</Text>
      </View>

      <View style={styles.formSection}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.text.secondary}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={COLORS.text.secondary}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {!!error && <Text style={styles.error}>{error}</Text>}

        <Pressable style={[styles.button, busy && styles.buttonDisabled]} onPress={onSubmit} disabled={busy}>
          <Text style={styles.btnText}>{busy ? 'साइन इन हो रहे हैं...' : '🏠 दीदी के घर आएं'}</Text>
        </Pressable>

        <Pressable onPress={() => navigation.replace('SignUp')} style={styles.linkBtn}>
          <Text style={styles.linkText}>नए हैं? दीदी के साथ जुड़ें</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background.primary, 
    padding: SPACING.xl,
    justifyContent: 'center' 
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  welcomeEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  title: { 
    color: COLORS.text.primary, 
    fontSize: TYPOGRAPHY.fontSize['3xl'], 
    fontWeight: TYPOGRAPHY.fontWeight.bold, 
    textAlign: 'center', 
    marginBottom: SPACING.xs 
  },
  subtitle: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  description: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.fontSize.base,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  formSection: {
    width: '100%',
  },
  input: { 
    backgroundColor: COLORS.background.surface, 
    color: COLORS.text.primary, 
    borderRadius: BORDER_RADIUS.lg, 
    padding: SPACING.lg, 
    marginBottom: SPACING.md, 
    borderWidth: 1, 
    borderColor: COLORS.border,
    fontSize: TYPOGRAPHY.fontSize.base,
  },
  button: { 
    backgroundColor: COLORS.primary[500], 
    padding: SPACING.lg, 
    borderRadius: BORDER_RADIUS.full, 
    alignItems: 'center', 
    marginTop: SPACING.md,
    elevation: 4,
    shadowColor: COLORS.primary[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonDisabled: { 
    opacity: 0.7 
  },
  btnText: { 
    color: '#fff', 
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  linkBtn: { 
    alignItems: 'center', 
    marginTop: SPACING.lg 
  },
  linkText: { 
    color: COLORS.primary[600],
    fontSize: TYPOGRAPHY.fontSize.base,
  },
  error: { 
    color: COLORS.status.error, 
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
});