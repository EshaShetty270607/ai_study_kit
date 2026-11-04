import React, { useState } from 'react';
import { StudyKit } from '../types.ts';
import { KeyConceptsView } from './KeyConceptsView.tsx';
import { PracticeQuestionsView } from './PracticeQuestionsView.tsx';
import { FlashcardSetView } from './FlashcardSetView.tsx';
import { RawLayoutModal } from './RawLayoutModal.tsx';
import {
  BookOpen,
  Printer,
  FileCode,
  Download,
  Share2,
  Check,
  ArrowLeft,
  Sparkles,
  Layers,
  HelpCircle,
  Zap,
} from 'lucide-react';

interface StudyKitViewProps {
  kit: StudyKit;
  onBackToInput: () => void;
}

export const StudyKitView: React.FC<StudyKitViewProps> = ({ kit, onBackToInput }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'concepts' | 'questions' | 'flashcards'>('all');
  const [isRawModalOpen, setIsRawModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(kit, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${kit.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_kit.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const difficultyColors = {
    easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    hard: 'bg-rose-50 text-rose-700 border-rose-200',
  }[kit.difficulty] || 'bg-slate-100 text-slate-700';

  return (
    <div className="space-y-6">
      {/* Kit Title & Quick Toolbar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <button
                onClick={onBackToInput}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors mr-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Upload New Material
              </button>
              {kit.subjectCategory && (
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                  {kit.subjectCategory}
                </span>
              )}
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${difficultyColors}`}>
                {kit.difficulty} Exam Level
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {kit.title}
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsRawModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors shadow-xs"
              title="View exact tutor layout (Markdown &amp; JSON)"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-600" />
              <span>Raw Layout</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-xs"
              title="Download Study Kit as JSON"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-xs"
              title="Print study guide"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 pt-5 mt-5 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Full Kit View
          </button>

          <button
            onClick={() => setActiveTab('concepts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'concepts'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            1. Key Concepts ({kit.concepts.length})
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'questions'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            2. Practice Questions (3)
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'flashcards'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            3. Flashcards ({kit.flashcards.length})
          </button>
        </div>
      </div>

      {/* Main Sections */}
      {(activeTab === 'all' || activeTab === 'concepts') && (
        <section id="section-concepts">
          <KeyConceptsView concepts={kit.concepts} />
        </section>
      )}

      {(activeTab === 'all' || activeTab === 'questions') && (
        <section id="section-questions">
          <PracticeQuestionsView questions={kit.practiceQuestions} />
        </section>
      )}

      {(activeTab === 'all' || activeTab === 'flashcards') && (
        <section id="section-flashcards">
          <FlashcardSetView flashcards={kit.flashcards} />
        </section>
      )}

      {/* Modal for Raw Markdown/JSON Layout */}
      <RawLayoutModal
        isOpen={isRawModalOpen}
        onClose={() => setIsRawModalOpen(false)}
        rawMarkdown={kit.rawMarkdown}
        title={kit.title}
      />
    </div>
  );
};
