import { Hero } from "@/components/home/Hero";
import { Categories } from "@/components/home/Categories";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TopProviders } from "@/components/home/TopProviders";
import { Testimonials } from "@/components/home/Testimonials";
import { TrustSection } from "@/components/home/TrustSection";
import { AppPromo } from "@/components/home/AppPromo";
import { FAQ } from "@/components/home/FAQ";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MesteRO — Găsește meșteri locali de încredere, instant",
  description:
    "Platformă AI pentru rezervarea meșterilor verificați. Curățenie, reparații, mutări, servicii AI și 14+ categorii. Disponibilitate în aceeași zi, meșteri verificați, garanție 1M$.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <HowItWorks />
      <TopProviders />
      <Testimonials />
      <TrustSection />
      <AppPromo />
      <FAQ />
    </>
  );
}
