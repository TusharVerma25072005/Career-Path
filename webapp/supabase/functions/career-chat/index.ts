import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const sessionId = body?.sessionId;
    const message = body?.message;

    if (!sessionId || !message)
      return new Response(JSON.stringify({ error: "Missing sessionId or message" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    const GEMINI_API_KEY = Deno.env.get("VITE_GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const authHeader = req.headers.get("Authorization") ?? "";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Fetch session with assessment
    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .select(`*, assessment:assessments(*)`)
      .eq("id", sessionId)
      .single();

    if (sessionError) throw sessionError;

    // Fetch chat history
    const { data: messages, error: messagesError } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (messagesError) throw messagesError;

    const assessment = session.assessment as any;

    // Construct system prompt
    const systemPrompt = `You are a helpful career guidance AI assistant. You're chatting with a student about their career assessment results.

Career Recommendation:
- Primary Career: ${assessment.career_details.primaryCareer}
- Career Cluster: ${assessment.career_cluster}
- Description: ${assessment.career_details.description}
- Salary Range: ${assessment.career_details.salaryRange}
- Growth Outlook: ${assessment.career_details.growthOutlook}
- Education Required: ${assessment.career_details.educationRequired}

Key Skills Needed:
${assessment.career_details.keySkills?.join(", ") || "N/A"}

Student Assessment Summary:
- Academic Stream: ${assessment.responses?.academicStream || "N/A"}
- Field of Interest: ${assessment.responses?.fieldOfInterest || "N/A"}
- Verbal Aptitude: ${assessment.responses?.verbalAptitude || "N/A"}/10
- Quantitative Aptitude: ${assessment.responses?.quantitativeAptitude || "N/A"}/10
- Creativity: ${assessment.responses?.creativity || "N/A"}/10

Guidelines:
- Provide personalized career guidance based on their assessment
- Answer questions about the recommended career path
- Suggest specific skills to develop, courses to take, and actionable steps
- Be realistic and concise (2-4 paragraphs max)
- Reference alternative careers if asked
- Help with education planning, skill development, and career roadmap`;

    // Build conversation history for Gemini
    const conversationHistory = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Add the current user message
    conversationHistory.push({ role: "user", parts: [{ text: message }] });

    // Call Google GenAI REST API
    const genaiResponseRaw = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-exp:generateContent",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: systemPrompt + "\n\nUser Message:\n" + message,
          temperature: 0.7,
          maxOutputTokens: 2048,
        }),
      }
    );

    const genaiData = await genaiResponseRaw.json();
    const assistantMessage = genaiData?.candidates?.[0]?.content;
    if (!assistantMessage) throw new Error("No response generated from Gemini API");

    // Save messages in Supabase
    const { error: insertError } = await supabase.from("chat_messages").insert([
      { session_id: sessionId, role: "user", content: message },
      { session_id: sessionId, role: "assistant", content: assistantMessage },
    ]);

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ message: assistantMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in career-chat:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
