import type { Metadata } from "next";
import { Inter, Playfair_Display, Poppins } from "next/font/google";
import { ArcRevealHero } from "@/components/ArcRevealHero/ArcRevealHero";
import PageBottomBlur from "@/components/ui/PageBottomBlur";
import { locales, defaultLocale, type Locale } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";
import SmoothScroll from "@/components/SmoothScroll/SmoothScroll";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const SITE_URL = "https://nicksitchinava.dev";

function resolveLocale(value: string): Locale {
  return locales.includes(value as Locale) ? (value as Locale) : defaultLocale;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = dictionaries[locale].meta;

  return {
    metadataBase: new URL(SITE_URL),
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        en: `${SITE_URL}/en`,
        ka: `${SITE_URL}/ka`,
        "x-default": `${SITE_URL}/en`,
      },
    },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/${locale}`,
      title: t.title,
      description: t.ogDescription,
      locale: locale === "ka" ? "ka_GE" : "en_US",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = dictionaries[locale];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Nick Sitchinava",
    image: `${SITE_URL}/images/logo.webp`,
    url: `${SITE_URL}/${locale}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Tbilisi",
      addressCountry: "GE",
    },
    areaServed: ["Georgia", "Worldwide"],
    description: t.meta.description,
  };

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable} ${poppins.variable}`}>
      <body>
        <SmoothScroll />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ArcRevealHero greetings={t.loaderGreetings.map((text) => ({ text, lang: locale }))}>
          {children}
        </ArcRevealHero>
        <PageBottomBlur />
      </body>
    </html>
  );
}