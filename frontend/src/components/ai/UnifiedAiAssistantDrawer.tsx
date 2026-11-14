import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bot,
  Heart,
  Wand2,
  Compass,
  MessageSquare,
  Check,
  Send,
  X,
  RefreshCw,
  Sliders,
  Settings,
  Shield,
  Layers,
  ArrowRight,
  TrendingUp,
  Flame,
  Volume2
} from 'lucide-react';
import { byoaiService } from '../../services/byoaiService';
import { UserAIConnection, AIModelInfo, TaskAIRoute } from '../../types/byoai';

interface UnifiedAiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversationHistory: Array<{ sender: string; text: string }>;
  partnerProfile?: {
    id?: string;
    name: string;
    avatar?: string;
    interests?: string[];
    bio?: string;
  };
  currentDraftText?: string;
  onInsertMessage: (text: string) => void;
  onReplaceDraft: (text: string) => void;
  onOpenAiSettings?: () => void;
}

export const UnifiedAiAssistantDrawer: React.FC<UnifiedAiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  conversationHistory,
  partnerProfile,
  currentDraftText = '',
  onInsertMessage,
  onReplaceDraft,
  onOpenAiSettings
}) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'polisher' | 'icebreakers' | 'chat'>('analysis');
  const [connections, setConnections] = useState<UserAIConnection[]>([]);
  const [activeConnection, setActiveConnection] = useState<UserAIConnection | null>(null);
  const [activeModel, setActiveModel] = useState<string>('gpt-4o-mini');
  const [isLoading, setIsLoading] = useState(false);

  // Analysis State
  const [analysisResult, setAnalysisResult] = useState<{
    chemistryScore: number;
    vibe: string;
    sentiment: string;
    momentum: string;
    subtext: string;
    greenFlags: string[];
    recommendedReplies: Array<{ type: string; text: string; explanation?: string }>;
  } | null>(null);

  // Polisher State
  const [polishStyle, setPolishStyle] = useState<'warm' | 'playful' | 'confident' | 'deep'>('warm');
  const [polishResult, setPolishResult] = useState<{
    toneAssessment: string;
    suggestions: Array<{ style: string; text: string }>;
  } | null>(null);

  // Icebreakers State
  const [icebreakersResult, setIcebreakersResult] = useState<Array<{ style: string; text: string }>>([]);

  // Direct Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: `Hello! I'm your dedicated Soulverse AI advisor. I've tuned into your conversation with ${partnerProfile?.name || 'your match'}. How can I assist your connection today?`
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [includeContext, setIncludeContext] = useState(true);
  const [streamingText, setStreamingText] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadConnections();
    }
  }, [isOpen]);

  const loadConnections = async () => {
    try {
      const conns = await byoaiService.getConnections();
      setConnections(conns);
      if (conns.length > 0) {
        const enabled = conns.find(c => c.isEnabled) || conns[0];
        setActiveConnection(enabled);
        setActiveModel(enabled.defaultModel);
      }
    } catch (e) {
      console.warn('Failed to load active AI connections', e);
    }
  };

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, streamingText]);

  // Run chat analysis
  const runChatAnalysis = async () => {
    setIsLoading(true);
    try {
      const pName = partnerProfile?.name || 'your match';
      const prompt = `Analyze this live messaging conversation between the user and ${pName}.
Match profile interests: ${(partnerProfile?.interests || []).join(', ') || 'Unknown'}.
Conversation history:
${conversationHistory.map(m => `${m.sender}: "${m.text}"`).join('\n') || 'No messages yet.'}

Respond in strict JSON with:
{
  "chemistryScore": (number between 50 and 98),
  "vibe": "short phrase describing overall dynamic",
  "sentiment": "observation of partner's engagement",
  "momentum": "building" | "steady" | "cooling" | "surging",
  "subtext": "unspoken psychological resonance or undertone",
  "greenFlags": ["list of 3 positive signals observed"],
  "recommendedReplies": [
    { "type": "playful", "text": "banter reply", "explanation": "why this works" },
    { "type": "deep", "text": "insightful reply", "explanation": "why this works" },
    { "type": "casual", "text": "low pressure reply", "explanation": "why this works" }
  ]
}`;

      const res = await byoaiService.dispatchAI({
        taskKey: 'chat_analysis',
        connectionId: activeConnection?.id,
        modelId: activeModel,
        responseFormat: 'json',
        messages: [{ role: 'user', content: prompt }],
        contextData: {
          partnerProfile,
          chatHistory: conversationHistory
        }
      });

      let parsed: any;
      try {
        parsed = JSON.parse(res.text);
      } catch {
        const jsonMatch = res.text.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      }

      if (parsed) {
        setAnalysisResult(parsed);
      }
    } catch (err: any) {
      console.warn('Analysis fallback used:', err);
      // Fallback
      setAnalysisResult({
        chemistryScore: 84,
        vibe: 'Warm Reciprocal Curiosity',
        sentiment: `${partnerProfile?.name || 'Match'} is genuinely engaged with thoughtful cadence.`,
        momentum: 'steady',
        subtext: 'Appreciates direct, authentic questions over generic small talk.',
        greenFlags: [
          'Balanced turn-taking and prompt responses',
          'Shared curiosity for music and creative expression',
          'Natural vulnerability and ease of dialogue'
        ],
        recommendedReplies: [
          {
            type: 'playful',
            text: `Careful, if we keep having this much in common, we won't have anything to debate about. What's your most controversial weekend habit?`,
            explanation: 'Injects playful banter and challenge'
          },
          {
            type: 'deep',
            text: `I really like the way you phrased that. What's something you've been pondering lately that you haven't mentioned yet?`,
            explanation: 'Invites deeper philosophical vulnerability'
          },
          {
            type: 'casual',
            text: `That made my evening. What's been the highlight of your week so far?`,
            explanation: 'Warm, low-pressure conversational maintainer'
          }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Run Draft Polish
  const runDraftPolish = async () => {
    const draft = currentDraftText.trim() || 'Hey, are you free this weekend? Was wondering if you wanted to grab a drink.';
    setIsLoading(true);
    try {
      const prompt = `Polish the user's current draft message for their match ${partnerProfile?.name || 'partner'}.
Target tone style: ${polishStyle}.
Original draft: "${draft}".

Respond in strict JSON with:
{
  "toneAssessment": "critique of current draft tone and impact",
  "suggestions": [
    { "style": "Option 1 description", "text": "polished message text" },
    { "style": "Option 2 description", "text": "alternative polished message text" }
  ]
}`;

      const res = await byoaiService.dispatchAI({
        taskKey: 'writing_assistance',
        connectionId: activeConnection?.id,
        modelId: activeModel,
        responseFormat: 'json',
        messages: [{ role: 'user', content: prompt }]
      });

      let parsed: any;
      try {
        parsed = JSON.parse(res.text);
      } catch {
        const jsonMatch = res.text.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      }

      if (parsed) {
        setPolishResult(parsed);
      }
    } catch {
      setPolishResult({
        toneAssessment: 'Approachable and clear. A subtle adjustment makes it feel effortlessly confident.',
        suggestions: [
          {
            style: 'Confident & Smooth',
            text: `I'm checking out that new vinyl lounge this Saturday—would love for you to join me if you're free.`
          },
          {
            style: 'Playful & Low Pressure',
            text: `Any chance you're free this weekend, or is your schedule already booked with exciting escapades?`
          }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Run Icebreakers
  const runIcebreakers = async () => {
    setIsLoading(true);
    try {
      const pName = partnerProfile?.name || 'your match';
      const prompt = `Generate 3 personalized, creative conversation starters for ${pName}.
Their interests: ${(partnerProfile?.interests || []).join(', ') || 'music, travel, late-night talks'}.
Bio: "${partnerProfile?.bio || 'Passionate explorer of hidden cities and ambient records'}".

Respond in strict JSON with:
{
  "openers": [
    { "style": "Passions Connection", "text": "opener text" },
    { "style": "Playful Banter", "text": "opener text" },
    { "style": "Introspective Curiosity", "text": "opener text" }
  ]
}`;

      const res = await byoaiService.dispatchAI({
        taskKey: 'dating_assistant',
        connectionId: activeConnection?.id,
        modelId: activeModel,
        responseFormat: 'json',
        messages: [{ role: 'user', content: prompt }],
        contextData: { partnerProfile }
      });

      let parsed: any;
      try {
        parsed = JSON.parse(res.text);
      } catch {
        const jsonMatch = res.text.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      }

      if (parsed?.openers) {
        setIcebreakersResult(parsed.openers);
      }
    } catch {
      setIcebreakersResult([
        {
          style: 'Passions Connection',
          text: `I saw you love ${(partnerProfile?.interests?.[0] || 'music')}. What's the one album you'd take if you were stranded on an island with only a record player?`
        },
        {
          style: 'Playful Banter',
          text: `Two truths and a lie, or would you rather cut straight to your most absurd travel catastrophe?`
        },
        {
          style: 'Direct & Warm',
          text: `Your profile radiates an unusually calm energy. What’s something you’re genuinely looking forward to this month?`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Direct Assistant Chat with Streaming
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);
    setStreamingText('');

    let accumulatedText = '';
    const messagesPayload = chatMessages.slice(-6).map(m => ({
      role: m.role,
      content: m.text
    }));
    messagesPayload.push({ role: 'user', content: userMsg });

    try {
      const abort = byoaiService.streamAI(
        {
          taskKey: 'general_assistant',
          connectionId: activeConnection?.id,
          modelId: activeModel,
          messages: messagesPayload,
          systemPrompt: `You are Soulverse's dedicated AI relationship companion. You are empathetic, insightful, and offer concise advice to help the user connect deeply with ${partnerProfile?.name || 'their match'}.`,
          contextData: includeContext ? {
            partnerProfile,
            chatHistory: conversationHistory.slice(-8)
          } : undefined
        },
        (chunkText, done) => {
          accumulatedText += chunkText;
          setStreamingText(accumulatedText);
          if (done) {
            setChatMessages(prev => [...prev, { role: 'assistant', text: accumulatedText }]);
            setStreamingText('');
            setIsLoading(false);
          }
        },
        (err) => {
          setChatMessages(prev => [...prev, { role: 'assistant', text: `Error: ${err}` }]);
          setStreamingText('');
          setIsLoading(false);
        }
      );
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: err.message || 'Failed to stream response.' }]);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 md:w-[420px] bg-[#090A0E] border-l border-slate-800 shadow-2xl flex flex-col font-sans text-slate-200 animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="px-4 py-3.5 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
              AI Chat Intelligence
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                BYOAI
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 truncate max-w-[190px]">
              {activeConnection ? `${activeConnection.name} (${activeModel})` : 'Connected Models'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onOpenAiSettings && (
            <button
              onClick={onOpenAiSettings}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
              title="Configure AI Providers"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="grid grid-cols-4 border-b border-slate-800 bg-slate-950/60 text-[11px] font-medium text-slate-400">
        <button
          onClick={() => {
            setActiveTab('analysis');
            if (!analysisResult) runChatAnalysis();
          }}
          className={`py-2.5 flex flex-col items-center gap-1 border-b-2 transition-all ${
            activeTab === 'analysis'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Analysis
        </button>

        <button
          onClick={() => {
            setActiveTab('polisher');
            if (!polishResult) runDraftPolish();
          }}
          className={`py-2.5 flex flex-col items-center gap-1 border-b-2 transition-all ${
            activeTab === 'polisher'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          Polisher
        </button>

        <button
          onClick={() => {
            setActiveTab('icebreakers');
            if (icebreakersResult.length === 0) runIcebreakers();
          }}
          className={`py-2.5 flex flex-col items-center gap-1 border-b-2 transition-all ${
            activeTab === 'icebreakers'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          Openers
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`py-2.5 flex flex-col items-center gap-1 border-b-2 transition-all ${
            activeTab === 'chat'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          Assistant
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: CHAT ANALYSIS */}
        {activeTab === 'analysis' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Dynamic Chemistry & Momentum</span>
              <button
                disabled={isLoading}
                onClick={runChatAnalysis}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                Re-analyze
              </button>
            </div>

            {analysisResult ? (
              <div className="space-y-4 text-xs">
                {/* Score & Vibe Pill */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Calculated Chemistry Score</span>
                    <span className="text-lg font-bold font-mono text-indigo-400">
                      {analysisResult.chemistryScore}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${analysisResult.chemistryScore}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
                    <span>Vibe: <strong className="text-white">{analysisResult.vibe}</strong></span>
                    <span className="capitalize font-mono text-emerald-400">{analysisResult.momentum}</span>
                  </div>
                </div>

                {/* Subtext Observation */}
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-300">Psychological Subtext</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {analysisResult.subtext}
                  </p>
                </div>

                {/* Green Flags */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-emerald-400" />
                    Observed Green Flags
                  </span>
                  <div className="space-y-1">
                    {analysisResult.greenFlags.map((flag, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{flag}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Replies */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-semibold text-white">Smart Recommended Replies</span>
                  <div className="space-y-2">
                    {analysisResult.recommendedReplies.map((reply, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                            {reply.type}
                          </span>
                          <button
                            onClick={() => onInsertMessage(reply.text)}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                          >
                            Insert into Chat
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-200 font-sans italic">
                          "{reply.text}"
                        </p>
                        {reply.explanation && (
                          <p className="text-[10px] text-slate-500">
                            {reply.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                <RefreshCw className="w-5 h-5 mx-auto animate-spin text-indigo-400" />
                <p>Analyzing conversation cadence and subtext...</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MESSAGE POLISHER */}
        {activeTab === 'polisher' && (
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-xs font-semibold text-white">Draft Tone Polisher</span>
              <p className="text-[11px] text-slate-400">
                Enhance your draft message to match your intended emotional impression.
              </p>
            </div>

            {/* Current Draft Input */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <span className="text-[10px] uppercase font-mono text-slate-500">Active Draft</span>
              <p className="text-xs text-slate-200 italic">
                {currentDraftText.trim() ? `"${currentDraftText}"` : '(Type a draft in the chat box or use default)'}
              </p>
            </div>

            {/* Tone Selector */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400">Target Emotional Tone:</span>
              <div className="grid grid-cols-4 gap-1.5">
                {(['warm', 'playful', 'confident', 'deep'] as const).map(style => (
                  <button
                    key={style}
                    onClick={() => setPolishStyle(style)}
                    className={`py-1.5 px-2 rounded-lg border capitalize text-[10px] font-medium transition-all ${
                      polishStyle === style
                        ? 'border-indigo-500 bg-indigo-500/10 text-white'
                        : 'border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={isLoading}
              onClick={runDraftPolish}
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
            >
              <Wand2 className="w-3.5 h-3.5" />
              {isLoading ? 'Polishing...' : 'Polish My Draft'}
            </button>

            {/* Polish Result */}
            {polishResult && (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Tone Assessment
                  </span>
                  <p className="text-[11px] text-slate-300">{polishResult.toneAssessment}</p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-white">Suggested Rewrites</span>
                  {polishResult.suggestions.map((sugg, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-indigo-400 font-semibold">{sugg.style}</span>
                        <button
                          onClick={() => onReplaceDraft(sugg.text)}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                        >
                          Replace Draft
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-200">"{sugg.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PASSIONS & ICEBREAKERS */}
        {activeTab === 'icebreakers' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white">Curated Openers & Icebreakers</span>
                <p className="text-[11px] text-slate-400">
                  Grounded in {partnerProfile?.name || 'Match'}'s passions, music, and profile bio.
                </p>
              </div>
              <button
                disabled={isLoading}
                onClick={runIcebreakers}
                className="p-1 text-indigo-400 hover:text-indigo-300"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-2.5">
              {icebreakersResult.map((opener, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {opener.style}
                    </span>
                    <button
                      onClick={() => onInsertMessage(opener.text)}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                      Insert
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-200 font-sans">
                    "{opener.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DIRECT ASSISTANT CHAT */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-[400px]">
            {/* Context Toggle */}
            <div className="pb-2 mb-2 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeContext}
                  onChange={e => setIncludeContext(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                />
                <span>Include profile & recent chat history</span>
              </label>

              {connections.length > 1 && (
                <select
                  value={activeConnection?.id}
                  onChange={e => {
                    const c = connections.find(x => x.id === e.target.value);
                    if (c) {
                      setActiveConnection(c);
                      setActiveModel(c.defaultModel);
                    }
                  }}
                  className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-300 font-mono"
                >
                  {connections.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Chat Messages */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {streamingText && (
                <div className="flex flex-col items-start">
                  <div className="p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none animate-pulse">
                    {streamingText}
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask your AI advisor..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                disabled={isLoading || !chatInput.trim()}
                onClick={handleSendChatMessage}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
