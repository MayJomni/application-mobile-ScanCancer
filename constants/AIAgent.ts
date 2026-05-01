/**
 * DermaScan — Intelligent AI Agent Engine
 * Clinical decision support for dermatologists
 */

import { LESION_TYPES, LesionType, getRiskLabel, getUrgencyLabel } from './MedicalDatabase';

// ─── Types ───
export interface ConversationMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'case_analysis' | 'clinical_tool' | 'alert';
  metadata?: Record<string, any>;
}

export interface PatientCase {
  age?: number;
  sex?: string;
  skinType?: number;
  location?: string;
  duration?: string;
  symptoms?: string[];
  abcde?: { a: number; b: number; c: number; d: number; e: number };
}

// ─── Knowledge Categories ───
const KNOWLEDGE: Record<string, { keywords: string[]; response: string }> = {
  melanome: {
    keywords: ['melanome', 'melanom', 'mélanome', 'melano'],
    response: `🔬 **Mélanome (C43 — ICD-10)**

Le mélanome est le cancer cutané le plus dangereux, représentant 4-5% des cancers de la peau mais responsable de 80% des décès.

**Critères ABCDE :**
• **A** — Asymétrie de la lésion
• **B** — Bords irréguliers, encochés
• **C** — Couleur hétérogène (brun, noir, rouge, blanc, bleu)
• **D** — Diamètre > 6mm
• **E** — Évolution rapide

**Dermoscopie :**
• Réseau pigmentaire atypique
• Stries irrégulières
• Voile bleu-blanc
• Points/globules irréguliers

**Facteurs de risque :**
• Exposition UV excessive
• Antécédents familiaux
• Fitzpatrick I-II
• > 50 naevi

**Pronostic (survie à 5 ans) :**
• Stade I : 97% | Stade II : 82%
• Stade III : 59% | Stade IV : 20%

⚠️ **Conduite à tenir :** Consultation dermatologique IMMÉDIATE. Biopsie-exérèse avec marges.`,
  },
  carcinome_baso: {
    keywords: ['carcinome', 'basocellulaire', 'bcc', 'cbc'],
    response: `🔬 **Carcinome Basocellulaire (C44)**

Cancer cutané le plus fréquent (80% des carcinomes cutanés). Croissance lente, métastases exceptionnelles.

**Caractéristiques cliniques :**
• Papule perlée translucide avec télangiectasies
• Ulcération centrale possible
• Bordure surélevée perlée
• Localisé sur zones photoexposées

**Sous-types :**
• Nodulaire (le plus fréquent)
• Superficiel | Sclérodermiforme | Pigmenté

**Dermoscopie :**
• Vaisseaux arborescents
• Structures en feuille d'érable
• Nids ovoïdes bleu-gris

**Traitement de référence :**
Exérèse chirurgicale avec contrôle histologique des marges
Chirurgie de Mohs pour les récidives

📅 Consultation dans les **2 semaines**.`,
  },
  abcde: {
    keywords: ['abcde', 'regle', 'règle', 'critere', 'critère', 'depistage', 'dépistage'],
    response: `📏 **Règle ABCDE — Dépistage du Mélanome**

Méthode d'auto-examen systématique des lésions pigmentées :

**A — Asymétrie**
La lésion n'est pas symétrique en forme ou couleur.

**B — Bords**
Bords irréguliers, encochés, mal délimités.

**C — Couleur**
Couleur non homogène : brun, noir, rouge, blanc, bleu.

**D — Diamètre**
Supérieur à 6 mm (taille d'une gomme de crayon).

**E — Évolution**
Changement récent de taille, forme, couleur ou symptômes.

**Interprétation du score (0-8) :**
• ≤ 2 : Risque faible → Surveillance régulière
• 3-4 : Risque modéré → Évaluation dermatologique
• ≥ 5 : Risque élevé → Consultation URGENTE

💡 Si ≥ 2 critères positifs → consultation dermatologue.`,
  },
  dermoscopie: {
    keywords: ['dermoscopie', 'dermatoscop', 'dermoscop', 'dermatoscopie'],
    response: `🔍 **Dermoscopie (Dermatoscopie)**

Examen non invasif des lésions cutanées (grossissement ×10-×20).

**Structures dermoscopiques clés :**
• Réseau pigmentaire (régulier = bénin)
• Globules/points (distribution, régularité)
• Stries radiaires (mélanome si asymétriques)
• Voile bleu-blanc (signe de malignité)
• Structures vasculaires (arborescentes = CBC)

**Algorithme en 2 étapes :**
1️⃣ Lésion mélanocytaire vs non-mélanocytaire
2️⃣ Si mélanocytaire : bénin vs malin

**Scores disponibles :**
• Score de Menzies
• Checklist en 7 points
• Analyse de pattern

📌 La dermoscopie augmente la sensibilité diagnostique de 30%.`,
  },
  fitzpatrick: {
    keywords: ['fitzpatrick', 'phototype', 'type de peau', 'peau claire', 'peau fonce'],
    response: `👤 **Classification de Fitzpatrick (I à VI)**

**Type I** — Peau très claire → Brûle toujours ⚠️ Risque UV très élevé
**Type II** — Peau claire → Brûle facilement ⚠️ Risque élevé
**Type III** — Intermédiaire → Bronze progressivement
**Type IV** — Peau mate → Brûle peu
**Type V** — Peau foncée → Brûle rarement
**Type VI** — Peau très foncée → Ne brûle jamais

📌 Phototypes I-II : risque accru de mélanome → surveillance renforcée.`,
  },
  prevention: {
    keywords: ['prevention', 'prévention', 'proteg', 'solaire', 'soleil', 'uv', 'ecran'],
    response: `☀️ **Prévention du Cancer Cutané**

**Protection solaire :**
• SPF 50+ (UVA + UVB) — réappliquer toutes les 2h
• Éviter l'exposition 11h-16h
• Vêtements protecteurs, chapeau, lunettes

**Auto-surveillance mensuelle :**
• Méthode ABCDE sur toutes les lésions
• Photographier pour suivi
• Attention au « vilain petit canard »

**Suivi médical :**
• Dermatologue annuel si peau claire
• Cartographie des naevi si > 50
• Dermoscopie digitale pour suivi objectif

⚠️ Cabines UV = facteur de risque majeur.`,
  },
  traitement: {
    keywords: ['traitement', 'soigner', 'therapie', 'thérapie', 'chirurgie', 'immunotherapie'],
    response: `💊 **Traitements du Cancer de la Peau**

**Chirurgie :**
• Exérèse large avec marges de sécurité
• Chirurgie de Mohs (CBC récidivant)
• Curage ganglionnaire si nécessaire

**Immunothérapie (mélanome avancé) :**
• Anti-PD-1 : Pembrolizumab, Nivolumab
• Anti-CTLA-4 : Ipilimumab

**Thérapie ciblée :**
• Inhibiteurs BRAF (Vémurafénib)
• Inhibiteurs MEK (Cobimétinib)

**Autres :**
• Radiothérapie | Cryothérapie
• Photothérapie dynamique
• Imiquimod topique (CBC superficiel)

⚠️ Choix selon stade et type histologique.`,
  },
  keratose: {
    keywords: ['keratose', 'kératose', 'actinique', 'bowen'],
    response: `🟠 **Kératose Actinique / Maladie de Bowen (L57.0 / D04)**

Lésion **pré-maligne** (5-10% risque de transformation en carcinome épidermoïde).

**Clinique :** Plaque rugueuse, squameuse sur zones photoexposées
**Dermoscopie :** Pattern en fraise, pseudo-réseau rouge

**Traitement :**
• Cryothérapie (1ère ligne)
• 5-Fluorouracile topique
• Imiquimod | PDT

📅 Surveillance dermatologique régulière obligatoire.`,
  },
  naevus: {
    keywords: ['naevus', 'naevi', 'grain de beaute', 'grain de beauté', 'nevus'],
    response: `🟢 **Naevus Mélanocytaire (D22)**

Grain de beauté bénin. > 95% de la population adulte en possède.

**Caractéristiques bénignes :**
• Symétrique, bords réguliers
• Couleur homogène (brun uniforme)
• Stable dans le temps

**Quand s'inquiéter ?**
• Modification ABCDE récente
• Saignement spontané
• Aspect « vilain petit canard »

Risque de transformation : < 0.03% par naevus.
📌 Suivi photo recommandé si > 50 naevi.`,
  },
  vasculaire: {
    keywords: ['vasculaire', 'angiome', 'hemangiome', 'vaisseaux'],
    response: `🟢 **Lésions Vasculaires (D18)**

Inclut angiomes rubis, angiokeratomes, granulomes pyogéniques.

**Clinique :** Couleur rouge-pourpre, compressible
**Dermoscopie :** Lacunes rouge-bleu, zone homogène

**Diagnostic différentiel important :**
• Mélanome amélanotique ⚠️
• Kaposi

Traitement laser si gêne esthétique. Généralement bénin.`,
  },
  dermatofibrome: {
    keywords: ['dermatofibrome', 'fibrome', 'nodule ferme'],
    response: `🟢 **Dermatofibrome (D23)**

Tumeur fibrohistiocytaire bénigne, fréquente chez la femme jeune.

**Signe pathognomonique :** Signe de la fossette (dimple sign) à la compression latérale.

**Dermoscopie :** Patch blanc central + réseau pigmentaire périphérique.

Aucun traitement nécessaire sauf gêne. Exérèse si doute diagnostique.`,
  },
};

// ─── Contextual Analysis ───
const CLINICAL_SCENARIOS: { keywords: string[]; handler: (msg: string) => string }[] = [
  {
    keywords: ['patient', 'cas', 'presente', 'présente', 'consulte', 'ans'],
    handler: (msg: string) => {
      const ageMatch = msg.match(/(\d{1,3})\s*(ans|an)/);
      const age = ageMatch ? parseInt(ageMatch[1]) : null;
      
      const isMale = /homme|masculin|garcon|garçon|monsieur|mr/i.test(msg);
      const isFemale = /femme|féminin|fille|madame|mme/i.test(msg);
      const sex = isMale ? 'homme' : isFemale ? 'femme' : null;

      const hasMelanoma = /melanome|mélanome|noir|asymetr|asymétr/i.test(msg);
      const hasBCC = /perle|basocellulaire|carcinome|ulcer/i.test(msg);
      const hasAK = /rugueu|squam|actinique|keratose|kératose/i.test(msg);

      let analysis = `🏥 **Analyse du Cas Clinique**\n\n`;
      if (age) analysis += `**Patient :** ${sex || 'Patient'} de ${age} ans\n`;
      
      if (hasMelanoma) {
        analysis += `\n⚠️ **Suspicion : Mélanome**\n`;
        analysis += `• Vérifier les critères ABCDE\n`;
        analysis += `• Dermoscopie urgente recommandée\n`;
        analysis += `• Biopsie-exérèse si score ABCDE ≥ 3\n`;
        if (age && age > 50) analysis += `• Risque accru pour l'âge > 50 ans\n`;
        analysis += `\n**Conduite immédiate :** Consultation spécialisée URGENTE`;
      } else if (hasBCC) {
        analysis += `\n📋 **Suspicion : Carcinome Basocellulaire**\n`;
        analysis += `• Rechercher : papule perlée, télangiectasies\n`;
        analysis += `• Dermoscopie : vaisseaux arborescents ?\n`;
        analysis += `• Biopsie pour confirmation histologique\n`;
        analysis += `\n**Conduite :** RDV dermatologie dans 2 semaines`;
      } else if (hasAK) {
        analysis += `\n📋 **Suspicion : Kératose Actinique**\n`;
        analysis += `• Zone photoexposée ?\n`;
        analysis += `• Rechercher : cancérisation de champ\n`;
        analysis += `• Options : cryothérapie, 5-FU, PDT\n`;
        analysis += `\n**Conduite :** Évaluation dermatologique dans le mois`;
      } else {
        analysis += `\n📋 **Évaluation initiale recommandée :**\n`;
        analysis += `• Examen clinique complet\n`;
        analysis += `• Dermoscopie des lésions suspectes\n`;
        analysis += `• Appliquer les critères ABCDE\n`;
        analysis += `• Documenter par photographie\n`;
        analysis += `\n💡 Précisez les caractéristiques de la lésion pour une analyse plus détaillée.`;
      }
      return analysis;
    },
  },
  {
    keywords: ['diagnostic', 'differentiel', 'différentiel', 'dd', 'ddx'],
    handler: (msg: string) => {
      let response = `🔎 **Diagnostic Différentiel**\n\n`;
      
      if (/noir|pigment|brun|sombr/i.test(msg)) {
        response += `**Lésion pigmentée — DDx :**\n`;
        response += `1. Mélanome ⚠️\n2. Naevus atypique\n3. Kératose séborrhéique pigmentée\n4. CBC pigmenté\n5. Angiome thrombosé\n\n`;
        response += `➡️ Dermoscopie indispensable pour orienter le diagnostic.`;
      } else if (/rouge|erytheme|érythème|vasculair/i.test(msg)) {
        response += `**Lésion rouge/vasculaire — DDx :**\n`;
        response += `1. Angiome\n2. Granulome pyogénique\n3. Mélanome amélanotique ⚠️\n4. Kaposi\n5. Métastase cutanée\n\n`;
        response += `➡️ Vitropression + dermoscopie pour différencier.`;
      } else {
        response += `Précisez l'aspect de la lésion :\n`;
        response += `• Pigmentée (noire, brune) ?\n• Rouge/vasculaire ?\n• Squameuse/rugueuse ?\n• Nodulaire/ferme ?\n\n`;
        response += `Je vous fournirai un DDx adapté.`;
      }
      return response;
    },
  },
  {
    keywords: ['stade', 'staging', 'breslow', 'clark', 'tnm'],
    handler: () => {
      return `📊 **Classification et Staging du Mélanome**

**Indice de Breslow (épaisseur) :**
• < 1mm : Stade I → Survie 97%
• 1-2mm : Stade I/II → Survie 82-92%
• 2-4mm : Stade II → Survie 70-82%
• > 4mm : Stade II/III → Survie < 70%

**Marges d'exérèse recommandées :**
• In situ : 5mm | ≤ 1mm : 1cm
• 1-2mm : 1-2cm | > 2mm : 2cm

**Ganglion sentinelle :**
Indiqué si Breslow > 0.8mm ou ulcération.

📌 Le Breslow est le facteur pronostique n°1.`;
    },
  },
];

// ─── Main AI Engine ───
export function processMessage(userMessage: string, history: ConversationMessage[] = []): string {
  const normalized = userMessage
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Greetings
  if (/^(bonjour|salut|hello|hi|hey|bonsoir|coucou)/i.test(normalized)) {
    return `👋 Bonjour Docteur ! Je suis **DermaBot**, votre assistant IA en dermatologie.

Je peux vous aider avec :
• 🔬 Diagnostic et classification des lésions
• 📏 Score ABCDE et évaluation des risques
• 🔍 Dermoscopie et interprétation
• 🏥 Analyse de cas cliniques
• 💊 Protocoles de traitement
• 📊 Staging et pronostic

Posez votre question ou décrivez un cas clinique !`;
  }

  // Thanks
  if (/merci|thanks/i.test(normalized)) {
    return `😊 Je vous en prie, Docteur ! N'hésitez pas pour toute autre question.

⚠️ **Rappel :** DermaBot est un outil d'aide à la décision clinique. Les recommandations ne remplacent pas le jugement médical professionnel.`;
  }

  // Check clinical scenarios first (contextual analysis)
  for (const scenario of CLINICAL_SCENARIOS) {
    if (scenario.keywords.some(kw => normalized.includes(kw))) {
      return scenario.handler(userMessage);
    }
  }

  // Check knowledge base
  for (const [, entry] of Object.entries(KNOWLEDGE)) {
    if (entry.keywords.some(kw => normalized.includes(kw))) {
      return entry.response;
    }
  }

  // Lesion lookup from MedicalDatabase
  for (const lesion of LESION_TYPES) {
    const names = [lesion.name.toLowerCase(), lesion.nameFr.toLowerCase(), lesion.code];
    if (names.some(n => normalized.includes(n))) {
      return formatLesionInfo(lesion);
    }
  }

  // Capabilities / help
  if (/aide|help|quoi|comment|capable|peux|fonctionn/i.test(normalized)) {
    return `🤖 **Mes capacités DermaBot :**

**Connaissances médicales :**
• Tapez le nom d'une lésion (mélanome, carcinome, naevus...)
• "ABCDE" → Règle de dépistage
• "dermoscopie" → Guide d'interprétation
• "Fitzpatrick" → Classification des phototypes
• "traitement" → Options thérapeutiques
• "staging" / "Breslow" → Classification TNM

**Analyse clinique :**
• Décrivez un cas : "Patient de 65 ans avec lésion noire asymétrique..."
• "diagnostic différentiel" + type de lésion
• "prévention" → Conseils de protection

💡 Plus votre question est détaillée, plus ma réponse sera précise !`;
  }

  // Fallback
  return `🤖 Je n'ai pas trouvé de correspondance exacte. Essayez :

• **Lésions :** mélanome, carcinome, naevus, kératose, dermatofibrome
• **Outils :** ABCDE, dermoscopie, Fitzpatrick, staging
• **Clinique :** décrivez un cas patient
• **Autre :** prévention, traitement, diagnostic différentiel

💡 Décrivez un cas clinique pour une analyse contextuelle !`;
}

function formatLesionInfo(lesion: LesionType): string {
  const risk = getRiskLabel(lesion.riskLevel);
  const urgency = getUrgencyLabel(lesion.urgency);
  
  let info = `${lesion.icon} **${lesion.nameFr}** (${lesion.icd10})\n\n`;
  info += `${lesion.descriptionFr}\n\n`;
  info += `**Niveau de risque :** ${risk}\n`;
  info += `**Urgence :** ${urgency}\n`;
  info += `**Prévalence :** ${lesion.prevalence}\n`;
  info += `**Tranche d'âge :** ${lesion.ageGroup}\n\n`;
  
  if (lesion.clinicalFeatures.length > 0) {
    info += `**Caractéristiques cliniques :**\n`;
    lesion.clinicalFeatures.forEach(f => {
      info += `• ${f.nameFr} — ${f.description}\n`;
    });
    info += '\n';
  }

  if (lesion.dermoscopyFeaturesFr.length > 0) {
    info += `**Dermoscopie :**\n`;
    lesion.dermoscopyFeaturesFr.forEach(f => {
      info += `• ${f}\n`;
    });
    info += '\n';
  }

  info += `**Recommandation :** ${lesion.recommendationFr}\n`;
  info += `**Pronostic :** ${lesion.prognosisFr}`;
  
  return info;
}

// ─── Quick Suggestions ───
export const QUICK_SUGGESTIONS = [
  { icon: '📏', label: 'Règle ABCDE' },
  { icon: '🔬', label: 'Mélanome' },
  { icon: '🔍', label: 'Dermoscopie' },
  { icon: '📊', label: 'Staging Breslow' },
  { icon: '💊', label: 'Traitement' },
  { icon: '☀️', label: 'Prévention' },
  { icon: '🏥', label: 'Cas clinique' },
  { icon: '🔎', label: 'Diagnostic différentiel' },
];

export const WELCOME_MESSAGE = `👋 Bonjour Docteur ! Je suis **DermaBot**, votre assistant IA spécialisé en dermatologie oncologique.

**Mes capacités :**
🔬 Classification des lésions cutanées (HAM10000)
📏 Évaluation ABCDE et scoring clinique
🔍 Interprétation dermoscopique
🏥 Analyse de cas cliniques
💊 Protocoles thérapeutiques à jour
📊 Staging TNM et pronostic

⚠️ *Outil d'aide à la décision — ne remplace pas le jugement médical.*

Comment puis-je vous aider ?`;
