import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useThemeColors, useColorScheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Theme';
import { getRiskColor, RiskLevel } from '@/constants/Lesions';
import Card from '@/components/ui/Card';

const DEMO_HISTORY = [
  { id: '1', date: '28 Avr 2026', time: '14:32', name: 'Naevus Mélanocytaire', risk: 'benign' as RiskLevel, conf: 0.89, icon: '🟢' },
  { id: '2', date: '25 Avr 2026', time: '09:15', name: 'Kératose Bénigne', risk: 'benign' as RiskLevel, conf: 0.76, icon: '🟢' },
  { id: '3', date: '20 Avr 2026', time: '16:45', name: 'Kératose Actinique', risk: 'pre-malignant' as RiskLevel, conf: 0.62, icon: '🟠' },
  { id: '4', date: '15 Avr 2026', time: '11:20', name: 'Dermatofibrome', risk: 'benign' as RiskLevel, conf: 0.91, icon: '🟢' },
];

type FilterType = 'all' | 'benign' | 'pre-malignant' | 'malignant';

export default function HistoryScreen() {
  const colors = useThemeColors();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterType>('all');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const filtered = filter === 'all' ? DEMO_HISTORY : DEMO_HISTORY.filter(i => i.risk === filter);
  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'Tout', count: DEMO_HISTORY.length },
    { key: 'benign', label: 'Bénin', count: DEMO_HISTORY.filter(h => h.risk === 'benign').length },
    { key: 'pre-malignant', label: 'Modéré', count: DEMO_HISTORY.filter(h => h.risk === 'pre-malignant').length },
    { key: 'malignant', label: 'Élevé', count: DEMO_HISTORY.filter(h => h.risk === 'malignant').length },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.sm }]}>
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={[styles.title, { color: colors.text }]}>Historique</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Vos analyses précédentes</Text>
        </Animated.View>

        {/* Stats */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <LinearGradient colors={colorScheme === 'dark' ? ['#1E293B', '#334155'] : ['#EFF6FF', '#F0F9FF']} style={styles.statsCard}>
            <View style={styles.statsRow}>
              {[
                { n: DEMO_HISTORY.length, l: 'Total', c: Colors.primary },
                { n: DEMO_HISTORY.filter(h => h.risk === 'benign').length, l: 'Bénignes', c: Colors.success },
                { n: DEMO_HISTORY.filter(h => h.risk === 'pre-malignant').length, l: 'À surveiller', c: Colors.warning },
                { n: DEMO_HISTORY.filter(h => h.risk === 'malignant').length, l: 'Alertes', c: Colors.danger },
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
          {filters.map((f) => (
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
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>Aucune analyse trouvée</Text>
          </View>
        ) : (
          filtered.map((item) => (
            <TouchableOpacity key={item.id} activeOpacity={0.7}>
              <Card variant="elevated" style={{ marginBottom: Spacing.sm }} padding="md">
                <View style={styles.historyRow}>
                  <View style={[styles.historyIcon, { backgroundColor: getRiskColor(item.risk) + '12' }]}>
                    <Text style={{ fontSize: 22 }}>{item.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.historyName, { color: colors.text }]}>{item.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="calendar-outline" size={12} color={colors.textTertiary} />
                      <Text style={[{ fontSize: FontSize.xs, color: colors.textTertiary }]}>{item.date} à {item.time}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <View style={[styles.historyBadge, { backgroundColor: getRiskColor(item.risk) + '15' }]}>
                      <Text style={[styles.historyBadgeText, { color: getRiskColor(item.risk) }]}>{(item.conf * 100).toFixed(0)}%</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                  </View>
                </View>
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
});
