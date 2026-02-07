"use client";
import { useState } from "react";
import { Settings, Send, X } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onOpenSettings: () => void;
  loading: boolean;
}

export default function ChatInput({
  onSend,
  onOpenSettings,
  loading,
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!loading) setMessage(e.target.value);
  };

  const handleSend = () => {
    if (message.trim() && !loading) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessage("");
  };

  return (
    <div className="border-t border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl">
      <div className="max-w-3xl mx-auto w-full px-4 py-3">
        <div className="relative flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2 focus-within:border-purple-500/50 transition-all duration-300">
          <div className="relative flex-1">
            <textarea
              disabled={loading}
              className={`w-full min-h-[40px] max-h-32 px-3 py-2 bg-transparent text-white placeholder-gray-400 border-none focus:outline-none resize-none scrollbar-hide font-sora text-sm leading-relaxed ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              placeholder={
                loading ? "Thinking..." : "Ask Tuto AI anything..."
              }
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyPress}
              rows={1}
            />
            {message && !loading && (
              <button
                onClick={handleClear}
                aria-label="Clear input"
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-white/5 transition-all"
              aria-label="Open settings"
              disabled={loading}
            >
              <Settings size={16} />
            </button>
            
            <button
              onClick={handleSend}
              disabled={!message.trim() || loading}
              aria-label="Send message"
              className={`relative p-2 rounded-lg transition-all duration-300 ${
                !message.trim() || loading
                  ? "bg-white/5 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-500/25"
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
