import { Routes, Route, Link } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import AppLayout from "./pages/app/AppLayout";
import Overview from "./pages/app/Overview";
import FilesPage from "./pages/app/Files";
import Keys from "./pages/app/Keys";
import Docs from "./pages/app/Docs";
import Analytics from "./pages/app/Analytics";
import Admin from "./pages/app/Admin";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass-strong rounded-2xl p-10 neon-border">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Lost in the CDN</h2>
        <p className="mt-2 text-sm text-muted-foreground">This route doesn't exist on Fundo CDN.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 neon-border">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Overview />} />
        <Route path="files" element={<FilesPage />} />
        <Route path="keys" element={<Keys />} />
        <Route path="docs" element={<Docs />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
