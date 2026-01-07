import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "../components/BottomNav";

export const metadata: Metadata = {
  title: "Playoff Pool",
  description: "Casual playoff fantasy pool",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-bg text-text">
        {/* Page content */}
        <div className="mx-auto max-w-md px-4 pt-4 pb-24">{children}</div>

        {/* Bottom navigation */}
        <BottomNav />
      </body>
    </html>
  );
}
