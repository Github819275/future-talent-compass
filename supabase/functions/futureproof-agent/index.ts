import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        { role: "user", parts: [{ text: `${systemPrompt}\n\n---\n\n${userPrompt}` }] }
      ],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Gemini API error:", response.status, err);
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No content in Gemini response");
  return text;
}

function parseJSON(text: string): any {
  // Try direct parse first
  try { return JSON.parse(text); } catch {}
  // Try extracting from markdown code block
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) {
    try { return JSON.parse(match[1].trim()); } catch {}
  }
  // Try finding first { to last }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch {}
  }
  throw new Error("Failed to parse JSON from Gemini response");
}

const systemPrompts: Record<string, string> = {
  context: `You are the Context Agent for a strategic C-suite hiring intelligence platform at BMW Group.

Analyze the company situation and role being hired for. Return what leadership archetype is needed NOW vs in 5 years.

Return JSON:
{
  "currentArchetype": {
    "name": "string - 2-4 word label (e.g. 'Operational Stabilizer', 'Transformation Catalyst')",
    "description": "2-3 sentences describing why this archetype is needed now",
    "keyTraits": ["trait1", "trait2", "trait3", "trait4"]
  },
  "futureArchetype": {
    "name": "string - 2-4 word label for what's needed in 5 years",
    "description": "2-3 sentences describing why this archetype will be needed",
    "keyTraits": ["trait1", "trait2", "trait3", "trait4"]
  },
  "strategicContext": "2-3 sentences summarizing the key tension between current and future needs",
  "industryShifts": ["shift1", "shift2", "shift3"]
}`,

  candidate: `You are the Candidate Agent for a strategic C-suite hiring intelligence platform.

For EACH candidate provided, analyze their profile and assign:
- A leadership archetype: one of "Stability", "Transformation", or "Strategic"
- Scores on 4 dimensions (0-100): transformation_readiness, operational_depth, adaptability, cultural_alignment

Also provide a detailed competency profile against the provided competency list.

Return JSON:
{
  "candidates": [
    {
      "name": "candidate name",
      "archetype": "Stability" | "Transformation" | "Strategic",
      "archetypeDescription": "1-2 sentences explaining why this archetype fits",
      "scores": {
        "transformation_readiness": number 0-100,
        "operational_depth": number 0-100,
        "adaptability": number 0-100,
        "cultural_alignment": number 0-100
      },
      "skills": [
        {
          "competency": "must match one of the provided competency names exactly",
          "level": "Core" | "Developed" | "Emerging",
          "confidence": 0.0 to 1.0,
          "reasoning": "1 sentence evidence from the reference text"
        }
      ]
    }
  ]
}

Be honest about weaknesses. If the reference text shows no evidence for a competency, rate it as "Emerging" with low confidence. Every candidate must have at least 2-3 "Emerging" competencies. Make the scores reflect REAL differences between candidates.`,

  foresight: `You are the Foresight Agent for a strategic C-suite hiring intelligence platform.

Based on the company situation and candidate profiles, predict strategic fit scores for each candidate at: Now, Year 1, Year 2, Year 3, Year 4, Year 5.

CRITICAL SCORING RULES:
- Scores represent overall strategic fit (0-100)
- One candidate who is strong in legacy/operational skills MUST start HIGH (70-85) and DECLINE over 5 years to (40-55)
- One candidate who is strong in transformation/future skills MUST start LOWER (45-60) and RISE SHARPLY to (75-90)
- Their trajectories MUST CROSS around Year 2-3
- A third/strategic candidate should follow a moderate, relatively stable path (55-70 range)
- Generate optimistic (+8-15) and pessimistic (-8-15) bands for each point

Also predict competency importance evolution over time for the provided competencies.

Return JSON:
{
  "trajectories": [
    {
      "candidateName": "name",
      "points": [
        { "time": "Now", "score": number, "optimistic": number, "pessimistic": number },
        { "time": "Y1", "score": number, "optimistic": number, "pessimistic": number },
        { "time": "Y2", "score": number, "optimistic": number, "pessimistic": number },
        { "time": "Y3", "score": number, "optimistic": number, "pessimistic": number },
        { "time": "Y4", "score": number, "optimistic": number, "pessimistic": number },
        { "time": "Y5", "score": number, "optimistic": number, "pessimistic": number }
      ],
      "appreciatingSkills": ["skill names gaining value"],
      "depreciatingSkills": ["skill names losing value"]
    }
  ],
  "forecasts": [
    {
      "competency": "competency name",
      "scores": { "now": number, "y1": number, "y2": number, "y3": number, "y4": number, "y5": number },
      "trend": "appreciating" | "stable" | "depreciating",
      "reasoning": "1-2 sentences explaining the forecast"
    }
  ]
}`,

  decision: `You are the Decision Agent for a strategic C-suite hiring intelligence platform.

Synthesize ALL previous analysis (context, candidate profiles, trajectories) and produce:

1. Short term hire (best for next 12 months) with detailed reasoning
2. Long term hire (best for 5 year horizon) with detailed reasoning
3. Hybrid path (hire X now, transition to Y in 18-24 months) with detailed reasoning
4. Team compatibility analysis for each candidate with existing C-suite

Return JSON:
{
  "recommendations": [
    {
      "horizon": "Short Term (0-12 months)",
      "candidate": "candidate name",
      "rationale": "1 detailed paragraph explaining why",
      "risk": "key risk statement",
      "developmentPlan": null
    },
    {
      "horizon": "Long Term (3-5 years)",
      "candidate": "candidate name",
      "rationale": "1 detailed paragraph explaining why",
      "risk": "key risk statement",
      "developmentPlan": null
    },
    {
      "horizon": "Hybrid Path",
      "candidate": "combined approach description",
      "rationale": "1 detailed paragraph explaining the transition strategy",
      "risk": "key risk statement",
      "developmentPlan": "specific 18-24 month transition plan"
    }
  ],
  "teamPairings": [
    {
      "candidate": "candidate name",
      "cSuiteMember": "C-suite member name or role",
      "cSuiteRole": "their role",
      "compatibility": "strong" | "risk",
      "reasoning": "One sentence explaining the pairing dynamic"
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
      "conclusion": "1-2 sentences on the most important trajectory shifts",
      "keyFactors": ["factor 1", "factor 2", "factor 3"]
    },
    {
      "agentName": "Decision Agent",
      "conclusion": "1-2 sentences on why the final recommendation was made",
      "keyFactors": ["factor 1", "factor 2", "factor 3"]
    }
  ]
}`
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentType, payload } = await req.json();

    const systemPrompt = systemPrompts[agentType];
    if (!systemPrompt) {
      return new Response(JSON.stringify({ error: `Unknown agent type: ${agentType}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Running agent: ${agentType}`);
    const rawText = await callGemini(systemPrompt, JSON.stringify(payload));
    const parsed = parseJSON(rawText);
    console.log(`Agent ${agentType} complete`);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Agent error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
