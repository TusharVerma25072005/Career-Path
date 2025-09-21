-- Create the update_updated_at_column function first
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language plpgsql;

-- Create user_assessment_usage table to track career assessment limits
CREATE TABLE public.user_assessment_usage (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
    assessment_count integer DEFAULT 0 NOT NULL,
    last_assessment_at timestamptz,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.user_assessment_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own usage" ON public.user_assessment_usage
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage" ON public.user_assessment_usage
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Create updated_at trigger
CREATE TRIGGER update_user_assessment_usage_updated_at 
    BEFORE UPDATE ON public.user_assessment_usage 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_user_assessment_usage_user_id ON public.user_assessment_usage(user_id);

-- Create function to increment assessment count
CREATE OR REPLACE FUNCTION increment_user_assessment_count(user_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_count integer;
    usage_record record;
BEGIN
    -- Insert or update assessment usage
    INSERT INTO public.user_assessment_usage (user_id, assessment_count, last_assessment_at)
    VALUES (user_uuid, 1, now())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        assessment_count = user_assessment_usage.assessment_count + 1,
        last_assessment_at = now(),
        updated_at = now()
    RETURNING * INTO usage_record;
    
    -- Return the usage information
    RETURN json_build_object(
        'assessment_count', usage_record.assessment_count,
        'limit_exceeded', usage_record.assessment_count > 5,
        'remaining', GREATEST(0, 5 - usage_record.assessment_count)
    );
END;
$$;
