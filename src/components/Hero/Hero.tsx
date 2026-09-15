"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button/Button";
import InkReveal from "@/components/Hero/InkReveal";
import MeshText from "@/components/Hero/MeshText";
import HeroCursor from "@/components/Hero/HeroCursor";
import { useLoaderReveal } from "@/components/ArcRevealHero/LoaderContext";
import { dictionaries } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import styles from "./Hero.module.css";

const HEADLINE_FONT_WEIGHT = 600;
const HEADLINE_FONT_FAMILY = "Poppins";
const HEADLINE_MAX_FONT_SIZE = 96;
const HEADLINE_MIN_FONT_SIZE = 30;
const HEADLINE_VIEWPORT_MARGIN = 24;
const HEADLINE_SAFETY_FACTOR = 0.88;
const HEADLINE_BOX_BUFFER = 1.18;

function measureLineWidths(lines: string[], fontSize: number): number[] {
  if (typeof document === "undefined") return lines.map(() => 0);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return lines.map(() => 0);
  ctx.font = `${HEADLINE_FONT_WEIGHT} ${fontSize}px ${HEADLINE_FONT_FAMILY}, sans-serif`;
  return lines.map((line) => ctx.measureText(line).width);
}

function fitFontSizeToViewport(
  lines: string[],
  viewportWidth: number
): number {
  const availableWidth = Math.max(
    viewportWidth - HEADLINE_VIEWPORT_MARGIN * 2,
    1
  );
  const widthsAtMax = measureLineWidths(lines, HEADLINE_MAX_FONT_SIZE);
  const widestAtMax = Math.max(...widthsAtMax, 1);
  const scaled =
    HEADLINE_MAX_FONT_SIZE *
    (availableWidth / (widestAtMax * HEADLINE_BOX_BUFFER)) *
    HEADLINE_SAFETY_FACTOR;
  const cappedMax = HEADLINE_MAX_FONT_SIZE * HEADLINE_SAFETY_FACTOR;
  return Math.min(cappedMax, Math.max(HEADLINE_MIN_FONT_SIZE, Math.floor(scaled)));
}

const EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const BG_IMAGE_URL = "/images/HeroBG.webp";

export default function Hero({ locale }: { locale: Locale }) {
  const isRevealed = useLoaderReveal();
  const animate = isRevealed ? "visible" : "hidden";
  const prefersReducedMotion = useReducedMotion();
  const t = dictionaries[locale].hero;
  const sectionRef = useRef<HTMLElement>(null);

  const headlineLines = t.headlineLines ?? [t.headlinePrefix + t.headlineEmphasis];
  const trustLine =
    locale === "ka"
      ? "სანდო თბილისში მოქმედი ბიზნესებისთვის"
      : "Trusted by service businesses across Georgia";
  const [fontSize, setFontSize] = useState<number | null>(null);
  const [lineWidths, setLineWidths] = useState<number[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    const recompute = () => {
      if (cancelled || typeof window === "undefined") return;
      const size = fitFontSizeToViewport(headlineLines, window.innerWidth);
      setFontSize(size);
      setLineWidths(measureLineWidths(headlineLines, size));
    };

    const debouncedRecompute = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(recompute, 150);
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(recompute).catch(recompute);
    } else {
      recompute();
    }

    window.addEventListener("resize", debouncedRecompute);
    return () => {
      cancelled = true;
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener("resize", debouncedRecompute);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headlineLines.join("|")]);

  const ready = fontSize !== null && lineWidths !== null;
  const lineHeightPx = ready ? Math.round(fontSize! * 1.32) : null;
  const sharedBoxWidth =
    ready && lineWidths!.length > 0
      ? Math.ceil(Math.max(...lineWidths!) * HEADLINE_BOX_BUFFER)
      : null;

  return (
    <section id="home" ref={sectionRef} className={styles.hero} aria-label="Introduction">
      <HeroCursor containerRef={sectionRef} />

      <div className={styles.canvasLayer} aria-hidden="true">
        <Image
          src={BG_IMAGE_URL}
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.bgImage}
        />
        <InkReveal className={styles.inkCanvas} maskColor={[244, 243, 240]} brushSize={160} />
        <div className={styles.mobileScrim} aria-hidden="true" />
      </div>

      <div className={styles.content}>
        <div className={styles.textBlock}>
          <motion.span
            className={styles.eyebrow}
            lang={locale}
            initial="hidden"
            animate={animate}
            variants={fadeUp}
            transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
          >
            <span className={styles.eyebrowMark} aria-hidden="true" />
            <span className={styles.eyebrowBrand}>Flevio</span>
            <span aria-hidden="true"> · </span>
            {t.eyebrow}
          </motion.span>

          <motion.h1
            className={styles.headline}
            initial="hidden"
            animate={animate}
            variants={fadeUp}
            transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
          >
            {headlineLines.map((line, index) => {
              return (
                <div
                  key={index}
                  className={styles.headlineLine}
                  style={{
                    width: sharedBoxWidth ? `${sharedBoxWidth}px` : undefined,
                    maxWidth: "100%",
                    height: lineHeightPx ? `${lineHeightPx}px` : undefined,
                  }}
                >
                  <span
                    aria-hidden="true"
                    className={`${styles.headlineFallback} ${ready ? styles.headlineFallbackReady : ""}`}
                    style={{
                      fontSize: fontSize ? `${fontSize}px` : undefined,
                      opacity: ready ? 0 : 1,
                    }}
                  >
                    {line}
                  </span>
                  {ready && (
                    <MeshText
                      text={line}
                      color="#111111"
                      fontFamily={HEADLINE_FONT_FAMILY}
                      fontWeight={HEADLINE_FONT_WEIGHT}
                      colorSplit={false}
                      fontSize={fontSize!}
                      force={prefersReducedMotion ? 0 : 16}
                    />
                  )}
                  <span lang={locale} className={styles.headlineSrOnly}>
                    {line}
                  </span>
                </div>
              );
            })}
          </motion.h1>

          <motion.p
            className={styles.subhead}
            lang={locale}
            initial="hidden"
            animate={animate}
            variants={fadeUp}
            transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}
          >
            {t.subhead}
          </motion.p>

          <motion.p
            className={styles.trustLine}
            lang={locale}
            initial="hidden"
            animate={animate}
            variants={fadeUp}
            transition={{ duration: 0.7, ease: EASE, delay: 0.35 }}
          >
            <span className={styles.trustDot} aria-hidden="true" />
            <span className={styles.trustText}>{trustLine}</span>
          </motion.p>
        </div>

        <motion.div
          className={styles.actions}
          initial="hidden"
          animate={animate}
          variants={fadeUp}
          transition={{ duration: 0.7, ease: EASE, delay: 0.45 }}
        >
          <Button
            href="#projects"
            className={styles.primaryCta}
            style={
              {
                "--btn-bg": "var(--color-accent)",
                "--btn-fg": "#ffffff",
                "--btn-fill": "#111111",
                "--btn-fill-fg": "#f4f3f0",
              } as React.CSSProperties
            }
          >
            {t.primaryCta}
          </Button>
          <Button
            href="#contact"
            className={styles.secondaryCta}
            style={
              {
                "--btn-bg": "rgba(255,255,255,0.72)",
                "--btn-fg": "#111111",
                "--btn-border": "1px solid rgba(17,17,17,0.16)",
                "--btn-fill": "#111111",
                "--btn-fill-fg": "#f4f3f0",
              } as React.CSSProperties
            }
          >
            {t.secondaryCta}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}