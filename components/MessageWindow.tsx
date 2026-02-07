"use client";
import { useRef, useEffect, useState, useMemo } from "react";
import { ChatHistory } from "@/types";
import { Bot, User, Copy, Check } from "lucide-react";
import Image from "next/image";

// Simple markdown formatter
function formatMarkdown(text: string): React.ReactNode[] {
  // Process the text line by line for better control
  const lines = text.split('\n');
  
  return lines.map((line, lineIndex) => {
    const elements: React.ReactNode[] = [];
    let lineRemaining = line;
    let elemKey = 0;

    // Process bold (**text**), italic (*text*), and code (`text`)
    while (lineRemaining.length > 0) {
      const boldMatch = lineRemaining.match(/\*\*(.+?)\*\*/);
      const codeMatch = lineRemaining.match(/\x60([^\x60]+)\x60/); // Using hex for backtick
      
      // Find the earliest match
      let earliestMatch: { match: RegExpMatchArray; type: string } | null = null;
      
      if (boldMatch && boldMatch.index !== undefined) {
        earliestMatch = { match: boldMatch, type: 'bold' };
      }
      if (codeMatch && codeMatch.index !== undefined) {
        if (!earliestMatch || codeMatch.index < (earliestMatch.match.index || 0)) {
          earliestMatch = { match: codeMatch, type: 'code' };
        }
      }

      if (earliestMatch && earliestMatch.match.index !== undefined) {
        // Add text before the match
        if (earliestMatch.match.index > 0) {
          elements.push(<span key={`${lineIndex}-${elemKey++}`}>{lineRemaining.slice(0, earliestMatch.match.index)}</span>);
        }
        
        // Add the formatted element
        if (earliestMatch.type === 'bold') {
          elements.push(<strong key={`${lineIndex}-${elemKey++}`} className="font-semibold text-white">{earliestMatch.match[1]}</strong>);
        } else if (earliestMatch.type === 'code') {
          elements.push(<code key={`${lineIndex}-${elemKey++}`} className="px-1.5 py-0.5 rounded bg-white/10 text-purple-300 font-mono text-sm">{earliestMatch.match[1]}</code>);
        }
        
        lineRemaining = lineRemaining.slice(earliestMatch.match.index + earliestMatch.match[0].length);
      } else {
        // No more matches, add the rest
        if (lineRemaining) {
          elements.push(<span key={`${lineIndex}-${elemKey++}`}>{lineRemaining}</span>);
        }
        break;
      }
    }

    return (
      <span key={lineIndex}>
        {elements}
        {lineIndex < lines.length - 1 && <br />}
      </span>
    );
  });
}

interface MessageWindowProps {
  history: ChatHistory;
  userImg: string | null;
  isLoading?: boolean;
}

function TypingDots() {
  return (
    <span className="typing-dots">
      <span>.</span>
      <span>.</span>
      <span>.</span>

      <style jsx>{`
        .typing-dots {
          display: inline-flex;
          gap: 4px;
          font-weight: 600;
          font-size: 1.25rem;
        }
        .typing-dots span {
          animation-name: blink;
          animation-duration: 1.4s;
          animation-iteration-count: infinite;
          animation-fill-mode: both;
        }
        .typing-dots span:nth-child(1) {
          animation-delay: 0s;
        }
        .typing-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes blink {
          0%,
          80%,
          100% {
            opacity: 0.3;
          }
          40% {
            opacity: 1;
          }
        }
      `}</style>
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white"
      title="Copy message"
    >
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
    </button>
  );
}

export default function MessageWindow({
  history,
  userImg,
  isLoading = false,
}: MessageWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  return (
    <div className="h-full overflow-y-auto px-4 py-4 bg-transparent text-sm">
      <div className="max-w-3xl mx-auto flex flex-col gap-4 pb-4">
        {history.map((msg, index) => {
          const isUser = msg.role === "user";
          const messageText = msg.parts.map(p => p.text).join("");

          return (
            <div
              key={index}
              className={`group flex items-start gap-3 ${
                isUser ? "flex-row-reverse" : "flex-row"
              } animate-in slide-in-from-bottom-2 duration-300`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0 mt-1">
                {isUser ? (
                  userImg ? (
                    <Image
                      src={userImg}
                      alt="User"
                      width={36}
                      height={36}
                      className="rounded-full object-cover shadow-lg ring-2 ring-purple-500/20"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
                      <User size={18} className="text-white" />
                    </div>
                  )
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Bot size={18} className="text-white" />
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
                <span className="text-xs text-gray-500 px-1">
                  {isUser ? "You" : "Tuto AI"}
                </span>
                <div
                  className={`relative px-4 py-3 rounded-2xl shadow-lg ${
                    isUser
                      ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-tr-sm"
                      : "bg-white/5 border border-white/10 text-gray-100 rounded-tl-sm backdrop-blur-sm"
                  }`}
                >
                  <div className="break-words leading-relaxed">
                    {isUser ? (
                      msg.parts.map((part, idx) => (
                        <span key={idx}>{part.text}</span>
                      ))
                    ) : (
                      formatMarkdown(messageText)
                    )}
                  </div>
                </div>
                
                {/* Copy button for AI messages */}
                {!isUser && (
                  <div className="flex items-center gap-2 px-1">
                    <CopyButton text={messageText} />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex-shrink-0 mt-1">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20 animate-pulse">
                <Bot size={18} className="text-white" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 px-1">Tuto AI</span>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                  <span className="text-gray-400 text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
