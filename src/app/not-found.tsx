import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-4">
      <div className="text-8xl font-black text-slate-100 mb-4 select-none">
        404
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        Pagina nu a fost găsită
      </h1>
      <p className="text-slate-500 mb-8 max-w-md">
        Pagina pe care o cauți nu există sau a fost mutată.
      </p>
      <div className="flex gap-3">
        <Link href="/">
          <Button>Acasă</Button>
        </Link>
        <Link href="/search">
          <Button variant="secondary">Caută servicii</Button>
        </Link>
      </div>
    </div>
  );
}
