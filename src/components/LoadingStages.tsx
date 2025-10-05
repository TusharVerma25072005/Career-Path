import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Brain, Target, Sparkles, CheckCircle2 } from "lucide-react";

const stages = [
  { text: "Analyzing your responses", icon: Brain, duration: 2000 },
  { text: "Calculating career clusters", icon: Target, duration: 2500 },
  { text: "Identifying optimal matches", icon: Sparkles, duration: 2000 },
  { text: "Assigning your career cluster", icon: CheckCircle2, duration: 2000 },
  { text: "Curating personalized recommendations", icon: Sparkles, duration: 3000 },
];

const LoadingStages = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0);
    let elapsedTime = 0;

    const progressInterval = setInterval(() => {
      elapsedTime += 50;
      const newProgress = Math.min((elapsedTime / totalDuration) * 100, 100);
      setProgress(newProgress);
    }, 50);

    const stageTimers = stages.reduce((timers, _, index) => {
      const delay = stages.slice(0, index).reduce((sum, stage) => sum + stage.duration, 0);
      timers.push(
        setTimeout(() => {
          setCurrentStage(index);
        }, delay)
      );
      return timers;
    }, [] as NodeJS.Timeout[]);

    return () => {
      clearInterval(progressInterval);
      stageTimers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4">
        <CardContent className="pt-8 pb-8">
          <div className="space-y-6">
            {/* Main heading */}
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Processing Your Assessment</h2>
              <p className="text-sm text-muted-foreground">
                Our AI is analyzing your responses to find the perfect career match
              </p>
            </div>

            {/* Progress bar */}
            <Progress value={progress} className="h-2" />

            {/* Stages list */}
            <div className="space-y-3">
              {stages.map((stage, index) => {
                const Icon = stage.icon;
                const isActive = index === currentStage;
                const isComplete = index < currentStage;

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                      isActive
                        ? "bg-primary/10 scale-105"
                        : isComplete
                        ? "bg-muted/50"
                        : "opacity-40"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isComplete
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isActive ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-medium transition-colors ${
                          isActive
                            ? "text-foreground"
                            : isComplete
                            ? "text-muted-foreground"
                            : "text-muted-foreground/50"
                        }`}
                      >
                        {stage.text}
                      </p>
                    </div>
                    {isComplete && (
                      <CheckCircle2 className="h-5 w-5 text-primary animate-in zoom-in" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Fun fact or tip */}
            <div className="text-center pt-4 border-t">
              <p className="text-xs text-muted-foreground italic">
                💡 Did you know? Your unique combination of skills and interests makes you one-of-a-kind!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingStages;
