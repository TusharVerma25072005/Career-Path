import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { CareerAssessment } from '@/components/CareerAssessment';
import { CareerRecommendation } from '@/components/CareerRecommendation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, Clock, Play, AlertCircle } from 'lucide-react';

type AssessmentState = 'idle' | 'taking' | 'completed';

interface SavedAssessment {
  id: string;
  answers: Record<string, string>;
  recommendation: string;
  created_at: string;
}

interface UsageData {
  assessment_count: number;
  limit_exceeded: boolean;
  remaining: number;
}

export function Dashboard() {
  const [assessmentState, setAssessmentState] = useState<AssessmentState>('idle');
  const [currentRecommendation, setCurrentRecommendation] = useState<string>('');
  const [savedAssessments, setSavedAssessments] = useState<SavedAssessment[]>([]);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadSavedAssessments();
      loadUsageData();
    }
  }, [user]);

  const loadUsageData = async () => {
    try {
      console.log('Loading usage data for user:', user?.id);
      const { data, error } = await supabase
        .from('user_assessment_usage')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      console.log('Usage data query result:', { data, error });

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading usage data:', error);
        throw error;
      }

      if (data) {
        console.log('Found existing usage data:', data);
        setUsageData({
          assessment_count: data.assessment_count,
          limit_exceeded: data.assessment_count >= 5,
          remaining: Math.max(0, 5 - data.assessment_count)
        });
      } else {
        console.log('No usage data found, setting defaults');
        setUsageData({
          assessment_count: 0,
          limit_exceeded: false,
          remaining: 5
        });
      }
    } catch (error) {
      console.error('Error loading usage data:', error);
      // Set default values if there's an error
      setUsageData({
        assessment_count: 0,
        limit_exceeded: false,
        remaining: 5
      });
    }
  };

  const loadSavedAssessments = async () => {
    try {
      console.log('Loading assessments for user:', user?.id);
      
      const { data, error } = await supabase
        .from('career_assessments')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      console.log('Loaded assessments:', data);
      setSavedAssessments(data || []);
    } catch (error) {
      console.error('Error loading assessments:', error);
      
      let errorMessage = "Please try again later.";
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message;
      }
      
      toast({
        title: "Error loading assessments",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentComplete = async (answers: Record<string, string>) => {
    try {
      // Check authentication first
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      console.log('Current authenticated user:', currentUser);
      console.log('User from context:', user);
      
      // Check current usage before proceeding
      const { data: currentUsage } = await supabase
        .from('user_assessment_usage')
        .select('assessment_count')
        .eq('user_id', user?.id)
        .single();

      const currentCount = currentUsage?.assessment_count || 0;
      console.log('Current usage count before assessment:', currentCount);
      
      if (currentCount >= 5) {
        toast({
          title: "Assessment limit reached",
          description: "You have reached your limit of 5 free career assessments. Please upgrade to continue.",
          variant: "destructive"
        });
        await loadUsageData(); // Refresh usage data
        return;
      }
      
      // For now, let's use the local utility to generate recommendations
      // and manually track usage
      const { generateCareerRecommendation } = await import('@/utils/careerRecommendations');
      const recommendation = generateCareerRecommendation(answers);
      
      console.log('Generated recommendation:', recommendation);
      console.log('User ID:', user?.id);
      console.log('Answers:', answers);
      
      // Save to database
      const { data, error } = await supabase
        .from('career_assessments')
        .insert({
          user_id: user?.id,
          answers,
          recommendation: JSON.stringify(recommendation)
        })
        .select();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      console.log('Successfully saved assessment:', data);

      // Manually increment usage count
      const newCount = currentCount + 1;
      console.log('Incrementing usage count from', currentCount, 'to', newCount);
      
      // Try insert first, then update if exists
      const { data: insertResult, error: insertError } = await supabase
        .from('user_assessment_usage')
        .insert({
          user_id: user?.id,
          assessment_count: newCount,
          last_assessment_at: new Date().toISOString()
        })
        .select();

      if (insertError) {
        // If insert fails (user already exists), try update
        console.log('Insert failed, trying update:', insertError);
        const { data: updateResult, error: updateError } = await supabase
          .from('user_assessment_usage')
          .update({
            assessment_count: newCount,
            last_assessment_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user?.id)
          .select();

        if (updateError) {
          console.error('Error updating usage count:', updateError);
        } else {
          console.log('Usage count updated successfully:', updateResult);
        }
      } else {
        console.log('Usage count inserted successfully:', insertResult);
      }

      // Pass the object directly, not stringified
      setCurrentRecommendation(JSON.stringify(recommendation));
      setAssessmentState('completed');
      
      // Reload saved assessments and usage data
      await loadSavedAssessments();
      await loadUsageData();

      toast({
        title: "Assessment completed!",
        description: "Your career recommendation has been generated and saved."
      });
    } catch (error) {
      console.error('Error saving assessment:', error);
      
      // More detailed error handling
      let errorMessage = "Please try again later.";
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message;
      }
      
      toast({
        title: "Error generating assessment",
        description: errorMessage,
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
              {usageData && (
                <div className="flex items-center gap-2 mt-2">
                  {usageData.limit_exceeded ? (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Limit Reached
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      {usageData.remaining} assessments remaining
                    </Badge>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleStartNewAssessment} 
                className="w-full" 
                size="lg"
                disabled={usageData?.limit_exceeded}
              >
                <Play className="mr-2 h-4 w-4" />
                {usageData?.limit_exceeded ? 'Upgrade to Continue' : 'Begin Assessment'}
              </Button>
              {usageData?.limit_exceeded && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  You've used all 5 free assessments. Upgrade to continue.
                </p>
              )}
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
                    // Parse the JSON recommendation with error handling
                    let recommendation;
                    let title = "Career Assessment";
                    
                    try {
                      recommendation = JSON.parse(assessment.recommendation);
                      
                      // Check if it's double-stringified
                      if (typeof recommendation === 'string') {
                        recommendation = JSON.parse(recommendation);
                      }
                      
                      // Safely get the title
                      title = recommendation?.primaryCareer?.title || "Career Assessment";
                    } catch (error) {
                      console.error('Error parsing saved assessment:', error);
                      console.log('Assessment data:', assessment.recommendation);
                    }
                    
                    return (
                      <div
                        key={assessment.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() => handleViewRecommendation(assessment.recommendation)}
                      >
                        <div>
                          <h3 className="font-semibold">
                            {title}
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