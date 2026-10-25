import { describe, expect, it } from "vitest";
import { addGuest, NO_GUESTS, normalizeGuests, removeGuest, setActiveGuest, setGuestOrder } from "./guests";

const seated = (...names: string[]) => names.reduce((g, n) => addGuest(g, n), NO_GUESTS);

describe("guests", () => {
  it("seats guests in arrival order and makes the newest active", () => {
    const g = seated("Chen", "Rumia");
    expect(g.list.map((x) => x.name)).toEqual(["Chen", "Rumia"]);
    expect(g.active).toBe("Rumia");
  });

  it("switches to a guest already seated instead of adding them twice", () => {
    const g = addGuest(seated("Chen", "Rumia"), "Chen");
    expect(g.list).toHaveLength(2);
    expect(g.active).toBe("Chen");
  });

  it("can set the food request while seating (quote search)", () => {
    const g = addGuest(seated("Chen"), "Chen", "Grilled");
    expect(g.list[0].food).toBe("Grilled");
    expect(addGuest(NO_GUESTS, "Rumia", "Meat").list[0]).toEqual({ name: "Rumia", food: "Meat", drink: null });
  });

  it("keeps each guest's order separately", () => {
    let g = seated("Chen", "Rumia");
    g = setGuestOrder(g, "Chen", { food: "Sweet" });
    g = setGuestOrder(g, "Rumia", { drink: "Soda" });
    expect(g.list).toEqual([
      { name: "Chen", food: "Sweet", drink: null },
      { name: "Rumia", food: null, drink: "Soda" },
    ]);
  });

  it("moves to the next guest when the active one leaves, or the previous at the end", () => {
    const g = setActiveGuest(seated("Chen", "Rumia", "Wriggle"), "Rumia");
    expect(removeGuest(g, "Rumia").active).toBe("Wriggle");
    expect(removeGuest(setActiveGuest(g, "Wriggle"), "Wriggle").active).toBe("Rumia");
    expect(removeGuest(g, "Chen").active).toBe("Rumia");
    expect(removeGuest(seated("Chen"), "Chen")).toEqual(NO_GUESTS);
  });

  it("repairs saved data", () => {
    expect(normalizeGuests(undefined)).toEqual(NO_GUESTS);
    expect(
      normalizeGuests({ list: [{ name: "Chen", food: 3 }, { name: "Chen" }, null, { name: "Rumia", drink: "Soda" }], active: "Gone" }),
    ).toEqual({
      list: [
        { name: "Chen", food: null, drink: null },
        { name: "Rumia", food: null, drink: "Soda" },
      ],
      active: "Chen",
    });
  });
});
