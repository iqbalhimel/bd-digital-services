import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { useAdminLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Lock, User, KeyRound, Mail, Server } from "lucide-react";

export default function AdminLogin() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useAdminLogin();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      setLocation("/admin/dashboard");
    }
  }, [location, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { data: { username, password } },
      {
        onSuccess: (data) => {
          localStorage.setItem("admin_token", data.token);
          toast({
            title: "লগইন সফল হয়েছে",
            description: "Admin panel এ স্বাগতম।",
          });
          setLocation("/admin/dashboard");
        },
        onError: () => {
          toast({
            title: "লগইন ব্যর্থ হয়েছে",
            description: "ভুল username বা password। আবার চেষ্টা করুন।",
            variant: "destructive",
          });
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <Helmet>
        <title>Admin Login | BD Digital Services</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-600 mb-4 shadow-lg">
            <KeyRound className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">BD Digital Services</h1>
          <p className="text-sm text-muted-foreground">Admin Panel</p>
        </div>

        <Card className="shadow-xl border-0 ring-1 ring-black/5">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-bold text-center">লগইন করুন</CardTitle>
            <CardDescription className="text-center">
              Admin panel অ্যাক্সেস করতে আপনার ক্রেডেনশিয়াল দিন
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username">Username / Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    autoComplete="username"
                    placeholder="আপনার username বা email"
                    className="pl-10"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="আপনার password"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground text-xs select-none"
                    tabIndex={-1}
                  >
                    {showPassword ? "লুকান" : "দেখুন"}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <ForgotPasswordDialog />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white font-semibold"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "লগইন হচ্ছে..." : "লগইন করুন"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} BD Digital Services. All rights reserved.
        </p>
      </div>
    </div>
  );
}

function ForgotPasswordDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-sm text-violet-600 hover:text-violet-800 hover:underline font-medium transition-colors"
        >
          Password ভুলে গেছেন?
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-violet-600" />
            Password রিসেট করুন
          </DialogTitle>
          <DialogDescription>
            আপনার admin password পরিবর্তন করতে নিচের পদ্ধতি অনুসরণ করুন।
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="rounded-lg bg-violet-50 border border-violet-100 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold">১</div>
              <div>
                <p className="text-sm font-medium text-gray-800">Hosting Control Panel খুলুন</p>
                <p className="text-xs text-muted-foreground mt-0.5">Hostinger বা আপনার hosting provider এ লগইন করুন।</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold">২</div>
              <div>
                <p className="text-sm font-medium text-gray-800">Environment Variables খুঁজুন</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Node.js app settings এ গিয়ে <code className="bg-gray-100 px-1 rounded text-xs">ADMIN_PASSWORD</code> ভেরিয়েবল পরিবর্তন করুন।
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold">৩</div>
              <div>
                <p className="text-sm font-medium text-gray-800">App রিস্টার্ট করুন</p>
                <p className="text-xs text-muted-foreground mt-0.5">নতুন password দিয়ে app পুনরায় চালু করুন।</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-cyan-50 border border-cyan-100 p-3 flex items-start gap-3">
            <Mail className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gray-700">সহায়তার জন্য যোগাযোগ করুন</p>
              <a
                href="mailto:bddigitalservices02@gmail.com"
                className="text-xs text-cyan-600 hover:underline font-medium"
              >
                bddigitalservices02@gmail.com
              </a>
            </div>
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 flex items-start gap-3">
            <Server className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-700">
              <span className="font-medium">বর্তমান username:</span>{" "}
              <code className="bg-amber-100 px-1 rounded">ADMIN_USERNAME</code> এনভায়রনমেন্ট ভেরিয়েবল দিয়ে নিয়ন্ত্রিত।
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
