import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { SeoHead } from "@/components/seo-head";
import { MainLayout } from "@/components/layout/main-layout";
import {
  useGetActiveNotice,
  getGetActiveNoticeQueryKey,
  useListFeaturedProducts,
  getListFeaturedProductsQueryKey,
  useListCategories,
  getListCategoriesQueryKey,
  useListProducts,
  getListProductsQueryKey,
  useGetSettings,
  getGetSettingsQueryKey,
  useCreateOrder
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  CheckCircle2, ShoppingCart, Zap, Shield, HeadphonesIcon,
  CreditCard, MessageCircle, Package, Send, Star, Copy, Check,
  Search, Users, Clock, Truck
} from "lucide-react";
import type { Product } from "@workspace/api-client-react";

const FAQS = [
  {
    question: "How long does it take to receive my account/card?",
    questionBn: "আমার একাউন্ট/কার্ড পেতে কতক্ষণ সময় লাগবে?",
    answer: "Most digital products, accounts, and cards are delivered within 5-30 minutes after payment verification during business hours.",
    answerBn: "অধিকাংশ ডিজিটাল প্রোডাক্ট, একাউন্ট এবং কার্ড পেমেন্ট যাচাইয়ের পর ব্যবসায়িক সময়ে ৫-৩০ মিনিটের মধ্যে সরবরাহ করা হয়।"
  },
  {
    question: "What payment methods do you accept?",
    questionBn: "আপনারা কোন পেমেন্ট পদ্ধতি গ্রহণ করেন?",
    answer: "We accept bKash, Nagad, and Rocket. Please send the exact amount to the numbers provided and fill in the order form.",
    answerBn: "আমরা বিকাশ, নগদ এবং রকেট গ্রহণ করি। প্রদত্ত নম্বরে সঠিক পরিমাণ পাঠিয়ে অর্ডার ফর্ম পূরণ করুন।"
  },
  {
    question: "Is this safe and trustworthy?",
    questionBn: "এটি কি নিরাপদ এবং বিশ্বস্ত?",
    answer: "Yes! We are a verified digital marketplace in Bangladesh serving hundreds of satisfied customers. Check our WhatsApp for customer reviews.",
    answerBn: "হ্যাঁ! আমরা বাংলাদেশের একটি যাচাইকৃত ডিজিটাল মার্কেটপ্লেস। শত শত সন্তুষ্ট গ্রাহকদের রিভিউ দেখতে হোয়াটসঅ্যাপে যোগাযোগ করুন।"
  },
  {
    question: "Do you provide after-sales support?",
    questionBn: "বিক্রয়োত্তর সাপোর্ট কি পাওয়া যায়?",
    answer: "Absolutely. If you face any issues with your purchased account or card, contact us via WhatsApp for quick resolution.",
    answerBn: "অবশ্যই। কেনা একাউন্ট বা কার্ডে কোনো সমস্যা হলে দ্রুত সমাধানের জন্য হোয়াটসঅ্যাপে যোগাযোগ করুন।"
  },
  {
    question: "Can I get a refund if the account doesn't work?",
    questionBn: "একাউন্ট কাজ না করলে কি রিফান্ড পাব?",
    answer: "Yes, if the provided account is non-functional at the time of delivery and we cannot replace it, we will issue a full refund.",
    answerBn: "হ্যাঁ, ডেলিভারির সময় একাউন্টটি অকার্যকর থাকলে এবং প্রতিস্থাপন করতে না পারলে সম্পূর্ণ রিফান্ড দেওয়া হবে।"
  },
  {
    question: "Do you deliver to all of Bangladesh?",
    questionBn: "সারা বাংলাদেশে কি ডেলিভারি দেওয়া হয়?",
    answer: "Yes! Since we deliver digital products via WhatsApp and email, we serve customers across all of Bangladesh.",
    answerBn: "হ্যাঁ! আমরা হোয়াটসঅ্যাপ ও ইমেইলে ডিজিটালভাবে পণ্য সরবরাহ করি বলে সারা বাংলাদেশের গ্রাহকদের সেবা দিতে পারি।"
  },
  {
    question: "How do I contact customer support?",
    questionBn: "কাস্টমার সাপোর্টের সাথে কীভাবে যোগাযোগ করব?",
    answer: "You can reach us via WhatsApp or Telegram 24/7. Links are at the top and bottom of this page, and on the floating buttons.",
    answerBn: "পেজের উপরে-নিচে ও ফ্লোটিং বাটনে হোয়াটসঅ্যাপ ও টেলিগ্রাম লিংক আছে। যেকোনো সময় ২৪/৭ যোগাযোগ করতে পারবেন।"
  }
];

const CARD_GRADIENTS = [
  "from-violet-500 to-purple-700",
  "from-blue-500 to-cyan-600",
  "from-cyan-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-pink-500 to-rose-600",
  "from-green-500 to-emerald-600",
  "from-indigo-500 to-violet-600",
  "from-rose-500 to-pink-600",
];

function getCategoryGradient(
  categoryNameEn: string | null | undefined,
  categoryId: number | null | undefined,
  productId: number
): string {
  const name = (categoryNameEn || "").toLowerCase();
  if (name.includes("ai") || name.includes("artificial")) return "from-violet-500 to-purple-700";
  if (name.includes("developer") || name.includes("dev")) return "from-blue-500 to-cyan-600";
  if (name.includes("cloud") || name.includes("hosting")) return "from-cyan-500 to-teal-600";
  if (name.includes("finance") || name.includes("card") || name.includes("bank")) return "from-amber-500 to-orange-600";
  if (name.includes("entertainment") || name.includes("streaming") || name.includes("video")) return "from-pink-500 to-rose-600";
  if (name.includes("social") || name.includes("media")) return "from-indigo-500 to-violet-600";
  if (name.includes("gaming") || name.includes("game")) return "from-rose-500 to-pink-600";
  if (name.includes("tool") || name.includes("software")) return "from-green-500 to-emerald-600";
  const idx = (categoryId != null ? categoryId : productId) % CARD_GRADIENTS.length;
  return CARD_GRADIENTS[idx];
}

export default function Home() {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [message, setMessage] = useState("");

  const { data: notice } = useGetActiveNotice({ query: { queryKey: getGetActiveNoticeQueryKey() } });
  const { data: settings } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });
  const { data: featuredProducts } = useListFeaturedProducts({ query: { queryKey: getListFeaturedProductsQueryKey() } });
  const { data: categories } = useListCategories({ query: { queryKey: getListCategoriesQueryKey() } });

  const { data: products } = useListProducts(
    { activeOnly: true, categoryId: activeCategory !== "all" ? parseInt(activeCategory) : undefined },
    { query: { queryKey: getListProductsQueryKey({ activeOnly: true, categoryId: activeCategory !== "all" ? parseInt(activeCategory) : undefined }) } }
  );

  const { data: allActiveProducts } = useListProducts(
    { activeOnly: true },
    { query: { queryKey: getListProductsQueryKey({ activeOnly: true }) } }
  );

  const displayedProducts = useMemo(() => {
    const base = products ?? [];
    if (!searchQuery.trim()) return base;
    const q = searchQuery.toLowerCase().trim();
    return base.filter(p =>
      p.nameEn.toLowerCase().includes(q) ||
      (p.nameBn && p.nameBn.includes(q)) ||
      (p.descriptionEn && p.descriptionEn.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  const createOrderMutation = useCreateOrder();

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({ title: "Copied!", description: `${text} copied to clipboard.` });
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !paymentMethod) {
      toast({ title: "Please select a product and payment method", variant: "destructive" });
      return;
    }
    createOrderMutation.mutate(
      {
        data: {
          customerName,
          phone,
          email: email || undefined,
          productId: parseInt(selectedProductId),
          paymentMethod,
          message: message || undefined,
        }
      },
      {
        onSuccess: () => {
          toast({
            title: "Order placed successfully!",
            description: "We will contact you shortly with your digital product."
          });
          setCustomerName("");
          setPhone("");
          setEmail("");
          setSelectedProductId("");
          setPaymentMethod("");
          setMessage("");
        },
        onError: () => {
          toast({ title: "Failed to place order", variant: "destructive" });
        }
      }
    );
  };

  const handleWhatsAppOrder = (product?: Product) => {
    let msg = "Hello BD Digital Services, I want to order.";
    if (product) {
      msg = `Hello BD Digital Services, I want to order: ${product.nameEn} (Price: ৳${product.priceBdt}). Please guide me.`;
    }
    const url = `${settings?.whatsapp || "https://wa.me/8801572792499"}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } }
  };

  const noticeText = notice?.isActive
    ? notice.messageEn
    : "Welcome to BD Digital Services — Bangladesh's #1 Trusted Digital Marketplace!";
  const noticeBn = notice?.isActive && notice.messageBn ? notice.messageBn : "বাংলাদেশের সেরা ডিজিটাল মার্কেটপ্লেসে স্বাগতম!";

  const bkashNumber = settings?.bkashNumber || "01687476714";
  const nagadNumber = settings?.nagadNumber || "01687476714";
  const rocketNumber = settings?.rocketNumber || "01687476714";

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "BD Digital Services",
    "url": "https://bddigitalservices.com",
    "description": "বাংলাদেশের বিশ্বস্ত ডিজিটাল পণ্য মার্কেটপ্লেস — Netflix, Spotify, ChatGPT, ভার্চুয়াল কার্ড সহ সব ধরনের ডিজিটাল সেবা সর্বনিম্ন মূল্যে।",
    "inLanguage": ["bn", "en"],
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://bddigitalservices.com/?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "BD Digital Services",
    "url": "https://bddigitalservices.com",
    "logo": "https://bddigitalservices.com/favicon.svg",
    "image": "https://bddigitalservices.com/opengraph.jpg",
    "description": "বাংলাদেশের বিশ্বস্ত ডিজিটাল পণ্য মার্কেটপ্লেস — Netflix, Spotify, ChatGPT, ভার্চুয়াল কার্ড সহ সব ধরনের ডিজিটাল পণ্য সর্বনিম্ন মূল্যে।",
    "foundingLocation": {
      "@type": "Place",
      "name": "Bangladesh"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Bangladesh"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "url": settings?.whatsapp || "https://wa.me/8801572792499",
        "availableLanguage": ["Bengali", "English"]
      },
      {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "url": settings?.telegram || "https://t.me/bddigitalservices",
        "availableLanguage": ["Bengali", "English"]
      }
    ],
    "sameAs": [
      settings?.whatsapp || "https://wa.me/8801572792499",
      settings?.telegram || "https://t.me/bddigitalservices"
    ]
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  const productListJsonLd = allActiveProducts && allActiveProducts.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "BD Digital Services Products",
        "url": "https://bddigitalservices.com",
        "numberOfItems": allActiveProducts.length,
        "itemListElement": allActiveProducts.map((product, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Product",
            "name": product.nameEn,
            "description": product.descriptionEn || `Buy ${product.nameEn} at the best price in Bangladesh`,
            "url": "https://bddigitalservices.com",
            "offers": {
              "@type": "Offer",
              "priceCurrency": "BDT",
              "price": parseFloat(String(product.priceBdt)) > 0 ? String(product.priceBdt) : undefined,
              "availability": "https://schema.org/InStock",
              "seller": {
                "@type": "Organization",
                "name": "BD Digital Services"
              }
            }
          }
        }))
      }
    : null;

  return (
    <MainLayout>
      <SeoHead
        title="BD Digital Services | বাংলাদেশের সেরা ডিজিটাল পণ্য মার্কেটপ্লেস"
        description="BD Digital Services — বাংলাদেশের বিশ্বস্ত ডিজিটাল পণ্য মার্কেটপ্লেস। Netflix, Spotify, ChatGPT, ক্রেডিট কার্ড, ভার্চুয়াল কার্ড সহ সব ধরনের ডিজিটাল সেবা সর্বনিম্ন মূল্যে। বিকাশ, নগদ ও রকেটে পেমেন্ট সুবিধা।"
        canonicalUrl="https://bddigitalservices.com/"
        ogImage="https://bddigitalservices.com/opengraph.jpg"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(websiteJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(organizationJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        {productListJsonLd && (
          <script type="application/ld+json">{JSON.stringify(productListJsonLd)}</script>
        )}
      </Helmet>
      {/* Notice Banner — always visible */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 py-2.5">
        <div className="flex whitespace-nowrap animate-marquee">
          {[0, 1].map(i => (
            <div key={i} className="flex items-center gap-8 pr-16 shrink-0">
              <span className="flex items-center gap-2 text-white text-sm font-semibold">
                <Zap className="w-3.5 h-3.5 flex-shrink-0" /> {noticeText}
              </span>
              <span className="text-white/50">✦</span>
              <span className="font-bn text-white text-sm">{noticeBn}</span>
              <span className="text-white/50">✦</span>
              <span className="flex items-center gap-2 text-white text-sm font-semibold">
                <Shield className="w-3.5 h-3.5 flex-shrink-0" /> 100% Secure & Trusted
              </span>
              <span className="text-white/50">✦</span>
              <span className="flex items-center gap-2 text-white text-sm font-semibold">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" /> 5–30 Min Delivery
              </span>
              <span className="text-white/50">✦</span>
              <span className="flex items-center gap-2 text-white text-sm font-semibold">
                <HeadphonesIcon className="w-3.5 h-3.5 flex-shrink-0" /> 24/7 Support
              </span>
              <span className="text-white/50">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-gradient-to-br from-violet-950 via-purple-900 to-cyan-950">
        {/* Animated blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="animate-blob absolute top-[-15%] right-[-10%] w-[550px] h-[550px] rounded-full bg-violet-500/30 blur-3xl" />
          <div className="animate-blob animation-delay-2000 absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/25 blur-3xl" />
          <div className="animate-blob animation-delay-4000 absolute top-[35%] left-[25%] w-[400px] h-[400px] rounded-full bg-fuchsia-500/20 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 text-center text-white relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl mx-auto space-y-8">
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-semibold mb-4 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Premium Digital Products Marketplace
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-2xl">
              Your Trusted Source For <br />
              <span className="gradient-text">Digital Services</span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-xl md:text-2xl text-white/80 font-bn leading-relaxed max-w-2xl mx-auto">
              বাংলাদেশের সবচেয়ে বিশ্বস্ত ডিজিটাল প্রোডাক্ট, একাউন্ট এবং কার্ড এর মার্কেটপ্লেস। দ্রুত ডেলিভারি এবং ২৪/৭ সাপোর্ট।
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="text-lg px-8 py-6 rounded-full bg-white text-violet-900 hover:bg-white/90 shadow-2xl hover:scale-105 transition-transform font-bold"
                onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> Browse Products
              </Button>
              <Button
                size="lg"
                className="text-lg px-8 py-6 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white shadow-2xl hover:scale-105 transition-transform font-bold border-0"
                onClick={() => handleWhatsAppOrder()}
              >
                <MessageCircle className="mr-2 h-5 w-5" /> Order via WhatsApp
              </Button>
            </motion.div>

            {/* Stats Strip */}
            <motion.div
              variants={fadeIn}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-white/15 mt-4"
            >
              {[
                { icon: Users, value: "1000+", labelEn: "Happy Customers", labelBn: "সন্তুষ্ট গ্রাহক" },
                { icon: Package, value: "15+", labelEn: "Products", labelBn: "প্রোডাক্ট" },
                { icon: HeadphonesIcon, value: "24/7", labelEn: "Support", labelBn: "সাপোর্ট" },
                { icon: Truck, value: "5-30 Min", labelEn: "Delivery", labelBn: "ডেলিভারি" },
              ].map(stat => (
                <div key={stat.labelEn} className="flex flex-col items-center gap-1 bg-white/8 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <stat.icon className="w-5 h-5 text-cyan-300 mb-1" />
                  <div className="text-2xl font-extrabold text-white">{stat.value}</div>
                  <div className="text-xs text-white/60 font-bn">{stat.labelBn}</div>
                  <div className="text-xs text-white/40">{stat.labelEn}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold mb-3 uppercase tracking-widest border border-amber-200">
                <Star className="w-3.5 h-3.5" /> Popular Choices
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Best Sellers</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto font-bn">আমাদের সর্বাধিক বিক্রিত ডিজিটাল সার্ভিস ও একাউন্ট</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOrder={() => handleWhatsAppOrder(product)}
                  onFormOrder={id => {
                    setSelectedProductId(id.toString());
                    document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth" });
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product Catalog */}
      <section id="products" className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">All Products</h2>
            <p className="text-muted-foreground font-bn max-w-2xl mx-auto">আপনার প্রয়োজনীয় সকল ডিজিটাল সার্ভিস এক জায়গায়</p>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products... / পণ্য খুঁজুন..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-full border-border/60 bg-card shadow-sm focus:shadow-primary/10 transition-shadow"
            />
            {searchQuery && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchQuery("")}
              >
                ×
              </button>
            )}
          </div>

          <Tabs defaultValue="all" value={activeCategory} onValueChange={v => { setActiveCategory(v); setSearchQuery(""); }} className="w-full">
            <div className="flex justify-center mb-8 overflow-x-auto pb-4 scrollbar-hide">
              <TabsList className="h-auto p-1 bg-muted/50 rounded-full inline-flex">
                <TabsTrigger value="all" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  All
                </TabsTrigger>
                {categories?.filter(c => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder).map(cat => (
                  <TabsTrigger key={cat.id} value={cat.id.toString()} className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2">
                    <span>{cat.icon}</span> {cat.nameEn}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="min-h-[400px]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOrder={() => handleWhatsAppOrder(product)}
                    onFormOrder={id => {
                      setSelectedProductId(id.toString());
                      document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  />
                ))}
                {displayedProducts.length === 0 && (
                  <div className="col-span-full py-20 text-center text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    {searchQuery
                      ? <p>No products match "<strong>{searchQuery}</strong>". Try a different keyword.</p>
                      : <p>No products found in this category.</p>
                    }
                  </div>
                )}
              </div>
            </div>
          </Tabs>
        </div>
      </section>

      {/* How to Order */}
      <section id="how-to-order" className="py-24 bg-zinc-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070')] opacity-5 bg-cover bg-center mix-blend-luminosity" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">How to Order</h2>
            <p className="text-zinc-400 font-bn max-w-2xl mx-auto text-lg">খুব সহজেই অর্ডার করুন মাত্র ৩টি ধাপে</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="glass-card bg-white/5 border-white/10 p-8 rounded-2xl text-center hover:-translate-y-2 transition-transform duration-300 relative group">
              <div className="absolute top-0 right-0 p-4 text-6xl font-bold text-white/5 -z-10 group-hover:text-violet-400/10 transition-colors">1</div>
              <div className="w-16 h-16 bg-violet-500/20 text-violet-400 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 group-hover:rotate-6 transition-transform">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Choose Product</h3>
              <p className="text-zinc-400 font-bn">পছন্দের সার্ভিসটি সিলেক্ট করুন এবং প্রাইস চেক করুন।</p>
            </div>

            <div className="glass-card bg-white/5 border-white/10 p-8 rounded-2xl text-center hover:-translate-y-2 transition-transform duration-300 relative group">
              <div className="absolute top-0 right-0 p-4 text-6xl font-bold text-white/5 -z-10 group-hover:text-cyan-400/10 transition-colors">2</div>
              <div className="w-16 h-16 bg-cyan-500/20 text-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-6 -rotate-3 group-hover:-rotate-6 transition-transform">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Send Payment</h3>
              <p className="text-zinc-400 font-bn">বিকাশ, নগদ বা রকেটে পেমেন্ট করে নিচের ফর্মটি ফিলাপ করুন।</p>
            </div>

            <div className="glass-card bg-white/5 border-white/10 p-8 rounded-2xl text-center hover:-translate-y-2 transition-transform duration-300 relative group">
              <div className="absolute top-0 right-0 p-4 text-6xl font-bold text-white/5 -z-10 group-hover:text-amber-400/10 transition-colors">3</div>
              <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 group-hover:rotate-6 transition-transform">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Receive Account</h3>
              <p className="text-zinc-400 font-bn">৫-৩০ মিনিটের মধ্যে হোয়াটসঅ্যাপে একাউন্ট বুঝে নিন।</p>
            </div>
          </div>
        </div>
      </section>

      {/* Order Form & Payment Section */}
      <section id="order-form" className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-12 max-w-6xl mx-auto">

            {/* Payment Info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-4">Payment Info</h2>
                <p className="text-muted-foreground font-bn">নিচের নাম্বারগুলোতে পেমেন্ট করে ফর্মটি ফিলাপ করুন অথবা সরাসরি হোয়াটসঅ্যাপে মেসেজ দিন।</p>
              </div>

              <div className="space-y-4">
                {/* bKash */}
                <Card className="border-l-4 border-l-[#E2136E] shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-xl text-white bg-[#E2136E] flex-shrink-0">b</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">bKash (Personal)</p>
                      <p className="text-xl font-bold font-mono">{bkashNumber}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 flex-shrink-0 text-muted-foreground hover:text-[#E2136E]"
                      onClick={() => handleCopy(bkashNumber, "bkash")}
                      title="Copy number"
                    >
                      {copiedField === "bkash" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </CardContent>
                </Card>

                {/* Nagad */}
                <Card className="border-l-4 border-l-[#F7941D] shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-xl text-white bg-[#F7941D] flex-shrink-0">N</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Nagad (Personal)</p>
                      <p className="text-xl font-bold font-mono">{nagadNumber}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 flex-shrink-0 text-muted-foreground hover:text-[#F7941D]"
                      onClick={() => handleCopy(nagadNumber, "nagad")}
                      title="Copy number"
                    >
                      {copiedField === "nagad" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </CardContent>
                </Card>

                {/* Rocket */}
                <Card className="border-l-4 border-l-[#8C3494] shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-xl text-white bg-[#8C3494] flex-shrink-0">R</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Rocket (Personal)</p>
                      <p className="text-xl font-bold font-mono">{rocketNumber}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 flex-shrink-0 text-muted-foreground hover:text-[#8C3494]"
                      onClick={() => handleCopy(rocketNumber, "rocket")}
                      title="Copy number"
                    >
                      {copiedField === "rocket" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                <h4 className="font-bold text-primary flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5" /> Quick Order?
                </h4>
                <p className="text-sm text-muted-foreground font-bn mb-4">ফর্ম ফিলাপ করতে না চাইলে সরাসরি হোয়াটসঅ্যাপে মেসেজ দিয়ে অর্ডার করতে পারেন।</p>
                <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white" onClick={() => handleWhatsAppOrder()}>
                  <MessageCircle className="mr-2 w-5 h-5" /> Direct WhatsApp Order
                </Button>
              </div>
            </div>

            {/* Order Form */}
            <div className="lg:col-span-3">
              <Card className="shadow-2xl border-t-4 border-t-primary">
                <CardHeader>
                  <CardTitle className="text-2xl">Place Order Form</CardTitle>
                  <CardDescription>Fill out this form after sending the payment.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleOrderSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="customerName">Full Name *</Label>
                        <Input id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} required placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone / WhatsApp Number *</Label>
                        <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="01XXX-XXXXXX" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address (Optional)</Label>
                      <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="product">Select Product *</Label>
                        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a product" />
                          </SelectTrigger>
                          <SelectContent>
                            {allActiveProducts?.map(p => (
                              <SelectItem key={p.id} value={p.id.toString()}>
                                {p.nameEn} — ৳{parseFloat(p.priceBdt) === 0 ? "Contact" : p.priceBdt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Payment Sent Via *</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bkash">bKash</SelectItem>
                            <SelectItem value="nagad">Nagad</SelectItem>
                            <SelectItem value="rocket">Rocket</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Payment TrxID & Extra Message</Label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Transaction ID: XXXXXXXX. Any other details..."
                        rows={3}
                      />
                    </div>

                    <Button type="submit" className="w-full text-lg py-6 rounded-xl shadow-lg shadow-primary/20" disabled={createOrderMutation.isPending}>
                      {createOrderMutation.isPending ? "Submitting Order..." : "Submit Order"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground font-bn">আপনার মনে যত প্রশ্ন — সব উত্তর এখানেই</p>
          </div>

          <Accordion type="single" collapsible className="w-full bg-card rounded-2xl border shadow-sm p-2">
            {FAQS.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="px-4">
                <AccordionTrigger className="text-left font-semibold text-base hover:text-primary transition-colors py-4">
                  <div>
                    <div>{faq.question}</div>
                    <div className="font-bn text-muted-foreground text-sm font-normal mt-0.5">{faq.questionBn}</div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <div className="space-y-2">
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    <p className="text-muted-foreground font-bn leading-relaxed text-sm">{faq.answerBn}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </MainLayout>
  );
}

function ProductCard({ product, onOrder, onFormOrder }: {
  product: Product;
  onOrder: () => void;
  onFormOrder: (id: number) => void;
}) {
  const gradient = getCategoryGradient(product.categoryNameEn, product.categoryId, product.id);
  const priceNum = parseFloat(product.priceBdt);
  const priceDisplay = priceNum === 0 ? "Contact for Price" : `৳${product.priceBdt}`;
  const priceIsFree = priceNum === 0;

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 border-border/50 group bg-card">
      {/* Colorful gradient header */}
      <div className={`bg-gradient-to-br ${gradient} p-5 relative`}>
        {product.badge && (
          <Badge className="absolute top-3 right-3 z-10 bg-white/20 text-white border-white/30 font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 backdrop-blur-sm shadow-sm">
            {product.badge}
          </Badge>
        )}
        <div className="text-white">
          <CardTitle className="text-lg font-bold leading-tight text-white group-hover:text-white/90 transition-colors">
            {product.nameEn}
          </CardTitle>
          <p className="text-sm font-bn text-white/75 mt-1">{product.nameBn}</p>
        </div>
        {/* Price on gradient */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className={`text-2xl font-extrabold text-white ${priceIsFree ? "text-lg" : ""}`}>
            {priceDisplay}
          </span>
          {!priceIsFree && parseFloat(product.priceUsd) > 0 && (
            <span className="text-sm text-white/60 line-through">${product.priceUsd}</span>
          )}
        </div>
      </div>

      <CardContent className="flex-1 pt-5">
        <div className="space-y-2">
          {product.descriptionEn && (
            <p className="text-sm text-muted-foreground leading-relaxed">{product.descriptionEn}</p>
          )}
          {product.descriptionBn && (
            <p className="text-sm text-muted-foreground font-bn leading-relaxed">{product.descriptionBn}</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex flex-col gap-2 p-5 bg-card border-t border-border/50">
        <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white shadow-sm" onClick={onOrder}>
          <MessageCircle className="w-4 h-4 mr-2" /> Order via WhatsApp
        </Button>
        <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/5 hover:text-primary" onClick={() => onFormOrder(product.id)}>
          Order via Form
        </Button>
      </CardFooter>
    </Card>
  );
}
