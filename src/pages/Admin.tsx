import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, LogOut, MapPin, Languages, Landmark } from "lucide-react";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TouristSpotForm from "@/components/admin/TouristSpotForm";
import TouristSpotsList from "@/components/admin/TouristSpotsList";
import CulturalHighlightsList from "@/components/admin/CulturalHighlightsList";
import FeaturedStoryForm from "@/components/admin/FeaturedStoryForm";

const emailSchema = z.string().email("Invalid email address").max(255, "Email must be less than 255 characters");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(100, "Password must be less than 100 characters");

const Admin = () => {
  const { user, isAdmin, signIn, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [refreshSpots, setRefreshSpots] = useState(0);
  const [refreshCulture, setRefreshCulture] = useState(0);

  const validateLogin = () => {
    const newErrors: { [key: string]: string } = {};
    
    try {
      emailSchema.parse(loginEmail);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.loginEmail = e.errors[0].message;
      }
    }
    
    try {
      passwordSchema.parse(loginPassword);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.loginPassword = e.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    
    setLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setLoading(false);
    
    // No need to navigate - component will re-render and show dashboard
  };


  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (user && isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
        <div className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/")}>
                View Site
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="spots" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="spots">
                <MapPin className="w-4 h-4 mr-2" />
                Tourist Spots
              </TabsTrigger>
              <TabsTrigger value="culture">
                <Landmark className="w-4 h-4 mr-2" />
                Culture
              </TabsTrigger>
              <TabsTrigger value="language">
                <Languages className="w-4 h-4 mr-2" />
                Language
              </TabsTrigger>
            </TabsList>

            <TabsContent value="spots" className="mt-6 space-y-6">
              <TouristSpotForm onSuccess={() => setRefreshSpots(prev => prev + 1)} />
              <TouristSpotsList refresh={refreshSpots} />
            </TabsContent>

            <TabsContent value="culture" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Cultural Highlights</CardTitle>
                  <CardDescription>
                    Update the 4 cultural highlight cards shown on the homepage. Click on a card to view, edit, or add images and detailed content.
                  </CardDescription>
                </CardHeader>
              </Card>
              <CulturalHighlightsList refresh={refreshCulture} />
              <FeaturedStoryForm />
            </TabsContent>

            <TabsContent value="language" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Language Content</CardTitle>
                  <CardDescription>
                    Add or edit Ilocano language phrases and translations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Languages className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Language content management coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background/95 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center">Admin Access</CardTitle>
          <CardDescription className="text-center">
            Sign in to manage the Abra Heritage platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="admin@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                disabled={loading}
              />
              {errors.loginEmail && (
                <p className="text-sm text-destructive">{errors.loginEmail}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                disabled={loading}
              />
              {errors.loginPassword && (
                <p className="text-sm text-destructive">{errors.loginPassword}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
