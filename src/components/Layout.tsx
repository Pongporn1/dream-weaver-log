import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Book, Library, Moon, Bot, BarChart3, Info } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/logs", icon: Book, label: "Logs" },
  { path: "/library", icon: Library, label: "Library" },
  { path: "/sleep", icon: Moon, label: "Sleep" },
  { path: "/statistics", icon: BarChart3, label: "Stats" },
  { path: "/librarian", icon: Bot, label: "AI" },
  { path: "/about", icon: Info, label: "About" },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

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
      <main className="flex-1 container-app">{children}</main>

      {/* Bottom navigation - mobile */}
      <nav className="border-t border-border sticky bottom-0 bg-background">
        <div className="flex justify-around py-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive =
              location.pathname === path ||
              (path !== "/" && location.pathname.startsWith(path));
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
