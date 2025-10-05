import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Briefcase, TrendingUp, GraduationCap, Target, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Results = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessment();
  }, [id]);

  const loadAssessment = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', id)
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;
      setAssessment(data);
    } catch (error) {
      console.error('Error loading assessment:', error);
      toast({
        title: "Error",
        description: "Failed to load assessment results",
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Create or get chat session
      const { data: existingSession } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('assessment_id', id)
        .single();

      if (existingSession) {
        navigate(`/chat/${existingSession.id}`);
      } else {
        const { data: newSession, error } = await supabase
          .from('chat_sessions')
          .insert({
            assessment_id: id,
            user_id: session.user.id
          })
          .select()
          .single();

        if (error) throw error;
        navigate(`/chat/${newSession.id}`);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast({
        title: "Error",
        description: "Failed to start chat session",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading results...</p>
      </div>
    );
  }

  if (!assessment) {
    return null;
  }

  const details = assessment.career_details;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground mb-4">
            <Briefcase className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Your Career Path Recommendation</h1>
          <p className="text-muted-foreground">
            Based on your assessment responses, here's our personalized recommendation
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Primary Career Path */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                <CardTitle>Primary Career Path</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <h3 className="text-2xl font-bold">{details.primaryCareer}</h3>
              <p className="text-muted-foreground">{details.description}</p>
              <div className="space-y-2 pt-2">
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-sm">Average Salary:</span>
                  <span className="text-sm">{details.salaryRange}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-sm">Growth Outlook:</span>
                  <span className="text-sm">{details.growthOutlook}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-sm">Education Required:</span>
                  <span className="text-sm">{details.educationRequired}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alternative Paths */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <CardTitle>Alternative Paths</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {details.alternativePaths.map((path: any, index: number) => (
                  <div key={index} className="pb-3 border-b last:border-0">
                    <h4 className="font-semibold">{path.title}</h4>
                    <p className="text-sm text-muted-foreground">{path.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Skills */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              <CardTitle>Key Skills to Develop</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {details.keySkills.map((skill: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {details.nextSteps.map((step: string, index: number) => (
                <li key={index} className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Why This Recommendation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Why This Recommendation?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{details.whyRecommended}</p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={handleStartChat}>
            <MessageSquare className="h-5 w-5 mr-2" />
            Chat with AI Assistant
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/assessment')}>
            Take Assessment Again
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;