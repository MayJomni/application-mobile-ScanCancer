import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, StatusBar, Image, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useThemeColors, useColorScheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '@/constants/Theme';
import Card from '@/components/ui/Card';
import { useScanContext } from '@/contexts/ScanContext';
import { useArticlesContext } from '@/contexts/ArticlesContext';
import { MiniBarChart } from '@/components/ui/Histogram';
import { getRiskColor } from '@/constants/Lesions';
import RadarChart from '@/components/ui/RadarChart';
import { DonutChart, Sparkline, ProgressBar } from '@/components/ui/AdvancedCharts';
import { generateInsights, getPerformanceMetrics, getAnatomicalDistribution, AIInsight } from '@/services/AIAnalyticsService';

const { width } = Dimensions.get('window');
const PERIODS = ['Semaine', 'Mois', 'Année'] as const;

export default function HomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { getStats, scans, getAverageABCDEscores } = useScanContext();
  const { dailyTip, articles, toggleSaveArticle } = useArticlesContext();
  const stats = getStats();
  const avgABCDE = getAverageABCDEscores();

  const [period, setPeriod] = useState<number>(1);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [showInsightsModal, setShowInsightsModal] = useState(false);

  const insights = useMemo(() => generateInsights(scans), [scans]);
  const metrics = useMemo(() => getPerformanceMetrics(scans), [scans]);
  const anatomical = useMemo(() => getAnatomicalDistribution(scans), [scans]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
    const pulse = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.06, duration: 1800, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
    ]));
    pulse.start();
    return () => pulse.stop();
  }, []);

  const criticalInsights = insights.filter(i => i.severity === 'critical');
  const hasAlerts = criticalInsights.length > 0;

  const getInsightBg = (s: AIInsight['severity']) =>
    s === 'critical' ? Colors.danger : s === 'warning' ? Colors.warning : Colors.primary;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingTop: insets.top }]}>

        {/* ── Header with Logo ── */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerLeft}>
            <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
            <View>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>Tableau de bord</Text>
              <Text style={[styles.appName, { color: colors.text }]}>DermaScan</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.notifBtn, { backgroundColor: colors.card }]} onPress={() => setShowInsightsModal(true)}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            {hasAlerts && <View style={styles.notifBadge} />}
          </TouchableOpacity>
        </Animated.View>

        {/* ── Period Filter ── */}
        <Animated.View style={[styles.periodRow, { opacity: fadeAnim }]}>
          {PERIODS.map((p, i) => (
            <TouchableOpacity key={i} onPress={() => setPeriod(i)}
              style={[styles.periodBtn, period === i && { backgroundColor: Colors.primary }]}>
              <Text style={[styles.periodText, { color: period === i ? '#FFF' : colors.textSecondary }]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* ── Hero Scan CTA ── */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/(tabs)/scan')}>
            <LinearGradient colors={['#2563EB', '#1D4ED8', '#7C3AED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
              <View style={styles.heroContent}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroTitle}>Analyser une lésion</Text>
                  <Text style={styles.heroSub}>Diagnostic IA instantané</Text>
                </View>
                <View style={styles.heroIcon}><Ionicons name="scan" size={32} color="#FFF" /></View>
              </View>
              <View style={[styles.decorCircle, { top: -20, right: -20, width: 100, height: 100 }]} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Daily Tip ── */}
        {dailyTip && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <LinearGradient colors={isDark ? ['#1E293B', '#1a2540'] : ['#EFF6FF', '#F0FDFA']} style={styles.tipGradient}>
              <Text style={{ fontSize: 22 }}>{dailyTip.icon}</Text>
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Text style={[styles.tipTitle, { color: Colors.primary }]}>💡 {dailyTip.title}</Text>
                <Text style={[styles.tipDesc, { color: colors.textSecondary }]}>{dailyTip.content}</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* ── Quick Stats Row ── */}
        <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
          {[
            { label: 'Total', value: stats.totalScans, icon: 'analytics', color: Colors.primary, bg: Colors.primaryLight },
            { label: 'Bénignes', value: stats.benignCount, icon: 'shield-checkmark', color: Colors.success, bg: Colors.success },
            { label: 'Alertes', value: stats.preMalignantCount + stats.malignantCount, icon: 'warning', color: Colors.danger, bg: Colors.danger },
          ].map((s, i) => (
            <Card key={i} variant="elevated" style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.bg + '15' }]}>
                <Ionicons name={s.icon as any} size={20} color={s.color} />
              </View>
              <Text style={[styles.statNum, { color: colors.text }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.label}</Text>
            </Card>
          ))}
        </Animated.View>

        {/* ── AI Insights Agent ── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>🤖 Agent IA Prédictif</Text>
            <TouchableOpacity onPress={() => setShowInsightsModal(true)}>
              <Text style={{ color: Colors.primary, fontSize: FontSize.sm }}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <Card variant="elevated" style={{ padding: 0, marginBottom: Spacing.lg }}>
            {insights.slice(0, 3).map((ins, i) => (
              <View key={ins.id} style={[styles.insightRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.separator }]}>
                <View style={[styles.insightDot, { backgroundColor: getInsightBg(ins.severity) + '20' }]}>
                  <Text style={{ fontSize: 16 }}>{ins.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.insightTitle, { color: colors.text }]}>{ins.title}</Text>
                  <Text style={[styles.insightMsg, { color: colors.textSecondary }]} numberOfLines={2}>{ins.message}</Text>
                </View>
                <View style={[styles.severityBadge, { backgroundColor: getInsightBg(ins.severity) + '15' }]}>
                  <View style={[styles.severityDotInner, { backgroundColor: getInsightBg(ins.severity) }]} />
                </View>
              </View>
            ))}
          </Card>
        </Animated.View>

        {/* ── Charts Section ── */}
        {stats.totalScans > 0 && (
          <Animated.View style={{ opacity: fadeAnim }}>

            {/* Donut + Confidence */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>📊 Répartition & Confiance</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg }}>
              <Card variant="elevated" style={{ flex: 1, alignItems: 'center', paddingVertical: Spacing.md }}>
                <DonutChart
                  data={stats.riskDistribution.map(r => ({ label: r.label, value: r.value, color: r.color }))}
                  size={130}
                  strokeWidth={16}
                  textColor={colors.text}
                  centerValue={String(stats.totalScans)}
                  centerLabel="scans"
                />
                <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm }}>
                  {stats.riskDistribution.map((r, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: r.color }} />
                      <Text style={{ fontSize: 9, color: colors.textSecondary }}>{r.value}</Text>
                    </View>
                  ))}
                </View>
              </Card>
              <Card variant="elevated" style={{ flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.md }}>
                <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary, marginBottom: 4 }}>Confiance IA</Text>
                <Text style={{ fontSize: FontSize.xxl, fontWeight: '800', color: Colors.primary }}>{(stats.avgConfidence * 100).toFixed(1)}%</Text>
                <Sparkline data={stats.weeklyScans} width={width / 2 - 60} height={50} color={Colors.primary} />
                <View style={{ marginTop: Spacing.sm }}>
                  <ProgressBar value={metrics.qualityScore} color={Colors.secondary} label="Qualité img." textColor={colors.textSecondary} />
                  <ProgressBar value={metrics.highRiskRate * 100} color={Colors.danger} label="Taux risque" textColor={colors.textSecondary} />
                </View>
              </Card>
            </View>

            {/* Radar ABCDE */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>🕸️ Critères ABCDE Moyens</Text>
            <Card variant="elevated" style={{ marginBottom: Spacing.lg, paddingVertical: Spacing.md }}>
              <RadarChart data={avgABCDE} size={240} color={Colors.accent} textColor={colors.textSecondary} />
              <Text style={{ textAlign: 'center', fontSize: FontSize.xs, color: colors.textSecondary, marginTop: 4 }}>
                Score total moyen : {avgABCDE.total.toFixed(2)} / 10
              </Text>
            </Card>

            {/* Lesion Types */}
            {stats.lesionTypeDistribution.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>🔬 Types de lésions</Text>
                <Card variant="elevated" style={{ marginBottom: Spacing.lg, padding: Spacing.lg }}>
                  <MiniBarChart data={stats.lesionTypeDistribution.map(d => ({ label: d.name, value: d.count, color: d.color }))} textColor={colors.textSecondary} barBgColor={colors.separator} />
                </Card>
              </>
            )}

            {/* Anatomical Distribution */}
            {anatomical.some(a => a.count > 0) && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>🦴 Localisation Anatomique</Text>
                <Card variant="elevated" style={{ marginBottom: Spacing.lg, padding: Spacing.lg }}>
                  <MiniBarChart data={anatomical.filter(a => a.count > 0).map(a => ({ label: a.siteFr, value: a.count, color: a.color }))} textColor={colors.textSecondary} barBgColor={colors.separator} />
                </Card>
              </>
            )}

            {/* Recent Scans */}
            {stats.recentScans.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>🕐 Dernières analyses</Text>
                {stats.recentScans.slice(0, 3).map((scan) => (
                  <Card key={scan.id} variant="outlined" style={{ marginBottom: Spacing.sm, padding: Spacing.md }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
                      <View style={[styles.scanIcon, { backgroundColor: getRiskColor(scan.topPrediction.riskLevel) + '15' }]}>
                        <Text style={{ fontSize: 20 }}>{scan.topPrediction.icon}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: FontSize.md, fontWeight: '600', color: colors.text }}>{scan.topPrediction.nameFr}</Text>
                        <Text style={{ fontSize: FontSize.xs, color: colors.textTertiary }}>
                          {new Date(scan.date).toLocaleDateString('fr-FR')} — ABCDE: {scan.abcdeScore.total.toFixed(1)}
                        </Text>
                      </View>
                      <View style={[styles.confBadge, { backgroundColor: getRiskColor(scan.topPrediction.riskLevel) + '15' }]}>
                        <Text style={{ fontSize: FontSize.xs, fontWeight: '700', color: getRiskColor(scan.topPrediction.riskLevel) }}>
                          {(scan.topPrediction.confidence * 100).toFixed(0)}%
                        </Text>
                      </View>
                    </View>
                  </Card>
                ))}
              </>
            )}
          </Animated.View>
        )}

        {/* ── Medical Articles Feed ── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📰 Veille Médicale</Text>
          {articles.map((art) => (
            <TouchableOpacity key={art.id} activeOpacity={0.8} onPress={() => { setSelectedArticle(art); setShowArticleModal(true); }}>
              <Card variant="outlined" style={{ marginBottom: Spacing.sm, padding: Spacing.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <View style={[styles.catBadge, { backgroundColor: Colors.primary + '15' }]}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.primary }}>{art.category}</Text>
                  </View>
                  <Text style={{ fontSize: FontSize.xs, color: colors.textTertiary }}>{new Date(art.date).toLocaleDateString('fr-FR')}</Text>
                </View>
                <Text style={{ fontSize: FontSize.md, fontWeight: '700', color: colors.text, marginBottom: 4 }}>{art.title}</Text>
                <Text style={{ fontSize: FontSize.sm, color: colors.textSecondary, lineHeight: 18 }} numberOfLines={2}>{art.summary}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm }}>
                  <Text style={{ fontSize: 10, color: colors.textTertiary, fontStyle: 'italic' }}>{art.source}</Text>
                  <TouchableOpacity onPress={() => toggleSaveArticle(art.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name={art.saved ? 'bookmark' : 'bookmark-outline'} size={18} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* ── Disclaimer ── */}
        <View style={[styles.disclaimer, { backgroundColor: Colors.warning + '10', borderColor: Colors.warning + '30' }]}>
          <Ionicons name="information-circle" size={18} color={Colors.warning} />
          <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
            Outil d'aide au dépistage — ne remplace pas un diagnostic médical professionnel.
          </Text>
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* ── Article Modal ── */}
      <Modal visible={showArticleModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedArticle?.title}</Text>
              <TouchableOpacity onPress={() => setShowArticleModal(false)}>
                <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md }}>
                <View style={[styles.catBadge, { backgroundColor: Colors.primary + '15' }]}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.primary }}>{selectedArticle?.category}</Text>
                </View>
                <Text style={{ fontSize: FontSize.xs, color: colors.textTertiary }}>{selectedArticle?.date ? new Date(selectedArticle.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</Text>
              </View>
              <Text style={{ fontSize: FontSize.sm, fontWeight: '600', color: Colors.primary, marginBottom: Spacing.sm, lineHeight: 20 }}>{selectedArticle?.summary}</Text>
              <View style={{ height: 1, backgroundColor: colors.separator, marginBottom: Spacing.md }} />
              <Text style={{ fontSize: FontSize.md, color: colors.text, lineHeight: 24 }}>{selectedArticle?.content}</Text>
              <View style={{ marginTop: Spacing.lg, padding: Spacing.md, backgroundColor: Colors.primary + '08', borderRadius: BorderRadius.md }}>
                <Text style={{ fontSize: FontSize.xs, fontWeight: '600', color: Colors.primary }}>📖 Source</Text>
                <Text style={{ fontSize: FontSize.sm, color: colors.textSecondary, marginTop: 4 }}>{selectedArticle?.source}</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Insights Modal ── */}
      <Modal visible={showInsightsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>🤖 Analyses IA</Text>
              <TouchableOpacity onPress={() => setShowInsightsModal(false)}>
                <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1 }}>
              {insights.map((ins) => (
                <View key={ins.id} style={[styles.insightModalRow, { borderColor: colors.separator }]}>
                  <View style={[styles.insightDot, { backgroundColor: getInsightBg(ins.severity) + '20' }]}>
                    <Text style={{ fontSize: 20 }}>{ins.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', color: colors.text, marginBottom: 2 }}>{ins.title}</Text>
                    <Text style={{ fontSize: FontSize.sm, color: colors.textSecondary, lineHeight: 20 }}>{ins.message}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  logo: { width: 44, height: 44, borderRadius: 12 },
  greeting: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  appName: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, letterSpacing: -0.5 },
  notifBtn: { width: 44, height: 44, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  notifBadge: { position: 'absolute', top: 8, right: 8, width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.danger, borderWidth: 2, borderColor: '#FFF' },
  periodRow: { flexDirection: 'row', backgroundColor: 'rgba(100,116,139,0.08)', borderRadius: BorderRadius.full, padding: 3, marginBottom: Spacing.lg },
  periodBtn: { flex: 1, paddingVertical: 8, borderRadius: BorderRadius.full, alignItems: 'center' },
  periodText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  heroCard: { borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.lg, overflow: 'hidden' },
  heroContent: { flexDirection: 'row', alignItems: 'center' },
  heroTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: '#FFF', marginBottom: 4 },
  heroSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)' },
  heroIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  decorCircle: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)' },
  tipGradient: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.lg },
  tipTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, marginBottom: 2 },
  tipDesc: { fontSize: FontSize.xs, lineHeight: 17 },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
  statIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  statNum: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  statLabel: { fontSize: 10, fontWeight: FontWeight.medium, marginTop: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  insightRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  insightDot: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  insightTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, marginBottom: 2 },
  insightMsg: { fontSize: FontSize.xs, lineHeight: 16 },
  severityBadge: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  severityDotInner: { width: 8, height: 8, borderRadius: 4 },
  scanIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  confBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  disclaimer: { flexDirection: 'row', padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, marginTop: Spacing.md, gap: Spacing.sm, alignItems: 'flex-start' },
  disclaimerText: { flex: 1, fontSize: FontSize.xs, lineHeight: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { height: '70%', borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, padding: Spacing.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  modalTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, flex: 1, marginRight: Spacing.sm },
  insightModalRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, paddingVertical: Spacing.md, borderBottomWidth: 1 },
});
