import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, GraduationCap, Briefcase, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [latestAssessment, setLatestAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      // Get latest assessment
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (assessmentError && assessmentError.code !== 'PGRST116') {
        console.log('No assessments found');
      }

      setProfile(profileData || { email: session.user.email });
      setLatestAssessment(assessmentData);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

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

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Info */}
          <Card className="md:col-span-1">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-lg">Student Profile</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{profile?.email}</p>
              </div>
              {profile?.full_name && (
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{profile.full_name}</p>
                </div>
              )}
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => supabase.auth.signOut().then(() => navigate('/auth'))}
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Assessment Summary */}
          <div className="md:col-span-2 space-y-6">
            {latestAssessment ? (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      <CardTitle>Academic Information</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Age</p>
                      <p className="font-medium">{latestAssessment.age} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Grade Level</p>
                      <p className="font-medium">{latestAssessment.grade_level}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Academic Stream</p>
                      <p className="font-medium">{latestAssessment.academic_stream}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">English Score</p>
                      <p className="font-medium">{latestAssessment.english_score}/100</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      <CardTitle>Skills Assessment</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Verbal Aptitude</span>
                      <Badge variant="secondary">{latestAssessment.verbal_aptitude}/10</Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Quantitative Aptitude</span>
                      <Badge variant="secondary">{latestAssessment.quantitative_aptitude}/10</Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Creativity</span>
                      <Badge variant="secondary">{latestAssessment.creativity_score}/10</Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Teamwork</span>
                      <Badge variant="secondary">{latestAssessment.teamwork_score}/10</Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Openness</span>
                      <Badge variant="secondary">{latestAssessment.openness_score}/10</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      <CardTitle>Career Path</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Career Cluster</p>
                      <p className="font-medium text-lg">{latestAssessment.career_cluster}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Recommended Career</p>
                      <p className="font-medium text-lg">{latestAssessment.primary_career}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Interests</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {latestAssessment.hobbies?.map((hobby: string, index: number) => (
                          <Badge key={index} variant="outline">{hobby}</Badge>
                        ))}
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => navigate(`/results/${latestAssessment.id}`)}
                    >
                      View Full Results
                    </Button>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    You haven't taken an assessment yet
                  </p>
                  <Button onClick={() => navigate('/assessment')}>
                    Take Assessment
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
