
import { motion } from 'framer-motion';

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'markdown' | 'link';
  url?: string;
  content?: string;
}

interface ResourceViewerProps {
  resources: Resource[];
}

export default function ResourceViewer({ resources }: ResourceViewerProps) {
  if (resources.length === 0) return null;

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-xl font-bold font-heading text-kleia-dark flex items-center gap-2">
        <svg className="w-6 h-6 text-kleia-burgundy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        Ressources de la leçon
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((resource) => (
          <motion.div
            key={resource.id}
            whileHover={{ y: -2 }}
            className="glass-dark p-4 flex items-center justify-between group cursor-pointer border-transparent hover:border-kleia-burgundy/20 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                {resource.type === 'pdf' ? (
                  <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z"/></svg>
                ) : (
                  <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                )}
              </div>
              <div>
                <h4 className="font-bold text-kleia-dark text-sm">{resource.title}</h4>
                <p className="text-xs text-kleia-gray">{resource.type.toUpperCase()}</p>
              </div>
            </div>
            
            <a 
              href={resource.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-kleia-burgundy text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
