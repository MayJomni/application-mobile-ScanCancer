import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { useThemeColors, useColorScheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '@/constants/Theme';
import Card from '@/components/ui/Card';

const { width } = Dimensions.get('window');

const TIPS = [
  { icon: '☀️', title: 'Protection Solaire', desc: 'Appliquez un écran solaire SPF 50+ quotidiennement' },
  { icon: '🔍', title: 'Auto-examen', desc: 'Examinez votre peau une fois par mois' },
  { icon: '📏', title: 'Règle ABCDE', desc: 'Asymétrie, Bords, Couleur, Diamètre, Évolution' },
  { icon: '👨‍⚕️', title: 'Suivi Médical', desc: 'Consultez un dermatologue une fois par an' },
];

export default function HomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for scan button
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top }]}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              Bienvenue sur
            </Text>
            <Text style={[styles.appName, { color: colors.text }]}>
              DermaScan
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.notifBtn, { backgroundColor: colors.card }]}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </Animated.View>

        {/* Hero Scan Card */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/(tabs)/scan')}
          >
            <LinearGradient
              colors={['#2563EB', '#1D4ED8', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroContent}>
                <View style={styles.heroTextSection}>
                  <Text style={styles.heroTitle}>Analyser une lésion</Text>
                  <Text style={styles.heroSubtitle}>
                    Prenez une photo ou importez une image pour obtenir une analyse IA instantanée
                  </Text>
                  <View style={styles.heroButton}>
                    <Ionicons name="camera" size={18} color="#2563EB" />
                    <Text style={styles.heroButtonText}>Commencer le scan</Text>
                  </View>
                </View>
                <Animated.View
                  style={[
                    styles.heroIconContainer,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  <View style={styles.heroIconCircle}>
                    <Ionicons name="scan" size={40} color="#FFFFFF" />
                  </View>
                </Animated.View>
              </View>

              {/* Decorative circles */}
              <View style={[styles.decorCircle, styles.decorCircle1]} />
              <View style={[styles.decorCircle, styles.decorCircle2]} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View
          style={[
            styles.statsRow,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Card variant="elevated" style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.primaryLight + '15' }]}>
              <Ionicons name="analytics" size={22} color={Colors.primary} />
            </View>
            <Text style={[styles.statNumber, { color: colors.text }]}>0</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Analyses
            </Text>
          </Card>

          <Card variant="elevated" style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.success + '15' }]}>
              <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
            </View>
            <Text style={[styles.statNumber, { color: colors.text }]}>0</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Bénignes
            </Text>
          </Card>

          <Card variant="elevated" style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.danger + '15' }]}>
              <Ionicons name="warning" size={22} color={Colors.danger} />
            </View>
            <Text style={[styles.statNumber, { color: colors.text }]}>0</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              À surveiller
            </Text>
          </Card>
        </Animated.View>

        {/* How it works */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Comment ça marche ?
          </Text>

          <View style={styles.stepsContainer}>
            {[
              { icon: 'camera-outline', label: 'Prenez une photo', color: Colors.primary },
              { icon: 'hardware-chip-outline', label: 'Analyse IA', color: Colors.accent },
              { icon: 'document-text-outline', label: 'Résultats détaillés', color: Colors.secondary },
            ].map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <LinearGradient
                  colors={[step.color + '20', step.color + '08']}
                  style={styles.stepIconContainer}
                >
                  <Ionicons name={step.icon as any} size={26} color={step.color} />
                </LinearGradient>
                <Text style={[styles.stepNumber, { color: step.color }]}>
                  {index + 1}
                </Text>
                <Text style={[styles.stepLabel, { color: colors.text }]}>
                  {step.label}
                </Text>
                {index < 2 && (
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.textTertiary}
                    style={styles.stepArrow}
                  />
                )}
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Prevention Tips */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Conseils de Prévention
          </Text>

          {TIPS.map((tip, index) => (
            <Card
              key={index}
              variant="outlined"
              style={[styles.tipCard, { marginBottom: index < TIPS.length - 1 ? Spacing.sm : 0 }]}
            >
              <View style={styles.tipRow}>
                <Text style={styles.tipIcon}>{tip.icon}</Text>
                <View style={styles.tipContent}>
                  <Text style={[styles.tipTitle, { color: colors.text }]}>
                    {tip.title}
                  </Text>
                  <Text style={[styles.tipDesc, { color: colors.textSecondary }]}>
                    {tip.desc}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </View>
            </Card>
          ))}
        </Animated.View>

        {/* Disclaimer */}
        <View style={[styles.disclaimer, { backgroundColor: Colors.warning + '10', borderColor: Colors.warning + '30' }]}>
          <Ionicons name="information-circle" size={20} color={Colors.warning} />
          <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
            Cette application est un outil d'aide au dépistage et ne remplace pas un diagnostic médical professionnel.
          </Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  appName: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    letterSpacing: -0.5,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  heroCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    minHeight: 180,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  heroTextSection: {
    flex: 1,
    marginRight: Spacing.md,
  },
  heroTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    gap: Spacing.xs,
  },
  heroButtonText: {
    color: '#2563EB',
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.sm,
  },
  heroIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorCircle1: {
    width: 150,
    height: 150,
    top: -30,
    right: -30,
  },
  decorCircle2: {
    width: 100,
    height: 100,
    bottom: -20,
    left: -20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statNumber: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
  statLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  stepIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  stepNumber: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    marginBottom: 2,
  },
  stepLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  stepArrow: {
    position: 'absolute',
    right: -4,
    top: 20,
  },
  tipCard: {
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipIcon: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    marginBottom: 2,
  },
  tipDesc: {
    fontSize: FontSize.sm,
    lineHeight: 18,
  },
  disclaimer: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.xl,
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  disclaimerText: {
    flex: 1,
    fontSize: FontSize.xs,
    lineHeight: 16,
  },
});
