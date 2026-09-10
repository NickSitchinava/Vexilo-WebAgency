"use client";

import FlowArt, { FlowSection } from "@/components/ui/story-scroll";
import "@/components/ui/story-scroll-entry.css";
import ServicesCursor from "./ServicesCursor";
import { ServiceCard, type ServiceCardTheme } from "./ServiceCard";
import { dictionaries } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import styles from "./services.module.css";

const panelThemes: ServiceCardTheme[] = [
  {
    stageBg: "#1d1d1f",
    stageInk: "#ffffff",
    stageInkMuted: "#9a9aa0",
    stageInkFaint: "#87878d",
    cardBg: "#ffffff",
    cardInk: "#1d1d1f",
    borderColors: { primary: "#d6d6d6", secondary: "#a8a8ac", accent: "var(--color-accent)" },
  },
  {
    stageBg: "#f5f5f7",
    stageInk: "#1d1d1f",
    stageInkMuted: "#54545a",
    stageInkFaint: "#6b6b70",
    cardBg: "#1d1d1f",
    cardInk: "#ffffff",
    borderColors: { primary: "#3a3a3c", secondary: "#6e6e73", accent: "var(--color-accent)" },
  },
  {
    stageBg: "#1d1d1f",
    stageInk: "#ffffff",
    stageInkMuted: "#9a9aa0",
    stageInkFaint: "#87878d",
    cardBg: "#ffffff",
    cardInk: "#1d1d1f",
    borderColors: { primary: "#d6d6d6", secondary: "#a8a8ac", accent: "var(--color-accent)" },
  },
];

export default function Services({ locale }: { locale: Locale }) {
  const t = dictionaries[locale].services;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: t.items.map((service, index) => ({
      "@type": "Service",
      position: index + 1,
      name: service.title,
      description: service.description,
    })),
  };

  return (
    <section id="services" className={styles.services} aria-label={t.heading} lang={locale}>
      <h2 className={styles.srOnly}>{t.heading}</h2>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ServicesCursor>
        <FlowArt aria-label={t.heading} rotateIn={false}>
          {t.items.map((service, index) => {
            const theme = panelThemes[index % panelThemes.length];
            return (
              <FlowSection
                key={service.slug}
                aria-label={service.title}
                style={{ backgroundColor: theme.stageBg, color: theme.stageInk }}
              >
                <ServiceCard
                  service={service}
                  index={index}
                  locale={locale}
                  theme={theme}
                  learnMoreLabel={t.cta}
                />
              </FlowSection>
            );
          })}
        </FlowArt>
      </ServicesCursor>
    </section>
  );
}