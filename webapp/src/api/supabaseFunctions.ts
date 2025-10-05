const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

async function callSupabaseFunction(functionName: string, payload: any) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Function ${functionName} failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function analyzeAssessment(assessmentData: any) {
  return callSupabaseFunction("analyze-assessment", { assessmentData });
}

export async function careerChat(sessionId: string, message: string) {
  return callSupabaseFunction("career-chat", { sessionId, message });
}
