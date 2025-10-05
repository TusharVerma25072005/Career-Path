import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const parsedBody = await req.json();
    const assessmentData = parsedBody?.assessmentData;

    try {
      console.log(
        "Incoming analyze-assessment request body:",
        JSON.stringify(assessmentData ?? parsedBody).slice(0, 2000)
      );
    } catch {
      console.log("Incoming analyze-assessment: [unserializable payload]");
    }

    if (!assessmentData) {
      return new Response(
        JSON.stringify({ error: "Missing assessmentData in request" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("VITE_GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    console.log("Analyzing comprehensive assessment data");

    // --------------------------
    // Step 1: Determine Career Cluster
    // --------------------------
    const clusterPrompt = `You are a career counselor AI analyzing student assessment data. Based on the following comprehensive assessment, determine the most suitable career cluster.

Assessment Data:
- Age: ${assessmentData.age}
- Grade Level: ${assessmentData.gradeLevel}
- Academic Stream: ${assessmentData.academicStream}
- Disability: ${assessmentData.disability}
- Hobbies: ${assessmentData.hobbies?.join(", ")}
- Family Income: ${assessmentData.familyIncome}
- Parental Expectation: ${assessmentData.parentalExpectation}
- Parental Interest Level: ${assessmentData.parentalInterest}/10
- Verbal Aptitude: ${assessmentData.verbalAptitude}/10
- Quantitative Aptitude: ${assessmentData.quantitativeAptitude}/10
- Creativity: ${assessmentData.creativity}/10
- Teamwork: ${assessmentData.teamwork}/10
- Openness: ${assessmentData.openness}/10
- Field of Interest: ${assessmentData.fieldOfInterest}
- Expected Salary: ${assessmentData.expectedSalary}
- Work Arrangement: ${assessmentData.workArrangement}
- International Work: ${assessmentData.internationalWork}
- English Score: ${assessmentData.englishScore}/100
- Math Score: ${assessmentData.mathScore || "N/A"}/100
- Science Score: ${assessmentData.scienceScore || "N/A"}/100
- Psychometric Test: ${assessmentData.psychometricTest}
- Psychometric Score: ${assessmentData.psychometricScore || "N/A"}

Respond with ONLY the career cluster name from this list:
- STEM (Science, Technology, Engineering, Mathematics)
- Healthcare & Life Sciences
- Business & Finance
- Arts & Creative Industries
- Social Sciences & Education
- Law & Public Service
- Skilled Trades & Technical Services

Respond ONLY with the cluster name.`;

    const clusterResponseRaw = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-exp:generateContent",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: clusterPrompt,
          temperature: 0.7,
          maxOutputTokens: 2048,
        }),
      }
    );

    const clusterResponseData = await clusterResponseRaw.json();
    const careerCluster = clusterResponseData?.candidates?.[0]?.content?.trim();

    if (!careerCluster) throw new Error("Career cluster missing from model response");
    console.log("Determined cluster:", careerCluster);

    // --------------------------
    // Step 2: Detailed Career Recommendation
    // --------------------------
    const recommendationPrompt = `You are a career counselor AI. Based on the assessment data and the determined career cluster "${careerCluster}", provide a detailed career recommendation.

Assessment Summary:
- Career Cluster: ${careerCluster}
- Primary Strengths: ${
      assessmentData.verbalAptitude > 7 ? "Verbal, " : ""
    }${assessmentData.quantitativeAptitude > 7 ? "Quantitative, " : ""}${
      assessmentData.creativity > 7 ? "Creative" : ""
    }
- Academic Stream: ${assessmentData.academicStream}
- Field of Interest: ${assessmentData.fieldOfInterest}
- Work Preferences: ${assessmentData.workArrangement}, ${
      assessmentData.internationalWork === "Yes"
        ? "Open to international opportunities"
        : "Prefers domestic opportunities"
    }

Provide a detailed career recommendation in the following JSON format:
{
  "primaryCareer": "Specific job title",
  "description": "2-3 sentence description of the career",
  "salaryRange": "$XX,000 - $XX,000 (or INR equivalent)",
  "growthOutlook": "Growth outlook with percentage",
  "educationRequired": "Required education level and field",
  "alternativePaths": [
    {"title": "Alternative Career 1", "description": "Brief description"},
    {"title": "Alternative Career 2", "description": "Brief description"}
  ],
  "keySkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
  "nextSteps": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "whyRecommended": "Detailed explanation of why this career suits the student based on their assessment"
}

Respond ONLY with valid JSON. Make it personalized, realistic, and aligned with Indian career paths and salary expectations.`;

    const recommendationResponseRaw = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-exp:generateContent",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: recommendationPrompt,
          temperature: 0.8,
          maxOutputTokens: 6144,
        }),
      }
    );

    let recommendationData = await recommendationResponseRaw.json();
    let careerDetails = recommendationData?.candidates?.[0]?.content;

    if (!careerDetails) throw new Error("Career details missing from recommendation response");

    // Extract JSON from code blocks if needed
    try {
      if (careerDetails.includes("```json")) {
        careerDetails = careerDetails.split("```json")[1].split("```")[0].trim();
      } else if (careerDetails.includes("```")) {
        careerDetails = careerDetails.split("```")[1].split("```")[0].trim();
      }
    } catch {
      // ignore, use raw text
    }

    let parsedCareerDetails;
    try {
      parsedCareerDetails = JSON.parse(careerDetails);
    } catch (err) {
      console.error("Failed to parse careerDetails JSON:", err);
      throw new Error("Failed to parse career details JSON from model output");
    }

    console.log("Generated recommendation successfully");

    return new Response(
      JSON.stringify({
        careerCluster,
        careerDetails: parsedCareerDetails,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-assessment:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
