"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Zap, ArrowRight, Github } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { signInWithEmail, signInWithGoogle, signInWithGithub } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [redirectTo, setRedirectTo] = useState("/");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    if (redirect) setRedirectTo(redirect);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { error } = await signInWithEmail(email, password);

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    toast.success("Welcome back!");
    router.push(redirectTo);
  };

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
  };

  const handleGithubSignIn = async () => {
    const { error } = await signInWithGithub();
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex w-1/2 relative bg-zinc-950 flex-col justify-between p-12 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 hero-bg" />
        <div className="absolute inset-0 bg-dots opacity-20" />

        {/* Floating cards */}
        <div className="absolute inset-0 pointer-events-none">
          {[
            { x: "20%", y: "25%", name: "Marcus J.", role: "Handyman", rating: "4.9", delay: 0 },
            { x: "60%", y: "50%", name: "Sophia C.", role: "Cleaning", rating: "4.95", delay: 0.5 },
            { x: "15%", y: "65%", name: "James P.", role: "AI Expert", rating: "4.97", delay: 1 },
          ].map((card) => (
            <motion.div
              key={card.name}
              className="absolute glass-dark rounded-xl px-3 py-2 border border-white/10 flex items-center gap-2"
              style={{ left: card.x, top: card.y }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, delay: card.delay, repeat: Infinity }}
            >
              <div className="h-7 w-7 rounded-lg bg-brand-500/30 flex items-center justify-center text-white font-bold text-xs">
                {card.name[0]}
              </div>
              <div>
                <div className="text-white text-xs font-medium leading-none">{card.name}</div>
                <div className="text-white/50 text-[10px]">{card.role}</div>
              </div>
              <div className="text-amber-400 text-xs ml-1">★ {card.rating}</div>
            </motion.div>
          ))}
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">
              Skill<span className="text-brand-400">Seekers</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10">
          <blockquote className="text-white/90 text-xl font-medium leading-relaxed mb-6">
            "SkillSeekers transformed how I find clients. My income tripled in 6 months."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand-500/40 flex items-center justify-center text-white font-bold">
              R
            </div>
            <div>
              <div className="text-white text-sm font-semibold">Robert K.</div>
              <div className="text-white/50 text-xs">Handyman · Austin, TX</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-zinc-950">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg text-zinc-900 dark:text-white">
              Skill<span className="text-brand-500">Seekers</span>
            </span>
          </Link>

          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
            Welcome back
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
            >
              Sign up free
            </Link>
          </p>

          {/* Social logins */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button
              onClick={handleGithubSignIn}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Github className="h-4 w-4" />
              GitHub
            </button>
          </div>

          <div className="relative flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
            <span className="text-xs text-zinc-400">or continue with email</span>
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-zinc-300 text-brand-500 focus:ring-brand-500"
                />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

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
            >
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-zinc-400">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-zinc-600">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-zinc-600">
              Privacy Policy
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
}
