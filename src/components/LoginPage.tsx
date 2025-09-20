import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/AuthProvider';
import { Briefcase, LogIn } from 'lucide-react';

export function LoginPage() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Briefcase className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Career Path Advisor</CardTitle>
          <CardDescription>
            Discover your ideal career path through our personalized assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={signInWithGoogle} 
            className="w-full"
            size="lg"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}