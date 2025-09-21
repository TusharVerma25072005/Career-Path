-- Simple setup script for user assessment limits
-- Run this in your Supabase Dashboard SQL Editor

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.user_assessment_usage (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
    assessment_count integer DEFAULT 0 NOT NULL,
    last_assessment_at timestamptz,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.user_assessment_usage ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
DROP POLICY IF EXISTS "Users can view their own usage" ON public.user_assessment_usage;
CREATE POLICY "Users can view their own usage" ON public.user_assessment_usage
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own usage" ON public.user_assessment_usage;
CREATE POLICY "Users can update their own usage" ON public.user_assessment_usage
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Create index
CREATE INDEX IF NOT EXISTS idx_user_assessment_usage_user_id ON public.user_assessment_usage(user_id);

-- 5. Check if table was created successfully
SELECT 'Table created successfully!' as status, 
       COUNT(*) as row_count 
FROM public.user_assessment_usage;