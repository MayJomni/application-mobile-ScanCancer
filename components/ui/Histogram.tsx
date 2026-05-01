import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/Theme';

interface HistogramProps {
  data: number[];
  color: string;
  label: string;
  height?: number;
  showAxis?: boolean;
  bgColor?: string;
}

export default function Histogram({ data, color, label, height = 80, showAxis = true, bgColor = 'rgba(0,0,0,0.03)' }: HistogramProps) {
  const maxVal = Math.max(...data, 1);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>  
      <Text style={[styles.label, { color }]}>{label}</Text>
      <View style={[styles.barsContainer, { height }]}>
        {data.map((val, i) => (
          <View key={i} style={styles.barWrapper}>
            <View
              style={[
                styles.bar,
                {
                  height: `${(val / maxVal) * 100}%`,
                  backgroundColor: color,
                  opacity: 0.4 + (val / maxVal) * 0.6,
                },
              ]}
            />
          </View>
        ))}
      </View>
      {showAxis && (
        <View style={styles.axis}>
          <Text style={styles.axisText}>0</Text>
          <Text style={styles.axisText}>128</Text>
          <Text style={styles.axisText}>255</Text>
        </View>
      )}
    </View>
  );
}

interface MiniBarChartProps {
  data: { label: string; value: number; color: string }[];
  maxValue?: number;
  textColor?: string;
  barBgColor?: string;
}

export function MiniBarChart({ data, maxValue, textColor = '#94A3B8', barBgColor = 'rgba(0,0,0,0.05)' }: MiniBarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);

  return (
    <View style={styles.chartContainer}>
      {data.map((item, i) => (
        <View key={i} style={styles.chartRow}>
          <Text style={[styles.chartLabel, { color: textColor }]} numberOfLines={1}>{item.label}</Text>
          <View style={[styles.chartBarBg, { backgroundColor: barBgColor }]}>
            <View style={[styles.chartBar, { width: `${(item.value / max) * 100}%`, backgroundColor: item.color }]} />
          </View>
          <Text style={[styles.chartValue, { color: item.color }]}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

interface CircularGaugeProps {
  value: number; // 0-100
  label: string;
  color: string;
  size?: number;
  textColor?: string;
}

export function CircularGauge({ value, label, color, size = 70, textColor = '#E2E8F0' }: CircularGaugeProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  return (
    <View style={styles.gaugeContainer}>
      <View style={[styles.gaugeOuter, { width: size, height: size, borderRadius: size / 2, borderColor: color + '20' }]}>
        <View style={[styles.gaugeInner, { width: size - 10, height: size - 10, borderRadius: (size - 10) / 2 }]}>
          <Text style={[styles.gaugeValue, { color }]}>{clampedValue}%</Text>
        </View>
        {/* Simple arc visualization using border trick */}
        <View style={[styles.gaugeArc, {
          width: size, height: size, borderRadius: size / 2,
          borderColor: color, borderTopColor: clampedValue > 25 ? color : 'transparent',
          borderRightColor: clampedValue > 50 ? color : 'transparent',
          borderBottomColor: clampedValue > 75 ? color : 'transparent',
          borderLeftColor: clampedValue > 0 ? color : 'transparent',
          transform: [{ rotate: '-45deg' }],
        }]} />
      </View>
      <Text style={[styles.gaugeLabel, { color: textColor }]}>{label}</Text>
    </View>
  );
}

interface ColorSwatchRowProps {
  colors: { color: string; percentage: number; label: string }[];
  textColor?: string;
}

export function ColorSwatchRow({ colors, textColor = '#94A3B8' }: ColorSwatchRowProps) {
  return (
    <View>
      {colors.slice(0, 5).map((c, i) => (
        <View key={i} style={styles.swatchRow}>
          <View style={[styles.swatch, { backgroundColor: c.color }]} />
          <Text style={[styles.swatchLabel, { color: textColor }]}>{c.label}</Text>
          <View style={[styles.swatchBarBg, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
            <View style={[styles.swatchBar, { width: `${c.percentage}%`, backgroundColor: c.color }]} />
          </View>
          <Text style={[styles.swatchPct, { color: textColor }]}>{c.percentage.toFixed(0)}%</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.sm, borderRadius: BorderRadius.md, marginBottom: Spacing.sm },
  label: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, marginBottom: 4 },
  barsContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 1 },
  barWrapper: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderTopLeftRadius: 1, borderTopRightRadius: 1, minHeight: 1 },
  axis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  axisText: { fontSize: 8, color: '#64748B' },
  chartContainer: { gap: Spacing.sm },
  chartRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  chartLabel: { fontSize: FontSize.xs, width: 70 },
  chartBarBg: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  chartBar: { height: '100%', borderRadius: 4 },
  chartValue: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, width: 24, textAlign: 'right' },
  gaugeContainer: { alignItems: 'center', gap: 4 },
  gaugeOuter: { borderWidth: 3, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  gaugeInner: { backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  gaugeValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  gaugeArc: { position: 'absolute', borderWidth: 3 },
  gaugeLabel: { fontSize: 10, fontWeight: FontWeight.medium, textAlign: 'center' },
  swatchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 3 },
  swatch: { width: 16, height: 16, borderRadius: 4 },
  swatchLabel: { fontSize: FontSize.xs, width: 70 },
  swatchBarBg: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  swatchBar: { height: '100%', borderRadius: 3 },
  swatchPct: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, width: 30, textAlign: 'right' },
});
