import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Heart, 
  Gift, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  X,
  Lightbulb
} from 'lucide-react';
import { GlassModal, GlassButton } from '../klyven';
import type { RelationshipProfile } from '../../types/relationshipVault';

interface AIRelationshipAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: RelationshipProfile[];
  initialProfileId?: string;
}

export const AIRelationshipAssistantModal: React.FC<AIRelationshipAssistantModalProps> = ({
  isOpen,
  onClose,
  profiles,
  initialProfileId
}) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    initialProfileId || (profiles[0]?.id || '')
  );
  const [customQuestion, setCustomQuestion] = useState('');
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'Hello! I am your private Relational Intelligence Assistant. I help you remember important details, prepare for conversations, organize reflections constructively, and keep track of promises—using only the memories you have voluntarily saved.'
    }
  ]);

  if (!isOpen) return null;

  const currentProfile = profiles.find(p => p.id === selectedProfileId) || profiles[0];

  const handleQuickPrompt = (promptType: 'before_date' | 'birthday_plan' | 'promises_audit' | 'reconnection' | 'conflict_reflection') => {
    if (!currentProfile) return;

    let userMsg = '';
    let aiResponse = '';

    if (promptType === 'before_date') {
      userMsg = `What should I remember before talking to ${currentProfile.name}?`;
      aiResponse = `Here is your private briefing for **${currentProfile.name}**:\n\n` +
        `• **Immediate Context:** ${currentProfile.lastConversationSummary}\n` +
        `• **What they appreciate:** ${currentProfile.thingsTheyAppreciate.join(' ')}\n` +
        `• **Upcoming:** ${currentProfile.upcomingReminders.join(' ')}\n` +
        `• **Etiquette Reminder:** ${currentProfile.personalReminders.join(' ')}\n` +
        `• **Casual Mention:** "${currentProfile.thingsTheyMentionedOnce[0] || 'Enjoys quiet environments'}"\n\n` +
        `💡 *Recommendation:* Focus on asking open-ended questions about how she felt during her recent studio review, and avoid offering quick fixes unless asked.`;
    } else if (promptType === 'birthday_plan') {
      userMsg = `Help me plan a meaningful gift or celebration for ${currentProfile.name}.`;
      aiResponse = `Based on what you've saved in ${currentProfile.name}'s memory notes:\n\n` +
        `• **Saved Gift Ideas:** ${currentProfile.giftIdeas.join(', ') || 'Vintage photography monograph or ceramic bowl'}\n` +
        `• **Love Language:** ${currentProfile.loveLanguage}\n` +
        `• **Favorite Atmosphere:** Rain, quiet ambient acoustics, and comfortable seating\n` +
        `• **Favorite Food:** ${currentProfile.favouriteFood || 'Woodfired pizza'}\n\n` +
        `💡 *Concept:* Instead of an extravagant party (she dislikes loud noisy bars), arrange a sunset visit to ${currentProfile.placesToVisitTogether[0] || 'the seaside cliff'} followed by a handwritten note highlighting a moment where her presence brought you calm.`;
    } else if (promptType === 'promises_audit') {
      userMsg = `Have I been keeping the promises I made to ${currentProfile.name}?`;
      const pending = currentProfile.promises.filter(p => p.status === 'pending');
      const inProgress = currentProfile.promises.filter(p => p.status === 'in_progress');
      const completed = currentProfile.promises.filter(p => p.status === 'completed');
      aiResponse = `Here is an honest review of your commitments to **${currentProfile.name}**:\n\n` +
        `• **Completed (${completed.length}):** ${completed.map(c => `✓ ${c.title}`).join(', ') || 'None yet'}\n` +
        `• **In Progress (${inProgress.length}):** ${inProgress.map(c => `⏳ ${c.title}`).join(', ') || 'None'}\n` +
        `• **Pending (${pending.length}):** ${pending.map(c => `○ ${c.title}`).join(', ') || 'All caught up!'}\n\n` +
        `💡 *Prospective Memory Alert:* You promised to "${pending[0]?.title || 'catch up'}". Consider bringing this up naturally this week.`;
    } else if (promptType === 'reconnection') {
      userMsg = `What have I missed in my connection with ${currentProfile.name}?`;
      aiResponse = `Your last logged interaction was: *"${currentProfile.lastConversationSummary}"*.\n\n` +
        `• **Days since last update:** ${currentProfile.lastUpdated}\n` +
        `• **Unfinished questions from past talks:** ${currentProfile.conversationMemories[0]?.questionsForNextTime.join(', ') || 'Checking in on personal projects'}\n\n` +
        `💡 *Low-Stakes Opener:* Send a short, gentle message: "Saw something that reminded me of what you said about analog film—how has your week been treating you?" No pressure, just warmth.`;
    } else if (promptType === 'conflict_reflection') {
      userMsg = `Help me understand what happened during our disagreement and communicate constructively.`;
      aiResponse = `Constructive Conflict Reflection for **${currentProfile.name}**:\n\n` +
        `1. **Distinguish Facts from Assumptions:** What did they actually say versus what did your anxiety assume they meant?\n` +
        `2. **Agreed Boundaries:** ${currentProfile.dynamics?.boundariesAgreed.join('; ') || 'Take 30 minutes of space before discussing emotionally charged topics.'}\n` +
        `3. **Their Conflict Style:** ${currentProfile.communicationStyle}\n\n` +
        `💡 *Communication Template:* "I noticed we both felt drained earlier. I care about how you feel and want to listen without being defensive. Whenever you feel ready to talk, I'm here."`;
    }

    setConversation(prev => [
      ...prev,
      { role: 'user', content: userMsg },
      { role: 'assistant', content: aiResponse }
    ]);
  };

  const handleCustomSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || !currentProfile) return;

    const q = customQuestion.trim();
    setCustomQuestion('');
    
    // Generate thoughtful response based on person's notes
    const reply = `Reflecting on **${currentProfile.name}**:\n\n` +
      `Regarding "${q}": Based on your recorded memory notes, ${currentProfile.name} values ${currentProfile.loveLanguage || 'authenticity'} and appreciates direct, gentle communication. ` +
      `Keep in mind her reminder: "${currentProfile.personalReminders[0] || 'Ask about what matters to her'}".`;

    setConversation(prev => [
      ...prev,
      { role: 'user', content: q },
      { role: 'assistant', content: reply }
    ]);
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Relational Intelligence AI Assistant"
      maxWidth="xl"
    >
      <div className="space-y-4 text-xs max-h-[80vh] flex flex-col overflow-hidden">
        
        {/* Person Selector */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 pb-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0">Focus on:</span>
          {profiles.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedProfileId(p.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                currentProfile.id === p.id
                  ? 'bg-white text-[#090A0E] shadow-sm'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/10'
              }`}
            >
              <img src={p.avatar} alt={p.name} className="w-4 h-4 rounded-full object-cover" />
              <span>{p.nickname || p.name}</span>
            </button>
          ))}
        </div>

        {/* Quick Scenario Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 py-1">
          <button
            onClick={() => handleQuickPrompt('before_date')}
            className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 font-bold whitespace-nowrap cursor-pointer transition-colors"
          >
            💬 Before We Talk
          </button>
          <button
            onClick={() => handleQuickPrompt('birthday_plan')}
            className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 font-bold whitespace-nowrap cursor-pointer transition-colors"
          >
            🎁 Birthday & Gift Ideas
          </button>
          <button
            onClick={() => handleQuickPrompt('promises_audit')}
            className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 font-bold whitespace-nowrap cursor-pointer transition-colors"
          >
            ⚖️ Promise Audit
          </button>
          <button
            onClick={() => handleQuickPrompt('conflict_reflection')}
            className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 font-bold whitespace-nowrap cursor-pointer transition-colors"
          >
            🕊️ Disagreement Reflection
          </button>
          <button
            onClick={() => handleQuickPrompt('reconnection')}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 font-bold whitespace-nowrap cursor-pointer transition-colors"
          >
            🫂 Gentle Reconnection
          </button>
        </div>

        {/* Chat / Thought Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 p-3 rounded-2xl bg-black/40 border border-white/[0.08] min-h-[260px] max-h-[380px]">
          {conversation.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                </div>
              )}
              <div
                className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed text-xs whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-white text-[#090A0E] font-medium shadow-md'
                    : 'bg-white/[0.04] border border-white/10 text-zinc-200'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleCustomSend} className="flex gap-2 pt-1 shrink-0">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder={`Ask anything about ${currentProfile.name}’s saved preferences or commitments...`}
            className="flex-1 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-white text-[#090A0E] font-bold text-xs flex items-center gap-1.5 hover:brightness-110 cursor-pointer shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </form>

        <p className="text-[10px] text-zinc-500 text-center shrink-0">
          🔒 Private & Confidential. AI operates exclusively on memories you deliberately save. No behavioral surveillance.
        </p>

      </div>
    </GlassModal>
  );
};
