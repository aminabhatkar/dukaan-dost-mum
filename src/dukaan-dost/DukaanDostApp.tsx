import { useEffect, useRef, useState } from "react";
import type { Customer, Order, RateItem, Screen, Sheet } from "./types";
import { CUSTOMERS, ITEMS, ORDERS } from "./data";
import { supabase } from "@/integrations/supabase/client";
import { rs, telHref } from "./utils";
import { Shell } from "./components/Shell";
import { BottomNav } from "./components/BottomNav";
import { Toast } from "./components/Toast";
import { LoginScreen } from "./screens/LoginScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { OrdersScreen } from "./screens/OrdersScreen";
import type { NewOrderView } from "./screens/OrdersScreen";
import { TrackingScreen } from "./screens/TrackingScreen";
import { KhataScreen } from "./screens/KhataScreen";
import { CustomerScreen } from "./screens/CustomerScreen";
import { RateListScreen } from "./screens/RateListScreen";
import { PaySheet } from "./screens/PaySheet";
import { AddCustomerSheet } from "./screens/AddCustomerSheet";
import { ItemSheet } from "./screens/ItemSheet";
import { PrefSheet } from "./screens/PrefSheet";

const KEY_DEFS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "Mitao", "0", "500"];
const STORAGE_KEY = "dukaan-dost-state-v1";

interface ToastState {
  text: string;
  undo: () => void;
}

interface CatalogItemRow {
  id: number;
  category: string;
  name: string;
  unit: string;
  price: number;
  is_active: boolean;
  times_ordered: number;
}

interface AppState {
  screen: Screen;
  orders: Order[];
  customers: Customer[];
  custId: string | null;
  sheet: Sheet;
  pay: string;
  newName: string;
  newPhone: string;
  items: RateItem[];
  editId: string | null;
  itName: string;
  itCategory: string;
  itUnit: string;
  itPrice: string;
  uploadName: string | null;
  resolved: Record<string, string>;
  prefKey: string | null;
  prefRowId: number | null;
  prefOrderItemId: number | null;
  prefOrderCustomerId: number | null;
  prefFromOrder: boolean;
  prefCustName: string;
  prefCat: string;
  prefPick: string;
  prefPickId: number | null;
  prefNote: string;
  prefPhrase: string;
  toast: ToastState | null;
}

const initialState: AppState = {
  screen: "login",
  orders: ORDERS,
  customers: CUSTOMERS,
  custId: null,
  sheet: null,
  pay: "",
  newName: "",
  newPhone: "",
  items: ITEMS,
  editId: null,
  itName: "",
  itCategory: "",
  itUnit: "",
  itPrice: "",
  uploadName: null,
  resolved: {},
  prefKey: null,
  prefRowId: null,
  prefOrderItemId: null,
  prefOrderCustomerId: null,
  prefFromOrder: false,
  prefCustName: "",
  prefCat: "",
  prefPick: "",
  prefPickId: null,
  prefNote: "",
  prefPhrase: "",
  toast: null,
};

function loadState(): AppState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return { ...initialState, ...parsed, toast: null };
  } catch {
    return initialState;
  }
}

type LiveTrackingOrder = {
  dbId: number;
  customerId: number | null;
  state: "accepted" | "delivered";
  cust: string;
  summary: string;
  total: number;
  acceptedAt: string | null;
  deliveredAt: string | null;
};

type LiveNewOrderItem = {
  itemId: number;
  n: string;
  q: string;
  vague: boolean;
  guess: string;
  guessWhy: string;
  guessedId: number | null;
  category: string | null;
};

type LiveNewOrder = {
  id: string;
  dbId: number;
  customerId: number | null;
  cust: string;
  phone: string;
  time: string;
  total: number;
  items: LiveNewOrderItem[];
};

type LiveCustomer = { id: number; name: string; phone: string; balance: number };

type LedgerRow = {
  id: number;
  type: string;
  amount: number;
  note: string | null;
  created_at: string;
};

type PrefRow = {
  id: number;
  catalogItemId: number;
  cat: string;
  item: string;
  note: string;
};



export default function DukaanDostApp() {
  const [s, setS] = useState<AppState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [liveNewOrders, setLiveNewOrders] = useState<LiveNewOrder[]>([]);
  const [liveCustomers, setLiveCustomers] = useState<LiveCustomer[]>([]);
  const [liveEntries, setLiveEntries] = useState<LedgerRow[]>([]);
  const [livePrefs, setLivePrefs] = useState<PrefRow[]>([]);
  const [liveTracking, setLiveTracking] = useState<{
    accepted: LiveTrackingOrder[];
    delivered: LiveTrackingOrder[];
  }>({ accepted: [], delivered: [] });

  const [liveCatalogItems, setLiveCatalogItems] = useState<CatalogItemRow[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setS(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }, [s, hydrated]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const update = (patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) => {
    setS((prev) => ({ ...prev, ...(typeof patch === "function" ? patch(prev) : patch) }));
  };

  const go = (screen: Screen) => {
    update({ screen, sheet: null });
    window.scrollTo(0, 0);
  };

  const showToast = (text: string, undo: () => void) => {
    clearTimeout(timer.current);
    update({ toast: { text, undo } });
    timer.current = setTimeout(() => update({ toast: null }), 6000);
  };

  const setOrderState = (id: string, st: "new" | "accepted" | "delivered") => {
    update((prev) => ({ orders: prev.orders.map((o) => (o.id === id ? { ...o, state: st } : o)) }));
  };

  const fetchLiveNewOrders = async () => {
    const { data: orderRows, error: ordersError } = await supabase
      .from("orders")
      .select("id, customer_id, total, created_at")
      .eq("state", "new")
      .order("created_at", { ascending: false });
    if (ordersError || !orderRows) {
      console.error("[orders] fetch failed:", ordersError?.message);
      return;
    }
    if (orderRows.length === 0) {
      setLiveNewOrders([]);
      return;
    }

    const orderIds = orderRows.map((o) => o.id);
    const customerIds = Array.from(
      new Set(orderRows.map((o) => o.customer_id).filter((v): v is number => v !== null)),
    );

    const [{ data: itemRows }, { data: customerRows }] = await Promise.all([
      supabase
        .from("order_items")
        .select(
          "id, order_id, spoken_text, quantity_text, is_vague, guessed_catalog_item_id, guess_reason, resolved_catalog_item_id",
        )
        .in("order_id", orderIds),
      supabase.from("customers").select("id, name, phone").in("id", customerIds),
    ]);

    const catalogIds = Array.from(
      new Set(
        (itemRows ?? [])
          .flatMap((it) => [it.resolved_catalog_item_id, it.guessed_catalog_item_id])
          .filter((v): v is number => v !== null),
      ),
    );
    const { data: catalogRows } = catalogIds.length
      ? await supabase.from("catalog_items").select("id, name, unit, category").in("id", catalogIds)
      : { data: [] as { id: number; name: string; unit: string; category: string }[] };

    const catalogById = new Map((catalogRows ?? []).map((c) => [c.id, c]));
    const customerById = new Map((customerRows ?? []).map((c) => [c.id, c]));

    const mapped: LiveNewOrder[] = orderRows.map((o) => {
      const customer = o.customer_id ? customerById.get(o.customer_id) : undefined;
      const items: LiveNewOrderItem[] = (itemRows ?? [])
        .filter((it) => it.order_id === o.id)
        .map((it) => {
          if (it.resolved_catalog_item_id) {
            const cat = catalogById.get(it.resolved_catalog_item_id);
            return {
              itemId: it.id,
              n: cat?.name ?? it.spoken_text,
              q: it.quantity_text,
              vague: false,
              guess: "",
              guessWhy: "",
              guessedId: null,
              category: cat?.category ?? null,
            };
          }
          if (it.guessed_catalog_item_id) {
            const cat = catalogById.get(it.guessed_catalog_item_id);
            return {
              itemId: it.id,
              n: `"${it.spoken_text}"`,
              q: it.quantity_text,
              vague: true,
              guess: cat ? `${cat.name} (${cat.unit})` : "",
              guessWhy: it.guess_reason ?? "",
              guessedId: it.guessed_catalog_item_id,
              category: cat?.category ?? null,
            };
          }
          return {
            itemId: it.id,
            n: `"${it.spoken_text}" (samajh nahi aaya)`,
            q: it.quantity_text,
            vague: false,
            guess: "",
            guessWhy: "",
            guessedId: null,
            category: null,
          };
        });

      const createdAt = parseUtc(o.created_at);
      return {
        id: `live-${o.id}`,
        dbId: o.id,
        customerId: o.customer_id,
        cust: customer?.name ?? "Grahak",
        phone: customer?.phone ?? "",
        time: createdAt
          ? createdAt.toLocaleTimeString("en-IN", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          : "",
        items,
        total: Number(o.total),
      };
    });

    setLiveNewOrders(mapped);
  };

  useEffect(() => {
    if (!hydrated) return;
    fetchLiveNewOrders();
    const interval = setInterval(fetchLiveNewOrders, 20000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const acceptLiveOrder = async (liveId: string) => {
    const dbId = Number(liveId.replace("live-", ""));
    const { error } = await supabase
      .from("orders")
      .update({ state: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", dbId);
    if (error) {
      console.error("[orders] accept failed:", error.message);
      showToast("Order accept nahi ho paaya, dobara try karein", () => {});
      return;
    }
    setLiveNewOrders((prev) => prev.filter((o) => o.id !== liveId));
    showToast("Order pakka ho gaya", () => {
      void supabase
        .from("orders")
        .update({ state: "new", accepted_at: null })
        .eq("id", dbId)
        .then(() => fetchLiveNewOrders());
    });
  };

  const fetchLiveTracking = async () => {
    const { data: orderRows, error: ordersError } = await supabase
      .from("orders")
      .select("id, customer_id, state, total, accepted_at, delivered_at")
      .in("state", ["accepted", "delivered"]);
    if (ordersError || !orderRows) {
      console.error("[tracking] fetch failed:", ordersError?.message);
      return;
    }
    if (orderRows.length === 0) {
      setLiveTracking({ accepted: [], delivered: [] });
      return;
    }

    const orderIds = orderRows.map((o) => o.id);
    const customerIds = Array.from(
      new Set(orderRows.map((o) => o.customer_id).filter((v): v is number => v !== null)),
    );

    const [{ data: itemRows }, { data: customerRows }] = await Promise.all([
      supabase
        .from("order_items")
        .select("order_id, spoken_text, resolved_catalog_item_id, guessed_catalog_item_id")
        .in("order_id", orderIds),
      supabase.from("customers").select("id, name").in("id", customerIds),
    ]);

    const catalogIds = Array.from(
      new Set(
        (itemRows ?? [])
          .flatMap((it) => [it.resolved_catalog_item_id, it.guessed_catalog_item_id])
          .filter((v): v is number => v !== null),
      ),
    );
    const { data: catalogRows } = catalogIds.length
      ? await supabase.from("catalog_items").select("id, name").in("id", catalogIds)
      : { data: [] as { id: number; name: string }[] };

    const catalogById = new Map((catalogRows ?? []).map((c) => [c.id, c]));
    const customerById = new Map((customerRows ?? []).map((c) => [c.id, c]));

    const mapped: LiveTrackingOrder[] = orderRows.map((o) => {
      const itemSummary = (itemRows ?? [])
        .filter((it) => it.order_id === o.id)
        .map((it) => {
          if (it.resolved_catalog_item_id)
            return catalogById.get(it.resolved_catalog_item_id)?.name ?? it.spoken_text;
          if (it.guessed_catalog_item_id)
            return catalogById.get(it.guessed_catalog_item_id)?.name ?? it.spoken_text;
          return it.spoken_text;
        })
        .join(", ");

      return {
        dbId: o.id,
        customerId: o.customer_id,
        state: o.state === "delivered" ? ("delivered" as const) : ("accepted" as const),
        cust: (o.customer_id ? customerById.get(o.customer_id)?.name : undefined) ?? "Grahak",
        summary: itemSummary,
        total: Number(o.total),
        acceptedAt: o.accepted_at,
        deliveredAt: o.delivered_at,
      };
    });

    const byDateDesc = (a: string | null, b: string | null) => {
      const da = parseUtc(a);
      const db = parseUtc(b);
      return (db?.getTime() ?? 0) - (da?.getTime() ?? 0);
    };

    setLiveTracking({
      accepted: mapped
        .filter((o) => o.state === "accepted")
        .sort((a, b) => byDateDesc(a.acceptedAt, b.acceptedAt)),
      delivered: mapped
        .filter((o) => o.state === "delivered")
        .sort((a, b) => byDateDesc(a.deliveredAt, b.deliveredAt)),
    });
  };

  useEffect(() => {
    if (!hydrated) return;
    fetchLiveTracking();
    const interval = setInterval(fetchLiveTracking, 20000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const postDeliveryCharge = async (
    orderId: number,
    customerId: number | null,
    total: number,
    itemSummary: string,
  ): Promise<number | null> => {
    if (customerId === null) {
      console.error("[ledger] cannot post charge: order", orderId, "has no customer");
      return null;
    }
    const { data, error } = await supabase
      .from("ledger_entries")
      .insert({
        customer_id: customerId,
        order_id: orderId,
        type: "charge",
        amount: total,
        note: "Order liya - " + itemSummary,
      })
      .select("id")
      .single();
    if (error || !data) {
      console.error("[ledger] charge insert FAILED for order", orderId, error?.message);
      return null;
    }
    return data.id;
  };

  const reverseOrderCharge = async (
    orderId: number,
    customerId: number | null,
    total: number,
    note: string,
  ) => {
    if (customerId === null) {
      console.error("[ledger] cannot reverse charge: order", orderId, "has no customer");
      return;
    }
    const { data: reversals, error: reversalError } = await supabase
      .from("ledger_entries")
      .select("reverses_entry_id")
      .not("reverses_entry_id", "is", null);
    if (reversalError) {
      console.error("[ledger] reversal lookup FAILED for order", orderId, reversalError.message);
      return;
    }
    const reversedIds = (reversals ?? [])
      .map((r) => r.reverses_entry_id)
      .filter((v): v is number => v !== null);

    let query = supabase
      .from("ledger_entries")
      .select("id")
      .eq("order_id", orderId)
      .eq("type", "charge")
      .order("created_at", { ascending: false })
      .limit(1);
    if (reversedIds.length) query = query.not("id", "in", `(${reversedIds.join(",")})`);

    const { data: charges, error: chargeError } = await query;
    if (chargeError) {
      console.error("[ledger] charge lookup FAILED for order", orderId, chargeError.message);
      return;
    }
    const charge = (charges ?? [])[0];
    if (!charge) {
      console.error("[ledger] no unreversed charge found for order", orderId, "- skipping reversal");
      return;
    }

    const { error } = await supabase.from("ledger_entries").insert({
      customer_id: customerId,
      order_id: orderId,
      type: "reversal",
      amount: -total,
      note,
      reverses_entry_id: charge.id,
    });
    if (error) console.error("[ledger] reversal insert FAILED for order", orderId, error.message);
  };

  const markDelivered = async (o: LiveTrackingOrder) => {
    const { error } = await supabase
      .from("orders")
      .update({ state: "delivered", delivered_at: new Date().toISOString() })
      .eq("id", o.dbId);
    if (error) {
      console.error("[tracking] mark delivered failed:", error.message);
      showToast("Delivery mark nahi ho paayi, dobara try karein", () => {});
      return;
    }
    await postDeliveryCharge(o.dbId, o.customerId, o.total, o.summary);
    await fetchLiveTracking();
    showToast(o.cust + " — deliver ho gaya", () => {
      void (async () => {
        const { error: undoError } = await supabase
          .from("orders")
          .update({ state: "accepted", delivered_at: null })
          .eq("id", o.dbId);
        if (undoError) {
          console.error("[tracking] undo delivery failed:", undoError.message);
          showToast("Undo nahi ho paaya, dobara try karein", () => {});
          return;
        }
        await reverseOrderCharge(o.dbId, o.customerId, o.total, "Delivery undo - " + o.summary);
        await fetchLiveTracking();
      })();
    });
  };

  const markUndelivered = async (o: LiveTrackingOrder) => {
    const { error } = await supabase
      .from("orders")
      .update({ state: "accepted", delivered_at: null })
      .eq("id", o.dbId);
    if (error) {
      console.error("[tracking] mark undelivered failed:", error.message);
      showToast("Wapas baaki mein daalna nahi ho paaya", () => {});
      return;
    }
    await reverseOrderCharge(o.dbId, o.customerId, o.total, "Delivery undo - " + o.summary);
    await fetchLiveTracking();
    showToast(o.cust + " — wapas 'baaki' mein daala", () => {
      void (async () => {
        const { error: undoError } = await supabase
          .from("orders")
          .update({ state: "delivered", delivered_at: new Date().toISOString() })
          .eq("id", o.dbId);
        if (undoError) {
          console.error("[tracking] re-mark delivered failed:", undoError.message);
          showToast("Undo nahi ho paaya, dobara try karein", () => {});
          return;
        }
        await postDeliveryCharge(o.dbId, o.customerId, o.total, o.summary);
        await fetchLiveTracking();
      })();
    });
  };


  const fetchLiveCatalogItems = async () => {
    const { data, error } = await supabase
      .from("catalog_items")
      .select("id, category, name, unit, price, is_active, times_ordered")
      .eq("is_active", true)
      .order("category", { ascending: true })
      .order("name", { ascending: true });
    if (error) {
      console.error("[rates] fetch failed:", error.message);
      return;
    }
    setLiveCatalogItems((data ?? []).map((r) => ({ ...r, price: Number(r.price) })));
  };

  useEffect(() => {
    if (!hydrated) return;
    fetchLiveCatalogItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const fetchLiveCustomers = async () => {
    const [{ data: customerRows, error: custError }, { data: balanceRows, error: balError }] =
      await Promise.all([
        supabase.from("customers").select("id, name, phone").order("name", { ascending: true }),
        supabase.from("customer_balances").select("customer_id, balance"),
      ]);
    if (custError || !customerRows) {
      console.error("[khata] customers fetch failed:", custError?.message);
      return;
    }
    if (balError) console.error("[khata] balances fetch failed:", balError.message);
    const balanceById = new Map(
      (balanceRows ?? [])
        .filter((b): b is { customer_id: number; balance: number | null } => b.customer_id !== null)
        .map((b) => [b.customer_id, Number(b.balance ?? 0)]),
    );
    setLiveCustomers(
      customerRows.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        balance: balanceById.get(c.id) ?? 0,
      })),
    );
  };

  useEffect(() => {
    if (!hydrated) return;
    fetchLiveCustomers();
    const interval = setInterval(fetchLiveCustomers, 20000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const fetchCustomerDetail = async (customerId: number) => {
    const [{ data: entryRows, error: entryError }, { data: prefRows, error: prefError }] =
      await Promise.all([
        supabase
          .from("ledger_entries")
          .select("id, type, amount, note, created_at")
          .eq("customer_id", customerId)
          .order("created_at", { ascending: false }),
        supabase
          .from("customer_preferences")
          .select("id, note, catalog_item_id, catalog_items!inner(id, category, name)")
          .eq("customer_id", customerId),
      ]);
    if (entryError) console.error("[khata] ledger fetch failed:", entryError.message);
    else
      setLiveEntries(
        (entryRows ?? []).map((e) => ({
          id: e.id,
          type: e.type,
          amount: Number(e.amount),
          note: e.note,
          created_at: e.created_at,
        })),
      );

    if (prefError) console.error("[khata] prefs fetch failed:", prefError.message);
    else
      setLivePrefs(
        (prefRows ?? []).map((p) => ({
          id: p.id,
          catalogItemId: p.catalog_item_id,
          cat: p.catalog_items?.category ?? "",
          item: p.catalog_items?.name ?? "",
          note: p.note ?? "",
        })),
      );
  };

  const openCustomerId = s.custId ? Number(s.custId) : null;

  useEffect(() => {
    if (!hydrated) return;
    if (openCustomerId === null || Number.isNaN(openCustomerId)) {
      setLiveEntries([]);
      setLivePrefs([]);
      return;
    }
    fetchCustomerDetail(openCustomerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, openCustomerId]);

  // customer_preferences has no DB uniqueness on (customer, category) — the
  // one-preference-per-category rule is enforced here, in the app layer.
  const upsertPreference = async (
    customerId: number,
    category: string,
    catalogItemId: number,
    note: string,
  ): Promise<(() => Promise<void>) | null> => {
    const { data: existingRows, error: lookupError } = await supabase
      .from("customer_preferences")
      .select("id, note, catalog_item_id, catalog_items!inner(category)")
      .eq("customer_id", customerId)
      .eq("catalog_items.category", category)
      .limit(1);
    if (lookupError) {
      console.error("[prefs] lookup failed:", lookupError.message);
      return null;
    }
    const existing = (existingRows ?? [])[0];

    if (existing) {
      const before = { catalog_item_id: existing.catalog_item_id, note: existing.note };
      const rowId = existing.id;
      const { error } = await supabase
        .from("customer_preferences")
        .update({ catalog_item_id: catalogItemId, note })
        .eq("id", rowId);
      if (error) {
        console.error("[prefs] update failed:", error.message);
        return null;
      }
      return async () => {
        const { error: undoError } = await supabase
          .from("customer_preferences")
          .update(before)
          .eq("id", rowId);
        if (undoError) console.error("[prefs] undo update failed:", undoError.message);
      };
    }

    const { data: created, error } = await supabase
      .from("customer_preferences")
      .insert({ customer_id: customerId, catalog_item_id: catalogItemId, note })
      .select("id")
      .single();
    if (error || !created) {
      console.error("[prefs] insert failed:", error?.message);
      return null;
    }
    const newId = created.id;
    return async () => {
      const { error: undoError } = await supabase
        .from("customer_preferences")
        .delete()
        .eq("id", newId);
      if (undoError) console.error("[prefs] undo insert failed:", undoError.message);
    };
  };

  const resolveOrderItem = async (
    orderItemId: number,
    catalogItemId: number,
    category: string | null,
    customerId: number | null,
    label: string,
  ) => {
    const { error } = await supabase
      .from("order_items")
      .update({ resolved_catalog_item_id: catalogItemId })
      .eq("id", orderItemId);
    if (error) {
      console.error("[orders] resolve item failed:", error.message);
      showToast("Save nahi ho paaya, dobara try karein", () => {});
      return;
    }
    const undoPref =
      customerId !== null && category
        ? await upsertPreference(customerId, category, catalogItemId, "Order se yaad rakha")
        : null;
    await fetchLiveNewOrders();
    if (openCustomerId !== null) await fetchCustomerDetail(openCustomerId);
    showToast(label, () => {
      void (async () => {
        const { error: undoError } = await supabase
          .from("order_items")
          .update({ resolved_catalog_item_id: null })
          .eq("id", orderItemId);
        if (undoError) console.error("[orders] undo resolve failed:", undoError.message);
        if (undoPref) await undoPref();
        await fetchLiveNewOrders();
        if (openCustomerId !== null) await fetchCustomerDetail(openCustomerId);
      })();
    });
  };

  const submitItem = async () => {
    const name = s.itName.trim();
    const category = s.itCategory.trim();
    const price = parseInt(s.itPrice || "0", 10) || 0;
    const unit = s.itUnit.trim() || "per nag";
    if (!name || !category) {
      update({ sheet: null });
      return;
    }

    if (s.editId) {
      const dbId = Number(s.editId);
      const before = liveCatalogItems.find((i) => i.id === dbId);
      update({ sheet: null });
      const { error } = await supabase.from("catalog_items").update({ name, unit, price, category }).eq("id", dbId);
      if (error) {
        console.error("[rates] update failed:", error.message);
        showToast("Rate update nahi ho paaya: " + error.message, () => {});
        return;
      }
      await fetchLiveCatalogItems();
      showToast(name + " ka rate " + rs(price) + " kar diya", () => {
        if (!before) return;
        void supabase
          .from("catalog_items")
          .update({ name: before.name, unit: before.unit, price: before.price, category: before.category })
          .eq("id", dbId)
          .then(() => fetchLiveCatalogItems());
      });
      return;
    }

    const { data: created, error } = await supabase
      .from("catalog_items")
      .insert({ name, unit, price, category, is_active: true })
      .select("id")
      .single();
    update({ sheet: null });
    if (error || !created) {
      const message =
        error?.code === "23505" ? name + " is category mein pehle se hai" : "Item add nahi ho paaya: " + (error?.message ?? "unknown error");
      console.error("[rates] insert failed:", error?.message);
      showToast(message, () => {});
      return;
    }
    await fetchLiveCatalogItems();
    const newId = created.id;
    showToast(name + " list mein jud gaya", () => {
      void supabase
        .from("catalog_items")
        .delete()
        .eq("id", newId)
        .then(() => fetchLiveCatalogItems());
    });
  };

  const pending = s.orders.filter((o) => o.state === "accepted");
  const delivered = s.orders.filter((o) => o.state === "delivered");
  const summary = (items: { n: string }[]) => items.map((i) => i.n.split(" (")[0]).join(", ");

  const cust: LiveCustomer =
    liveCustomers.find((c) => String(c.id) === s.custId) ||
    liveCustomers[0] || { id: 0, name: "", phone: "", balance: 0 };
  const totalDue = liveCustomers.reduce((a, c) => a + c.balance, 0);
  const payNum = parseInt(s.pay || "0", 10) || 0;

  const parseUtc = (iso: string | null | undefined): Date | null => {
    if (!iso) return null;
    return new Date(/[Zz]$/.test(iso) ? iso : iso + "Z");
  };

  const entryWhen = (iso: string) => {
    const d = parseUtc(iso);
    if (!d) return "";
    const now = new Date();
    const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
    const sameDay =
      d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (sameDay) return "Aaj, " + time;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + ", " + time;
  };

  const newOrders: NewOrderView[] = liveNewOrders.map((o) => ({
    id: o.id,
    cust: o.cust,
    phone: o.phone,
    time: o.time,
    telHref: telHref(o.phone),
    totalText: rs(o.total),
    items: o.items.map((it, ix) => ({
      n: it.n,
      q: it.q,
      isVague: it.vague,
      isFixed: false,
      fixedText: "",
      guess: it.guess,
      guessWhy: it.guessWhy,
      onConfirm: () => {
        if (it.guessedId === null) return;
        void resolveOrderItem(
          it.itemId,
          it.guessedId,
          it.category,
          o.customerId,
          it.guess.split(" (")[0] + " — pakka, pasand mein yaad rakha",
        );
      },
      onChange: () =>
        update({
          sheet: "pref",
          prefKey: o.id + ":" + ix,
          prefRowId: null,
          prefOrderItemId: it.itemId,
          prefOrderCustomerId: o.customerId,
          prefFromOrder: true,
          prefCustName: o.cust,
          prefCat: it.category ?? "",
          prefPick: it.guessedId ? it.guess.split(" (")[0] ?? "" : "",
          prefPickId: it.guessedId,
          prefNote: "",
          prefPhrase: it.n.replace(/^"|"$/g, ""),
        }),
    })),
    onAccept: () => {
      void acceptLiveOrder(o.id);
    },
  }));

  const pendingOrders = liveTracking.accepted.map((o) => ({
    id: `live-${o.dbId}`,
    cust: o.cust,
    totalText: rs(o.total),
    summary: o.summary,
    onToggle: () => {
      void markDelivered(o);
    },
  }));

  const deliveredOrders = liveTracking.delivered.map((o) => ({
    id: `live-${o.dbId}`,
    cust: o.cust,
    totalText: rs(o.total),
    summary: o.summary,
    onToggle: () => {
      void markUndelivered(o);
    },
  }));


  const customerRows = liveCustomers.map((c) => ({
    id: String(c.id),
    name: c.name,
    phone: c.phone,
    initial: c.name.charAt(0),
    dueText: rs(c.balance > 0 ? c.balance : 0),
    dueLabel: c.balance > 0 ? "Baaki" : "Chukta",
    dueColor: c.balance > 0 ? "var(--color-destructive)" : "var(--color-success)",
    onOpen: () => {
      update({ custId: String(c.id), screen: "customer" });
      window.scrollTo(0, 0);
    },
  }));

  const entryLabel = (type: string) =>
    type === "payment" ? "Paisa mila" : type === "reversal" ? "Sudhaar" : "Order liya";

  const custDetail = {
    name: cust.name,
    phone: cust.phone,
    telHref: telHref(cust.phone),
    dueText: rs(cust.balance),
    dueColor: cust.balance > 0 ? "var(--color-destructive)" : "var(--color-success)",
    prefCount: livePrefs.length,
    prefs: livePrefs.map((p) => ({
      cat: p.cat,
      item: p.item,
      note: p.note,
      onEdit: () =>
        update({
          sheet: "pref",
          prefKey: null,
          prefRowId: p.id,
          prefOrderItemId: null,
          prefOrderCustomerId: null,
          prefFromOrder: false,
          prefCustName: cust.name,
          prefCat: p.cat,
          prefPick: p.item,
          prefPickId: p.catalogItemId,
          prefNote: p.note,
          prefPhrase: "",
        }),
    })),
    entries: liveEntries.map((e) => {
      const label = entryLabel(e.type);
      const note = (e.note ?? "").replace(/^(Order liya|Paisa mila)\s*-\s*/i, "").trim();
      const positive = e.amount >= 0;
      return {
        label,
        sub: entryWhen(e.created_at) + (note ? " · " + note : ""),
        glyph: e.type === "payment" ? "₹" : e.type === "reversal" ? "↺" : "✓",
        dotBg:
          e.type === "payment"
            ? "var(--color-success)"
            : e.type === "reversal"
              ? "var(--color-accent)"
              : "var(--color-secondary)",
        dotInk: e.type === "payment" ? "#FFFFFF" : "var(--color-ink)",
        amtText: (positive ? "+ " : "− ") + rs(Math.abs(e.amount)),
        amtColor: positive ? "var(--color-destructive)" : "var(--color-success)",
      };
    }),
  };

  const submitPay = async () => {
    if (payNum <= 0 || !cust.id) {
      update({ sheet: null, pay: "" });
      return;
    }
    const customerId = cust.id;
    update({ sheet: null, pay: "" });
    const { data: created, error } = await supabase
      .from("ledger_entries")
      .insert({
        customer_id: customerId,
        type: "payment",
        amount: -payNum,
        note: "Paisa mila - Cash",
      })
      .select("id")
      .single();
    if (error || !created) {
      console.error("[khata] payment insert failed:", error?.message);
      showToast("Paisa likha nahi jaa saka, dobara try karein", () => {});
      return;
    }
    await Promise.all([fetchLiveCustomers(), fetchCustomerDetail(customerId)]);
    const paymentId = created.id;
    showToast(rs(payNum) + " khate mein likh diya", () => {
      void (async () => {
        const { error: undoError } = await supabase.from("ledger_entries").insert({
          customer_id: customerId,
          type: "reversal",
          amount: payNum,
          note: "Payment undo",
          reverses_entry_id: paymentId,
        });
        if (undoError) console.error("[khata] payment reversal failed:", undoError.message);
        await Promise.all([fetchLiveCustomers(), fetchCustomerDetail(customerId)]);
      })();
    });
  };

  const submitCustomer = async () => {
    const name = s.newName.trim();
    if (!name) {
      update({ sheet: null });
      return;
    }
    const phone = s.newPhone.trim() || "—";
    update({ sheet: null });
    const { data: created, error } = await supabase
      .from("customers")
      .insert({ name, phone })
      .select("id")
      .single();
    if (error || !created) {
      const message =
        error?.code === "23505"
          ? "Yeh phone number pehle se kisi grahak ka hai"
          : "Grahak add nahi ho paaya: " + (error?.message ?? "unknown error");
      console.error("[khata] customer insert failed:", error?.message);
      showToast(message, () => {});
      return;
    }
    await fetchLiveCustomers();
    const newId = created.id;
    showToast(name + " khate mein jud gaye", () => {
      void supabase
        .from("customers")
        .delete()
        .eq("id", newId)
        .then(() => fetchLiveCustomers());
    });
  };

  const submitPref = async () => {
    const catName = s.prefCat.trim();
    const pickId = s.prefPickId;
    const pick = s.prefPick;
    if (!catName || pickId === null) {
      update({ sheet: null });
      return;
    }

    if (s.prefFromOrder && s.prefOrderItemId !== null) {
      const orderItemId = s.prefOrderItemId;
      const orderCustomerId = s.prefOrderCustomerId;
      update({ sheet: null });
      await resolveOrderItem(
        orderItemId,
        pickId,
        catName,
        orderCustomerId,
        pick + " lag gaya, pasand mein yaad rakha",
      );
      return;
    }

    const customerId = cust.id;
    if (!customerId) {
      update({ sheet: null });
      return;
    }
    const note = s.prefNote.trim();
    const existingRow = s.prefRowId !== null ? livePrefs.find((p) => p.id === s.prefRowId) : undefined;
    update({ sheet: null });

    const undoPref = await upsertPreference(customerId, catName, pickId, note);
    if (!undoPref) {
      showToast("Pasand save nahi ho paayi, dobara try karein", () => {});
      return;
    }

    // Editing a pref into a different category: the upsert above wrote the row
    // for the new category, so the old row must go — one pref per category.
    let undoOldRow: (() => Promise<void>) | null = null;
    if (existingRow && existingRow.cat !== catName) {
      const { error } = await supabase.from("customer_preferences").delete().eq("id", existingRow.id);
      if (error) console.error("[prefs] old row delete failed:", error.message);
      else
        undoOldRow = async () => {
          const { error: undoError } = await supabase.from("customer_preferences").insert({
            customer_id: customerId,
            catalog_item_id: existingRow.catalogItemId,
            note: existingRow.note,
          });
          if (undoError) console.error("[prefs] old row restore failed:", undoError.message);
        };
    }

    await fetchCustomerDetail(customerId);
    showToast(catName + ": " + pick + " yaad rakh liya", () => {
      void (async () => {
        await undoPref();
        if (undoOldRow) await undoOldRow();
        await fetchCustomerDetail(customerId);
      })();
    });
  };

  const catalogByCategory = new Map<string, CatalogItemRow[]>();
  for (const it of liveCatalogItems) {
    if (!it.is_active) continue;
    const list = catalogByCategory.get(it.category) ?? [];
    list.push(it);
    catalogByCategory.set(it.category, list);
  }
  for (const list of catalogByCategory.values()) list.sort((a, b) => b.times_ordered - a.times_ordered);

  const catChips = Array.from(catalogByCategory.keys()).map((k) => ({
    n: k,
    bg: s.prefCat === k ? "var(--color-secondary)" : "var(--color-card)",
    ink: s.prefCat === k ? "var(--color-primary)" : "var(--color-ink)",
    border: s.prefCat === k ? "var(--color-primary)" : "var(--color-warm-border)",
    onPick: () => update({ prefCat: k, prefPick: "", prefPickId: null }),
  }));
  const choiceList = catalogByCategory.get(s.prefCat) ?? [];
  const noChoices = choiceList.length === 0;
  const prefChoices = choiceList.map((c, i) => {
    const picked = s.prefPickId === c.id;
    return {
      n: c.name,
      sub: rs(c.price) + " · " + c.unit,
      picked,
      isTop: i === 0,
      bg: picked ? "oklch(0.95 0.04 155 / 0.25)" : "var(--color-card)",
      border: picked ? "var(--color-success)" : "var(--color-warm-border)",
      dotBorder: picked ? "var(--color-success)" : "oklch(0.72 0.06 90)",
      dotBg: picked ? "var(--color-success)" : "var(--color-card)",
      onPick: () => update({ prefCat: c.category, prefPick: c.name, prefPickId: c.id }),
    };
  });

  const keys = KEY_DEFS.map((k) => ({
    label: k,
    bg: k === "Mitao" ? "var(--color-secondary)" : k === "500" ? "var(--color-secondary)" : "var(--color-card)",
    onTap: () => {
      if (k === "Mitao") update((prev) => ({ pay: prev.pay.slice(0, -1) }));
      else if (k === "500") update((prev) => ({ pay: String((parseInt(prev.pay || "0", 10) || 0) + 500) }));
      else update((prev) => ({ pay: (prev.pay + k).slice(0, 6) }));
    },
  }));

  const rateItems = liveCatalogItems.map((i) => ({
    n: i.name,
    u: i.unit,
    priceText: rs(i.price),
    onEdit: () =>
      update({
        sheet: "item",
        editId: String(i.id),
        itName: i.name,
        itCategory: i.category,
        itUnit: i.unit,
        itPrice: String(i.price),
      }),
    onDelete: () => {
      void (async () => {
        const { error } = await supabase
          .from("catalog_items")
          .update({ is_active: false })
          .eq("id", i.id);
        if (error) {
          console.error("[rates] soft-delete failed:", error.message);
          showToast("Item hata nahi paaye, dobara try karein", () => {});
          return;
        }
        await fetchLiveCatalogItems();
        showToast(i.name + " list se hata diya", () => {
          void supabase
            .from("catalog_items")
            .update({ is_active: true })
            .eq("id", i.id)
            .then(() => fetchLiveCatalogItems());
        });
      })();
    },
  }));

  if (!hydrated) {
    return (
      <Shell>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-xl font-extrabold text-ink-muted">DukaanDost</div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {s.screen === "login" && <LoginScreen onLogin={() => go("home")} />}

      {s.screen === "home" && (
        <HomeScreen
          todayCount={s.orders.length + liveNewOrders.length}
          pendingCount={liveTracking.accepted.length}
          newCount={liveNewOrders.length}
          hasNew={liveNewOrders.length > 0}
          newCountLabel={liveNewOrders.length ? liveNewOrders.length + " order dekhna baaki" : "Sab dekh liye"}
          trackingSub={
            liveTracking.accepted.length + " delivery baaki, " + liveTracking.delivered.length + " ho gayi"
          }

          khataSub={liveCustomers.length + " grahak · " + rs(totalDue) + " baaki"}
          ratesSub={liveCatalogItems.length + " item ke rate saved"}
          onLogout={() => go("login")}
          onGoOrders={() => go("orders")}
          onGoTracking={() => go("tracking")}
          onGoKhata={() => go("khata")}
          onGoRates={() => go("rates")}
        />
      )}

      {s.screen === "orders" && <OrdersScreen orders={newOrders} onGoHome={() => go("home")} />}

      {s.screen === "tracking" && (
        <TrackingScreen
          pendingCount={liveTracking.accepted.length}
          pendingOrders={pendingOrders}
          deliveredCount={liveTracking.delivered.length}

          deliveredOrders={deliveredOrders}
          onGoHome={() => go("home")}
        />
      )}

      {s.screen === "khata" && (
        <KhataScreen
          totalDueText={rs(totalDue)}
          customers={customerRows}
          onGoHome={() => go("home")}
          onOpenAddCustomer={() => update({ sheet: "add", newName: "", newPhone: "" })}
        />
      )}

      {s.screen === "customer" && (
        <CustomerScreen
          cust={custDetail}
          onGoKhata={() => go("khata")}
          onOpenAddPref={() =>
            update({
              sheet: "pref",
              prefKey: null,
              prefRowId: null,
              prefOrderItemId: null,
              prefOrderCustomerId: null,
              prefFromOrder: false,
              prefCustName: cust.name,
              prefCat: "",
              prefPick: "",
              prefPickId: null,
              prefNote: "",
              prefPhrase: "",
            })
          }
          onOpenPay={() => update({ sheet: "pay", pay: "" })}
        />
      )}

      {s.screen === "rates" && (
        <RateListScreen
          hasUpload={!!s.uploadName}
          uploadName={s.uploadName || ""}
          onFileChosen={async (f) => {
            update({ uploadName: f.name + " — padh kar raha hoon..." });
            try {
              const formData = new FormData();
              formData.append('file', f);
              const res = await fetch('/api/public/parse-rate-list', {
                method: 'POST',
                body: formData,
              });
              const json = await res.json() as { inserted?: number; skipped?: number; total?: number; error?: string };
              if (!res.ok || json.error) {
                update({ uploadName: f.name + " — kuch galat hua" });
                showToast("Image padh nahi paaye: " + (json.error ?? "dobara try karein"), () => update({ uploadName: null }));
                return;
              }
              const { inserted = 0, skipped = 0, total = 0 } = json;
              update({ uploadName: f.name + " — padh liya ✓" });
              await fetchLiveCatalogItems();
              const msg = inserted > 0
                ? `${inserted} item rate list mein jud gaye${skipped > 0 ? `, ${skipped} pehle se the` : ''}`
                : skipped > 0
                  ? `Sab ${skipped} item pehle se rate list mein hain`
                  : `Image mein koi item nahi mila (total parsed: ${total})`;
              showToast(msg, () => update({ uploadName: null }));
            } catch (err) {
              console.error('[parse-rate-list] client fetch failed:', err);
              update({ uploadName: f.name + " — kuch galat hua" });
              showToast("Network error, dobara try karein", () => update({ uploadName: null }));
            }
          }}
          itemCount={liveCatalogItems.length}
          rateItems={rateItems}
          onOpenAddItem={() => update({ sheet: "item", editId: null, itName: "", itCategory: "", itUnit: "", itPrice: "" })}
          onClearAll={() => {
            void (async () => {
              const ids = liveCatalogItems.map((i) => i.id);
              if (ids.length === 0) return;
              const { error } = await supabase
                .from("catalog_items")
                .update({ is_active: false })
                .in("id", ids);
              if (error) {
                console.error("[rates] clear-all failed:", error.message);
                showToast("List saaf nahi ho paayi, dobara try karein", () => {});
                return;
              }
              await fetchLiveCatalogItems();
              showToast("Poori rate list saaf ho gayi", () => {
                void supabase
                  .from("catalog_items")
                  .update({ is_active: true })
                  .in("id", ids)
                  .then(() => fetchLiveCatalogItems());
              });
            })();
          }}
          onGoHome={() => go("home")}
        />
      )}

      {s.sheet === "pay" && (
        <PaySheet
          payAmountText={rs(payNum)}
          payHint={payNum > 0 ? cust.name + " ke khate mein" : "Number dabaiye"}
          keys={keys}
          onClose={() => update({ sheet: null })}
          onSubmit={() => void submitPay()}
        />
      )}

      {s.sheet === "add" && (
        <AddCustomerSheet
          newName={s.newName}
          newPhone={s.newPhone}
          onNameChange={(v) => update({ newName: v })}
          onPhoneChange={(v) => update({ newPhone: v })}
          onClose={() => update({ sheet: null })}
          onSubmit={() => void submitCustomer()}
        />
      )}

      {s.sheet === "item" && (
        <ItemSheet
          title={s.editId ? "Rate Badlein" : "Naya Item Jodiye"}
          itName={s.itName}
          itCategory={s.itCategory}
          itUnit={s.itUnit}
          itPrice={s.itPrice}
          onItNameChange={(v) => update({ itName: v })}
          onItCategoryChange={(v) => update({ itCategory: v })}
          onItUnitChange={(v) => update({ itUnit: v })}
          onItPriceChange={(v) => update({ itPrice: v.replace(/[^0-9]/g, "") })}
          onClose={() => update({ sheet: null })}
          onSubmit={() => void submitItem()}
        />
      )}

      {s.sheet === "pref" && (
        <PrefSheet
          title={s.prefFromOrder ? "Yeh kaunsa saman?" : s.prefRowId !== null ? "Pasand Badlein" : "Pasand Jodiye"}
          subtitle={s.prefFromOrder ? s.prefCustName + " ne kaha: " + s.prefPhrase : s.prefCustName + " ke liye"}
          prefCat={s.prefCat}
          onPrefCatChange={() => {}}
          catChips={catChips}
          noChoices={noChoices}
          prefChoices={prefChoices}
          prefNote={s.prefNote}
          onPrefNoteChange={(v) => update({ prefNote: v })}
          onClose={() => update({ sheet: null })}
          onSubmit={() => void submitPref()}
        />
      )}

      {s.toast && (
        <Toast
          text={s.toast.text}
          onUndo={() => {
            s.toast!.undo();
            clearTimeout(timer.current);
            update({ toast: null });
          }}
        />
      )}

      {s.screen !== "login" && <BottomNav screen={s.screen} onGo={go} />}
    </Shell>
  );
}
