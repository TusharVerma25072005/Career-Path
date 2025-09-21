import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Briefcase, TrendingUp, Users, Target, MessageCircle } from 'lucide-react';
import { CareerChat } from './CareerChat';

interface CareerRecommendationProps {
  recommendation: string;
  onStartNew: () => void;
}

export function CareerRecommendation({ recommendation, onStartNew }: CareerRecommendationProps) {
  const [showChat, setShowChat] = useState(false);
  
  // Parse the recommendation JSON
  const parsedRecommendation = JSON.parse(recommendation);
  const { 
    primaryCareer, 
    alternativeCareers, 
    skills, 
    nextSteps, 
    reasoning 
  } = parsedRecommendation;

  if (showChat) {
    return (
      <CareerChat 
        assessmentData={recommendation}
        onBack={() => setShowChat(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
              <Briefcase className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-3xl">Your Career Path Recommendation</CardTitle>
            <CardDescription>
              Based on your assessment responses, here's our personalized recommendation
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Primary Career Path
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-2xl font-bold text-primary mb-2">
                {primaryCareer.title}
              </h3>
              <p className="text-muted-foreground mb-4">
                {primaryCareer.description}
              </p>
              <div className="space-y-2">
                <p><strong>Average Salary:</strong> {primaryCareer.salary}</p>
                <p><strong>Growth Outlook:</strong> {primaryCareer.growth}</p>
                <p><strong>Education Required:</strong> {primaryCareer.education}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Alternative Paths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alternativeCareers.map((career: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <h4 className="font-semibold">{career.title}</h4>
                    <p className="text-sm text-muted-foreground">{career.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Key Skills to Develop
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {nextSteps.map((step: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
                      {index + 1}
                    </span>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Why This Recommendation?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{reasoning}</p>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-center gap-4">
          <Button onClick={() => setShowChat(true)} size="lg">
            <MessageCircle className="mr-2 h-4 w-4" />
            Chat with AI Assistant
          </Button>
          <Button onClick={onStartNew} variant="outline" size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Take Assessment Again
          </Button>
        </div>
      </div>
    </div>
  );
}