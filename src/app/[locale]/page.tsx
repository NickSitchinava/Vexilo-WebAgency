import Header from "@/components/Header/Header";
import Hero from "@/components/Hero/Hero";
import TechStack from "@/components/TechStack/TechStack";
import About from "@/components/About/About";
import Services from "@/components/Services/Services";
import ProjectsPricingTransition from "@/components/Projects/ProjectsPricingTransition";
import PricingCalculator from "@/components/PricingCalculator/PricingCalculator";
import Contact from "@/components/Contact/Contact";
import Footer from "@/components/Footer/Footer";
import { locales, defaultLocale, type Locale } from "@/i18n/config";

function resolveLocale(value: string): Locale {
  return locales.includes(value as Locale) ? (value as Locale) : defaultLocale;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  return (
    <>
      <Header locale={locale} />
      <main>
        <Hero locale={locale} />
        <TechStack />
        <About locale={locale} />
        <Services locale={locale} />
        <ProjectsPricingTransition locale={locale} />
        <PricingCalculator locale={locale} />
        <Contact locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  );
}