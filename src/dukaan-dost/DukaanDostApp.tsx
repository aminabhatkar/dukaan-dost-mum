import { useEffect, useRef, useState } from "react";
import type { Customer, Order, RateItem, Screen, Sheet } from "./types";
import { CATALOG, CUSTOMERS, ITEMS, ORDERS } from "./data";
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
  itUnit: string;
  itPrice: string;
  uploadName: string | null;
  resolved: Record<string, string>;
  prefKey: string | null;
  prefEditIdx: number | null;
  prefFromOrder: boolean;
  prefCustName: string;
  prefCat: string;
  prefPick: string;
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
  itUnit: "",
  itPrice: "",
  uploadName: null,
  resolved: {},
  prefKey: null,
  prefEditIdx: null,
  prefFromOrder: false,
  prefCustName: "",
  prefCat: "",
  prefPick: "",
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

export default function DukaanDostApp() {
  const [s, setS] = useState<AppState>(initialState);
  const [hydrated, setHydrated] = useState(false);
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

  const news = s.orders.filter((o) => o.state === "new");
  const pending = s.orders.filter((o) => o.state === "accepted");
  const delivered = s.orders.filter((o) => o.state === "delivered");
  const summary = (items: { n: string }[]) => items.map((i) => i.n.split(" (")[0]).join(", ");

  const cust = s.customers.find((c) => c.id === s.custId) || s.customers[0];
  const totalDue = s.customers.reduce((a, c) => a + c.due, 0);
  const payNum = parseInt(s.pay || "0", 10) || 0;

  const newOrders: NewOrderView[] = news.map((o) => ({
    id: o.id,
    cust: o.cust,
    phone: o.phone,
    time: o.time,
    telHref: telHref(o.phone),
    totalText: rs(o.total),
    items: o.items.map((it, ix) => {
      const key = o.id + ":" + ix;
      const fixed = s.resolved[key];
      return {
        n: it.n,
        q: it.q,
        isVague: !!it.vague && !fixed,
        isFixed: !!fixed,
        fixedText: fixed ? fixed + " — pakka" : "",
        guess: it.guess || "",
        guessWhy: it.guessWhy || "",
        onConfirm: () => {
          update((prev) => ({ resolved: { ...prev.resolved, [key]: it.guess! } }));
          showToast(it.guess + " lag gaya", () =>
            update((prev) => {
              const r = { ...prev.resolved };
              delete r[key];
              return { resolved: r };
            })
          );
        },
        onChange: () =>
          update({
            sheet: "pref",
            prefKey: key,
            prefEditIdx: null,
            prefFromOrder: true,
            prefCustName: o.cust,
            prefCat: it.cat || "",
            prefPick: it.guess || "",
            prefNote: "",
            prefPhrase: it.n,
          }),
      };
    }),
    onAccept: () => {
      setOrderState(o.id, "accepted");
      showToast(o.cust + " ka order pakka hua", () => setOrderState(o.id, "new"));
    },
  }));

  const pendingOrders = pending.map((o) => ({
    id: o.id,
    cust: o.cust,
    totalText: rs(o.total),
    summary: summary(o.items),
    onToggle: () => {
      setOrderState(o.id, "delivered");
      showToast(o.cust + " — deliver ho gaya", () => setOrderState(o.id, "accepted"));
    },
  }));

  const deliveredOrders = delivered.map((o) => ({
    id: o.id,
    cust: o.cust,
    totalText: rs(o.total),
    summary: summary(o.items),
    onToggle: () => {
      setOrderState(o.id, "accepted");
      showToast(o.cust + " — wapas 'baaki' mein daala", () => setOrderState(o.id, "delivered"));
    },
  }));

  const customerRows = s.customers.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    initial: c.name.charAt(0),
    dueText: c.due > 0 ? rs(c.due) : rs(0),
    dueLabel: c.due > 0 ? "Baaki" : "Chukta",
    dueColor: c.due > 0 ? "var(--color-destructive)" : "var(--color-success)",
    onOpen: () => {
      update({ custId: c.id, screen: "customer" });
      window.scrollTo(0, 0);
    },
  }));

  const custDetail = {
    name: cust.name,
    phone: cust.phone,
    telHref: telHref(cust.phone),
    dueText: rs(cust.due),
    dueColor: cust.due > 0 ? "var(--color-destructive)" : "var(--color-success)",
    prefCount: (cust.prefs || []).length,
    prefs: (cust.prefs || []).map((p, i) => ({
      cat: p.cat,
      item: p.item,
      note: p.note,
      onEdit: () =>
        update({
          sheet: "pref",
          prefKey: null,
          prefEditIdx: i,
          prefFromOrder: false,
          prefCustName: cust.name,
          prefCat: p.cat,
          prefPick: p.item,
          prefNote: p.note,
          prefPhrase: "",
        }),
    })),
    entries: cust.entries.map((e) => ({
      label: e.label,
      sub: e.sub,
      glyph: e.t === "pay" ? "₹" : "✓",
      dotBg: e.t === "pay" ? "var(--color-success)" : "var(--color-secondary)",
      dotInk: e.t === "pay" ? "#FFFFFF" : "var(--color-ink)",
      amtText: (e.t === "pay" ? "− " : "+ ") + rs(e.amt),
      amtColor: e.t === "pay" ? "var(--color-success)" : "var(--color-destructive)",
    })),
  };

  const submitPay = () => {
    if (payNum <= 0) {
      update({ sheet: null });
      return;
    }
    const before = s.customers;
    update({
      sheet: null,
      pay: "",
      customers: s.customers.map((c) =>
        c.id === cust.id
          ? {
              ...c,
              due: Math.max(0, c.due - payNum),
              entries: [{ t: "pay" as const, label: "Paisa mila", sub: "Abhi · Cash", amt: payNum }, ...c.entries],
            }
          : c
      ),
    });
    showToast(rs(payNum) + " khate mein likh diya", () => update({ customers: before }));
  };

  const submitCustomer = () => {
    const name = s.newName.trim();
    if (!name) {
      update({ sheet: null });
      return;
    }
    const before = s.customers;
    const nc: Customer = {
      id: "n" + Date.now(),
      name,
      phone: s.newPhone.trim() || "—",
      due: 0,
      entries: [{ t: "pay", label: "Khata khula", sub: "Abhi · Naya grahak", amt: 0 }],
    };
    update({ sheet: null, customers: s.customers.concat([nc]) });
    showToast(name + " khate mein jud gaye", () => update({ customers: before }));
  };

  const submitItem = () => {
    const name = s.itName.trim();
    const price = parseInt(s.itPrice || "0", 10) || 0;
    if (!name) {
      update({ sheet: null });
      return;
    }
    const before = s.items;
    const unit = s.itUnit.trim() || "per nag";
    if (s.editId) {
      update({ sheet: null, items: s.items.map((i) => (i.id === s.editId ? { ...i, n: name, u: unit, p: price } : i)) });
      showToast(name + " ka rate " + rs(price) + " kar diya", () => update({ items: before }));
    } else {
      update({ sheet: null, items: s.items.concat([{ id: "ni" + Date.now(), n: name, u: unit, p: price }]) });
      showToast(name + " list mein jud gaya", () => update({ items: before }));
    }
  };

  const submitPref = () => {
    const catName = s.prefCat.trim();
    const pick = s.prefPick;
    if (!catName || !pick) {
      update({ sheet: null });
      return;
    }
    if (s.prefFromOrder && s.prefKey) {
      const beforeR = s.resolved;
      const beforeC = s.customers;
      const prefKey = s.prefKey;
      update({
        sheet: null,
        resolved: { ...s.resolved, [prefKey]: pick },
        customers: s.customers.map((c) => {
          if (c.name !== s.prefCustName) return c;
          const prefs = (c.prefs || []).slice();
          const at = prefs.findIndex((p) => p.cat === catName);
          const row = { cat: catName, item: pick, note: s.prefNote.trim() || "Order se yaad rakha" };
          if (at >= 0) prefs[at] = row;
          else prefs.push(row);
          return { ...c, prefs };
        }),
      });
      showToast(pick + " lag gaya, pasand mein yaad rakha", () => update({ resolved: beforeR, customers: beforeC }));
      return;
    }
    const before = s.customers;
    update({
      sheet: null,
      customers: s.customers.map((c) => {
        if (c.id !== cust.id) return c;
        const prefs = (c.prefs || []).slice();
        const row = { cat: catName, item: pick, note: s.prefNote.trim() || "" };
        if (s.prefEditIdx !== null) prefs[s.prefEditIdx] = row;
        else prefs.push(row);
        return { ...c, prefs };
      }),
    });
    showToast(catName + ": " + pick + " yaad rakh liya", () => update({ customers: before }));
  };

  const catChips = Object.keys(CATALOG).map((k) => ({
    n: k,
    bg: s.prefCat === k ? "var(--color-secondary)" : "var(--color-card)",
    ink: s.prefCat === k ? "var(--color-primary)" : "var(--color-ink)",
    border: s.prefCat === k ? "var(--color-primary)" : "var(--color-warm-border)",
    onPick: () => update({ prefCat: k, prefPick: "" }),
  }));
  const choiceList = CATALOG[s.prefCat] || [];
  const noChoices = choiceList.length === 0;
  const prefChoices = choiceList.map((c, i) => {
    const picked = s.prefPick === c.n || s.prefPick.indexOf(c.n) === 0;
    return {
      n: c.n,
      sub: c.sub,
      picked,
      isTop: i === 0,
      bg: picked ? "oklch(0.95 0.04 155 / 0.25)" : "var(--color-card)",
      border: picked ? "var(--color-success)" : "var(--color-warm-border)",
      dotBorder: picked ? "var(--color-success)" : "oklch(0.72 0.06 90)",
      dotBg: picked ? "var(--color-success)" : "var(--color-card)",
      onPick: () => update({ prefPick: c.n }),
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

  const rateItems = s.items.map((i) => ({
    n: i.n,
    u: i.u,
    priceText: rs(i.p),
    onEdit: () => update({ sheet: "item", editId: i.id, itName: i.n, itUnit: i.u, itPrice: String(i.p) }),
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
          todayCount={s.orders.length}
          pendingCount={pending.length}
          newCount={news.length}
          hasNew={news.length > 0}
          newCountLabel={news.length ? news.length + " order dekhna baaki" : "Sab dekh liye"}
          trackingSub={pending.length + " delivery baaki, " + delivered.length + " ho gayi"}
          khataSub={s.customers.length + " grahak · " + rs(totalDue) + " baaki"}
          ratesSub={s.items.length + " item ke rate saved"}
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
          pendingCount={pending.length}
          pendingOrders={pendingOrders}
          deliveredCount={delivered.length}
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
              prefEditIdx: null,
              prefFromOrder: false,
              prefCustName: cust.name,
              prefCat: "",
              prefPick: "",
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
          onFileChosen={(f) => {
            update({ uploadName: f.name + " — padh liya" });
            showToast("List mil gayi. Rate check kar lijiye.", () => update({ uploadName: null }));
          }}
          itemCount={s.items.length}
          rateItems={rateItems}
          onOpenAddItem={() => update({ sheet: "item", editId: null, itName: "", itUnit: "", itPrice: "" })}
          onGoHome={() => go("home")}
        />
      )}

      {s.sheet === "pay" && (
        <PaySheet
          payAmountText={rs(payNum)}
          payHint={payNum > 0 ? cust.name + " ke khate mein" : "Number dabaiye"}
          keys={keys}
          onClose={() => update({ sheet: null })}
          onSubmit={submitPay}
        />
      )}

      {s.sheet === "add" && (
        <AddCustomerSheet
          newName={s.newName}
          newPhone={s.newPhone}
          onNameChange={(v) => update({ newName: v })}
          onPhoneChange={(v) => update({ newPhone: v })}
          onClose={() => update({ sheet: null })}
          onSubmit={submitCustomer}
        />
      )}

      {s.sheet === "item" && (
        <ItemSheet
          title={s.editId ? "Rate Badlein" : "Naya Item Jodiye"}
          itName={s.itName}
          itUnit={s.itUnit}
          itPrice={s.itPrice}
          onItNameChange={(v) => update({ itName: v })}
          onItUnitChange={(v) => update({ itUnit: v })}
          onItPriceChange={(v) => update({ itPrice: v.replace(/[^0-9]/g, "") })}
          onClose={() => update({ sheet: null })}
          onSubmit={submitItem}
        />
      )}

      {s.sheet === "pref" && (
        <PrefSheet
          title={s.prefFromOrder ? "Yeh kaunsa saman?" : s.prefEditIdx !== null ? "Pasand Badlein" : "Pasand Jodiye"}
          subtitle={s.prefFromOrder ? s.prefCustName + " ne kaha: " + s.prefPhrase : s.prefCustName + " ke liye"}
          prefCat={s.prefCat}
          onPrefCatChange={(v) => update({ prefCat: v, prefPick: "" })}
          catChips={catChips}
          noChoices={noChoices}
          prefChoices={prefChoices}
          prefNote={s.prefNote}
          onPrefNoteChange={(v) => update({ prefNote: v })}
          onClose={() => update({ sheet: null })}
          onSubmit={submitPref}
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
