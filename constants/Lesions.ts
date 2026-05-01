/**
 * DermaScan — Lesion Types Database
 * Based on HAM10000 dataset classification
 */

export type RiskLevel = 'malignant' | 'pre-malignant' | 'benign';

export interface LesionType {
  id: string;
  code: string;
  name: string;
  nameFr: string;
  description: string;
  descriptionFr: string;
  riskLevel: RiskLevel;
  recommendation: string;
  recommendationFr: string;
  icon: string;
}

export const LESION_TYPES: LesionType[] = [
  {
    id: 'mel',
    code: 'mel',
    name: 'Melanoma',
    nameFr: 'Mélanome',
    description: 'A serious form of skin cancer that develops in melanocytes. Early detection is critical for successful treatment.',
    descriptionFr: 'Une forme grave de cancer de la peau qui se développe dans les mélanocytes. La détection précoce est essentielle.',
    riskLevel: 'malignant',
    recommendation: 'Seek immediate dermatological consultation. This type requires urgent medical attention.',
    recommendationFr: 'Consultez immédiatement un dermatologue. Ce type nécessite une attention médicale urgente.',
    icon: '🔴',
  },
  {
    id: 'bcc',
    code: 'bcc',
    name: 'Basal Cell Carcinoma',
    nameFr: 'Carcinome Basocellulaire',
    description: 'The most common type of skin cancer. It rarely spreads but can cause significant local damage if untreated.',
    descriptionFr: 'Le type le plus courant de cancer de la peau. Il se propage rarement mais peut causer des dommages locaux importants.',
    riskLevel: 'malignant',
    recommendation: 'Schedule a dermatological appointment within the next week for professional evaluation.',
    recommendationFr: 'Prenez rendez-vous chez un dermatologue dans la semaine pour une évaluation professionnelle.',
    icon: '🔴',
  },
  {
    id: 'akiec',
    code: 'akiec',
    name: 'Actinic Keratosis',
    nameFr: 'Kératose Actinique',
    description: 'A pre-cancerous skin condition caused by sun exposure. It can potentially develop into squamous cell carcinoma.',
    descriptionFr: 'Une condition pré-cancéreuse causée par l\'exposition au soleil. Elle peut évoluer en carcinome épidermoïde.',
    riskLevel: 'pre-malignant',
    recommendation: 'Consult a dermatologist for monitoring and preventive treatment.',
    recommendationFr: 'Consultez un dermatologue pour un suivi et un traitement préventif.',
    icon: '🟠',
  },
  {
    id: 'nv',
    code: 'nv',
    name: 'Melanocytic Nevus',
    nameFr: 'Naevus Mélanocytaire',
    description: 'A common benign mole. Most are harmless, but changes in size, shape, or color should be monitored.',
    descriptionFr: 'Un grain de beauté bénin courant. La plupart sont inoffensifs, mais les changements doivent être surveillés.',
    riskLevel: 'benign',
    recommendation: 'Generally harmless. Monitor for any changes in size, shape, or color over time.',
    recommendationFr: 'Généralement inoffensif. Surveillez les changements de taille, forme ou couleur.',
    icon: '🟢',
  },
  {
    id: 'bkl',
    code: 'bkl',
    name: 'Benign Keratosis',
    nameFr: 'Kératose Bénigne',
    description: 'Non-cancerous skin growths including seborrheic keratoses and solar lentigines.',
    descriptionFr: 'Excroissances cutanées non cancéreuses incluant kératoses séborrhéiques et lentigos solaires.',
    riskLevel: 'benign',
    recommendation: 'No immediate action required. Consult a dermatologist if it changes or causes discomfort.',
    recommendationFr: 'Aucune action immédiate requise. Consultez si changement ou gêne.',
    icon: '🟢',
  },
  {
    id: 'df',
    code: 'df',
    name: 'Dermatofibroma',
    nameFr: 'Dermatofibrome',
    description: 'A common, harmless skin growth that usually appears as a small, firm bump.',
    descriptionFr: 'Une excroissance cutanée courante et inoffensive, apparaissant comme une petite bosse ferme.',
    riskLevel: 'benign',
    recommendation: 'Benign condition. No treatment needed unless it causes discomfort.',
    recommendationFr: 'Condition bénigne. Aucun traitement nécessaire sauf en cas de gêne.',
    icon: '🟢',
  },
  {
    id: 'vasc',
    code: 'vasc',
    name: 'Vascular Lesion',
    nameFr: 'Lésion Vasculaire',
    description: 'Includes angiomas, angiokeratomas, and other vascular skin conditions.',
    descriptionFr: 'Inclut les angiomes, angiokeratomes et autres conditions vasculaires cutanées.',
    riskLevel: 'benign',
    recommendation: 'Usually harmless. See a dermatologist if it bleeds or changes rapidly.',
    recommendationFr: 'Habituellement inoffensif. Consultez si saignement ou changement rapide.',
    icon: '🟢',
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
