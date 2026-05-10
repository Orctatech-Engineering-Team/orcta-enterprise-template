import { ulid } from "ulid";

export type EntityId<T extends string> = string & { readonly __brand: T };

export function createId<T extends string>(): EntityId<T> {
  return ulid() as EntityId<T>;
}

export function toId<T extends string>(raw: string): EntityId<T> {
  return raw as EntityId<T>;
}

export type TaskId = EntityId<"Task">;
export type CustomerId = EntityId<"Customer">;
export type UserId = EntityId<"User">;

export type Coordinates = {
  readonly lat: number;
  readonly lng: number;
};

export function createCoordinates(lat: number, lng: number): Coordinates | null {
  if (lat < -90 || lat > 90) return null;
  if (lng < -180 || lng > 180) return null;
  return { lat, lng };
}

export function distanceKm(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export type Currency = "GHS" | "NGN" | "KES" | "ZAR" | "UGX";

export type Money = {
  readonly amountInMinorUnits: number;
  readonly currency: Currency;
};

export function createMoney(amountInMinorUnits: number, currency: Currency): Money | null {
  if (!Number.isInteger(amountInMinorUnits)) return null;
  if (amountInMinorUnits < 0) return null;
  return { amountInMinorUnits, currency };
}

export function addMoney(a: Money, b: Money): Money | null {
  if (a.currency !== b.currency) return null;
  return { amountInMinorUnits: a.amountInMinorUnits + b.amountInMinorUnits, currency: a.currency };
}

export function formatMoney(money: Money): string {
  const majorUnit = money.amountInMinorUnits / 100;
  const symbols: Record<Currency, string> = {
    GHS: "GH₵",
    NGN: "₦",
    KES: "KSh",
    ZAR: "R",
    UGX: "USh",
  };
  return `${symbols[money.currency]}${majorUnit.toFixed(2)}`;
}

export type DeliveryAddress = {
  readonly label: string;
  readonly landmark?: string;
  readonly streetAddress?: string;
  readonly city: string;
  readonly country: string;
  readonly coordinates?: Coordinates;
};
