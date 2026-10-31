/**
 * Deterministic stand-ins for the AI agents so the UI is fully exercisable without the
 * OCI Generative AI backend. The real backend performs these calls server side.
 */

const STOP_WORDS = new Set(
  'a an the and or but if of to in on for with at by from is are was were be been being this that these those it its as into than then so such not no can will would should could may might also have has had do does did i you he she we they them our your their'.split(
    ' ',
  ),
);

const splitSentences = (text: string) =>
  text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

/** Frequency-based extractive summary: keeps the highest scoring sentences in original order. */
export function summarize(text: string, maxSentences = 3): string {
  const sentences = splitSentences(text);
  if (sentences.length <= maxSentences) return sentences.join(' ');

  const freq = new Map<string, number>();
  for (const word of text.toLowerCase().match(/[a-z0-9']+/g) ?? []) {
    if (!STOP_WORDS.has(word) && word.length > 2) freq.set(word, (freq.get(word) ?? 0) + 1);
  }

  const scored = sentences.map((sentence, index) => {
    const words = sentence.toLowerCase().match(/[a-z0-9']+/g) ?? [];
    const score = words.reduce((sum, w) => sum + (freq.get(w) ?? 0), 0) / Math.max(words.length, 1);
    return { sentence, index, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.index - b.index)
    .map((s) => s.sentence)
    .join(' ');
}

const EXTRACTORS: Array<{ key: string; pattern: RegExp }> = [
  { key: 'Email', pattern: /[\w.+-]+@[\w-]+\.[\w.-]+/g },
  { key: 'URL', pattern: /https?:\/\/[^\s,)]+/g },
  { key: 'IP Address', pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g },
  { key: 'Phone', pattern: /\+?\d[\d\s-]{8,}\d/g },
  { key: 'Date', pattern: /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b/g },
  { key: 'Amount', pattern: /(?:₹|\$|€|INR|USD)\s?\d[\d,]*(?:\.\d+)?/g },
  { key: 'Ticket', pattern: /\b(?:INC|CHG|REQ|RITM|PRB)\d{5,}\b/g },
];

export function extract(text: string): Array<{ key: string; value: string }> {
  const results: Array<{ key: string; value: string }> = [];
  for (const { key, pattern } of EXTRACTORS) {
    const matches = new Set(text.match(pattern) ?? []);
    matches.forEach((value) => results.push({ key, value: value.trim() }));
  }
  return results;
}

export const estimateTokens = (text: string) => Math.ceil(text.length / 4);
