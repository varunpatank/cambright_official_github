"use client";

import { useState } from "react";
import { ChatHistory, ChatSettings, Message, MessageRole } from "@/types";
import MessageWindow from "@/components/MessageWindow";
import ChatInput from "@/components/AIChatInput";
import SettingsModal from "@/components/SettingsModal";

interface ClientChatProps {
  userImg: string | null;
}

export default function ClientChat({ userImg }: ClientChatProps) {
  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState<ChatHistory>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>({
    temperature: 1,
    model: "gemini-1.5-flash",
    sysTemInstructions:
      "you are a helpful assistant for students who do IGCSE and Alevels Cambridge and Edexcel, to help them ace their exams, you are trained by Cambright (NOT BY google) Your name is Tuto AI (NOT GEMINI)",
  });

  const handleSend = async (message: string) => {
    if (loading) return; // prevent multiple sends while loading

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

  return (
    <div className="flex flex-col py-32 h-full">
      <MessageWindow history={history} userImg={userImg} isLoading={loading} />

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
          temperature: settings.temperature || 1,
          model: settings.model || "gemini-1.5-flash",
          systemInstruction: settings.sysTemInstructions || "you are a helpful assistant for students who do IGCSE and Alevels Cambridge and Edexcel, to help them ace their exams, you are trained by Cambright (NOT BY google) Your name is Tuto AI (NOT GEMINI)",
        }}
      />

      <ChatInput
        onSend={handleSend}
        onOpenSettings={() => setIsSettingsOpen(true)}
        loading={loading}
      />
    </div>
  );
}
