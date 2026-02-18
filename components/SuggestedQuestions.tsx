'use client';

import { motion } from 'framer-motion';

interface SuggestedQuestionsProps {
  questions: { emoji: string; text: string }[];
  onSelect: (question: string) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function SuggestedQuestions({ questions, onSelect }: SuggestedQuestionsProps) {
  return (
    <motion.div
      className="grid grid-cols-2 gap-2 px-4 max-w-[var(--chat-max-width)] mx-auto"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {questions.map((q, i) => (
        <motion.button
          key={i}
          variants={item}
          className="suggestion-card text-left px-3 py-3 rounded-xl"
          style={{
            background: 'var(--bg-suggestion)',
            border: '1px solid var(--border-card)',
            boxShadow: 'var(--shadow-sm)',
          }}
          onClick={() => onSelect(q.text)}
        >
          <span className="text-lg block mb-1">{q.emoji}</span>
          <span
            className="text-sm leading-tight block"
            style={{ color: 'var(--text-primary)', fontWeight: 500 }}
          >
            {q.text}
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
}
