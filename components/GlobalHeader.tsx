"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GlobalHeader() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href ? "text-[var(--brand-600)] font-semibold" : "text-gray-600 hover:text-gray-900";

  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">
          NicheRoot
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className={isActive("/")}>
            Home
          </Link>

          <Link href="/start" className={isActive("/start")}>
            Start Matching
          </Link>

          <Link href="/blueprint" className={isActive("/blueprint")}>
            Your Blueprints
          </Link>
        </nav>

        {/* CTA */}
        <Link
          href="/start"
          className="rounded-full bg-[var(--brand-500)] text-white px-4 py-2 text-sm shadow-sm hover:bg-[var(--brand-400)]"
        >
          New Blueprint
        </Link>
      </div>
    </header>
  );
}
