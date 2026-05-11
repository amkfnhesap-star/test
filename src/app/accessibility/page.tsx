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
    title: "Accessibility Statement",
    toc: [
      { id: "commitment", label: "Our Commitment" },
      { id: "standards", label: "Standards We Target" },
      { id: "measures", label: "Measures We Take" },
      { id: "limitations", label: "Known Limitations" },
      { id: "alternative", label: "Alternative Formats & Assistance" },
      { id: "feedback", label: "Feedback" },
      { id: "contact", label: "Contact" },
    ],
    sections: [
      {
        id: "commitment",
        heading: "1. Our Commitment",
        paragraphs: [
          "SkillSeekers is committed to making its platform accessible to all users, including people with disabilities. We believe that everyone should be able to use our marketplace — whether they rely on a screen reader, navigate by keyboard, use voice input, or have other accessibility needs.",
          "Accessibility is an ongoing effort, not a one-time checkbox. We are actively working to improve the experience for all users and take accessibility feedback seriously.",
        ],
      },
      {
        id: "standards",
        heading: "2. Standards We Target",
        paragraphs: [
          "Our goal is to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. These guidelines, developed by the World Wide Web Consortium (W3C), are the internationally recognised standard for web accessibility. They are organised around four principles: content must be Perceivable, Operable, Understandable, and Robust.",
          "We also aim to comply with Romanian and EU accessibility legislation as applicable to digital services, including the requirements set out in Directive (EU) 2019/882 on the accessibility requirements for products and services.",
        ],
      },
      {
        id: "measures",
        heading: "3. Measures We Take",
        paragraphs: [
          "We strive to ensure that text maintains a sufficient contrast ratio against its background so that users with low vision or colour-blindness can read content comfortably. Our target minimum contrast ratio is 4.5:1 for normal text and 3:1 for large text, in line with WCAG 2.1 AA.",
          "All interactive elements — buttons, links, form fields, and navigation items — are designed to be operable via keyboard alone. Users should be able to navigate the entire platform using only the Tab, Enter, and arrow keys without requiring a mouse.",
          "We use semantic HTML elements (headings, landmarks, lists, buttons, and form labels) to provide meaningful structure that assistive technologies such as screen readers can interpret correctly. Form fields are associated with visible labels. Error messages are programmatically linked to the relevant input field.",
          "We provide descriptive alternative text (alt text) for images that convey information. Purely decorative images are marked with an empty alt attribute so that screen readers skip them.",
          "We avoid using colour as the sole means of conveying information — for example, error states are indicated by both colour and a text label or icon.",
          "We do not include content that flashes or flickers at rates known to trigger photosensitive seizures (more than three times per second).",
        ],
      },
      {
        id: "limitations",
        heading: "4. Known Limitations",
        paragraphs: [
          "SkillSeekers is an actively developed product and we acknowledge that some areas may not yet fully meet WCAG 2.1 AA criteria. We are working to address the following known gaps:",
          "Some complex interactive components (such as filtering panels and modal dialogs) may have incomplete ARIA attribute support, which could reduce the experience for screen-reader users in certain scenarios. Some user-uploaded images in portfolio galleries may lack adequate alt text, as alt text for user-generated content is not yet enforced at upload time. We are evaluating how to prompt and enforce meaningful descriptions during the upload flow.",
          "If you encounter any accessibility barrier not listed here, please let us know — your report helps us prioritise improvements.",
        ],
      },
      {
        id: "alternative",
        heading: "5. Alternative Formats & Assistance",
        paragraphs: [
          "If you need any content from SkillSeekers in an alternative format — such as plain text, large print, or a different structure — or if you experience difficulty using any part of the platform, please contact us at support@skillseekers.ro. Describe the content you need and the format or assistance that would help, and we will do our best to provide it in a timely manner.",
        ],
      },
      {
        id: "feedback",
        heading: "6. Feedback",
        paragraphs: [
          "We welcome your feedback on the accessibility of SkillSeekers. If you encounter any accessibility barriers, please tell us: describe the specific issue, include the URL of the page where you encountered it, and let us know which assistive technology and browser you were using (if applicable). This information helps us reproduce and address the problem as quickly as possible.",
          "We aim to acknowledge accessibility feedback within 5 business days and to provide a substantive response or resolution within 30 business days. We treat accessibility issues with the same urgency as other platform bugs.",
        ],
      },
      {
        id: "contact",
        heading: "7. Contact",
        paragraphs: [
          "For accessibility-related questions, requests, or feedback, please contact us at support@skillseekers.ro. We are committed to ensuring that SkillSeekers is usable by everyone and appreciate your help in making it so.",
        ],
      },
    ],
  },

  ro: {
    title: "Declarație de Accesibilitate",
    toc: [
      { id: "commitment", label: "Angajamentul nostru" },
      { id: "standards", label: "Standarde vizate" },
      { id: "measures", label: "Măsuri adoptate" },
      { id: "limitations", label: "Limitări cunoscute" },
      { id: "alternative", label: "Formate alternative și asistență" },
      { id: "feedback", label: "Feedback" },
      { id: "contact", label: "Contact" },
    ],
    sections: [
      {
        id: "commitment",
        heading: "1. Angajamentul nostru",
        paragraphs: [
          "SkillSeekers se angajează să facă platforma sa accesibilă tuturor utilizatorilor, inclusiv persoanelor cu dizabilități. Credem că oricine ar trebui să poată utiliza platforma noastră — indiferent dacă folosesc un cititor de ecran, navighează cu tastatura, utilizează input vocal sau au alte nevoi de accesibilitate.",
          "Accesibilitatea reprezintă un efort continuu, nu o cerință bifată o singură dată. Lucrăm activ pentru a îmbunătăți experiența tuturor utilizatorilor și tratăm cu seriozitate orice feedback legat de accesibilitate.",
        ],
      },
      {
        id: "standards",
        heading: "2. Standarde vizate",
        paragraphs: [
          "Scopul nostru este de a respecta Ghidul de Accesibilitate pentru Conținut Web (WCAG) 2.1 la Nivelul AA. Aceste ghiduri, elaborate de Consorțiul World Wide Web (W3C), reprezintă standardul internațional recunoscut pentru accesibilitatea web. Sunt organizate în jurul a patru principii: conținutul trebuie să fie Perceptibil, Operabil, Inteligibil și Robust.",
          "Ne propunem, de asemenea, să respectăm legislația română și europeană privind accesibilitatea aplicabilă serviciilor digitale, inclusiv cerințele prevăzute în Directiva (UE) 2019/882 privind cerințele de accesibilitate aplicabile produselor și serviciilor.",
        ],
      },
      {
        id: "measures",
        heading: "3. Măsuri adoptate",
        paragraphs: [
          "Ne străduim să asigurăm că textul menține un raport de contrast suficient față de fundal, astfel încât utilizatorii cu deficiențe de vedere sau daltonism să poată citi conținutul confortabil. Raportul minim de contrast vizat este de 4,5:1 pentru textul normal și de 3:1 pentru textul mare, în conformitate cu WCAG 2.1 AA.",
          "Toate elementele interactive — butoane, linkuri, câmpuri de formular și elemente de navigare — sunt proiectate pentru a fi operabile exclusiv cu tastatura. Utilizatorii ar trebui să poată naviga pe întreaga platformă folosind doar tastele Tab, Enter și săgețile, fără a necesita un mouse.",
          "Utilizăm elemente HTML semantice (titluri, repere, liste, butoane și etichete de formular) pentru a oferi o structură semnificativă pe care tehnologiile de asistență, cum ar fi cititoarele de ecran, o pot interpreta corect. Câmpurile de formular sunt asociate cu etichete vizibile. Mesajele de eroare sunt legate programatic de câmpul de intrare relevant.",
          "Furnizăm text alternativ descriptiv (alt text) pentru imaginile care transmit informații. Imaginile pur decorative sunt marcate cu un atribut alt gol, astfel încât cititoarele de ecran le ignoră.",
          "Evităm să folosim culoarea ca singurul mijloc de transmitere a informațiilor — de exemplu, stările de eroare sunt indicate atât prin culoare, cât și printr-o etichetă text sau pictogramă.",
          "Nu includem conținut care pâlpâie sau clipește la frecvențe cunoscute pentru a declanșa crize fotosensibile (mai mult de trei ori pe secundă).",
        ],
      },
      {
        id: "limitations",
        heading: "4. Limitări cunoscute",
        paragraphs: [
          "SkillSeekers este un produs în dezvoltare activă și recunoaștem că unele zone ar putea să nu îndeplinească pe deplin criteriile WCAG 2.1 AA. Lucrăm pentru a aborda următoarele deficiențe cunoscute:",
          "Unele componente interactive complexe (cum ar fi panourile de filtrare și dialogurile modale) pot avea suport incomplet pentru atributele ARIA, ceea ce ar putea reduce experiența utilizatorilor de cititoare de ecran în anumite scenarii. Unele imagini încărcate de utilizatori în galerii de portofoliu pot lipsi de un alt text adecvat, deoarece alt text-ul pentru conținutul generat de utilizatori nu este încă obligatoriu la momentul încărcării. Evaluăm cum să solicităm și să impunem descrieri semnificative în fluxul de încărcare.",
          "Dacă întâlniți orice barieră de accesibilitate care nu este menționată aici, vă rugăm să ne informați — raportul dvs. ne ajută să stabilim prioritățile de îmbunătățire.",
        ],
      },
      {
        id: "alternative",
        heading: "5. Formate alternative și asistență",
        paragraphs: [
          "Dacă aveți nevoie de orice conținut de pe SkillSeekers într-un format alternativ — cum ar fi text simplu, tipar mare sau o structură diferită — sau dacă întâmpinați dificultăți în utilizarea oricărei părți a platformei, vă rugăm să ne contactați la support@skillseekers.ro. Descrieți conținutul de care aveți nevoie și formatul sau asistența care v-ar ajuta, și vom depune toate eforturile să vi le furnizăm în timp util.",
        ],
      },
      {
        id: "feedback",
        heading: "6. Feedback",
        paragraphs: [
          "Binevenităm feedback-ul dvs. cu privire la accesibilitatea SkillSeekers. Dacă întâmpinați bariere de accesibilitate, vă rugăm să ne informați: descrieți problema specifică, includeți adresa URL a paginii unde ați întâlnit-o și menționați ce tehnologie de asistență și browser utilizați (dacă este cazul). Aceste informații ne ajută să reproducem și să rezolvăm problema cât mai rapid.",
          "Ne propunem să confirmăm primirea feedback-ului privind accesibilitatea în termen de 5 zile lucrătoare și să oferim un răspuns sau o rezolvare în termen de 30 de zile lucrătoare. Tratăm problemele de accesibilitate cu aceeași urgență ca și celelalte erori de platformă.",
        ],
      },
      {
        id: "contact",
        heading: "7. Contact",
        paragraphs: [
          "Pentru întrebări, solicitări sau feedback legate de accesibilitate, vă rugăm să ne contactați la support@skillseekers.ro. Ne angajăm să asigurăm că SkillSeekers poate fi utilizat de toată lumea și apreciem ajutorul dvs. în acest sens.",
        ],
      },
    ],
  },
};

export default function AccessibilityPage() {
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
