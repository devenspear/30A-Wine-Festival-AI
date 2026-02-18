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
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export default function SuggestedQuestions({ questions, onSelect }: SuggestedQuestionsProps) {
  return (
    <motion.div
      className="grid grid-cols-2 gap-2.5 px-4"
      style={{ maxWidth: 'var(--chat-max-width)', marginLeft: 'auto', marginRight: 'auto' }}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {questions.map((q, i) => (
        <motion.button
          key={i}
          variants={item}
          className="suggestion-card text-left"
          style={{ padding: '14px 16px' }}
          onClick={() => onSelect(q.text)}
          whileTap={{ scale: 0.96 }}
        >
          <span style={{ fontSize: '24px', display: 'block', marginBottom: '6px' }}>{q.emoji}</span>
          <span style={{
            fontSize: '14px',
            lineHeight: '1.35',
            fontWeight: 500,
            color: 'var(--text-primary)',
            display: 'block',
          }}>
            {q.text}
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
}
