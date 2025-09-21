-- Create chat_messages table
CREATE TABLE public.chat_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    content text NOT NULL,
    is_user boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_messages
CREATE POLICY "Users can view their own chat messages" ON public.chat_messages
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages" ON public.chat_messages
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can insert chat messages" ON public.chat_messages
    FOR INSERT TO service_role
    WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_messages_updated_at 
    BEFORE UPDATE ON public.chat_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_chat_messages_user_id_created_at ON public.chat_messages(user_id, created_at DESC);
