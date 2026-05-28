import { useState, useEffect, useCallback } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { BookOpen, Share2, Save, Check, Plus, Trash2, Edit3 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import { useApi } from '@/hooks/useApi';
import {
  getJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  type JournalEntry,
} from '@/api/journal';

export default function JournalPage() {
  useEffect(() => { document.title = 'Journal — Kleia-up'; }, []);
  const { data, loading, error, refetch } = useApi(() => getJournalEntries({ limit: 100 }), []);
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [content, setContent] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const entries: JournalEntry[] = data || [];

  const resetForm = () => {
    setEditing(null);
    setContent('');
    setIsShared(false);
    setShowNew(false);
  };

  const handleEdit = useCallback((entry: JournalEntry) => {
    setEditing(entry);
    setContent(entry.content);
    setIsShared(entry.is_shared);
    setShowNew(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!content.trim()) return;
    setSaving(true);
    setSavedSuccess(false);
    try {
      if (editing) {
        await updateJournalEntry(editing.id, { content, is_shared: isShared });
      } else {
        await createJournalEntry({ content, is_shared: isShared });
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      resetForm();
      refetch();
    } catch (err) {
      console.error('Erreur sauvegarde journal:', err);
    } finally {
      setSaving(false);
    }
  }, [content, isShared, editing, refetch]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Supprimer cette entrée de journal ?')) return;
    try {
      await deleteJournalEntry(id);
      refetch();
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  }, [refetch]);

  if (loading) return <Loading className="py-20" text="Chargement du journal..." />;

  if (error) {
    return (
      <Card className="text-center py-12">
        <p className="text-kleia-gray font-body text-lg">
          Connectez-vous pour accéder à votre journal.
        </p>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-kleia-violet">
            Second Cerveau
          </h1>
          <p className="text-kleia-gray font-body mt-1">
            Vos notes, réflexions et apprentissages.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => { resetForm(); setShowNew(true); }}
        >
          <Plus className="w-4 h-4" /> Nouvelle note
        </Button>
      </div>

      {showNew && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-kleia-dark/10 flex items-center justify-between bg-kleia-cream/50">
            <div className="flex items-center gap-2 text-kleia-dark font-heading font-bold">
              <BookOpen className="w-5 h-5 text-kleia-violet" />
              {editing ? 'Modifier la note' : 'Nouvelle note'}
            </div>
            <label className="flex items-center gap-2 cursor-pointer" aria-label="Partager avec le coach">
              <span className="text-xs font-body text-kleia-gray">Partager avec le coach</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isShared}
                  onChange={(e) => setIsShared(e.target.checked)}
                />
                <div className="w-9 h-5 bg-kleia-gray/30 rounded-full peer peer-checked:bg-kleia-violet after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
              </div>
              <Share2 className={`w-4 h-4 ${isShared ? 'text-kleia-violet' : 'text-kleia-gray'}`} />
            </label>
          </div>
          <div className="p-4" data-color-mode="light">
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || '')}
              height={250}
              preview="edit"
              textareaProps={{ placeholder: 'Écrivez vos réflexions ici...' }}
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={resetForm}>Annuler</Button>
              <Button
                variant={savedSuccess ? 'secondary' : 'primary'}
                size="sm"
                onClick={handleSave}
                loading={saving}
              >
                {savedSuccess ? <><Check className="w-4 h-4" /> Sauvegardé</> : <><Save className="w-4 h-4" /> Enregistrer</>}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {entries.length === 0 && !showNew ? (
        <EmptyState
          title="Aucune note"
          description="Créez votre première note pour commencer votre second cerveau."
          icon="empty"
          actionLabel="Nouvelle note"
          onAction={() => setShowNew(true)}
        />
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-kleia-violet" />
                    <span className="text-xs text-kleia-gray font-body">
                      {new Date(entry.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    {entry.is_shared && (
                      <span className="text-xs bg-kleia-gold/10 text-kleia-gold px-2 py-0.5 rounded-full font-body">
                        Partagé
                      </span>
                    )}
                    {entry.lesson_id && (
                      <span className="text-xs bg-kleia-violet/5 text-kleia-violet px-2 py-0.5 rounded-full font-body">
                        Lié à une leçon
                      </span>
                    )}
                  </div>
                  <div className="prose prose-sm max-w-none text-kleia-dark font-body line-clamp-4" data-color-mode="light">
                    <MDEditor.Markdown source={entry.content} />
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="p-2 rounded-lg hover:bg-kleia-dark/5 text-kleia-gray hover:text-kleia-violet transition-colors"
                    aria-label="Modifier la note"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-kleia-gray hover:text-red-500 transition-colors"
                    aria-label="Supprimer la note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
