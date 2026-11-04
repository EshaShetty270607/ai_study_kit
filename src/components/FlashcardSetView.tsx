import React, { useState, useEffect } from 'react';
import { Flashcard } from '../types.ts';
import {
  Layers,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Check,
  BookmarkCheck,
  Bookmark,
  Grid,
  Copy,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface FlashcardSetViewProps {
  flashcards: Flashcard[];
}

export const FlashcardSetView: React.FC<FlashcardSetViewProps> = ({ flashcards }) => {
  const [cards, setCards] = useState<Flashcard[]>(flashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<'deck' | 'grid'>('deck');
  const [masteredIndices, setMasteredIndices] = useState<Set<number>>(new Set());
  const [copiedJSON, setCopiedJSON] = useState(false);

  useEffect(() => {
    setCards(flashcards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredIndices(new Set());
  }, [flashcards]);

  const currentCard = cards[currentIndex] || cards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredIndices(new Set());
  };

  const toggleMastered = (idx: number) => {
    setMasteredIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleCopyJSON = () => {
    const jsonStr = JSON.stringify(flashcards, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedJSON(true);
    setTimeout(() => setCopiedJSON(false), 2000);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'deck') return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, cards.length]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Interactive Flashcard Set
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Key terms and questions formatted as an interactive 3D study deck ({cards.length} cards, between 5–10).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Deck vs Grid view toggle */}
          <div className="p-0.5 rounded-lg bg-slate-100 border border-slate-200 flex items-center text-xs">
            <button
              onClick={() => setViewMode('deck')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'deck' ? 'bg-white shadow-xs text-indigo-700 font-bold' : 'text-slate-600'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Deck
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-indigo-700 font-bold' : 'text-slate-600'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              All ({cards.length})
            </button>
          </div>

          <button
            onClick={handleCopyJSON}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
            title="Copy flashcards in JSON format"
          >
            {copiedJSON ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>JSON</span>
          </button>
        </div>
      </div>

      {viewMode === 'deck' && currentCard ? (
        <div className="max-w-xl mx-auto space-y-4">
          {/* Progress / Status Header */}
          <div className="flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">
                Card {currentIndex + 1} of {cards.length}
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-medium">
                {masteredIndices.size} mastered
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleShuffle}
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-indigo-600 font-medium transition-colors"
                title="Shuffle Cards"
              >
                <Shuffle className="w-3 h-3" />
                Shuffle
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            />
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="group relative h-64 sm:h-72 w-full cursor-pointer select-none perspective-[1000px]"
            title="Click or press Spacebar to flip card"
          >
            <div
              className={`w-full h-full duration-500 transform-style-preserve-3d transition-transform rounded-2xl shadow-sm border border-slate-200 relative ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* FRONT OF CARD */}
              <div
                className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-white to-slate-50/70 p-6 sm:p-8 flex flex-col justify-between backface-hidden border-2 border-transparent group-hover:border-indigo-200 transition-all shadow-xs"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">
                    Term / Question
                  </span>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" />
                    Click to flip
                  </span>
                </div>

                <div className="my-auto text-center py-4">
                  <h4 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                    {currentCard.front}
                  </h4>
                </div>

                <div className="text-center">
                  <span className="text-[11px] text-slate-400">
                    Press Spacebar or Click anywhere to reveal definition
                  </span>
                </div>
              </div>

              {/* BACK OF CARD */}
              <div
                className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 p-6 sm:p-8 flex flex-col justify-between backface-hidden shadow-xs border border-indigo-200"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md">
                    Definition / Answer
                  </span>
                  <span className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" />
                    Click to flip back
                  </span>
                </div>

                <div className="my-auto text-center py-2 px-1 overflow-y-auto max-h-40">
                  <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed">
                    {currentCard.back}
                  </p>
                </div>

                <div className="text-center">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Term: <strong>{currentCard.front}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls: Prev, Mastery, Next */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={handlePrev}
              className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => toggleMastered(currentIndex)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                masteredIndices.has(currentIndex)
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-500 hover:text-emerald-700'
              }`}
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>{masteredIndices.has(currentIndex) ? 'Mastered!' : 'Mark Mastered'}</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* GRID VIEW OF ALL FLASHCARDS */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map((card, idx) => {
            const isMastered = masteredIndices.has(idx);
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      Card #{idx + 1}
                    </span>
                    <button
                      onClick={() => toggleMastered(idx)}
                      className={`text-xs transition-colors ${
                        isMastered ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-emerald-600'
                      }`}
                      title={isMastered ? 'Mastered' : 'Mark as Mastered'}
                    >
                      <BookmarkCheck className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mb-2 leading-snug">
                    {card.front}
                  </h4>
                  <div className="border-t border-slate-100 pt-2">
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      {card.back}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
