// Food tags a rare customer can request.
import type { RareCustomer } from "./data";

/** Food tags this customer can ask for: liked tags plus any tag they have an order line for. */
export function requestableFoodTags(customer: RareCustomer): string[] {
  const tags = [...customer.likedFoodTags];
  for (const q of customer.foodQuotes) if (!tags.includes(q.tag)) tags.push(q.tag);
  return tags;
}
