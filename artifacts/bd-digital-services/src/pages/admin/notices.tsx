import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/layout/admin-layout";
import { 
  useGetActiveNotice, 
  getGetActiveNoticeQueryKey,
  useCreateNotice
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";

export default function AdminNotices() {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [messageBn, setMessageBn] = useState("");
  const [messageEn, setMessageEn] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) setLocation("/admin");
  }, [location, setLocation]);

  const { data: activeNotice, isLoading } = useGetActiveNotice({
    query: { queryKey: getGetActiveNoticeQueryKey() }
  });

  useEffect(() => {
    if (activeNotice) {
      setMessageBn(activeNotice.messageBn);
      setMessageEn(activeNotice.messageEn);
      setIsActive(activeNotice.isActive);
    }
  }, [activeNotice]);

  const createMutation = useCreateNotice();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createMutation.mutate(
      { data: { messageBn, messageEn, isActive } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetActiveNoticeQueryKey() });
          toast({ title: "Notice updated successfully" });
        }
      }
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Announcement Notice</h2>
          <p className="text-muted-foreground">Manage the scrolling announcement banner.</p>
        </div>

        {activeNotice && activeNotice.isActive && (
          <Card className="border-primary bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
                <AlertCircle className="w-4 h-4" /> Currently Active Notice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{activeNotice.messageEn}</p>
                <p className="font-bn text-muted-foreground">{activeNotice.messageBn}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Update Notice</CardTitle>
            <CardDescription>
              This creates a new notice and archives the previous one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="messageEn">Message (English) *</Label>
                <Textarea 
                  id="messageEn" 
                  value={messageEn} 
                  onChange={(e) => setMessageEn(e.target.value)} 
                  rows={3}
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="messageBn" className="font-bn">Message (Bangla) *</Label>
                <Textarea 
                  id="messageBn" 
                  value={messageBn} 
                  onChange={(e) => setMessageBn(e.target.value)} 
                  rows={3}
                  required 
                  className="font-bn"
                />
              </div>

              <div className="flex items-center space-x-2 py-2">
                <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                <Label htmlFor="isActive">Show notice on website</Label>
              </div>

              <Button type="submit" className="w-full" disabled={createMutation.isPending || isLoading}>
                {createMutation.isPending ? "Updating..." : "Publish Notice"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
