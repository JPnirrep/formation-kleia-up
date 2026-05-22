import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { getLessonQuiz, createQuiz, addQuestion, deleteQuestion, deleteQuiz } from '@/api/admin';
import type { QuizRead } from '@/api/admin';

interface QuizEditorProps {
  lessonId: string;
  onClose: () => void;
}

export default function QuizEditor({ lessonId, onClose }: QuizEditorProps) {
  const [quiz, setQuiz] = useState<QuizRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create mode
  const [showCreate, setShowCreate] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [passingScore, setPassingScore] = useState(70);

  // Add question mode
  const [showAddQ, setShowAddQ] = useState(false);
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState('mcq');
  const [qPoints, setQPoints] = useState(1);
  const [qOptions, setQOptions] = useState<{ label: string; text: string; is_correct: boolean }[]>([
    { label: 'A', text: '', is_correct: true },
    { label: 'B', text: '', is_correct: false },
  ]);

  const loadQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = await getLessonQuiz(lessonId);
      setQuiz(q);
    } catch {
      setQuiz(null);
    }
    setLoading(false);
  };

  useEffect(() => { loadQuiz(); }, [lessonId]);

  const handleCreateQuiz = async () => {
    if (!quizTitle.trim()) return;
    try {
      const q = await createQuiz(lessonId, { title: quizTitle.trim(), passing_score_percent: passingScore });
      setQuiz(q);
      setShowCreate(false);
    } catch { setError('Erreur création quiz'); }
  };

  const handleAddQuestion = async () => {
    if (!qText.trim() || !quiz) return;
    try {
      const order = (quiz.questions?.length || 0) + 1;
      const q = await addQuestion(quiz.id, {
        text: qText.trim(),
        order,
        question_type: qType,
        options: qOptions,
        points: qPoints,
      });
      setQuiz(prev => prev ? { ...prev, questions: [...prev.questions, q] } : prev);
      setShowAddQ(false);
      setQText('');
      setQOptions([
        { label: 'A', text: '', is_correct: true },
        { label: 'B', text: '', is_correct: false },
      ]);
    } catch { setError('Erreur ajout question'); }
  };

  const handleDeleteQ = async (qId: string) => {
    if (!quiz || !window.confirm('Supprimer cette question ?')) return;
    try {
      await deleteQuestion(qId);
      setQuiz({ ...quiz, questions: quiz.questions.filter(q => q.id !== qId) });
    } catch { setError('Erreur suppression'); }
  };

  const handleDeleteQuiz = async () => {
    if (!quiz || !window.confirm('Supprimer tout le quiz ?')) return;
    try {
      await deleteQuiz(quiz.id);
      setQuiz(null);
    } catch { setError('Erreur suppression'); }
  };

  const toggleOptionCorrect = (idx: number) => {
    setQOptions(prev => prev.map((o, i) => ({
      ...o,
      is_correct: qType === 'mcq' ? i === idx : !o.is_correct,
    })));
  };

  const addOption = () => {
    const nextLabel = String.fromCharCode(65 + qOptions.length);
    setQOptions(prev => [...prev, { label: nextLabel, text: '', is_correct: false }]);
  };

  if (loading) return <p className="text-sm text-kleia-gray font-body p-3">Chargement du quiz...</p>;

  return (
    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-heading font-bold text-sm text-kleia-dark">Quiz</h4>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fermer l'éditeur de quiz">✕</Button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {!quiz && !showCreate && (
        <div className="text-center">
          <p className="text-xs text-kleia-gray font-body mb-2">Pas encore de quiz pour cette leçon.</p>
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
            + Créer un quiz
          </Button>
        </div>
      )}

      {showCreate && !quiz && (
        <div className="space-y-2">
          <input
            type="text"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            placeholder="Titre du quiz"
            className="w-full px-3 py-1.5 rounded border border-kleia-dark/20 text-sm font-body outline-none focus:border-kleia-violet"
            autoFocus
          />
          <div className="flex items-center gap-2 text-sm font-body">
            <label className="text-kleia-gray">Score minimum :</label>
            <input
              type="number"
              value={passingScore}
              onChange={(e) => setPassingScore(parseInt(e.target.value) || 0)}
              className="w-20 px-2 py-1 rounded border border-kleia-dark/20 text-sm outline-none"
              min={0}
              max={100}
            />
            <span className="text-kleia-gray">%</span>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleCreateQuiz}>Créer</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Annuler</Button>
          </div>
        </div>
      )}

      {quiz && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body font-semibold text-kleia-dark text-sm">{quiz.title}</p>
              <p className="text-xs text-kleia-gray">{quiz.passing_score_percent}% requis · {quiz.questions.length} questions</p>
            </div>
            <Button variant="ghost" size="sm" className="!text-red-400" onClick={handleDeleteQuiz}>
              Supprimer
            </Button>
          </div>

          {quiz.questions.map((q, idx) => (
            <div key={q.id} className="bg-white rounded-lg border border-kleia-dark/10 p-2">
              <div className="flex justify-between items-start">
                <p className="text-xs font-body text-kleia-dark">
                  <span className="font-bold">Q{idx + 1}.</span> {q.text} <span className="text-kleia-gray">({q.points}pt)</span>
                </p>
                <button onClick={() => handleDeleteQ(q.id)} className="text-xs text-red-400 hover:underline ml-2" aria-label="Supprimer la question">✕</button>
              </div>
              <div className="mt-1 space-y-0.5">
                {q.options.map((opt, oi) => (
                  <span key={oi} className={`inline-block text-xs px-2 py-0.5 rounded mr-1 mb-1 ${opt.is_correct ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {opt.label}: {opt.text || '(vide)'}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {showAddQ && (
            <Card className="p-3 border-kleia-violet/30">
              <textarea
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                placeholder="Texte de la question"
                rows={2}
                className="w-full px-3 py-1.5 rounded border border-kleia-dark/20 text-sm font-body outline-none focus:border-kleia-violet resize-y"
              />
              <div className="flex items-center gap-2 mt-2 text-sm">
                <select value={qType} onChange={(e) => setQType(e.target.value)} className="px-2 py-1 rounded border border-kleia-dark/20 bg-white text-xs">
                  <option value="mcq">QCM</option>
                  <option value="single">Choix unique</option>
                  <option value="text">Texte</option>
                </select>
                <label className="text-xs text-kleia-gray">Points :</label>
                <input type="number" value={qPoints} onChange={(e) => setQPoints(parseInt(e.target.value) || 1)} className="w-16 px-2 py-1 rounded border border-kleia-dark/20 text-xs outline-none" min={1} />
              </div>
              {qType !== 'text' && (
                <div className="mt-2 space-y-1">
                  {qOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={opt.is_correct}
                        onChange={() => toggleOptionCorrect(idx)}
                        className="w-4 h-4 accent-kleia-violet"
                      />
                      <span className="text-xs font-bold text-kleia-gray">{opt.label}</span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => setQOptions(prev => prev.map((o, i) => i === idx ? { ...o, text: e.target.value } : o))}
                        placeholder={`Réponse ${opt.label}`}
                        className="flex-1 px-2 py-1 rounded border border-kleia-dark/20 text-xs outline-none focus:border-kleia-violet"
                      />
                    </div>
                  ))}
                  <button onClick={addOption} className="text-xs text-kleia-violet hover:underline">+ Ajouter une réponse</button>
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <Button variant="primary" size="sm" onClick={handleAddQuestion} disabled={!qText.trim()}>Ajouter</Button>
                <Button variant="ghost" size="sm" onClick={() => setShowAddQ(false)}>Annuler</Button>
              </div>
            </Card>
          )}

          {!showAddQ && (
            <Button variant="outline" size="sm" onClick={() => setShowAddQ(true)}>
              + Ajouter une question
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
