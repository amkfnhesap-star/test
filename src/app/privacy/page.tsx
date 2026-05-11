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
    title: "Privacy Policy",
    toc: [
      { id: "controller", label: "Data Controller" },
      { id: "data-collected", label: "What Data We Collect" },
      { id: "how-we-use", label: "How We Use Your Data" },
      { id: "lawful-basis", label: "Lawful Basis for Processing" },
      { id: "processors", label: "Data Processors & Third Parties" },
      { id: "retention", label: "Data Retention" },
      { id: "rights", label: "Your Rights Under GDPR" },
      { id: "children", label: "Children and Minors" },
      { id: "changes", label: "Changes to This Policy" },
      { id: "contact", label: "Contact" },
    ],
    sections: [
      {
        id: "controller",
        heading: "1. Data Controller",
        paragraphs: [
          "SkillSeekers is operated by [Your Name / Company], a Romanian individual or entity (\"we\", \"us\", or \"our\"). We are the data controller responsible for personal data collected through this website and platform.",
          "If you have any questions about how we handle your personal data, you can reach us at any time by emailing support@skillseekers.ro.",
        ],
      },
      {
        id: "data-collected",
        heading: "2. What Data We Collect",
        paragraphs: [
          "We collect the information you provide directly when registering for an account: your full name, email address, city, and optionally a phone number and profile photo.",
          "If you post a job, we collect the job title, description, category, city, budget, preferred timeframe, and any photos you choose to upload alongside the listing.",
          "If you create a provider profile, we collect your professional headline, bio, listed skills, hourly rate, fixed price range, service area, portfolio photos, and years of experience.",
          "We automatically collect technical data required for the service to function — specifically, authentication session tokens managed by our infrastructure provider (Supabase) that keep you logged in while you use the platform. We do not currently collect analytics or advertising data, and we do not track your browsing behaviour beyond what authentication requires.",
          "We do not process any payment information. No card numbers, bank account details, or other financial data are stored on SkillSeekers at this time.",
        ],
      },
      {
        id: "how-we-use",
        heading: "3. How We Use Your Data",
        paragraphs: [
          "We use your personal data to create and maintain your account, to operate the marketplace and make your profile or job posts visible to other users, and to communicate with you about your account or the service itself.",
          "We do not use your data for advertising profiling, behavioural targeting, or the creation of marketing segments. We do not sell, rent, or otherwise transfer your personal data to third parties for their own purposes. We do not make automated decisions that produce legal or similarly significant effects on you.",
        ],
      },
      {
        id: "lawful-basis",
        heading: "4. Lawful Basis for Processing",
        paragraphs: [
          "We process your personal data on the following lawful bases as defined in Article 6 of the General Data Protection Regulation (GDPR):",
          "Performance of a contract: Processing is necessary to provide the marketplace service you registered for — creating and maintaining your account, displaying your profile, and enabling you to post or browse jobs.",
          "Legitimate interests: We process certain technical data (such as server and access logs) to maintain platform security, prevent fraud, and diagnose technical issues. We have assessed that these interests do not override your fundamental privacy rights.",
          "Consent: Where we send optional communications such as email notifications or updates, we rely on your consent, which you may withdraw at any time through your account settings.",
        ],
      },
      {
        id: "processors",
        heading: "5. Data Processors & Third Parties",
        paragraphs: [
          "We share your data with a small number of trusted service providers who act as data processors on our behalf. Each is contractually bound to process your data only as we instruct and to maintain appropriate security measures.",
          "Supabase (Supabase Inc., USA) is our database and authentication provider. Your account information, profile data, job posts, and uploaded content are stored in Supabase's infrastructure. Supabase processes data under appropriate safeguards for international transfers from the EU, including Standard Contractual Clauses.",
          "Vercel (Vercel Inc., USA) is our hosting and deployment platform. Vercel may process technical request metadata — including IP address and browser user agent — as part of serving the application to your browser. Vercel maintains appropriate EU data-transfer safeguards.",
          "We do not share your personal data with any other third parties except where required by applicable law or a lawful order from a competent authority.",
        ],
      },
      {
        id: "retention",
        heading: "6. Data Retention",
        paragraphs: [
          "We retain your personal data for as long as your account remains active. If you choose to delete your account, we will erase your personal data within 30 days of the request, unless a longer retention period is required by law (for example, by Romanian fiscal or commercial regulations).",
          "Residual copies that exist in automated backups will be overwritten within our standard backup rotation cycle. Content you have posted publicly — such as job descriptions — may persist briefly in cached or archived copies until full propagation of the deletion is complete.",
        ],
      },
      {
        id: "rights",
        heading: "7. Your Rights Under GDPR",
        paragraphs: [
          "As a data subject protected by the GDPR, you have the right to: access a copy of the personal data we hold about you; request correction of inaccurate or incomplete data; request erasure of your data (the \"right to be forgotten\"); restrict or object to certain types of processing; and receive your data in a portable, machine-readable format.",
          "You can exercise your rights of access, export, and account deletion directly from your dashboard settings at any time without contacting us. For any other request, or if you encounter any difficulty, email us at support@skillseekers.ro and we will respond within 30 days.",
          "If you believe we have not handled your personal data correctly, you have the right to lodge a complaint with the Romanian National Supervisory Authority for Personal Data Processing (ANSPDCP) at www.dataprotection.ro.",
        ],
      },
      {
        id: "children",
        heading: "8. Children and Minors",
        paragraphs: [
          "SkillSeekers is intended solely for users aged 18 and above. We do not knowingly collect personal data from individuals under the age of 18. If you have reason to believe that a minor has registered an account on our platform, please contact us immediately at support@skillseekers.ro. We will investigate and delete the account without delay.",
        ],
      },
      {
        id: "changes",
        heading: "9. Changes to This Policy",
        paragraphs: [
          "We may update this Privacy Policy from time to time as our service evolves or as legal requirements change. When we make material changes, we will notify you by posting a prominent notice on the platform or by sending an email to the address associated with your account before the changes take effect.",
          "The \"Last updated\" date at the top of this page always reflects the most recent revision. We encourage you to review this policy periodically to stay informed.",
        ],
      },
      {
        id: "contact",
        heading: "10. Contact",
        paragraphs: [
          "If you have any questions, concerns, or requests relating to this Privacy Policy or the way we handle your personal data, please contact us at support@skillseekers.ro. We are committed to responding to all inquiries in a timely and transparent manner.",
        ],
      },
    ],
  },

  ro: {
    title: "Politica de Confidențialitate",
    toc: [
      { id: "controller", label: "Operatorul de date" },
      { id: "data-collected", label: "Ce date colectăm" },
      { id: "how-we-use", label: "Cum utilizăm datele tale" },
      { id: "lawful-basis", label: "Temeiul legal al prelucrării" },
      { id: "processors", label: "Procesatori și terțe părți" },
      { id: "retention", label: "Retenția datelor" },
      { id: "rights", label: "Drepturile tale conform GDPR" },
      { id: "children", label: "Minori" },
      { id: "changes", label: "Modificări ale politicii" },
      { id: "contact", label: "Contact" },
    ],
    sections: [
      {
        id: "controller",
        heading: "1. Operatorul de date",
        paragraphs: [
          "SkillSeekers este operată de [Numele tău / Compania ta], o persoană fizică sau juridică română („noi\", „nouă\" sau „nostru\"). Suntem operatorul de date responsabil pentru datele cu caracter personal colectate prin intermediul acestui site și al platformei.",
          "Dacă aveți întrebări despre modul în care gestionăm datele dvs. personale, ne puteți contacta oricând la adresa support@skillseekers.ro.",
        ],
      },
      {
        id: "data-collected",
        heading: "2. Ce date colectăm",
        paragraphs: [
          "Colectăm informațiile pe care le furnizați direct la crearea unui cont: numele complet, adresa de e-mail, orașul și, opțional, numărul de telefon și fotografia de profil.",
          "Dacă postați un anunț de serviciu, colectăm titlul, descrierea, categoria, orașul, bugetul, intervalul de timp preferat și fotografiile pe care alegeți să le încărcați împreună cu anunțul.",
          "Dacă creați un profil de prestator, colectăm titlul profesional, descrierea, competențele, tariful orar, prețul fix, zona de servicii, fotografiile din portofoliu și anii de experiență.",
          "Colectăm automat date tehnice necesare funcționării serviciului — în special tokenuri de sesiune de autentificare gestionate de furnizorul nostru de infrastructură (Supabase), care vă mențin autentificat în timp ce utilizați platforma. Nu colectăm în prezent date analitice sau publicitare și nu urmărim comportamentul de navigare dincolo de ceea ce autentificarea necesită.",
          "Nu procesăm nicio informație de plată. Nu stocăm numere de card bancar, date bancare sau alte informații financiare pe SkillSeekers în acest moment.",
        ],
      },
      {
        id: "how-we-use",
        heading: "3. Cum utilizăm datele tale",
        paragraphs: [
          "Utilizăm datele dvs. personale pentru a crea și gestiona contul dvs., pentru a opera platforma și a face profilul sau anunțurile dvs. vizibile altor utilizatori, și pentru a comunica cu dvs. în legătură cu contul sau serviciul.",
          "Nu utilizăm datele dvs. pentru profilare publicitară, targetare comportamentală sau crearea de segmente de marketing. Nu vindem, nu închiriem și nu transferăm datele dvs. personale unor terțe părți în scopuri proprii acestora. Nu utilizăm procese decizionale automate care să producă efecte juridice sau semnificative similar asupra dvs.",
        ],
      },
      {
        id: "lawful-basis",
        heading: "4. Temeiul legal al prelucrării",
        paragraphs: [
          "Prelucrăm datele dvs. cu caracter personal pe următoarele temeiuri legale, definite în Articolul 6 din Regulamentul General privind Protecția Datelor (GDPR):",
          "Executarea unui contract: Prelucrarea este necesară pentru furnizarea serviciilor platformei la care v-ați înregistrat — crearea și gestionarea contului dvs., afișarea profilului și posibilitatea de a posta sau de a naviga printre anunțuri.",
          "Interese legitime: Prelucrăm anumite date tehnice (cum ar fi jurnalele de acces și de server) pentru a menține securitatea platformei, a preveni fraudele și a diagnostica probleme tehnice. Am evaluat că aceste interese nu depășesc drepturile dvs. fundamentale la confidențialitate.",
          "Consimțământ: Acolo unde trimitem comunicări opționale, cum ar fi notificări sau actualizări prin e-mail, ne bazăm pe consimțământul dvs., pe care îl puteți retrage oricând din setările contului.",
        ],
      },
      {
        id: "processors",
        heading: "5. Procesatori de date și terțe părți",
        paragraphs: [
          "Partajăm datele dvs. cu un număr restrâns de furnizori de servicii de încredere care acționează ca procesatori de date în numele nostru. Fiecare este obligat contractual să prelucreze datele dvs. exclusiv conform instrucțiunilor noastre și să mențină măsuri de securitate adecvate.",
          "Supabase (Supabase Inc., SUA) este furnizorul nostru de baze de date și autentificare. Informațiile contului dvs., datele profilului, anunțurile de servicii și conținutul încărcat sunt stocate în infrastructura Supabase. Supabase prelucrează datele cu garanții adecvate pentru transferurile internaționale din UE, inclusiv Clauze Contractuale Standard.",
          "Vercel (Vercel Inc., SUA) este platforma noastră de găzduire și implementare. Vercel poate prelucra metadate tehnice ale cererilor — inclusiv adresa IP și user agent-ul browserului — ca parte a deservirii aplicației în browserul dvs. Vercel menține garanțiile adecvate pentru transferul datelor din UE.",
          "Nu partajăm datele dvs. personale cu alte terțe părți, cu excepția cazurilor impuse de legea aplicabilă sau de un ordin legal din partea unei autorități competente.",
        ],
      },
      {
        id: "retention",
        heading: "6. Retenția datelor",
        paragraphs: [
          "Reținem datele dvs. personale atât timp cât contul dvs. este activ. Dacă alegeți să vă ștergeți contul, vom elimina datele dvs. personale în termen de 30 de zile de la solicitare, cu excepția cazului în care o perioadă mai lungă de retenție este impusă de lege (de exemplu, de reglementările fiscale sau comerciale române).",
          "Copiile reziduale din copii de rezervă automate vor fi suprascrise în cadrul ciclului standard de rotație a backup-urilor. Conținutul postat public — cum ar fi descrierile de servicii — poate persista temporar în copii cache sau arhivate până când propagarea completă a ștergerii se finalizează.",
        ],
      },
      {
        id: "rights",
        heading: "7. Drepturile tale conform GDPR",
        paragraphs: [
          "Ca persoană vizată protejată de GDPR, aveți dreptul de a: accesa o copie a datelor personale pe care le deținem despre dvs.; solicita corectarea datelor inexacte sau incomplete; solicita ștergerea datelor dvs. („dreptul de a fi uitat\"); restricționa sau vă opune anumitor tipuri de prelucrare; și de a primi datele dvs. într-un format portabil, lizibil automat.",
          "Puteți exercita drepturile de acces, export de date și ștergere a contului direct din setările tabloului de bord, în orice moment, fără a ne contacta. Pentru orice altă solicitare sau dacă întâmpinați dificultăți, trimiteți-ne un e-mail la support@skillseekers.ro și vom răspunde în termen de 30 de zile.",
          "Dacă considerați că nu am gestionat corect datele dvs. personale, aveți dreptul de a depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP) la adresa www.dataprotection.ro.",
        ],
      },
      {
        id: "children",
        heading: "8. Minori",
        paragraphs: [
          "SkillSeekers este destinată exclusiv utilizatorilor cu vârsta de 18 ani și peste. Nu colectăm cu bună știință date personale de la persoane sub 18 ani. Dacă aveți motive să credeți că un minor și-a creat un cont pe platforma noastră, vă rugăm să ne contactați imediat la support@skillseekers.ro. Vom investiga și vom șterge contul fără întârziere.",
        ],
      },
      {
        id: "changes",
        heading: "9. Modificări ale politicii",
        paragraphs: [
          "Putem actualiza periodic această Politică de Confidențialitate pe măsură ce serviciul nostru evoluează sau cerințele legale se modifică. Când facem modificări substanțiale, vă vom notifica printr-un anunț proeminent pe platformă sau prin e-mail la adresa asociată contului dvs., înainte ca modificările să intre în vigoare.",
          "Data „Ultima actualizare\" din partea de sus a acestei pagini reflectă întotdeauna data celei mai recente revizuiri. Vă încurajăm să consultați periodic această politică pentru a fi la curent.",
        ],
      },
      {
        id: "contact",
        heading: "10. Contact",
        paragraphs: [
          "Dacă aveți întrebări, preocupări sau solicitări legate de această Politică de Confidențialitate sau de modul în care gestionăm datele dvs. personale, vă rugăm să ne contactați la support@skillseekers.ro. Ne angajăm să răspundem tuturor solicitărilor în mod prompt și transparent.",
        ],
      },
    ],
  },
};

export default function PrivacyPage() {
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
