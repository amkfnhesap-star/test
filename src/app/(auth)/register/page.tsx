"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ArrowRight, ArrowLeft, User, Briefcase, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { signUpWithEmail, supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

type Step = "role" | "details" | "verify";
type Role = "customer" | "provider";

export default function RegisterPage() {
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    city: "",
    skills: "",
  });

  const handleRoleSelect = (selected: Role) => {
    setRole(selected);
    setStep("details");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const redirectTo =
      role === "provider"
        ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/provider/onboarding`
        : `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/dashboard`;

    const { error } = await signUpWithEmail(
      form.email,
      form.password,
      {
        full_name: form.fullName,
        role,
        city: form.city,
        ...(role === "provider" && { skills: form.skills }),
      },
      redirectTo
    );

    setIsLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setStep("verify");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 pt-20">
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-glow">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl text-zinc-900 dark:text-white">
            Meste<span className="text-brand-500">RO</span>
          </span>
        </Link>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(["role", "details", "verify"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  step === s
                    ? "bg-brand-500 text-white ring-4 ring-brand-500/20"
                    : i < (["role", "details", "verify"] as Step[]).indexOf(step)
                    ? "bg-emerald-500 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                )}
              >
                {i < (["role", "details", "verify"] as Step[]).indexOf(step) ? (
                  <Check className="h-3 w-3" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && (
                <div
                  className={cn(
                    "h-0.5 w-8 rounded-full transition-all",
                    i < (["role", "details", "verify"] as Step[]).indexOf(step)
                      ? "bg-emerald-500"
                      : "bg-zinc-200 dark:bg-zinc-700"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Role selection */}
          {step === "role" && (
            <motion.div
              key="role"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-8"
            >
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 text-center">
                Cum vei folosi MesteRO?
              </h1>
              <p className="text-zinc-500 text-sm text-center mb-8">
                Alege tipul de cont pentru a începe.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    r: "customer" as Role,
                    icon: User,
                    title: "Am nevoie de ajutor",
                    desc: "Găsește profesioniști de încredere pentru orice lucrare",
                    perks: ["250K+ meșteri disponibili", "Rezervare rapidă", "Garanție 1M RON"],
                    gradient: "from-brand-500 to-violet-600",
                  },
                  {
                    r: "provider" as Role,
                    icon: Briefcase,
                    title: "Ofer servicii",
                    desc: "Dezvoltă-ți afacerea pe platforma noastră",
                    perks: ["Îți stabilești propriile tarife", "Păstrezi 90% din câștiguri", "Gratuit să te alături"],
                    gradient: "from-emerald-500 to-teal-600",
                  },
                ].map(({ r, icon: Icon, title, desc, perks, gradient }) => (
                  <button
                    key={r}
                    onClick={() => handleRoleSelect(r)}
                    className={cn(
                      "group relative p-5 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-md",
                      role === r
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-brand-300 dark:hover:border-brand-700"
                    )}
                  >
                    <div
                      className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-zinc-900 dark:text-white mb-1">
                      {title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                      {desc}
                    </p>
                    <ul className="space-y-1">
                      {perks.map((perk) => (
                        <li key={perk} className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                          <Check className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>

              <p className="text-center text-sm text-zinc-500 mt-6">
                Ai deja un cont?{" "}
                <Link href="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
                  Conectează-te
                </Link>
              </p>
            </motion.div>
          )}

          {/* Step 2: Details */}
          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-8"
            >
              <button
                onClick={() => setStep("role")}
                className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-6"
              >
                <ArrowLeft className="h-4 w-4" /> Înapoi
              </button>

              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
                Creează-ți contul
              </h1>
              <p className="text-zinc-500 text-sm mb-8">
                {role === "provider"
                  ? "Configurează-ți profilul de meșter și începe să câștigi."
                  : "Alătură-te milioanelor de clienți de pe MesteRO."}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nume complet"
                  placeholder="Ion Popescu"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required
                  fullWidth
                />
                <Input
                  label="Adresă de email"
                  type="email"
                  placeholder="tu@exemplu.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  fullWidth
                />
                <Input
                  label="Parolă"
                  type="password"
                  placeholder="Minim 8 caractere"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  hint="Folosește minim 8 caractere, combinând litere, cifre și simboluri."
                  fullWidth
                />
                <Input
                  label="Oraș"
                  placeholder="București"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                  fullWidth
                />
                {role === "provider" && (
                  <Input
                    label="Serviciu / specialitate principală"
                    placeholder="ex. Curățenie, Instalații, Consultanță IT"
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    required
                    fullWidth
                    hint="Poți adăuga mai multe servicii după înregistrare."
                  />
                )}

                {error && (
                  <p className="text-sm text-red-500 dark:text-red-400 text-center">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  isLoading={isLoading}
                  fullWidth
                  size="lg"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="mt-2"
                >
                  Creează contul
                </Button>
              </form>

              <p className="mt-4 text-center text-xs text-zinc-400">
                Prin crearea unui cont, confirmați că sunteți de acord cu{" "}
                <Link href="/terms" className="underline">Termenii de utilizare</Link> și{" "}
                <Link href="/privacy" className="underline">Politica de confidențialitate</Link>.
              </p>
            </motion.div>
          )}

          {/* Step 3: Email verification */}
          {step === "verify" && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-8 text-center"
            >
              <motion.div
                className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-5"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </motion.div>

              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                Verifică-ți emailul!
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-2 leading-relaxed">
                Am trimis un link de verificare la{" "}
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {form.email}
                </span>
                . Apasă pe el pentru a-ți activa contul.
              </p>
              {role === "provider" && (
                <p className="text-xs text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 rounded-xl px-3 py-2 mb-6">
                  După verificare, vei fi redirecționat direct către configurarea profilului de meșter.
                </p>
              )}
              {role !== "provider" && <div className="mb-6" />}

              <Link href={role === "provider" ? "/provider/onboarding" : "/dashboard"}>
                <Button fullWidth size="lg">
                  {role === "provider" ? "Configurează profilul de meșter" : "Mergi la panou"}
                </Button>
              </Link>

              <button
                className="mt-4 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                onClick={async () => {
                  const { error } = await supabase.auth.resend({
                    type: "signup",
                    email: form.email,
                  });
                  if (error) {
                    toast.error(error.message);
                  } else {
                    toast.success("Email de verificare retrimis!");
                  }
                }}
              >
                Nu l-ai primit? Retrimite
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
