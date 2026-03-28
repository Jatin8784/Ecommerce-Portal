export async function getAIRecommendation(req, res, userPrompt, products) {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    console.warn("⚠️ GEMINI_API_KEY is missing. Falling back to SQL search results.");
    return { success: true, products: products, aiApplied: false };
  }

  const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    const limitedProducts = products.slice(0, 45);

    const productContext = limitedProducts.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      description: p.description ? p.description.substring(0, 180) : "",
      ratings: p.ratings,
    }));

    const geminiPrompt = `
        You are an expert e-commerce shopping assistant. Your goal is to find the most relevant products from the provided list based on the user's request.
        
        The user's request could be a natural language description (e.g., "blue sporty shoes for running") OR a single keyword/category (e.g., "mobile", "laptop", "toys").

        User Request: "${userPrompt}"
        
        Available Products (JSON): ${JSON.stringify(productContext)}

        Instructions:
        1. If the request is a single keyword or category, find all products that belong to that category or have that keyword in their name/description.
        2. If the request is a detailed description, analyze the intent, preferences, and features mentioned.
        3. Match the request against product names, categories, and descriptions.
        4. Return ONLY a valid JSON array of product IDs that match the criteria.
        
        Constraints:
        - Return ONLY the array of IDs. No text, no markdown block, no explanation.
        - Example Output: [12, 45, 6]
        - If no products match, return an empty array: []
    `;

    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: geminiPrompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.2, // Low temperature for more deterministic results
        },
      }),
    });

    if (response.status === 429) {
      console.warn("⚠️ Gemini Quota Exceeded. Falling back to SQL search results.");
      return { success: true, products: products, aiApplied: false };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API Error details:", errorData);
      throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    let aiResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!aiResponseText) {
      return { success: true, products: products, aiApplied: false };
    }

    // Sanitize response text if Gemini accidentally includes markdown blocks
    aiResponseText = aiResponseText.replace(/```json\n?|```/g, "").trim();

    let matchedIds = [];
    try {
      matchedIds = JSON.parse(aiResponseText);
    } catch (e) {
      console.error("Failed to parse AI response:", aiResponseText);
      return { success: true, products: products, aiApplied: false };
    }

    if (Array.isArray(matchedIds) && matchedIds.length > 0) {
      // Products have UUIDs as strings, ensure comparison is correct
      const stringifiedMatchedIds = matchedIds.map(id => String(id).toLowerCase());
      const filtered = products.filter((p) => stringifiedMatchedIds.includes(String(p.id).toLowerCase()));
      return { success: true, products: filtered, aiApplied: true };
    }

    // If AI explicitly returned an empty array, it means no matches found
    if (Array.isArray(matchedIds) && matchedIds.length === 0) {
      return { success: true, products: [], aiApplied: true };
    }

    return { success: true, products: products, aiApplied: false };
  } catch (error) {
    console.error("AI Recommendation Failed:", error.message);
    return { success: true, products: products, aiApplied: false };
  }
}