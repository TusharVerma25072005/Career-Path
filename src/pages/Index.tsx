import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });
  }, [navigate]);

  const [showWarning, setShowWarning] = useState(() => {
    try {
      return !localStorage.getItem('geminiWarningDismissed');
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      if (!showWarning) localStorage.setItem('geminiWarningDismissed', '1');
    } catch (e) {
      console.warn('Could not access localStorage to persist warning dismissal', e);
    }
  }, [showWarning]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">CareerPath</h1>
        </div>
      </header>

      {/* Warning Banner */}
      {showWarning && (
        <div className="container mx-auto px-4 pt-6">
          <Alert className="flex items-start justify-between">
            <div>
              <AlertTitle>Service delays and intermittent outages</AlertTitle>
              <AlertDescription>
                Due to occasional outages and API delays, some AI requests may take longer than expected or fail.
                If you see an error, please try again later.
              </AlertDescription>
            </div>
            <div className="ml-4 self-start">
              <Button variant="ghost" onClick={() => setShowWarning(false)}>Dismiss</Button>
            </div>
          </Alert>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to Career Path Advisor
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Discover your strengths, explore career paths tailored to your skills, and get
            personalized guidance to achieve your professional goals. Use our AI-powered chatbot
            to ask questions, learn skill paths, and plan your journey to success.
          </p>
          <Button size="lg" onClick={() => navigate('/auth')}>
            Get Started
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-accent/20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground mb-4">
                  <Star className="h-6 w-6" />
                </div>
                <CardTitle>Personalized Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Complete a set of questions designed to analyze your skills, interests, and strengths.
                  Receive a detailed report that suggests the most suitable career paths for you.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground mb-4">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <CardTitle>AI Career Chatbot</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Interact with our AI-powered chatbot to get instant guidance on skill development,
                  courses, and career strategies. Ask questions anytime and get personalized advice
                  tailored to your goals.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground mb-4">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <CardTitle>Career Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Explore detailed insights about different industries and professions. Learn about
                  required skills, growth opportunities, and career progression tips to make informed
                  decisions.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto text-center shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl mb-4">
                Discover Your Ideal Career Path
              </CardTitle>
              <CardDescription className="text-lg">
                Take personalized assessments and get AI-powered career guidance instantly by signing in with Google.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" onClick={() => navigate('/auth')}>
                Continue with Google
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold mb-2">CareerPath</h3>
              <p className="text-sm text-muted-foreground">
                Career Path Advisor helps you find the right career through assessments, AI guidance, and
                personalized recommendations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Quick Links</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Features</li>
                <li>Get Started</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Follow Us</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Twitter</li>
                <li>LinkedIn</li>
                <li>GitHub</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
            2025 Career Path Advisor. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
