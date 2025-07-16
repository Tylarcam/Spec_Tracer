import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle: React.FC = () => {
  const [dark, setDark] = useState(() => localStorage.theme !== "light");

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      className="p-2 rounded-full border border-slate-600 bg-slate-800 text-yellow-300 hover:bg-slate-700 transition"
      onClick={() => setDark((d) => !d)}
      aria-label="Toggle theme"
      title="Toggle light/dark mode"
    >
      {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}; 