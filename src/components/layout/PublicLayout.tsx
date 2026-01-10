import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/**
 * Public Layout
 * Layout for all public-facing pages
 * Includes header navigation and footer
 */
export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-[calc(73px+env(safe-area-inset-top,0px))]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
