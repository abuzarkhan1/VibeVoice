const PARA_SPLIT = /\n\s*\n/
const SENTENCE_SPLIT = /(?<=[.!?])\s+(?=[A-Z(])/

export function splitChunks(text: string): string[] {
  const trimmed = text.trim()
  if (!trimmed) return []
  const paragraphs = trimmed.split(PARA_SPLIT).map((p) => p.trim()).filter(Boolean)
  if (paragraphs.length > 1) return paragraphs
  if (trimmed.length <= 280) return [trimmed]
  const sentences = trimmed.split(SENTENCE_SPLIT).map((s) => s.trim()).filter(Boolean)
  return sentences.length > 1 ? sentences : [trimmed]
}
