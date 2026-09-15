"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, animate } from "framer-motion";
import {
  Search,
  PenTool,
  Rocket,
  LifeBuoy,
  MapPin,
  Award,
  Zap,
  Languages,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import styles from "./about.module.css";

const Strands = dynamic(() => import("@/components/Strands/Strands"), {
  ssr: false,
});

const EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

type Locale = "en" | "ka";

interface AboutStep {
  title: string;
  description: string;
}

type AboutStatKind = "count" | "toggle";

interface AboutStat {
  kind: AboutStatKind;
  value?: number;
  prefix?: string;
  suffix?: string;
  toggleValues?: string[];
  label: string;
}

interface AboutContent {
  ariaLabel: string;
  eyebrow: string;
  locationBadge: string;
  headingLineOne: string;
  headingLineTwo: string;
  paragraph: string;
  stats: AboutStat[];
  steps: AboutStep[];
  cta: string;
}

const content: Record<Locale, AboutContent> = {
  en: {
    ariaLabel: "About us",
    eyebrow: "How We Work",
    locationBadge: "Tbilisi, Georgia",
    headingLineOne: "Thoughtful process,",
    headingLineTwo: "lasting results",
    paragraph:
      "We're a web design and development studio built for high-ticket local service businesses, HVAC, landscaping, and similar trades, that need a website which actually brings in calls. We study the problems specific to your industry, then design and build a site to solve them: fast to load, considered in every detail, and built to convert. From Tbilisi, we build for clients across Georgia and abroad.",
    stats: [
      { kind: "count", value: 5, suffix: "+", label: "Years Experience" },
      { kind: "count", value: 3, prefix: "Sub-", suffix: "s", label: "Page Load Time" },
      { kind: "toggle", toggleValues: ["EN", "KA"], label: "Fully Bilingual" },
    ],
    steps: [
      {
        title: "Discover",
        description:
          "We study the problems specific to your industry, HVAC scheduling, landscaping seasonality, whatever slows down calls and bookings, before any design work begins.",
      },
      {
        title: "Design",
        description:
          "We build a visual system around getting visitors to call, book, or request a quote, not just look good.",
      },
      {
        title: "Build & Launch",
        description:
          "We write clean, fast code and launch a site built to load in under 3 seconds, in English and Georgian if needed.",
      },
      {
        title: "Support & Iterate",
        description:
          "We keep watching performance after launch, and you can book updates or fixes whenever you need them.",
      },
    ],
    cta: "Start a Project",
  },
  ka: {
    ariaLabel: "ჩვენ შესახებ",
    eyebrow: "როგორ ვმუშაობთ",
    locationBadge: "თბილისი, საქართველო",
    headingLineOne: "გააზრებული პროცესი,",
    headingLineTwo: "ხანგრძლივი შედეგი",
    paragraph:
      "ჩვენ ვართ ვებ დიზაინისა და დეველოპმენტის სტუდია, რომელიც აშენებულია მაღალი ღირებულების სერვის ბიზნესებისთვის, მაგალითად HVAC და გამწვანების კომპანიები, რომლებსაც სჭირდებათ ვებსაიტი, რომელიც რეალურად მოაქვს ზარებს. ჩვენ ვსწავლობთ თქვენი ინდუსტრიისთვის დამახასიათებელ პრობლემებს და შემდეგ ვქმნით საიტს, რომელიც სწრაფად იტვირთება, გააზრებულია დეტალებში და აგებულია კონვერტაციისთვის. თბილისიდან ვმუშაობთ კლიენტებთან საქართველოს მასშტაბით და მის ფარგლებს გარეთ.",
    stats: [
      { kind: "count", value: 5, suffix: "+", label: "წლიანი გამოცდილება" },
      { kind: "count", value: 3, prefix: "Sub-", suffix: "s", label: "გვერდის ჩატვირთვის დრო" },
      { kind: "toggle", toggleValues: ["EN", "KA"], label: "სრულად ორენოვანი" },
    ],
    steps: [
      {
        title: "კვლევა",
        description:
          "ჩვენ ვსწავლობთ თქვენი ინდუსტრიისთვის დამახასიათებელ პრობლემებს, იქნება ეს HVAC-ის განრიგი თუ გამწვანების სეზონურობა, სანამ დიზაინზე გადავალთ.",
      },
      {
        title: "დიზაინი",
        description:
          "ვქმნით ვიზუალურ სისტემას, რომელიც აგებულია ვიზიტორების ზარზე, ჯავშანზე თუ შეკვეთაზე მოსაყვანად.",
      },
      {
        title: "აწყობა და გაშვება",
        description:
          "ვწერთ სუფთა და სწრაფ კოდს და ვუშვებთ საიტს, რომელიც იტვირთება 3 წამზე ნაკლებში, საჭიროებისამებრ ინგლისურ და ქართულ ენებზე.",
      },
      {
        title: "მხარდაჭერა და დახვეწა",
        description:
          "გაშვების შემდეგაც ვაკვირდებით საიტის მუშაობას, და შეგიძლიათ ნებისმიერ დროს დაჯავშნოთ განახლება, თუ რამის გამოსწორება დაგჭირდებათ.",
      },
    ],
    cta: "დაიწყეთ პროექტი",
  },
};

const stepIcons: LucideIcon[] = [Search, PenTool, Rocket, LifeBuoy];
const statIcons: LucideIcon[] = [Award, Zap, Languages];

function AnimatedCount({
  stat,
  active,
  reduceMotion,
}: {
  stat: AboutStat;
  active: boolean;
  reduceMotion: boolean;
}) {
  const target = stat.value ?? 0;
  const [display, setDisplay] = useState(reduceMotion ? target : 0);

  useEffect(() => {
    if (!active) return;
    if (reduceMotion) {
      setDisplay(target);
      return;
    }
    const controls = animate(0, target, {
      duration: 1.4,
      ease: EASE,
      onUpdate: (value) => setDisplay(Math.round(value)),
    });
    return () => controls.stop();
  }, [active, reduceMotion, target]);

  return (
    <>
      {stat.prefix}
      {display}
      {stat.suffix}
    </>
  );
}

function BilingualToggle({
  values,
  active,
  reduceMotion,
}: {
  values: string[];
  active: boolean;
  reduceMotion: boolean;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active || reduceMotion || values.length < 2) return;
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % values.length);
    }, 1800);
    return () => clearInterval(id);
  }, [active, reduceMotion, values.length]);

  const current = values[reduceMotion ? 0 : index] ?? "";

  return (
    <span className={styles.statToggle}>
      <AnimatePresence mode="wait">
        <motion.span
          key={current}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          {current}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export interface AboutProps {
  locale?: Locale;
}

export default function About({ locale = "en" }: AboutProps) {
  const t: AboutContent = content[locale];
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const evaluate = () => {
      setReduceMotion(motionQuery.matches);
    };
    evaluate();

    motionQuery.addEventListener("change", evaluate);
    return () => {
      motionQuery.removeEventListener("change", evaluate);
    };
  }, []);

  useEffect(() => {
    const compactQuery = window.matchMedia("(max-width: 900px)");

    const evaluate = () => {
      setIsCompact(compactQuery.matches);
    };
    evaluate();

    compactQuery.addEventListener("change", evaluate);
    return () => {
      compactQuery.removeEventListener("change", evaluate);
    };
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      setHasEnteredView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) {
          setHasEnteredView(true);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const showEffects = inView && !reduceMotion;

  return (
    <section
      ref={sectionRef}
      id="about"
      className={styles.about}
      aria-label={t.ariaLabel}
      lang={locale}
    >
      <div className={styles.inner}>
        <div className={styles.grid}>
          <motion.div
            className={styles.textCol}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.div
              className={styles.metaRow}
              variants={fadeUp}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <span className={styles.eyebrow}>{t.eyebrow}</span>
              <span className={styles.locationBadge}>
                <MapPin size={13} strokeWidth={2} />
                {t.locationBadge}
              </span>
            </motion.div>

            <motion.h2
              className={styles.heading}
              variants={fadeUp}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <span>{t.headingLineOne}</span>
              <span>{t.headingLineTwo}</span>
            </motion.h2>

            <motion.p
              className={styles.paragraph}
              variants={fadeUp}
              transition={{ duration: 0.6, ease: EASE }}
            >
              {t.paragraph}
            </motion.p>

            <motion.div
              className={styles.statsTrack}
              variants={fadeUp}
              transition={{ duration: 0.6, ease: EASE }}
              itemScope
              itemType="https://schema.org/Organization"
            >
              <div className={styles.statsNumbers}>
                {t.stats.map((stat) => (
                  <span
                    key={stat.label}
                    className={styles.statCell}
                    itemProp="additionalProperty"
                    itemScope
                    itemType="https://schema.org/PropertyValue"
                  >
                    <meta itemProp="name" content={stat.label} />
                    <span
                      className={styles.statNumber}
                      itemProp={stat.kind === "count" ? "value" : undefined}
                    >
                      {stat.kind === "count" ? (
                        <AnimatedCount stat={stat} active={hasEnteredView} reduceMotion={reduceMotion} />
                      ) : (
                        <BilingualToggle
                          values={stat.toggleValues ?? []}
                          active={hasEnteredView}
                          reduceMotion={reduceMotion}
                        />
                      )}
                    </span>
                  </span>
                ))}
              </div>

              <div className={styles.statsIconRow}>
                <span className={styles.statsLine} aria-hidden="true" />
                {showEffects && (
                  <motion.span
                    className={styles.statsPulse}
                    animate={{ left: ["6%", "94%"] }}
                    transition={{
                      duration: 5,
                      ease: "linear",
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                    aria-hidden="true"
                  />
                )}
                {t.stats.map((stat, index) => {
                  const Icon: LucideIcon = statIcons[index];
                  return (
                    <span key={stat.label} className={styles.statCell}>
                      <span className={styles.statIconNode} aria-hidden="true">
                        <Icon size={15} strokeWidth={1.75} />
                      </span>
                    </span>
                  );
                })}
              </div>

              <div className={styles.statsLabels}>
                {t.stats.map((stat) => (
                  <span key={stat.label} className={styles.statCell}>
                    <span className={styles.statLabel}>{stat.label}</span>
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <Button
                href="#contact"
                style={
                  {
                    "--btn-bg": "var(--color-accent)",
                    "--btn-fg": "#ffffff",
                    "--btn-fill": "#111111",
                    "--btn-fill-fg": "#f4f3f0",
                  } as React.CSSProperties
                }
              >
                {t.cta}
              </Button>
            </motion.div>
          </motion.div>

          <div className={styles.divider} aria-hidden="true" />

          <div className={styles.visual} aria-hidden="true">
            {showEffects && (
              <Strands
                colors={["#e8702a", "#f2a35c", "#ffcb8a"]}
                count={isCompact ? 2 : 3}
                speed={0.5}
                amplitude={isCompact ? 0.72 : 1}
                waviness={isCompact ? 0.85 : 1}
                thickness={isCompact ? 0.85 : 0.7}
                glow={2.6}
                taper={isCompact ? 4.5 : 3}
                spread={isCompact ? 0.65 : 1}
                intensity={0.6}
                saturation={2}
                opacity={1}
                scale={isCompact ? 1.55 : 1}
                glass={false}
                refraction={1}
                dispersion={1}
                glassSize={1}
                hueShift={0}
              />
            )}
          </div>
        </div>

        <motion.ol
          className={styles.steps}
          itemScope
          itemType="https://schema.org/ItemList"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          {t.steps.map((step: AboutStep, index: number) => {
            const Icon: LucideIcon = stepIcons[index];
            return (
              <motion.li
                key={step.title}
                className={styles.step}
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
                variants={fadeUp}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <meta itemProp="position" content={String(index + 1)} />
                <span className={styles.stepIcon}>
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <div className={styles.stepBody}>
                  <h3 className={styles.stepTitle} itemProp="name">
                    {step.title}
                  </h3>
                  <p className={styles.stepText}>{step.description}</p>
                </div>
              </motion.li>
            );
          })}
        </motion.ol>
      </div>
    </section>
  );
}