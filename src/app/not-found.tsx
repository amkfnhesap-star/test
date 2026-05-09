import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-center px-4">
      <div className="text-8xl font-black text-zinc-100 dark:text-zinc-800 mb-4 select-none">
        404
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
        Page not found
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
        <Link href="/search">
          <Button variant="secondary">Browse Services</Button>
        </Link>
      </div>
    </div>
  );
}
