import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Send, Bot, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import MarkdownContent from "@/components/MarkdownContent";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const Chat = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSession();
    loadMessages();
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const loadSession = async () => {
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*, assessment:assessments(*)')
        .eq('id', sessionId)
        .eq('user_id', authSession.user.id)
        .single();

      if (error) throw error;
      setSession(data);
    } catch (error) {
      console.error('Error loading session:', error);
      toast({
        title: "Error",
        description: "Failed to load chat session",
        variant: "destructive",
      });
      navigate('/dashboard');
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as Message[]);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    // Add user message optimistically
    const tempMessage: Message = {
      id: 'temp',
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const { data, error } = await supabase.functions.invoke('career-chat', {
        body: { sessionId, message: userMessage }
      });

      if (error) throw error;

      // Reload messages to get both user and assistant messages
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== 'temp'));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (session?.assessment) {
      navigate(`/results/${session.assessment.id}`);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={handleBack} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Results
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Career Guidance Chat</h1>
            <p className="text-sm text-muted-foreground">
              Chat with our AI assistant about your career assessment results and get personalized guidance.
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="container max-w-4xl mx-auto px-4 h-full">
          <ScrollArea className="h-[calc(100vh-280px)] py-6" ref={scrollRef}>
            {messages.length === 0 ? (
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Bot className="h-8 w-8" />
                    <CardTitle>Start Your Career Conversation</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Ask me anything about your career assessment, job market trends, skill development, or steps to achieve your goals.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Example questions:
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-2">
                    <li>What courses should I take to become a {session?.assessment?.primary_career}?</li>
                    <li>What's the job market like for this career?</li>
                    <li>How can I build a portfolio?</li>
                  </ul>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        <Bot className="h-5 w-5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <MarkdownContent content={message.content} />
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                        <UserIcon className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-muted-foreground">Thinking...</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={sendMessage} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your career assessment, job market trends, skill development..."
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;