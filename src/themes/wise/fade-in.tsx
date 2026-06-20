"use client";
import React, { ReactNode } from "react";
import { motion } from "motion/react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, y = 30, duration = 0.7, className }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "50px", amount: 0.1 }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
