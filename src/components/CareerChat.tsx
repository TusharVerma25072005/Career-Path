import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Send, MessageCircle, Bot, User, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  content: string;
  is_user: boolean;
  created_at: string;
}

interface CareerChatProps {
  assessmentData: string;
  onBack: () => void;
}

export function CareerChat({ assessmentData, onBack }: CareerChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const loadChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast({
        title: "Error loading chat history",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage = newMessage.trim();
    setNewMessage('');
    setIsLoading(true);

    // Add user message to UI immediately
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      content: userMessage,
      is_user: true,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('career-chat', {
        body: {
          message: userMessage,
          assessmentData: assessmentData,
          userId: user?.id
        }
      });

      if (error) throw error;

      // Remove temp message and add real messages
      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
      
      // Reload messages to get the latest from database
      await loadChatHistory();

    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
      
      toast({
        title: "Error sending message",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl">
        <Card className="h-[80vh] flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <CardTitle>Career Guidance Chat</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Results
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Chat with our AI assistant about your career assessment results and get personalized guidance.
            </p>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col gap-4 min-h-0">
            <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
              <div className="space-y-4">
                {loadingMessages ? (
                  <div className="flex justify-center p-4">
                    <p className="text-muted-foreground">Loading chat history...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Start Your Career Conversation</h3>
                    <p className="text-muted-foreground max-w-md">
                      Ask me anything about your career assessment results, potential career paths, 
                      skills development, or job market insights.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.is_user ? 'justify-end' : 'justify-start'}`}
                    >
                      {!message.is_user && (
                        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.is_user
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {message.is_user ? (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          <div className="chat-markdown">
                            <ReactMarkdown
                              components={{
                                // Simplified components using our custom CSS
                                p: ({ children }) => <p>{children}</p>,
                                ul: ({ children }) => <ul className="list-disc list-inside">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal list-inside">{children}</ol>,
                                li: ({ children }) => <li>{children}</li>,
                                strong: ({ children }) => <strong>{children}</strong>,
                                em: ({ children }) => <em>{children}</em>,
                                code: ({ children }) => <code>{children}</code>,
                                h1: ({ children }) => <h1>{children}</h1>,
                                h2: ({ children }) => <h2>{children}</h2>,
                                h3: ({ children }) => <h3>{children}</h3>,
                                blockquote: ({ children }) => <blockquote>{children}</blockquote>,
                                hr: ({ children }) => <hr>{children}</hr>,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        )}
                        <p className={`text-xs mt-2 opacity-70`}>
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      {message.is_user && (
                        <div className="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-secondary-foreground" />
                        </div>
                      )}
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="bg-muted text-muted-foreground p-3 rounded-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex-shrink-0 flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your career assessment, job market trends, skill development..."
                className="resize-none"
                rows={3}
                disabled={isLoading}
              />
              <Button 
                onClick={sendMessage}
                disabled={!newMessage.trim() || isLoading}
                size="lg"
                className="px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}