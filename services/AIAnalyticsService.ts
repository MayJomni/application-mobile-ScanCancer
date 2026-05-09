/**
 * DermaScan — AI Analytics Service
 * Generates predictive insights, recommendations, and trend analysis
 */

import { ScanResult } from '@/contexts/ScanContext';

export interface AIInsight {
  id: string;
  type: 'alert' | 'recommendation' | 'insight' | 'trend';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  icon: string;
  date: Date;
}

export interface TrendData {
  label: string;
  current: number;
  previous: number;
  changePercent: number;
  direction: 'up' | 'down' | 'stable';
}

export interface PerformanceMetrics {
  avgConfidenceThisWeek: number;
  avgConfidenceLastWeek: number;
  scanVolumeChange: number;
  highRiskRate: number;
  qualityScore: number;
}

/**
 * Generate AI-powered predictive insights from scan data
 */
export function generateInsights(scans: ScanResult[]): AIInsight[] {
  const insights: AIInsight[] = [];
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const thisWeekScans = scans.filter(s => new Date(s.date) >= weekAgo);
  const thisMonthScans = scans.filter(s => new Date(s.date) >= monthAgo);

  const malignantCount = scans.filter(s => s.topPrediction.riskLevel === 'malignant').length;
  const preMalignantCount = scans.filter(s => s.topPrediction.riskLevel === 'pre-malignant').length;
  const weekMalignant = thisWeekScans.filter(s => s.topPrediction.riskLevel === 'malignant').length;

  // Critical: urgent cases not reviewed
  const urgentCases = scans.filter(s =>
    s.abcdeScore.total > 6 &&
    s.topPrediction.confidence > 0.85 &&
    s.topPrediction.riskLevel === 'malignant'
  );
  if (urgentCases.length > 0) {
    insights.push({
      id: 'urgent-cases',
      type: 'alert',
      severity: 'critical',
      title: 'Cas urgents détectés',
      message: `${urgentCases.length} scan(s) avec score ABCDE > 6 et confiance > 85% nécessitent une revue immédiate.`,
      icon: '🚨',
      date: now,
    });
  }

  // Weekly melanoma alert
  if (weekMalignant >= 2) {
    insights.push({
      id: 'weekly-melanoma',
      type: 'alert',
      severity: 'warning',
      title: 'Augmentation des mélanomes',
      message: `${weekMalignant} mélanomes diagnostiqués cette semaine. Vérifiez les patients phototype I-II et recommandez un suivi renforcé.`,
      icon: '⚠️',
      date: now,
    });
  }

  // Pre-malignant trend
  if (preMalignantCount > 3) {
    const rate = ((preMalignantCount / Math.max(scans.length, 1)) * 100).toFixed(0);
    insights.push({
      id: 'pre-malignant-trend',
      type: 'trend',
      severity: 'warning',
      title: 'Tendance pré-maligne',
      message: `${rate}% de vos analyses sont pré-malignes (${preMalignantCount} cas). Envisagez une campagne de dépistage ciblée.`,
      icon: '📈',
      date: now,
    });
  }

  // Volume recommendation
  if (thisWeekScans.length > 15) {
    insights.push({
      id: 'volume-high',
      type: 'recommendation',
      severity: 'info',
      title: 'Volume élevé',
      message: `${thisWeekScans.length} scans cette semaine. Pensez à prendre des pauses régulières pour maintenir la qualité diagnostique.`,
      icon: '💡',
      date: now,
    });
  }

  // Confidence insight
  const avgConf = scans.length > 0
    ? scans.reduce((s, r) => s + r.topPrediction.confidence, 0) / scans.length
    : 0;
  if (avgConf > 0 && avgConf < 0.6) {
    insights.push({
      id: 'low-confidence',
      type: 'insight',
      severity: 'info',
      title: 'Confiance IA faible',
      message: `La confiance moyenne est de ${(avgConf * 100).toFixed(0)}%. Vérifiez la qualité des images capturées (éclairage, netteté).`,
      icon: '🔍',
      date: now,
    });
  }

  // Quality insight
  const avgQuality = scans.length > 0
    ? scans.reduce((s, r) => s + r.qualityScore, 0) / scans.length
    : 0;
  if (avgQuality > 0 && avgQuality < 60) {
    insights.push({
      id: 'quality-low',
      type: 'recommendation',
      severity: 'warning',
      title: 'Qualité d\'image à améliorer',
      message: `Score qualité moyen : ${avgQuality.toFixed(0)}%. Utilisez un bon éclairage et maintenez le téléphone à 10-15cm de la lésion.`,
      icon: '📸',
      date: now,
    });
  }

  // Default positive insight
  if (insights.length === 0) {
    insights.push({
      id: 'all-good',
      type: 'insight',
      severity: 'info',
      title: 'Statistiques stables',
      message: 'Vos indicateurs sont normaux. Continuez votre excellent travail de dépistage préventif.',
      icon: '✅',
      date: now,
    });
  }

  return insights;
}

/**
 * Calculate performance metrics
 */
export function getPerformanceMetrics(scans: ScanResult[]): PerformanceMetrics {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const thisWeek = scans.filter(s => new Date(s.date) >= weekAgo);
  const lastWeek = scans.filter(s => new Date(s.date) >= twoWeeksAgo && new Date(s.date) < weekAgo);

  const avgConfThisWeek = thisWeek.length > 0
    ? thisWeek.reduce((s, r) => s + r.topPrediction.confidence, 0) / thisWeek.length
    : 0;
  const avgConfLastWeek = lastWeek.length > 0
    ? lastWeek.reduce((s, r) => s + r.topPrediction.confidence, 0) / lastWeek.length
    : 0;

  const volumeChange = lastWeek.length > 0
    ? ((thisWeek.length - lastWeek.length) / lastWeek.length) * 100
    : 0;

  const highRiskCount = scans.filter(s => s.topPrediction.riskLevel !== 'benign').length;

  return {
    avgConfidenceThisWeek: avgConfThisWeek,
    avgConfidenceLastWeek: avgConfLastWeek,
    scanVolumeChange: volumeChange,
    highRiskRate: scans.length > 0 ? highRiskCount / scans.length : 0,
    qualityScore: scans.length > 0
      ? scans.reduce((s, r) => s + r.qualityScore, 0) / scans.length
      : 0,
  };
}

/**
 * Generate trend data for dashboard cards
 */
export function getTrends(scans: ScanResult[]): TrendData[] {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const thisWeek = scans.filter(s => new Date(s.date) >= weekAgo);
  const lastWeek = scans.filter(s => new Date(s.date) >= twoWeeksAgo && new Date(s.date) < weekAgo);

  const calcChange = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  };

  const getDir = (change: number): 'up' | 'down' | 'stable' => {
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
  };

  const totalChange = calcChange(thisWeek.length, lastWeek.length);
  const malThis = thisWeek.filter(s => s.topPrediction.riskLevel === 'malignant').length;
  const malLast = lastWeek.filter(s => s.topPrediction.riskLevel === 'malignant').length;
  const malChange = calcChange(malThis, malLast);

  return [
    { label: 'Scans/semaine', current: thisWeek.length, previous: lastWeek.length, changePercent: totalChange, direction: getDir(totalChange) },
    { label: 'Cas malins', current: malThis, previous: malLast, changePercent: malChange, direction: getDir(malChange) },
  ];
}

/**
 * Generate monthly scan distribution (for bar charts)
 */
export function getMonthlyDistribution(scans: ScanResult[]): { day: number; benign: number; preMalignant: number; malignant: number }[] {
  const now = new Date();
  const days: { day: number; benign: number; preMalignant: number; malignant: number }[] = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayScans = scans.filter(s => {
      const sd = new Date(s.date);
      return sd.getDate() === date.getDate() && sd.getMonth() === date.getMonth() && sd.getFullYear() === date.getFullYear();
    });

    days.push({
      day: date.getDate(),
      benign: dayScans.filter(s => s.topPrediction.riskLevel === 'benign').length,
      preMalignant: dayScans.filter(s => s.topPrediction.riskLevel === 'pre-malignant').length,
      malignant: dayScans.filter(s => s.topPrediction.riskLevel === 'malignant').length,
    });
  }

  return days;
}

/**
 * Generate anatomical site distribution
 */
export function getAnatomicalDistribution(scans: ScanResult[]): { site: string; siteFr: string; count: number; color: string }[] {
  const siteMap: Record<string, { fr: string; color: string; count: number }> = {
    'head/neck': { fr: 'Tête/Cou', color: '#2563EB', count: 0 },
    'trunk': { fr: 'Tronc', color: '#7C3AED', count: 0 },
    'upper_limbs': { fr: 'Membres sup.', color: '#0D9488', count: 0 },
    'lower_limbs': { fr: 'Membres inf.', color: '#F59E0B', count: 0 },
    'other': { fr: 'Autre', color: '#64748B', count: 0 },
  };

  scans.forEach(s => {
    const site = s.anatomicalSite || 'other';
    if (siteMap[site]) siteMap[site].count++;
  });

  return Object.entries(siteMap).map(([site, data]) => ({
    site,
    siteFr: data.fr,
    count: data.count,
    color: data.color,
  }));
}
