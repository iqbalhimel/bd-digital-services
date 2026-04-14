import { useState } from "react";
import { Link } from "wouter";
import { useGetSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { MessageCircle, Send, Menu, X, Facebook } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { data: settings } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const whatsappLink = settings?.whatsapp || "https://wa.me/8801572792499";
  const telegramLink = settings?.telegram || "https://t.me/+8801572792499";
  const facebookLink = settings?.facebook || "";

  const navLinks = [
    { href: "#products", label: "Products" },
    { href: "#how-to-order", label: "How to Order" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full glass-card border-b border-border/30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="text-xl md:text-2xl font-bold cursor-pointer gradient-text tracking-tight">
              {settings?.siteName || "BD Digital Services"}
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-1">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted/60 transition-all duration-150"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#22C55E] text-white px-4 py-2 rounded-full font-medium hover:bg-[#16A34A] transition-colors shadow-lg"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer — slides down from header */}
        <div
          className={`md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
        >
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className="py-2.5 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 mt-2 border-t border-border/50 flex gap-2">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-[#22C55E] text-white px-4 py-2.5 rounded-xl font-medium text-sm"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
                <a
                  href={telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-[#0088cc] text-white px-4 py-2.5 rounded-xl font-medium text-sm"
                >
                  <Send className="w-4 h-4" /> Telegram
                </a>
              </div>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-card text-muted-foreground border-t border-border">
        {/* Top gradient line */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="container mx-auto px-4 py-14 text-center">
          {/* Brand */}
          <div className="mb-2">
            <div className="text-2xl font-bold text-foreground tracking-tight gradient-text">
              {settings?.siteName || "BD Digital Services"}
            </div>
          </div>
          <p className="max-w-sm mx-auto mb-8 font-bn text-sm leading-relaxed text-muted-foreground/80">
            {settings?.footerText || "আপনার বিশ্বস্ত ডিজিটাল সার্ভিস পার্টনার।"}
          </p>

          {/* Social links */}
          <div className="flex justify-center gap-3 mb-10">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-muted/40 border border-border/60 rounded-xl hover:bg-[#22C55E]/10 hover:border-[#22C55E]/30 hover:text-[#22C55E] transition-all"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
            <a
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-muted/40 border border-border/60 rounded-xl hover:bg-[#0088cc]/10 hover:border-[#0088cc]/30 hover:text-[#0088cc] transition-all"
              aria-label="Telegram"
            >
              <Send className="w-5 h-5" />
            </a>
            {facebookLink && (
              <a
                href={facebookLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-muted/40 border border-border/60 rounded-xl hover:bg-[#1877F2]/10 hover:border-[#1877F2]/30 hover:text-[#1877F2] transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            )}
          </div>

          {/* Divider */}
          <div className="w-16 h-px bg-border/60 mx-auto mb-6" />

          <p className="text-xs text-muted-foreground/50">
            &copy; {new Date().getFullYear()} {settings?.siteName || "BD Digital Services"}. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <a
          href={telegramLink}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#0088cc] text-white p-3 rounded-full shadow-xl hover:scale-110 transition-transform"
        >
          <Send className="w-6 h-6" />
        </a>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#22C55E] text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform"
        >
          <MessageCircle className="w-7 h-7" />
        </a>
      </div>
    </div>
  );
}
