import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Files, KeyRound, BarChart3, ShieldCheck, BookOpen, LogOut, Sun, Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "/fundo-logo.png";

const NAV = [
  { to: "/app", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/app/files", label: "Files", icon: Files },
  { to: "/app/keys", label: "API Keys", icon: KeyRound },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/docs", label: "API Docs", icon: BookOpen },
];

export default function AppLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const path = useLocation().pathname;
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  const items = isAdmin
    ? [...NAV, { to: "/app/admin", label: "Admin", icon: ShieldCheck, exact: false }]
    : NAV;

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-64 flex-col glass-strong border-r border-border/50 p-4 sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2 px-2 py-2">
          <img src={logo} alt="Fundo CDN" className="h-8 w-auto drop-shadow-[0_0_8px_oklch(0.72_0.22_215/0.5)]" />
        </Link>
        <nav className="mt-6 flex-1 space-y-1">
          {items.map((it) => {
            const active = it.exact ? path === it.to : path === it.to || path.startsWith(it.to + "/");
            return (
              <Link key={it.to} to={it.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  active ? "bg-sidebar-accent text-foreground neon-border" : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                }`}>
                <it.icon className="size-4" /> {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border/50 pt-3 mt-3 space-y-2">
          <div className="text-xs text-muted-foreground px-2 truncate">{user.email}</div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 justify-start" onClick={() => { signOut(); navigate("/"); }}>
              <LogOut className="size-4 mr-2" /> Sign out
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="md:hidden glass-strong border-b border-border/50 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <img src={logo} alt="Fundo CDN" className="h-7 w-auto" />
          <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/"); }}>
            <LogOut className="size-4" />
          </Button>
        </header>
        <div className="md:hidden flex overflow-x-auto gap-1 px-3 py-2 border-b border-border/50">
          {items.map((it) => {
            const active = it.exact ? path === it.to : path === it.to || path.startsWith(it.to + "/");
            return (
              <Link key={it.to} to={it.to}
                className={`whitespace-nowrap text-xs px-3 py-1.5 rounded-md transition ${active ? "bg-sidebar-accent text-foreground" : "text-muted-foreground"}`}>
                {it.label}
              </Link>
            );
          })}
        </div>
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
