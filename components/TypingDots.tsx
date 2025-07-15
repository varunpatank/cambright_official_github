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
