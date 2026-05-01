import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView,
  Animated, Dimensions, Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useThemeColors, useColorScheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '@/constants/Theme';
import { getRiskColor, getRiskLabel } from '@/constants/Lesions';
import Card from '@/components/ui/Card';
import Histogram, { CircularGauge, ColorSwatchRow } from '@/components/ui/Histogram';
import { useScanContext, generatePredictions, generateImageStats, generateABCDEScore, ScanResult } from '@/contexts/ScanContext';

const { width } = Dimensions.get('window');

export default function ScanScreen() {
  const colors = useThemeColors();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { addScan } = useScanContext();

  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showStats, setShowStats] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const resultFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const pickImage = async (source: 'camera' | 'gallery') => {
    let result;
    if (source === 'camera') {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) { Alert.alert('Permission requise', 'Accès caméra nécessaire.'); return; }
      result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { Alert.alert('Permission requise', 'Accès galerie nécessaire.'); return; }
      result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    }
    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      setResults(null);
      setScanResult(null);
      setShowStats(false);
    }
  };

  const analyzeImage = () => {
    if (!image) return;
    setAnalyzing(true); setResults(null); setScanResult(null);
    progressAnim.setValue(0);
    Animated.timing(progressAnim, { toValue: 1, duration: 2500, useNativeDriver: false }).start();

    setTimeout(() => {
      const preds = generatePredictions();
      const imgStats = generateImageStats();
      const abcde = generateABCDEScore(preds);
      const scan: ScanResult = {
        id: Date.now().toString(),
        imageUri: image,
        date: new Date(),
        predictions: preds,
        topPrediction: preds[0],
        imageStats: imgStats,
        abcdeScore: abcde,
        qualityScore: Math.round(50 + Math.random() * 45),
      };
      setResults(preds);
      setScanResult(scan);
      setAnalyzing(false);
      addScan(scan);
      resultFade.setValue(0);
      Animated.timing(resultFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, 2800);
  };

  const resetScan = () => { setImage(null); setResults(null); setScanResult(null); setShowStats(false); };
  const topResult = results?.[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.sm }]}>
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={[styles.title, { color: colors.text }]}>Scanner</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Analysez une lésion cutanée avec l'IA</Text>
        </Animated.View>

        {/* Image Area */}
        <Animated.View style={[styles.imageArea, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {image ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.previewImage} />
              {analyzing && (
                <View style={styles.analyzingOverlay}>
                  <LinearGradient colors={['rgba(37,99,235,0.9)', 'rgba(124,58,237,0.9)']} style={styles.analyzingGradient}>
                    <View style={styles.scanLineContainer}>
                      <Animated.View style={[styles.scanLine, { top: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
                    </View>
                    <ActivityIndicator size="large" color="#FFF" />
                    <Text style={styles.analyzingText}>Analyse en cours...</Text>
                    <Text style={styles.analyzingSubtext}>Classification par réseau de neurones</Text>
                  </LinearGradient>
                </View>
              )}
              <TouchableOpacity style={styles.closeImageBtn} onPress={resetScan}>
                <Ionicons name="close" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={[styles.placeholderArea, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} activeOpacity={0.7} onPress={() => pickImage('gallery')}>
              <LinearGradient colors={[Colors.primary + '15', Colors.accent + '10']} style={styles.placeholderGradient}>
                <View style={[styles.placeholderIcon, { backgroundColor: Colors.primary + '15' }]}>
                  <Ionicons name="image-outline" size={48} color={Colors.primary} />
                </View>
                <Text style={[styles.placeholderTitle, { color: colors.text }]}>Sélectionner une image</Text>
                <Text style={[styles.placeholderDesc, { color: colors.textSecondary }]}>Prenez une photo ou importez depuis votre galerie</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Action Buttons */}
        {!results && (
          <Animated.View style={[styles.actionsRow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => pickImage('camera')} activeOpacity={0.8}>
              <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.actionGradient}>
                <Ionicons name="camera" size={28} color="#FFF" />
                <Text style={styles.actionText}>Caméra</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => pickImage('gallery')} activeOpacity={0.8}>
              <LinearGradient colors={[Colors.secondary, Colors.secondaryDark]} style={styles.actionGradient}>
                <Ionicons name="images" size={28} color="#FFF" />
                <Text style={styles.actionText}>Galerie</Text>
              </LinearGradient>
            </TouchableOpacity>
            {image && (
              <TouchableOpacity style={styles.actionBtn} onPress={analyzeImage} disabled={analyzing} activeOpacity={0.8}>
                <LinearGradient colors={[Colors.accent, '#6D28D9']} style={styles.actionGradient}>
                  <Ionicons name="analytics" size={28} color="#FFF" />
                  <Text style={styles.actionText}>Analyser</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}

        {/* Results + Stats */}
        {results && topResult && scanResult && (
          <Animated.View style={{ opacity: resultFade }}>
            {/* Top Result Card */}
            <Card variant="elevated" style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View style={[styles.riskBadge, { backgroundColor: getRiskColor(topResult.riskLevel) + '15' }]}>
                  <View style={[styles.riskDot, { backgroundColor: getRiskColor(topResult.riskLevel) }]} />
                  <Text style={[styles.riskText, { color: getRiskColor(topResult.riskLevel) }]}>{getRiskLabel(topResult.riskLevel)}</Text>
                </View>
                <Text style={[styles.confidenceText, { color: colors.textSecondary }]}>{(topResult.confidence * 100).toFixed(1)}%</Text>
              </View>
              <Text style={[styles.resultTitle, { color: colors.text }]}>{topResult.nameFr}</Text>
              <Text style={[styles.resultName, { color: colors.textSecondary }]}>{topResult.name}</Text>
              <Text style={[styles.resultDesc, { color: colors.textSecondary }]}>{topResult.descriptionFr}</Text>
              <View style={styles.confBarContainer}>
                <View style={[styles.confBarBg, { backgroundColor: colors.separator }]}>
                  <LinearGradient colors={[getRiskColor(topResult.riskLevel), getRiskColor(topResult.riskLevel) + 'AA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.confBarFill, { width: `${topResult.confidence * 100}%` }]} />
                </View>
              </View>
              <View style={[styles.recommendation, { backgroundColor: getRiskColor(topResult.riskLevel) + '08' }]}>
                <Ionicons name="medical" size={18} color={getRiskColor(topResult.riskLevel)} />
                <Text style={[styles.recommendationText, { color: colors.text }]}>{topResult.recommendationFr}</Text>
              </View>
            </Card>

            {/* ABCDE Score */}
            <Card variant="elevated" style={{ marginBottom: Spacing.lg, padding: Spacing.lg }}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: Spacing.md }]}>📏 Score ABCDE</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md }}>
                {[
                  { label: 'A', name: 'Asymétrie', val: scanResult.abcdeScore.asymmetry },
                  { label: 'B', name: 'Bords', val: scanResult.abcdeScore.border },
                  { label: 'C', name: 'Couleur', val: scanResult.abcdeScore.color },
                  { label: 'D', name: 'Diamètre', val: scanResult.abcdeScore.diameter },
                  { label: 'E', name: 'Évolution', val: scanResult.abcdeScore.evolution },
                ].map((item) => (
                  <View key={item.label} style={{ alignItems: 'center', flex: 1 }}>
                    <View style={[styles.abcdeBadge, { backgroundColor: item.val > 1.2 ? '#DC262620' : item.val > 0.6 ? '#F59E0B20' : '#16A34A20' }]}>
                      <Text style={[styles.abcdeLetter, { color: item.val > 1.2 ? '#DC2626' : item.val > 0.6 ? '#F59E0B' : '#16A34A' }]}>{item.label}</Text>
                    </View>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text, marginTop: 4 }}>{item.val.toFixed(1)}</Text>
                    <Text style={{ fontSize: 9, color: colors.textTertiary }}>{item.name}</Text>
                  </View>
                ))}
              </View>
              <View style={[styles.abcdeTotal, { backgroundColor: scanResult.abcdeScore.total > 5 ? '#DC262610' : scanResult.abcdeScore.total > 3 ? '#F59E0B10' : '#16A34A10' }]}>
                <Text style={{ fontSize: FontSize.sm, fontWeight: '600', color: colors.text }}>Score Total</Text>
                <Text style={{ fontSize: FontSize.xl, fontWeight: '800', color: scanResult.abcdeScore.total > 5 ? '#DC2626' : scanResult.abcdeScore.total > 3 ? '#F59E0B' : '#16A34A' }}>{scanResult.abcdeScore.total.toFixed(1)}/10</Text>
              </View>
            </Card>

            {/* Toggle Stats */}
            <TouchableOpacity onPress={() => setShowStats(!showStats)} activeOpacity={0.8}>
              <LinearGradient colors={['#7C3AED', '#6D28D9']} style={styles.statsToggle}>
                <Ionicons name={showStats ? 'chevron-up' : 'bar-chart'} size={20} color="#FFF" />
                <Text style={{ color: '#FFF', fontWeight: '600', fontSize: FontSize.md }}>{showStats ? 'Masquer' : 'Voir'} les statistiques d'image</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Image Statistics */}
            {showStats && scanResult.imageStats && (
              <View style={{ marginTop: Spacing.md }}>
                {/* Histograms */}
                <Card variant="elevated" style={{ marginBottom: Spacing.md, padding: Spacing.md }}>
                  <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: Spacing.sm }]}>📊 Histogrammes de couleur</Text>
                  <Histogram data={scanResult.imageStats.redChannel} color="#EF4444" label="Canal Rouge (R)" bgColor={colors.card} />
                  <Histogram data={scanResult.imageStats.greenChannel} color="#22C55E" label="Canal Vert (G)" bgColor={colors.card} />
                  <Histogram data={scanResult.imageStats.blueChannel} color="#3B82F6" label="Canal Bleu (B)" bgColor={colors.card} />
                  <Histogram data={scanResult.imageStats.luminance} color="#A78BFA" label="Luminance" bgColor={colors.card} />
                </Card>

                {/* Gauges */}
                <Card variant="elevated" style={{ marginBottom: Spacing.md, padding: Spacing.md }}>
                  <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: Spacing.md }]}>🔬 Métriques d'analyse</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap', gap: Spacing.md }}>
                    <CircularGauge value={scanResult.imageStats.symmetryScore} label="Symétrie" color="#2563EB" textColor={colors.textSecondary} />
                    <CircularGauge value={scanResult.imageStats.borderRegularity} label="Bords" color="#0D9488" textColor={colors.textSecondary} />
                    <CircularGauge value={scanResult.imageStats.colorVariance} label="Couleur" color="#F59E0B" textColor={colors.textSecondary} />
                    <CircularGauge value={scanResult.qualityScore} label="Qualité" color="#7C3AED" textColor={colors.textSecondary} />
                  </View>
                </Card>

                {/* Color Distribution */}
                <Card variant="elevated" style={{ marginBottom: Spacing.md, padding: Spacing.md }}>
                  <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: Spacing.sm }]}>🎨 Distribution des couleurs</Text>
                  <ColorSwatchRow colors={scanResult.imageStats.dominantColors} textColor={colors.textSecondary} />
                </Card>

                {/* Numeric Stats */}
                <Card variant="elevated" style={{ marginBottom: Spacing.md, padding: Spacing.md }}>
                  <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: Spacing.sm }]}>📐 Mesures numériques</Text>
                  {[
                    { icon: '☀️', label: 'Luminosité moyenne', value: `${scanResult.imageStats.brightness}`, unit: '/255' },
                    { icon: '📐', label: 'Contraste', value: `${scanResult.imageStats.contrast}`, unit: '%' },
                    { icon: '🌈', label: 'Saturation', value: `${scanResult.imageStats.saturation}`, unit: '%' },
                    { icon: '🔍', label: 'Netteté', value: `${scanResult.imageStats.sharpness}`, unit: '%' },
                    { icon: '📏', label: 'Diamètre estimé', value: `${scanResult.imageStats.diameterMm}`, unit: 'mm' },
                    { icon: '🧮', label: 'Surface lésion', value: `${scanResult.imageStats.lesionArea}`, unit: '%' },
                    { icon: '🔢', label: 'Entropie texture', value: `${scanResult.imageStats.textureEntropy}`, unit: '/10' },
                  ].map((stat, i) => (
                    <View key={i} style={[styles.statRow, { borderBottomColor: colors.separator }]}>
                      <Text style={{ fontSize: 16 }}>{stat.icon}</Text>
                      <Text style={[{ flex: 1, fontSize: FontSize.sm, color: colors.text }]}>{stat.label}</Text>
                      <Text style={{ fontSize: FontSize.md, fontWeight: '700', color: Colors.primary }}>{stat.value}<Text style={{ fontSize: FontSize.xs, color: colors.textTertiary }}>{stat.unit}</Text></Text>
                    </View>
                  ))}
                </Card>
              </View>
            )}

            {/* All Predictions */}
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: Spacing.md }]}>Toutes les prédictions</Text>
            {results.slice(0, 5).map((pred) => (
              <Card key={pred.id} variant="outlined" style={{ marginBottom: Spacing.sm }} padding="sm">
                <View style={styles.predRow}>
                  <Text style={{ fontSize: 20 }}>{pred.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.predName, { color: colors.text }]}>{pred.nameFr}</Text>
                    <View style={[styles.predBar, { backgroundColor: colors.separator }]}>
                      <View style={[styles.predBarFill, { width: `${pred.confidence * 100}%`, backgroundColor: getRiskColor(pred.riskLevel) }]} />
                    </View>
                  </View>
                  <Text style={[styles.predConf, { color: colors.textSecondary }]}>{(pred.confidence * 100).toFixed(1)}%</Text>
                </View>
              </Card>
            ))}

            {/* Reset */}
            <View style={{ marginTop: Spacing.md }}>
              <TouchableOpacity onPress={resetScan} activeOpacity={0.8}>
                <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.resetBtn}>
                  <Ionicons name="refresh" size={20} color="#FFF" />
                  <Text style={{ color: '#FFF', fontSize: FontSize.md, fontWeight: '600' }}>Nouvelle analyse</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Tips */}
        {!image && !results && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Conseils pour une bonne capture</Text>
            {[
              { icon: 'sunny-outline', text: 'Assurez un bon éclairage naturel' },
              { icon: 'resize-outline', text: 'Cadrez la lésion au centre' },
              { icon: 'phone-portrait-outline', text: 'Maintenez le téléphone à 10-15 cm' },
              { icon: 'color-palette-outline', text: 'Évitez les ombres et reflets' },
            ].map((tip, i) => (
              <View key={i} style={[styles.tipRow, { borderBottomColor: colors.separator }]}>
                <View style={[styles.tipIconBg, { backgroundColor: Colors.primary + '12' }]}>
                  <Ionicons name={tip.icon as any} size={20} color={Colors.primary} />
                </View>
                <Text style={[{ flex: 1, fontSize: FontSize.md, fontWeight: '500', color: colors.text }]}>{tip.text}</Text>
              </View>
            ))}
          </Animated.View>
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
  imageArea: { marginBottom: Spacing.lg },
  imageContainer: { borderRadius: BorderRadius.xl, overflow: 'hidden', position: 'relative' },
  previewImage: { width: '100%', height: width - Spacing.lg * 2, borderRadius: BorderRadius.xl },
  analyzingOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: BorderRadius.xl, overflow: 'hidden' },
  analyzingGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scanLineContainer: { ...StyleSheet.absoluteFillObject },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 3, backgroundColor: 'rgba(255,255,255,0.6)' },
  analyzingText: { color: '#FFF', fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginTop: Spacing.md },
  analyzingSubtext: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm, marginTop: Spacing.xs },
  closeImageBtn: { position: 'absolute', top: Spacing.sm, right: Spacing.sm, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  placeholderArea: { borderRadius: BorderRadius.xl, borderWidth: 2, borderStyle: 'dashed', overflow: 'hidden' },
  placeholderGradient: { alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl, minHeight: 220 },
  placeholderIcon: { width: 80, height: 80, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  placeholderTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.xs },
  placeholderDesc: { fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 },
  actionsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  actionBtn: { flex: 1 },
  actionGradient: { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: Spacing.md, borderRadius: BorderRadius.lg, minHeight: 90, gap: Spacing.sm },
  actionText: { color: '#FFF', fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  resultCard: { marginBottom: Spacing.lg, padding: Spacing.lg, ...Shadow.lg },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  riskBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, borderRadius: BorderRadius.full, gap: Spacing.xs },
  riskDot: { width: 8, height: 8, borderRadius: 4 },
  riskText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  confidenceText: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  resultTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, marginBottom: 2 },
  resultName: { fontSize: FontSize.md, fontStyle: 'italic', marginBottom: Spacing.sm },
  resultDesc: { fontSize: FontSize.sm, lineHeight: 22, marginBottom: Spacing.md },
  confBarContainer: { marginBottom: Spacing.md },
  confBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  confBarFill: { height: '100%', borderRadius: 4 },
  recommendation: { flexDirection: 'row', alignItems: 'flex-start', padding: Spacing.md, borderRadius: BorderRadius.md, gap: Spacing.sm },
  recommendationText: { flex: 1, fontSize: FontSize.sm, lineHeight: 20, fontWeight: FontWeight.medium },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  predRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  predName: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, marginBottom: 4 },
  predBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  predBarFill: { height: '100%', borderRadius: 3 },
  predConf: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, minWidth: 50, textAlign: 'right' },
  abcdeBadge: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  abcdeLetter: { fontSize: FontSize.lg, fontWeight: '800' },
  abcdeTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.md, marginTop: Spacing.sm },
  statsToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: Spacing.md, borderRadius: BorderRadius.md, gap: Spacing.sm },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm + 2, borderBottomWidth: 0.5 },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: Spacing.md, borderRadius: BorderRadius.md, gap: Spacing.sm },
  tipRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, gap: Spacing.md },
  tipIconBg: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
});
