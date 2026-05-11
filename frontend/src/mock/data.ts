export interface MockUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'learner' | 'admin';
  joinedAt: string;
}

export interface MockCourse {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  duration: string;
  modules: number;
  lessons: number;
  thumbnailColor: string;
  instructor: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  category: string;
}

export interface MockLesson {
  id: string;
  moduleId: string;
  title: string;
  order: number;
  type: 'video' | 'quiz' | 'mixed';
  duration: string;
  status: 'not_started' | 'in_progress' | 'completed';
  isLocked: boolean;
  videoUrl?: string;
  thumbnailColor?: string;
}

export interface MockModule {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: MockLesson[];
  progress: number;
  isLocked: boolean;
}

export interface MockQuiz {
  id: string;
  lessonId: string;
  title: string;
  passingScore: number;
  questions: MockQuestion[];
}

export interface MockQuestion {
  id: string;
  text: string;
  type: 'mcq' | 'true_false';
  options: { id: string; label: string; isCorrect: boolean }[];
  explanation: string;
}

export interface MockProgress {
  coursesInProgress: number;
  coursesCompleted: number;
  totalMinutesWatched: number;
  certificatesObtained: number;
  currentStreak: number;
  lastActivity: string;
}

export interface MockCertificate {
  id: string;
  courseName: string;
  issuedAt: string;
  certificateNumber: string;
}

export interface MockActivity {
  id: string;
  type: 'lesson_completed' | 'quiz_passed' | 'course_started' | 'certificate_earned';
  description: string;
  timestamp: string;
  courseName: string;
}

export const mockUser: MockUser & { initials: string } = {
  id: 'user-001',
  name: 'Sandrina Perrin',
  email: 'sandrina@kleia-up.com',
  initials: 'SP',
  avatar: `data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" rx="40" fill="#7C3AED"/><text x="40" y="48" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="white">SP</text></svg>'
  )}`,
  role: 'admin',
  joinedAt: '2023-09-01T00:00:00.000Z',
};

export const mockUserLearner: MockUser & { initials: string } = {
  id: 'user-002',
  name: 'Clara Fontaine',
  email: 'clara.f@example.com',
  initials: 'CF',
  avatar: `data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" rx="40" fill="#6366F1"/><text x="40" y="48" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="white">CF</text></svg>'
  )}`,
  role: 'learner',
  joinedAt: '2024-01-15T00:00:00.000Z',
};

export const mockCourses: MockCourse[] = [
  {
    id: 'course-001',
    title: "L'Architecture du Message",
    slug: 'architecture-du-message',
    shortDescription:
      'Structurez vos prises de parole avec clarté et impact, du pitch au keynote.',
    description:
      "Dans ce module fondateur, vous apprendrez à concevoir l'architecture de vos interventions orales. De la définition de votre intention profonde jusqu'à la conclusion percutante, chaque étape de construction du message est détaillée. Vous découvrirez les modèles de structuration les plus efficaces — pyramide de Minto, storytelling en 3 actes, méthode STAR — et vous saurez les adapter à votre personnalité et à votre auditoire.",
    level: 'Débutant',
    duration: '4h30',
    modules: 4,
    lessons: 16,
    thumbnailColor: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
    instructor: 'Sandrina Perrin',
    progress: 45,
    status: 'in_progress',
    category: 'Prise de parole',
  },
  {
    id: 'course-002',
    title: "L'Incarnation & Le Jour J",
    slug: 'incarnation-et-le-jour-j',
    shortDescription:
      'Maîtrisez votre présence scénique, votre voix et votre gestion du trac.',
    description:
      "La préparation du message ne suffit pas : encore faut-il l'incarner. Ce module vous plonge au cœur de la présence scénique. Travail corporel, respiration, placement de la voix, gestion du regard et des silences — chaque outil est exploré pour faire de vous un orateur magnétique. Une large place est accordée à la gestion du trac : accueillir son stress, le transformer en énergie positive et rester aligné quoi qu'il arrive.",
    level: 'Intermédiaire',
    duration: '6h',
    modules: 5,
    lessons: 20,
    thumbnailColor: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
    instructor: 'Sandrina Perrin',
    progress: 20,
    status: 'in_progress',
    category: 'Prise de parole',
  },
  {
    id: 'course-003',
    title: 'Le Mindset du Speaker',
    slug: 'mindset-du-speaker',
    shortDescription:
      'Développez la psychologie du leadership authentique pour parler avec impact.',
    description:
      "Avant d'être une technique, la prise de parole est un état d'esprit. Ce module avancé explore les croyances limitantes qui entravent les leaders HPI et HPE, et propose un cadre puissant pour les dépasser. Vous travaillerez votre légitimité intérieure, votre rapport à l'autorité et votre capacité à incarner une vision.",
    level: 'Avancé',
    duration: '5h',
    modules: 4,
    lessons: 18,
    thumbnailColor: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
    instructor: 'Sandrina Perrin',
    progress: 0,
    status: 'not_started',
    category: 'Leadership',
  },
  {
    id: 'course-004',
    title: 'Déployer son Leadership',
    slug: 'deployer-son-leadership',
    shortDescription:
      'Charisme, influence organique et rayonnement : devenez un leader inspirant.',
    description:
      "Le leadership ne se décrète pas, il se déploie. Ce module intensif vous accompagne dans l'incarnation de votre autorité naturelle. Vous y explorerez les mécanismes du charisme authentique — présence, puissance et chaleur — et apprendrez à influencer sans manipuler. Une attention particulière est portée aux spécificités du leadership au féminin et au leadership sensible des profils HPI/HPE.",
    level: 'Avancé',
    duration: '7h',
    modules: 5,
    lessons: 22,
    thumbnailColor: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    instructor: 'Sandrina Perrin',
    progress: 0,
    status: 'not_started',
    category: 'Leadership',
  },
];

const lessonsCourse1Module1: MockLesson[] = [
  { id: 'lesson-001', moduleId: 'module-001', title: 'Introduction : pourquoi structurer son message ?', order: 1, type: 'video', duration: '12 min', status: 'completed', isLocked: false, thumbnailColor: '#7C3AED' },
  { id: 'lesson-002', moduleId: 'module-001', title: "Les 3 piliers d'un message clair", order: 2, type: 'video', duration: '18 min', status: 'completed', isLocked: false, thumbnailColor: '#8B5CF6' },
  { id: 'lesson-003', moduleId: 'module-001', title: "Atelier : définir l'intention de votre message", order: 3, type: 'mixed', duration: '25 min', status: 'in_progress', isLocked: false, thumbnailColor: '#A78BFA' },
  { id: 'lesson-004', moduleId: 'module-001', title: 'Quiz : les fondamentaux de la structure', order: 4, type: 'quiz', duration: '10 min', status: 'not_started', isLocked: false },
];

const lessonsCourse1Module2: MockLesson[] = [
  { id: 'lesson-005', moduleId: 'module-002', title: "La pyramide de Minto appliquée à l'oral", order: 1, type: 'video', duration: '20 min', status: 'completed', isLocked: false, thumbnailColor: '#7C3AED' },
  { id: 'lesson-006', moduleId: 'module-002', title: 'Le storytelling en 3 actes', order: 2, type: 'video', duration: '22 min', status: 'not_started', isLocked: false, thumbnailColor: '#8B5CF6' },
  { id: 'lesson-007', moduleId: 'module-002', title: 'Atelier : construire son story-board', order: 3, type: 'mixed', duration: '30 min', status: 'not_started', isLocked: false, thumbnailColor: '#A78BFA' },
  { id: 'lesson-008', moduleId: 'module-002', title: 'Quiz : structures narratives', order: 4, type: 'quiz', duration: '10 min', status: 'not_started', isLocked: false },
];

const lessonsCourse1Module3: MockLesson[] = [
  { id: 'lesson-009', moduleId: 'module-003', title: "L'accroche : capter l'attention en 30 secondes", order: 1, type: 'video', duration: '15 min', status: 'not_started', isLocked: true, thumbnailColor: '#7C3AED' },
  { id: 'lesson-010', moduleId: 'module-003', title: 'Les transitions fluides entre les parties', order: 2, type: 'video', duration: '14 min', status: 'not_started', isLocked: true, thumbnailColor: '#8B5CF6' },
  { id: 'lesson-011', moduleId: 'module-003', title: "Atelier : rédiger l'ouverture de son speech", order: 3, type: 'mixed', duration: '20 min', status: 'not_started', isLocked: true, thumbnailColor: '#A78BFA' },
  { id: 'lesson-012', moduleId: 'module-003', title: "Quiz : l'art de l'accroche", order: 4, type: 'quiz', duration: '10 min', status: 'not_started', isLocked: true },
];

const lessonsCourse1Module4: MockLesson[] = [
  { id: 'lesson-013', moduleId: 'module-004', title: 'La conclusion qui marque les esprits', order: 1, type: 'video', duration: '16 min', status: 'not_started', isLocked: true, thumbnailColor: '#7C3AED' },
  { id: 'lesson-014', moduleId: 'module-004', title: 'Adapter son message à son auditoire', order: 2, type: 'video', duration: '19 min', status: 'not_started', isLocked: true, thumbnailColor: '#8B5CF6' },
  { id: 'lesson-015', moduleId: 'module-004', title: 'Atelier : présentation fil rouge complète', order: 3, type: 'mixed', duration: '35 min', status: 'not_started', isLocked: true, thumbnailColor: '#A78BFA' },
  { id: 'lesson-016', moduleId: 'module-004', title: 'Évaluation finale : votre pitch structuré', order: 4, type: 'quiz', duration: '15 min', status: 'not_started', isLocked: true },
];

const lessonsCourse2Module1: MockLesson[] = [
  { id: 'lesson-017', moduleId: 'module-005', title: 'Introduction : le corps parle avant les mots', order: 1, type: 'video', duration: '14 min', status: 'completed', isLocked: false, thumbnailColor: '#EC4899' },
  { id: 'lesson-018', moduleId: 'module-005', title: "Posture et ancrage : occuper l'espace", order: 2, type: 'video', duration: '20 min', status: 'completed', isLocked: false, thumbnailColor: '#F472B6' },
  { id: 'lesson-019', moduleId: 'module-005', title: 'Atelier : exercices de présence scénique', order: 3, type: 'mixed', duration: '25 min', status: 'in_progress', isLocked: false, thumbnailColor: '#F9A8D4' },
  { id: 'lesson-020', moduleId: 'module-005', title: 'Quiz : présence et posture', order: 4, type: 'quiz', duration: '10 min', status: 'not_started', isLocked: false },
];

const lessonsCourse2Module2: MockLesson[] = [
  { id: 'lesson-021', moduleId: 'module-006', title: 'La voix : votre instrument de leadership', order: 1, type: 'video', duration: '22 min', status: 'not_started', isLocked: false, thumbnailColor: '#EC4899' },
  { id: 'lesson-022', moduleId: 'module-006', title: 'Rythme, pauses et silences stratégiques', order: 2, type: 'video', duration: '18 min', status: 'not_started', isLocked: false, thumbnailColor: '#F472B6' },
  { id: 'lesson-023', moduleId: 'module-006', title: 'Atelier : travailler sa partition vocale', order: 3, type: 'mixed', duration: '30 min', status: 'not_started', isLocked: false, thumbnailColor: '#F9A8D4' },
  { id: 'lesson-024', moduleId: 'module-006', title: 'Quiz : technique vocale', order: 4, type: 'quiz', duration: '10 min', status: 'not_started', isLocked: false },
];

const lessonsCourse2Module3: MockLesson[] = [
  { id: 'lesson-025', moduleId: 'module-007', title: 'Comprendre son trac : le stress comme allié', order: 1, type: 'video', duration: '16 min', status: 'not_started', isLocked: true, thumbnailColor: '#EC4899' },
  { id: 'lesson-026', moduleId: 'module-007', title: 'Respiration et régulation émotionnelle', order: 2, type: 'video', duration: '20 min', status: 'not_started', isLocked: true, thumbnailColor: '#F472B6' },
  { id: 'lesson-027', moduleId: 'module-007', title: 'Atelier : construire son rituel pré-speech', order: 3, type: 'mixed', duration: '25 min', status: 'not_started', isLocked: true, thumbnailColor: '#F9A8D4' },
  { id: 'lesson-028', moduleId: 'module-007', title: 'Quiz : gestion du trac', order: 4, type: 'quiz', duration: '10 min', status: 'not_started', isLocked: true },
];

const lessonsCourse2Module4: MockLesson[] = [
  { id: 'lesson-029', moduleId: 'module-008', title: "Le regard et la connexion avec l'auditoire", order: 1, type: 'video', duration: '15 min', status: 'not_started', isLocked: true, thumbnailColor: '#EC4899' },
  { id: 'lesson-030', moduleId: 'module-008', title: 'Gérer les imprévus et les questions difficiles', order: 2, type: 'video', duration: '21 min', status: 'not_started', isLocked: true, thumbnailColor: '#F472B6' },
  { id: 'lesson-031', moduleId: 'module-008', title: 'Atelier : simulation de prise de parole', order: 3, type: 'mixed', duration: '30 min', status: 'not_started', isLocked: true, thumbnailColor: '#F9A8D4' },
  { id: 'lesson-032', moduleId: 'module-008', title: 'Quiz : le jour J', order: 4, type: 'quiz', duration: '10 min', status: 'not_started', isLocked: true },
];

const lessonsCourse2Module5: MockLesson[] = [
  { id: 'lesson-033', moduleId: 'module-009', title: "Bilan de progression et axes d'amélioration", order: 1, type: 'mixed', duration: '20 min', status: 'not_started', isLocked: true, thumbnailColor: '#EC4899' },
  { id: 'lesson-034', moduleId: 'module-009', title: 'Votre plan de progrès personnel', order: 2, type: 'video', duration: '15 min', status: 'not_started', isLocked: true, thumbnailColor: '#F472B6' },
  { id: 'lesson-035', moduleId: 'module-009', title: 'Atelier : présentation fil rouge incarnée', order: 3, type: 'mixed', duration: '40 min', status: 'not_started', isLocked: true, thumbnailColor: '#F9A8D4' },
  { id: 'lesson-036', moduleId: 'module-009', title: 'Évaluation finale : speech incarné', order: 4, type: 'quiz', duration: '15 min', status: 'not_started', isLocked: true },
];

const lessonsCourse3Module1: MockLesson[] = [
  { id: 'lesson-037', moduleId: 'module-010', title: 'Introduction : le mindset, fondation du speaker', order: 1, type: 'video', duration: '14 min', status: 'not_started', isLocked: false, thumbnailColor: '#F59E0B' },
  { id: 'lesson-038', moduleId: 'module-010', title: 'Identifier ses croyances limitantes', order: 2, type: 'video', duration: '20 min', status: 'not_started', isLocked: false, thumbnailColor: '#FBBF24' },
  { id: 'lesson-039', moduleId: 'module-010', title: 'Atelier : recadrage cognitif', order: 3, type: 'mixed', duration: '25 min', status: 'not_started', isLocked: false, thumbnailColor: '#FCD34D' },
  { id: 'lesson-040', moduleId: 'module-010', title: 'Quiz : croyances et mindset', order: 4, type: 'quiz', duration: '10 min', status: 'not_started', isLocked: false },
  { id: 'lesson-041', moduleId: 'module-010', title: 'Journaling : votre carte des croyances', order: 5, type: 'mixed', duration: '15 min', status: 'not_started', isLocked: false, thumbnailColor: '#FDE68A' },
];

const lessonsCourse3Module2: MockLesson[] = [
  { id: 'lesson-042', moduleId: 'module-011', title: 'La légitimité intérieure : oser prendre sa place', order: 1, type: 'video', duration: '18 min', status: 'not_started', isLocked: true, thumbnailColor: '#F59E0B' },
  { id: 'lesson-043', moduleId: 'module-011', title: "Syndrome de l'imposteur : le déconstruire", order: 2, type: 'video', duration: '22 min', status: 'not_started', isLocked: true, thumbnailColor: '#FBBF24' },
  { id: 'lesson-044', moduleId: 'module-011', title: 'Atelier : affirmer sa légitimité', order: 3, type: 'mixed', duration: '25 min', status: 'not_started', isLocked: true, thumbnailColor: '#FCD34D' },
  { id: 'lesson-045', moduleId: 'module-011', title: 'Quiz : légitimité et imposture', order: 4, type: 'quiz', duration: '10 min', status: 'not_started', isLocked: true },
];

const lessonsCourse3Module3: MockLesson[] = [
  { id: 'lesson-046', moduleId: 'module-012', title: 'La vision : parler pour transformer', order: 1, type: 'video', duration: '16 min', status: 'not_started', isLocked: true, thumbnailColor: '#F59E0B' },
  { id: 'lesson-047', moduleId: 'module-012', title: "L'autorité naturelle du leader sensible", order: 2, type: 'video', duration: '20 min', status: 'not_started', isLocked: true, thumbnailColor: '#FBBF24' },
  { id: 'lesson-048', moduleId: 'module-012', title: 'Atelier : visualisation du speaker accompli', order: 3, type: 'mixed', duration: '20 min', status: 'not_started', isLocked: true, thumbnailColor: '#FCD34D' },
  { id: 'lesson-049', moduleId: 'module-012', title: 'Quiz : vision et autorité', order: 4, type: 'quiz', duration: '10 min', status: 'not_started', isLocked: true },
];

const lessonsCourse3Module4: MockLesson[] = [
  { id: 'lesson-050', moduleId: 'module-013', title: 'Le feedback comme levier de croissance', order: 1, type: 'video', duration: '15 min', status: 'not_started', isLocked: true, thumbnailColor: '#F59E0B' },
  { id: 'lesson-051', moduleId: 'module-013', title: "Rituels quotidiens du speaker affirmé", order: 2, type: 'video', duration: '14 min', status: 'not_started', isLocked: true, thumbnailColor: '#FBBF24' },
  { id: 'lesson-052', moduleId: 'module-013', title: 'Atelier : concevoir sa routine mindset', order: 3, type: 'mixed', duration: '20 min', status: 'not_started', isLocked: true, thumbnailColor: '#FCD34D' },
  { id: 'lesson-053', moduleId: 'module-013', title: 'Évaluation finale : manifeste du speaker', order: 4, type: 'quiz', duration: '15 min', status: 'not_started', isLocked: true },
];

const lessonsCourse4Module1: MockLesson[] = [
  { id: 'lesson-054', moduleId: 'module-014', title: 'Introduction : le leadership organique', order: 1, type: 'video', duration: '15 min', status: 'not_started', isLocked: false, thumbnailColor: '#10B981' },
  { id: 'lesson-055', moduleId: 'module-014', title: 'Charisme authentique : présence, puissance, chaleur', order: 2, type: 'video', duration: '24 min', status: 'not_started', isLocked: false, thumbnailColor: '#34D399' },
  { id: 'lesson-056', moduleId: 'module-014', title: "Atelier : diagnostiquer son style de leadership", order: 3, type: 'mixed', duration: '25 min', status: 'not_started', isLocked: false, thumbnailColor: '#6EE7B7' },
  { id: 'lesson-057', moduleId: 'module-014', title: 'Quiz : les fondamentaux du leadership', order: 4, type: 'quiz', duration: '10 min', status: 'not_started', isLocked: false },
];

const lessonsCourse4Module2: MockLesson[] = [
  { id: 'lesson-058', moduleId: 'module-015', title: 'Influencer sans manipuler : le cadre éthique', order: 1, type: 'video', duration: '20 min', status: 'not_started', isLocked: true, thumbnailColor: '#10B981' },
  { id: 'lesson-059', moduleId: 'module-015', title: "Les leviers de l'influence positive", order: 2, type: 'video', duration: '18 min', status: 'not_started', isLocked: true, thumbnailColor: '#34D399' },
  { id: 'lesson-060', moduleId: 'module-015', title: "Atelier : mise en situation d'influence", order: 3, type: 'mixed', duration: '30 min', status: 'not_started', isLocked: true, thumbnailColor: '#6EE7B7' },
  { id: 'lesson-061', moduleId: 'module-015', title: 'Quiz : influence et éthique', order: 4, type: 'quiz', duration: '10 min', status: 'not_started', isLocked: true },
];

const lessonsCourse4Module3: MockLesson[] = [
  { id: 'lesson-062', moduleId: 'module-016', title: 'Communication non violente pour leaders', order: 1, type: 'video', duration: '22 min', status: 'not_started', isLocked: true, thumbnailColor: '#10B981' },
  { id: 'lesson-063', moduleId: 'module-016', title: "L'écoute active : le super-pouvoir du leader", order: 2, type: 'video', duration: '19 min', status: 'not_started', isLocked: true, thumbnailColor: '#34D399' },
  { id: 'lesson-064', moduleId: 'module-016', title: "Atelier : pratiquer l'écoute active", order: 3, type: 'mixed', duration: '25 min', status: 'not_started', isLocked: true, thumbnailColor: '#6EE7B7' },
  { id: 'lesson-065', moduleId: 'module-016', title: 'Quiz : CNV et écoute', order: 4, type: 'quiz', duration: '10 min', status: 'not_started', isLocked: true },
];

const lessonsCourse4Module4: MockLesson[] = [
  { id: 'lesson-066', moduleId: 'module-017', title: 'Leadership au féminin : mythes et réalités', order: 1, type: 'video', duration: '21 min', status: 'not_started', isLocked: true, thumbnailColor: '#10B981' },
  { id: 'lesson-067', moduleId: 'module-017', title: 'HPI/HPE : hypersensibilité comme force de leadership', order: 2, type: 'video', duration: '25 min', status: 'not_started', isLocked: true, thumbnailColor: '#34D399' },
  { id: 'lesson-068', moduleId: 'module-017', title: 'Atelier : incarner son leadership sensible', order: 3, type: 'mixed', duration: '28 min', status: 'not_started', isLocked: true, thumbnailColor: '#6EE7B7' },
  { id: 'lesson-069', moduleId: 'module-017', title: 'Quiz : leadership et neurodiversité', order: 4, type: 'quiz', duration: '10 min', status: 'not_started', isLocked: true },
];

const lessonsCourse4Module5: MockLesson[] = [
  { id: 'lesson-070', moduleId: 'module-018', title: 'Rayonner dans son écosystème professionnel', order: 1, type: 'video', duration: '18 min', status: 'not_started', isLocked: true, thumbnailColor: '#10B981' },
  { id: 'lesson-071', moduleId: 'module-018', title: 'Créer sa signature de leader', order: 2, type: 'video', duration: '20 min', status: 'not_started', isLocked: true, thumbnailColor: '#34D399' },
  { id: 'lesson-072', moduleId: 'module-018', title: 'Atelier : votre plan de rayonnement', order: 3, type: 'mixed', duration: '30 min', status: 'not_started', isLocked: true, thumbnailColor: '#6EE7B7' },
  { id: 'lesson-073', moduleId: 'module-018', title: 'Évaluation finale : pitch de leadership', order: 4, type: 'quiz', duration: '15 min', status: 'not_started', isLocked: true },
  { id: 'lesson-074', moduleId: 'module-018', title: 'Clôture : votre feuille de route', order: 5, type: 'video', duration: '12 min', status: 'not_started', isLocked: true, thumbnailColor: '#A7F3D0' },
];

export const mockModules: MockModule[] = [
  { id: 'module-001', courseId: 'course-001', title: 'Les fondamentaux de la structure', order: 1, lessons: lessonsCourse1Module1, progress: 80, isLocked: false },
  { id: 'module-002', courseId: 'course-001', title: 'Les modèles de structuration', order: 2, lessons: lessonsCourse1Module2, progress: 25, isLocked: false },
  { id: 'module-003', courseId: 'course-001', title: "L'art de l'accroche et des transitions", order: 3, lessons: lessonsCourse1Module3, progress: 0, isLocked: true },
  { id: 'module-004', courseId: 'course-001', title: 'La conclusion et la livraison finale', order: 4, lessons: lessonsCourse1Module4, progress: 0, isLocked: true },
  { id: 'module-005', courseId: 'course-002', title: 'Présence scénique et posture', order: 1, lessons: lessonsCourse2Module1, progress: 60, isLocked: false },
  { id: 'module-006', courseId: 'course-002', title: 'La voix et le rythme', order: 2, lessons: lessonsCourse2Module2, progress: 0, isLocked: false },
  { id: 'module-007', courseId: 'course-002', title: 'Gestion du trac et régulation émotionnelle', order: 3, lessons: lessonsCourse2Module3, progress: 0, isLocked: true },
  { id: 'module-008', courseId: 'course-002', title: "Connexion avec l'auditoire", order: 4, lessons: lessonsCourse2Module4, progress: 0, isLocked: true },
  { id: 'module-009', courseId: 'course-002', title: "Bilan et plan d'action personnel", order: 5, lessons: lessonsCourse2Module5, progress: 0, isLocked: true },
  { id: 'module-010', courseId: 'course-003', title: 'Les fondations du mindset', order: 1, lessons: lessonsCourse3Module1, progress: 0, isLocked: false },
  { id: 'module-011', courseId: 'course-003', title: "Légitimité et syndrome de l'imposteur", order: 2, lessons: lessonsCourse3Module2, progress: 0, isLocked: true },
  { id: 'module-012', courseId: 'course-003', title: 'Vision et autorité naturelle', order: 3, lessons: lessonsCourse3Module3, progress: 0, isLocked: true },
  { id: 'module-013', courseId: 'course-003', title: 'Ancrer le mindset au quotidien', order: 4, lessons: lessonsCourse3Module4, progress: 0, isLocked: true },
  { id: 'module-014', courseId: 'course-004', title: 'Les piliers du leadership organique', order: 1, lessons: lessonsCourse4Module1, progress: 0, isLocked: false },
  { id: 'module-015', courseId: 'course-004', title: 'Influence et éthique', order: 2, lessons: lessonsCourse4Module2, progress: 0, isLocked: true },
  { id: 'module-016', courseId: 'course-004', title: 'Communication et écoute active', order: 3, lessons: lessonsCourse4Module3, progress: 0, isLocked: true },
  { id: 'module-017', courseId: 'course-004', title: 'Leadership sensible et neurodiversité', order: 4, lessons: lessonsCourse4Module4, progress: 0, isLocked: true },
  { id: 'module-018', courseId: 'course-004', title: "Rayonnement et passage à l'action", order: 5, lessons: lessonsCourse4Module5, progress: 0, isLocked: true },
];

export const mockQuiz: MockQuiz = {
  id: 'quiz-001',
  lessonId: 'lesson-004',
  title: 'Quiz : les fondamentaux de la structure',
  passingScore: 80,
  questions: [
    {
      id: 'q-001',
      text: 'Quel est le premier pilier d\'un message clair selon la méthode Kleia-up ?',
      type: 'mcq',
      options: [
        { id: 'q1-a', label: 'Une intention claire', isCorrect: true },
        { id: 'q1-b', label: 'Un diaporama bien conçu', isCorrect: false },
        { id: 'q1-c', label: 'Une voix puissante', isCorrect: false },
        { id: 'q1-d', label: 'Un public nombreux', isCorrect: false },
      ],
      explanation: "L'intention est la boussole de votre message. Sans elle, vous risquez de perdre votre auditoire dès les premières minutes.",
    },
    {
      id: 'q-002',
      text: 'La pyramide de Minto est un outil de structuration qui consiste à…',
      type: 'mcq',
      options: [
        { id: 'q2-a', label: 'Placer la conclusion en premier, puis les arguments', isCorrect: true },
        { id: 'q2-b', label: 'Commencer par des anecdotes personnelles', isCorrect: false },
        { id: 'q2-c', label: 'Structurer son discours en trois parties égales', isCorrect: false },
        { id: 'q2-d', label: 'Utiliser uniquement des données chiffrées', isCorrect: false },
      ],
      explanation: "La pyramide de Minto propose d'annoncer la conclusion dès le début, puis de dérouler les arguments qui la soutiennent.",
    },
    {
      id: 'q-003',
      text: 'Un bon storytelling doit contenir un élément de tension ou de conflit.',
      type: 'true_false',
      options: [
        { id: 'q3-a', label: 'Vrai', isCorrect: true },
        { id: 'q3-b', label: 'Faux', isCorrect: false },
      ],
      explanation: 'Le conflit (ou la tension narrative) est le moteur du storytelling. Sans lui, l\'histoire n\'a pas de relief et l\'auditoire décroche.',
    },
    {
      id: 'q-004',
      text: 'Quelle est la durée idéale recommandée pour une accroche en ouverture de speech ?',
      type: 'mcq',
      options: [
        { id: 'q4-a', label: 'Entre 30 secondes et 1 minute', isCorrect: true },
        { id: 'q4-b', label: 'Entre 3 et 5 minutes', isCorrect: false },
        { id: 'q4-c', label: 'Moins de 10 secondes', isCorrect: false },
        { id: 'q4-d', label: 'Au moins 2 minutes', isCorrect: false },
      ],
      explanation: "Une accroche efficace dure entre 30 et 60 secondes. C'est le temps nécessaire pour capter l'attention sans perdre votre auditoire.",
    },
    {
      id: 'q-005',
      text: 'La méthode STAR (Situation, Tâche, Action, Résultat) est particulièrement adaptée pour…',
      type: 'mcq',
      options: [
        { id: 'q5-a', label: 'Structurer une réponse à une question comportementale', isCorrect: true },
        { id: 'q5-b', label: 'Animer un atelier participatif', isCorrect: false },
        { id: 'q5-c', label: 'Conclure une présentation commerciale', isCorrect: false },
        { id: 'q5-d', label: 'Débuter un keynote', isCorrect: false },
      ],
      explanation: "La méthode STAR est un cadre idéal pour répondre à une question comportementale ou raconter une expérience professionnelle de manière structurée.",
    },
  ],
};

export const mockProgress: MockProgress = {
  coursesInProgress: 2,
  coursesCompleted: 0,
  totalMinutesWatched: 187,
  certificatesObtained: 0,
  currentStreak: 5,
  lastActivity: '2026-05-10T14:32:00.000Z',
};

export const mockCertificates: MockCertificate[] = [
  {
    id: 'cert-001',
    courseName: "L'Architecture du Message",
    issuedAt: '2025-11-15T00:00:00.000Z',
    certificateNumber: 'KLEIA-2025-0047',
  },
];

export const mockActivities: MockActivity[] = [
  { id: 'act-001', type: 'lesson_completed', description: "Les 3 piliers d'un message clair", timestamp: '2026-05-10T14:30:00.000Z', courseName: "L'Architecture du Message" },
  { id: 'act-002', type: 'quiz_passed', description: 'Quiz : les fondamentaux de la structure — 90 % de réussite', timestamp: '2026-05-09T11:15:00.000Z', courseName: "L'Architecture du Message" },
  { id: 'act-003', type: 'lesson_completed', description: 'Introduction : pourquoi structurer son message ?', timestamp: '2026-05-08T16:45:00.000Z', courseName: "L'Architecture du Message" },
  { id: 'act-004', type: 'course_started', description: 'A commencé le module « Présence scénique et posture »', timestamp: '2026-05-07T09:00:00.000Z', courseName: "L'Incarnation & Le Jour J" },
  { id: 'act-005', type: 'lesson_completed', description: "Posture et ancrage : occuper l'espace", timestamp: '2026-05-06T18:20:00.000Z', courseName: "L'Incarnation & Le Jour J" },
  { id: 'act-006', type: 'lesson_completed', description: 'Introduction : le corps parle avant les mots', timestamp: '2026-05-05T14:10:00.000Z', courseName: "L'Incarnation & Le Jour J" },
  { id: 'act-007', type: 'lesson_completed', description: "Atelier : définir l'intention de votre message", timestamp: '2026-05-04T10:30:00.000Z', courseName: "L'Architecture du Message" },
  { id: 'act-008', type: 'course_started', description: 'A commencé le module « Les fondamentaux de la structure »', timestamp: '2026-05-03T08:00:00.000Z', courseName: "L'Architecture du Message" },
  { id: 'act-009', type: 'lesson_completed', description: "La pyramide de Minto appliquée à l'oral", timestamp: '2026-05-02T15:45:00.000Z', courseName: "L'Architecture du Message" },
  { id: 'act-010', type: 'lesson_completed', description: 'Atelier : exercices de présence scénique', timestamp: '2026-05-01T12:00:00.000Z', courseName: "L'Incarnation & Le Jour J" },
];

export function getCourseById(id: string): MockCourse | undefined {
  return mockCourses.find((course) => course.id === id);
}

export function getModulesByCourse(courseId: string): MockModule[] {
  return mockModules.filter((mod) => mod.courseId === courseId).sort((a, b) => a.order - b.order);
}

export function getLessonById(id: string): MockLesson | undefined {
  for (const mod of mockModules) {
    const lesson = mod.lessons.find((l) => l.id === id);
    if (lesson) return lesson;
  }
  return undefined;
}

export function getProgressForCourse(courseId: string): number {
  const course = getCourseById(courseId);
  return course ? course.progress : 0;
}

export function getStartedCourses(): MockCourse[] {
  return mockCourses.filter((c) => c.status === 'in_progress');
}

export function getCompletedCourses(): MockCourse[] {
  return mockCourses.filter((c) => c.status === 'completed');
}

export function getCourseBySlug(slug: string): MockCourse | undefined {
  return mockCourses.find((c) => c.slug === slug);
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes} min`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h${remainingMinutes}`;
}