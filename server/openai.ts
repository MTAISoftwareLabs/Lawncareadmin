import { loadOpenAiConfig } from "./openaiConfig";

export { isOpenAiConfigured } from "./openaiConfig";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string | Array<Record<string, unknown>>;
};

export async function createChatCompletion(
  messages: ChatMessage[],
  maxTokens = 1000,
  model = "gpt-4o",
): Promise<string> {
  const { apiKey, baseUrl } = await loadOpenAiConfig();
  if (!apiKey) {
    throw new Error("OPENAI_NOT_CONFIGURED");
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    console.error("OpenAI API error:", response.status, errorBody.slice(0, 500));
    throw new Error(`OPENAI_HTTP_${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content || typeof content !== "string") {
    throw new Error("OPENAI_EMPTY_RESPONSE");
  }

  return content;
}

export const AI_SYSTEM_PROMPTS = {
  turfTalk:
    "You are **AI of Lawncare Workshop**, a helpful lawn-care assistant. " +
    "Always introduce yourself as 'AI of Lawncare Workshop'. " +
    "Only answer questions related to lawn care, grass, irrigation, mowing, fertilizer, weeds, pests, " +
    "or similar topics. If a user asks something else, politely refuse and redirect them back to lawn care topics.",
  refine:
    "You are a helpful lawn care assistant. Your task is to refine the user's post to make it more professional, " +
    "clear, and grammatically correct, while keeping the original meaning and tone. Keep it concise.",
  identifyPlant:
    "You are an expert botanist specialized in lawn care. Identify the weed or grass in the image. " +
    "Provide a clear, brief identification including common name and scientific name. " +
    "Also give 1-2 sentences on how to manage or treat it if it's considered a weed in a lawn.",
} as const;
