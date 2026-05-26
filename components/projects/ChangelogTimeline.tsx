import React from 'react';
import { History, Calendar, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

interface ChangelogItem {
  version: string;
  date: string;
  notes: string;
}

interface ChangelogTimelineProps {
  changelog: ChangelogItem[];
}

export default function ChangelogTimeline({ changelog }: ChangelogTimelineProps) {
  if (!changelog || changelog.length === 0) return null;

  // Sort changelogs with newest first
  const sortedChangelog = [...changelog].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
      <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
        <History className="text-brown-700" size={20} />
        <h2 className="text-lg font-bold text-gray-900">Changelog & Updates</h2>
      </div>

      <div className="relative pl-6 border-l-2 border-brown-100 space-y-8 ml-2">
        {sortedChangelog.map((log, idx) => (
          <div key={idx} className="relative group">
            {/* Animated Dot marker */}
            <div className="absolute -left-[31px] top-1.5 bg-white border-2 border-brown-600 rounded-full h-4 w-4 flex items-center justify-center group-hover:scale-125 transition-transform duration-300">
              <div className="bg-brown-600 rounded-full h-1.5 w-1.5" />
            </div>

            {/* Content card */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-brown-700 text-white uppercase tracking-wider">
                  v{log.version}
                </span>
                
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400">
                  <Calendar size={12} />
                  {formatDate(log.date)}
                </span>
              </div>

              {/* Notes block */}
              <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100/80 group-hover:border-brown-100 transition-all duration-300">
                <ul className="space-y-2">
                  {log.notes.split('\n').filter(Boolean).map((note, nIdx) => (
                    <li key={nIdx} className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed">
                      <CheckCircle2 size={14} className="text-brown-500 mt-1 flex-shrink-0" />
                      <span>{note.replace(/^-\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
