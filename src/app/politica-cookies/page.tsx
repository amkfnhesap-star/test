import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de Cookies | MesteRO",
  description: "Politica privind utilizarea cookie-urilor pe platforma MesteRO.",
};

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

export default function PoliticaCookies() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          <p className="text-slate-500 text-sm mb-2">Ultima actualizare: 17 mai 2026</p>
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Politica de Cookies</h1>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">1. Ce sunt cookie-urile</h2>
            <p className="text-slate-700 leading-relaxed">
              Cookie-urile sunt fișiere mici de text salvate de browser-ul Dvs. atunci când vizitați un
              site. Ele permit site-ului să rețină anumite informații despre vizita Dvs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">2. Ce cookie-uri folosim</h2>

            <p className="text-slate-800 font-medium mt-4 mb-1">Cookie-uri esențiale (necesare)</p>
            <BulletList>
              {[
                "Sesiune de autentificare (sb-* cookies de la Supabase) — vă menține autentificat în timp ce navigați pe platformă",
                "Preferințe de afișare (temă, limbă)",
                "Acceptarea cookie-urilor",
              ]}
            </BulletList>

            <p className="text-slate-800 font-medium mt-5 mb-1">Cookie-uri analitice (cu acordul Dvs.)</p>
            <BulletList>
              {[
                "Statistici de utilizare anonime",
                "În prezent NU folosim Google Analytics sau alte servicii externe de tracking — toate datele sunt prelucrate intern",
              ]}
            </BulletList>

            <p className="text-slate-800 font-medium mt-5 mb-1">Cookie-uri de marketing</p>
            <BulletList>
              {["În prezent NU folosim cookie-uri de marketing"]}
            </BulletList>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">
              3. Cum gestionați cookie-urile
            </h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              Puteți accepta sau refuza cookie-urile non-esențiale prin banner-ul afișat la prima vizită.
            </p>
            <p className="text-slate-700 leading-relaxed mb-3">
              Puteți șterge cookie-urile oricând din setările browser-ului Dvs.
            </p>
            <p className="text-slate-700 leading-relaxed">
              <strong>Atenție:</strong> dezactivarea cookie-urilor esențiale va face platforma să nu
              funcționeze corect (de ex. nu vă veți putea autentifica).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">4. Modificări</h2>
            <p className="text-slate-700 leading-relaxed">
              Putem actualiza această politică dacă introducem noi tipuri de cookie-uri. Orice modificări
              vor fi postate pe această pagină cu data ultimei actualizări.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">5. Contact</h2>
            <p className="text-slate-700 leading-relaxed">
              <a href="mailto:contact@mestero.ro" className="text-brand-600 hover:underline font-medium">
                contact@mestero.ro
              </a>
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
