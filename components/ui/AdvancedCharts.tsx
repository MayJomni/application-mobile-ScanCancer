import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, G, Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { FontSize, FontWeight, Spacing } from '@/constants/Theme';

// ─── Stacked Bar Chart ───
interface StackedBarData {
  label: string;
  benign: number;
  preMalignant: number;
  malignant: number;
}

interface StackedBarChartProps {
  data: StackedBarData[];
  height?: number;
  textColor?: string;
}

export function StackedBarChart({ data, height = 160, textColor = '#94A3B8' }: StackedBarChartProps) {
  const chartW = data.length * 22;
  const chartH = height - 30;
  const maxVal = Math.max(...data.map(d => d.benign + d.preMalignant + d.malignant), 1);
  const barW = 12;
  const gap = 10;

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={chartW} height={height}>
        {data.map((d, i) => {
          const total = d.benign + d.preMalignant + d.malignant;
          const x = i * (barW + gap) + gap / 2;
          const bH = (d.benign / maxVal) * chartH;
          const pH = (d.preMalignant / maxVal) * chartH;
          const mH = (d.malignant / maxVal) * chartH;
          const baseY = chartH;

          return (
            <G key={i}>
              {/* Benign */}
              {d.benign > 0 && (
                <Rect x={x} y={baseY - bH} width={barW} height={bH} rx={2} fill="#16A34A" opacity={0.85} />
              )}
              {/* Pre-malignant */}
              {d.preMalignant > 0 && (
                <Rect x={x} y={baseY - bH - pH} width={barW} height={pH} rx={2} fill="#F59E0B" opacity={0.85} />
              )}
              {/* Malignant */}
              {d.malignant > 0 && (
                <Rect x={x} y={baseY - bH - pH - mH} width={barW} height={mH} rx={2} fill="#DC2626" opacity={0.85} />
              )}
              {/* Day label */}
              {i % 3 === 0 && (
                <SvgText x={x + barW / 2} y={chartH + 14} fill={textColor} fontSize="8" textAnchor="middle">
                  {d.label}
                </SvgText>
              )}
            </G>
          );
        })}
        {/* Base line */}
        <Line x1={0} y1={chartH} x2={chartW} y2={chartH} stroke={textColor} strokeWidth="0.5" opacity={0.3} />
      </Svg>
    </View>
  );
}

// ─── Donut Chart ───
interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  textColor?: string;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({
  data,
  size = 160,
  strokeWidth = 20,
  textColor = '#94A3B8',
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const center = size / 2;
  const radius = center - strokeWidth / 2 - 5;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((s, d) => s + d.value, 0);

  let accumulated = 0;

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        {/* Background ring */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`${textColor}15`}
          strokeWidth={strokeWidth}
        />
        {/* Segments */}
        {total > 0 && data.filter(d => d.value > 0).map((d, i) => {
          const pct = d.value / total;
          const segLen = pct * circumference;
          const gapLen = circumference - segLen;
          const offset = -(accumulated * circumference) + circumference * 0.25; // start from top
          accumulated += pct;

          return (
            <Circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segLen} ${gapLen}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          );
        })}
        {/* Center text */}
        {centerValue && (
          <>
            <SvgText x={center} y={center - 4} fill={textColor} fontSize="22" fontWeight="bold" textAnchor="middle">
              {centerValue}
            </SvgText>
            {centerLabel && (
              <SvgText x={center} y={center + 14} fill={textColor} fontSize="10" textAnchor="middle">
                {centerLabel}
              </SvgText>
            )}
          </>
        )}
      </Svg>
    </View>
  );
}

// ─── Sparkline ───
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
}

export function Sparkline({ data, width = 120, height = 40, color = '#2563EB', fillColor }: SparklineProps) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const padding = 4;
  const w = width - padding * 2;
  const h = height - padding * 2;

  const pts = data.map((v, i) => ({
    x: padding + (i / (data.length - 1)) * w,
    y: padding + h - ((v - min) / range) * h,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${pts[pts.length - 1].x},${height} L${pts[0].x},${height} Z`;
  const fill = fillColor || `${color}20`;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.3" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d={areaPath} fill="url(#sparkGrad)" />
      <Path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last point dot */}
      <Circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="3" fill={color} />
    </Svg>
  );
}

// ─── Progress Bar ───
interface ProgressBarProps {
  value: number; // 0-100
  color: string;
  height?: number;
  bgColor?: string;
  label?: string;
  showValue?: boolean;
  textColor?: string;
}

export function ProgressBar({ value, color, height = 8, bgColor = 'rgba(100,116,139,0.1)', label, showValue = true, textColor = '#94A3B8' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <View style={{ marginBottom: 8 }}>
      {(label || showValue) && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          {label && <Text style={{ fontSize: 11, color: textColor }}>{label}</Text>}
          {showValue && <Text style={{ fontSize: 11, fontWeight: '700', color }}>{clamped.toFixed(0)}%</Text>}
        </View>
      )}
      <View style={{ height, borderRadius: height / 2, backgroundColor: bgColor, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${clamped}%`, borderRadius: height / 2, backgroundColor: color }} />
      </View>
    </View>
  );
}
