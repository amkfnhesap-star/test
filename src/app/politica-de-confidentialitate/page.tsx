import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de Confidențialitate | MesteRO",
  description: "Politica de confidențialitate a platformei MesteRO.",
};

const items = (...list: string[]) => list;

function BulletList({ children }: { children: string[] }) {
  return (
    <ul className="space-y-2 mt-3">
      {children.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-500 flex-shrink-0" />
          <span className="text-slate-700 leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PoliticaDeConfidentialitate() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          <p className="text-slate-500 text-sm mb-2">Ultima actualizare: 17 mai 2026</p>
          <h1 className="text-3xl font-bold text-slate-900 mb-8">
            Politica de Confidențialitate
          </h1>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">1. Cine suntem</h2>
            <p className="text-slate-700 leading-relaxed">
              MesteRO este o platformă online aflată în versiune beta, care conectează clienți cu meșteri și
              profesioniști în servicii. Operatorul platformei este MesteRO (versiune beta), cu sediul în România.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">2. Ce date colectăm</h2>
            <p className="text-slate-700 leading-relaxed">
              Colectăm următoarele categorii de date cu caracter personal:
            </p>
            <BulletList>
              {items(
                "Date de cont: nume, email, parolă (criptată), număr de telefon, oraș",
                "Date de profil (pentru meșteri): titlu profil, abilități, tarife, descriere, fotografii portofoliu",
                "Date despre lucrări: titlu, descriere, buget, fotografii, locație generală",
                "Mesaje schimbate prin platformă (chat în aplicație)",
                "Recenzii lăsate și primite",
                "Date tehnice: adresă IP, tip browser, sistem de operare (pentru securitate și debugging)",
                "Cookie-uri și date similare (vezi Politica de Cookies)",
              )}
            </BulletList>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">
              3. De ce colectăm aceste date (scopurile prelucrării)
            </h2>
            <BulletList>
              {items(
                "Pentru a oferi serviciul platformei (conectarea clienților cu meșteri)",
                "Pentru a permite comunicarea între utilizatori",
                "Pentru a preveni fraude și abuzuri",
                "Pentru a îmbunătăți serviciul (statistici anonime)",
                "NU vindem datele Dvs. către terți",
              )}
            </BulletList>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">4. Cu cine partajăm datele</h2>
            <BulletList>
              {items(
                "Cu alți utilizatori ai platformei (de ex. atunci când lăsați un mesaj, destinatarul vede mesajul)",
                "Cu furnizorii noștri tehnici: Supabase (bază de date), Vercel (hosting) — ambii respectă GDPR",
                "Cu autoritățile competente, dacă este obligat prin lege",
              )}
            </BulletList>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">
              5. Drepturile Dvs. conform GDPR
            </h2>
            <BulletList>
              {items(
                "Dreptul de acces la datele Dvs.",
                "Dreptul la rectificare (corectare)",
                'Dreptul la ștergere ("dreptul de a fi uitat") — puteți șterge contul oricând din Setări',
                "Dreptul la restricționarea prelucrării",
                "Dreptul la portabilitatea datelor (vă putem trimite o copie a datelor Dvs.)",
                "Dreptul de a vă opune prelucrării",
                "Dreptul de a depune o plângere la ANSPDCP (Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal): www.dataprotection.ro",
              )}
            </BulletList>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">6. Cât timp păstrăm datele</h2>
            <BulletList>
              {items(
                "Datele contului: cât timp aveți contul activ + 30 de zile după ștergere",
                "Mesajele și recenziile: pe durata existenței contului",
                "Datele tehnice (loguri): maximum 12 luni",
              )}
            </BulletList>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">7. Securitate</h2>
            <BulletList>
              {items(
                "Conexiune criptată SSL pe întreaga platformă",
                "Parolele sunt criptate (hash) — nimeni, inclusiv noi, nu le poate vedea în clar",
                "Datele sunt stocate pe servere în Uniunea Europeană (Supabase EU region)",
              )}
            </BulletList>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">
              8. Modificări ale acestei politici
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Putem actualiza această politică din când în când. Vă vom anunța prin email despre modificări
              importante.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">9. Contact</h2>
            <p className="text-slate-700 leading-relaxed">
              Pentru orice întrebare despre datele Dvs., scrieți-ne la{" "}
              <a href="mailto:contact@mestero.ro" className="text-brand-600 hover:underline font-medium">
                contact@mestero.ro
              </a>
              .
            </p>
          </section>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 mt-10">
            Această pagină este redactată pentru versiunea beta a platformei MesteRO. Pentru lansarea
            publică, conținutul va fi revizuit de un avocat. Te rugăm să ne contactezi pentru clarificări
            la contact@mestero.ro.
          </div>
        </div>
      </div>
    </div>
  );
}
