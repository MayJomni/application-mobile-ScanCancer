import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  date: Date;
  url: string;
  category: string;
  saved: boolean;
}

export interface DailyTip {
  id: string;
  title: string;
  content: string;
  category: string;
  icon: string;
}

interface ArticlesContextType {
  articles: Article[];
  dailyTip: DailyTip | null;
  savedArticles: Article[];
  toggleSaveArticle: (id: string) => void;
  getArticlesByCategory: (category: string) => Article[];
}

const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Prise en charge du mélanome cutané en 2026',
    summary: 'Les associations anti-PD-1 + anti-LAG3 montrent une survie sans progression supérieure à 30 mois dans le mélanome avancé.',
    content: `Le mélanome cutané reste le cancer de la peau le plus mortel malgré les progrès thérapeutiques considérables. En 2026, les nouvelles associations d'immunothérapie (anti-PD-1 combiné aux anti-LAG3 comme le relatlimab) montrent des résultats prometteurs avec une survie sans progression médiane dépassant 30 mois dans les essais RELATIVITY-047.

Les points clés de la prise en charge actuelle :
• Stade I-II : exérèse chirurgicale avec marges adaptées au Breslow (0.5cm si in situ, 1cm si ≤2mm, 2cm si >2mm)
• Stade III : immunothérapie adjuvante par pembrolizumab (Keytruda®) pendant 12 mois
• Stade IV : association nivolumab + relatlimab en première ligne, ou nivolumab + ipilimumab en alternative
• Mutations BRAF V600 : thérapie ciblée encorafénib + binimétinib comme option

La biopsie du ganglion sentinelle reste recommandée pour les mélanomes de Breslow > 0.8mm ou en cas d'ulcération. L'imagerie TEP-scanner est systématique à partir du stade IIC.

Nouveauté 2026 : les vaccins ARNm personnalisés (mRNA-4157/V940) en association avec le pembrolizumab réduisent le risque de récidive de 44% dans le mélanome réséqué à haut risque (essai KEYNOTE-942).`,
    source: 'Annales de Dermatologie et Vénéréologie',
    date: new Date('2026-05-01'),
    url: 'https://www.sciencedirect.com/journal/annales-de-dermatologie-et-de-venereologie',
    category: 'Mélanome',
    saved: false,
  },
  {
    id: '2',
    title: 'Intelligence artificielle et dermoscopie : état de l\'art',
    summary: 'Les réseaux de neurones convolutifs atteignent une sensibilité de 95.5% pour la détection du mélanome, surpassant la dermoscopie conventionnelle.',
    content: `L'intégration de l'intelligence artificielle en dermatologie connaît une croissance exponentielle. Les algorithmes de deep learning, basés sur des architectures CNN (EfficientNet, ResNet, Vision Transformer), atteignent désormais des performances diagnostiques remarquables.

Performances actuelles des modèles IA :
• Sensibilité mélanome : 95.5% (vs 86.6% pour les dermatologues experts)
• Spécificité globale : 91.3%
• AUC ROC moyenne sur les 7 classes HAM10000 : 0.974

Recommandations pour l'intégration en pratique clinique :
1. L'IA doit être utilisée comme outil d'aide à la décision, jamais en remplacement du jugement clinique
2. Les images doivent respecter les standards de qualité : éclairage homogène, distance 10-15cm, absence de poils occlusifs
3. Les scores ABCDE automatisés complètent l'évaluation dermoscopique classique
4. Un score de confiance IA < 70% doit systématiquement entraîner une revue par le dermatologue

Limites actuelles : les lésions amélanotiques, les mélanomes nodulaires et les lésions sur peau foncée (phototypes V-VI) restent des points faibles des modèles actuels. Les datasets d'entraînement manquent encore de diversité ethnique.`,
    source: 'Société Française de Dermatologie',
    date: new Date('2026-04-28'),
    url: 'https://www.sfdermato.org',
    category: 'Diagnostic',
    saved: true,
  },
  {
    id: '3',
    title: 'Photoprotection et carcinomes cutanés : recommandations 2026',
    summary: 'L\'incidence des carcinomes basocellulaires a augmenté de 38% en 10 ans chez les phototypes I-II en Europe du Sud.',
    content: `L'étude EUROCARE-Skin publiée en mars 2026 confirme une augmentation de 38% de l'incidence des carcinomes basocellulaires (CBC) chez les phototypes I et II en Europe du Sud sur la dernière décennie. Cette hausse est corrélée à l'exposition UV cumulative et à l'utilisation insuffisante de photoprotection.

Recommandations actualisées de l'EADV 2026 :
• SPF 50+ à spectre large (UVA+UVB) pour phototypes I-III, application 20 min avant exposition
• Réapplication toutes les 2 heures et après chaque baignade
• Port de vêtements protecteurs UPF 50+ pour les activités de plein air prolongées
• Éviction solaire stricte entre 11h et 16h pendant la période estivale

Pour les patients à haut risque (immunodéprimés, antécédents de CBC multiples, syndrome de Gorlin) :
• Nicotinamide (vitamine B3) 500mg x2/jour réduit le risque de nouveaux carcinomes de 23%
• Surveillance dermatologique tous les 3-6 mois avec cartographie photographique
• Photothérapie dynamique préventive des zones de cancérisation de champ (cuir chevelu, avant-bras)

Impact du changement climatique : la diminution de la couche d'ozone et l'augmentation des indices UV moyens renforcent l'importance de la prévention primaire dès l'enfance.`,
    source: 'European Academy of Dermatology and Venereology',
    date: new Date('2026-04-15'),
    url: 'https://www.eadv.org',
    category: 'Prévention',
    saved: false,
  },
  {
    id: '4',
    title: 'Kératoses actiniques : nouvelles approches thérapeutiques',
    summary: 'Le tirbanibuline 1% topique montre un taux de clairance complète de 49% à 57 jours, supérieur au 5-fluorouracile.',
    content: `Les kératoses actiniques (KA) constituent les lésions pré-cancéreuses cutanées les plus fréquentes, avec un risque de transformation en carcinome épidermoïde estimé entre 5 et 10% par lésion sur 10 ans.

Algorithme thérapeutique actualisé 2026 :
• KA isolées (< 5 lésions) : cryothérapie à l'azote liquide (15-20 secondes, 1-2 cycles)
• Cancérisation de champ : traitement de zone recommandé
  - Tirbanibuline 1% (Klisyri®) : application 5 jours, clairance 49% à J57
  - 5-fluorouracile 5% : application 4 semaines, clairance 43%
  - Imiquimod 5% : 3x/semaine pendant 4 semaines, clairance 36%
  - PDT à la lumière du jour : 1-2 séances, clairance 70-80% (résultat cosmétique supérieur)

Suivi recommandé :
• Contrôle à 3 mois post-traitement pour évaluer la réponse
• Surveillance annuelle des zones photoexposées
• Dermoscopie systématique des lésions résistantes au traitement

La résistance au traitement ou l'apparition d'une induration, d'un saignement ou d'une croissance rapide doit faire suspecter une transformation en carcinome épidermoïde invasif et justifie une biopsie.`,
    source: 'British Journal of Dermatology',
    date: new Date('2026-04-02'),
    url: 'https://academic.oup.com/bjd',
    category: 'Traitement',
    saved: false,
  },
  {
    id: '5',
    title: 'Dermoscopie des lésions vasculaires : atlas pratique',
    summary: 'Les structures vasculaires en dermoscopie permettent de distinguer 85% des lésions bénignes des malignes sans biopsie.',
    content: `L'analyse des structures vasculaires en dermoscopie constitue un outil diagnostic majeur, particulièrement pour les lésions non pigmentées où les critères classiques sont insuffisants.

Patterns vasculaires clés :
• Vaisseaux arborescents (branching vessels) → Carcinome basocellulaire (VPP 94%)
• Vaisseaux en épingle à cheveux (hairpin vessels) → Kératose séborrhéique ou CEC
• Vaisseaux glomérulaires (glomerular vessels) → Maladie de Bowen (CEC in situ)
• Vaisseaux polymorphes atypiques → MÉLANOME (VPP 72%) ⚠️
• Lacunes rouge-bleu (red-blue lacunae) → Angiome / angiokeratome (bénin)
• Vaisseaux en couronne (crown vessels) → Hyperplasie sébacée

Algorithme en 2 étapes pour lésions non pigmentées :
1. Identifier le pattern vasculaire dominant
2. Corréler avec le contexte clinique (âge, localisation, évolution)

Points de vigilance :
• Le mélanome amélanotique peut mimer un granulome pyogénique → biopsie systématique si doute
• Les métastases cutanées présentent souvent des vaisseaux polymorphes sur fond rosé
• L'utilisation de lumière polarisée améliore la visualisation vasculaire de 40%`,
    source: 'Journal of the American Academy of Dermatology',
    date: new Date('2026-03-20'),
    url: 'https://www.jaad.org',
    category: 'Diagnostic',
    saved: false,
  },
  {
    id: '6',
    title: 'Naevi atypiques : surveillance et critères d\'exérèse',
    summary: 'Le suivi digital séquentiel réduit le nombre de biopsies inutiles de 61% tout en maintenant une sensibilité de 98% pour le mélanome.',
    content: `La gestion des naevi atypiques (dysplasiques) représente un défi quotidien en dermatologie. Le suivi digital séquentiel (SDS) par dermoscopie numérique révolutionne l'approche diagnostique.

Critères de naevus atypique (classification OMS 2025) :
• Diamètre ≥ 5mm avec composante maculeuse
• Bords irréguliers ou mal définis
• Couleur variable (2 ou plus nuances de brun)
• Asymétrie de structure en dermoscopie

Indications d'exérèse immédiate :
1. Score ABCDE ≥ 5 en dermoscopie digitale
2. Modification documentée en < 3 mois au SDS
3. Signe du "vilain petit canard" (lésion différente de toutes les autres)
4. Antécédent personnel de mélanome + naevus en zone difficile à surveiller
5. Dermoscopie montrant un réseau atypique asymétrique ou des stries irrégulières

Protocole de suivi digital séquentiel :
• Cartographie initiale : photo corps entier + dermoscopie de toutes les lésions atypiques
• Contrôle à 3 mois : comparaison automatisée par IA des images
• Si stable : contrôle annuel
• Si modification subtile : contrôle rapproché à 6 semaines
• Si modification franche : exérèse et analyse histopathologique

Impact clinique : le SDS réduit de 61% les exérèses inutiles tout en maintenant une sensibilité de 98.2% pour la détection du mélanome naissant.`,
    source: 'Archives of Dermatological Research',
    date: new Date('2026-03-10'),
    url: 'https://link.springer.com/journal/403',
    category: 'Surveillance',
    saved: false,
  },
];

const mockTips: DailyTip[] = [
  {
    id: 't1',
    title: 'Phototypes clairs et risque estival',
    content: 'Les patients de phototype I et II ont un risque de mélanome 10 fois supérieur. Renforcez la surveillance avant l\'été et prescrivez un SPF 50+ systématiquement.',
    category: 'Prévention',
    icon: '☀️',
  },
  {
    id: 't2',
    title: 'Structures vasculaires atypiques',
    content: 'En dermoscopie, des vaisseaux polymorphes sur lésion non pigmentée doivent faire évoquer un mélanome amélanotique. Biopsie recommandée dans le doute.',
    category: 'Diagnostic',
    icon: '🔍',
  },
  {
    id: 't3',
    title: 'Règle du vilain petit canard',
    content: 'Une lésion qui se distingue nettement des autres naevi du patient (outlier sign) a un risque relatif de mélanome de 4.7. Examinez-la en priorité.',
    category: 'Dépistage',
    icon: '🦆',
  },
  {
    id: 't4',
    title: 'Dermoscopie : lumière polarisée',
    content: 'La lumière polarisée améliore la visualisation des structures vasculaires de 40% et des chrysalides de 60%. Utilisez-la systématiquement pour les lésions non pigmentées.',
    category: 'Technique',
    icon: '💡',
  },
  {
    id: 't5',
    title: 'Score de Breslow et marges',
    content: 'Rappel des marges d\'exérèse : in situ → 5mm, ≤1mm → 1cm, 1-2mm → 1-2cm, >2mm → 2cm. Le ganglion sentinelle est indiqué si Breslow > 0.8mm.',
    category: 'Chirurgie',
    icon: '🔪',
  },
  {
    id: 't6',
    title: 'Nicotinamide en prévention',
    content: 'La nicotinamide (vitamine B3) 500mg x2/jour réduit le risque de nouveaux carcinomes de 23% chez les patients à haut risque. Pensez-y pour vos patients immunodéprimés.',
    category: 'Prévention',
    icon: '💊',
  },
  {
    id: 't7',
    title: 'Qualité des images IA',
    content: 'Pour optimiser l\'analyse IA : éclairage homogène, distance 10-15cm, absence de reflets. Nettoyez la lésion et rasez les poils si nécessaire avant la capture.',
    category: 'Technique',
    icon: '📸',
  },
];

const ArticlesContext = createContext<ArticlesContextType | undefined>(undefined);

export function ArticlesProvider({ children }: { children: React.ReactNode }) {
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [dailyTip, setDailyTip] = useState<DailyTip | null>(null);

  useEffect(() => {
    // Pick tip based on day of year so it changes daily but stays consistent within a day
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const tipIndex = dayOfYear % mockTips.length;
    setDailyTip(mockTips[tipIndex]);
  }, []);

  const toggleSaveArticle = (id: string) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, saved: !a.saved } : a));
  };

  const getArticlesByCategory = (category: string) => {
    return articles.filter(a => a.category === category);
  };

  const savedArticles = articles.filter(a => a.saved);

  return (
    <ArticlesContext.Provider value={{ articles, dailyTip, savedArticles, toggleSaveArticle, getArticlesByCategory }}>
      {children}
    </ArticlesContext.Provider>
  );
}

export function useArticlesContext() {
  const context = useContext(ArticlesContext);
  if (!context) {
    throw new Error('useArticlesContext must be used within an ArticlesProvider');
  }
  return context;
}
