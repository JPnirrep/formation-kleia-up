import { useRef } from 'react';
import type { Module as ModuleType } from '@/api/courses';

interface LessonLocal {
  id: string;
  title: string;
  order: number;
  lesson_type: string;
  duration_seconds: number;
}

export interface CourseTreeData {
  id: string;
  title: string;
  modules: ModuleType[];
  selectedLessonId: string | null;
}

interface Props {
  course: CourseTreeData;
  onSelectLesson: (lessonId: string | null) => void;
  onAddModule: () => void;
  onAddLesson: (moduleId: string) => void;
  onDeleteModule: (moduleId: string) => void;
  onDeleteLesson: (lessonId: string) => void;
  onMoveModule: (modIdx: number, dir: 1 | -1) => void;
  onMoveLesson: (modIdx: number, lesIdx: number, dir: 1 | -1) => void;
  onTitleChange: (title: string) => void;
  expandedModule: string | null;
  onToggleModule: (modId: string) => void;
}

const typeIcons: Record<string, string> = { video: '▶', quiz: '✎', text: '📝', certificate: '★' };

export default function AdminCourseTree({
  course, onSelectLesson, onAddModule, onAddLesson,
  onDeleteModule, onDeleteLesson, onMoveModule, onMoveLesson,
  onTitleChange, expandedModule, onToggleModule,
}: Props) {
  const titleRef = useRef<HTMLInputElement>(null);

  return (
    <aside className="w-72 shrink-0 border-r border-kleia-dark/10 bg-white/50 overflow-y-auto h-full" role="tree" aria-label="Arborescence de la formation">
      <div className="p-4 border-b border-kleia-dark/10 space-y-3">
        <input
          ref={titleRef}
          type="text"
          value={course.title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-kleia-dark/20 focus:border-kleia-burgundy focus:ring-2 focus:ring-kleia-burgundy/20 outline-none font-heading font-bold text-sm"
          placeholder="Titre de la formation"
          aria-label="Titre de la formation"
        />
        <button
          onClick={onAddModule}
          className="w-full py-2 text-sm font-heading font-semibold text-kleia-burgundy border border-dashed border-kleia-burgundy/30 rounded-lg hover:bg-kleia-burgundy/5 transition-colors"
        >
          + Ajouter un module
        </button>
      </div>

      {course.modules.length === 0 ? (
        <p className="p-4 text-sm text-kleia-gray font-body text-center">
          Aucun module. Créez le premier module pour structurer votre formation.
        </p>
      ) : (
        <div className="py-2">
          {course.modules.map((mod: any, mi: number) => {
            const lessons: LessonLocal[] = mod.lessons || [];
            const isExpanded = expandedModule === mod.id;
            return (
              <div key={mod.id}>
                <div
                  className="flex items-center gap-1 px-3 py-2 hover:bg-kleia-dark/5 cursor-pointer group"
                  onClick={() => onToggleModule(mod.id)}
                  role="treeitem"
                  aria-expanded={isExpanded}
                >
                  <div className="flex flex-col mr-1">
                    <button onClick={(e) => { e.stopPropagation(); onMoveModule(mi, -1); }} disabled={mi === 0} className="text-xs text-kleia-gray hover:text-kleia-burgundy disabled:opacity-20 leading-none" aria-label="Remonter">▲</button>
                    <button onClick={(e) => { e.stopPropagation(); onMoveModule(mi, 1); }} disabled={mi >= course.modules.length - 1} className="text-xs text-kleia-gray hover:text-kleia-burgundy disabled:opacity-20 leading-none" aria-label="Descendre">▼</button>
                  </div>
                  <span className="text-xs text-kleia-gray">{isExpanded ? '▼' : '▶'}</span>
                  <span className="text-sm font-heading font-bold text-kleia-dark truncate flex-1">{mod.title}</span>
                  <span className="text-xs text-kleia-gray/60">{lessons.length}</span>
                  <button onClick={(e) => { e.stopPropagation(); if (confirm('Supprimer ce module et ses leçons ?')) onDeleteModule(mod.id); }} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-xs">✕</button>
                </div>

                {isExpanded && (
                  <div className="ml-6 border-l border-kleia-dark/10 pl-2">
                    {lessons.map((lesson: LessonLocal, li: number) => {
                      const icon = typeIcons[lesson.lesson_type] || '•';
                      const isSelected = course.selectedLessonId === lesson.id;
                      return (
                        <div
                          key={lesson.id}
                          className={`flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer text-sm group ${
                            isSelected ? 'bg-kleia-burgundy/10 text-kleia-burgundy font-medium' : 'hover:bg-kleia-dark/5 text-kleia-dark'
                          }`}
                          onClick={() => onSelectLesson(lesson.id)}
                          role="treeitem"
                          aria-selected={isSelected}
                        >
                          <div className="flex flex-col mr-1">
                            <button onClick={(e) => { e.stopPropagation(); onMoveLesson(mi, li, -1); }} disabled={li === 0} className="text-xs text-kleia-gray hover:text-kleia-burgundy disabled:opacity-20 leading-none" aria-label="Remonter">▲</button>
                            <button onClick={(e) => { e.stopPropagation(); onMoveLesson(mi, li, 1); }} disabled={li >= lessons.length - 1} className="text-xs text-kleia-gray hover:text-kleia-burgundy disabled:opacity-20 leading-none" aria-label="Descendre">▼</button>
                          </div>
                          <span className="text-xs w-4 text-center">{icon}</span>
                          <span className="flex-1 truncate font-body">{lesson.title}</span>
                          <span className="text-xs text-kleia-gray/60">{Math.round(lesson.duration_seconds / 60)}m</span>
                          <button onClick={(e) => { e.stopPropagation(); if (confirm('Supprimer cette leçon ?')) onDeleteLesson(lesson.id); }} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-xs" aria-label={`Supprimer ${lesson.title}`}>✕</button>
                        </div>
                      );
                    })}
                    <button
                      onClick={(e) => { e.stopPropagation(); onAddLesson(mod.id); }}
                      className="w-full mt-1 py-1 text-xs text-kleia-burgundy border border-dashed border-kleia-burgundy/20 rounded hover:bg-kleia-burgundy/5 transition-colors"
                    >
                      + Leçon
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
