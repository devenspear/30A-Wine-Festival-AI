'use client';

import { motion } from 'framer-motion';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-4`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <div
        className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}
        style={{ padding: '10px 16px' }}
      >
        <p
          className="whitespace-pre-wrap leading-relaxed"
          style={{ fontSize: 'var(--font-size-base)' }}
        >
          {content}
        </p>
      </div>
    </motion.div>
  );
}
