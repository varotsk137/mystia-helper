import { useState } from "react";
import type { RareCustomer } from "../data";
import { quoteWords, requestableFoodTags, searchQuotes } from "../quotes";
import { ItemImage } from "./ItemImage";

/** Food tag buttons, each showing what the customer says when ordering that tag. */
export function FoodRequestPicker({
  customer,
  value,
  onChange,
}: {
  customer: RareCustomer;
  value: string | null;
  onChange: (tag: string | null) => void;
}) {
  const tags = requestableFoodTags(customer);
  return (
    <div className="request request-food" role="radiogroup" aria-label="ขออาหาร">
      <span className="request-label">ขออาหาร</span>
      <div className="request-cards">
        {tags.map((t) => {
          const quotes = customer.foodQuotes.filter((q) => q.tag === t);
          return (
            <button
              key={t}
              role="radio"
              aria-checked={value === t}
              className="request-card"
              onClick={() => onChange(value === t ? null : t)}
            >
              <span className="request-card-tag">{t}</span>
              {quotes.map((q, i) => (
                <span key={i} className="request-card-quote" title={q.text}>
                  {q.variant && <span className="quote-variant">{q.variant}: </span>}“{q.text}”
                </span>
              ))}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Type words from the customer's order line to find who said it and which tag they want. */
export function QuoteSearch({
  customers,
  currentName,
  onPick,
}: {
  customers: readonly RareCustomer[];
  currentName: string;
  onPick: (customer: RareCustomer, tag: string) => void;
}) {
  const [query, setQuery] = useState("");
  const results = searchQuotes(customers, query, currentName);
  const terms = quoteWords(query);
  return (
    <div className="quote-search">
      <label className="quote-search-field">
        <span className="request-label">ค้นจากคำพูด</span>
        <input
          type="search"
          value={query}
          placeholder="พิมพ์คำที่ลูกค้าพูดในเกม เช่น carnivores"
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      {terms.length > 0 && (
        <ul className="quote-results">
          {results.length === 0 && <li className="hint">ไม่พบคำพูดที่มีคำเหล่านี้ ลองพิมพ์คำอื่นจากประโยค</li>}
          {results.map(({ customer, quote }, i) => (
            <li key={i}>
              <button
                className="quote-result"
                onClick={() => {
                  onPick(customer, quote.tag);
                  setQuery("");
                }}
              >
                <ItemImage src={customer.image} name={customer.shortName} size={26} variant="portrait" />
                <span className="quote-result-who">{customer.shortName}</span>
                <span className="quote-result-tag">{quote.tag}</span>
                <span className="quote-result-text">
                  <Highlight text={quote.text} terms={terms} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Marks the words of `text` that start with one of the search terms. */
function Highlight({ text, terms }: { text: string; terms: string[] }) {
  const parts = text.split(/(\p{L}[\p{L}\p{N}']*)/u);
  return (
    <>
      {parts.map((part, i) =>
        terms.some((t) => part.toLowerCase().startsWith(t)) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>,
      )}
    </>
  );
}
