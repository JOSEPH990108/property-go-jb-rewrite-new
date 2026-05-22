// src\app\(main)\layout.tsx
import { Navbar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="pt-0 md:pt-[calc(var(--header-height))]">
        {children}
      </main>
      <Footer />
    </>
  );
}
