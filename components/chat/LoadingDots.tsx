'use client';

import { motion } from 'framer-motion';

export default function LoadingDots() {
  return (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-gray-400"
          animate={{
            y: ['0%', '-50%', '0%'],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
} 