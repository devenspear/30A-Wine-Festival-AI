'use client';

export default function TypingIndicator() {
  return (
    <div className="flex items-start px-4 animate-message-in">
      <div className="chat-bubble-ai px-5 py-3.5 flex items-center gap-1.5">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
