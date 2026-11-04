import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Sparkles,
  X,
  AlertCircle,
  FileSpreadsheet,
  Check,
  Zap,
  BookOpen,
} from 'lucide-react';
import { Difficulty, UploadedFile } from '../types.ts';
import { SAMPLE_MATERIALS, SampleMaterial } from '../data/sampleMaterials.ts';
import { processImageFile } from '../utils/imageUtils.ts';

interface UploadSectionProps {
  onGenerate: (data: {
    text: string;
    images: Array<{ mimeType: string; data: string; name?: string }>;
    difficulty: Difficulty;
  }) => Promise<void>;
  isLoading: boolean;
  loadingStep?: string;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onGenerate,
  isLoading,
  loadingStep,
}) => {
  const [text, setText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [activeTab, setActiveTab] = useState<'text' | 'images' | 'combined'>('text');
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleIncomingFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleIncomingFiles(Array.from(e.target.files));
    }
  };

  const handleIncomingFiles = async (files: File[]) => {
    setErrorMsg(null);
    setIsProcessingFiles(true);
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const newUploads: UploadedFile[] = [];

    for (const file of files) {
      // Check if text file (.txt, .md)
      if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        try {
          const content = await file.text();
          setText((prev) => (prev ? `${prev}\n\n--- ${file.name} ---\n${content}` : content));
          setActiveTab('text');
        } catch {
          setErrorMsg(`Could not read text file: ${file.name}`);
        }
        continue;
      }

      if (validImageTypes.includes(file.type)) {
        if (uploadedFiles.length + newUploads.length >= 6) {
          setErrorMsg('Maximum 6 document images can be attached per kit.');
          break;
        }
        try {
          const processed = await processImageFile(file);
          newUploads.push({
            id: Math.random().toString(36).substring(2, 9),
            name: file.name,
            mimeType: processed.mimeType,
            data: processed.data,
            previewUrl: processed.previewUrl,
            size: processed.size,
          });
        } catch (err: any) {
          setErrorMsg(`Error processing image ${file.name}: ${err?.message || 'Invalid image'}`);
        }
      } else {
        setErrorMsg(`Unsupported file type: ${file.name}. Please upload images (PNG, JPG, WEBP) or text files.`);
      }
    }

    if (newUploads.length > 0) {
      setUploadedFiles((prev) => [...prev, ...newUploads]);
      if (activeTab === 'text') {
        setActiveTab('combined');
      }
    }
    setIsProcessingFiles(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSelectSample = (sample: SampleMaterial) => {
    setText(sample.content);
    setDifficulty(sample.difficulty);
    setActiveTab('text');
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const hasText = text.trim().length > 0;
    const hasImages = uploadedFiles.length > 0;

    if (!hasText && !hasImages) {
      setErrorMsg('Please paste study notes or upload document images before generating.');
      return;
    }

    try {
      await onGenerate({
        text,
        images: uploadedFiles.map((f) => ({
          mimeType: f.mimeType,
          data: f.data,
          name: f.name,
        })),
        difficulty,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate study kit.');
    }
  };

  const clearAll = () => {
    setText('');
    setUploadedFiles([]);
    setErrorMsg(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all">
      {/* Top Banner / Guidance */}
      <div className="bg-gradient-to-r from-indigo-50/80 via-slate-50 to-purple-50/50 p-5 border-b border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Upload Study Material
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Paste raw notes, lecture transcripts, or upload document photos (handwritten notes, textbook pages, slides).
            </p>
          </div>

          {/* Quick Sample Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
              Quick Samples:
            </span>
            {SAMPLE_MATERIALS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className="px-2.5 py-1 text-xs rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50/50 shadow-xs transition-colors flex items-center gap-1 font-medium"
              >
                <BookOpen className="w-3 h-3 text-indigo-500" />
                {sample.subject}
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
        {/* Mode Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'text'
                ? 'bg-indigo-100 text-indigo-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Paste Notes &amp; Text
            {text.trim().length > 0 && (
              <span className="w-2 h-2 rounded-full bg-indigo-600 ml-1"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('images')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'images'
                ? 'bg-indigo-100 text-indigo-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Document Images / Photos
            {uploadedFiles.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-600 text-white font-bold ml-1">
                {uploadedFiles.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('combined')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'combined'
                ? 'bg-indigo-100 text-indigo-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Both (Notes + Images)
          </button>
        </div>

        {/* Input Area */}
        <div className="space-y-4">
          {/* Text Input (Visible on 'text' and 'combined') */}
          {(activeTab === 'text' || activeTab === 'combined') && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <label htmlFor="study-text" className="font-semibold text-slate-700 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  Study Notes &amp; Material Content
                </label>
                <div className="flex items-center gap-2 text-[11px]">
                  <span>{wordCount} words</span>
                  <span>•</span>
                  <span>{charCount} characters</span>
                  {text.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setText('')}
                      className="text-slate-400 hover:text-red-600 ml-1"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <textarea
                id="study-text"
                rows={activeTab === 'combined' ? 6 : 9}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your lecture notes, textbook chapters, article summaries, or outline here...&#10;&#10;e.g. 'Photosynthesis is the process by which green plants and certain other organisms transform light energy into chemical energy...'"
                className="w-full rounded-xl border border-slate-300 p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-xs leading-relaxed transition-all resize-y shadow-inner"
              />
            </div>
          )}

          {/* Image Uploader (Visible on 'images' and 'combined') */}
          {(activeTab === 'images' || activeTab === 'combined') && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-700 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                  Document Photos &amp; Scans (Handwritten Notes, Textbook Pages, Slides)
                </label>
                <span className="text-[11px] text-slate-500">
                  {uploadedFiles.length}/6 photos attached
                </span>
              </div>

              {/* Drag & drop zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                    : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,.txt,.md"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Click to upload or drag &amp; drop document images
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Supports JPG, PNG, WEBP, or TXT/MD files (Auto-compressed for fast analysis)
                    </p>
                  </div>
                </div>
              </div>

              {isProcessingFiles && (
                <div className="text-xs text-indigo-600 flex items-center gap-1.5 py-1">
                  <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  Processing and optimizing images...
                </div>
              )}

              {/* Image Previews */}
              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-xs"
                    >
                      <img
                        src={file.previewUrl}
                        alt={file.name}
                        className="w-full h-24 object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file.id);
                        }}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-slate-900/75 text-white hover:bg-red-600 flex items-center justify-center transition-colors shadow-sm"
                        title="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="p-1.5 text-[10px] text-slate-700 truncate font-medium bg-white/90">
                        {file.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CONSTRAINT 4: Radio button to toggle between hard, medium and easy questions */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                Exam Difficulty Level
              </label>
              <p className="text-[11px] text-slate-500">
                Adjusts the analytical depth and distractor challenge of the generated exam questions.
              </p>
            </div>

            {/* Radio Button Group */}
            <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200" role="radiogroup" aria-label="Question Difficulty">
              {/* Easy Radio Button */}
              <label
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  difficulty === 'easy'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <input
                  type="radio"
                  name="difficulty"
                  value="easy"
                  checked={difficulty === 'easy'}
                  onChange={() => setDifficulty('easy')}
                  className="sr-only"
                />
                <span className={`w-2 h-2 rounded-full ${difficulty === 'easy' ? 'bg-white' : 'bg-emerald-500'}`} />
                Easy
              </label>

              {/* Medium Radio Button */}
              <label
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  difficulty === 'medium'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <input
                  type="radio"
                  name="difficulty"
                  value="medium"
                  checked={difficulty === 'medium'}
                  onChange={() => setDifficulty('medium')}
                  className="sr-only"
                />
                <span className={`w-2 h-2 rounded-full ${difficulty === 'medium' ? 'bg-white' : 'bg-indigo-400'}`} />
                Medium
              </label>

              {/* Hard Radio Button */}
              <label
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  difficulty === 'hard'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <input
                  type="radio"
                  name="difficulty"
                  value="hard"
                  checked={difficulty === 'hard'}
                  onChange={() => setDifficulty('hard')}
                  className="sr-only"
                />
                <span className={`w-2 h-2 rounded-full ${difficulty === 'hard' ? 'bg-white' : 'bg-rose-400'}`} />
                Hard
              </label>
            </div>
          </div>
        </div>

        {/* Active Generation Progress Indicator */}
        {isLoading && (
          <div className="p-4 rounded-xl bg-indigo-50/90 border border-indigo-200 space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-950 flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                Building Study Kit...
              </span>
              <span className="text-[11px] text-indigo-700 font-semibold animate-pulse">
                {loadingStep || 'Processing source materials...'}
              </span>
            </div>
            {/* Visual Progress Bar */}
            <div className="w-full bg-indigo-200/60 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-600 h-1.5 rounded-full w-4/5 animate-pulse transition-all duration-500"></div>
            </div>
            <p className="text-[11px] text-indigo-800">
              Extracting 3–5 core concepts, generating MCQ, Short Answer, Application questions, and 3D flashcards strictly from your material.
            </p>
          </div>
        )}

        {/* Error Feedback */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-semibold text-red-900">Could not generate study kit</p>
              <p className="text-red-700 leading-relaxed">{errorMsg}</p>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-[11px] shrink-0 transition-colors shadow-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={clearAll}
            disabled={isLoading}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-40"
          >
            Reset Form
          </button>

          <button
            type="submit"
            disabled={isLoading || isProcessingFiles}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Building Kit (~2s)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Study Kit</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
