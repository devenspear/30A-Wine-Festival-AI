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
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 12, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

export default function SuggestedQuestions({ questions, onSelect }: SuggestedQuestionsProps) {
  return (
    <motion.div
      className="grid grid-cols-2 gap-3 px-4"
      style={{ maxWidth: 'var(--chat-max-width)', marginLeft: 'auto', marginRight: 'auto' }}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {questions.map((q, i) => (
        <motion.button
          key={i}
          variants={item}
          className="suggestion-card text-left px-4 py-4"
          onClick={() => onSelect(q.text)}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-2xl block mb-1.5">{q.emoji}</span>
          <span
            className="text-sm leading-snug block"
            style={{ color: 'var(--text-primary)', fontWeight: 500 }}
          >
            {q.text}
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
}
