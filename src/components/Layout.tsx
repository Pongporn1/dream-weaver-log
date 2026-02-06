import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

import { BottomNavigation } from "@/components/BottomNavigation";

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background z-10">
        <div className="container-app py-3">
          <Link to="/" className="text-lg font-semibold">
            Dream book{" "}
            <span className="text-muted-foreground font-normal">by Bon</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container-app pb-24">{children}</main>

      {/* Bottom navigation - mobile */}
      <BottomNavigation />
    </div>
  );
}
