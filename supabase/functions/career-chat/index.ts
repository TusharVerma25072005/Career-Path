// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get request data
    const { message, assessmentData, userId } = await req.json()

    if (!message || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: message, userId' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 1. Check user chat limit
    const { data: usageData, error: usageError } = await supabaseClient
      .rpc('increment_user_chat_count', { user_uuid: userId })

    if (usageError) {
      console.error('Error checking chat usage:', usageError)
      // Continue anyway - don't block on usage tracking
    }

    // If limit exceeded, return error
    if (usageData?.limit_exceeded) {
      return new Response(
        JSON.stringify({ 
          error: 'Chat limit exceeded',
          message: 'You have reached the maximum of 5 free chat requests. Please upgrade your plan for unlimited access.',
          limit_exceeded: true,
          chat_count: usageData.chat_count,
          remaining: usageData.remaining
        }),
        { 
          status: 429, // Too Many Requests
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 2. Store user message in database
    const { error: userMessageError } = await supabaseClient
      .from('chat_messages')
      .insert({
        user_id: userId,
        content: message,
        is_user: true
      })

    if (userMessageError) {
      console.error('Error storing user message:', userMessageError)
      throw new Error('Failed to store user message')
    }

    // 2. Prepare system prompt with assessment data
    const systemPrompt = `You are a career guidance counselor. ${
      assessmentData 
        ? `The user completed a career assessment with these results: ${assessmentData}.` 
        : 'The user has not completed a career assessment yet.'
    } 
    
    Provide helpful, personalized career advice based on their assessment results (if available), current job market trends, and skill development recommendations. 
    Keep responses conversational, encouraging, and actionable. Limit responses to 200 words and provide response in purely markdown format.`

    // 3. Call Google Gemini API
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser: ${message}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 1,
          topP: 1,
          maxOutputTokens: 300,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    })

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text()
      console.error('Gemini API error:', errorData)
      throw new Error('Failed to get AI response from Gemini')
    }

    const geminiData = await geminiResponse.json()
    const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiResponse) {
      console.error('Gemini response structure:', JSON.stringify(geminiData, null, 2))
      throw new Error('No response from Gemini AI')
    }

    // 4. Store AI response in database
    const { error: aiMessageError } = await supabaseClient
      .from('chat_messages')
      .insert({
        user_id: userId,
        content: aiResponse,
        is_user: false
      })

    if (aiMessageError) {
      console.error('Error storing AI message:', aiMessageError)
      throw new Error('Failed to store AI response')
    }

    // 5. Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Chat message processed successfully',
        aiResponse: aiResponse,
        usage: {
          chat_count: usageData?.chat_count || 0,
          remaining: usageData?.remaining || 5,
          limit_exceeded: usageData?.limit_exceeded || false
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
