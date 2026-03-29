import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GEMINI_API_KEY = "AIzaSyAM58Rc7-pLZzvDpzAXIvLCKr8pj4OsX7Y";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { agentType, payload } = await req.json();

    const systemPrompts: Record<string, string> = {
      foresight: `You are the Industry Foresight Agent for a strategic C-suite hiring tool. You analyze how competency requirements for a specific role will evolve over time given industry transitions.

The payload includes a "timeHorizon" (1, 3, or 5 years). You must produce scores at 6-month intervals from hiring up to the horizon.

You must return a JSON object with this exact structure:
{
  "forecasts": [
    {
      "competency": "string - the competency name",
      "scores": { "hiring": number, "6m": number, "1y": number, "1.5y": number, "2y": number, ... up to the horizon in 6-month steps },
      "trend": "appreciating" | "stable" | "depreciating",
      "reasoning": "string - 1-2 sentences explaining the forecast"
    }
  ]
}

The score keys MUST be: "hiring", "6m", "1y", "1.5y", "2y", "2.5y", "3y", "3.5y", "4y", "4.5y", "5y" — include only up to the given time horizon.

CRITICAL SCORING RULES:
- Scores represent IMPORTANCE of that competency (0=irrelevant, 100=critical).
- Produce a WIDE RANGE. Some competencies MUST score low (10-30), others high (75-95).
- Traditional/legacy skills should START high and DROP over time if there's a transition.
- Emerging/future skills should START low and RISE.
- Soft skills should be MODERATE and STABLE (45-65).
- At least 2-3 competencies MUST be "depreciating", at least 2-3 "appreciating".
- Average across all competencies at any time point should be ~45-55, NOT 70+.`,

      profile: `You are the Candidate Profiling Agent. Given a candidate's name and reference text, extract their competency profile.

Return JSON:
{
  "archetype": "a 2-4 word archetype label (e.g. 'Legacy Domain Expert', 'Transformation Native', 'Strategic Bridge Builder')",
  "archetypeDescription": "1-2 sentences describing this archetype",
  "skills": [
    {
      "competency": "must match one of the provided competency names exactly",
      "level": "Core" | "Developed" | "Emerging",
      "confidence": 0.0 to 1.0,
      "reasoning": "1 sentence evidence from the reference text"
    }
  ]
}

Be honest about weaknesses. If the reference text shows no evidence for a competency, rate it as "Emerging" with low confidence. Every candidate must have at least 2-3 "Emerging" competencies.`,

      trajectory: `You are the Trajectory Agent. Given industry foresight data and a candidate's skill profile, calculate their fit score at EVERY time point provided in the foresight data (6-month intervals).

Core skills count 1.0x, Developed 0.7x, Emerging 0.4x. Match candidate skills against competency importance at each time point. Also generate optimistic (+10-15%) and pessimistic (-10-15%) scenarios.

IMPORTANT: Scores should reflect REAL differences between candidates. A legacy expert should score HIGH at hiring but DROP over time. A future-native should score LOWER at hiring but RISE. Make the trajectories cross if appropriate.

Return JSON:
{
  "points": [
    { "time": "Hiring", "score": number, "optimistic": number, "pessimistic": number },
    { "time": "6M", "score": number, "optimistic": number, "pessimistic": number },
    { "time": "Y1", "score": number, "optimistic": number, "pessimistic": number },
    ... one entry for each 6-month interval up to the horizon
  ],
  "appreciatingSkills": ["skill names that are gaining value"],
  "depreciatingSkills": ["skill names that are losing value"],
  "crossingAnalysis": "string - brief analysis of trajectory direction"
}

IMPORTANT: You MUST produce a "points" entry for EVERY 6-month interval that appears in the foresight scores. Match the time labels exactly.`,

      risk: `You are the Risk Analysis Agent. Given a candidate's trajectory data, identify key risks and validate the confidence bands.
Return the same trajectory format with refined confidence bands.`,

      decision: `You are the Decision Agent. Given all trajectory data for all candidates, produce conditional recommendations.

Return JSON:
{
  "recommendations": [
    {
      "horizon": "If your horizon is now to 12 months",
      "candidate": "candidate name",
      "rationale": "1 paragraph",
      "risk": "key risk statement"
    },
    {
      "horizon": "If your horizon is 3 to 5 years",
      "candidate": "candidate name",
      "rationale": "1 paragraph",
      "risk": "key risk statement"
    },
    {
      "horizon": "The hybrid path",
      "candidate": "combined approach",
      "rationale": "1 paragraph",
      "risk": "key risk statement",
      "developmentPlan": "specific development plan"
    }
  ],
  "devilsAdvocate": "A clear, definitive 2-sentence final verdict. First sentence: state the single best hiring decision and why. Second sentence: state the critical condition or risk to watch.",
  "keyInsight": "one sentence capturing the most important non-obvious finding",
  "agentReasoning": [
    {
      "agentName": "Context Agent",
      "conclusion": "1-2 sentences on what was concluded about the organisational context",
      "keyFactors": ["factor 1", "factor 2", "factor 3"]
    },
    {
      "agentName": "Candidate Agent",
      "conclusion": "1-2 sentences on key differentiators between candidates",
      "keyFactors": ["factor 1", "factor 2", "factor 3"]
    },
    {
      "agentName": "Foresight Agent",
      "conclusion": "1-2 sentences on the most important competency shifts",
      "keyFactors": ["factor 1", "factor 2", "factor 3"]
    },
    {
      "agentName": "Decision Agent",
      "conclusion": "1-2 sentences on why the final recommendation was made",
      "keyFactors": ["factor 1", "factor 2", "factor 3"]
    }
  ]
}`,

      teamCompatibility: `You are the Team Compatibility Agent. Given candidate profiles and the existing C-Suite context, analyze how each candidate would pair with each existing C-suite member.

Return JSON:
{
  "pairings": [
    {
      "candidate": "candidate name",
      "cSuiteMember": "C-suite member name or title",
      "cSuiteRole": "their role",
      "compatibility": "strong" | "risk",
      "reasoning": "One sentence explaining the pairing dynamic"
    }
  ]
}

Generate 2-3 pairings per candidate. Mix of strong and risk pairings.`
    };

    const systemPrompt = systemPrompts[agentType];
    if (!systemPrompt) {
      return new Response(JSON.stringify({ error: `Unknown agent type: ${agentType}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Convert to Gemini format
    const geminiBody = {
      contents: [
        {
          role: "user",
          parts: [
            { text: `${systemPrompt}\n\n---\n\nHere is the input data:\n${JSON.stringify(payload)}` }
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    };

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: `Gemini API error ${response.status}: ${err}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { raw: content };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
