// ── Claude API Integration ────────────────────────────────────────────────────

function getApiKey() {
  return localStorage.getItem("sf_api_key") || "";
}

async function claudeChat(systemPrompt, userMessage) {
  const key = getApiKey();
  if (!key) throw new Error("No API key set. Add your Anthropic key in Settings.");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }
  const data = await res.json();
  return data.content[0].text;
}

async function generateAIRecipe(userPrompt, pantryItems) {
  const ingredientList = pantryItems.map(i => `${i.name}${i.quantity ? " (" + i.quantity + " " + (i.unit||"") + ")" : ""}`).join(", ");
  const system = `You are a creative chef and recipe developer. The user has these ingredients available: ${ingredientList || "various pantry staples"}.
Suggest a delicious recipe using mainly these ingredients. Format your response as:
**Recipe Name**
Time: X minutes | Servings: X

**Ingredients:**
- item (amount)

**Instructions:**
1. Step one
2. Step two

**Tips:** Any helpful tips or variations.`;

  return claudeChat(system, userPrompt || "Suggest a recipe I can make with what I have.");
}

async function analyzeBakingHistory(bakeLog) {
  if (!bakeLog.length) throw new Error("No baking entries to analyze yet.");

  const entries = bakeLog.slice(-20).map(b =>
    `${b.date}: "${b.name}" — rating ${b.rating}/5. Notes: ${b.notes || "none"}`
  ).join("\n");

  const system = `You are a knowledgeable baking coach. Analyze the following baking log and provide:
1. Patterns you notice (what's going well, recurring issues)
2. 2–3 specific tips to improve based on their history
3. A suggested next bake challenge based on what they seem to enjoy
Keep it warm, encouraging, and practical.`;

  return claudeChat(system, `Here is my recent baking log:\n${entries}`);
}

async function getAISubstitutes(ingredient, recipeContext) {
  const system = `You are a culinary expert who specializes in ingredient substitutions. Give practical, tested substitutes. Format as a concise bulleted list.`;
  const ctx = recipeContext ? ` for use in: ${recipeContext}` : "";
  return claudeChat(system, `What are the best substitutes for ${ingredient}${ctx}? Include ratios and any important notes.`);
}
