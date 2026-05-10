/**
 * DermaScan — Scan API Service
 * Connects React Native app to the Flask backend for real model predictions.
 */

import * as FileSystem from 'expo-file-system';

// ⚠️ CHANGEZ cette URL par celle de votre ngrok/Colab
// Exemple: 'https://xxxx-xx-xx-xx-xx.ngrok-free.app'
const DEFAULT_API_URL = 'http://192.168.1.100:5000';

let API_BASE_URL = DEFAULT_API_URL;

export function setApiUrl(url: string) {
  API_BASE_URL = url.replace(/\/+$/, '');
  console.log(`[ScanAPI] URL set to: ${API_BASE_URL}`);
}

export function getApiUrl(): string {
  return API_BASE_URL;
}

export interface APIPrediction {
  id: string;
  code: string;
  name: string;
  nameFr: string;
  confidence: number;
  riskLevel: 'benign' | 'pre-malignant' | 'malignant';
  icon: string;
  descriptionFr?: string;
  recommendationFr?: string;
}

export interface APIPredictionResult {
  predictions: APIPrediction[];
  topPrediction: APIPrediction;
  lowConfidence: boolean;
  modelUsed: 'ensemble' | 'single' | 'demo';
}

export interface APIHealthStatus {
  status: string;
  mode: string;
  model1: boolean;
  model2: boolean;
}

/**
 * Check if the backend API is available
 */
export async function checkHealth(): Promise<APIHealthStatus | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.log('[ScanAPI] Health check failed:', error);
    return null;
  }
}

/**
 * Convert a local image URI to base64
 */
async function imageToBase64(imageUri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('[ScanAPI] Failed to read image:', error);
    throw new Error('Impossible de lire l\'image. Veuillez réessayer.');
  }
}

/**
 * Send image to the backend for real model prediction
 */
export async function predictFromAPI(imageUri: string): Promise<APIPredictionResult> {
  const base64Image = await imageToBase64(imageUri);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erreur serveur (${response.status})`);
    }

    const result: APIPredictionResult = await response.json();

    // Add missing fields if backend doesn't include them
    result.predictions = result.predictions.map(p => ({
      ...p,
      descriptionFr: p.descriptionFr || getDefaultDescription(p.code),
      recommendationFr: p.recommendationFr || getDefaultRecommendation(p.code),
    }));

    if (result.topPrediction) {
      result.topPrediction.descriptionFr = result.topPrediction.descriptionFr || getDefaultDescription(result.topPrediction.code);
      result.topPrediction.recommendationFr = result.topPrediction.recommendationFr || getDefaultRecommendation(result.topPrediction.code);
    }

    return result;
  } catch (error: any) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new Error('Délai dépassé. Le serveur met trop de temps à répondre.');
    }
    throw error;
  }
}

// ─── Fallback descriptions ───

function getDefaultDescription(code: string): string {
  const map: Record<string, string> = {
    akiec: 'Lésion squameuse sur peau photoexposée, précurseur du carcinome épidermoïde.',
    bcc: 'Tumeur cutanée la plus fréquente, croissance lente, aspect perlé caractéristique.',
    bkl: 'Lésion pigmentée bénigne, fréquente après 40 ans, aspect verruqueux.',
    df: 'Nodule dermique bénin, ferme à la palpation, signe du capiton positif.',
    mel: 'Tumeur maligne des mélanocytes. Critères ABCDE applicables.',
    nv: 'Prolifération bénigne de mélanocytes. Lésion pigmentée homogène.',
    vasc: 'Prolifération vasculaire bénigne (angiome, angiokeratome).',
  };
  return map[code] || 'Description non disponible.';
}

function getDefaultRecommendation(code: string): string {
  const map: Record<string, string> = {
    akiec: 'Consultation dermatologique recommandée sous 2 semaines pour biopsie ou traitement.',
    bcc: 'Référer à un dermatologue pour exérèse chirurgicale.',
    bkl: 'Lésion bénigne. Surveillance annuelle recommandée.',
    df: 'Aucun traitement nécessaire sauf gêne esthétique.',
    mel: '⚠️ URGENT: Référer immédiatement pour exérèse et histopathologie.',
    nv: 'Surveillance dermoscopique annuelle. Exérèse si modification.',
    vasc: 'Surveillance simple. Traitement laser si nécessaire.',
  };
  return map[code] || 'Consultez un spécialiste.';
}
