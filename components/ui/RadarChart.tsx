import React from 'react';
import { View } from 'react-native';
import Svg, { Polygon, Line, Text as SvgText, Circle, G } from 'react-native-svg';

interface RadarChartProps {
  data: {
    asymmetry: number;
    border: number;
    color: number;
    diameter: number;
    evolution: number;
  };
  size?: number;
  color?: string;
  fillColor?: string;
  textColor?: string;
  gridColor?: string;
}

export default function RadarChart({
  data,
  size = 220,
  color = '#2563EB',
  fillColor,
  textColor = '#94A3B8',
  gridColor = 'rgba(100,116,139,0.15)',
}: RadarChartProps) {
  const center = size / 2;
  const radius = center - 35;
  const angleStep = (Math.PI * 2) / 5;
  const labels = ['A', 'B', 'C', 'D', 'E'];
  const fullLabels = ['Asymétrie', 'Bords', 'Couleur', 'Diamètre', 'Évolution'];
  const values = [
    Math.min(data.asymmetry, 2) / 2,
    Math.min(data.border, 2) / 2,
    Math.min(data.color, 2) / 2,
    Math.min(data.diameter, 2) / 2,
    Math.min(data.evolution, 2) / 2,
  ];

  const getPoint = (value: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    return {
      x: center + radius * value * Math.cos(angle),
      y: center + radius * value * Math.sin(angle),
    };
  };

  const points = values.map((v, i) => getPoint(v, i));
  const polygonStr = points.map(p => `${p.x},${p.y}`).join(' ');
  const gridLevels = [0.25, 0.5, 0.75, 1];
  const fill = fillColor || `${color}25`;

  return (
    <View style={{ width: size, height: size, alignSelf: 'center' }}>
      <Svg width={size} height={size}>
        {/* Grid pentagons */}
        {gridLevels.map((level, i) => {
          const gp = Array.from({ length: 5 }, (_, idx) => getPoint(level, idx));
          return (
            <Polygon
              key={`grid-${i}`}
              points={gp.map(p => `${p.x},${p.y}`).join(' ')}
              stroke={gridColor}
              strokeWidth="1"
              fill="none"
            />
          );
        })}

        {/* Axes */}
        {Array.from({ length: 5 }, (_, i) => {
          const ep = getPoint(1, i);
          return (
            <Line key={`ax-${i}`} x1={center} y1={center} x2={ep.x} y2={ep.y} stroke={gridColor} strokeWidth="1" />
          );
        })}

        {/* Data fill */}
        <Polygon points={polygonStr} fill={fill} stroke={color} strokeWidth="2.5" />

        {/* Data dots */}
        {points.map((p, i) => (
          <G key={`dot-${i}`}>
            <Circle cx={p.x} cy={p.y} r="5" fill={color} />
            <Circle cx={p.x} cy={p.y} r="3" fill="#FFFFFF" />
          </G>
        ))}

        {/* Labels */}
        {Array.from({ length: 5 }, (_, i) => {
          const tp = getPoint(1.28, i);
          const val = (values[i] * 2).toFixed(1);
          return (
            <G key={`lbl-${i}`}>
              <SvgText
                x={tp.x}
                y={tp.y - 7}
                fill={color}
                fontSize="13"
                fontWeight="bold"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {labels[i]}
              </SvgText>
              <SvgText
                x={tp.x}
                y={tp.y + 7}
                fill={textColor}
                fontSize="9"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {val}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}
