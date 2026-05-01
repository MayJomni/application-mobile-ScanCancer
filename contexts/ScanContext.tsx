import React, { createContext, useContext, useState, useCallback } from 'react';
import { LESION_TYPES, RiskLevel } from '@/constants/Lesions';

/**
 * DermaScan — Scan Context
 * Centralized state for scan results, history, and statistics
 */

export interface ScanPrediction {
  id: string;
  code: string;
  name: string;
  nameFr: string;
  confidence: number;
  riskLevel: RiskLevel;
  icon: string;
  descriptionFr: string;
  recommendationFr: string;
}

export interface ImageStats {
  brightness: number;        // 0-255
  contrast: number;          // 0-100
  saturation: number;        // 0-100
  sharpness: number;         // 0-100
  redChannel: number[];      // histogram 0-255 (32 bins)
  greenChannel: number[];    // histogram 0-255 (32 bins)
  blueChannel: number[];     // histogram 0-255 (32 bins)
  luminance: number[];       // histogram 0-255 (32 bins)
  dominantColors: { color: string; percentage: number; label: string }[];
  symmetryScore: number;     // 0-100
  borderRegularity: number;  // 0-100
  colorVariance: number;     // 0-100
  textureEntropy: number;    // 0-10
  lesionArea: number;        // percentage of image
  diameterMm: number;        // estimated diameter in mm
}

export interface ScanResult {
  id: string;
  imageUri: string;
  date: Date;
  predictions: ScanPrediction[];
  topPrediction: ScanPrediction;
  imageStats: ImageStats;
  abcdeScore: {
    asymmetry: number;
    border: number;
    color: number;
    diameter: number;
    evolution: number;
    total: number;
  };
  qualityScore: number; // 0-100
}

interface ScanContextType {
  scans: ScanResult[];
  addScan: (scan: ScanResult) => void;
  removeScan: (id: string) => void;
  clearScans: () => void;
  getStats: () => DashboardStats;
}

export interface DashboardStats {
  totalScans: number;
  benignCount: number;
  preMalignantCount: number;
  malignantCount: number;
  avgConfidence: number;
  riskDistribution: { label: string; value: number; color: string }[];
  recentScans: ScanResult[];
  weeklyScans: number[];
  lesionTypeDistribution: { name: string; count: number; color: string }[];
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

// Generate realistic image statistics
export function generateImageStats(): ImageStats {
  const genHistogram = (mean: number, spread: number): number[] => {
    const bins: number[] = [];
    for (let i = 0; i < 32; i++) {
      const x = (i / 31) * 255;
      const val = Math.exp(-0.5 * ((x - mean) / spread) ** 2) * (80 + Math.random() * 40);
      bins.push(Math.max(0, Math.round(val + Math.random() * 15)));
    }
    return bins;
  };

  const brightness = 100 + Math.random() * 100;
  const contrast = 30 + Math.random() * 50;

  return {
    brightness: Math.round(brightness),
    contrast: Math.round(contrast),
    saturation: Math.round(30 + Math.random() * 50),
    sharpness: Math.round(40 + Math.random() * 50),
    redChannel: genHistogram(140 + Math.random() * 60, 40 + Math.random() * 30),
    greenChannel: genHistogram(100 + Math.random() * 50, 35 + Math.random() * 25),
    blueChannel: genHistogram(80 + Math.random() * 40, 30 + Math.random() * 20),
    luminance: genHistogram(brightness, 45 + Math.random() * 25),
    dominantColors: [
      { color: `hsl(${15 + Math.random() * 20}, ${50 + Math.random() * 30}%, ${35 + Math.random() * 25}%)`, percentage: 25 + Math.random() * 20, label: 'Brun foncé' },
      { color: `hsl(${25 + Math.random() * 15}, ${40 + Math.random() * 30}%, ${55 + Math.random() * 20}%)`, percentage: 15 + Math.random() * 15, label: 'Brun clair' },
      { color: `hsl(${10 + Math.random() * 20}, ${60 + Math.random() * 25}%, ${70 + Math.random() * 15}%)`, percentage: 10 + Math.random() * 15, label: 'Rose/Peau' },
      { color: `hsl(${0 + Math.random() * 10}, ${20 + Math.random() * 30}%, ${25 + Math.random() * 15}%)`, percentage: 5 + Math.random() * 10, label: 'Noir/Gris' },
      { color: `hsl(${30 + Math.random() * 20}, ${10 + Math.random() * 20}%, ${85 + Math.random() * 10}%)`, percentage: 5 + Math.random() * 8, label: 'Blanc' },
    ].sort((a, b) => b.percentage - a.percentage),
    symmetryScore: Math.round(30 + Math.random() * 60),
    borderRegularity: Math.round(25 + Math.random() * 65),
    colorVariance: Math.round(15 + Math.random() * 70),
    textureEntropy: Math.round((2 + Math.random() * 6) * 10) / 10,
    lesionArea: Math.round((5 + Math.random() * 35) * 10) / 10,
    diameterMm: Math.round((2 + Math.random() * 12) * 10) / 10,
  };
}

// Generate ABCDE score based on predictions
export function generateABCDEScore(predictions: ScanPrediction[]) {
  const topRisk = predictions[0]?.riskLevel || 'benign';
  const baseBias = topRisk === 'malignant' ? 1.3 : topRisk === 'pre-malignant' ? 0.8 : 0.3;

  const asymmetry = Math.min(2, Math.round((Math.random() * 1.5 + baseBias) * 10) / 10);
  const border = Math.min(2, Math.round((Math.random() * 1.2 + baseBias * 0.8) * 10) / 10);
  const color = Math.min(2, Math.round((Math.random() * 1.4 + baseBias * 0.9) * 10) / 10);
  const diameter = Math.min(2, Math.round((Math.random() * 1.3 + baseBias * 0.7) * 10) / 10);
  const evolution = Math.min(2, Math.round((Math.random() * 1.1 + baseBias * 0.6) * 10) / 10);

  return {
    asymmetry,
    border,
    color,
    diameter,
    evolution,
    total: Math.round((asymmetry + border + color + diameter + evolution) * 10) / 10,
  };
}

// Generate predictions from lesion types
export function generatePredictions(): ScanPrediction[] {
  const predictions = LESION_TYPES.map((lesion) => ({
    id: lesion.id,
    code: lesion.code,
    name: lesion.name,
    nameFr: lesion.nameFr,
    confidence: Math.random(),
    riskLevel: lesion.riskLevel,
    icon: lesion.icon,
    descriptionFr: lesion.descriptionFr,
    recommendationFr: lesion.recommendationFr,
  }));
  predictions.sort((a, b) => b.confidence - a.confidence);
  const total = predictions.reduce((s, p) => s + p.confidence, 0);
  return predictions.map((p) => ({
    ...p,
    confidence: p.confidence / total,
  }));
}

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const [scans, setScans] = useState<ScanResult[]>([]);

  const addScan = useCallback((scan: ScanResult) => {
    setScans(prev => [scan, ...prev]);
  }, []);

  const removeScan = useCallback((id: string) => {
    setScans(prev => prev.filter(s => s.id !== id));
  }, []);

  const clearScans = useCallback(() => {
    setScans([]);
  }, []);

  const getStats = useCallback((): DashboardStats => {
    const totalScans = scans.length;
    const benignCount = scans.filter(s => s.topPrediction.riskLevel === 'benign').length;
    const preMalignantCount = scans.filter(s => s.topPrediction.riskLevel === 'pre-malignant').length;
    const malignantCount = scans.filter(s => s.topPrediction.riskLevel === 'malignant').length;
    const avgConfidence = totalScans > 0
      ? scans.reduce((s, r) => s + r.topPrediction.confidence, 0) / totalScans
      : 0;

    const riskDistribution = [
      { label: 'Bénin', value: benignCount, color: '#16A34A' },
      { label: 'Pré-malin', value: preMalignantCount, color: '#F59E0B' },
      { label: 'Malin', value: malignantCount, color: '#DC2626' },
    ];

    // Lesion type distribution
    const typeCounts: Record<string, number> = {};
    scans.forEach(s => {
      const name = s.topPrediction.nameFr;
      typeCounts[name] = (typeCounts[name] || 0) + 1;
    });
    const typeColors = ['#2563EB', '#7C3AED', '#0D9488', '#F59E0B', '#DC2626', '#EC4899', '#8B5CF6'];
    const lesionTypeDistribution = Object.entries(typeCounts).map(([name, count], i) => ({
      name,
      count,
      color: typeColors[i % typeColors.length],
    }));

    // Weekly scans (last 7 days)
    const weeklyScans = Array(7).fill(0);
    const now = new Date();
    scans.forEach(s => {
      const diff = Math.floor((now.getTime() - new Date(s.date).getTime()) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff < 7) weeklyScans[6 - diff]++;
    });

    return {
      totalScans,
      benignCount,
      preMalignantCount,
      malignantCount,
      avgConfidence,
      riskDistribution,
      recentScans: scans.slice(0, 5),
      weeklyScans,
      lesionTypeDistribution,
    };
  }, [scans]);

  return (
    <ScanContext.Provider value={{ scans, addScan, removeScan, clearScans, getStats }}>
      {children}
    </ScanContext.Provider>
  );
}

export function useScanContext() {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScanContext must be used within a ScanProvider');
  }
  return context;
}
