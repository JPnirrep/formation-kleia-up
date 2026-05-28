import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import { getQuiz, submitAttempt } from '@/api/quizzes';
import { completeLesson } from '@/api/progress';
import type { Quiz, AttemptResult } from '@/types';

interface NormalizedQuestion {
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface NormalizedQuiz {
  id: string;
  title: string;
  passingScore: number;
  questions: NormalizedQuestion[];
}

interface SourceOption {
  id: string;
}

interface SourceQuestion {
  id: string;
  options: SourceOption[];
}

function normalizeQuiz(quiz: Quiz): NormalizedQuiz {
  return {
    id: quiz.id,
    title: quiz.title,
    passingScore: quiz.passing_score,
    questions: quiz.questions.map((q) => {
      const options = q.options.map((o) => o.text);
      const correctIndex = q.options.findIndex((o) => o.is_correct);
      return {
        text: q.text,
        options,
        correctIndex: correctIndex >= 0 ? correctIndex : 0,
        explanation: '',
      };
    }),
  };
}

/** Extract question/option IDs from the quiz data source */
function extractSourceQuestions(source: Quiz): SourceQuestion[] {
  return source.questions.map((q: any) => ({
    id: q.id,
    options: q.options.map((o: any) => ({ id: o.id })),
  }));
}

export default function QuizView() {
  const { quizId } = useParams<{ quizId: string }>();
  const [searchParams] = useSearchParams();
  useEffect(() => { document.title = 'Quiz — Kleia-up'; }, []);
  const lessonId = searchParams.get('lessonId');

  const [apiQuiz, setApiQuiz] = useState<NormalizedQuiz | null>(null);
  const [apiQuizRaw, setApiQuizRaw] = useState<Quiz | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  // Map question_id -> selected_option_ids
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [submitted, setSubmitted] = useState(false);

  const [backendResult, setBackendResult] = useState<AttemptResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchQuiz() {
      try {
        const raw = await getQuiz(quizId || '');
        if (!cancelled) {
          setApiQuizRaw(raw);
          const normalized = normalizeQuiz(raw);
          setApiQuiz(normalized);
          const init: Record<string, string[]> = {};
          raw.questions.forEach((q) => { init[q.id] = []; });
          setSelectedAnswers(init);
        }
      } catch {
        if (!cancelled) {
          setFetchError('Impossible de charger le quiz. Veuillez réessayer plus tard.');
        }
      }
      if (!cancelled) setApiLoading(false);
    }
    fetchQuiz();
    return () => { cancelled = true; };
  }, [quizId]);

  const quiz: NormalizedQuiz | null = apiQuiz;

  // Determine data source for question/option IDs
  const sourceQuestions = useMemo<SourceQuestion[]>(() => {
    if (apiQuizRaw) return extractSourceQuestions(apiQuizRaw);
    return [];
  }, [apiQuizRaw]);

  const currentQuestionId = sourceQuestions[currentQuestion]?.id ?? null;
  const currentOptions = sourceQuestions[currentQuestion]?.options ?? [];

  // ── Submit handler ──────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    if (!quizId || submitted || submitting) return;

    // If we have API data, submit to backend
    if (apiQuizRaw) {
      setSubmitting(true);
      setSubmitError(null);

      const answers = apiQuizRaw.questions.map((q) => ({
        question_id: q.id,
        selected_option: selectedAnswers[q.id] ?? [],
      }));

      try {
        const result = await submitAttempt(quizId, {
          quiz_id: quizId,
          answers,
        });
        setBackendResult(result);
        setSubmitted(true);
      } catch (err: unknown) {
        setSubmitError(
          err instanceof Error ? err.message : 'Erreur lors de la soumission du quiz'
        );
      } finally {
        setSubmitting(false);
      }
    } else {
      // No API data available — cannot submit
      setSubmitError('Quiz non disponible. Impossible de soumettre les réponses.');
    }
  }, [quizId, apiQuizRaw, submitted, submitting, selectedAnswers, quiz]);

  // ── Complete lesson handler ─────────────────────────────────────────────

  const handleCompleteLesson = useCallback(async () => {
    if (!lessonId || completed || completing) return;
    setCompleting(true);
    setCompleteError(null);
    try {
      await completeLesson(lessonId);
      setCompleted(true);
    } catch (err: unknown) {
      setCompleteError(
        err instanceof Error ? err.message : 'Erreur lors de la validation'
      );
    } finally {
      setCompleting(false);
    }
  }, [lessonId, completed, completing]);

  // ── Loading ─────────────────────────────────────────────────────────────

  if (apiLoading) {
    return <Loading className="py-20" text="Chargement du quiz..." />;
  }

  // ── Not found ───────────────────────────────────────────────────────────

  if (!quizId || (apiQuiz === null && !apiLoading && !fetchError)) {
    return (
      <Card className="text-center py-12">
        <p className="text-kleia-gray font-body text-lg">Quiz introuvable</p>
        <Link to="/formations" className="text-kleia-violet font-heading font-semibold underline underline-offset-2 mt-2 inline-block">
          Retour aux formations
        </Link>
      </Card>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────

  if (fetchError) {
    return (
      <EmptyState
        icon="error"
        title="Erreur de chargement"
        description={fetchError}
        actionLabel="Réessayer"
        onAction={() => window.location.reload()}
      />
    );
  }

  if (!quiz) {
    return (
      <Card className="text-center py-12">
        <p className="text-kleia-gray font-body text-lg">Quiz introuvable</p>
        <Link to="/formations" className="text-kleia-violet font-heading font-semibold underline underline-offset-2 mt-2 inline-block">
          Retour aux formations
        </Link>
      </Card>
    );
  }

  const { title, questions, passingScore } = quiz;
  const total = questions.length;

  const handleSelect = (optId: string) => {
    if (submitted || !currentQuestionId) return;
    setSelectedAnswers((prev) => {
      const current = prev[currentQuestionId] ?? [];
      // For MCQ, only one selection allowed per question
      const updated = current.includes(optId) ? current : [optId];
      return { ...prev, [currentQuestionId]: updated };
    });
  };

  const goNext = () => {
    if (currentQuestion < total - 1) setCurrentQuestion(currentQuestion + 1);
  };

  const goPrev = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const answeredCount = Object.values(selectedAnswers).filter(a => a.length > 0).length;
  const allAnswered = answeredCount === total;

  const passed = backendResult ? backendResult.passed : false;

  const currentQ = questions[currentQuestion];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-heading text-kleia-dark">{title}</h1>
          <p className="text-sm text-kleia-gray font-body">
            Question {currentQuestion + 1}/{total}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="warning">Score requis : {passingScore}%</Badge>
          {!submitted && (
            <span className="text-xs text-kleia-gray font-body">
              ⏱ 15:00
            </span>
          )}
        </div>
      </div>

      {/* ── Result banner ──────────────────────────────────────────────── */}
      {submitted && backendResult && (
        <div className={clsx(
          'glass p-6 text-center rounded-kleia',
          passed ? 'border-kleia-success/30' : 'border-kleia-error/30',
        )}>
          <div className={clsx(
            'inline-flex items-center justify-center w-16 h-16 rounded-full mb-3',
            passed ? 'bg-kleia-success/15' : 'bg-kleia-error/15',
          )}>
            <span className={clsx('text-3xl', passed ? 'text-kleia-success' : 'text-kleia-error')}>
              {passed ? '✓' : '✗'}
            </span>
          </div>
          <h2 className={clsx(
            'text-2xl font-bold font-heading',
            passed ? 'text-kleia-success' : 'text-kleia-error',
          )}>
            {passed ? 'Félicitations !' : 'Essaie encore'}
          </h2>
          <p className="text-kleia-gray font-body mt-1">
            {backendResult.earned_points}/{backendResult.total_points} points ({Math.round(backendResult.score_percent)}%)
          </p>
          <Badge variant={passed ? 'success' : 'danger'} className="mt-2">
            {passed ? 'Réussi' : 'Non réussi'}
          </Badge>
          {!passed && (
            <p className="text-sm text-kleia-gray font-body mt-2">
              Score minimum requis : {passingScore}%
            </p>
          )}
          {/* ── Complete lesson button ──────────────────────────────── */}
          {passed && lessonId && !completed && (
            <div className="mt-4 pt-4 border-t border-kleia-dark/10">
              <Button
                variant="primary"
                size="md"
                onClick={handleCompleteLesson}
                disabled={completing}
              >
                {completing ? 'Validation...' : 'Marquer la leçon comme terminée'}
              </Button>
              {completeError && (
                <p className="text-sm text-red-500 font-body mt-2">{completeError}</p>
              )}
            </div>
          )}
          {passed && completed && (
            <Badge variant="success" className="mt-3">Leçon terminée ✓</Badge>
          )}
        </div>
      )}

      {/* ── Question card ─────────────────────────────────────────────── */}
      {currentQ && (
        <Card key={currentQuestion}>
          <div className="mb-2">
            <span className="text-xs text-kleia-gray font-body">
              Question {currentQuestion + 1} sur {total}
            </span>
          </div>
          <h2 className="text-lg font-bold font-heading text-kleia-dark mb-4">
            {currentQ.text}
          </h2>
          <div className="space-y-3">
            {currentQ.options.map((option: string, optIndex: number) => {
              const optId = currentOptions[optIndex]?.id ?? String(optIndex);
              const isSelected = currentQuestionId
                ? (selectedAnswers[currentQuestionId] ?? []).includes(optId)
                : false;

              let showResult = false;
              let isCorrect = false;
              if (submitted && backendResult) {
                showResult = true;
                isCorrect = currentQ.correctIndex === optIndex;
              }

              let optionStyle = '';
              if (showResult) {
                if (isCorrect) optionStyle = 'border-kleia-success bg-kleia-success/5';
                else if (isSelected && !isCorrect) optionStyle = 'border-kleia-error bg-kleia-error/5';
                else optionStyle = 'border-kleia-dark/10 opacity-60';
              } else if (isSelected) {
                optionStyle = 'border-kleia-violet bg-kleia-violet/5';
              } else {
                optionStyle = 'border-kleia-dark/10 hover:border-kleia-violet/50 hover:bg-kleia-violet/5';
              }

              return (
                <button
                  key={optId}
                  onClick={() => handleSelect(optId)}
                  disabled={submitted}
                  className={clsx(
                    'w-full text-left p-4 rounded-lg border-2 transition-all font-body',
                    optionStyle,
                  )}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-start gap-3">
                    <span className={clsx(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5',
                      isSelected && !submitted && 'border-kleia-violet bg-kleia-violet text-white',
                      showResult && isCorrect && 'border-kleia-success bg-kleia-success text-white',
                      showResult && isSelected && !isCorrect && 'border-kleia-error bg-kleia-error text-white',
                      !isSelected && 'border-kleia-dark/20 text-kleia-gray',
                    )}>
                      {showResult && isCorrect ? '✓' : showResult && isSelected && !isCorrect ? '✗' : ['A','B','C','D','E','F'][optIndex] ?? String(optIndex + 1)}
                    </span>
                    <span className={clsx(
                      'text-sm flex-1 pt-0.5',
                      showResult && isCorrect && 'text-kleia-success font-medium',
                      showResult && isSelected && !isCorrect && 'text-kleia-error',
                    )}>
                      {option}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {submitted && currentQ.explanation && (
            <div className="mt-4 p-4 rounded-lg bg-kleia-cream border border-kleia-dark/10">
              <p className="text-sm font-medium text-kleia-dark font-heading mb-1">Explication</p>
              <p className="text-sm text-kleia-gray font-body">{currentQ.explanation}</p>
            </div>
          )}
        </Card>
      )}

      {/* ── Navigation bar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={goPrev} disabled={currentQuestion === 0}>
            ← Précédent
          </Button>
          <Button variant="outline" size="sm" onClick={goNext} disabled={currentQuestion === total - 1 || submitted}>
            Suivant →
          </Button>
        </div>
        {!submitted && (
          <div className="flex items-center gap-3">
            {submitError && (
              <p className="text-sm text-red-500 font-body">{submitError}</p>
            )}
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
            >
              {submitting ? 'Envoi...' : 'Valider'}
            </Button>
          </div>
        )}
        {submitted && (
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              setSubmitted(false);
              setBackendResult(null);
              setSubmitError(null);
              setCompleteError(null);
              const init: Record<string, string[]> = {};
              sourceQuestions.forEach((q) => { init[q.id] = []; });
              setSelectedAnswers(init);
              setCurrentQuestion(0);
            }}
          >
            Réessayer
          </Button>
        )}
      </div>
    </div>
  );
}
