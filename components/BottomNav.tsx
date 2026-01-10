"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
  label: string;
  href: string;
};

const tabs: Tab[] = [
  { label: "Pool", href: "/" },
  { label: "Roster", href: "/roster" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Rosters", href: "/rosters" }, // 👈 ADD THIS
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-around px-4 py-3">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={[
                "flex-1 text-center text-sm font-semibold",
                "rounded-md py-2",
                isActive ? "text-text" : "text-muted",
              ].join(" ")}
            >
              {tab.label}
              {isActive && (
                <div className="mx-auto mt-2 h-1 w-8 rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
