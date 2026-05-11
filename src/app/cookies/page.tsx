"use client";

import { useState } from "react";
import { LegalPage, DocSection, type Lang } from "@/components/ui/LegalPage";

const LAST_UPDATED = { en: "May 11, 2026", ro: "11 mai 2026" };
const CONTACT = "support@skillseekers.ro";

const CONTENT: Record<
  Lang,
  {
    title: string;
    toc: { id: string; label: string }[];
    sections: { id: string; heading: string; paragraphs: string[] }[];
  }
> = {
  en: {
    title: "Cookie Policy",
    toc: [
      { id: "what-are-cookies", label: "What Are Cookies" },
      { id: "cookies-we-use", label: "Cookies We Use" },
      { id: "no-tracking", label: "What We Do Not Use" },
      { id: "managing", label: "Managing Cookies" },
      { id: "changes", label: "Changes to This Policy" },
      { id: "contact", label: "Contact" },
    ],
    sections: [
      {
        id: "what-are-cookies",
        heading: "1. What Are Cookies",
        paragraphs: [
          "Cookies are small text files that a website places on your device (computer, tablet, or smartphone) when you visit it. They are widely used to make websites work efficiently, to remember preferences, and to provide information to the site owner.",
          "Cookies are not programs and cannot carry viruses or malware. They simply store small pieces of information that can be read back by the website on your next visit.",
        ],
      },
      {
        id: "cookies-we-use",
        heading: "2. Cookies We Use",
        paragraphs: [
          "SkillSeekers currently uses only strictly necessary cookies — the minimum required for the platform to function. We do not use cookies for advertising, analytics, or tracking purposes.",
          "Authentication session cookie (set by Supabase): When you sign in to your SkillSeekers account, our authentication provider Supabase sets an encrypted session cookie on your device. This cookie stores a secure token that identifies your authenticated session and keeps you logged in as you navigate between pages. Without this cookie, you would be signed out every time you moved to a new page. The cookie contains no personally identifiable information in readable form — only an opaque, encrypted token. It expires at the end of your browser session or after a defined period of inactivity (typically 1 hour of inactivity or up to 7 days of active use).",
          "Because this cookie is strictly necessary for a service you have explicitly requested (signing in to your account), it is exempt from consent requirements under the EU ePrivacy Directive and Romania's implementing legislation.",
        ],
      },
      {
        id: "no-tracking",
        heading: "3. What We Do Not Use",
        paragraphs: [
          "We do not currently use any analytics cookies (such as Google Analytics or similar services), advertising or retargeting cookies, social media tracking pixels, or any third-party cookies for tracking purposes.",
          "If we introduce analytics or other non-essential cookies in the future, we will update this Cookie Policy before doing so and will display a consent banner on the platform that allows you to accept or decline non-essential cookies before they are set. We will never set non-essential cookies without your prior consent.",
        ],
      },
      {
        id: "managing",
        heading: "4. Managing Cookies",
        paragraphs: [
          "Because we only set strictly necessary authentication cookies, opting out of cookies entirely would prevent you from being able to sign in to SkillSeekers. If you browse the platform without signing in, no cookies are set.",
          "You can delete all cookies stored by SkillSeekers by clearing your browser's cookies and site data. Please note that doing so will sign you out of any active session. Instructions for managing cookies vary by browser — you can usually find them under Settings > Privacy or Settings > Security in your browser's help documentation.",
          "Most modern browsers also allow you to block third-party cookies. As SkillSeekers does not use third-party cookies at present, this setting will not affect your experience on our platform.",
        ],
      },
      {
        id: "changes",
        heading: "5. Changes to This Policy",
        paragraphs: [
          "We will update this Cookie Policy if we introduce new types of cookies or change our use of existing ones. Any changes will be posted on this page with a revised \"Last updated\" date. If the changes are material — for example, if we introduce non-essential cookies for the first time — we will provide more prominent notice and, where required, seek your consent before those cookies are set.",
        ],
      },
      {
        id: "contact",
        heading: "6. Contact",
        paragraphs: [
          "If you have any questions about our use of cookies or this Cookie Policy, please contact us at support@skillseekers.ro.",
        ],
      },
    ],
  },

  ro: {
    title: "Politica privind Cookie-urile",
    toc: [
      { id: "what-are-cookies", label: "Ce sunt cookie-urile" },
      { id: "cookies-we-use", label: "Cookie-urile utilizate" },
      { id: "no-tracking", label: "Ce nu utilizăm" },
      { id: "managing", label: "Gestionarea cookie-urilor" },
      { id: "changes", label: "Modificări ale politicii" },
      { id: "contact", label: "Contact" },
    ],
    sections: [
      {
        id: "what-are-cookies",
        heading: "1. Ce sunt cookie-urile",
        paragraphs: [
          "Cookie-urile sunt fișiere text de mici dimensiuni pe care un site web le plasează pe dispozitivul dvs. (computer, tabletă sau smartphone) atunci când îl vizitați. Sunt utilizate pe scară largă pentru a face site-urile web să funcționeze eficient, pentru a reține preferințele și pentru a furniza informații proprietarului site-ului.",
          "Cookie-urile nu sunt programe și nu pot transporta viruși sau programe malware. Stochează pur și simplu mici bucăți de informații care pot fi citite de site-ul web la vizita dvs. următoare.",
        ],
      },
      {
        id: "cookies-we-use",
        heading: "2. Cookie-urile utilizate",
        paragraphs: [
          "SkillSeekers utilizează în prezent exclusiv cookie-uri strict necesare — minimul necesar pentru funcționarea platformei. Nu utilizăm cookie-uri în scopuri publicitare, analitice sau de urmărire.",
          "Cookie de sesiune de autentificare (setat de Supabase): Când vă autentificați în contul SkillSeekers, furnizorul nostru de autentificare Supabase plasează un cookie de sesiune criptat pe dispozitivul dvs. Acest cookie stochează un token securizat care identifică sesiunea dvs. autentificată și vă menține autentificat în timp ce navigați între pagini. Fără acest cookie, ați fi deconectat de fiecare dată când accesați o pagină nouă. Cookie-ul nu conține informații personal identificabile în formă lizibilă — doar un token opac, criptat. Expiră la sfârșitul sesiunii de browser sau după o perioadă definită de inactivitate (de obicei 1 oră de inactivitate sau până la 7 zile de utilizare activă).",
          "Deoarece acest cookie este strict necesar pentru un serviciu pe care l-ați solicitat explicit (autentificarea în contul dvs.), este exceptat de la cerințele de consimțământ conform Directivei ePrivacy a UE și legislației române de implementare.",
        ],
      },
      {
        id: "no-tracking",
        heading: "3. Ce nu utilizăm",
        paragraphs: [
          "Nu utilizăm în prezent cookie-uri analitice (cum ar fi Google Analytics sau servicii similare), cookie-uri publicitare sau de retargeting, pixeli de urmărire pentru rețele sociale, sau cookie-uri ale unor terțe părți în scopuri de urmărire.",
          "Dacă vom introduce cookie-uri analitice sau alte cookie-uri neesențiale în viitor, vom actualiza această Politică privind Cookie-urile înainte de a face acest lucru și vom afișa un banner de consimțământ pe platformă care să vă permită să acceptați sau să refuzați cookie-urile neesențiale înainte de a fi setate. Nu vom seta niciodată cookie-uri neesențiale fără consimțământul dvs. prealabil.",
        ],
      },
      {
        id: "managing",
        heading: "4. Gestionarea cookie-urilor",
        paragraphs: [
          "Deoarece setăm exclusiv cookie-uri de autentificare strict necesare, dezactivarea completă a cookie-urilor v-ar împiedica să vă autentificați pe SkillSeekers. Dacă navigați pe platformă fără a vă autentifica, nu sunt setate cookie-uri.",
          "Puteți șterge toate cookie-urile stocate de SkillSeekers ștergând cookie-urile și datele de site din browser. Rețineți că acest lucru vă va deconecta din orice sesiune activă. Instrucțiunile pentru gestionarea cookie-urilor variază în funcție de browser — le puteți găsi de obicei la Setări > Confidențialitate sau Setări > Securitate în documentația de ajutor a browserului dvs.",
          "Majoritatea browserelor moderne vă permit, de asemenea, să blocați cookie-urile terților. Întrucât SkillSeekers nu utilizează în prezent cookie-uri ale terților, această setare nu va afecta experiența dvs. pe platforma noastră.",
        ],
      },
      {
        id: "changes",
        heading: "5. Modificări ale politicii",
        paragraphs: [
          "Vom actualiza această Politică privind Cookie-urile dacă vom introduce noi tipuri de cookie-uri sau dacă ne vom schimba utilizarea celor existente. Orice modificări vor fi postate pe această pagină cu o dată „Ultima actualizare\" revizuită. Dacă modificările sunt substanțiale — de exemplu, dacă introducem pentru prima dată cookie-uri neesențiale — vom furniza o notificare mai proeminentă și, acolo unde este necesar, vom solicita consimțământul dvs. înainte ca acele cookie-uri să fie setate.",
        ],
      },
      {
        id: "contact",
        heading: "6. Contact",
        paragraphs: [
          "Dacă aveți întrebări despre utilizarea cookie-urilor sau despre această Politică privind Cookie-urile, vă rugăm să ne contactați la support@skillseekers.ro.",
        ],
      },
    ],
  },
};

export default function CookiesPage() {
  const [lang, setLang] = useState<Lang>("en");
  const content = CONTENT[lang];

  return (
    <LegalPage
      lang={lang}
      setLang={setLang}
      title={content.title}
      lastUpdated={LAST_UPDATED[lang]}
      contact={CONTACT}
      toc={content.toc}
    >
      {content.sections.map((s) => (
        <DocSection key={s.id} id={s.id} heading={s.heading} paragraphs={s.paragraphs} />
      ))}
    </LegalPage>
  );
}
