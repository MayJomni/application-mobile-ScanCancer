import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Animated, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useThemeColors, useColorScheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const colors = useThemeColors();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const validate = () => {
    const newErrors: any = {};
    if (!email.trim()) newErrors.email = 'L\'email est requis';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email invalide';
    if (!password.trim()) newErrors.password = 'Le mot de passe est requis';
    else if (password.length < 6) newErrors.password = 'Minimum 6 caractères';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    const result = await login(email, password);
    if (!result.success) {
      Alert.alert('Erreur', result.error || 'Email ou mot de passe incorrect.\n\nCompte démo :\n• dr.amira@dermascan.com / doctor123');
    }
  };

  const fillDemo = (type: 'specialist' | 'doctor') => {
    if (type === 'specialist') {
      setEmail('dr.amira@dermascan.com');
      setPassword('doctor123');
    } else {
      setEmail('dr.mohamed@dermascan.com');
      setPassword('doctor123');
    }
    setErrors({});
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#2563EB', '#1D4ED8', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
      >
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
          <View style={styles.logoCircle}>
            <Ionicons name="medical" size={40} color="#2563EB" />
          </View>
          <Text style={styles.logoTitle}>DermaScan</Text>
          <Text style={styles.logoSubtitle}>Diagnostic Intelligent du Cancer de la Peau</Text>
        </Animated.View>
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.formContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Connexion</Text>
            <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
              Accédez à votre espace de diagnostic sécurisé
            </Text>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: errors.email ? Colors.danger : colors.cardBorder }]}>
                <Ionicons name="mail-outline" size={20} color={errors.email ? Colors.danger : colors.textTertiary} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="votre@email.com"
                  placeholderTextColor={colors.textTertiary}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setErrors(e => ({ ...e, email: undefined })); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Mot de passe</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: errors.password ? Colors.danger : colors.cardBorder }]}>
                <Ionicons name="lock-closed-outline" size={20} color={errors.password ? Colors.danger : colors.textTertiary} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textTertiary}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setErrors(e => ({ ...e, password: undefined })); }}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={[styles.forgotText, { color: Colors.primary }]}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity onPress={handleLogin} disabled={isLoading} activeOpacity={0.8}>
              <LinearGradient colors={[Colors.primary, Colors.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.loginBtn}>
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="log-in-outline" size={20} color="#FFF" />
                    <Text style={styles.loginBtnText}>Se connecter</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Demo Accounts */}
            <View style={[styles.demoSection, { backgroundColor: Colors.primary + '08', borderColor: Colors.primary + '20' }]}>
              <Text style={[styles.demoTitle, { color: colors.text }]}>🔑 Comptes de démonstration</Text>
              <TouchableOpacity style={[styles.demoBtn, { borderColor: Colors.primary + '30' }]} onPress={() => fillDemo('specialist')}>
                <Ionicons name="medical" size={16} color={Colors.primary} />
                <Text style={[styles.demoBtnText, { color: Colors.primary }]}>Spécialiste — dr.amira@dermascan.com</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.demoBtn, { borderColor: Colors.secondary + '30' }]} onPress={() => fillDemo('doctor')}>
                <Ionicons name="person" size={16} color={Colors.secondary} />
                <Text style={[styles.demoBtnText, { color: Colors.secondary }]}>Médecin — dr.mohamed@dermascan.com</Text>
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View style={styles.registerRow}>
              <Text style={[styles.registerText, { color: colors.textSecondary }]}>Pas encore de compte ?</Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={[styles.registerLink, { color: Colors.primary }]}> S'inscrire</Text>
              </TouchableOpacity>
            </View>

            {/* Security Badge */}
            <View style={styles.securityBadge}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.success} />
              <Text style={[styles.securityText, { color: colors.textTertiary }]}>
                Données chiffrées • Conformité RGPD • Stockage local sécurisé
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: { paddingBottom: 40, paddingHorizontal: Spacing.lg, overflow: 'hidden', position: 'relative' },
  logoContainer: { alignItems: 'center', zIndex: 1 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md, ...Shadow.lg },
  logoTitle: { fontSize: FontSize.xxxl, fontWeight: FontWeight.extrabold, color: '#FFF', letterSpacing: -1 },
  logoSubtitle: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 4, textAlign: 'center' },
  decorCircle1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.08)', top: -50, right: -50 },
  decorCircle2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.06)', bottom: -30, left: -30 },
  formContainer: { flex: 1, marginTop: -20, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, overflow: 'hidden' },
  formScroll: { padding: Spacing.lg, paddingTop: Spacing.xl },
  formTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  formSubtitle: { fontSize: FontSize.sm, marginTop: 4, marginBottom: Spacing.xl },
  inputGroup: { marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, marginBottom: Spacing.xs },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, minHeight: 52, gap: Spacing.sm },
  input: { flex: 1, fontSize: FontSize.md, paddingVertical: Spacing.sm },
  errorText: { color: Colors.danger, fontSize: FontSize.xs, marginTop: 4, marginLeft: 4 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: Spacing.lg },
  forgotText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  loginBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: BorderRadius.md, minHeight: 52, gap: Spacing.sm },
  loginBtnText: { color: '#FFF', fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
  demoSection: { marginTop: Spacing.xl, padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1 },
  demoTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, marginBottom: Spacing.sm },
  demoBtn: { flexDirection: 'row', alignItems: 'center', padding: Spacing.sm, borderRadius: BorderRadius.sm, borderWidth: 1, marginBottom: Spacing.xs, gap: Spacing.sm },
  demoBtnText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  registerText: { fontSize: FontSize.md },
  registerLink: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  securityBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: Spacing.lg, gap: Spacing.xs },
  securityText: { fontSize: FontSize.xs },
});
