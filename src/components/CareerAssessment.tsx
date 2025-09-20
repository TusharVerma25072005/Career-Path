import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const questions = [
  {
    id: 'work_environment',
    question: 'What type of work environment do you prefer?',
    options: [
      { value: 'office', label: 'Traditional office setting' },
      { value: 'remote', label: 'Remote/work from home' },
      { value: 'hybrid', label: 'Hybrid (mix of office and remote)' },
      { value: 'outdoors', label: 'Outdoor/field work' }
    ]
  },
  {
    id: 'work_style',
    question: 'How do you prefer to work?',
    options: [
      { value: 'team', label: 'Collaboratively in teams' },
      { value: 'independent', label: 'Independently' },
      { value: 'leadership', label: 'Leading and managing others' },
      { value: 'mix', label: 'A mix of team and independent work' }
    ]
  },
  {
    id: 'interests',
    question: 'Which area interests you most?',
    options: [
      { value: 'technology', label: 'Technology and programming' },
      { value: 'creative', label: 'Creative arts and design' },
      { value: 'business', label: 'Business and finance' },
      { value: 'healthcare', label: 'Healthcare and medicine' },
      { value: 'education', label: 'Education and training' },
      { value: 'science', label: 'Science and research' }
    ]
  },
  {
    id: 'problem_solving',
    question: 'What type of problems do you enjoy solving?',
    options: [
      { value: 'analytical', label: 'Analytical and logical problems' },
      { value: 'creative', label: 'Creative and artistic challenges' },
      { value: 'people', label: 'People-related issues' },
      { value: 'technical', label: 'Technical and mechanical problems' }
    ]
  },
  {
    id: 'career_goals',
    question: 'What are your primary career goals?',
    options: [
      { value: 'stability', label: 'Job security and stability' },
      { value: 'growth', label: 'Career advancement and growth' },
      { value: 'impact', label: 'Making a positive impact' },
      { value: 'freedom', label: 'Flexibility and work-life balance' }
    ]
  }
];

interface CareerAssessmentProps {
  onComplete: (answers: Record<string, string>) => void;
}

export function CareerAssessment({ onComplete }: CareerAssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: value
    }));
  };

  const handleNext = () => {
    const currentQuestionId = questions[currentQuestion].id;
    if (!answers[currentQuestionId]) {
      toast({
        title: "Please select an answer",
        description: "You must select an answer before proceeding.",
        variant: "destructive"
      });
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      onComplete(answers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const currentAnswer = answers[questions[currentQuestion].id];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <p className="mt-2 text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {questions[currentQuestion].question}
            </CardTitle>
            <CardDescription>
              Select the option that best describes your preference
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={currentAnswer || ''}
              onValueChange={handleAnswerChange}
              className="space-y-3"
            >
              {questions[currentQuestion].options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              <Button onClick={handleNext}>
                {isLastQuestion ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Assessment
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}