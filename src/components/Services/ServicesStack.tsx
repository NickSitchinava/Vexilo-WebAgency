"use client";

import { Children, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import styles from "./services.module.css";

export interface ServicesStackProps {
  children: React.ReactNode;
  ariaLabel?: string;
}

function StackCard({
  index,
  isLast,
  reducedMotion,
  children,
}: {
  index: number;
  isLast: boolean;
  reducedMotion: boolean;
  children: React.ReactNode;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, isLast ? 1 : 0.92]);
  const opacity = useTransform(scrollYProgress, [0.6, 1], [1, isLast ? 1 : 0.6]);

  return (
    <div ref={wrapperRef} className={styles.cardWrapper} style={{ zIndex: index + 1 }}>
      <motion.div
        className={styles.cardSticky}
        style={reducedMotion ? undefined : { scale, opacity }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export default function ServicesStack({ children, ariaLabel }: ServicesStackProps) {
  const prefersReducedMotion = useReducedMotion();
  const items = Children.toArray(children);

  return (
    <div className={styles.stack} aria-label={ariaLabel}>
      {items.map((child, index) => (
        <StackCard
          key={index}
          index={index}
          isLast={index === items.length - 1}
          reducedMotion={!!prefersReducedMotion}
        >
          {child}
        </StackCard>
      ))}
    </div>
  );
}