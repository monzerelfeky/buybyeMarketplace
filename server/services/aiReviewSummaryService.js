const Groq = require('groq-sdk');

const MODEL = 'llama-3.1-8b-instant';

function normalizeText(text) {
  if (!text) return '';
  return String(text).replace(/\s+/g, ' ').trim();
}

function buildPrompt(comments) {
  const lines = comments.map((comment) => {
    const rating = Number.isFinite(comment.rating) ? comment.rating : 'none';
    const text = normalizeText(comment.text);
    return `- Rating: ${rating}, Comment: "${text}"`;
  });

return [
  'You are a senior product analyst working for an online marketplace.',
  'Your task is to analyze customer reviews and produce a clear, factual summary for buyers.',
  '',
  'Instructions:',
  '- Read all reviews carefully before writing.',
  '- Weigh both positive and negative feedback.',
  '- Give more importance to recurring points mentioned by multiple reviewers.',
  '- Use ratings to support sentiment but do not mention exact numbers.',
  '- Do not use generic phrases such as "overall", "generally", or "users say".',
  '- Do not mention individual reviewers.',
  '',
  'Output requirements:',
  '1. Summary: A single professional paragraph (3–5 sentences) describing the main strengths, weaknesses, and buying experience.',
  '2. Sentiment: Choose exactly one label based on the balance of feedback:',
  '   - Positive: mostly favorable feedback with minor issues',
  '   - Neutral: mixed feedback with no strong direction',
  '   - Negative: mostly unfavorable feedback or serious issues',
  '',
  'Formatting rules (must follow exactly):',
  'Summary: <paragraph>',
  'Sentiment: Positive | Neutral | Negative',
  '',
  'Customer reviews:',
  ...lines
].join('\n');
}

function parseResponse(content) {
  const trimmed = (content || '').trim();
  const summaryMatch = trimmed.match(/Summary\s*:\s*([\s\S]*?)(?:\n\s*Sentiment\s*:|$)/i);
  const sentimentMatch = trimmed.match(/Sentiment\s*:\s*(Positive|Neutral|Negative)/i);

  let summary = summaryMatch ? summaryMatch[1].trim() : '';
  if (!summary) {
    summary = trimmed.replace(/Sentiment\s*:\s*(Positive|Neutral|Negative)/i, '').trim();
  }

  const sentiment = sentimentMatch ? sentimentMatch[1] : 'Neutral';
  return { summary, sentiment };
}

async function summarizeReviews(comments) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('Missing GROQ_API_KEY');
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const prompt = buildPrompt(comments);

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 220,
  });

  const content = response?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Empty AI response');
  }

  return parseResponse(content);
}

module.exports = {
  summarizeReviews,
};
