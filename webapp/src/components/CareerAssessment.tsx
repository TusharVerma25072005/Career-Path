import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';



//modify questions here - - - - - -


// const questions = [
//   // Family Background
//   {
//     id: "education_level",
//     question: "Education Level",
//     options: [
//       { value: "10th", label: "10th grade" },
//       { value: "12th", label: "12th grade" },
//       { value: "undergraduate", label: "Undergraduate (Bachelor’s)" }
//     ]
//   },
//   {
//     id: "school_board",
//     question: "School Board/Curriculum",
//     options: [
//       { value: "CBSE", label: "CBSE" },
//       { value: "ICSE", label: "ICSE" },
//       { value: "State", label: "State Board" },
//       { value: "IB", label: "IB" },
//       { value: "Other", label: "Other" }
//     ]
//   },
//   {
//     id: "residence",
//     question: "Place of Residence",
//     options: [
//       { value: "urban", label: "Urban" },
//       { value: "semi_urban", label: "Semi-urban" },
//       { value: "rural", label: "Rural" }
//     ]
//   },
//   {
//     id: "family_type",
//     question: "Family Type",
//     options: [
//       { value: "nuclear", label: "Nuclear family" },
//       { value: "joint", label: "Joint family" },
//       { value: "single_parent", label: "Single-parent family" },
//       { value: "other", label: "Other" }
//     ]
//   },
//   {
//     id: "father_education",
//     question: "Father’s Education Level",
//     options: [
//       { value: "none", label: "No formal education" },
//       { value: "primary", label: "Primary (up to 5th)" },
//       { value: "secondary", label: "Secondary (6th–10th)" },
//       { value: "higher_secondary", label: "Higher Secondary (11th–12th)" },
//       { value: "graduate", label: "Graduate" },
//       { value: "postgraduate", label: "Postgraduate or higher" }
//     ]
//   },
//   {
//     id: "mother_education",
//     question: "Mother’s Education Level",
//     options: [
//       { value: "none", label: "No formal education" },
//       { value: "primary", label: "Primary (up to 5th)" },
//       { value: "secondary", label: "Secondary (6th–10th)" },
//       { value: "higher_secondary", label: "Higher Secondary (11th–12th)" },
//       { value: "graduate", label: "Graduate" },
//       { value: "postgraduate", label: "Postgraduate or higher" }
//     ]
//   },
//   {
//     id: "monthly_income",
//     question: "Monthly Household Income",
//     options: [
//       { value: "<10000", label: "<₹10,000" },
//       { value: "10000_25000", label: "₹10,000–₹25,000" },
//       { value: "25000_50000", label: "₹25,000–₹50,000" },
//       { value: "50000_100000", label: "₹50,000–₹100,000" },
//       { value: ">100000", label: ">₹100,000" }
//     ]
//   },
//   {
//     id: "siblings",
//     question: "Number of Siblings",
//     options: [
//       { value: "0", label: "0" },
//       { value: "1", label: "1" },
//       { value: "2", label: "2" },
//       { value: "3+", label: "3 or more" }
//     ]
//   },

//   // Academic Record & Skills
//   {
//     id: "academic_stream",
//     question: "Academic Stream/Major",
//     options: [
//       { value: "science_math", label: "Science – Mathematics/Engineering" },
//       { value: "science_bio", label: "Science – Biology/Medical" },
//       { value: "commerce", label: "Commerce" },
//       { value: "humanities", label: "Humanities/Arts" },
//       { value: "vocational", label: "Vocational/Technical" },
//       { value: "other", label: "Other" }
//     ]
//   },
//   {
//     id: "latest_score",
//     question: "Latest Exam Score",
//     options: [
//       { value: "<50", label: "<50%" },
//       { value: "50_60", label: "50–60%" },
//       { value: "60_70", label: "60–70%" },
//       { value: "70_80", label: "70–80%" },
//       { value: "80_90", label: "80–90%" },
//       { value: ">90", label: ">90%" }
//     ]
//   },
//   {
//     id: "extracurricular",
//     question: "Extracurricular Participation",
//     options: [
//       { value: "science_olympiad", label: "Science Olympiad/Quiz" },
//       { value: "math_olympiad", label: "Math Olympiad/Quiz" },
//       { value: "debate", label: "Debate/Quiz competitions" },
//       { value: "sports", label: "Sports tournaments" },
//       { value: "cultural", label: "Cultural competitions (music/art)" },
//       { value: "none", label: "None of the above" }
//     ]
//   },

//   // Career Clarity & Exploration Behavior
//   {
//     id: "clarity_goals",
//     question: "I have a clear idea of which career path I want.",
//     options: [
//       { value: "1", label: "1" },
//       { value: "2", label: "2" },
//       { value: "3", label: "3" },
//       { value: "4", label: "4" },
//       { value: "5", label: "5" }
//     ]
//   },
//   {
//     id: "career_research",
//     question: "I have actively researched different career options that match my interests.",
//     options: [
//       { value: "1", label: "1" },
//       { value: "2", label: "2" },
//       { value: "3", label: "3" },
//       { value: "4", label: "4" },
//       { value: "5", label: "5" }
//     ]
//   },
//   {
//     id: "decision_confidence",
//     question: "I feel confident about making decisions for my future career.",
//     options: [
//       { value: "1", label: "1" },
//       { value: "2", label: "2" },
//       { value: "3", label: "3" },
//       { value: "4", label: "4" },
//       { value: "5", label: "5" }
//     ]
//   },
//   {
//     id: "exploration_activity",
//     question: "I regularly explore new fields, industries, or occupations.",
//     options: [
//       { value: "1", label: "1" },
//       { value: "2", label: "2" },
//       { value: "3", label: "3" },
//       { value: "4", label: "4" },
//       { value: "5", label: "5" }
//     ]
//   },
//   {
//     id: "career_discussions",
//     question: "I regularly discuss my career plans with a counselor, mentor, or teacher.",
//     options: [
//       { value: "1", label: "1" },
//       { value: "2", label: "2" },
//       { value: "3", label: "3" },
//       { value: "4", label: "4" },
//       { value: "5", label: "5" }
//     ]
//   },
//   {
//     id: "career_resources",
//     question: "Which of these have you used for career information?",
//     options: [
//       { value: "counselor", label: "School counselor/teacher" },
//       { value: "parents", label: "Parents/Family" },
//       { value: "internet", label: "Internet/Online resources" },
//       { value: "friends", label: "Friends/Peer groups" },
//       { value: "fairs", label: "Career fairs or workshops" },
//       { value: "none", label: "None of the above" }
//     ]
//   },
//   {
//     id: "career_assessment",
//     question: "Have you taken any formal career aptitude or interest tests?",
//     options: [
//       { value: "yes", label: "Yes" },
//       { value: "no", label: "No" }
//     ]
//   },

//   // Interests & Motivations
//   {
//     id: "personal_interests",
//     question: "What activities or subjects do you enjoy outside of academics?",
//     options: [
//       { value: "sports", label: "Sports/Athletics" },
//       { value: "music", label: "Music/Arts" },
//       { value: "computers", label: "Computers/Programming" },
//       { value: "reading", label: "Reading/Writing" },
//       { value: "debate", label: "Debate/Quizzing" },
//       { value: "volunteering", label: "Community Service/Volunteering" },
//       { value: "entrepreneurship", label: "Entrepreneurship (science fairs, projects)" },
//       { value: "none", label: "None of these" }
//     ]
//   },
//   {
//     id: "motivating_factors",
//     question: "What motivates your career choices?",
//     options: [
//       { value: "salary", label: "High salary/financial security" },
//       { value: "challenge", label: "Intellectual challenge/learning" },
//       { value: "helping", label: "Helping society/community" },
//       { value: "creative", label: "Creative expression/innovation" },
//       { value: "family", label: "Family expectations/tradition" },
//       { value: "stability", label: "Job stability/security" },
//       { value: "passion", label: "Pursuing personal passion" },
//       { value: "other", label: "Other" }
//     ]
//   },
//   {
//     id: "self_motivation",
//     question: "I am self-motivated to pursue my learning and interests.",
//     options: [
//       { value: "1", label: "1" },
//       { value: "2", label: "2" },
//       { value: "3", label: "3" },
//       { value: "4", label: "4" },
//       { value: "5", label: "5" }
//     ]
//   },
//   {
//     id: "problem_solving_interest",
//     question: "I enjoy solving complex problems or puzzles.",
//     options: [
//       { value: "1", label: "1" },
//       { value: "2", label: "2" },
//       { value: "3", label: "3" },
//       { value: "4", label: "4" },
//       { value: "5", label: "5" }
//     ]
//   },
//   {
//     id: "interest_alignment",
//     question: "I prefer to work on tasks that align with my personal interests.",
//     options: [
//       { value: "1", label: "1" },
//       { value: "2", label: "2" },
//       { value: "3", label: "3" },
//       { value: "4", label: "4" },
//       { value: "5", label: "5" }
//     ]
//   },
//   {
//     id: "goal_persistence",
//     question: "I set ambitious goals and work persistently to achieve them.",
//     options: [
//       { value: "1", label: "1" },
//       { value: "2", label: "2" },
//       { value: "3", label: "3" },
//       { value: "4", label: "4" },
//       { value: "5", label: "5" }
//     ]
//   },

//   // Personality Traits
//   {
//     id: "personality_persistence",
//     question: "I persist in tasks until they are completed, even if they become difficult.",
//     options: [
//       { value: "1", label: "1" },
//       { value: "2", label: "2" },
//       { value: "3", label: "3" },
//       { value: "4", label: "4" },
//       { value: "5", label: "5" }
//     ]
//   },
//   {
//     id: "personality_setbacks",
//     question: "Setbacks and failures do not discourage me easily.",
//     options: [
//       { value: "1", label: "1" },
//       { value: "2", label: "2" },
//       { value: "3", label: "3" },
//       { value: "4", label: "4" },
//       { value: "5", label: "5" }
//     ]
//   },
//   {
//     id: "personality_schedule",
//     question: "I am someone who follows a schedule and routines.",
//     options: [
//       { value: "1", label: "1" },
//       { value: "2", label: "2" },
//       { value: "3", label: "3" },
//       { value: "4", label: "4" },
//       { value: "5", label: "5" }
//     ]
//   },
//   {
//     id: "personality_planned_work",
//     question: "I prefer planned and structured work to spontaneous or unpredictable tasks.",
//     options: [
//       { value: "1", label: "1" },
//       { value: "2", label: "2" },
//       { value: "3", label: "3" },
//       { value: "4", label: "4" },
//       { value: "5", label: "5" }
//     ]
//   },
//   {
//     id: "personality_risk",
//     question: "I enjoy tackling new challenges, even if they involve some risk.",
//     options: [
//       { value: "1", label: "1" },
//       { value: "2", label: "2" },
//       { value: "3", label: "3" },
//       { value: "4", label: "4" },
//       { value: "5", label: "5" }
//     ]
//   },
//   {
//     id: "personality_avoid_loss",
//     question: "I avoid situations where I might lose money or reputation.",
//     options: [
//       { value: "1", label: "1" },
//       { value: "2", label: "2" },
//       { value: "3", label: "3" },
//       { value: "4", label: "4" },
//       { value: "5", label: "5" }
//     ]
//   },
//   {
//     id: "personality_creativity",
//     question: "I often come up with creative or innovative solutions to problems.",
//     options: [
//       { value: "1", label: "1" },
//       { value: "2", label: "2" },
//       { value: "3", label: "3" },
//       { value: "4", label: "4" },
//       { value: "5", label: "5" }
//     ]
//   },
//   {
//     id: "personality_teamwork",
//     question: "I work well as part of a team and enjoy collaborating with others.",
//     options: [
//       { value: "1", label: "1" },
//       { value: "2", label: "2" },
//       { value: "3", label: "3" },
//       { value: "4", label: "4" },
//       { value: "5", label: "5" }
//     ]
//   },
//   {
//     id: "personality_calm",
//     question: "I feel calm when dealing with unexpected changes or stress.",
//     options: [
//       { value: "1", label: "1" },
//       { value: "2", label: "2" },
//       { value: "3", label: "3" },
//       { value: "4", label: "4" },
//       { value: "5", label: "5" }
//     ]
//   },
//   {
//     id: "personality_decision",
//     question: "I make decisions confidently and quickly, without over-analyzing.",
//     options: [
//       { value: "1", label: "1" },
//       { value: "2", label: "2" },
//       { value: "3", label: "3" },
//       { value: "4", label: "4" },
//       { value: "5", label: "5" }
//     ]
//   },

//   // Parent/Guardian Expectations
//   {
//     id: "education_expectation",
//     question: "What minimum education do your parents/guardians expect you to achieve?",
//     options: [
//       { value: "highschool", label: "High School diploma" },
//       { value: "bachelor", label: "Bachelor’s degree" },
//       { value: "master", label: "Master’s degree" },
//       { value: "professional", label: "Professional degree (e.g. MBBS, Engineering)" },
//       { value: "none", label: "No specific expectation" }
//     ]
//   },
//   {
//     id: "career_preference",
//     question: "Which career fields do your parents/guardians prefer for you?",
//     options: [
//       { value: "medical", label: "Medical/Healthcare" },
//       { value: "engineering", label: "Engineering/Technology" },
//       { value: "business", label: "Business/Management" },
//       { value: "government", label: "Government/Civil Service" },
//       { value: "arts", label: "Arts/Education" },
//       { value: "other", label: "Other" },
//       { value: "none", label: "No preference" }
//     ]
//   },
//   {
//     id: "parental_support",
//     question: "My parents/guardians support the career path I want to pursue.",
//     options: [
//       { value: "1", label: "1" },
//       { value: "2", label: "2" },
//       { value: "3", label: "3" },
//       { value: "4", label: "4" },
//       { value: "5", label: "5" }
//     ]
//   },
//   {
//     id: "parental_pressure",
//     question: "My parents/guardians expect me to pursue a specific career path.",
//     options: [
//       { value: "1", label: "1" },
//       { value: "2", label: "2" },
//       { value: "3", label: "3" },
//       { value: "4", label: "4" },
//       { value: "5", label: "5" }
//     ]
//   },
//   {
//     id: "parental_involvement",
//     question: "My parents/guardians frequently discuss my future career plans with me.",
//     options: [
//       { value: "1", label: "1" },
//       { value: "2", label: "2" },
//       { value: "3", label: "3" },
//       { value: "4", label: "4" },
//       { value: "5", label: "5" }
//     ]
//   },

//   // Constraints (Location, Cost, Time)
//   {
//     id: "willingness_relocate",
//     question: "Which locations are you willing to consider for further study or work?",
//     options: [
//       { value: "current_city", label: "My current city/town" },
//       { value: "other_cities", label: "Other cities in my state" },
//       { value: "other_states", label: "Other states in India" },
//       { value: "abroad", label: "Abroad" }
//     ]
//   },
//   {
//     id: "financial_constraints",
//     question: "My family’s financial situation strongly limits my choice of courses or colleges.",
//     options: [
//       { value: "1", label: "1" },
//       { value: "2", label: "2" },
//       { value: "3", label: "3" },
//       { value: "4", label: "4" },
//       { value: "5", label: "5" }
//     ]
//   },
//   {
//     id: "cost_importance",
//     question: "The cost of education (tuition, fees) is a major factor in my decision-making.",
//     options: [
//       { value: "1", label: "1" },
//       { value: "2", label: "2" },
//       { value: "3", label: "3" },
//       { value: "4", label: "4" },
//       { value: "5", label: "5" }
//     ]
//   },
//   {
//     id: "time_constraints",
//     question: "Personal or family responsibilities limit the time I can devote to further education.",
//     options: [
//       { value: "1", label: "1" },
//       { value: "2", label: "2" },
//       { value: "3", label: "3" },
//       { value: "4", label: "4" },
//       { value: "5", label: "5" }
//     ]
//   },
//   {
//     id: "urgency",
//     question: "I prefer shorter-duration courses or programs to complete my education quickly.",
//     options: [
//       { value: "1", label: "1" },
//       { value: "2", label: "2" },
//       { value: "3", label: "3" },
//       { value: "4", label: "4" },
//       { value: "5", label: "5" }
//     ]
//   }
// ];
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