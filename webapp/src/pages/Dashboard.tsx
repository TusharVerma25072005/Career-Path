import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Clock, LogOut, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Assessment {
  id: string;
  primary_career: string;
  completed_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayAssessmentCount, setTodayAssessmentCount] = useState(0);
  const [remainingAssessments, setRemainingAssessments] = useState(3);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      loadAssessments(session.user.id);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadAssessments = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('id, primary_career, completed_at')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAssessments(data || []);

      // Count today's assessments
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: todayData, error: todayError } = await supabase
        .from('assessments')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', today.toISOString());

      if (todayError) throw todayError;
      
      const count = todayData?.length || 0;
      setTodayAssessmentCount(count);
      setRemainingAssessments(Math.max(0, 3 - count));
    } catch (error) {
      console.error('Error loading assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
  };

  const handleStartAssessment = () => {
    if (remainingAssessments <= 0) {
      toast({
        title: "Assessment Limit Reached",
        description: "You've used all 3 assessments for today. Come back tomorrow or upgrade to Pro for unlimited assessments!",
        variant: "destructive",
      });
      return;
    }
    navigate('/assessment');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Career Path Advisor</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2">Ready to Explore Your Career Path?</h2>
          <p className="text-lg text-muted-foreground">
            Take a new personalized assessment, review your previous results, and get AI-powered guidance to discover the career path that fits you best.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Start New Assessment */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-5 w-5" />
                <CardTitle>Start New Assessment</CardTitle>
              </div>
              <CardDescription>
                Take our comprehensive career assessment to get personalized recommendations
              </CardDescription>
              <p className={`text-sm mt-2 ${remainingAssessments > 0 ? 'text-muted-foreground' : 'text-destructive font-medium'}`}>
                {remainingAssessments > 0 
                  ? `${remainingAssessments} assessment${remainingAssessments !== 1 ? 's' : ''} remaining today`
                  : 'Daily limit reached. Upgrade to Pro for unlimited assessments!'}
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleStartAssessment}
                disabled={remainingAssessments <= 0}
              >
                {remainingAssessments > 0 ? 'Begin Assessment' : 'Limit Reached'}
              </Button>
              {remainingAssessments <= 0 && (
                <div className="mt-4 p-4 border rounded-lg bg-accent/50">
                  <p className="text-sm font-medium mb-2">Want unlimited assessments?</p>
                  <Button variant="default" className="w-full" size="sm">
                    Upgrade to Pro
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Previous Assessments */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5" />
                <CardTitle>Previous Assessments</CardTitle>
              </div>
              <CardDescription>
                Review your past career recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : assessments.length > 0 ? (
                <div className="space-y-2">
                  {assessments.map((assessment) => (
                    <div
                      key={assessment.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/results/${assessment.id}`)}
                    >
                      <div>
                        <p className="font-medium">{assessment.primary_career}</p>
                        <p className="text-sm text-muted-foreground">
                          Completed on {format(new Date(assessment.completed_at), 'M/d/yyyy')}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No assessments yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold mb-2">CareerPath</h3>
              <p className="text-sm text-muted-foreground">
                Career Path Advisor helps you find the right career through assessments, AI guidance, and personalized recommendations.
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

export default Dashboard;