export type Screen =
  | "login"
  | "home"
  | "orders"
  | "tracking"
  | "khata"
  | "customer"
  | "rates";

export type Sheet = "pay" | "add" | "item" | "pref" | null;

export type OrderState = "new" | "accepted" | "delivered";

export interface OrderItem {
  n: string;
  q: string;
  vague?: boolean;
  cat?: string;
  guess?: string;
  guessWhy?: string;
}

export interface Order {
  id: string;
  cust: string;
  phone: string;
  time: string;
  state: OrderState;
  items: OrderItem[];
  total: number;
}

export interface Pref {
  cat: string;
  item: string;
  note: string;
}

export interface Entry {
  t: "order" | "pay";
  label: string;
  sub: string;
  amt: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  due: number;
  prefs?: Pref[];
  entries: Entry[];
}

export interface RateItem {
  id: string;
  n: string;
  u: string;
  p: number;
}

export interface CatalogChoice {
  n: string;
  sub: string;
  count: number;
}

export type Catalog = Record<string, CatalogChoice[]>;
