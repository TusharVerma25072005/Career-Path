
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req : any) => {
  console.log('Career chat function called with method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting chat function processing...');
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get request data
    const { message, assessmentData, userId, assessmentId } = await req.json()

    if (!message || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: message, userId' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Processing chat request for user:', userId, 'assessmentId:', assessmentId);

    // Store user message in database - try assessment_chat_messages first, fallback to chat_messages
    let userMessageError;
    if (assessmentId) {
      // Try to store in assessment-specific table
      const { error } = await supabaseClient
        .from('assessment_chat_messages')
        .insert({
          user_id: userId,
          assessment_id: assessmentId,
          content: message,
          is_user: true
        });
      userMessageError = error;
      
      if (userMessageError) {
        console.log('assessment_chat_messages failed, trying chat_messages:', userMessageError.message);
        // Fallback to general chat table
        const { error: fallbackError } = await supabaseClient
          .from('chat_messages')
          .insert({
            user_id: userId,
            content: message,
            is_user: true
          });
        userMessageError = fallbackError;
      }
    } else {
      // No assessment ID, use general chat table
      const { error } = await supabaseClient
        .from('chat_messages')
        .insert({
          user_id: userId,
          content: message,
          is_user: true
        });
      userMessageError = error;
    }

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

    // Store AI response in database - try assessment_chat_messages first, fallback to chat_messages
    let aiMessageError;
    if (assessmentId) {
      // Try to store in assessment-specific table
      const { error } = await supabaseClient
        .from('assessment_chat_messages')
        .insert({
          user_id: userId,
          assessment_id: assessmentId,
          content: aiResponse,
          is_user: false
        });
      aiMessageError = error;
      
      if (aiMessageError) {
        console.log('assessment_chat_messages failed for AI response, trying chat_messages:', aiMessageError.message);
        // Fallback to general chat table
        const { error: fallbackError } = await supabaseClient
          .from('chat_messages')
          .insert({
            user_id: userId,
            content: aiResponse,
            is_user: false
          });
        aiMessageError = fallbackError;
      }
    } else {
      // No assessment ID, use general chat table
      const { error } = await supabaseClient
        .from('chat_messages')
        .insert({
          user_id: userId,
          content: aiResponse,
          is_user: false
        });
      aiMessageError = error;
    }

    if (aiMessageError) {
      console.error('Error storing AI message:', aiMessageError)
      throw new Error('Failed to store AI response')
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Chat message processed successfully',
        aiResponse: aiResponse
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
