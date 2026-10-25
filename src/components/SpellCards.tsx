import type { RareCustomer, SpellCard } from "../data";
import { useT } from "../i18n";

/** The guest's reward and punishment spell cards, as described on the wiki. */
export function SpellCards({ customer }: { customer: RareCustomer }) {
  const t = useT();
  const cards = customer.spellCards;
  return (
    <details className="spell-cards" open>
      <summary>
        <h2>{t("spell.title")}</h2>
        {cards.length > 0 && <span className="hint">{t("spell.source")}</span>}
      </summary>
      {cards.length === 0 ? (
        <p className="hint">{customer.spellCardNote ?? t("spell.none", { name: customer.shortName })}</p>
      ) : (
        <div className="spell-card-grid">
          {cards.map((card, i) => (
            <SpellCardView key={i} card={card} />
          ))}
        </div>
      )}
    </details>
  );
}

function SpellCardView({ card }: { card: SpellCard }) {
  const t = useT();
  return (
    <article className={`spell-card spell-${card.kind}`}>
      <span className="spell-kind">{t(`spell.${card.kind}`)}</span>
      <h3 className="spell-name">{card.name}</h3>
      {card.blocks.map((b, i) =>
        b.type === "h" ? (
          <h4 key={i} className="spell-sub">
            {b.text}
          </h4>
        ) : b.type === "li" ? (
          <p key={i} className="spell-li">
            {b.text}
          </p>
        ) : (
          <p key={i}>{b.text}</p>
        ),
      )}
    </article>
  );
}
