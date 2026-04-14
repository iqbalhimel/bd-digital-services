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
  Search, Users, Clock, Truck, X
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
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "BD",
      "addressLocality": "Dhaka",
      "addressRegion": "Dhaka Division"
    },
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

  const buildProductSchema = (product: { nameEn: string; descriptionEn?: string | null; priceBdt?: string | number | null; imageUrl?: string | null }) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.nameEn,
    "description": product.descriptionEn || `Buy ${product.nameEn} at the best price in Bangladesh`,
    "url": "https://bddigitalservices.com",
    ...(product.imageUrl ? { "image": product.imageUrl } : {}),
    "brand": {
      "@type": "Brand",
      "name": "BD Digital Services"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "BDT",
      ...(parseFloat(String(product.priceBdt ?? 0)) > 0 ? { "price": String(product.priceBdt) } : {}),
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "BD Digital Services"
      }
    }
  });

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
          "item": buildProductSchema(product)
        }))
      }
    : null;

  const individualProductSchemas = allActiveProducts ?? [];

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
      {individualProductSchemas.map((product) => (
        <Helmet key={product.id}>
          <script type="application/ld+json">{JSON.stringify(buildProductSchema(product))}</script>
        </Helmet>
      ))}
      {/* Notice Banner — always visible */}
      <div className="relative overflow-hidden bg-card border-b border-border py-2">
        <div className="flex whitespace-nowrap animate-marquee">
          {[0, 1].map(i => (
            <div key={i} className="flex items-center gap-10 pr-16 shrink-0">
              <span className="flex items-center gap-2 text-foreground text-xs font-medium">
                <Zap className="w-3 h-3 text-primary flex-shrink-0" /> {noticeText}
              </span>
              <span className="text-border">✦</span>
              <span className="font-bn text-muted-foreground text-xs">{noticeBn}</span>
              <span className="text-border">✦</span>
              <span className="flex items-center gap-2 text-muted-foreground text-xs">
                <Shield className="w-3 h-3 text-primary flex-shrink-0" /> 100% Secure &amp; Trusted
              </span>
              <span className="text-border">✦</span>
              <span className="flex items-center gap-2 text-muted-foreground text-xs">
                <Clock className="w-3 h-3 text-primary flex-shrink-0" /> 5–30 Min Delivery
              </span>
              <span className="text-border">✦</span>
              <span className="flex items-center gap-2 text-muted-foreground text-xs">
                <HeadphonesIcon className="w-3 h-3 text-primary flex-shrink-0" /> 24/7 Support
              </span>
              <span className="text-border">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-background">
        {/* Ambient glow — subtle, no blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-primary/[0.07] blur-[130px]" />
          <div className="absolute bottom-0 right-[-100px] w-[500px] h-[400px] rounded-full bg-primary/[0.05] blur-[100px]" />
        </div>
        {/* Dot grid texture */}
        <div
          className="absolute inset-0 opacity-[0.022] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)", backgroundSize: "36px 36px" }}
        />

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl mx-auto space-y-7">

            {/* Eyebrow badge */}
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse flex-shrink-0" />
              {settings?.heroBadge || "Premium Digital Marketplace"}
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeIn} className="text-5xl md:text-6xl lg:text-[4.25rem] font-bold tracking-tight text-foreground leading-[1.1]">
              {settings?.heroTitle || "Your Trusted Source For"}{" "}
              <span className="gradient-text">{settings?.heroTitleHighlight || "Digital Services"}</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={fadeIn} className="text-lg md:text-xl text-muted-foreground font-bn leading-relaxed max-w-2xl mx-auto">
              {settings?.heroSubtitle || "বাংলাদেশের সবচেয়ে বিশ্বস্ত ডিজিটাল প্রোডাক্ট, একাউন্ট এবং কার্ড এর মার্কেটপ্লেস। দ্রুত ডেলিভারি এবং ২৪/৭ সাপোর্ট।"}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
              <Button
                size="lg"
                className="text-base px-8 py-5 rounded-xl bg-primary hover:bg-[#6D4DF4] text-white shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:-translate-y-0.5 transition-all font-semibold"
                onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> {settings?.heroPrimaryBtn || "Browse Products"}
              </Button>
              <Button
                size="lg"
                className="text-base px-8 py-5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white shadow-lg shadow-green-900/20 hover:-translate-y-0.5 transition-all font-semibold border-0"
                onClick={() => handleWhatsAppOrder()}
              >
                <MessageCircle className="mr-2 h-5 w-5" /> {settings?.heroWhatsappBtn || "Order via WhatsApp"}
              </Button>
            </motion.div>

            {/* Trust stats */}
            <motion.div variants={fadeIn} className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-2">
              {[
                { icon: Users,          value: settings?.heroStat1Value || "1000+",   label: settings?.heroStat1Label || "সন্তুষ্ট গ্রাহক" },
                { icon: Package,        value: settings?.heroStat2Value || "15+",     label: settings?.heroStat2Label || "প্রোডাক্ট" },
                { icon: HeadphonesIcon, value: settings?.heroStat3Value || "24/7",    label: settings?.heroStat3Label || "সাপোর্ট" },
                { icon: Truck,          value: settings?.heroStat4Value || "5-30 Min",label: settings?.heroStat4Label || "ডেলিভারি" },
              ].map(stat => (
                <div key={stat.label} className="flex flex-col items-center gap-1.5 bg-card border border-border rounded-xl p-4 hover:border-primary/25 transition-colors group">
                  <stat.icon className="w-4 h-4 text-primary mb-0.5 group-hover:scale-110 transition-transform" />
                  <div className="text-xl font-bold text-foreground tracking-tight">{stat.value}</div>
                  <div className="text-[11px] text-muted-foreground font-bn leading-snug text-center">{stat.label}</div>
                </div>
              ))}
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-20 bg-muted/20 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 border border-primary/20 uppercase tracking-widest">
                <Star className="w-3 h-3" /> Popular Choices
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-foreground">Best Sellers</h2>
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 border border-primary/20 uppercase tracking-widest">
              <Package className="w-3 h-3" /> Catalog
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-foreground">All Products</h2>
            <p className="text-muted-foreground font-bn max-w-2xl mx-auto">আপনার প্রয়োজনীয় সকল ডিজিটাল সার্ভিস এক জায়গায়</p>
          </div>

          {/* Search Bar */}
          <div className="max-w-lg mx-auto mb-10 relative">
            <div className="relative flex items-center bg-card border border-border/60 rounded-xl transition-all duration-200 focus-within:border-primary/35 focus-within:shadow-[0_0_0_3px_rgba(124,92,255,0.07)]">
              <Search className="absolute left-4 w-4 h-4 text-muted-foreground/50 pointer-events-none shrink-0" />
              <Input
                type="text"
                placeholder="Search products... / পণ্য খুঁজুন..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-11 pr-10 py-3 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground/45 text-foreground"
              />
              {searchQuery && (
                <button
                  className="absolute right-3 p-1 rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted/60 transition-colors"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <Tabs defaultValue="all" value={activeCategory} onValueChange={v => { setActiveCategory(v); setSearchQuery(""); }} className="w-full">
            <div className="flex justify-center mb-10 overflow-x-auto pb-1 scrollbar-hide">
              <TabsList className="h-auto p-1 bg-card border border-border/60 rounded-xl inline-flex gap-0.5 shadow-sm">
                <TabsTrigger
                  value="all"
                  className="rounded-lg px-5 py-2 text-sm font-medium text-muted-foreground transition-all
                    data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/25 data-[state=active]:shadow-none
                    hover:text-foreground hover:bg-muted/50"
                >
                  All
                </TabsTrigger>
                {categories?.filter(c => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder).map(cat => (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.id.toString()}
                    className="rounded-lg px-5 py-2 text-sm font-medium text-muted-foreground transition-all flex items-center gap-1.5
                      data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/25 data-[state=active]:shadow-none
                      hover:text-foreground hover:bg-muted/50"
                  >
                    <span className="text-base leading-none">{cat.icon}</span>
                    <span>{cat.nameEn}</span>
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
                      requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                          document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
                        });
                      });
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
      <section id="how-to-order" className="py-24 bg-muted/20 border-y border-border relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-primary/[0.04] blur-[80px]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 border border-primary/20 uppercase tracking-widest">
              <Zap className="w-3 h-3" /> Simple Steps
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-foreground">How to Order</h2>
            <p className="text-muted-foreground font-bn max-w-2xl mx-auto text-base">খুব সহজেই অর্ডার করুন মাত্র ৩টি ধাপে</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="glass-card p-8 rounded-2xl text-center hover:-translate-y-1 transition-transform duration-300 relative group overflow-hidden">
              <div className="absolute top-2 right-3 text-7xl font-black text-foreground/[0.03] select-none group-hover:text-primary/[0.06] transition-colors leading-none">1</div>
              <div className="w-14 h-14 bg-primary/15 text-primary rounded-xl flex items-center justify-center mx-auto mb-6 rotate-2 group-hover:rotate-4 transition-transform">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Choose Product</h3>
              <p className="text-muted-foreground font-bn text-sm leading-relaxed">পছন্দের সার্ভিসটি সিলেক্ট করুন এবং প্রাইস চেক করুন।</p>
            </div>

            <div className="glass-card p-8 rounded-2xl text-center hover:-translate-y-1 transition-transform duration-300 relative group overflow-hidden">
              <div className="absolute top-2 right-3 text-7xl font-black text-foreground/[0.03] select-none group-hover:text-primary/[0.06] transition-colors leading-none">2</div>
              <div className="w-14 h-14 bg-primary/15 text-primary rounded-xl flex items-center justify-center mx-auto mb-6 -rotate-2 group-hover:-rotate-4 transition-transform">
                <CreditCard className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Send Payment</h3>
              <p className="text-muted-foreground font-bn text-sm leading-relaxed">বিকাশ, নগদ বা রকেটে পেমেন্ট করে নিচের ফর্মটি ফিলাপ করুন।</p>
            </div>

            <div className="glass-card p-8 rounded-2xl text-center hover:-translate-y-1 transition-transform duration-300 relative group overflow-hidden">
              <div className="absolute top-2 right-3 text-7xl font-black text-foreground/[0.03] select-none group-hover:text-primary/[0.06] transition-colors leading-none">3</div>
              <div className="w-14 h-14 bg-[#22C55E]/15 text-[#22C55E] rounded-xl flex items-center justify-center mx-auto mb-6 rotate-2 group-hover:rotate-4 transition-transform">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Receive Account</h3>
              <p className="text-muted-foreground font-bn text-sm leading-relaxed">৫-৩০ মিনিটের মধ্যে হোয়াটসঅ্যাপে একাউন্ট বুঝে নিন।</p>
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
                <Button className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white" onClick={() => handleWhatsAppOrder()}>
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
      <section id="faq" className="py-24 bg-muted/20 border-t border-border">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 border border-primary/20 uppercase tracking-widest">
              <CheckCircle2 className="w-3 h-3" /> FAQ
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-foreground">Frequently Asked Questions</h2>
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
  const priceNum = parseFloat(product.priceBdt);
  const priceDisplay = priceNum === 0 ? "Contact for Price" : `৳${product.priceBdt}`;
  const priceIsFree = priceNum === 0;

  return (
    <div className="group relative flex flex-col h-full bg-card border border-border/70 rounded-xl overflow-hidden hover:border-primary/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/[0.09] transition-all duration-300">

      {/* Top accent line — appears on hover */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Card Header */}
      <div className="p-5 pb-4 relative">
        {product.badge && (
          <span className="absolute top-4 right-4 inline-flex items-center px-2 py-0.5 rounded-md bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
            {product.badge}
          </span>
        )}

        {product.categoryNameEn && (
          <p className="text-[10px] font-semibold text-primary/60 uppercase tracking-widest mb-2.5">
            {product.categoryNameEn}
          </p>
        )}

        <h3 className={`text-sm font-bold text-foreground leading-snug ${product.badge ? "pr-16" : ""}`}>
          {product.nameEn}
        </h3>
        {product.nameBn && (
          <p className="text-xs text-muted-foreground font-bn mt-0.5">{product.nameBn}</p>
        )}

        <div className="mt-4 flex items-baseline gap-2">
          <span className={`font-bold tracking-tight ${priceIsFree ? "text-sm text-muted-foreground" : "text-2xl text-foreground"}`}>
            {priceDisplay}
          </span>
          {!priceIsFree && parseFloat(product.priceUsd) > 0 && (
            <span className="text-xs text-muted-foreground/60 line-through">${product.priceUsd}</span>
          )}
        </div>
      </div>

      <div className="mx-5 h-px bg-border/50" />

      {/* Description */}
      <div className="flex-1 px-5 py-4">
        <div className="space-y-1.5">
          {product.descriptionEn && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{product.descriptionEn}</p>
          )}
          {product.descriptionBn && (
            <p className="text-xs text-muted-foreground font-bn leading-relaxed">{product.descriptionBn}</p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-5 pb-5 pt-1 flex flex-col gap-2">
        <Button
          className="w-full bg-primary hover:bg-[#6D4DF4] text-white text-sm font-semibold shadow-sm shadow-primary/15 hover:shadow-primary/25 transition-all"
          onClick={() => onFormOrder(product.id)}
        >
          Place Order
        </Button>
        <Button
          variant="ghost"
          className="w-full text-sm font-medium text-[#22C55E] hover:text-[#22C55E] hover:bg-[#22C55E]/8 border border-[#22C55E]/20 hover:border-[#22C55E]/35 transition-all"
          onClick={onOrder}
        >
          <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> WhatsApp
        </Button>
      </div>
    </div>
  );
}
