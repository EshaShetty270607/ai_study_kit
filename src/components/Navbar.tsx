import React from 'react';
import { BookOpen, Sparkles, History, PlusCircle, GraduationCap } from 'lucide-react';

interface NavbarProps {
  onNewKit: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewKit,
  onOpenHistory,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNewKit}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">AcademiaKit</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                Exam Prep AI
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Turn raw study material &amp; notes into structured exam kits
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Saved Study Kits"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Saved Kits</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={onNewKit}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Study Kit</span>
          </button>
        </div>
      </div>
    </header>
  );
};
