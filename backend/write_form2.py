target = r"C:\Users\JP\Documents\GitHub\formation-kleia-up\frontend\src\pages\AdminCourseForm.tsx"

content = """import { useEffect, useState } from 'react';
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
  level: 'd\u00e9butant',
  category: '',
  duration_seconds: 3600,
  status: 'draft',
};

const LEVELS = ['d\u00e9butant', 'interm\u00e9diaire', 'avanc\u00e9'];
const CATEGORIES = ['communication', 'prise de parole', 'd\u00e9veloppement personnel', 'leadership'];

function makeSlug(title: string): string {
  return title.toLowerCase().replace(/[^\\w\\s-]/g, '').replace(/\\s+/g, '-').replace(/-+/g, '-').slice(0, 80);
}

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
            title: course.title, slug: course.slug,
            short_description: course.short_description || '',
            description: course.description || '',
            level: course.level, category: course.category || '',
            duration_seconds: course.duration_seconds, status: course.status,
          });
        }
      } catch { setError('Impossible de charger la formation.'); }
      finally { setLoading(false); }
    })();
  }, [courseId, isEditing]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      slug: field === 'title' ? makeSlug(value) : prev.slug,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (isEditing) {
        await updateCourse(courseId, {
          title: form.title, short_description: form.short_description,
          description: form.description, level: form.level,
          duration_seconds: form.duration_seconds, status: form.status, category: form.category,
        });
        navigate('/admin/courses');
      } else {
        const created = await createCourse({ ...form, slug: form.slug || makeSlug(form.title) });
        navigate(\\\`/admin/courses/\\\${created.slug}\\\`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.');
    } finally { setSaving(false); }
  };

  if (loading) return <Loading className="py-20" text="Chargement..." />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/courses')} className="text-sm text-kleia-gray hover:text-kleia-burgundy transition-colors">{'\\u2190'} Retour</button>
        <h1 className="text-2xl font-extrabold font-heading text-kleia-dark">{isEditing ? 'Modifier la formation' : 'Cr\u00e9er une formation'}</h1>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-kleia text-red-700 text-sm" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Card><div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-kleia-dark font-body mb-1">Titre *</label>
            <input id="title" type="text" required value={form.title} onChange={(e) => handleChange('title', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-burgundy focus:ring-2 focus:ring-kleia-burgundy/20 outline-none font-body" placeholder="Ex: L'Architecture du Message" />
          </div>
          <div>
            <label htmlFor="short_description" className="block text-sm font-medium text-kleia-dark font-body mb-1">Description courte</label>
            <input id="short_description" type="text" value={form.short_description} onChange={(e) => handleChange('short_description', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-burgundy focus:ring-2 focus:ring-kleia-burgundy/20 outline-none font-body" placeholder="Br\u00e8ve description" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-kleia-dark font-body mb-1">Description compl\u00e8te</label>
            <textarea id="description" rows={4} value={form.description} onChange={(e) => handleChange('description', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-burgundy focus:ring-2 focus:ring-kleia-burgundy/20 outline-none font-body resize-y" placeholder="Description d\u00e9taill\u00e9e..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-kleia-dark font-body mb-1">Niveau</label>
              <select id="level" value={form.level} onChange={(e) => handleChange('level', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-burgundy focus:ring-2 focus:ring-kleia-burgundy/20 outline-none font-body bg-white">
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-kleia-dark font-body mb-1">Cat\u00e9gorie</label>
              <select id="category" value={form.category} onChange={(e) => handleChange('category', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-burgundy focus:ring-2 focus:ring-kleia-burgundy/20 outline-none font-body bg-white">
                <option value="">\u2014</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-kleia-dark font-body mb-1">Dur\u00e9e (secondes)</label>
              <input id="duration" type="number" min={0} value={form.duration_seconds} onChange={(e) => handleChange('duration_seconds', parseInt(e.target.value) || 0)} className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-burgundy focus:ring-2 focus:ring-kleia-burgundy/20 outline-none font-body" />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-kleia-dark font-body mb-1">Statut</label>
              <select id="status" value={form.status} onChange={(e) => handleChange('status', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-burgundy focus:ring-2 focus:ring-kleia-burgundy/20 outline-none font-body bg-white">
                <option value="draft">Brouillon</option>
                <option value="published">Publi\u00e9</option>
              </select>
            </div>
          </div>
        </div></Card>

        {!isEditing && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-kleia text-sm text-kleia-gray">
            <p className="font-medium text-kleia-dark mb-1">Prochaine \u00e9tape</p>
            <p>Apr\u00e8s la cr\u00e9ation, vous pourrez ajouter :</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>Des <strong>modules</strong> et <strong>le\u00e7ons</strong></li>
              <li>Des <strong>vid\u00e9os YouTube</strong> (lien URL)</li>
              <li>Des <strong>documents PDF</strong> \u00e0 t\u00e9l\u00e9charger</li>
              <li>Des <strong>quiz</strong> pour valider les acquis</li>
            </ul>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" type="button" onClick={() => navigate('/admin/courses')}>Annuler</Button>
          <Button variant="primary" type="submit" disabled={saving || !form.title}>{saving ? 'Enregistrement...' : isEditing ? 'Enregistrer' : 'Cr\u00e9er la formation'}</Button>
        </div>
      </form>
    </div>
  );
}
"""

with open(target, "w", encoding="utf-8") as f:
    f.write(content)
print("Written")
