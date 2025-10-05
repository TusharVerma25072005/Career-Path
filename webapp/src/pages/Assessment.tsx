import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LoadingStages from "@/components/LoadingStages";
import { analyzeAssessment, careerChat } from "@/api/supabaseFunctions";

interface AssessmentData {
  // Part 1
  age?: number;
  gradeLevel?: string;
  academicStream?: string;
  disability?: string;
  hobbies?: string[];
  
  // Part 2
  familyIncome?: string;
  parentalExpectation?: string;
  parentalInterest?: number;
  
  // Part 3
  verbalAptitude?: number;
  quantitativeAptitude?: number;
  creativity?: number;
  teamwork?: number;
  openness?: number;
  
  // Part 4
  fieldOfInterest?: string;
  expectedSalary?: number;
  workArrangement?: string;
  internationalWork?: string;
  
  // Part 5
  englishScore?: number;
  mathScore?: number | null;
  scienceScore?: number | null;
  psychometricTest?: string;
  psychometricScore?: string;
}

const questions = [
  // Part 1: Personal & Academic Background
  {
    id: 1,
    section: "Personal & Academic Background",
    question: "What is your age in years?",
    type: "number",
    field: "age",
    min: 13,
    max: 19,
    placeholder: "Enter a number between 13 and 19"
  },
  {
    id: 2,
    section: "Personal & Academic Background",
    question: "What is your current grade level?",
    type: "radio",
    field: "gradeLevel",
    options: ["Below 10th", "10th", "12th"]
  },
  {
    id: 3,
    section: "Personal & Academic Background",
    question: "Which academic stream are you currently enrolled in?",
    type: "radio",
    field: "academicStream",
    options: ["Arts", "Commerce", "Science", "Unknown"]
  },
  {
    id: 4,
    section: "Personal & Academic Background",
    question: "Do you have a disability that we should be aware of to provide support?",
    type: "radio",
    field: "disability",
    options: ["Hearing", "Learning", "Physical", "Visual", "Prefer not to say"]
  },
  {
    id: 5,
    section: "Personal & Academic Background",
    question: "Which types of hobbies do you participate in? (Select all that apply)",
    type: "checkbox",
    field: "hobbies",
    options: [
      "Creative Hobbies (e.g., painting, music, writing)",
      "Technical Hobbies (e.g., coding, robotics)",
      "Sports"
    ]
  },
  // Part 2: Family Background
  {
    id: 6,
    section: "Family Background",
    question: "Which of the following best describes your family's annual income bracket?",
    type: "radio",
    field: "familyIncome",
    options: ["Low", "Lower-Middle", "Middle", "Upper-Middle", "High"]
  },
  {
    id: 7,
    section: "Family Background",
    question: "Which field do your parents or guardians expect you to pursue?",
    type: "radio",
    field: "parentalExpectation",
    options: ["Arts", "Commerce", "Engineering", "Law", "Medicine", "Science", "Technology"]
  },
  {
    id: 8,
    section: "Family Background",
    question: "On a scale of 0-10, how would you describe your parents' level of interest in your career?",
    type: "number",
    field: "parentalInterest",
    min: 0,
    max: 10,
    placeholder: "0 = Not at all interested, 10 = Extremely interested"
  },
  // Part 3: Self-Assessment & Skills
  {
    id: 9,
    section: "Self-Assessment & Skills",
    question: "Rate your verbal aptitude (ability with language, reading, and communication):",
    type: "number",
    field: "verbalAptitude",
    min: 0,
    max: 10,
    placeholder: "Rate from 0 to 10"
  },
  {
    id: 10,
    section: "Self-Assessment & Skills",
    question: "Rate your quantitative aptitude (ability with numbers and logical reasoning):",
    type: "number",
    field: "quantitativeAptitude",
    min: 0,
    max: 10,
    placeholder: "Rate from 0 to 10"
  },
  {
    id: 11,
    section: "Self-Assessment & Skills",
    question: "Rate your creativity:",
    type: "number",
    field: "creativity",
    min: 0,
    max: 10,
    placeholder: "Rate from 0 to 10"
  },
  {
    id: 12,
    section: "Self-Assessment & Skills",
    question: "Rate your ability to work effectively in a team:",
    type: "number",
    field: "teamwork",
    min: 0,
    max: 10,
    placeholder: "Rate from 0 to 10"
  },
  {
    id: 13,
    section: "Self-Assessment & Skills",
    question: "Rate your willingness to explore new ideas:",
    type: "number",
    field: "openness",
    min: 0,
    max: 10,
    placeholder: "Rate from 0 to 10"
  },
  // Part 4: Career Aspirations
  {
    id: 14,
    section: "Career Aspirations",
    question: "What is your primary field of interest for your future career?",
    type: "radio",
    field: "fieldOfInterest",
    options: ["Arts", "Commerce", "Engineering", "Law", "Medicine", "Science", "Technology"]
  },
  {
    id: 15,
    section: "Career Aspirations",
    question: "What is your expected annual salary for your first job?",
    type: "number",
    field: "expectedSalary",
    min: 0,
    placeholder: "Enter amount (e.g., 500000)"
  },
  {
    id: 16,
    section: "Career Aspirations",
    question: "What is your preferred work arrangement for a future job?",
    type: "radio",
    field: "workArrangement",
    options: ["On-site", "Remote", "Hybrid"]
  },
  {
    id: 17,
    section: "Career Aspirations",
    question: "Are you comfortable with the prospect of studying or working outside of India?",
    type: "radio",
    field: "internationalWork",
    options: ["Yes", "No"]
  },
  // Part 5: Academic & Test Scores
  {
    id: 18,
    section: "Academic & Test Scores",
    question: "What was your most recent score in English (out of 100)?",
    type: "number",
    field: "englishScore",
    min: 0,
    max: 100,
    placeholder: "Enter score from 0 to 100"
  },
  {
    id: 19,
    section: "Academic & Test Scores",
    question: "What was your most recent score in Mathematics (out of 100)?",
    type: "number",
    field: "mathScore",
    min: 0,
    max: 100,
    placeholder: "Enter score or NA if not applicable",
    optional: true
  },
  {
    id: 20,
    section: "Academic & Test Scores",
    question: "What was your most recent score in Science (out of 100)?",
    type: "number",
    field: "scienceScore",
    min: 0,
    max: 100,
    placeholder: "Enter score or NA if not applicable",
    optional: true
  },
  {
    id: 21,
    section: "Academic & Test Scores",
    question: "Have you ever taken a formal psychometric or career aptitude test?",
    type: "radio",
    field: "psychometricTest",
    options: ["Yes", "No"]
  },
  {
    id: 22,
    section: "Academic & Test Scores",
    question: "If yes, what was your overall score on the test?",
    type: "text",
    field: "psychometricScore",
    placeholder: "Enter score or NA",
    optional: true
  }
];

const Assessment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  const checkAssessmentLimit = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('assessments')
        .select('id')
        .eq('user_id', session.user.id)
        .gte('created_at', today.toISOString());

      if (error) {
        // Throw the error to be caught by the catch block
        throw error;
      }

      const count = data?.length || 0;
      if (count >= 3) {
        toast({
          title: "Daily Limit Reached",
          description: "You've completed 3 assessments today. Come back tomorrow!",
          variant: "destructive",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking assessment limit:', error);
      toast({
        title: "Initialization Error",
        description: "Could not verify your assessment status. Please try again later.",
        variant: "destructive",
      });
    }
  };
  checkAssessmentLimit();
}, [navigate, toast]);

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQuestionData = questions[currentQuestion];

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const isQuestionAnswered = () => {
    const field = currentQuestionData.field as keyof AssessmentData;
    const value = assessmentData[field];
    
    if (currentQuestionData.optional) return true;
    if (currentQuestionData.type === "checkbox") {
      return Array.isArray(value) && value.length > 0;
    }
    return value !== undefined && value !== null && value !== "";
  };

  const handleSubmit = async () => {
  setLoading(true);
  console.log('Starting assessment submission...');
  console.log('Assessment data being submitted:', JSON.stringify(assessmentData, null, 2));

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('No active session, redirecting to auth');
      navigate('/auth');
      return;
    }

    // Client-side timeout wrapper
    const TIMEOUT_MS = 25000;
    const analyzePromise = analyzeAssessment(assessmentData);
    const data = await Promise.race([
      analyzePromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI service timeout')), TIMEOUT_MS)
      )
    ]);

    console.log('Analyze-assessment response:', data);

    if (!data?.careerCluster || !data?.careerDetails?.primaryCareer) {
      console.error('Invalid response from AI:', data);
      throw new Error('Invalid career analysis response');
    }

    // Convert numeric fields safely
    const toIntOrNull = (value: any) => {
      if (value === undefined || value === null || value === '') return null;
      const num = Number(value);
      return isNaN(num) ? null : Math.round(num);
    };

    const age = toIntOrNull(assessmentData.age);
    if (!age || age < 13 || age > 19) {
      throw new Error(`Age must be between 13 and 19. You entered: ${assessmentData.age}`);
    }

    const dbPayload = {
      user_id: session.user.id,
      responses: assessmentData,
      age,
      grade_level: assessmentData.gradeLevel || null,
      academic_stream: assessmentData.academicStream || null,
      disability: assessmentData.disability || null,
      hobbies: Array.isArray(assessmentData.hobbies) ? assessmentData.hobbies : [],
      family_income: assessmentData.familyIncome || null,
      parental_expectation: assessmentData.parentalExpectation || null,
      parental_interest: toIntOrNull(assessmentData.parentalInterest),
      verbal_aptitude: toIntOrNull(assessmentData.verbalAptitude),
      quantitative_aptitude: toIntOrNull(assessmentData.quantitativeAptitude),
      creativity_score: toIntOrNull(assessmentData.creativity),
      teamwork_score: toIntOrNull(assessmentData.teamwork),
      openness_score: toIntOrNull(assessmentData.openness),
      field_of_interest: assessmentData.fieldOfInterest || null,
      expected_salary: toIntOrNull(assessmentData.expectedSalary),
      work_arrangement: assessmentData.workArrangement || null,
      international_work: assessmentData.internationalWork === "Yes",
      english_score: toIntOrNull(assessmentData.englishScore),
      math_score: toIntOrNull(assessmentData.mathScore),
      science_score: toIntOrNull(assessmentData.scienceScore),
      psychometric_test: assessmentData.psychometricTest === "Yes",
      psychometric_score: assessmentData.psychometricTest === "Yes" && assessmentData.psychometricScore
        ? assessmentData.psychometricScore
        : null,
      career_cluster: data.careerCluster,
      primary_career: data.careerDetails.primaryCareer,
      career_details: data.careerDetails
    };

    // Insert into Supabase
    console.log('Saving assessment to database...');
    const { data: assessment, error: dbError } = await supabase
      .from('assessments')
      .insert([dbPayload])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    toast({
      title: "Assessment complete!",
      description: "Your career recommendation is ready",
    });

    navigate(`/results/${assessment.id}`);
  } catch (error) {
    console.error('Error submitting assessment:', error);
    let errorMessage = "Failed to process assessment. Please try again.";

    if (error instanceof Error) {
      if (error.message === 'Invalid career analysis response') {
        errorMessage = "Failed to analyze your assessment. AI service may be busy. Try again in a few minutes.";
      } else if (error.message === 'AI service timeout') {
        errorMessage = "AI service is taking too long. Please try again in a few moments.";
      } else if (error.message.includes('check constraint') || error.message.includes('violates')) {
        errorMessage = "Some assessment values are out of range. Check ages (13-19), scores (0-10), etc.";
      } else if (error.message.includes('Missing required fields')) {
        errorMessage = error.message;
      }
    }

    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};


  const renderQuestionInput = () => {
    const field = currentQuestionData.field as keyof AssessmentData;

    switch (currentQuestionData.type) {
      case "radio":
        return (
          <RadioGroup
            value={assessmentData[field] as string}
            onValueChange={(value) => {
              setAssessmentData({ ...assessmentData, [field]: value });
            }}
          >
            <div className="space-y-3">
              {currentQuestionData.options?.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                >
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case "checkbox":
        const selectedHobbies = (assessmentData[field] as string[]) || [];
        return (
          <div className="space-y-3">
            {currentQuestionData.options?.map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
              >
                <Checkbox
                  id={`checkbox-${index}`}
                  checked={selectedHobbies.includes(option)}
                  onCheckedChange={(checked) => {
                    const newHobbies = checked
                      ? [...selectedHobbies, option]
                      : selectedHobbies.filter((h) => h !== option);
                    setAssessmentData({ ...assessmentData, [field]: newHobbies });
                  }}
                />
                <Label htmlFor={`checkbox-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case "number":
        return (
          <Input
            type="number"
            min={currentQuestionData.min}
            max={currentQuestionData.max}
            placeholder={currentQuestionData.placeholder}
            value={assessmentData[field] as number || ""}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : undefined;
              setAssessmentData({ ...assessmentData, [field]: value });
            }}
            className="max-w-md"
          />
        );

      case "text":
        return (
          <Input
            type="text"
            placeholder={currentQuestionData.placeholder}
            value={assessmentData[field] as string || ""}
            onChange={(e) => {
              setAssessmentData({ ...assessmentData, [field]: e.target.value });
            }}
            className="max-w-md"
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {loading && <LoadingStages />}
      <div className="min-h-screen bg-background py-8">
        <div className="container max-w-3xl mx-auto px-4">
        <div className="mb-8 text-center">
          <Progress value={progress} className="mb-4" />
          <p className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {currentQuestionData.section}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 pb-8">
            <h2 className="text-2xl font-bold mb-6">{currentQuestionData.question}</h2>
            {currentQuestionData.optional && (
              <p className="text-sm text-muted-foreground mb-4">
                This question is optional
              </p>
            )}

            <div className="mb-8">{renderQuestionInput()}</div>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!isQuestionAnswered() || loading}
                >
                  {loading ? "Processing..." : "Submit Assessment"}
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={!isQuestionAnswered()}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  );
};

export default Assessment;
