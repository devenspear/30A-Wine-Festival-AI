'use client';

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-message-in">
      <div
        className="chat-bubble-ai px-4 py-3 flex items-center gap-1.5"
      >
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
