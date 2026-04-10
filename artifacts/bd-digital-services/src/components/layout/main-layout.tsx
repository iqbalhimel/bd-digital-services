import { Link } from "wouter";
import { useGetSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { MessageCircle, Send } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { data: settings } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });

  const whatsappLink = settings?.whatsapp || "https://wa.me/8801572792499";
  const telegramLink = settings?.telegram || "https://t.me/+8801572792499";

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full glass-card border-b-0">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="text-xl md:text-2xl font-bold cursor-pointer gradient-text tracking-tight">
              {settings?.siteName || "BD Digital Services"}
            </div>
          </Link>
          <nav className="hidden md:flex gap-6">
            <a href="#products" className="text-sm font-medium hover:text-primary transition-colors">Products</a>
            <a href="#how-to-order" className="text-sm font-medium hover:text-primary transition-colors">How to Order</a>
            <a href="#faq" className="text-sm font-medium hover:text-primary transition-colors">FAQ</a>
          </nav>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-full font-medium hover:bg-[#128C7E] transition-colors shadow-lg">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 text-zinc-400 py-12 border-t border-white/10 mt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="text-2xl font-bold text-white mb-4">
            {settings?.siteName || "BD Digital Services"}
          </div>
          <p className="max-w-md mx-auto mb-8 font-bn">
            {settings?.footerText || "আপনার বিশ্বস্ত ডিজিটাল সার্ভিস পার্টনার।"}
          </p>
          <div className="flex justify-center gap-4 mb-8">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
              <MessageCircle className="w-5 h-5 text-white" />
            </a>
            <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
              <Send className="w-5 h-5 text-white" />
            </a>
          </div>
          <p className="text-sm">
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
          className="bg-[#25D366] text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform"
        >
          <MessageCircle className="w-7 h-7" />
        </a>
      </div>
    </div>
  );
}
