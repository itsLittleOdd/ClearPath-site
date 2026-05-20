/**
 * Site navigation links - server-safe pure data.
 *
 * Lives outside `components/Nav.tsx` because that file is a Client Component
 * (`"use client"`). Exporting NAV_LINKS from a client module and importing it
 * into a Server Component (e.g. Footer.tsx) crosses the client/server boundary
 * and mangles the export at bundle time, breaking `.map(...)` at runtime.
 * Both the client Nav and the server Footer import this module instead.
 */

export type NavLink = {
  href: string;
  label: string;
};

export const NAV_LINKS: readonly NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/use-cases", label: "Use Cases" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;
