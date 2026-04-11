import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/layout/admin-layout";
import { 
  useGetSettings, 
  getGetSettingsQueryKey,
  useUpdateSettings
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import type { SiteSettings } from "@workspace/api-client-react";

export default function AdminSettings() {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState<SiteSettings>({
    siteName: "",
    whatsapp: "",
    telegram: "",
    facebook: "",
    bkashNumber: "",
    nagadNumber: "",
    rocketNumber: "",
    footerText: "",
    primaryColor: "",
    secondaryColor: "",
    accentColor: "",
    heroBadge: "",
    heroTitle: "",
    heroTitleHighlight: "",
    heroSubtitle: "",
    heroPrimaryBtn: "",
    heroWhatsappBtn: "",
    heroStat1Value: "",
    heroStat1Label: "",
    heroStat2Value: "",
    heroStat2Label: "",
    heroStat3Value: "",
    heroStat3Label: "",
    heroStat4Value: "",
    heroStat4Label: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) setLocation("/admin");
  }, [location, setLocation]);

  const { data: settings, isLoading } = useGetSettings({
    query: { queryKey: getGetSettingsQueryKey() }
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const updateMutation = useUpdateSettings();

  const handleInputChange = (field: keyof SiteSettings, value: string) => {
    setFormData((prev: SiteSettings) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateMutation.mutate(
      { data: formData },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
          toast({ title: "Settings updated successfully" });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  const heroStats = [
    { valueKey: "heroStat1Value" as keyof SiteSettings, labelKey: "heroStat1Label" as keyof SiteSettings, placeholder: { value: "1000+", label: "সন্তুষ্ট গ্রাহক" } },
    { valueKey: "heroStat2Value" as keyof SiteSettings, labelKey: "heroStat2Label" as keyof SiteSettings, placeholder: { value: "15+", label: "প্রোডাক্ট" } },
    { valueKey: "heroStat3Value" as keyof SiteSettings, labelKey: "heroStat3Label" as keyof SiteSettings, placeholder: { value: "24/7", label: "সাপোর্ট" } },
    { valueKey: "heroStat4Value" as keyof SiteSettings, labelKey: "heroStat4Label" as keyof SiteSettings, placeholder: { value: "5-30 Min", label: "ডেলিভারি" } },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage global site settings and contact details.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Hero Section */}
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>Edit the main banner text, stats, and button labels on the homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="heroBadge">Badge Text</Label>
                <Input
                  id="heroBadge"
                  value={formData.heroBadge || ""}
                  onChange={(e) => handleInputChange("heroBadge", e.target.value)}
                  placeholder="Premium Digital Products Marketplace"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heroTitle">Heading (Plain)</Label>
                  <Input
                    id="heroTitle"
                    value={formData.heroTitle || ""}
                    onChange={(e) => handleInputChange("heroTitle", e.target.value)}
                    placeholder="Your Trusted Source For"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroTitleHighlight">Heading (Highlighted / Gradient)</Label>
                  <Input
                    id="heroTitleHighlight"
                    value={formData.heroTitleHighlight || ""}
                    onChange={(e) => handleInputChange("heroTitleHighlight", e.target.value)}
                    placeholder="Digital Services"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroSubtitle">Subtitle (Bangla)</Label>
                <Textarea
                  id="heroSubtitle"
                  value={formData.heroSubtitle || ""}
                  onChange={(e) => handleInputChange("heroSubtitle", e.target.value)}
                  rows={2}
                  placeholder="বাংলাদেশের সবচেয়ে বিশ্বস্ত..."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heroPrimaryBtn">Primary Button Label</Label>
                  <Input
                    id="heroPrimaryBtn"
                    value={formData.heroPrimaryBtn || ""}
                    onChange={(e) => handleInputChange("heroPrimaryBtn", e.target.value)}
                    placeholder="Browse Products"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroWhatsappBtn">WhatsApp Button Label</Label>
                  <Input
                    id="heroWhatsappBtn"
                    value={formData.heroWhatsappBtn || ""}
                    onChange={(e) => handleInputChange("heroWhatsappBtn", e.target.value)}
                    placeholder="Order via WhatsApp"
                  />
                </div>
              </div>

              <p className="text-sm font-medium text-muted-foreground pt-2">Stats Strip</p>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground w-10">#</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Value</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Label (Bangla)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {heroStats.map((stat, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                        <td className="px-4 py-2">
                          <Input
                            value={(formData[stat.valueKey] as string) || ""}
                            onChange={(e) => handleInputChange(stat.valueKey, e.target.value)}
                            placeholder={stat.placeholder.value}
                            className="h-8"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            value={(formData[stat.labelKey] as string) || ""}
                            onChange={(e) => handleInputChange(stat.labelKey, e.target.value)}
                            placeholder={stat.placeholder.label}
                            className="h-8"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Footer & Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Footer &amp; Social Links</CardTitle>
              <CardDescription>Site name, footer text, and all contact / social channel URLs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input 
                  id="siteName" 
                  value={formData.siteName} 
                  onChange={(e) => handleInputChange("siteName", e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="footerText">Footer Text</Label>
                <Textarea 
                  id="footerText" 
                  value={formData.footerText} 
                  onChange={(e) => handleInputChange("footerText", e.target.value)} 
                  rows={2}
                  required 
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp Link</Label>
                  <Input 
                    id="whatsapp" 
                    value={formData.whatsapp} 
                    onChange={(e) => handleInputChange("whatsapp", e.target.value)} 
                    placeholder="https://wa.me/..."
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegram">Telegram Link</Label>
                  <Input 
                    id="telegram" 
                    value={formData.telegram} 
                    onChange={(e) => handleInputChange("telegram", e.target.value)} 
                    placeholder="https://t.me/..."
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook Page Link</Label>
                  <Input 
                    id="facebook" 
                    value={formData.facebook || ""} 
                    onChange={(e) => handleInputChange("facebook", e.target.value)} 
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Mobile banking numbers displayed to customers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 grid md:grid-cols-3 gap-4">
              <div className="space-y-2 mt-4">
                <Label htmlFor="bkashNumber">bKash Number</Label>
                <Input 
                  id="bkashNumber" 
                  value={formData.bkashNumber} 
                  onChange={(e) => handleInputChange("bkashNumber", e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nagadNumber">Nagad Number</Label>
                <Input 
                  id="nagadNumber" 
                  value={formData.nagadNumber} 
                  onChange={(e) => handleInputChange("nagadNumber", e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rocketNumber">Rocket Number</Label>
                <Input 
                  id="rocketNumber" 
                  value={formData.rocketNumber} 
                  onChange={(e) => handleInputChange("rocketNumber", e.target.value)} 
                  required 
                />
              </div>
            </CardContent>
          </Card>

          {/* Theme Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Theme Colors (Advanced)</CardTitle>
              <CardDescription>HSL color values for the site theme.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 grid md:grid-cols-3 gap-4">
              <div className="space-y-2 mt-4">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <Input 
                  id="primaryColor" 
                  value={formData.primaryColor} 
                  onChange={(e) => handleInputChange("primaryColor", e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <Input 
                  id="secondaryColor" 
                  value={formData.secondaryColor} 
                  onChange={(e) => handleInputChange("secondaryColor", e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <Input 
                  id="accentColor" 
                  value={formData.accentColor} 
                  onChange={(e) => handleInputChange("accentColor", e.target.value)} 
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
