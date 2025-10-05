import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/AuthProvider';
import { Briefcase, LogIn, Star, MessageSquare } from 'lucide-react';

export function LoginPage() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background">
      <header className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
        <div className="flex items-start justify-start px-6 py-4">
          {/* Logo / App Name */}
          <div className="text-2xl md:text-3xl font-bold text-black">
            CareerPath
          </div>
        </div>
      </header>


      <div className="flex flex-col items-center p-6 space-y-10">
        {/* Welcome Section */}
        <div className="w-full min-h-screen  flex flex-col items-center justify-center px-6 text-center">
          {/* Hero Content */}
          <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
            {/* Hero Content */}
            <div className="max-w-3xl space-y-6">
              <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-black">
                Welcome to Career Path Advisor
              </h1>
              <p className="text-lg md:text-xl text-gray-700">
                Discover your strengths, explore career paths tailored to your skills, and get personalized guidance to achieve your professional goals.
                Use our AI-powered chatbot to ask questions, learn skill paths, and plan your journey to success.
              </p>
              <Button
                onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
                size="lg"
                className="mt-4 px-8 py-4 text-lg bg-black text-white hover:bg-gray-800"
              >
                Get Started
              </Button>
            </div>



            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-center mt-4">
              {/* Feature 1 */}
              <div className="p-6 rounded-lg border border-gray-300 bg-white shadow hover:shadow-lg transition">
                <Star className="mx-auto mb-2 h-6 w-6 text-black" />
                <h3 className="text-xl font-semibold mb-2">Personalized Assessment</h3>
                <p className="text-sm text-gray-700">
                  Complete a set of questions designed to analyze your skills, interests, and strengths.
                  Receive a detailed report that suggests the most suitable career paths for you.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-lg border border-gray-300 bg-white shadow hover:shadow-lg transition">
                <MessageSquare className="mx-auto mb-2 h-6 w-6 text-black" />
                <h3 className="text-xl font-semibold mb-2">AI Career Chatbot</h3>
                <p className="text-sm text-gray-700">
                  Interact with our AI-powered chatbot to get instant guidance on skill development, courses, and career strategies.
                  Ask questions anytime and get personalized advice tailored to your goals.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-lg border border-gray-300 bg-white shadow hover:shadow-lg transition">
                <Briefcase className="mx-auto mb-2 h-6 w-6 text-black" />
                <h3 className="text-xl font-semibold mb-2">Career Insights</h3>
                <p className="text-sm text-gray-700">
                  Explore detailed insights about different industries and professions.
                  Learn about required skills, growth opportunities, and career progression tips to make informed decisions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="w-full max-w-2xl bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden">
          <CardHeader className="text-center bg-gray-50 py-8">
            <CardTitle className="text-3xl md:text-4xl font-bold text-black">
              Discover Your Ideal Career Path
            </CardTitle>
            <CardDescription className="text-gray-600 mt-3 text-lg md:text-xl max-w-xl mx-auto">
              Take personalized assessments and get AI-powered career guidance instantly by signing in with Google.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-10 py-8">
            <Button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center space-x-3 border border-black bg-black text-white hover:bg-gray-800 text-lg md:text-xl py-4"
            >
              <LogIn className="h-6 w-6" />
              <span>Continue with Google</span>
            </Button>
          </CardContent>
        </Card>


      </div>

      {/* Page Footer */}
      <footer className="bg-gray-100 w-full text-center py-10 mt-10 border-t border-gray-300">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row md:justify-between md:items-start gap-6 md:gap-0">

          {/* Logo & About */}
          <div className="flex flex-col items-center md:items-start space-y-3">
            {/* Logo placeholder */}
            <div className="text-2xl font-bold text-black">CareerPath</div>
            <p className="text-gray-700 text-sm max-w-xs">
              Career Path Advisor helps you find the right career through assessments, AI guidance, and personalized recommendations.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start space-y-2">
            <h4 className="font-semibold text-black">Quick Links</h4>
            <a href="#features" className="text-gray-700 hover:text-black text-sm">Features</a>
            <a href="#get-started" className="text-gray-700 hover:text-black text-sm">Get Started</a>
            <a href="#contact" className="text-gray-700 hover:text-black text-sm">Contact</a>
          </div>

          {/* Social & Contact */}
          <div className="flex flex-col items-center md:items-start space-y-3">
            <h4 className="font-semibold text-black">Follow Us</h4>
            <div className="flex space-x-4">
              {/* Replace with real icons if using lucide-react */}
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-black">
                Twitter
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-black">
                LinkedIn
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-black">
                GitHub
              </a>
            </div>
            <p className="text-gray-500 text-xs mt-2">
              {new Date().getFullYear()} Career Path Advisor. All rights reserved.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
