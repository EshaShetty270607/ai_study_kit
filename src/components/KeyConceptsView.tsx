import React, { useState } from 'react';
import { Concept } from '../types.ts';
import { BookOpen, Volume2, VolumeX, Check, Copy, Lightbulb } from 'lucide-react';

interface KeyConceptsViewProps {
  concepts: Concept[];
}

export const KeyConceptsView: React.FC<KeyConceptsViewProps> = ({ concepts }) => {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSpeak = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }

    if (playingIndex === index) {
      window.speechSynthesis.cancel();
      setPlayingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.onend = () => setPlayingIndex(null);
    utterance.onerror = () => setPlayingIndex(null);
    setPlayingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (concept: Concept, index: number) => {
    const text = `${concept.title}\n${concept.summary}${concept.importance ? `\nExam Note: ${concept.importance}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Key Concepts &amp; Summaries
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Core concepts extracted strictly from source material, explained in plain language (2–3 concise sentences).
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
          {concepts.length} Core Concepts
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {concepts.map((concept, index) => {
          const isPlaying = playingIndex === index;
          const isCopied = copiedIndex === index;

          return (
            <div
              key={index}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                      0{index + 1}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 leading-snug">
                      {concept.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSpeak(`${concept.title}. ${concept.summary}`, index)}
                      className={`p-1.5 rounded-lg border text-xs transition-colors ${
                        isPlaying
                          ? 'bg-indigo-600 text-white border-indigo-600 animate-pulse'
                          : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border-slate-200'
                      }`}
                      title={isPlaying ? 'Stop reading' : 'Read aloud'}
                    >
                      {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(concept, index)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs transition-colors"
                      title="Copy concept"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  {concept.summary}
                </p>
              </div>

              {concept.importance && (
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-start gap-2 text-[11px] text-amber-900 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/50">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">
                    <strong className="font-semibold">Exam Focus:</strong> {concept.importance}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
