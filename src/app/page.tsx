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
  title: "SkillSeekers — Find Trusted Local Professionals Instantly",
  description:
    "AI-powered marketplace for booking trusted professionals. Cleaning, handyman, moving, AI services and 14+ categories. Same-day availability, verified pros, $1M guarantee.",
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
