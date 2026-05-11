import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import clsx from 'clsx';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { mockQuiz } from '@/mock';
import { getQuiz } from '@/api/quizzes';
import type { Quiz } from '@/types';

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

export default function QuizView() {
  const { quizId } = useParams<{ quizId: string }>();
  const [apiQuiz, setApiQuiz] = useState<NormalizedQuiz | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchQuiz() {
      try {
        const raw = await getQuiz(quizId || '');
        if (!cancelled) {
          const normalized = normalizeQuiz(raw);
          setApiQuiz(normalized);
          setSelectedAnswers(new Array(normalized.questions.length).fill(undefined));
        }
      } catch {
        /* fall back to mock */
      }
      if (!cancelled) setApiLoading(false);
    }
    fetchQuiz();
    return () => { cancelled = true; };
  }, [quizId]);

  const quiz = apiQuiz || mockQuiz;

  if (apiLoading) {
    return <Loading className="py-20" text="Chargement du quiz..." />;
  }

  if (!quizId || (apiQuiz === null && quizId !== mockQuiz.id && !apiLoading)) {
    return (
      <Card className="text-center py-12">
        <p className="text-kleia-gray font-body text-lg">Quiz introuvable</p>
        <Link to="/formations" className="text-kleia-burgundy font-heading font-semibold underline underline-offset-2 mt-2 inline-block">
          Retour aux formations
        </Link>
      </Card>
    );
  }

  const { title, questions, passingScore } = quiz;
  const total = questions.length;

  const handleSelect = (index: number) => {
    if (submitted) return;
    const updated = [...selectedAnswers];
    updated[currentQuestion] = index;
    setSelectedAnswers(updated);
  };

  const goNext = () => {
    if (currentQuestion < total - 1) setCurrentQuestion(currentQuestion + 1);
  };

  const goPrev = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const correctCount = submitted
    ? questions.filter((q, i) => selectedAnswers[i] === q.correctIndex).length
    : 0;

  const score = submitted ? Math.round((correctCount / total) * 100) : 0;
  const passed = score >= passingScore;

  const answeredCount = selectedAnswers.filter(a => a !== undefined).length;
  const allAnswered = answeredCount === total;

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

      {submitted && (
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
            {correctCount}/{total} bonnes réponses ({score}%)
          </p>
          <Badge variant={passed ? 'success' : 'danger'} className="mt-2">
            {passed ? 'Réussi' : 'Non réussi'}
          </Badge>
        </div>
      )}

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
            {currentQ.options.map((option, optIndex) => {
              const isSelected = selectedAnswers[currentQuestion] === optIndex;
              const isCorrect = currentQ.correctIndex === optIndex;
              const showResult = submitted;

              let optionStyle = '';
              if (showResult) {
                if (isCorrect) optionStyle = 'border-kleia-success bg-kleia-success/5';
                else if (isSelected && !isCorrect) optionStyle = 'border-kleia-error bg-kleia-error/5';
                else optionStyle = 'border-kleia-dark/10 opacity-60';
              } else if (isSelected) {
                optionStyle = 'border-kleia-burgundy bg-kleia-burgundy/5';
              } else {
                optionStyle = 'border-kleia-dark/10 hover:border-kleia-burgundy/50 hover:bg-kleia-burgundy/5';
              }

              return (
                <button
                  key={optIndex}
                  onClick={() => handleSelect(optIndex)}
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
                      isSelected && !submitted && 'border-kleia-burgundy bg-kleia-burgundy text-white',
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
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={!allAnswered}
          >
            Valider
          </Button>
        )}
        {submitted && (
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              setSubmitted(false);
              setSelectedAnswers([]);
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
