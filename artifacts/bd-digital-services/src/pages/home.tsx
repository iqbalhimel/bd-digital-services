import { useState } from "react";
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
import { CheckCircle2, ChevronRight, ShoppingCart, Zap, Shield, HeadphonesIcon, Globe, CreditCard, MessageCircle, Package, Send, Star } from "lucide-react";
import type { Product } from "@workspace/api-client-react";

// FAQ Data
const FAQS = [
  {
    question: "How long does it take to receive my account/card?",
    answer: "Most digital products, accounts, and cards are delivered within 5-30 minutes after payment verification during business hours."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept bKash, Nagad, and Rocket. Please send the exact amount to the numbers provided on the checkout page."
  },
  {
    question: "Is this safe and trustworthy?",
    answer: "Yes! We are a verified digital marketplace in Bangladesh serving hundreds of satisfied customers. Check our WhatsApp for customer reviews."
  },
  {
    question: "Do you provide after-sales support?",
    answer: "Absolutely. If you face any issues with your purchased account or card, contact us via WhatsApp for quick resolution."
  },
  {
    question: "Can I get a refund if the account doesn't work?",
    answer: "Yes, if the provided account is non-functional at the time of delivery and we cannot replace it, we will issue a full refund."
  }
];

export default function Home() {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  // Form state
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [message, setMessage] = useState("");

  // Queries
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

  const createOrderMutation = useCreateOrder();

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

  return (
    <MainLayout>
      {/* Notice Banner */}
      {notice?.isActive && (
        <div className="bg-primary text-primary-foreground py-2 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient opacity-50 mix-blend-overlay"></div>
          <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite] flex gap-8 items-center text-sm md:text-base font-medium relative z-10">
            <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> {notice.messageEn}</span>
            <span className="font-bn text-white/90">।</span>
            <span className="font-bn">{notice.messageBn}</span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-background">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-full bg-secondary/5 blur-3xl rounded-full -translate-x-1/3 translate-y-1/4"></div>
        </div>

        <div className="container mx-auto px-4 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Premium Digital Products Marketplace
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
              Your Trusted Source For <br />
              <span className="gradient-text">Digital Services</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground font-bn leading-relaxed max-w-2xl mx-auto">
              বাংলাদেশের সবচেয়ে বিশ্বস্ত ডিজিটাল প্রোডাক্ট, একাউন্ট এবং কার্ড এর মার্কেটপ্লেস। দ্রুত ডেলিভারি এবং ২৪/৭ সাপোর্ট।
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button size="lg" className="text-lg px-8 py-6 rounded-full shadow-xl shadow-primary/20 hover:scale-105 transition-transform" onClick={() => {
                document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                <ShoppingCart className="mr-2 h-5 w-5" /> Browse Products
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-full hover:scale-105 transition-transform" onClick={() => handleWhatsAppOrder()}>
                <MessageCircle className="mr-2 h-5 w-5" /> Order via WhatsApp
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-8 pt-12 text-muted-foreground font-medium">
              <div className="flex items-center gap-2"><CheckCircle2 className="text-primary w-5 h-5" /> Instant Delivery</div>
              <div className="flex items-center gap-2"><Shield className="text-primary w-5 h-5" /> 100% Secure</div>
              <div className="flex items-center gap-2"><HeadphonesIcon className="text-primary w-5 h-5" /> 24/7 Support</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Popular Choices</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Our most purchased digital services and accounts</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onOrder={() => handleWhatsAppOrder(product)} onFormOrder={(id) => {
                  setSelectedProductId(id.toString());
                  document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });
                }} />
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
            <p className="text-muted-foreground font-bn max-w-2xl mx-auto">আপনার প্রয়োজনীয় সকল ডিজিটাল সার্ভিস এক জায়গায়</p>
          </div>

          <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <div className="flex justify-center mb-8 overflow-x-auto pb-4 scrollbar-hide">
              <TabsList className="h-auto p-1 bg-muted/50 rounded-full inline-flex">
                <TabsTrigger value="all" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All</TabsTrigger>
                {categories?.filter(c => c.isActive).sort((a,b) => a.sortOrder - b.sortOrder).map(cat => (
                  <TabsTrigger key={cat.id} value={cat.id.toString()} className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2">
                    <span>{cat.icon}</span> {cat.nameEn}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="min-h-[400px]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products?.map((product) => (
                  <ProductCard key={product.id} product={product} onOrder={() => handleWhatsAppOrder(product)} onFormOrder={(id) => {
                    setSelectedProductId(id.toString());
                    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });
                  }} />
                ))}
                {products?.length === 0 && (
                  <div className="col-span-full py-20 text-center text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No products found in this category.</p>
                  </div>
                )}
              </div>
            </div>
          </Tabs>
        </div>
      </section>

      {/* How to Order */}
      <section id="how-to-order" className="py-24 bg-zinc-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070')] opacity-5 bg-cover bg-center mix-blend-luminosity"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">How to Order</h2>
            <p className="text-zinc-400 font-bn max-w-2xl mx-auto text-lg">খুব সহজেই অর্ডার করুন মাত্র ৩টি ধাপে</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="glass-card bg-white/5 border-white/10 p-8 rounded-2xl text-center hover:-translate-y-2 transition-transform duration-300 relative group">
              <div className="absolute top-0 right-0 p-4 text-6xl font-bold text-white/5 -z-10 group-hover:text-primary/10 transition-colors">1</div>
              <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 group-hover:rotate-6 transition-transform">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Choose Product</h3>
              <p className="text-zinc-400 font-bn">পছন্দের সার্ভিসটি সিলেক্ট করুন এবং প্রাইস চেক করুন।</p>
            </div>

            <div className="glass-card bg-white/5 border-white/10 p-8 rounded-2xl text-center hover:-translate-y-2 transition-transform duration-300 relative group">
              <div className="absolute top-0 right-0 p-4 text-6xl font-bold text-white/5 -z-10 group-hover:text-secondary/10 transition-colors">2</div>
              <div className="w-16 h-16 bg-secondary/20 text-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 -rotate-3 group-hover:-rotate-6 transition-transform">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Send Payment</h3>
              <p className="text-zinc-400 font-bn">বিকাশ, নগদ বা রকেটে পেমেন্ট করে নিচের ফর্মটি ফিলাপ করুন।</p>
            </div>

            <div className="glass-card bg-white/5 border-white/10 p-8 rounded-2xl text-center hover:-translate-y-2 transition-transform duration-300 relative group">
              <div className="absolute top-0 right-0 p-4 text-6xl font-bold text-white/5 -z-10 group-hover:text-accent/10 transition-colors">3</div>
              <div className="w-16 h-16 bg-accent/20 text-accent rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 group-hover:rotate-6 transition-transform">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Receive Account</h3>
              <p className="text-zinc-400 font-bn">৫-৩০ মিনিটের মধ্যে হোয়াটসঅ্যাপে একাউন্ট বুঝে নিন।</p>
            </div>
          </div>
        </div>
      </section>

      {/* Order Form & Payment Section */}
      <section id="order-form" className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
            
            {/* Left Col: Payment Info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-4">Payment Info</h2>
                <p className="text-muted-foreground font-bn">নিচের নাম্বারগুলোতে পেমেন্ট করে ফর্মটি ফিলাপ করুন অথবা সরাসরি হোয়াটসঅ্যাপে মেসেজ দিন।</p>
              </div>

              <div className="space-y-4">
                <Card className="border-l-4 border-l-[#E2136E] shadow-md">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#E2136E]/10 rounded-full flex items-center justify-center text-[#E2136E] font-bold">b</div>
                    <div>
                      <p className="text-sm text-muted-foreground uppercase font-semibold tracking-wider">bKash (Personal)</p>
                      <p className="text-2xl font-bold font-mono">{settings?.bkashNumber || "01687476714"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-[#F7941D] shadow-md">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#F7941D]/10 rounded-full flex items-center justify-center text-[#F7941D] font-bold">N</div>
                    <div>
                      <p className="text-sm text-muted-foreground uppercase font-semibold tracking-wider">Nagad (Personal)</p>
                      <p className="text-2xl font-bold font-mono">{settings?.nagadNumber || "01687476714"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-[#8C3494] shadow-md">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#8C3494]/10 rounded-full flex items-center justify-center text-[#8C3494] font-bold">R</div>
                    <div>
                      <p className="text-sm text-muted-foreground uppercase font-semibold tracking-wider">Rocket (Personal)</p>
                      <p className="text-2xl font-bold font-mono">{settings?.rocketNumber || "01687476714"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                <h4 className="font-bold text-primary flex items-center gap-2 mb-2"><Zap className="w-5 h-5"/> Quick Order?</h4>
                <p className="text-sm text-muted-foreground font-bn mb-4">ফর্ম ফিলাপ করতে না চাইলে সরাসরি হোয়াটসঅ্যাপে মেসেজ দিয়ে অর্ডার করতে পারেন।</p>
                <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white" onClick={() => handleWhatsAppOrder()}>
                  <MessageCircle className="mr-2 w-5 h-5" /> Direct WhatsApp Order
                </Button>
              </div>
            </div>

            {/* Right Col: Form */}
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
                                {p.nameEn} - ৳{p.priceBdt}
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
            <p className="text-muted-foreground">Everything you need to know about our services.</p>
          </div>

          <Accordion type="single" collapsible className="w-full bg-card rounded-2xl border p-2">
            {FAQS.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="px-4">
                <AccordionTrigger className="text-left font-semibold text-lg hover:text-primary transition-colors py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

    </MainLayout>
  );
}

// Sub-component for product cards
function ProductCard({ product, onOrder, onFormOrder }: { product: Product, onOrder: () => void, onFormOrder: (id: number) => void }) {
  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border-border/50 group bg-card">
      <CardHeader className="bg-muted/30 pb-4 relative">
        {product.badge && (
          <Badge className="absolute top-4 right-4 z-10 bg-accent text-accent-foreground border-none font-bold uppercase tracking-wider text-[10px] px-2 py-1 shadow-lg">
            {product.badge}
          </Badge>
        )}
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">{product.nameEn}</CardTitle>
            <p className="text-sm font-bn text-muted-foreground mt-1">{product.nameBn}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-6">
        <div className="mb-6 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-foreground">৳{product.priceBdt}</span>
          <span className="text-sm font-medium text-muted-foreground line-through decoration-muted-foreground/50">${product.priceUsd}</span>
        </div>
        <div className="space-y-3">
          {product.descriptionEn && (
            <p className="text-sm text-muted-foreground leading-relaxed">{product.descriptionEn}</p>
          )}
          {product.descriptionBn && (
            <p className="text-sm text-muted-foreground font-bn leading-relaxed">{product.descriptionBn}</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex flex-col gap-2 p-6 bg-card border-t border-border/50">
        <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white" onClick={onOrder}>
          <MessageCircle className="w-4 h-4 mr-2" /> Order WhatsApp
        </Button>
        <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/5 hover:text-primary" onClick={() => onFormOrder(product.id)}>
          Order via Form
        </Button>
      </CardFooter>
    </Card>
  );
}
