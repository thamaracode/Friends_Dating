import React, { useState } from 'react';
import { 
  Heart, 
  Sparkles, 
  Lock, 
  Unlock, 
  Send, 
  Eye, 
  CheckCircle2, 
  MessageCircle, 
  X,
  ShieldCheck
} from 'lucide-react';
import { GlassModal, GlassButton } from '../klyven';
import type { TwoPersonQuestion } from '../../types/emotionalUniverse';
import { EmotionalContentEngine } from '../../services/emotionalContentEngine';

interface TwoPersonQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName?: string;
  partnerAvatar?: string;
}

export const TwoPersonQuestionModal: React.FC<TwoPersonQuestionModalProps> = ({
  isOpen,
  onClose,
  partnerName = 'Alex Rivera',
  partnerAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
}) => {
  const [questions, setQuestions] = useState<TwoPersonQuestion[]>(() => EmotionalContentEngine.getTwoPersonQuestions());
  const [activeQuestionId, setActiveQuestionId] = useState<string>(questions[0]?.id || '');
  const [userAnswerInput, setUserAnswerInput] = useState('');

  if (!isOpen) return null;

  const currentQ = questions.find(q => q.id === activeQuestionId) || questions[0];

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswerInput.trim() || !currentQ) return;
    EmotionalContentEngine.answerTwoPersonQuestion(currentQ.id, userAnswerInput.trim());
    setUserAnswerInput('');
    setQuestions(EmotionalContentEngine.getTwoPersonQuestions());
  };

  const handleReveal = (id: string) => {
    EmotionalContentEngine.revealTwoPersonQuestion(id);
    setQuestions(EmotionalContentEngine.getTwoPersonQuestions());
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="One Question, Two People"
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs max-h-[80vh] overflow-y-auto no-scrollbar">
        
        {/* Header intro */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-zinc-300 leading-relaxed">
          <span className="font-bold text-white block mb-0.5">Mutual Connection Prompt</span>
          Both people privately answer the same question. Your answers are locked and revealed only when both of you have answered!
        </div>

        {/* Question Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setActiveQuestionId(q.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                currentQ.id === q.id
                  ? 'bg-white text-[#090A0E] shadow-sm'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/10'
              }`}
            >
              <span>Question {idx + 1}</span>
              {q.isRevealed ? (
                <span className="text-emerald-400">✓</span>
              ) : q.userAnswered ? (
                <span className="text-amber-300">⏳</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Active Question Box */}
        {currentQ && (
          <div className="p-4 sm:p-5 rounded-3xl dark-glass border border-white/15 space-y-4 shadow-xl">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-rose-400 uppercase tracking-wider">Mutual Reflection</span>
              <span className="text-zinc-500">With {currentQ.partnerName}</span>
            </div>

            <h3 className="text-sm sm:text-base font-serif italic text-white leading-relaxed">
              "{currentQ.question}"
            </h3>

            {/* User's Answer Section */}
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Your Answer
              </span>
              {currentQ.userAnswered ? (
                <p className="text-xs text-white leading-relaxed italic">
                  "{currentQ.userAnswer}"
                </p>
              ) : (
                <form onSubmit={handleAnswerSubmit} className="space-y-2 pt-1">
                  <textarea
                    value={userAnswerInput}
                    onChange={(e) => setUserAnswerInput(e.target.value)}
                    rows={3}
                    placeholder="Write your honest, private answer here..."
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 resize-none leading-relaxed"
                    required
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-white text-[#090A0E] font-bold text-xs cursor-pointer shadow-md"
                    >
                      Lock In Answer
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Partner's Answer Section */}
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  {currentQ.partnerName}’s Answer
                </span>
                <span className="text-[10px] font-bold">
                  {currentQ.isRevealed ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Unlock className="w-3 h-3" /> Revealed
                    </span>
                  ) : currentQ.partnerAnswered ? (
                    <span className="text-amber-300 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Answered & Locked
                    </span>
                  ) : (
                    <span className="text-zinc-500">Waiting to answer</span>
                  )}
                </span>
              </div>

              {currentQ.isRevealed ? (
                <p className="text-xs text-zinc-200 leading-relaxed italic">
                  "{currentQ.partnerAnswer}"
                </p>
              ) : (
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center py-4 space-y-1">
                  <Lock className="w-5 h-5 text-zinc-500 mx-auto" />
                  <p className="text-xs text-zinc-400">
                    {currentQ.userAnswered && currentQ.partnerAnswered
                      ? 'Both of you have answered! Tap below to reveal.'
                      : currentQ.userAnswered
                        ? `Answer locked! Waiting for ${currentQ.partnerName} to answer.`
                        : `Answer the question first to see ${currentQ.partnerName}’s response.`}
                  </p>
                </div>
              )}
            </div>

            {/* Reveal Action Button */}
            {currentQ.userAnswered && currentQ.partnerAnswered && !currentQ.isRevealed && (
              <button
                onClick={() => handleReveal(currentQ.id)}
                className="w-full py-2.5 rounded-xl bg-white text-[#090A0E] font-bold text-xs hover:brightness-110 shadow-lg cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>Reveal Both Answers!</span>
              </button>
            )}

          </div>
        )}

      </div>
    </GlassModal>
  );
};
