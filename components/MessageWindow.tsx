"use client";
import { useRef, useEffect } from "react";
import { ChatHistory } from "@/types";
import { Bot, TypeIcon, User } from "lucide-react";
import Image from "next/image";
interface MessageWindowProps {
  history: ChatHistory;
  userImg: string | null;
  isLoading?: boolean; // optional flag for loading state
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
    <div className="flex-1 overflow-y-auto px-4 py-6 bg-[#0e0c15] text-sm sm:text-base">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        {/* Introductory muted text */}
        <p className="text-gray-400 text-center px-4 mb-6 select-none">
          Hello! I am Tuto AI, your friendly assistant here to help you ace your
          IGCSE and A-level exams. Ask me anything!
        </p>
        {history.map((msg, index) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={index}
              className={`flex items-end ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isUser && (
                <div className="mr-3 shrink-0">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-purple-100 shadow">
                    <Bot size={18} className="text-purple-800" />
                  </div>
                </div>
              )}

              <div
                className={`px-4 py-3 rounded-2xl shadow-md max-w-xs sm:max-w-md whitespace-pre-wrap break-words ${
                  isUser
                    ? "bg-purple-600 text-white rounded-br-sm"
                    : "bg-n-6 text-white rounded-bl-sm"
                }`}
              >
                {msg.parts.map((part, idx) => (
                  <span key={idx}>{part.text}</span>
                ))}
              </div>

              {isUser && (
                <div className="ml-3 shrink-0">
                  {userImg ? (
                    <Image
                      src={userImg}
                      alt="User Image"
                      width={36}
                      height={36}
                      className="rounded-full object-cover shadow"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-purple-600 shadow">
                      <User size={18} className="text-white" />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {isLoading && (
          <div className="flex items-end justify-start">
            <div className="mr-3 shrink-0">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-purple-100 shadow">
                <Bot size={18} className="text-purple-800" />
              </div>
            </div>
            <div className="px-4 py-3 rounded-2xl shadow-md max-w-xs sm:max-w-md bg-n-6 text-white rounded-bl-sm">
              <TypingDots />{" "}
            </div>
          </div>
        )}{" "}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
