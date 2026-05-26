import React from 'react';
import { Cpu, Terminal, Sparkles } from 'lucide-react';

interface TechStackProps {
  technologies: string[];
}

export default function TechStack({ technologies }: TechStackProps) {
  // Map popular technologies to beautiful color schemes
  const getColorScheme = (tech: string) => {
    const t = tech.toLowerCase();
    if (t.includes('react')) return 'bg-sky-50 text-sky-800 border-sky-100 hover:bg-sky-100';
    if (t.includes('next')) return 'bg-zinc-50 text-zinc-950 border-zinc-200 hover:bg-zinc-100';
    if (t.includes('tailwind')) return 'bg-teal-50 text-teal-800 border-teal-100 hover:bg-teal-100';
    if (t.includes('typescript') || t.includes('ts')) return 'bg-blue-50 text-blue-800 border-blue-100 hover:bg-blue-100';
    if (t.includes('javascript') || t.includes('js')) return 'bg-amber-50 text-amber-800 border-amber-100 hover:bg-amber-100';
    if (t.includes('redux')) return 'bg-violet-50 text-violet-800 border-violet-100 hover:bg-violet-100';
    if (t.includes('node')) return 'bg-emerald-50 text-emerald-800 border-emerald-100 hover:bg-emerald-100';
    if (t.includes('mongo')) return 'bg-green-50 text-green-800 border-green-100 hover:bg-green-100';
    if (t.includes('python')) return 'bg-yellow-50 text-yellow-800 border-yellow-100 hover:bg-yellow-100';
    if (t.includes('docker')) return 'bg-cyan-50 text-cyan-800 border-cyan-100 hover:bg-cyan-100';
    if (t.includes('graphql')) return 'bg-pink-50 text-pink-800 border-pink-100 hover:bg-pink-100';
    return 'bg-brown-50/50 text-brown-800 border-brown-100 hover:bg-brown-100/50';
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
        <Cpu className="text-brown-700" size={20} />
        <h2 className="text-lg font-bold text-gray-900">Technologies Used</h2>
      </div>
      
      <div className="flex flex-wrap gap-2.5">
        {technologies.map((tech) => {
          const colors = getColorScheme(tech);
          return (
            <span
              key={tech}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-300 hover:scale-[1.03] select-none ${colors}`}
            >
              <Terminal size={12} />
              {tech}
            </span>
          );
        })}
      </div>
    </div>
  );
}
