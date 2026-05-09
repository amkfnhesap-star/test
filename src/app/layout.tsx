import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SkillSeekers — Find Trusted Local Professionals Instantly",
    template: "%s | SkillSeekers",
  },
  description:
    "Book trusted local professionals for cleaning, handyman, moving, AI services, and 14+ more categories. AI-powered matching, instant booking, and $1M liability coverage.",
  keywords: [
    "local services marketplace",
    "hire professionals",
    "home services",
    "task rabbit alternative",
    "handyman booking",
    "cleaning services",
    "AI services",
    "freelancer marketplace",
  ],
  authors: [{ name: "SkillSeekers" }],
  creator: "SkillSeekers",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://skillseekers.com",
    siteName: "SkillSeekers",
    title: "SkillSeekers — Trusted Local Professionals",
    description:
      "AI-native marketplace for instant professional booking. 250K+ verified providers across 14 categories.",
    images: [
      {
        url: "https://skillseekers.com/og.png",
        width: 1200,
        height: 630,
        alt: "SkillSeekers Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillSeekers — Trusted Local Professionals",
    description: "Book trusted professionals instantly with AI-powered matching.",
    creator: "@skillseekers",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "12px",
                fontSize: "14px",
              },
              success: {
                iconTheme: { primary: "#10B981", secondary: "#fff" },
              },
              error: {
                iconTheme: { primary: "#EF4444", secondary: "#fff" },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
