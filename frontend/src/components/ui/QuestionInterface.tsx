import React, { useState } from 'react';
import { HelpCircle, Lock, Globe, Sparkles, Send, SkipForward, Check } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from './Card';
import { Textarea } from './Form';

export interface QuestionData {
  id: string;
  category: string;
  depth: 'casual' | 'reflective' | 'deep' | 'philosophical';
  questionText: string;
  context?: string;
  followUp?: string;
}

export interface QuestionInterfaceProps {
  question: QuestionData;
  onAnswerSubmit: (answerText: string, isPrivate: boolean) => void | Promise<void>;
  onSkip?: () => void;
  isLoading?: boolean;
  className?: string;
}

export const QuestionInterface: React.FC<QuestionInterfaceProps> = ({
  question,
  onAnswerSubmit,
  onSkip,
  isLoading = false,
  className = ''
}) => {
  const [answer, setAnswer] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const depthColors = {
    casual: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    reflective: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    deep: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
    philosophical: 'bg-purple-500/10 text-purple-300 border-purple-500/20'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isLoading) return;
    await onAnswerSubmit(answer.trim(), isPrivate);
    setSubmitted(true);
  };

  return (
    <Card variant="elevated" padding="spacious" className={`max-w-xl mx-auto space-y-4 ${className}`}>
      {/* Category & Depth Badges */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-zinc-300 font-semibold border border-white/15">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>{question.category}</span>
          </span>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border capitalize ${depthColors[question.depth]}`}>
            {question.depth}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsPrivate(!isPrivate)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
            isPrivate
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-white/[0.05] text-zinc-400 hover:text-white border border-white/10'
          }`}
          title="Toggle visibility"
        >
          {isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
          <span>{isPrivate ? 'Private Reflection' : 'Public to Matches'}</span>
        </button>
      </div>

      {/* Main Question Heading */}
      <div className="space-y-2">
        <h3 className="text-lg sm:text-xl md:text-2xl font-heading font-extrabold text-white leading-snug">
          "{question.questionText}"
        </h3>
        {question.context && (
          <p className="text-xs text-zinc-400 leading-relaxed italic">
            {question.context}
          </p>
        )}
      </div>

      {/* Answer Form */}
      {submitted ? (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 flex items-center gap-3">
          <Check className="w-5 h-5 shrink-0" />
          <p className="text-xs sm:text-sm font-semibold">Your reflection has been recorded securely.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={3}
            placeholder="Write your genuine thoughts without self-censorship..."
            disabled={isLoading}
          />

          <div className="flex items-center justify-between gap-3 pt-1">
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Skip Question</span>
              </button>
            )}

            <button
              type="submit"
              disabled={!answer.trim() || isLoading}
              className="ml-auto h-10 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-400/20 disabled:opacity-40 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Record Reflection</span>
            </button>
          </div>
        </form>
      )}
    </Card>
  );
};
