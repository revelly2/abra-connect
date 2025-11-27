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

    const systemPrompt = `You are an expert travel planner specializing in Abra, Philippines. Create personalized, structured travel itineraries.

IMPORTANT: You must respond using the generate_itinerary function to return a properly structured itinerary.

Key tourist spots in Abra to include when relevant:
- Kaparkan Falls (Mulawin Falls) - terraced waterfall, Heritage Site
- Tayum Church - historical church built in 1803
- Tangadan Tunnel - scenic mountain tunnel
- Bangued Town Plaza - central plaza
- Abra River - for river activities
- Victoria Park - nature park
- Calaba Beach - riverside beach

Always include realistic times, durations, and helpful tips for each activity.`;

    const userPrompt = `Create a travel itinerary for Abra, Philippines with these preferences:
- Gender: ${gender || 'Not specified'}
- Age: ${age || 'Not specified'}
- Location: ${location || 'Not specified'}
- Interests: ${interests?.length ? interests.join(', ') : 'General tourism'}
- Duration: ${duration || '2-3 days'}
- Travel Style: ${travelStyle || 'Adventure'}
- Traveling With: ${groupType || 'Solo'}
- Budget: ${budget || 'Moderate'}

Create a detailed day-by-day itinerary matching these preferences.`;

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
        tools: [
          {
            type: "function",
            function: {
              name: "generate_itinerary",
              description: "Generate a structured travel itinerary",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Overall itinerary title" },
                  days: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        dayNumber: { type: "number" },
                        title: { type: "string", description: "Day theme/title" },
                        activities: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: { type: "string", description: "Activity or place name" },
                              category: { type: "string", enum: ["Activity", "Heritage Site", "Food & Dining", "Nature", "Transportation", "Accommodation"] },
                              description: { type: "string" },
                              time: { type: "string", description: "Start time e.g. 8:00 AM" },
                              duration: { type: "string", description: "e.g. 2 hours" },
                              tips: { type: "string", description: "Helpful tips or notes" },
                              isTouristSpot: { type: "boolean", description: "True if this is a notable tourist spot" },
                              spotName: { type: "string", description: "Exact tourist spot name if isTouristSpot is true" }
                            },
                            required: ["name", "category", "description", "time", "duration"]
                          }
                        }
                      },
                      required: ["dayNumber", "title", "activities"]
                    }
                  },
                  travelNotes: { type: "string", description: "General travel notes about transportation and logistics" },
                  travelTips: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of helpful travel tips"
                  }
                },
                required: ["title", "days", "travelTips"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_itinerary" } }
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

    const data = await response.json();
    console.log("AI Response:", JSON.stringify(data, null, 2));

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const itinerary = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ itinerary }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback if no tool call
    return new Response(JSON.stringify({ error: "Failed to generate structured itinerary" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating itinerary:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
