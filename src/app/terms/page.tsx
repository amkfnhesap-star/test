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
    title: "Terms of Service",
    toc: [
      { id: "acceptance", label: "Acceptance of Terms" },
      { id: "description", label: "Description of Service" },
      { id: "registration", label: "Account Registration" },
      { id: "obligations", label: "User Obligations & Prohibited Uses" },
      { id: "content", label: "Content You Post" },
      { id: "marketplace", label: "Marketplace Relationship & Payments" },
      { id: "liability", label: "Limitation of Liability" },
      { id: "termination", label: "Account Termination" },
      { id: "governing-law", label: "Governing Law & Disputes" },
      { id: "contact", label: "Contact" },
    ],
    sections: [
      {
        id: "acceptance",
        heading: "1. Acceptance of Terms",
        paragraphs: [
          "By accessing or using the SkillSeekers platform (the \"Service\"), you agree to be bound by these Terms of Service (the \"Terms\"). If you do not agree to these Terms, you may not access or use the Service.",
          "These Terms constitute a legally binding agreement between you and [Your Name / Company] (\"SkillSeekers\", \"we\", \"us\", or \"our\"), a Romanian individual or entity. By creating an account or browsing the platform, you confirm that you have read, understood, and accepted these Terms.",
          "We may update these Terms from time to time. When we make material changes, we will notify you via the platform or by email. Continued use of the Service after the effective date of any changes constitutes your acceptance of the revised Terms.",
        ],
      },
      {
        id: "description",
        heading: "2. Description of Service",
        paragraphs: [
          "SkillSeekers is an online marketplace that connects clients who need local services with independent service providers across Romania. The platform allows clients to post job requests and browse provider profiles, and allows providers to list their services and respond to client requests.",
          "SkillSeekers is a platform intermediary only. We are not a party to any agreement formed between clients and service providers through the platform. We do not employ service providers, do not supervise the delivery of services, and do not guarantee the quality, safety, legality, or completion of any service offered or delivered.",
        ],
      },
      {
        id: "registration",
        heading: "3. Account Registration",
        paragraphs: [
          "To access the full features of SkillSeekers, you must create an account. You must be at least 18 years old to register. By creating an account, you represent and warrant that you are 18 years of age or older.",
          "You agree to provide accurate, current, and complete information during registration and to keep your account information up to date. You are solely responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. If you suspect unauthorised access to your account, you must notify us immediately at support@skillseekers.ro.",
          "We reserve the right to refuse registration or to cancel any account at our reasonable discretion, including where we suspect that provided information is false or that the account is being used in violation of these Terms.",
        ],
      },
      {
        id: "obligations",
        heading: "4. User Obligations & Prohibited Uses",
        paragraphs: [
          "By using SkillSeekers, you agree to comply with all applicable Romanian and EU laws and regulations. You are responsible for ensuring that your use of the platform is lawful in your jurisdiction.",
          "You must not use the platform to: post false, misleading, or fraudulent information about yourself or your services; impersonate any person or entity; upload content that infringes any copyright, trademark, or other intellectual property right; distribute spam, unsolicited commercial communications, or malware; attempt to gain unauthorised access to any part of the platform or to other users' accounts; or engage in any conduct that is harassing, abusive, defamatory, or otherwise harmful to other users or to SkillSeekers.",
          "We may remove any content and suspend or terminate any account that, in our reasonable judgment, violates these obligations, without prior notice in cases of serious breach. We may also report unlawful activity to the competent authorities.",
        ],
      },
      {
        id: "content",
        heading: "5. Content You Post",
        paragraphs: [
          "By posting content on SkillSeekers — including job descriptions, photos, profile text, and portfolio images — you grant SkillSeekers a non-exclusive, royalty-free, worldwide licence to display, reproduce, and distribute that content on the platform for the purposes of operating the Service.",
          "You retain ownership of all content you post. You represent and warrant that: you own or have the necessary rights to the content you post; the content does not infringe any third-party intellectual property rights; and the content does not violate any applicable law or these Terms.",
          "We do not proactively review all content posted on the platform but reserve the right to remove any content that we determine, in our reasonable discretion, to violate these Terms or applicable law.",
        ],
      },
      {
        id: "marketplace",
        heading: "6. Marketplace Relationship & Payments",
        paragraphs: [
          "SkillSeekers operates as a marketplace only. Any agreement for the provision of services is made directly and exclusively between the client and the service provider. SkillSeekers is not a party to those agreements and assumes no liability for their performance or non-performance.",
          "Payment processing is not currently available on the SkillSeekers platform. Any financial arrangements for services booked through the platform must be agreed and settled directly between the client and the service provider. SkillSeekers does not hold, process, or take responsibility for any funds exchanged between users.",
          "When payment functionality is introduced, a separate payment terms addendum will be published and incorporated into these Terms.",
        ],
      },
      {
        id: "liability",
        heading: "7. Limitation of Liability",
        paragraphs: [
          "To the fullest extent permitted by Romanian and EU law, SkillSeekers shall not be liable for any indirect, incidental, special, consequential, or punitive damages of any kind arising from or in connection with your use of, or inability to use, the Service — including damages for loss of profits, goodwill, data, or other intangible losses — even if we have been advised of the possibility of such damages.",
          "Our total aggregate liability to you for any claims arising under or in connection with these Terms shall not exceed the total amounts you have paid us in the twelve months preceding the claim. As the Service is currently provided free of charge, our aggregate liability is correspondingly nil, to the extent permitted by law.",
          "Nothing in these Terms limits or excludes our liability for: death or personal injury caused by our negligence; fraud or fraudulent misrepresentation; or any liability that cannot be excluded or limited under applicable Romanian or EU consumer protection law.",
        ],
      },
      {
        id: "termination",
        heading: "8. Account Termination",
        paragraphs: [
          "You may delete your account at any time from your dashboard settings. Upon deletion, your right to use the platform ceases immediately. We will process your data deletion request as set out in our Privacy Policy.",
          "We may suspend or permanently terminate your account if you breach these Terms, engage in fraudulent or abusive behaviour, or if continued operation of your account poses a risk to other users or the platform. In cases of serious breach, termination may occur without prior notice. In less serious cases, we will endeavour to give you notice and an opportunity to remedy the breach before termination.",
        ],
      },
      {
        id: "governing-law",
        heading: "9. Governing Law & Disputes",
        paragraphs: [
          "These Terms are governed by and construed in accordance with the laws of Romania, without regard to its conflict-of-law principles. Any disputes arising from or relating to these Terms or your use of SkillSeekers shall be subject to the exclusive jurisdiction of the competent courts located in Romania.",
          "If you are a consumer resident in the European Union, you may also have access to the European Commission's online dispute resolution platform at ec.europa.eu/odr for the out-of-court resolution of disputes.",
          "Before initiating formal legal proceedings, we encourage you to contact us at support@skillseekers.ro to seek an amicable resolution. We are committed to resolving disputes fairly and efficiently.",
        ],
      },
      {
        id: "contact",
        heading: "10. Contact",
        paragraphs: [
          "If you have any questions, concerns, or feedback about these Terms of Service, please contact us at support@skillseekers.ro. We are committed to addressing all inquiries promptly.",
        ],
      },
    ],
  },

  ro: {
    title: "Termeni și Condiții de Utilizare",
    toc: [
      { id: "acceptance", label: "Acceptarea termenilor" },
      { id: "description", label: "Descrierea serviciului" },
      { id: "registration", label: "Înregistrarea contului" },
      { id: "obligations", label: "Obligații și utilizări interzise" },
      { id: "content", label: "Conținutul postat" },
      { id: "marketplace", label: "Relația cu platforma și plăți" },
      { id: "liability", label: "Limitarea răspunderii" },
      { id: "termination", label: "Încetarea contului" },
      { id: "governing-law", label: "Legea aplicabilă și litigii" },
      { id: "contact", label: "Contact" },
    ],
    sections: [
      {
        id: "acceptance",
        heading: "1. Acceptarea termenilor",
        paragraphs: [
          "Prin accesarea sau utilizarea platformei SkillSeekers (denumit „Serviciul\"), sunteți de acord să respectați acești Termeni și Condiții de Utilizare (denumiți „Termenii\"). Dacă nu sunteți de acord cu acești Termeni, nu puteți accesa sau utiliza Serviciul.",
          "Acești Termeni constituie un acord obligatoriu din punct de vedere juridic între dvs. și [Numele tău / Compania ta] („SkillSeekers\", „noi\", „nouă\" sau „nostru\"), o persoană fizică sau juridică română. Prin crearea unui cont sau navigarea pe platformă, confirmați că ați citit, înțeles și acceptat acești Termeni.",
          "Putem actualiza acești Termeni periodic. Când facem modificări substanțiale, vă vom notifica prin platformă sau prin e-mail. Continuarea utilizării Serviciului după data intrării în vigoare a oricăror modificări constituie acceptarea Termenilor revizuiți.",
        ],
      },
      {
        id: "description",
        heading: "2. Descrierea serviciului",
        paragraphs: [
          "SkillSeekers este o platformă online care conectează clienți care au nevoie de servicii locale cu prestatori de servicii independenți din România. Platforma permite clienților să posteze anunțuri de servicii și să navigheze prin profilurile prestatorilor, iar prestatorilor să își listeze serviciile și să răspundă solicitărilor clienților.",
          "SkillSeekers acționează exclusiv ca intermediar al platformei. Nu suntem parte la niciun acord format între clienți și prestatorii de servicii prin intermediul platformei. Nu angajăm prestatori de servicii, nu supervizăm prestarea serviciilor și nu garantăm calitatea, siguranța, legalitatea sau finalizarea niciunui serviciu oferit sau prestat.",
        ],
      },
      {
        id: "registration",
        heading: "3. Înregistrarea contului",
        paragraphs: [
          "Pentru a accesa funcționalitățile complete ale SkillSeekers, trebuie să vă creați un cont. Trebuie să aveți cel puțin 18 ani pentru a vă înregistra. Prin crearea unui cont, declarați și garantați că aveți vârsta de 18 ani sau mai mult.",
          "Sunteți de acord să furnizați informații exacte, actuale și complete la înregistrare și să vă mențineți informațiile de cont la zi. Sunteți singurul responsabil pentru confidențialitatea datelor de autentificare și pentru toate activitățile desfășurate în contul dvs. Dacă suspectați accesul neautorizat la contul dvs., trebuie să ne notificați imediat la support@skillseekers.ro.",
          "Ne rezervăm dreptul de a refuza înregistrarea sau de a anula orice cont la discreția noastră rezonabilă, inclusiv atunci când suspectăm că informațiile furnizate sunt false sau că un cont este utilizat cu încălcarea acestor Termeni.",
        ],
      },
      {
        id: "obligations",
        heading: "4. Obligații și utilizări interzise",
        paragraphs: [
          "Prin utilizarea SkillSeekers, sunteți de acord să respectați toate legile și reglementările române și ale UE aplicabile. Sunteți responsabil pentru a vă asigura că utilizarea platformei este legală în jurisdicția dvs.",
          "Nu este permis să utilizați platforma pentru a: posta informații false, înșelătoare sau frauduloase despre dvs. sau serviciile dvs.; uzurpa identitatea unei persoane sau entități; încărca conținut care încalcă drepturile de autor, mărci comerciale sau alte drepturi de proprietate intelectuală; distribui spam, comunicări comerciale nesolicitate sau programe malware; încerca să obțineți acces neautorizat la orice parte a platformei sau la conturile altor utilizatori; sau a vă angaja în comportamente hărțuitoare, abuzive, defăimătoare sau dăunătoare altor utilizatori sau SkillSeekers.",
          "Putem elimina orice conținut și suspenda sau închide orice cont care, în judecata noastră rezonabilă, încalcă aceste obligații, fără notificare prealabilă în cazuri de încălcare gravă. Putem, de asemenea, raporta activitățile ilegale autorităților competente.",
        ],
      },
      {
        id: "content",
        heading: "5. Conținutul postat",
        paragraphs: [
          "Prin postarea de conținut pe SkillSeekers — inclusiv descrieri de servicii, fotografii, text de profil și imagini din portofoliu — acordați SkillSeekers o licență neexclusivă, fără redevențe, la nivel mondial, pentru a afișa, reproduce și distribui acel conținut pe platformă în scopul operării Serviciului.",
          "Păstrați proprietatea asupra întregului conținut pe care îl postați. Declarați și garantați că: dețineți sau aveți drepturile necesare asupra conținutului postat; conținutul nu încalcă drepturile de proprietate intelectuală ale unor terțe părți; și conținutul nu încalcă nicio lege aplicabilă sau acești Termeni.",
          "Nu revizuim proactiv tot conținutul postat pe platformă, dar ne rezervăm dreptul de a elimina orice conținut pe care îl considerăm, la discreția noastră rezonabilă, că încalcă acești Termeni sau legea aplicabilă.",
        ],
      },
      {
        id: "marketplace",
        heading: "6. Relația cu platforma și plăți",
        paragraphs: [
          "SkillSeekers funcționează exclusiv ca platformă de intermediere. Orice acord pentru prestarea de servicii se încheie direct și exclusiv între client și prestatorul de servicii. SkillSeekers nu este parte la aceste acorduri și nu își asumă nicio răspundere pentru executarea sau neexecutarea acestora.",
          "Procesarea plăților nu este disponibilă în prezent pe platforma SkillSeekers. Orice aranjamente financiare pentru servicii rezervate prin platformă trebuie convenite și reglate direct între client și prestatorul de servicii. SkillSeekers nu deține, nu procesează și nu își asumă responsabilitatea pentru niciun fond schimbat între utilizatori.",
          "Atunci când funcționalitatea de plată va fi introdusă, un addendum separat privind termenii de plată va fi publicat și incorporat în acești Termeni.",
        ],
      },
      {
        id: "liability",
        heading: "7. Limitarea răspunderii",
        paragraphs: [
          "În măsura maximă permisă de legea română și de cea a UE, SkillSeekers nu va fi responsabilă pentru nicio daună indirectă, incidentală, specială, consecutivă sau punitivă de nicio natură care decurge din sau în legătură cu utilizarea sau imposibilitatea de a utiliza Serviciul — inclusiv daune pentru pierderea profitului, a bunăvoinței, a datelor sau a altor pierderi necorporale — chiar dacă am fost informați cu privire la posibilitatea unor astfel de daune.",
          "Răspunderea noastră totală față de dvs. pentru orice pretenții care decurg din sau în legătură cu acești Termeni nu va depăși sumele totale pe care ni le-ați plătit în cele douăsprezece luni anterioare pretenției. Întrucât Serviciul este în prezent furnizat gratuit, răspunderea noastră agregată este corespunzător zero, în măsura permisă de lege.",
          "Nicio prevedere din acești Termeni nu limitează sau exclude răspunderea noastră pentru: deces sau vătămare corporală cauzate de neglijența noastră; fraudă sau denaturare frauduloasă; sau orice răspundere care nu poate fi exclusă sau limitată conform legii române sau europene aplicabile privind protecția consumatorilor.",
        ],
      },
      {
        id: "termination",
        heading: "8. Încetarea contului",
        paragraphs: [
          "Vă puteți șterge contul oricând din setările tabloului de bord. La ștergere, dreptul dvs. de a utiliza platforma încetează imediat. Vom procesa solicitarea de ștergere a datelor dvs. conform Politicii noastre de Confidențialitate.",
          "Putem suspenda sau închide permanent contul dvs. dacă încălcați acești Termeni, dacă vă implicați în comportamente frauduloase sau abuzive, sau dacă funcționarea continuă a contului dvs. prezintă riscuri pentru alți utilizatori sau pentru platformă. În cazuri de încălcare gravă, închiderea poate interveni fără notificare prealabilă. În cazuri mai puțin grave, vom depune eforturi să vă oferim notificare și posibilitatea de a remedia încălcarea înainte de închidere.",
        ],
      },
      {
        id: "governing-law",
        heading: "9. Legea aplicabilă și litigii",
        paragraphs: [
          "Acești Termeni sunt guvernați și interpretați în conformitate cu legile României, fără a ține cont de principiile privind conflictul de legi. Orice litigii care decurg din sau sunt legate de acești Termeni sau de utilizarea SkillSeekers vor fi supuse jurisdicției exclusive a instanțelor competente din România.",
          "Dacă sunteți un consumator rezident în Uniunea Europeană, puteți, de asemenea, accesa platforma de soluționare online a litigiilor a Comisiei Europene la adresa ec.europa.eu/odr pentru soluționarea extrajudiciară a disputelor.",
          "Înainte de a iniția proceduri legale formale, vă încurajăm să ne contactați la support@skillseekers.ro pentru a căuta o soluționare amiabilă. Ne angajăm să rezolvăm disputele în mod echitabil și eficient.",
        ],
      },
      {
        id: "contact",
        heading: "10. Contact",
        paragraphs: [
          "Dacă aveți întrebări, preocupări sau feedback cu privire la acești Termeni și Condiții, vă rugăm să ne contactați la support@skillseekers.ro. Ne angajăm să abordăm toate solicitările prompt.",
        ],
      },
    ],
  },
};

export default function TermsPage() {
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
