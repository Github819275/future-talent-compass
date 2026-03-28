import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { agentType, payload } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompts: Record<string, string> = {
      foresight: `You are the Industry Foresight Agent for a strategic hiring tool. You analyze how competency requirements for a specific role will evolve over time given industry transitions.

You must return a JSON object with this exact structure:
{
  "forecasts": [
    {
      "competency": "string - the competency name",
      "scores": { "hiring": number 0-100, "year1": number 0-100, "year3": number 0-100, "year5": number 0-100 },
      "trend": "appreciating" | "stable" | "depreciating",
      "reasoning": "string - 1-2 sentences explaining the forecast"
    }
  ]
}

CRITICAL SCORING RULES - READ CAREFULLY:
- Scores represent the IMPORTANCE of that competency to the role at that time point (0=irrelevant, 100=absolutely critical).
- You MUST produce a WIDE RANGE of scores. NOT everything is important. Some competencies MUST score low (10-30).
- Traditional/legacy skills should START high (70-90) and DROP sharply over the time horizon (to 15-35) if there is a technology transition.
- Emerging/future skills should START low (15-40) and RISE sharply (to 75-95).
- Soft skills like leadership and stakeholder management should be MODERATE and STABLE (45-65).
- At least 2-3 competencies MUST be "depreciating" with scores that clearly decline.
- At least 2-3 competencies MUST be "appreciating" with scores that clearly increase.
- The AVERAGE score across all competencies at any time point should be around 45-55, NOT 70+.
- DO NOT give everything high scores. That tells the user nothing. The whole point is to show CONTRAST between appreciating and depreciating competencies.

Example of GOOD score variety for an EV transition:
- ICE Expertise: hiring=82, year1=70, year3=40, year5=18 (depreciating)
- Battery Knowledge: hiring=25, year1=45, year3=78, year5=92 (appreciating)
- Large Team Leadership: hiring=55, year1=55, year3=50, year5=50 (stable)

Be specific and realistic. Consider the actual industry dynamics.`,

      profile: `You are the Profile Agent for a strategic hiring tool. You read candidate reference text and infer their skill profile.

You must return a JSON object with this exact structure:
{
  "archetype": "string - e.g. 'The Legacy Expert', 'The Transition Specialist', 'The Future-Native', 'The Generalist Adapter'",
  "archetypeDescription": "string - 2-3 sentences about their likely trajectory",
  "skills": [
    {
      "competency": "string - must be one of the provided competencies",
      "level": "Core" | "Developed" | "Emerging",
      "confidence": number 0-1,
      "reasoning": "string - what in the text signalled this"
    }
  ]
}

The competencies to evaluate against are provided in the payload. Evaluate EVERY competency. If the candidate has no evidence of a skill, mark it as "Emerging" with low confidence. Be honest about gaps.`,

      trajectory: `You are the Trajectory Agent. Given industry foresight data and a candidate's skill profile, calculate their fit score at each time point.

Core skills count 1.0x, Developed 0.7x, Emerging 0.4x. Match candidate skills against competency importance at each time point. Also generate optimistic (+10-15%) and pessimistic (-10-15%) scenarios.

IMPORTANT: Scores should reflect REAL differences between candidates. A legacy expert should score HIGH at hiring but DROP over time. A future-native should score LOWER at hiring but RISE. Make the trajectories cross if appropriate.

Return JSON:
{
  "points": [
    { "time": "Hiring", "score": number, "optimistic": number, "pessimistic": number },
    { "time": "Year 1", "score": number, "optimistic": number, "pessimistic": number },
    { "time": "Year 3", "score": number, "optimistic": number, "pessimistic": number },
    { "time": "Year 5", "score": number, "optimistic": number, "pessimistic": number }
  ],
  "appreciatingSkills": ["skill names that are gaining value"],
  "depreciatingSkills": ["skill names that are losing value"],
  "crossingAnalysis": "string - brief analysis of trajectory direction"
}`,

      risk: `You are the Risk Agent. Analyze trajectory data and produce optimistic/pessimistic bounds. Already handled by trajectory agent. Confirm and refine the bounds.

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
  "devilsAdvocate": "strongest argument against the primary recommendation",
  "keyInsight": "one sentence capturing the most important non-obvious finding"
}`
    };

    const systemPrompt = systemPrompts[agentType];
    if (!systemPrompt) throw new Error(`Unknown agent type: ${agentType}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(payload) },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      parsed = JSON.parse(jsonMatch[1].trim());
    } catch {
      parsed = { raw: content };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Agent error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
