"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("mestero_cookie_consent")) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("mestero_cookie_consent", "all");
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem("mestero_cookie_consent", "essential_only");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-slate-900 border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <p className="text-xs sm:text-sm text-slate-300 flex-1 leading-relaxed">
          Folosim cookie-uri esențiale pentru funcționarea platformei și, opțional, cookie-uri pentru a
          îmbunătăți experiența. Vezi{" "}
          <Link
            href="/politica-cookies"
            className="underline text-white hover:text-slate-200 transition-colors"
          >
            Politica de Cookies
          </Link>
          .
        </p>
        <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
          <button
            onClick={reject}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-700 hover:bg-slate-600 text-white transition-colors"
          >
            Refuză opționalele
          </button>
          <button
            onClick={accept}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-brand-500 hover:bg-brand-600 text-white transition-colors"
          >
            Accept toate
          </button>
        </div>
      </div>
    </div>
  );
}
