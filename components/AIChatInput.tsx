"use client";
import { useState } from "react";
import { Settings, Send, X } from "lucide-react";
interface ChatInputProps {
  onSend: (message: string) => void;
  onOpenSettings: () => void;
  loading: boolean; // <-- new prop
}

export default function ChatInput({
  onSend,
  onOpenSettings,
  loading,
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!loading) setMessage(e.target.value); // disable typing when loading
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
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent pointer-events-none">
      <div className="max-w-4xl mx-auto w-full px-4 pb-4 pointer-events-auto">
        <div className="flex items-center gap-2 bg-n-7 border border-white/10 rounded-2xl p-3 shadow-xl backdrop-blur-md">
          <div className="relative flex-1">
            <textarea
              disabled={loading} // disable textarea when loading
              className={`w-full h-12 max-h-36 px-4 py-2 bg-transparent text-white placeholder-gray-400 border-none focus:outline-none resize-none scrollbar-hide ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              placeholder={
                loading ? "Tuto AI is typing..." : "Ask Tuto AI something..."
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
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full text-gray-400 hover:text-purple-500 transition"
            aria-label="Open settings"
            disabled={loading}
          >
            <Settings size={20} />
          </button>
          <button
            onClick={handleSend}
            disabled={!message.trim() || loading}
            aria-label="Send message"
            className={`p-2 rounded-full transition ${
              !message.trim() || loading
                ? "bg-n-5 text-gray-400 cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
