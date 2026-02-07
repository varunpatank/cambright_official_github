"use client";

import { useState } from "react";
import { ChatHistory, ChatSettings, Message, MessageRole } from "@/types";
import MessageWindow from "@/components/MessageWindow";
import ChatInput from "@/components/AIChatInput";
import SettingsModal from "@/components/SettingsModal";
import { Bot, Sparkles, Zap, BookOpen, GraduationCap } from "lucide-react";

interface ClientChatProps {
  userImg: string | null;
}

const SUGGESTION_PROMPTS = [
  { icon: BookOpen, text: "Explain photosynthesis step by step", color: "from-green-500 to-emerald-500" },
  { icon: Zap, text: "Help me solve quadratic equations", color: "from-yellow-500 to-orange-500" },
  { icon: GraduationCap, text: "What are the key themes in Macbeth?", color: "from-blue-500 to-cyan-500" },
  { icon: Sparkles, text: "Explain Newton's laws of motion", color: "from-purple-500 to-pink-500" },
];

export default function ClientChat({ userImg }: ClientChatProps) {
  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState<ChatHistory>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>({
    temperature: 0.7,
    model: "google/gemma-3-4b-it:free",
    sysTemInstructions:
      "You are Tuto AI, a helpful assistant for students who do IGCSE and A-Levels Cambridge and Edexcel, to help them ace their exams. You are trained by Cambright. Your name is Tuto AI.",
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

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-b from-[#0a0a0f] via-[#0e0c15] to-[#0a0a0f]">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Bot size={20} className="text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0e0c15]"></span>
          </div>
          <div>
            <h1 className="text-base font-bold text-white font-sora">Tuto AI</h1>
            <p className="text-[11px] text-gray-400">Your IGCSE & A-Level Study Assistant</p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto">
        {history.length === 0 ? (
          /* Welcome Screen */
          <div className="h-full flex flex-col items-center justify-center px-6 py-12">
            <div className="max-w-2xl mx-auto text-center">
              {/* Animated Logo */}
              <div className="relative mb-8">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 flex items-center justify-center shadow-2xl shadow-purple-500/30 animate-pulse">
                  <Bot size={48} className="text-white" />
                </div>
                <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-600 to-blue-500 opacity-20 blur-xl animate-pulse"></div>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-3 font-sora">
                Welcome to <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Tuto AI</span>
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                Your intelligent study companion for IGCSE and A-Level exams. Ask me anything about your subjects!
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-3 mb-10">
                {["📚 All Subjects", "✨ Exam Tips", "🧮 Step-by-Step Solutions", "📝 Essay Help"].map((feature, i) => (
                  <span key={i} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 backdrop-blur-sm">
                    {feature}
                  </span>
                ))}
              </div>

              {/* Suggestion Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                {SUGGESTION_PROMPTS.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="group relative p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all duration-300 text-left overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${suggestion.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    <div className="relative flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${suggestion.color} shadow-lg`}>
                        <suggestion.icon size={16} className="text-white" />
                      </div>
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors leading-relaxed">
                        {suggestion.text}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <MessageWindow history={history} userImg={userImg} isLoading={loading} />
        )}
      </div>

      {/* Fixed Input Area */}
      <div className="flex-shrink-0">
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
          systemInstruction: settings.sysTemInstructions || "You are Tuto AI, a helpful assistant for students who do IGCSE and A-Levels Cambridge and Edexcel, to help them ace their exams. You are trained by Cambright. Your name is Tuto AI.",
        }}
      />
    </div>
  );
}
