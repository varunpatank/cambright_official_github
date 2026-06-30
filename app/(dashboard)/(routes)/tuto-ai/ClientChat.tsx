"use client";

import { useState } from "react";
import { ChatHistory, ChatSettings, Message, MessageRole } from "@/types";
import MessageWindow from "@/components/MessageWindow";
import ChatInput from "@/components/AIChatInput";
import SettingsModal from "@/components/SettingsModal";
import { Cover } from "@/components/ui/cover";
import { StarryBackground } from "@/components/ui/starry-background";
import { Bot, Sparkles, Zap, BookOpen, GraduationCap, Brain, Lightbulb } from "lucide-react";

interface ClientChatProps {
  userImg: string | null;
}

const SUGGESTION_PROMPTS = [
  { icon: BookOpen, text: "Explain photosynthesis step by step", color: "from-purple-500 to-purple-700" },
  { icon: Zap, text: "Help me solve quadratic equations", color: "from-purple-600 to-purple-800" },
  { icon: GraduationCap, text: "What are the key themes in Macbeth?", color: "from-purple-400 to-purple-600" },
  { icon: Sparkles, text: "Explain Newton's laws of motion", color: "from-purple-500 to-purple-700" },
  { icon: Brain, text: "Help me understand this concept", color: "from-purple-600 to-purple-800" },
  { icon: Lightbulb, text: "Give me exam tips for this topic", color: "from-purple-400 to-purple-600" },
];

export default function ClientChat({ userImg }: ClientChatProps) {
  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState<ChatHistory>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>({
    temperature: 0.7,
    model: "google/gemma-3-4b-it:free",
    sysTemInstructions:
      `You are Tuto, a helpful and knowledgeable assistant for students who do IGCSE and A-Levels Cambridge and Edexcel, to help them ace their exams. You are trained by Cambright. Your name is Tuto.

FORMATTING RULES (CRITICAL - ALWAYS FOLLOW):
- NEVER use hashtags (#, ##, ###) for headings
- Use **bold text** for important terms, concepts, and headings
- Use clear spacing between sections with blank lines
- Use colons (:) to introduce explanations and lists
- Structure your responses with clear sections separated by line breaks
- Use bullet points (•) or numbered lists for steps and multiple items
- Keep paragraphs short and well-spaced for readability
- Use underscores for emphasis on key points: _like this_
- Start responses with a brief, friendly acknowledgment when appropriate`,
  });

  const handleSend = async (message: string) => {
    if (loading) return;

    const newUserMessage: Message = {
      role: "user" as MessageRole,
      parts: [{ text: message }],
    };

    const updatedHistory = [...history, newUserMessage];
    setHistory(updatedHistory);

    setLoading(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userMessage: message,
          history: updatedHistory,
          settings: settings,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error("AI Error:", data.error);
        setLoading(false);
        return;
      }

      const aiMessage: Message = {
        role: "model" as MessageRole,
        parts: [{ text: data.response }],
      };

      setHistory([...updatedHistory, aiMessage]);
    } catch (error) {
      console.error("Request Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  const hasMessages = history.length > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-b from-[#0a0a0f] via-[#0e0c15] to-[#0a0a0f]">
      {/* Collapsible Header */}
      <div className={`flex-shrink-0 border-b border-white/5 bg-black/60 backdrop-blur-xl transition-all duration-500 ease-out ${
        hasMessages ? 'py-3 px-6' : 'py-10 px-6'
      }`}>
        <div className={`max-w-5xl mx-auto transition-all duration-500 ${hasMessages ? '' : 'text-center'}`}>
          <div className={`flex items-center transition-all duration-500 ${
            hasMessages ? 'gap-3' : 'flex-col gap-3'
          }`}>
            {/* Logo */}
            <div className="relative flex-shrink-0">
              <div className={`rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/20 transition-all duration-500 ${
                hasMessages ? 'w-9 h-9' : 'w-16 h-16'
              }`}>
                <Bot size={hasMessages ? 18 : 32} className="text-white" />
              </div>
              <span className={`absolute bg-green-500 rounded-full border-2 border-[#0e0c15] transition-all duration-500 ${
                hasMessages ? '-bottom-0.5 -right-0.5 w-2 h-2' : '-bottom-1 -right-1 w-3.5 h-3.5'
              }`}></span>
            </div>

            {/* Title */}
            <div>
              {hasMessages ? (
                <>
                  <h1 className="font-bold text-white font-sora text-base">Tuto</h1>
                  <p className="text-gray-500 text-xs">Online • Ready to help</p>
                </>
              ) : (
                <>
                  <h1 className="font-bold text-white font-sora text-4xl mb-1">
                    Tuto <span className="text-purple-400 drop-shadow-[0_0_20px_rgba(192,132,252,0.7)]">Intelligence</span>.
                  </h1>
                  <p className="text-gray-500 text-sm">Your CamBright study companion</p>
                </>
              )}
            </div>
          </div>

          {/* Quick prompts — only when no messages */}
          {!hasMessages && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-2 max-w-xl mx-auto">
              {SUGGESTION_PROMPTS.slice(0, 3).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 hover:bg-white/8 transition-all duration-200 text-left"
                >
                  <span className="text-xs text-gray-400 hover:text-gray-200 transition-colors line-clamp-2 leading-relaxed">
                    {suggestion.text}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Content - Expands when header shrinks */}
      <div className="flex-1 overflow-y-auto">
        {hasMessages && (
          <MessageWindow history={history} userImg={userImg} isLoading={loading} />
        )}
      </div>

      {/* Fixed Input Area */}
      <div className="flex-shrink-0 max-w-4xl mx-auto w-full px-4 pb-4">
        <ChatInput
          onSend={handleSend}
          onOpenSettings={() => setIsSettingsOpen(true)}
          loading={loading}
        />
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(newSettings) =>
          setSettings({
            ...newSettings,
            sysTemInstructions: newSettings.systemInstruction,
          })
        }
        currentSettings={{
          temperature: settings.temperature || 0.7,
          model: settings.model || "google/gemma-3-4b-it:free",
          systemInstruction: settings.sysTemInstructions || "You are Tuto, a helpful assistant for students who do IGCSE and A-Levels Cambridge and Edexcel, to help them ace their exams. You are trained by Cambright. Your name is Tuto.",
        }}
      />
    </div>
  );
}
