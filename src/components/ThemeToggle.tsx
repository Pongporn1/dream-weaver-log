import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    setIsAnimating(true);
    
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative h-9 w-9 overflow-hidden rounded-full"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {/* Background glow effect */}
      <span
        className={`absolute inset-0 rounded-full transition-all duration-500 ${
          theme === "dark"
            ? "bg-gradient-to-br from-primary/20 to-primary/5"
            : "bg-gradient-to-br from-amber-200/30 to-orange-100/20"
        }`}
      />

      {/* Sun icon */}
      <Sun
        className={`absolute h-4 w-4 transition-all duration-500 ${
          theme === "dark"
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100 text-amber-500"
        } ${isAnimating && theme === "light" ? "animate-[spin_0.5s_ease-out]" : ""}`}
      />

      {/* Moon icon */}
      <Moon
        className={`absolute h-4 w-4 transition-all duration-500 ${
          theme === "dark"
            ? "rotate-0 scale-100 opacity-100 text-primary"
            : "-rotate-90 scale-0 opacity-0"
        } ${isAnimating && theme === "dark" ? "animate-[spin_0.5s_ease-out]" : ""}`}
      />

      {/* Ripple effect on toggle */}
      {isAnimating && (
        <span
          className={`absolute inset-0 rounded-full animate-ping ${
            theme === "dark" ? "bg-primary/30" : "bg-amber-400/30"
          }`}
          style={{ animationDuration: "0.5s", animationIterationCount: 1 }}
        />
      )}
    </Button>
  );
}
