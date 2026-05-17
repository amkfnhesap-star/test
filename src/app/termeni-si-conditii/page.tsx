import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termeni și Condiții | MesteRO",
  description: "Termenii și condițiile de utilizare ale platformei MesteRO.",
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

export default function TermeniSiConditii() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          <p className="text-slate-500 text-sm mb-2">Ultima actualizare: 17 mai 2026</p>
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Termeni și Condiții</h1>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">1. Acceptarea termenilor</h2>
            <p className="text-slate-700 leading-relaxed">
              Prin folosirea platformei MesteRO, sunteți de acord cu acești termeni. Dacă nu sunteți de
              acord, vă rugăm să nu folosiți serviciul.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">2. Ce este MesteRO</h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              MesteRO este o platformă de tip „connection-only": conectăm clienții care au nevoie de
              servicii cu meșteri și profesioniști care le oferă. <strong>NU procesăm plăți</strong>, <strong>NU
              suntem parte a contractului</strong> între client și meșter, <strong>NU oferim garanții</strong> pentru
              lucrările executate.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Plata și organizarea efectivă a lucrării se fac <strong>DIRECT</strong> între client și meșter, în
              afara platformei. MesteRO nu este responsabil pentru calitatea lucrărilor, întârzieri, dispute
              financiare sau alte aspecte ale relației comerciale dintre Dvs. și cealaltă parte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">3. Cont de utilizator</h2>
            <BulletList>
              {[
                "Trebuie să aveți minimum 16 ani pentru a folosi platforma",
                "Sunteți responsabil pentru păstrarea în siguranță a parolei",
                "O singură persoană poate avea un singur cont",
              ]}
            </BulletList>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">4. Reguli de utilizare</h2>
            <p className="text-slate-700 leading-relaxed mb-1">Este interzis să:</p>
            <BulletList>
              {[
                "Postați informații false sau înșelătoare",
                "Hărțuiți alți utilizatori",
                "Folosiți platforma pentru spam sau publicitate nesolicitată",
                "Postați conținut ilegal, ofensator, sau care încalcă drepturile altora",
                "Încercați să ocoliți măsurile de securitate ale platformei",
                "Creați conturi multiple sau false",
              ]}
            </BulletList>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">
              5. Conținutul utilizatorilor
            </h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              Conținutul pe care îl postați (descrieri, fotografii, recenzii, mesaje) rămâne al Dvs. Ne
              acordați însă o licență neexclusivă pentru a-l afișa pe platformă.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Vă rugăm să postați doar conținut original sau pentru care aveți drept de folosire.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">6. Recenzii</h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              Recenziile trebuie să fie oneste și bazate pe experiențe reale.
            </p>
            <p className="text-slate-700 leading-relaxed mb-3">
              Este interzisă cumpărarea, vânzarea sau manipularea recenziilor.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Ne rezervăm dreptul de a elimina recenziile care încalcă aceste reguli.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">
              7. Suspendarea sau ștergerea contului
            </h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              Putem suspenda sau șterge contul Dvs. fără preaviz dacă încălcați acești termeni.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Puteți șterge contul oricând din{" "}
              <span className="font-medium text-slate-900">Setări → Cont → Ștergere cont</span>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">8. Limitarea răspunderii</h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              MesteRO este oferit „așa cum este" (<em>as-is</em>), fără garanții explicite sau implicite.
            </p>
            <p className="text-slate-700 leading-relaxed">
              În măsura permisă de lege, MesteRO nu este responsabil pentru daune indirecte, pierderi de
              profit, sau alte prejudicii rezultate din folosirea sau imposibilitatea de a folosi platforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">9. Legislația aplicabilă</h2>
            <p className="text-slate-700 leading-relaxed">
              Acești termeni sunt guvernați de legislația din România. Eventualele dispute vor fi
              soluționate de instanțele competente din România.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">10. Modificări</h2>
            <p className="text-slate-700 leading-relaxed">
              Putem modifica acești termeni. Versiunea actualizată va fi publicată pe această pagină cu data
              ultimei modificări.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">11. Contact</h2>
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
