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
    bkashNumber: "",
    nagadNumber: "",
    rocketNumber: "",
    footerText: "",
    primaryColor: "",
    secondaryColor: "",
    accentColor: "",
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

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage global site settings and contact details.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Basic details about your marketplace.</CardDescription>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Links</CardTitle>
              <CardDescription>Full URLs for your contact channels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 grid md:grid-cols-2 gap-4">
              <div className="space-y-2 mt-4">
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
            </CardContent>
          </Card>

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
