import { useState } from "react";
import type { RareCustomer } from "../data";
import { quoteWords, requestableFoodTags, searchQuotes } from "../quotes";
import { ItemImage } from "./ItemImage";
import { useT } from "../i18n";

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
  const t = useT();
  const tags = requestableFoodTags(customer);
  return (
    <div className="request request-food" role="radiogroup" aria-label={t("rare.foodRequest")}>
      <span className="request-label">{t("rare.foodRequest")}</span>
      <div className="request-cards">
        {tags.map((tag) => {
          const quotes = customer.foodQuotes.filter((q) => q.tag === tag);
          return (
            <button
              key={tag}
              role="radio"
              aria-checked={value === tag}
              className="request-card"
              onClick={() => onChange(value === tag ? null : tag)}
            >
              <span className="request-card-tag">{tag}</span>
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
  currentName: string | null;
  onPick: (customer: RareCustomer, tag: string) => void;
}) {
  const t = useT();
  const [query, setQuery] = useState("");
  const results = searchQuotes(customers, query, currentName);
  const terms = quoteWords(query);
  return (
    <div className="quote-search">
      <label className="quote-search-field">
        <span className="request-label">{t("quote.search")}</span>
        <input
          type="search"
          value={query}
          placeholder={t("quote.placeholder")}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      {terms.length > 0 && (
        <ul className="quote-results">
          {results.length === 0 && <li className="hint">{t("quote.noResults")}</li>}
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
