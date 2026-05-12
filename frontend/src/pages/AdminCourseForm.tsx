import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { getCourses } from '@/api/courses';
import { createCourse, updateCourse } from '@/api/admin';
import type { Course } from '@/api/courses';

interface FormData {
  title: string;
  slug: string;
  short_description: string;
  description: string;
  level: string;
  category: string;
  duration_seconds: number;
  status: string;
}

const INITIAL_FORM: FormData = {
  title: '',
  slug: '',
  short_description: '',
  description: '',
  level: 'débutant',
  category: '',
  duration_seconds: 3600,
  status: 'draft',
};

const LEVELS = ['débutant', 'intermédiaire', 'avancé'];
const CATEGORIES = ['communication', 'prise de parole', 'développement personnel', 'leadership'];

export default function AdminCourseForm() {
  const { courseId } = useParams<{ courseId: string }>();
  const isEditing = courseId && courseId !== 'new';
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEditing) return;
    (async () => {
      try {
        const data = await getCourses({ limit: 100 });
        const course = data.items.find((c: Course) => c.id === courseId);
        if (course) {
          setForm({
            title: course.title,
            slug: course.slug,
            short_description: course.short_description || '',
            description: course.description || '',
            level: course.level,
            category: course.category || '',
            duration_seconds: course.duration_seconds,
            status: course.status,
          });
        }
      } catch {
        setError('Impossible de charger la formation.');
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, isEditing]);

  const handleChange = (field: keyof FormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Auto-generate slug from title
    if (field === 'title') {
      setForm((prev) => ({
        ...prev,
        title: value as string,
        slug: (value as string)
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .slice(0, 80),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEditing) {
        await updateCourse(courseId!, {
          title: form.title,
          short_description: form.short_description,
          description: form.description,
          level: form.level,
          duration_seconds: form.duration_seconds,
          status: form.status,
          category: form.category,
        });
      } else {
        await createCourse(form);
      }
      navigate('/admin/courses');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading className="py-20" text="Chargement..." />;

  return (
    <div className="max-w-2xl mx-auto space-y-6" role="region" aria-label="Formulaire formation">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/courses')}
          className="text-sm text-kleia-gray hover:text-kleia-burgundy transition-colors"
          aria-label="Retour à la liste"
        >
          ← Retour
        </button>
        <h1 className="text-2xl font-extrabold font-heading text-kleia-dark">
          {isEditing ? 'Modifier la formation' : 'Créer une formation'}
        </h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-kleia text-red-700 text-sm" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Card>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-kleia-dark font-body mb-1">
                Titre *
              </label>
              <input
                id="title"
                type="text"
                required
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-burgundy focus:ring-2 focus:ring-kleia-burgundy/20 outline-none transition-all font-body"
                placeholder="Ex: L'Architecture du Message"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-kleia-dark font-body mb-1">
                Slug
              </label>
              <input
                id="slug"
                type="text"
                value={form.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-burgundy focus:ring-2 focus:ring-kleia-burgundy/20 outline-none transition-all font-body text-sm text-kleia-gray"
              />
              <p className="text-xs text-kleia-gray/60 mt-1 font-body">Utilisé dans l'URL : /formation/{form.slug || '...'}</p>
            </div>

            <div>
              <label htmlFor="short_description" className="block text-sm font-medium text-kleia-dark font-body mb-1">
                Description courte
              </label>
              <input
                id="short_description"
                type="text"
                value={form.short_description}
                onChange={(e) => handleChange('short_description', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-burgundy focus:ring-2 focus:ring-kleia-burgundy/20 outline-none transition-all font-body"
                placeholder="Brève description (carte)"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-kleia-dark font-body mb-1">
                Description complète
              </label>
              <textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-burgundy focus:ring-2 focus:ring-kleia-burgundy/20 outline-none transition-all font-body resize-y"
                placeholder="Description détaillée de la formation..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-kleia-dark font-body mb-1">
                  Niveau
                </label>
                <select
                  id="level"
                  value={form.level}
                  onChange={(e) => handleChange('level', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-burgundy focus:ring-2 focus:ring-kleia-burgundy/20 outline-none transition-all font-body bg-white"
                >
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-kleia-dark font-body mb-1">
                  Catégorie
                </label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-burgundy focus:ring-2 focus:ring-kleia-burgundy/20 outline-none transition-all font-body bg-white"
                >
                  <option value="">—</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-kleia-dark font-body mb-1">
                  Durée (secondes)
                </label>
                <input
                  id="duration"
                  type="number"
                  min={0}
                  value={form.duration_seconds}
                  onChange={(e) => handleChange('duration_seconds', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-burgundy focus:ring-2 focus:ring-kleia-burgundy/20 outline-none transition-all font-body"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-kleia-dark font-body mb-1">
                  Statut
                </label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-burgundy focus:ring-2 focus:ring-kleia-burgundy/20 outline-none transition-all font-body bg-white"
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" type="button" onClick={() => navigate('/admin/courses')}>
            Annuler
          </Button>
          <Button variant="primary" type="submit" disabled={saving || !form.title}>
            {saving ? 'Enregistrement...' : isEditing ? 'Enregistrer' : 'Créer la formation'}
          </Button>
        </div>
      </form>
    </div>
  );
}
