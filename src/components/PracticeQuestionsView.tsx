import React, { useState } from 'react';
import { PracticeQuestions, AnswerEvaluation } from '../types.ts';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Send,
  Sparkles,
  Award,
  AlertTriangle,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface PracticeQuestionsViewProps {
  questions: PracticeQuestions;
}

export const PracticeQuestionsView: React.FC<PracticeQuestionsViewProps> = ({ questions }) => {
  const { mcq, shortAnswer, application } = questions;

  // MCQ state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmittedMCQ, setHasSubmittedMCQ] = useState(false);

  // Short Answer state
  const [studentShortAnswer, setStudentShortAnswer] = useState('');
  const [showShortAnswerSolution, setShowShortAnswerSolution] = useState(false);
  const [shortAnswerEval, setShortAnswerEval] = useState<AnswerEvaluation | null>(null);
  const [isEvaluatingShort, setIsEvaluatingShort] = useState(false);
  const [shortEvalError, setShortEvalError] = useState<string | null>(null);

  // Application Question state
  const [studentAppAnswer, setStudentAppAnswer] = useState('');
  const [showAppSolution, setShowAppSolution] = useState(false);
  const [appEval, setAppEval] = useState<AnswerEvaluation | null>(null);
  const [isEvaluatingApp, setIsEvaluatingApp] = useState(false);
  const [appEvalError, setAppEvalError] = useState<string | null>(null);

  // Handle MCQ selection
  const handleSelectOption = (idx: number) => {
    if (hasSubmittedMCQ) return;
    setSelectedOption(idx);
    setHasSubmittedMCQ(true);

    if (idx === mcq.correctOptionIndex) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const handleResetMCQ = () => {
    setSelectedOption(null);
    setHasSubmittedMCQ(false);
  };

  // Evaluate student answer
  const evaluateAnswer = async (
    questionText: string,
    questionType: string,
    studentAnswerText: string,
    sampleAnswerText: string,
    isShort: boolean
  ) => {
    if (!studentAnswerText.trim()) return;

    if (isShort) {
      setIsEvaluatingShort(true);
      setShortEvalError(null);
    } else {
      setIsEvaluatingApp(true);
      setAppEvalError(null);
    }

    try {
      const res = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          questionType,
          studentAnswer: studentAnswerText,
          sampleAnswer: sampleAnswerText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Evaluation failed.');

      if (isShort) {
        setShortAnswerEval(data.evaluation);
        setShowShortAnswerSolution(true);
      } else {
        setAppEval(data.evaluation);
        setShowAppSolution(true);
      }
    } catch (err: any) {
      if (isShort) setShortEvalError(err.message);
      else setAppEvalError(err.message);
    } finally {
      if (isShort) setIsEvaluatingShort(false);
      else setIsEvaluatingApp(false);
    }
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Practice Exam Questions
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            3 distinct questions based strictly on the source material: Multiple Choice, Short Answer, and Conceptual Application.
          </p>
        </div>
      </div>

      {/* 1. MCQ CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              Question 1 • MCQ
            </span>
            <span className="text-xs text-slate-500 font-medium">Multiple Choice (4 Options)</span>
          </div>

          {hasSubmittedMCQ && (
            <button
              onClick={handleResetMCQ}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>

        <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-4 leading-relaxed">
          {mcq.question}
        </h4>

        {/* Options */}
        <div className="space-y-2.5">
          {mcq.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === mcq.correctOptionIndex;
            const showCorrect = hasSubmittedMCQ && isCorrect;
            const showWrong = hasSubmittedMCQ && isSelected && !isCorrect;

            let cardStyle = 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 bg-white text-slate-800';
            let labelStyle = 'bg-slate-100 text-slate-700 border-slate-300';

            if (showCorrect) {
              cardStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-medium ring-1 ring-emerald-500';
              labelStyle = 'bg-emerald-600 text-white border-emerald-600';
            } else if (showWrong) {
              cardStyle = 'border-rose-400 bg-rose-50/70 text-rose-950 ring-1 ring-rose-400';
              labelStyle = 'bg-rose-600 text-white border-rose-600';
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={hasSubmittedMCQ}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm transition-all cursor-pointer disabled:cursor-default ${cardStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border transition-colors ${labelStyle}`}
                  >
                    {optionLabels[idx] || String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-snug">{option}</span>
                </div>

                {showCorrect && (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 shrink-0 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Correct
                  </span>
                )}
                {showWrong && (
                  <span className="flex items-center gap-1 text-xs font-bold text-rose-700 shrink-0 bg-rose-100/80 px-2 py-0.5 rounded-md">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Incorrect
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* MCQ Feedback / Explanation */}
        {hasSubmittedMCQ && (
          <div
            className={`mt-4 p-4 rounded-xl border text-xs leading-relaxed transition-all ${
              selectedOption === mcq.correctOptionIndex
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold mb-1">
              {selectedOption === mcq.correctOptionIndex ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Correct Answer: Option {optionLabels[mcq.correctOptionIndex]}</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Correct Answer: Option {optionLabels[mcq.correctOptionIndex]}</span>
                </>
              )}
            </div>
            <p className="mt-1">{mcq.explanation}</p>
          </div>
        )}
      </div>

      {/* 2. SHORT ANSWER QUESTION CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-800 border border-violet-200">
              Question 2 • Short Answer
            </span>
            <span className="text-xs text-slate-500 font-medium">Sample High-Scoring Answer</span>
          </div>

          <button
            type="button"
            onClick={() => setShowShortAnswerSolution(!showShortAnswerSolution)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            {showShortAnswerSolution ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hide Answer</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Reveal Sample Answer</span>
              </>
            )}
          </button>
        </div>

        <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-3 leading-relaxed">
          {shortAnswer.question}
        </h4>

        {/* Student Practice Input */}
        <div className="space-y-2 mb-4">
          <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span>Practice Your Response:</span>
            <span className="text-[11px] text-slate-400">
              {studentShortAnswer.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </label>
          <textarea
            rows={3}
            value={studentShortAnswer}
            onChange={(e) => setStudentShortAnswer(e.target.value)}
            placeholder="Type your response here to test your retention and self-evaluate..."
            className="w-full rounded-xl border border-slate-300 p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-sans leading-relaxed"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500">
              Write a response, then compare or get instant AI feedback.
            </span>
            <button
              type="button"
              disabled={isEvaluatingShort || !studentShortAnswer.trim()}
              onClick={() =>
                evaluateAnswer(
                  shortAnswer.question,
                  'Short Answer',
                  studentShortAnswer,
                  shortAnswer.sampleAnswer,
                  true
                )
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEvaluatingShort ? (
                <>
                  <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  Evaluating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Evaluate My Answer
                </>
              )}
            </button>
          </div>

          {shortEvalError && (
            <p className="text-xs text-red-600 mt-1">{shortEvalError}</p>
          )}

          {/* AI Evaluation Result */}
          {shortAnswerEval && (
            <div className="mt-3 p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600" />
                  Tutor Evaluation: {shortAnswerEval.scoreOutOf5} / 5 ({shortAnswerEval.status})
                </span>
              </div>
              <p className="text-slate-800">
                <strong className="text-emerald-700 font-semibold">Strong Points:</strong>{' '}
                {shortAnswerEval.praise}
              </p>
              {shortAnswerEval.missingPoints && (
                <p className="text-slate-800">
                  <strong className="text-amber-800 font-semibold">Missing Elements:</strong>{' '}
                  {shortAnswerEval.missingPoints}
                </p>
              )}
              <p className="text-indigo-950 bg-white/70 p-2 rounded-lg border border-indigo-100">
                <strong className="text-indigo-700 font-semibold">Exam Tip:</strong>{' '}
                {shortAnswerEval.tutorTip}
              </p>
            </div>
          )}
        </div>

        {/* Revealed Sample Answer */}
        {showShortAnswerSolution && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 transition-all">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1 mb-1">
                <Check className="w-3.5 h-3.5" />
                Sample High-Scoring Answer:
              </span>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium bg-white p-3 rounded-lg border border-slate-200/80">
                {shortAnswer.sampleAnswer}
              </p>
            </div>

            {shortAnswer.keyGradingCriteria && shortAnswer.keyGradingCriteria.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-slate-600 block mb-1">
                  Key Points Examiners Award Marks For:
                </span>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5">
                  {shortAnswer.keyGradingCriteria.map((criterion, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {criterion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. CONCEPTUAL APPLICATION QUESTION CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              Question 3 • Conceptual Application
            </span>
            <span className="text-xs text-slate-500 font-medium">Real-World Scenario</span>
          </div>

          <button
            type="button"
            onClick={() => setShowAppSolution(!showAppSolution)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            {showAppSolution ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hide Sample Answer</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Reveal High-Scoring Answer</span>
              </>
            )}
          </button>
        </div>

        {application.keyConceptApplied && (
          <div className="mb-2.5">
            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-700 border border-slate-200">
              Applied Concept: <strong>{application.keyConceptApplied}</strong>
            </span>
          </div>
        )}

        <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-3 leading-relaxed">
          {application.question}
        </h4>

        {/* Student Practice Input */}
        <div className="space-y-2 mb-4">
          <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span>Apply the concept to the scenario:</span>
            <span className="text-[11px] text-slate-400">
              {studentAppAnswer.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </label>
          <textarea
            rows={3}
            value={studentAppAnswer}
            onChange={(e) => setStudentAppAnswer(e.target.value)}
            placeholder="Explain how the concept operates in this specific real-world case..."
            className="w-full rounded-xl border border-slate-300 p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-sans leading-relaxed"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500">
              Demonstrate cause-and-effect reasoning based on your material.
            </span>
            <button
              type="button"
              disabled={isEvaluatingApp || !studentAppAnswer.trim()}
              onClick={() =>
                evaluateAnswer(
                  application.question,
                  'Conceptual Application',
                  studentAppAnswer,
                  application.sampleAnswer,
                  false
                )
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEvaluatingApp ? (
                <>
                  <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  Evaluating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Evaluate My Answer
                </>
              )}
            </button>
          </div>

          {appEvalError && (
            <p className="text-xs text-red-600 mt-1">{appEvalError}</p>
          )}

          {/* AI Evaluation Result */}
          {appEval && (
            <div className="mt-3 p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  Tutor Evaluation: {appEval.scoreOutOf5} / 5 ({appEval.status})
                </span>
              </div>
              <p className="text-slate-800">
                <strong className="text-emerald-700 font-semibold">Application Strengths:</strong>{' '}
                {appEval.praise}
              </p>
              {appEval.missingPoints && (
                <p className="text-slate-800">
                  <strong className="text-amber-800 font-semibold">Missing Synthesis:</strong>{' '}
                  {appEval.missingPoints}
                </p>
              )}
              <p className="text-amber-950 bg-white/70 p-2 rounded-lg border border-amber-100">
                <strong className="text-amber-700 font-semibold">Exam Tip:</strong>{' '}
                {appEval.tutorTip}
              </p>
            </div>
          )}
        </div>

        {/* Revealed Sample High-Scoring Answer */}
        {showAppSolution && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 transition-all">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1 mb-1">
              <Check className="w-3.5 h-3.5" />
              Sample High-Scoring Application Answer:
            </span>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium bg-white p-3 rounded-lg border border-slate-200/80">
              {application.sampleAnswer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
