import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, StatusBar, Alert, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useThemeColors, useColorScheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Theme';
import { getRiskColor, getRiskLabel, RiskLevel } from '@/constants/Lesions';
import Card from '@/components/ui/Card';
import Histogram, { CircularGauge, ColorSwatchRow } from '@/components/ui/Histogram';
import { useScanContext, ScanResult } from '@/contexts/ScanContext';

type FilterType = 'all' | 'benign' | 'pre-malignant' | 'malignant';

export default function HistoryScreen() {
  const colors = useThemeColors();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { scans, removeScan, clearScans } = useScanContext();
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const filtered = filter === 'all' ? scans : scans.filter(s => s.topPrediction.riskLevel === filter);
  const benignCount = scans.filter(s => s.topPrediction.riskLevel === 'benign').length;
  const premalCount = scans.filter(s => s.topPrediction.riskLevel === 'pre-malignant').length;
  const malCount = scans.filter(s => s.topPrediction.riskLevel === 'malignant').length;

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'Tout', count: scans.length },
    { key: 'benign', label: 'Bénin', count: benignCount },
    { key: 'pre-malignant', label: 'Modéré', count: premalCount },
    { key: 'malignant', label: 'Élevé', count: malCount },
  ];

  const handleDelete = (id: string) => {
    Alert.alert('Supprimer', 'Voulez-vous supprimer cette analyse ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => { removeScan(id); if (expandedId === id) setExpandedId(null); } },
    ]);
  };

  const handleClearAll = () => {
    if (scans.length === 0) return;
    Alert.alert('Tout supprimer', 'Voulez-vous supprimer tout l\'historique ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer tout', style: 'destructive', onPress: clearScans },
    ]);
  };

  const renderExpandedStats = (scan: ScanResult) => (
    <View style={{ marginTop: Spacing.md }}>
      {/* Image preview */}
      <Image source={{ uri: scan.imageUri }} style={{ width: '100%', height: 200, borderRadius: BorderRadius.md, marginBottom: Spacing.md }} resizeMode="cover" />

      {/* ABCDE Score */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md }}>
        {[
          { l: 'A', v: scan.abcdeScore.asymmetry },
          { l: 'B', v: scan.abcdeScore.border },
          { l: 'C', v: scan.abcdeScore.color },
          { l: 'D', v: scan.abcdeScore.diameter },
          { l: 'E', v: scan.abcdeScore.evolution },
        ].map(item => (
          <View key={item.l} style={{ alignItems: 'center' }}>
            <View style={[styles.abcdeBadge, { backgroundColor: item.v > 1.2 ? '#DC262620' : item.v > 0.6 ? '#F59E0B20' : '#16A34A20' }]}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: item.v > 1.2 ? '#DC2626' : item.v > 0.6 ? '#F59E0B' : '#16A34A' }}>{item.l}</Text>
            </View>
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text, marginTop: 2 }}>{item.v.toFixed(1)}</Text>
          </View>
        ))}
        <View style={{ alignItems: 'center' }}>
          <View style={[styles.abcdeBadge, { backgroundColor: Colors.primary + '20' }]}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.primary }}>Tot</Text>
          </View>
          <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.primary, marginTop: 2 }}>{scan.abcdeScore.total.toFixed(1)}</Text>
        </View>
      </View>

      {/* Mini histograms */}
      <Text style={{ fontSize: FontSize.sm, fontWeight: '600', color: colors.text, marginBottom: Spacing.xs }}>📊 Histogrammes</Text>
      <Histogram data={scan.imageStats.redChannel} color="#EF4444" label="R" height={50} bgColor={colors.card} showAxis={false} />
      <Histogram data={scan.imageStats.greenChannel} color="#22C55E" label="G" height={50} bgColor={colors.card} showAxis={false} />
      <Histogram data={scan.imageStats.blueChannel} color="#3B82F6" label="B" height={50} bgColor={colors.card} showAxis={false} />

      {/* Gauges */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: Spacing.md, marginBottom: Spacing.md }}>
        <CircularGauge value={scan.imageStats.symmetryScore} label="Symétrie" color="#2563EB" size={55} textColor={colors.textSecondary} />
        <CircularGauge value={scan.imageStats.borderRegularity} label="Bords" color="#0D9488" size={55} textColor={colors.textSecondary} />
        <CircularGauge value={scan.imageStats.colorVariance} label="Couleur" color="#F59E0B" size={55} textColor={colors.textSecondary} />
        <CircularGauge value={scan.qualityScore} label="Qualité" color="#7C3AED" size={55} textColor={colors.textSecondary} />
      </View>

      {/* Key metrics */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
        {[
          { label: 'Diamètre', value: `${scan.imageStats.diameterMm}mm`, color: Colors.primary },
          { label: 'Surface', value: `${scan.imageStats.lesionArea}%`, color: Colors.secondary },
          { label: 'Luminosité', value: `${scan.imageStats.brightness}`, color: '#F59E0B' },
          { label: 'Contraste', value: `${scan.imageStats.contrast}%`, color: '#7C3AED' },
        ].map((m, i) => (
          <View key={i} style={[styles.metricPill, { backgroundColor: m.color + '10', borderColor: m.color + '30' }]}>
            <Text style={{ fontSize: 10, color: colors.textSecondary }}>{m.label}</Text>
            <Text style={{ fontSize: FontSize.sm, fontWeight: '700', color: m.color }}>{m.value}</Text>
          </View>
        ))}
      </View>

      {/* Delete button */}
      <TouchableOpacity onPress={() => handleDelete(scan.id)} style={[styles.deleteBtn, { borderColor: '#DC262630' }]}>
        <Ionicons name="trash-outline" size={16} color="#DC2626" />
        <Text style={{ fontSize: FontSize.sm, color: '#DC2626', fontWeight: '600' }}>Supprimer cette analyse</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.sm }]}>
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>Historique</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Vos analyses précédentes</Text>
            </View>
            {scans.length > 0 && (
              <TouchableOpacity onPress={handleClearAll} style={[styles.clearAllBtn, { backgroundColor: '#DC262610' }]}>
                <Ionicons name="trash-outline" size={16} color="#DC2626" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Stats Summary */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <LinearGradient colors={colorScheme === 'dark' ? ['#1E293B', '#334155'] : ['#EFF6FF', '#F0F9FF']} style={styles.statsCard}>
            <View style={styles.statsRow}>
              {[
                { n: scans.length, l: 'Total', c: Colors.primary },
                { n: benignCount, l: 'Bénignes', c: Colors.success },
                { n: premalCount, l: 'À surveiller', c: Colors.warning },
                { n: malCount, l: 'Alertes', c: Colors.danger },
              ].map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <View style={[styles.statDivider, { backgroundColor: colors.separator }]} />}
                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: s.c }]}>{s.n}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.l}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.lg }} contentContainerStyle={{ gap: Spacing.sm }}>
          {filters.map(f => (
            <TouchableOpacity key={f.key} onPress={() => setFilter(f.key)} activeOpacity={0.7}>
              <View style={[styles.filterChip, filter === f.key ? { backgroundColor: Colors.primary } : { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder }]}>
                <Text style={[styles.filterText, { color: filter === f.key ? '#FFF' : colors.textSecondary }]}>{f.label}</Text>
                <View style={[styles.filterBadge, { backgroundColor: filter === f.key ? 'rgba(255,255,255,0.25)' : colors.separator }]}>
                  <Text style={[styles.filterBadgeText, { color: filter === f.key ? '#FFF' : colors.textTertiary }]}>{f.count}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* List */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
              {scans.length === 0 ? 'Aucune analyse effectuée' : 'Aucune analyse trouvée'}
            </Text>
            <Text style={{ fontSize: FontSize.sm, color: colors.textTertiary, textAlign: 'center', marginTop: Spacing.xs }}>
              {scans.length === 0 ? 'Utilisez le scanner pour analyser une lésion cutanée' : 'Essayez un autre filtre'}
            </Text>
          </View>
        ) : (
          filtered.map(scan => (
            <TouchableOpacity key={scan.id} activeOpacity={0.7} onPress={() => setExpandedId(expandedId === scan.id ? null : scan.id)}>
              <Card variant="elevated" style={{ marginBottom: Spacing.sm }} padding="md">
                <View style={styles.historyRow}>
                  <View style={[styles.historyIcon, { backgroundColor: getRiskColor(scan.topPrediction.riskLevel) + '12' }]}>
                    <Text style={{ fontSize: 22 }}>{scan.topPrediction.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.historyName, { color: colors.text }]}>{scan.topPrediction.nameFr}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="calendar-outline" size={12} color={colors.textTertiary} />
                      <Text style={{ fontSize: FontSize.xs, color: colors.textTertiary }}>
                        {new Date(scan.date).toLocaleDateString('fr-FR')} à {new Date(scan.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <View style={[styles.historyBadge, { backgroundColor: getRiskColor(scan.topPrediction.riskLevel) + '15' }]}>
                      <Text style={[styles.historyBadgeText, { color: getRiskColor(scan.topPrediction.riskLevel) }]}>{(scan.topPrediction.confidence * 100).toFixed(0)}%</Text>
                    </View>
                    <Ionicons name={expandedId === scan.id ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textTertiary} />
                  </View>
                </View>
                {expandedId === scan.id && renderExpandedStats(scan)}
              </Card>
            </TouchableOpacity>
          ))
        )}
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
  subtitle: { fontSize: FontSize.md, marginTop: Spacing.xs },
  clearAllBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statsCard: { borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.lg },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  statLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, marginTop: 2 },
  statDivider: { width: 1, height: 40 },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.full, gap: Spacing.xs },
  filterText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  filterBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.full, minWidth: 22, alignItems: 'center' },
  filterBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  historyIcon: { width: 48, height: 48, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  historyName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, marginBottom: 4 },
  historyBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full },
  historyBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl * 2 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, marginTop: Spacing.md },
  abcdeBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  metricPill: { flex: 1, minWidth: '40%', padding: Spacing.sm, borderRadius: BorderRadius.md, borderWidth: 1, alignItems: 'center' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: '#DC262630', marginTop: Spacing.md },
});
