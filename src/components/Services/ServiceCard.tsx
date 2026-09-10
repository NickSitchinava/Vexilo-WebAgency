"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Check, Code2, Layout, TrendingUp, type LucideIcon } from "lucide-react";
import { BorderRotate } from "@/components/ui/animated-gradient-border";
import type { ServiceItem } from "@/i18n/dictionaries";
import { useServicesCursor } from "./ServicesCursor";
import styles from "./services.module.css";

const serviceIcons: LucideIcon[] = [Code2, Layout, TrendingUp];

export interface ServiceCardTheme {
  stageBg: string;
  stageInk: string;
  stageInkMuted: string;
  stageInkFaint: string;
  cardBg: string;
  cardInk: string;
  borderColors: { primary: string; secondary: string; accent: string };
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const featureRow = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0 },
};

const EASE = [0.16, 1, 0.3, 1] as const;

function CascadeChars({ text }: { text: string }) {
  return (
    <>
      {[...text].map((char, index) => (
        <span
          key={index}
          className={styles.cascadeChar}
          style={{ transitionDelay: `${index * 18}ms` }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </>
  );
}

function LearnMoreButton({
  href,
  label,
  theme,
  locale,
}: {
  href: string;
  label: string;
  theme: ServiceCardTheme;
  locale: string;
}) {
  const cursor = useServicesCursor();
  const prefersReducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 280, damping: 22, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 280, damping: 22, mass: 0.4 });
  const arrowX = useTransform(springX, (value) => value * 0.5);
  const arrowY = useTransform(springY, (value) => value * 0.5);

  const handlePointerMove = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (prefersReducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <BorderRotate
      animationMode="auto-rotate"
      animationSpeed={8}
      gradientColors={theme.borderColors}
      backgroundColor={theme.cardBg}
      borderWidth={1.5}
      borderRadius={999}
      className={styles.learnMoreFrame}
    >
      <motion.a
        href={href}
        lang={locale}
        className={styles.learnMore}
        style={{
          x: springX,
          y: springY,
          background: theme.cardInk,
          color: theme.cardBg,
        }}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => cursor?.setActive(true)}
        onPointerLeave={() => {
          reset();
          cursor?.setActive(false);
        }}
        whileTap={{ scale: 0.95 }}
      >
        <span>{label}</span>
        <motion.span className={styles.learnMoreIcon} style={{ x: arrowX, y: arrowY }}>
          <ArrowUpRight size={14} strokeWidth={2.25} />
        </motion.span>
      </motion.a>
    </BorderRotate>
  );
}

export function ServiceCard({
  service,
  index,
  locale,
  theme,
  learnMoreLabel,
}: {
  service: ServiceItem;
  index: number;
  locale: string;
  theme: ServiceCardTheme;
  learnMoreLabel: string;
}) {
  const Icon = serviceIcons[index % serviceIcons.length];

  return (
    <div className={styles.composition}>
      <div className={styles.backLayer}>
        <span className={styles.iconBadge} aria-hidden="true">
          <Icon size={26} strokeWidth={1.5} />
        </span>
        <h3 className={styles.title} itemProp="name" lang={locale}>
          <span className={styles.cascadeWrap}>
            <CascadeChars text={service.title} />
          </span>
        </h3>
      </div>

      <div className={styles.content} style={{ borderColor: theme.borderColors.primary }}>
        <div className={styles.cardHeader}>
          <span className={styles.cardLabel} style={{ color: theme.stageInkFaint }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <LearnMoreButton
            href={`/${locale}/services/${service.slug}`}
            label={learnMoreLabel}
            theme={theme}
            locale={locale}
          />
        </div>

        <p className={styles.cardText} style={{ color: theme.stageInk }} lang={locale}>
          {service.description}
        </p>
        <p className={styles.cardDetails} style={{ color: theme.stageInkMuted }} lang={locale}>
          {service.details}
        </p>

        <motion.ul
          className={styles.cardFeatures}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          lang={locale}
        >
          {service.features.map((feature) => (
            <motion.li
              key={feature}
              className={styles.cardFeatureItem}
              style={{ color: theme.stageInkMuted }}
              variants={featureRow}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <Check size={14} strokeWidth={2.25} style={{ color: theme.stageInkFaint }} />
              <span>{feature}</span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
}