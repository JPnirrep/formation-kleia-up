import { useState, useEffect, useCallback } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { BookOpen, Share2, Save, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import { 
  getJournalEntries, 
  createJournalEntry, 
  updateJournalEntry, 
  type JournalEntry 
} from '@/api/journal';

interface JournalEditorProps {
  lessonId: string;
}

export default function JournalEditor({ lessonId }: JournalEditorProps) {
  const [content, setContent] = useState<string>('');
  const [isShared, setIsShared] = useState<boolean>(false);
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Load existing entry
  useEffect(() => {
    let active = true;
    const fetchEntry = async () => {
      try {
        setLoading(true);
        const res = await getJournalEntries({ lesson_id: lessonId, limit: 1 });
        if (active && res.items.length > 0) {
          setEntry(res.items[0]);
          setContent(res.items[0].content);
          setIsShared(res.items[0].is_shared);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des notes du journal:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchEntry();
    return () => { active = false; };
  }, [lessonId]);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      setSavedSuccess(false);
      if (entry) {
        const updated = await updateJournalEntry(entry.id, {
          content,
          is_shared: isShared
        });
        setEntry(updated);
      } else {
        const created = await createJournalEntry({
          lesson_id: lessonId,
          content,
          is_shared: isShared
        });
        setEntry(created);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde du journal:", err);
    } finally {
      setSaving(false);
    }
  }, [entry, content, isShared, lessonId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-kleia-dark/10 rounded w-1/3"></div>
        <div className="h-32 bg-kleia-dark/5 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-kleia border border-kleia-dark/10 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-kleia-dark/10 flex items-center justify-between bg-kleia-cream/50">
        <div className="flex items-center gap-2 text-kleia-dark font-heading font-bold">
          <BookOpen className="w-5 h-5 text-kleia-burgundy" />
          Second Cerveau
        </div>
        
        <label className="flex items-center gap-2 cursor-pointer group">
          <span className="text-xs font-body text-kleia-gray group-hover:text-kleia-dark transition-colors">
            Partager avec le coach
          </span>
          <div className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={isShared}
              onChange={(e) => setIsShared(e.target.checked)}
            />
            <div className="w-9 h-5 bg-kleia-gray/30 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-kleia-gold rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-kleia-burgundy"></div>
          </div>
          <Share2 className={`w-4 h-4 transition-colors ${isShared ? 'text-kleia-burgundy' : 'text-kleia-gray'}`} />
        </label>
      </div>

      <div className="p-4 flex-1 flex flex-col" data-color-mode="light">
        <MDEditor
          value={content}
          onChange={(val) => setContent(val || '')}
          height={300}
          preview="edit"
          className="flex-1 !border-kleia-dark/10 !rounded-lg overflow-hidden font-body"
          textareaProps={{
            placeholder: "Prenez vos notes ici... Ce contenu est votre second cerveau.",
          }}
        />
        
        <div className="mt-4 flex justify-end">
          <Button 
            onClick={handleSave} 
            loading={saving}
            variant={savedSuccess ? 'secondary' : 'primary'}
            size="sm"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" /> Sauvegardé
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Enregistrer
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
