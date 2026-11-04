import React from 'react';
import { StudyKit } from '../types.ts';
import { X, Trash2, BookOpen, Clock, Zap, ArrowRight } from 'lucide-react';

interface SavedKitsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedKits: StudyKit[];
  onSelectKit: (kit: StudyKit) => void;
  onDeleteKit: (id: string, e: React.MouseEvent) => void;
}

export const SavedKitsDrawer: React.FC<SavedKitsDrawerProps> = ({
  isOpen,
  onClose,
  savedKits,
  onSelectKit,
  onDeleteKit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Saved Study Kits</h3>
              <p className="text-xs text-slate-500">
                {savedKits.length} study kit{savedKits.length === 1 ? '' : 's'} stored locally
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-4 overflow-y-auto flex-1 space-y-3">
            {savedKits.length === 0 ? (
              <div className="text-center py-12 px-4 text-slate-400">
                <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">No saved study kits yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Upload study materials to generate and automatically save study kits.
                </p>
              </div>
            ) : (
              savedKits.map((kit) => (
                <div
                  key={kit.id}
                  onClick={() => {
                    onSelectKit(kit);
                    onClose();
                  }}
                  className="group p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {kit.subjectCategory || 'General Study'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${
                          kit.difficulty === 'easy'
                            ? 'bg-emerald-50 text-emerald-700'
                            : kit.difficulty === 'hard'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {kit.difficulty}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {kit.title}
                    </h4>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2">
                      <span>{kit.concepts?.length || 0} Concepts</span>
                      <span>•</span>
                      <span>{kit.flashcards?.length || 0} Flashcards</span>
                      <span>•</span>
                      <span>3 Questions</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(kit.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => onDeleteKit(kit.id, e)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Delete study kit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-indigo-600 font-semibold flex items-center gap-0.5">
                        Open <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
