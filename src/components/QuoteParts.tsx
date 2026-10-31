import type { RareCustomer } from "../data";
import { requestableFoodTags } from "../quotes";
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
