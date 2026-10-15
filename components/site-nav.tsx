"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Circle, BookOpen, NotebookPen } from "lucide-react";

export function SiteNav() {
  const pathname = usePathname();
  return <nav className="site-nav" aria-label="Main navigation">
    {[
      { href: "/", label: "Feel", icon: Circle, active: pathname === "/" || pathname.startsWith("/emotions/") },
      { href: "/my-verses", label: "Verses", icon: BookOpen, active: pathname === "/my-verses" || pathname === "/compare" },
      { href: "/journal", label: "Journal", icon: NotebookPen, active: pathname === "/journal" },
    ].map(({ href, label, icon: Icon, active }) => <Link key={href} href={href} aria-current={active ? "page" : undefined}><Icon size={19} strokeWidth={1.5} aria-hidden="true" /><span>{label}</span></Link>)}
  </nav>;
}
