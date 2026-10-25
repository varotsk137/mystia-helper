// Find which customer and food tag an in-game order line belongs to.
import type { RareCustomer, TagQuote } from "./data";

export interface QuoteMatch {
  customer: RareCustomer;
  quote: TagQuote;
}

/** Lowercased words without punctuation, so "Sweets!" matches "sweets". */
export function quoteWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Quotes containing every word of the query (each query word may be the start of a quote word).
 * The current customer's lines come first, then the rest in data order.
 */
export function searchQuotes(customers: readonly RareCustomer[], query: string, currentName: string | null, limit = 8): QuoteMatch[] {
  const terms = quoteWords(query);
  if (terms.length === 0) return [];
  const matches: QuoteMatch[] = [];
  for (const customer of customers) {
    for (const quote of customer.foodQuotes) {
      const words = quoteWords(quote.text);
      if (terms.every((t) => words.some((w) => w.startsWith(t)))) matches.push({ customer, quote });
    }
  }
  matches.sort((a, b) => Number(b.customer.name === currentName) - Number(a.customer.name === currentName));
  return matches.slice(0, limit);
}

/** Food tags this customer can ask for: liked tags plus any tag they have an order line for. */
export function requestableFoodTags(customer: RareCustomer): string[] {
  const tags = [...customer.likedFoodTags];
  for (const q of customer.foodQuotes) if (!tags.includes(q.tag)) tags.push(q.tag);
  return tags;
}
