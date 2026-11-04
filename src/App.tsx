import React, { useState, useEffect } from 'react';
import { StudyKit, Difficulty } from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { UploadSection } from './components/UploadSection.tsx';
import { StudyKitView } from './components/StudyKitView.tsx';
import { SavedKitsDrawer } from './components/SavedKitsDrawer.tsx';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  Layers,
  HelpCircle,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';

const STORAGE_KEY = 'academiakit_saved_kits_v1';

export default function App() {
  const [currentKit, setCurrentKit] = useState<StudyKit | null>(null);
  const [savedKits, setSavedKits] = useState<StudyKit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load saved kits from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedKits(parsed);
          // Auto-load most recent kit if available
          if (parsed.length > 0 && !currentKit) {
            setCurrentKit(parsed[0]);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load saved kits from localStorage:', e);
    }
  }, []);

  // Save to localStorage when savedKits changes
  const updateSavedKits = (newKits: StudyKit[]) => {
    setSavedKits(newKits);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newKits));
    } catch (e) {
      console.warn('LocalStorage full or unavailable:', e);
    }
  };

  const handleGenerate = async (payload: {
    text: string;
    images: Array<{ mimeType: string; data: string; name?: string }>;
    difficulty: Difficulty;
  }) => {
    setIsLoading(true);
    setLoadingStep('Uploading & analyzing study materials...');

    try {
      setLoadingStep('Extracting key concepts & summaries...');
      const response = await fetch('/api/generate-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate study kit from source material.');
      }

      const generatedData = result.data;

      const newKit: StudyKit = {
        id: Math.random().toString(36).substring(2, 9),
        createdAt: Date.now(),
        title: generatedData.title || 'Study Material Kit',
        subjectCategory: generatedData.subjectCategory || 'Academic Prep',
        difficulty: payload.difficulty,
        rawMarkdown: generatedData.rawMarkdown,
        concepts: generatedData.concepts || [],
        practiceQuestions: generatedData.practiceQuestions,
        flashcards: generatedData.flashcards || [],
        sourceSummary: payload.text ? payload.text.slice(0, 160) + '...' : `${payload.images.length} document image(s)`,
      };

      setCurrentKit(newKit);

      // Add to saved history
      const updated = [newKit, ...savedKits.filter((k) => k.id !== newKit.id)].slice(0, 25);
      updateSavedKits(updated);

      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleDeleteKit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedKits.filter((k) => k.id !== id);
    updateSavedKits(updated);
    if (currentKit?.id === id) {
      setCurrentKit(updated.length > 0 ? updated[0] : null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation */}
      <Navbar
        onNewKit={() => {
          setCurrentKit(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={savedKits.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* View Mode: Study Kit View OR Material Upload Form */}
        {currentKit && !isLoading ? (
          <StudyKitView
            kit={currentKit}
            onBackToInput={() => setCurrentKit(null)}
          />
        ) : (
          <div className="space-y-8">
            {/* Hero / Value Proposition Banner */}
            <div className="text-center max-w-2xl mx-auto space-y-2 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Actionable Exam Preparation
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Transform Raw Study Material into a Master Study Kit
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                Paste notes, lecture transcripts, or upload document photos. AcademiaKit extracts core concepts, creates strict exam questions (MCQ, Short Answer, Application), and generates 3D flashcards.
              </p>
            </div>

            {/* Input Form with Loading & Progress */}
            <div className="max-w-3xl mx-auto">
              <UploadSection
                onGenerate={handleGenerate}
                isLoading={isLoading}
                loadingStep={loadingStep}
              />
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto pt-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">1. Key Concepts</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    3–5 core concepts explained in 2–3 concise sentences with plain language and exam focus.
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">2. Practice Exam Questions</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Interactive MCQ with explanations, Short Answer with sample answers, and Conceptual Application to real scenarios.
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">3. Interactive Flashcards</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    5–10 high-impact flashcards in a 3D flip deck with shuffle, mastery tracking, and JSON export.
                  </p>
                </div>
              </div>
            </div>

            {/* Strict Academic Constraints Guarantee Callout */}
            <div className="max-w-3xl mx-auto p-4 rounded-xl bg-slate-100/80 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Strict Anti-Hallucination:</strong> Questions and flashcards are derived strictly from your uploaded material with zero external internet references.
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Saved Kits Drawer */}
      <SavedKitsDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedKits={savedKits}
        onSelectKit={(kit) => setCurrentKit(kit)}
        onDeleteKit={handleDeleteKit}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 bg-white">
        <p>AcademiaKit • Academic Exam Preparation Assistant</p>
      </footer>
    </div>
  );
}
