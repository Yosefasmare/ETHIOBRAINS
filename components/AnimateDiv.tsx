"use client"; // ✅ Ensures this runs in a client component

import React from "react";
import { motion } from "framer-motion";

interface AnimateDivProps {
  children: React.ReactNode;
  className?: string;
  initial?: any;
  exit?: any;
  
}

const AnimateDiv: React.FC<AnimateDivProps> = ({ children, className, initial, exit }) => {
  return (
    <motion.div
      initial={initial || { opacity: 0, y: 20, scale: 0.95 }} // Default initial state
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6 }}
      exit={exit} 
      viewport={{ once: true }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimateDiv;
