'use client';

export default function TypingIndicator() {
  return (
    <div className="flex items-start px-4 animate-message-in">
      <div className="chat-bubble-ai" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
