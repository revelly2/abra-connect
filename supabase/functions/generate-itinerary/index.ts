import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { gender, age, location, interests, duration, travelStyle, groupType, budget } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert travel planner specializing in Abra, Philippines. You create personalized travel itineraries based on user preferences. 

Your itineraries should:
- Be specific to Abra province and its tourist attractions
- Include local food recommendations
- Suggest accommodation options based on budget
- Include transportation tips
- Be realistic and practical
- Include cultural experiences and local traditions
- Format the response in a clear, day-by-day structure with times

Always be enthusiastic and highlight the unique beauty of Abra!`;

    const userPrompt = `Create a personalized travel itinerary for Abra, Philippines with these preferences:

- Gender: ${gender || 'Not specified'}
- Age: ${age || 'Not specified'}
- Traveler's Location: ${location || 'Not specified'}
- Interests: ${interests?.length ? interests.join(', ') : 'General tourism'}
- Duration: ${duration || 'Not specified'}
- Travel Style: ${travelStyle || 'Not specified'}
- Traveling With: ${groupType || 'Not specified'}
- Budget: ${budget || 'Not specified'}

Please create a detailed day-by-day itinerary that matches these preferences. Include specific places to visit, best times to go, local food to try, and practical tips.`;

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
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to generate itinerary" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error generating itinerary:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
