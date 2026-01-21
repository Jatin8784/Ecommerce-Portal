export async function getAIRecommendation(req, res, userPrompt, products) {
  const API_KEY = process.env.GEMINI_API_KEY;
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    const limitedProducts = products.slice(0, 40);

    const productContext = limitedProducts.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      description: p.description ? p.description.substring(0, 150) : "",
      ratings: p.ratings,
    }));

    const geminiPrompt = `
        You are a shopping assistant. Filter these products for this user request: "${userPrompt}"
        
        Products: ${JSON.stringify(productContext)}

        Strict Rules:
        1. Return ONLY a JSON array of matching product IDs. Example: [12, 45, 6]
        2. If no strong matches, return an empty array [].
        3. Do NOT include markdown formatting.
    `;

    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: geminiPrompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
        },
      }),
    });

    if (response.status === 429) {
      console.warn("⚠️ Gemini Quota Exceeded. Falling back to SQL search results.");
      return { success: true, products: products, aiApplied: false };
    }

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!aiResponseText) {
      return { success: true, products: products };
    }

    let matchedIds = [];
    try {
      matchedIds = JSON.parse(aiResponseText.replace(/```json|```/g, ""));
    } catch (e) {
      return { success: true, products: products };
    }

    if (Array.isArray(matchedIds) && matchedIds.length > 0) {
      const filtered = products.filter((p) => matchedIds.includes(p.id));
      return { success: true, products: filtered, aiApplied: true };
    }

    return { success: true, products: [], aiApplied: true };
  } catch (error) {
    console.error("AI Recommendation Failed:", error.message);
    return { success: true, products: products, aiApplied: false };
  }
}