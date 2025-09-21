import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req :any) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Career Recommendations Function Started ===');
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    console.log('Supabase client created');

    // Get user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      console.error('User auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('User authenticated:', user.id);

    // Check user's assessment usage and increment count
    console.log('Calling increment_user_assessment_count function...');
    const { data: usageData, error: usageError } = await supabaseClient
      .rpc('increment_user_assessment_count', { user_uuid: user.id })

    if (usageError) {
      console.error('Usage check error:', usageError)
      return new Response(
        JSON.stringify({ error: 'Failed to check usage limits', details: usageError }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Usage data:', usageData);

    // Check if user exceeded the limit
    if (usageData.limit_exceeded) {
      console.log('User exceeded limit');
      return new Response(
        JSON.stringify({ 
          error: 'Assessment limit exceeded', 
          message: 'You have reached your limit of 5 free career assessments. Please upgrade to continue.',
          usage: usageData
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get assessment answers from request body
    const { answers } = await req.json()
    console.log('Assessment answers received:', answers);

    if (!answers) {
      return new Response(
        JSON.stringify({ error: 'Assessment answers are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Generate career recommendations using Google Gemini
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    console.log('Gemini API Key exists:', !!geminiApiKey);
    
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create a detailed prompt based on the answers
    const prompt = `Based on the following career assessment answers, provide personalized career recommendations in a structured JSON format:

Work Environment Preference: ${answers.work_environment}
Work Style Preference: ${answers.work_style}
Interest Area: ${answers.interests}
Problem Solving Style: ${answers.problem_solving}
Career Goals: ${answers.career_goals}

Please respond with a JSON object in this exact format:
{
  "primaryCareer": {
    "title": "Main career recommendation",
    "description": "Detailed description of why this career fits",
    "salary": "Expected salary range",
    "growth": "Growth prospects",
    "education": "Required education/qualifications"
  },
  "alternativeCareers": [
    {
      "title": "Alternative career 1",
      "description": "Brief description"
    },
    {
      "title": "Alternative career 2", 
      "description": "Brief description"
    }
  ],
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "nextSteps": ["step1", "step2", "step3", "step4"],
  "reasoning": "Explanation of why these recommendations match the user's preferences"
}

Respond only with valid JSON, no additional text.`

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    )

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.statusText}`)
    }

    const geminiData = await geminiResponse.json()
    const recommendations = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!recommendations) {
      throw new Error('No recommendations generated')
    }

    return new Response(
      JSON.stringify({ 
        recommendations,
        usage: usageData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})