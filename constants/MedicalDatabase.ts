/**
 * DermaScan — Comprehensive Medical Knowledge Base
 * Sources: HAM10000, WHO ICD-11, AAD Guidelines, HAS Recommendations
 * All medical content verified against published dermatology references
 */

export type RiskLevel = 'malignant' | 'pre-malignant' | 'benign';
export type Urgency = 'immediate' | 'soon' | 'routine' | 'monitor';

export interface ClinicalFeature {
  name: string;
  nameFr: string;
  description: string;
}

export interface TreatmentOption {
  name: string;
  nameFr: string;
  type: 'surgical' | 'medical' | 'topical' | 'radiotherapy' | 'monitoring';
  firstLine: boolean;
}

export interface LesionType {
  id: string;
  code: string;
  name: string;
  nameFr: string;
  icd10: string;
  description: string;
  descriptionFr: string;
  riskLevel: RiskLevel;
  urgency: Urgency;
  prevalence: string;
  ageGroup: string;
  recommendation: string;
  recommendationFr: string;
  clinicalFeatures: ClinicalFeature[];
  dermoscopyFeatures: string[];
  dermoscopyFeaturesFr: string[];
  differentialDiagnosis: string[];
  treatmentOptions: TreatmentOption[];
  prognosis: string;
  prognosisFr: string;
  icon: string;
  epidemiologyWeight: number; // realistic probability weight for simulation
}

export const LESION_TYPES: LesionType[] = [
  {
    id: 'mel',
    code: 'mel',
    name: 'Melanoma',
    nameFr: 'Mélanome',
    icd10: 'C43',
    description: 'Malignant neoplasm arising from melanocytes. Most dangerous form of skin cancer with potential for metastasis. Early detection dramatically improves prognosis.',
    descriptionFr: 'Néoplasme malin provenant des mélanocytes. Forme la plus dangereuse de cancer cutané avec potentiel métastatique. La détection précoce améliore considérablement le pronostic.',
    riskLevel: 'malignant',
    urgency: 'immediate',
    prevalence: '4-5% des cancers cutanés',
    ageGroup: '40-70 ans (pic à 55 ans)',
    recommendation: 'Immediate dermatological consultation required. Excisional biopsy with appropriate margins. Sentinel lymph node biopsy if Breslow > 0.8mm.',
    recommendationFr: 'Consultation dermatologique immédiate requise. Biopsie-exérèse avec marges appropriées. Biopsie du ganglion sentinelle si Breslow > 0.8mm.',
    clinicalFeatures: [
      { name: 'Asymmetry', nameFr: 'Asymétrie', description: 'Lésion asymétrique en forme et couleur' },
      { name: 'Border irregularity', nameFr: 'Bords irréguliers', description: 'Bords encochés, mal délimités' },
      { name: 'Color variation', nameFr: 'Couleur hétérogène', description: 'Brun, noir, rouge, blanc, bleu dans la même lésion' },
      { name: 'Diameter > 6mm', nameFr: 'Diamètre > 6mm', description: 'Taille supérieure à une gomme de crayon' },
      { name: 'Evolution', nameFr: 'Évolution', description: 'Changement récent de taille, forme ou couleur' },
    ],
    dermoscopyFeatures: ['Atypical pigment network', 'Irregular streaks', 'Blue-white veil', 'Irregular dots/globules', 'Regression structures'],
    dermoscopyFeaturesFr: ['Réseau pigmentaire atypique', 'Stries irrégulières', 'Voile bleu-blanc', 'Points/globules irréguliers', 'Structures de régression'],
    differentialDiagnosis: ['Naevus dysplasique', 'Kératose séborrhéique pigmentée', 'Carcinome basocellulaire pigmenté', 'Angiome thrombosé'],
    treatmentOptions: [
      { name: 'Wide local excision', nameFr: 'Exérèse large', type: 'surgical', firstLine: true },
      { name: 'Sentinel lymph node biopsy', nameFr: 'Biopsie ganglion sentinelle', type: 'surgical', firstLine: true },
      { name: 'Immunotherapy (anti-PD-1)', nameFr: 'Immunothérapie (anti-PD-1)', type: 'medical', firstLine: false },
      { name: 'BRAF/MEK inhibitors', nameFr: 'Inhibiteurs BRAF/MEK', type: 'medical', firstLine: false },
    ],
    prognosis: '5-year survival: Stage I: 97%, Stage II: 82%, Stage III: 59%, Stage IV: 20%',
    prognosisFr: 'Survie à 5 ans : Stade I : 97%, Stade II : 82%, Stade III : 59%, Stade IV : 20%',
    icon: '🔴',
    epidemiologyWeight: 0.11,
  },
  {
    id: 'bcc',
    code: 'bcc',
    name: 'Basal Cell Carcinoma',
    nameFr: 'Carcinome Basocellulaire',
    icd10: 'C44',
    description: 'Most common skin cancer (80% of non-melanoma skin cancers). Locally invasive, rarely metastasizes. UV exposure is the primary risk factor.',
    descriptionFr: 'Cancer cutané le plus fréquent (80% des carcinomes cutanés). Localement invasif, métastases exceptionnelles. L\'exposition UV est le principal facteur de risque.',
    riskLevel: 'malignant',
    urgency: 'soon',
    prevalence: '80% des cancers cutanés non-mélanome',
    ageGroup: '> 50 ans, pic à 70 ans',
    recommendation: 'Dermatological appointment within 2 weeks. Surgical excision with histological margin control is the gold standard.',
    recommendationFr: 'Rendez-vous dermatologique dans les 2 semaines. L\'exérèse chirurgicale avec contrôle histologique des marges est le traitement de référence.',
    clinicalFeatures: [
      { name: 'Pearly papule', nameFr: 'Papule perlée', description: 'Lésion translucide avec aspect perlé caractéristique' },
      { name: 'Telangiectasia', nameFr: 'Télangiectasies', description: 'Vaisseaux arborescents visibles en surface' },
      { name: 'Rolled border', nameFr: 'Bordure surélevée', description: 'Bord perlé et surélevé' },
      { name: 'Central ulceration', nameFr: 'Ulcération centrale', description: 'Croûte ou ulcération au centre de la lésion' },
    ],
    dermoscopyFeatures: ['Arborizing vessels', 'Leaf-like structures', 'Blue-gray ovoid nests', 'Spoke-wheel areas', 'Shiny white structures'],
    dermoscopyFeaturesFr: ['Vaisseaux arborescents', 'Structures en feuille d\'érable', 'Nids ovoïdes bleu-gris', 'Zones en roue de chariot', 'Structures blanches brillantes'],
    differentialDiagnosis: ['Naevus intradermique', 'Molluscum contagiosum', 'Trichoblastome', 'Carcinome annexiel'],
    treatmentOptions: [
      { name: 'Surgical excision', nameFr: 'Exérèse chirurgicale', type: 'surgical', firstLine: true },
      { name: 'Mohs surgery', nameFr: 'Chirurgie de Mohs', type: 'surgical', firstLine: false },
      { name: 'Imiquimod 5%', nameFr: 'Imiquimod 5%', type: 'topical', firstLine: false },
      { name: 'Photodynamic therapy', nameFr: 'Photothérapie dynamique', type: 'medical', firstLine: false },
    ],
    prognosis: 'Excellent if treated early. Recurrence rate: 1-5% after excision, <1% after Mohs.',
    prognosisFr: 'Excellent si traité précocement. Taux de récidive : 1-5% après exérèse, <1% après Mohs.',
    icon: '🔴',
    epidemiologyWeight: 0.14,
  },
  {
    id: 'akiec',
    code: 'akiec',
    name: 'Actinic Keratosis / Bowen\'s Disease',
    nameFr: 'Kératose Actinique / Maladie de Bowen',
    icd10: 'L57.0 / D04',
    description: 'Pre-malignant lesion caused by chronic UV exposure. 5-10% risk of progression to invasive squamous cell carcinoma if untreated.',
    descriptionFr: 'Lésion pré-maligne causée par l\'exposition UV chronique. Risque de 5-10% de transformation en carcinome épidermoïde invasif sans traitement.',
    riskLevel: 'pre-malignant',
    urgency: 'soon',
    prevalence: '60% des sujets > 40 ans à peau claire',
    ageGroup: '> 40 ans, augmente avec l\'âge',
    recommendation: 'Dermatological evaluation within 1 month. Treatment to prevent malignant transformation. Regular monitoring of photo-exposed areas.',
    recommendationFr: 'Évaluation dermatologique dans le mois. Traitement pour prévenir la transformation maligne. Surveillance régulière des zones photoexposées.',
    clinicalFeatures: [
      { name: 'Rough scaly patch', nameFr: 'Plaque rugueuse squameuse', description: 'Surface rugueuse au toucher, squames adhérentes' },
      { name: 'Sun-exposed location', nameFr: 'Zone photoexposée', description: 'Visage, cuir chevelu, mains, avant-bras' },
      { name: 'Erythematous base', nameFr: 'Base érythémateuse', description: 'Fond rosé à rouge' },
    ],
    dermoscopyFeatures: ['Strawberry pattern', 'Red pseudo-network', 'White-yellow scales', 'Rosette sign'],
    dermoscopyFeaturesFr: ['Pattern en fraise', 'Pseudo-réseau rouge', 'Squames blanc-jaune', 'Signe de la rosette'],
    differentialDiagnosis: ['Kératose séborrhéique', 'Carcinome épidermoïde in situ', 'Psoriasis', 'Lupus discoïde'],
    treatmentOptions: [
      { name: 'Cryotherapy', nameFr: 'Cryothérapie', type: 'topical', firstLine: true },
      { name: '5-Fluorouracil cream', nameFr: 'Crème 5-Fluorouracile', type: 'topical', firstLine: true },
      { name: 'Imiquimod', nameFr: 'Imiquimod', type: 'topical', firstLine: false },
      { name: 'Photodynamic therapy', nameFr: 'Photothérapie dynamique', type: 'medical', firstLine: false },
    ],
    prognosis: 'Good with treatment. 5-10% progress to SCC without treatment. Field cancerization requires ongoing monitoring.',
    prognosisFr: 'Bon avec traitement. 5-10% évoluent en carcinome épidermoïde sans traitement. La cancérisation de champ nécessite une surveillance continue.',
    icon: '🟠',
    epidemiologyWeight: 0.13,
  },
  {
    id: 'nv',
    code: 'nv',
    name: 'Melanocytic Nevus',
    nameFr: 'Naevus Mélanocytaire',
    icd10: 'D22',
    description: 'Common benign proliferation of melanocytes. Most individuals have 10-40 nevi. Regular monitoring recommended especially for atypical nevi.',
    descriptionFr: 'Prolifération bénigne courante de mélanocytes. La plupart des individus ont 10-40 naevi. Surveillance régulière recommandée surtout pour les naevi atypiques.',
    riskLevel: 'benign',
    urgency: 'monitor',
    prevalence: '> 95% de la population adulte',
    ageGroup: 'Apparaissent dans l\'enfance, évoluent à l\'âge adulte',
    recommendation: 'Generally benign. Monitor for ABCDE changes. Annual dermatological check-up if > 50 nevi or family history of melanoma.',
    recommendationFr: 'Généralement bénin. Surveiller les changements ABCDE. Examen dermatologique annuel si > 50 naevi ou antécédents familiaux de mélanome.',
    clinicalFeatures: [
      { name: 'Symmetric shape', nameFr: 'Forme symétrique', description: 'Lésion ronde ou ovale, symétrique' },
      { name: 'Uniform color', nameFr: 'Couleur uniforme', description: 'Brun homogène' },
      { name: 'Regular borders', nameFr: 'Bords réguliers', description: 'Contours nets et réguliers' },
      { name: 'Stable over time', nameFr: 'Stable dans le temps', description: 'Pas de modification récente' },
    ],
    dermoscopyFeatures: ['Regular pigment network', 'Symmetric globules', 'Homogeneous pattern', 'Regular dots'],
    dermoscopyFeaturesFr: ['Réseau pigmentaire régulier', 'Globules symétriques', 'Pattern homogène', 'Points réguliers'],
    differentialDiagnosis: ['Mélanome débutant', 'Lentigo solaire', 'Kératose séborrhéique plate', 'Tache café-au-lait'],
    treatmentOptions: [
      { name: 'Clinical monitoring', nameFr: 'Surveillance clinique', type: 'monitoring', firstLine: true },
      { name: 'Photographic follow-up', nameFr: 'Suivi photographique', type: 'monitoring', firstLine: true },
      { name: 'Excision if atypical', nameFr: 'Exérèse si atypique', type: 'surgical', firstLine: false },
    ],
    prognosis: 'Excellent. Benign nature. Risk of transformation < 0.03% per nevus per lifetime.',
    prognosisFr: 'Excellent. Nature bénigne. Risque de transformation < 0.03% par naevus au cours de la vie.',
    icon: '🟢',
    epidemiologyWeight: 0.27,
  },
  {
    id: 'bkl',
    code: 'bkl',
    name: 'Benign Keratosis',
    nameFr: 'Kératose Bénigne',
    icd10: 'L82',
    description: 'Includes seborrheic keratoses, solar lentigines, and lichen planus-like keratoses. Very common benign growths that increase with age.',
    descriptionFr: 'Inclut les kératoses séborrhéiques, lentigos solaires et kératoses lichénoïdes. Excroissances bénignes très fréquentes qui augmentent avec l\'âge.',
    riskLevel: 'benign',
    urgency: 'routine',
    prevalence: '> 80% des adultes > 50 ans',
    ageGroup: '> 30 ans, très fréquent > 50 ans',
    recommendation: 'No treatment required unless cosmetically bothersome or diagnostically uncertain. Removal by cryotherapy or curettage if desired.',
    recommendationFr: 'Aucun traitement nécessaire sauf gêne esthétique ou doute diagnostique. Ablation par cryothérapie ou curetage si souhaité.',
    clinicalFeatures: [
      { name: 'Stuck-on appearance', nameFr: 'Aspect "posé"', description: 'Lésion qui semble collée sur la peau' },
      { name: 'Waxy surface', nameFr: 'Surface cireuse', description: 'Texture cireuse caractéristique' },
      { name: 'Horn cysts', nameFr: 'Kystes cornés', description: 'Petites inclusions kératiniques visibles' },
    ],
    dermoscopyFeatures: ['Comedo-like openings', 'Milia-like cysts', 'Fissures and ridges', 'Hairpin vessels', 'Sharp demarcation'],
    dermoscopyFeaturesFr: ['Ouvertures comédon-like', 'Kystes milia-like', 'Fissures et crêtes', 'Vaisseaux en épingle', 'Démarcation nette'],
    differentialDiagnosis: ['Mélanome', 'Carcinome basocellulaire pigmenté', 'Verrue vulgaire', 'Kératose actinique'],
    treatmentOptions: [
      { name: 'No treatment needed', nameFr: 'Pas de traitement nécessaire', type: 'monitoring', firstLine: true },
      { name: 'Cryotherapy', nameFr: 'Cryothérapie', type: 'topical', firstLine: false },
      { name: 'Curettage', nameFr: 'Curetage', type: 'surgical', firstLine: false },
    ],
    prognosis: 'Excellent. No malignant potential. May recur after removal.',
    prognosisFr: 'Excellent. Aucun potentiel malin. Peut récidiver après ablation.',
    icon: '🟢',
    epidemiologyWeight: 0.22,
  },
  {
    id: 'df',
    code: 'df',
    name: 'Dermatofibroma',
    nameFr: 'Dermatofibrome',
    icd10: 'D23',
    description: 'Common benign fibrohistiocytic tumor. Usually appears after minor trauma or insect bite. Firm, dome-shaped nodule.',
    descriptionFr: 'Tumeur fibrohistiocytaire bénigne fréquente. Apparaît souvent après un traumatisme mineur ou piqûre d\'insecte. Nodule ferme en forme de dôme.',
    riskLevel: 'benign',
    urgency: 'routine',
    prevalence: 'Fréquent, surtout chez la femme jeune',
    ageGroup: '20-40 ans',
    recommendation: 'Benign condition requiring no treatment. Excision only if symptomatic or diagnostically uncertain. "Dimple sign" is characteristic on lateral compression.',
    recommendationFr: 'Condition bénigne ne nécessitant pas de traitement. Exérèse uniquement si symptomatique ou doute diagnostique. Le "signe de la fossette" est caractéristique à la compression latérale.',
    clinicalFeatures: [
      { name: 'Firm nodule', nameFr: 'Nodule ferme', description: 'Papule ou nodule ferme, légèrement surélevé' },
      { name: 'Dimple sign', nameFr: 'Signe de la fossette', description: 'Dépression à la compression latérale (pathognomonique)' },
      { name: 'Brown coloration', nameFr: 'Coloration brune', description: 'Brun à brun-rouge, parfois hyperpigmenté' },
    ],
    dermoscopyFeatures: ['Central white scar-like patch', 'Peripheral delicate pigment network', 'Ring-like globules', 'White network'],
    dermoscopyFeaturesFr: ['Patch blanc central cicatriciel', 'Réseau pigmentaire périphérique délicat', 'Globules en anneau', 'Réseau blanc'],
    differentialDiagnosis: ['Dermatofibrosarcome de Darier-Ferrand', 'Mélanome nodulaire', 'Carcinome basocellulaire', 'Kyste épidermoïde'],
    treatmentOptions: [
      { name: 'No treatment needed', nameFr: 'Pas de traitement nécessaire', type: 'monitoring', firstLine: true },
      { name: 'Surgical excision', nameFr: 'Exérèse chirurgicale', type: 'surgical', firstLine: false },
    ],
    prognosis: 'Excellent. Benign tumor with no malignant potential. May persist indefinitely.',
    prognosisFr: 'Excellent. Tumeur bénigne sans potentiel malin. Peut persister indéfiniment.',
    icon: '🟢',
    epidemiologyWeight: 0.05,
  },
  {
    id: 'vasc',
    code: 'vasc',
    name: 'Vascular Lesion',
    nameFr: 'Lésion Vasculaire',
    icd10: 'D18',
    description: 'Includes cherry angiomas, angiokeratomas, pyogenic granulomas, and other vascular proliferations. Generally benign.',
    descriptionFr: 'Inclut les angiomes rubis, angiokeratomes, granulomes pyogéniques et autres proliférations vasculaires. Généralement bénignes.',
    riskLevel: 'benign',
    urgency: 'routine',
    prevalence: '> 50% des adultes > 30 ans (angiomes rubis)',
    ageGroup: 'Tout âge, augmente avec l\'âge',
    recommendation: 'Usually benign and asymptomatic. Medical attention if bleeding, rapid growth, or atypical appearance. Laser treatment for cosmetic concerns.',
    recommendationFr: 'Habituellement bénin et asymptomatique. Attention médicale si saignement, croissance rapide ou aspect atypique. Traitement laser pour préoccupations esthétiques.',
    clinicalFeatures: [
      { name: 'Red-purple color', nameFr: 'Couleur rouge-pourpre', description: 'Coloration rouge vif à violacée' },
      { name: 'Compressible', nameFr: 'Compressible', description: 'Se vide à la pression (vitropression positive)' },
      { name: 'Well-circumscribed', nameFr: 'Bien délimité', description: 'Bords nets et réguliers' },
    ],
    dermoscopyFeatures: ['Red-blue lacunae', 'White-blue veil', 'Red-purple homogeneous area', 'Thrombosed vessels'],
    dermoscopyFeaturesFr: ['Lacunes rouge-bleu', 'Voile blanc-bleu', 'Zone homogène rouge-pourpre', 'Vaisseaux thrombosés'],
    differentialDiagnosis: ['Mélanome amélanotique', 'Kaposi', 'Granulome pyogénique', 'Métastase cutanée'],
    treatmentOptions: [
      { name: 'No treatment needed', nameFr: 'Pas de traitement nécessaire', type: 'monitoring', firstLine: true },
      { name: 'Laser therapy', nameFr: 'Traitement laser', type: 'medical', firstLine: false },
      { name: 'Electrocautery', nameFr: 'Électrocoagulation', type: 'surgical', firstLine: false },
    ],
    prognosis: 'Excellent. Benign proliferations. No malignant potential for most types.',
    prognosisFr: 'Excellent. Proliférations bénignes. Pas de potentiel malin pour la plupart des types.',
    icon: '🟢',
    epidemiologyWeight: 0.08,
  },
];

export const getLesionByCode = (code: string): LesionType | undefined => {
  return LESION_TYPES.find(l => l.code === code);
};

export const getRiskColor = (risk: RiskLevel): string => {
  switch (risk) {
    case 'malignant': return '#DC2626';
    case 'pre-malignant': return '#F59E0B';
    case 'benign': return '#16A34A';
  }
};

export const getRiskLabel = (risk: RiskLevel): string => {
  switch (risk) {
    case 'malignant': return 'Risque Élevé';
    case 'pre-malignant': return 'Risque Modéré';
    case 'benign': return 'Risque Faible';
  }
};

export const getUrgencyLabel = (urgency: Urgency): string => {
  switch (urgency) {
    case 'immediate': return '⚠️ Consultation immédiate';
    case 'soon': return '📅 Consultation dans 2 semaines';
    case 'routine': return '📋 Consultation de routine';
    case 'monitor': return '👁️ Surveillance régulière';
  }
};

export const getUrgencyColor = (urgency: Urgency): string => {
  switch (urgency) {
    case 'immediate': return '#DC2626';
    case 'soon': return '#F59E0B';
    case 'routine': return '#2563EB';
    case 'monitor': return '#16A34A';
  }
};

/**
 * Simulate realistic AI prediction based on epidemiological weights
 * This creates medically plausible results rather than random ones
 */
export function simulateRealisticPrediction() {
  const predictions = LESION_TYPES.map((lesion) => {
    // Use epidemiological weight as base, add controlled random variation
    const baseWeight = lesion.epidemiologyWeight;
    const variation = (Math.random() - 0.5) * 0.15;
    const rawConfidence = Math.max(0.01, baseWeight + variation);
    return { ...lesion, confidence: rawConfidence };
  });

  // Sort by confidence descending
  predictions.sort((a, b) => b.confidence - a.confidence);

  // Normalize to sum to 1
  const total = predictions.reduce((s, p) => s + p.confidence, 0);
  return predictions.map((p) => ({
    ...p,
    confidence: p.confidence / total,
  }));
}

/**
 * ABCDE Score Calculator
 * Returns a clinical assessment score based on ABCDE criteria
 */
export interface ABCDEScore {
  asymmetry: number;       // 0-2
  border: number;          // 0-2
  color: number;           // 0-2
  diameter: number;        // 0-1
  evolution: number;       // 0-1
  totalScore: number;      // 0-8
  interpretation: string;
  interpretationFr: string;
  riskLevel: RiskLevel;
}

export function calculateABCDEScore(
  asymmetry: number, border: number, color: number, diameter: number, evolution: number
): ABCDEScore {
  const totalScore = asymmetry + border + color + diameter + evolution;
  let interpretation: string;
  let interpretationFr: string;
  let riskLevel: RiskLevel;

  if (totalScore <= 2) {
    interpretation = 'Low risk - Regular monitoring recommended';
    interpretationFr = 'Risque faible — Surveillance régulière recommandée';
    riskLevel = 'benign';
  } else if (totalScore <= 4) {
    interpretation = 'Moderate risk - Dermatological evaluation recommended';
    interpretationFr = 'Risque modéré — Évaluation dermatologique recommandée';
    riskLevel = 'pre-malignant';
  } else {
    interpretation = 'High risk - Urgent dermatological consultation required';
    interpretationFr = 'Risque élevé — Consultation dermatologique urgente requise';
    riskLevel = 'malignant';
  }

  return { asymmetry, border, color, diameter, evolution, totalScore, interpretation, interpretationFr, riskLevel };
}
