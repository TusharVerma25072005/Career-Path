import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { CareerAssessment } from '@/components/CareerAssessment';
import { CareerRecommendation } from '@/components/CareerRecommendation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { generateCareerRecommendation } from '@/utils/careerRecommendations';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, Clock, Play } from 'lucide-react';

type AssessmentState = 'idle' | 'taking' | 'completed';

interface SavedAssessment {
  id: string;
  answers: Record<string, string>;
  recommendation: string;
  created_at: string;
}

export function Dashboard() {
  const [assessmentState, setAssessmentState] = useState<AssessmentState>('idle');
  const [currentRecommendation, setCurrentRecommendation] = useState<string>('');
  const [savedAssessments, setSavedAssessments] = useState<SavedAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadSavedAssessments();
    }
  }, [user]);

  const loadSavedAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('career_assessments')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedAssessments(data || []);
    } catch (error) {
      console.error('Error loading assessments:', error);
      toast({
        title: "Error loading assessments",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentComplete = async (answers: Record<string, string>) => {
    try {
      const recommendation = generateCareerRecommendation(answers);
      
      // Save to database
      const { error } = await supabase
        .from('career_assessments')
        .insert({
          user_id: user?.id,
          answers,
          recommendation
        });

      if (error) throw error;

      setCurrentRecommendation(recommendation);
      setAssessmentState('completed');
      
      // Reload saved assessments
      await loadSavedAssessments();

      toast({
        title: "Assessment completed!",
        description: "Your career recommendation has been generated and saved."
      });
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast({
        title: "Error saving assessment",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleStartNewAssessment = () => {
    setAssessmentState('taking');
    setCurrentRecommendation('');
  };

  const handleViewRecommendation = (recommendation: string) => {
    setCurrentRecommendation(recommendation);
    setAssessmentState('completed');
  };

  const handleBackToDashboard = () => {
    setAssessmentState('idle');
    setCurrentRecommendation('');
  };

  if (assessmentState === 'taking') {
    return <CareerAssessment onComplete={handleAssessmentComplete} />;
  }

  if (assessmentState === 'completed') {
    return (
      <CareerRecommendation 
        recommendation={currentRecommendation}
        onStartNew={handleBackToDashboard}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">
            Ready to explore your career path? Take a new assessment or review your previous results.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Start New Assessment
              </CardTitle>
              <CardDescription>
                Take our comprehensive career assessment to get personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleStartNewAssessment} className="w-full" size="lg">
                <Play className="mr-2 h-4 w-4" />
                Begin Assessment
              </Button>
            </CardContent>
          </Card>

          {loading ? (
            <Card className="md:col-span-2">
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">Loading your assessments...</p>
              </CardContent>
            </Card>
          ) : savedAssessments.length > 0 ? (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Previous Assessments
                </CardTitle>
                <CardDescription>
                  Review your past career recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {savedAssessments.map((assessment) => {
                    const recommendation = JSON.parse(assessment.recommendation);
                    return (
                      <div
                        key={assessment.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() => handleViewRecommendation(assessment.recommendation)}
                      >
                        <div>
                          <h3 className="font-semibold">
                            {recommendation.primaryCareer.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Completed on {new Date(assessment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary">View</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="md:col-span-2">
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">
                  No previous assessments found. Take your first assessment to get started!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}