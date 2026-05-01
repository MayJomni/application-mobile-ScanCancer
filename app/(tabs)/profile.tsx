import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, StatusBar, Switch, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useThemeColors, useColorScheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '@/constants/Theme';
import Card from '@/components/ui/Card';

const SKIN_TYPES = [
  { id: 1, label: 'Type I', desc: 'Très claire', color: '#FDEBD0' },
  { id: 2, label: 'Type II', desc: 'Claire', color: '#F5CBA7' },
  { id: 3, label: 'Type III', desc: 'Moyenne', color: '#EDBB99' },
  { id: 4, label: 'Type IV', desc: 'Mate', color: '#D5A67B' },
  { id: 5, label: 'Type V', desc: 'Foncée', color: '#A67C52' },
  { id: 6, label: 'Type VI', desc: 'Très foncée', color: '#6E4B3A' },
];

export default function ProfileScreen() {
  const colors = useThemeColors();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const MenuItem = ({ icon, label, subtitle, onPress, showArrow = true, rightElement }: any) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.menuItem, { borderBottomColor: colors.separator }]}>
      <View style={[styles.menuIcon, { backgroundColor: Colors.primary + '12' }]}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
        {subtitle && <Text style={[styles.menuSubtitle, { color: colors.textTertiary }]}>{subtitle}</Text>}
      </View>
      {rightElement || (showArrow && <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />)}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.sm }]}>
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={[styles.title, { color: colors.text }]}>Profil</Text>
        </Animated.View>

        {/* Avatar Card */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <LinearGradient colors={[Colors.primary, Colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.profileCard}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={36} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>Utilisateur</Text>
              <Text style={styles.profileEmail}>Configurer votre profil</Text>
            </View>
            <TouchableOpacity style={styles.editBtn}>
              <Ionicons name="create-outline" size={18} color="#FFF" />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* Skin Type */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Type de peau (Fitzpatrick)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm, paddingBottom: Spacing.sm }}>
            {SKIN_TYPES.map((type) => (
              <TouchableOpacity key={type.id} activeOpacity={0.7}>
                <View style={[styles.skinTypeCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={[styles.skinSwatch, { backgroundColor: type.color }]} />
                  <Text style={[styles.skinLabel, { color: colors.text }]}>{type.label}</Text>
                  <Text style={[styles.skinDesc, { color: colors.textTertiary }]}>{type.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Settings */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Paramètres</Text>
          <Card variant="elevated" padding="sm" style={{ marginBottom: Spacing.lg }}>
            <MenuItem icon="notifications-outline" label="Notifications" subtitle="Rappels de suivi" showArrow={false} rightElement={<Switch value={true} trackColor={{ true: Colors.primary }} thumbColor="#FFF" />} />
            <MenuItem icon="language-outline" label="Langue" subtitle="Français" onPress={() => {}} />
            <MenuItem icon="moon-outline" label="Mode sombre" subtitle={colorScheme === 'dark' ? 'Activé' : 'Désactivé'} showArrow={false} rightElement={<Switch value={colorScheme === 'dark'} trackColor={{ true: Colors.primary }} thumbColor="#FFF" />} />
            <MenuItem icon="shield-checkmark-outline" label="Confidentialité" onPress={() => {}} />
          </Card>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>À propos</Text>
          <Card variant="elevated" padding="sm" style={{ marginBottom: Spacing.lg }}>
            <MenuItem icon="information-circle-outline" label="À propos de DermaScan" subtitle="Version 1.0.0" onPress={() => {}} />
            <MenuItem icon="document-text-outline" label="Conditions d'utilisation" onPress={() => {}} />
            <MenuItem icon="help-circle-outline" label="Centre d'aide" onPress={() => {}} />
            <MenuItem icon="star-outline" label="Évaluer l'application" onPress={() => {}} />
          </Card>
        </Animated.View>

        {/* Disclaimer */}
        <View style={[styles.disclaimer, { backgroundColor: Colors.warning + '10', borderColor: Colors.warning + '30' }]}>
          <Ionicons name="medical" size={18} color={Colors.warning} />
          <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
            DermaScan est un outil d'aide au dépistage. Il ne remplace en aucun cas un diagnostic médical professionnel.
          </Text>
        </View>

        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          DermaScan v1.0.0 — Projet PFA 2026
        </Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg },
  header: { marginBottom: Spacing.lg },
  title: { fontSize: FontSize.xxxl, fontWeight: FontWeight.extrabold, letterSpacing: -0.5 },
  profileCard: { borderRadius: BorderRadius.xl, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl, gap: Spacing.md },
  avatarCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  profileName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: '#FFF' },
  profileEmail: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  editBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  skinTypeCard: { alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1, minWidth: 80 },
  skinSwatch: { width: 40, height: 40, borderRadius: 20, marginBottom: Spacing.sm },
  skinLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  skinDesc: { fontSize: FontSize.xs, marginTop: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 0.5, gap: Spacing.md },
  menuIcon: { width: 36, height: 36, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: FontSize.md, fontWeight: FontWeight.medium },
  menuSubtitle: { fontSize: FontSize.xs, marginTop: 1 },
  disclaimer: { flexDirection: 'row', padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, gap: Spacing.sm, alignItems: 'flex-start', marginBottom: Spacing.md },
  disclaimerText: { flex: 1, fontSize: FontSize.xs, lineHeight: 16 },
  footerText: { textAlign: 'center', fontSize: FontSize.xs, marginTop: Spacing.sm },
});
