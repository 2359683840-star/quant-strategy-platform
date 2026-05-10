"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Blocks, LayoutDashboard, Library, FileText } from "lucide-react";
import clsx from "clsx";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/editor", label: "Strategy Editor", icon: Blocks },
  { href: "/templates", label: "Templates", icon: Library },
  { href: "/docs", label: "Docs", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-[var(--sidebar)] border-r border-[var(--border)] flex flex-col z-50">
      <div className="p-5 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <BarChart3 className="w-4.5 h-4.5 text-black" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[var(--foreground)] leading-tight">
              QuantForge
            </div>
            <div className="text-[10px] text-[var(--muted)] leading-tight">
              Strategy Platform
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 no-underline",
                active
                  ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
          Backtest engine ready
        </div>
      </div>
    </aside>
  );
}
