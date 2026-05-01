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
import { useThemeColors } from '@/hooks/useTheme';
import { Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'doctor' | 'resident' | 'specialist'>('doctor');
  const [specialty, setSpecialty] = useState('Dermatologie');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [hospital, setHospital] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const validate = () => {
    const e: any = {};
    if (!name.trim()) e.name = 'Le nom est requis';
    if (!email.trim()) e.email = 'L\'email est requis';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email invalide';
    if (!password.trim()) e.password = 'Le mot de passe est requis';
    else if (password.length < 6) e.password = 'Minimum 6 caractères';
    if (password !== confirmPassword) e.confirmPassword = 'Les mots de passe ne correspondent pas';
    if (!licenseNumber.trim()) e.licenseNumber = 'Le numéro RPPS est requis';
    if (!acceptTerms) e.terms = 'Vous devez accepter les conditions';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    const result = await register({
      name,
      email,
      password,
      role,
      specialty,
      licenseNumber,
      hospital,
    });
    if (!result.success) Alert.alert('Erreur', result.error || 'L\'inscription a échoué. Veuillez réessayer.');
  };

  const InputField = ({ icon, label, value, onChangeText, error, placeholder, secure, keyboardType, autoCapitalize }: any) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: error ? Colors.danger : colors.cardBorder }]}>
        <Ionicons name={icon} size={20} color={error ? Colors.danger : colors.textTertiary} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || 'none'}
        />
        {secure && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#0D9488', '#0F766E', '#2563EB']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="person-add" size={28} color="#0D9488" />
          </View>
          <Text style={styles.headerTitle}>Créer un compte</Text>
          <Text style={styles.headerSubtitle}>Rejoignez DermaScan pour un suivi intelligent</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.formContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* Role Selection */}
            <Text style={[styles.label, { color: colors.text, marginBottom: Spacing.sm }]}>Mon rôle</Text>
            <View style={styles.roleRow}>
              {[
                { key: 'doctor', icon: 'medical-outline', label: 'Médecin' },
                { key: 'specialist', icon: 'star-outline', label: 'Spécialiste' },
              ].map((r) => (
                <TouchableOpacity
                  key={r.key}
                  onPress={() => setRole(r.key as any)}
                  style={[
                    styles.roleCard,
                    { backgroundColor: colors.card, borderColor: role === r.key ? Colors.primary : colors.cardBorder },
                    role === r.key && { borderWidth: 2 },
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={[styles.roleIcon, { backgroundColor: role === r.key ? Colors.primary + '15' : colors.separator }]}>
                    <Ionicons name={r.icon as any} size={24} color={role === r.key ? Colors.primary : colors.textTertiary} />
                  </View>
                  <Text style={[styles.roleLabel, { color: role === r.key ? Colors.primary : colors.textSecondary }]}>{r.label}</Text>
                  {role === r.key && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>

            <InputField icon="person-outline" label="Nom complet" value={name} onChangeText={(t: string) => { setName(t); setErrors((e: any) => ({ ...e, name: undefined })); }} error={errors.name} placeholder="Dr. Nom Prénom" autoCapitalize="words" />
            <InputField icon="mail-outline" label="Email professionnel" value={email} onChangeText={(t: string) => { setEmail(t); setErrors((e: any) => ({ ...e, email: undefined })); }} error={errors.email} placeholder="votre@email.com" keyboardType="email-address" />
            <InputField icon="card-outline" label="Numéro RPPS / Licence" value={licenseNumber} onChangeText={(t: string) => { setLicenseNumber(t); setErrors((e: any) => ({ ...e, licenseNumber: undefined })); }} error={errors.licenseNumber} placeholder="RPPS-XXXXXXXXXXX" />
            <InputField icon="business-outline" label="Établissement (optionnel)" value={hospital} onChangeText={(t: string) => setHospital(t)} placeholder="CHU / Clinique / Cabinet" autoCapitalize="words" />
            <InputField icon="lock-closed-outline" label="Mot de passe" value={password} onChangeText={(t: string) => { setPassword(t); setErrors((e: any) => ({ ...e, password: undefined })); }} error={errors.password} placeholder="Minimum 6 caractères" secure />
            <InputField icon="lock-closed-outline" label="Confirmer le mot de passe" value={confirmPassword} onChangeText={(t: string) => { setConfirmPassword(t); setErrors((e: any) => ({ ...e, confirmPassword: undefined })); }} error={errors.confirmPassword} placeholder="Confirmez votre mot de passe" secure />

            {/* Terms */}
            <TouchableOpacity style={styles.termsRow} onPress={() => { setAcceptTerms(!acceptTerms); setErrors((e: any) => ({ ...e, terms: undefined })); }}>
              <View style={[styles.checkbox, { borderColor: errors.terms ? Colors.danger : colors.cardBorder }, acceptTerms && { backgroundColor: Colors.primary, borderColor: Colors.primary }]}>
                {acceptTerms && <Ionicons name="checkmark" size={14} color="#FFF" />}
              </View>
              <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                J'accepte les <Text style={{ color: Colors.primary, fontWeight: '600' }}>conditions d'utilisation</Text> et la <Text style={{ color: Colors.primary, fontWeight: '600' }}>politique de confidentialité</Text>
              </Text>
            </TouchableOpacity>
            {errors.terms && <Text style={[styles.errorText, { marginLeft: 28 }]}>{errors.terms}</Text>}

            {/* Register Button */}
            <TouchableOpacity onPress={handleRegister} disabled={isLoading} activeOpacity={0.8} style={{ marginTop: Spacing.lg }}>
              <LinearGradient colors={[Colors.secondary, Colors.secondaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.registerBtn}>
                {isLoading ? <ActivityIndicator color="#FFF" /> : (
                  <>
                    <Ionicons name="shield-checkmark" size={20} color="#FFF" />
                    <Text style={styles.registerBtnText}>Créer mon compte sécurisé</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={[styles.loginText, { color: colors.textSecondary }]}>Déjà un compte ?</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={[styles.loginLink, { color: Colors.primary }]}> Se connecter</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: { paddingBottom: 30, paddingHorizontal: Spacing.lg, overflow: 'hidden' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  headerContent: { alignItems: 'center' },
  headerIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: '#FFF' },
  headerSubtitle: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  formContainer: { flex: 1, marginTop: -15, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, overflow: 'hidden' },
  formScroll: { padding: Spacing.lg, paddingTop: Spacing.xl },
  roleRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  roleCard: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, gap: Spacing.sm },
  roleIcon: { width: 40, height: 40, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  roleLabel: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  inputGroup: { marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, marginBottom: Spacing.xs },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, minHeight: 52, gap: Spacing.sm },
  input: { flex: 1, fontSize: FontSize.md, paddingVertical: Spacing.sm },
  errorText: { color: Colors.danger, fontSize: FontSize.xs, marginTop: 4, marginLeft: 4 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: Spacing.sm, gap: Spacing.sm },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  termsText: { flex: 1, fontSize: FontSize.sm, lineHeight: 20 },
  registerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: BorderRadius.md, minHeight: 52, gap: Spacing.sm },
  registerBtnText: { color: '#FFF', fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl, marginBottom: Spacing.xl },
  loginText: { fontSize: FontSize.md },
  loginLink: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
});
