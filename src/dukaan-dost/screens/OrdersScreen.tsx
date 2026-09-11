import { TopBar } from "../components/TopBar";
import { IconBoxCheck, IconCheck, IconGuess, IconPhone } from "../components/icons";

export interface NewOrderItemView {
  n: string;
  q: string;
  isVague: boolean;
  isFixed: boolean;
  fixedText: string;
  guess: string;
  guessWhy: string;
  onConfirm: () => void;
  onChange: () => void;
}

export interface NewOrderView {
  id: string;
  cust: string;
  phone: string;
  time: string;
  telHref: string;
  totalText: string;
  items: NewOrderItemView[];
  onAccept: () => void;
}

export function OrdersScreen({
  orders,
  onGoHome,
}: {
  orders: NewOrderView[];
  onGoHome: () => void;
}) {
  return (
    <div className="pb-28">
      <TopBar backLabel="Ghar" onBack={onGoHome} title="Naye Orders" />

      {orders.length > 0 ? (
        <div className="flex flex-col gap-4 px-4 pt-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="overflow-hidden rounded-2xl border-2 border-warm-border bg-card"
              style={{ boxShadow: "0 3px 10px rgba(72,55,32,.14)" }}
            >
              <div className="flex items-start gap-3 border-b-2 border-dashed border-warm-border-light p-4 pb-3">
                <div className="min-w-0 flex-1">
                  <div className="text-2xl font-extrabold tracking-tight">{o.cust}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-base font-bold text-ink-muted">
                    <IconPhone size={18} color="var(--color-success)" />
                    {o.phone}
                  </div>
                </div>
                <div className="flex-none rounded-lg bg-secondary px-2.5 py-1.5 text-[15px] font-extrabold text-ink-muted">
                  {o.time}
                </div>
              </div>

              <div className="flex flex-col gap-2 px-4 pt-3 pb-1">
                {o.items.map((it, ix) => (
                  <div key={ix} className="flex flex-col">
                    <div className="flex justify-between gap-3 text-[19px] font-semibold">
                      <span>{it.n}</span>
                      <span className="font-extrabold whitespace-nowrap">{it.q}</span>
                    </div>
                    {it.isVague && (
                      <div className="mt-2 rounded-xl border-2 border-accent/60 bg-secondary p-3">
                        <div className="flex items-center gap-2">
                          <IconGuess size={19} color="var(--color-warning-foreground)" />
                          <span className="text-[15px] font-extrabold tracking-wide text-warning-foreground">
                            PICHLI BAAR KA
                          </span>
                        </div>
                        <div className="mt-1.5 text-[20px] font-extrabold leading-tight">{it.guess}</div>
                        <div className="mt-[3px] text-base font-semibold text-ink-subtle">{it.guessWhy}</div>
                        <div className="mt-2.5 flex gap-2">
                          <button
                            onClick={it.onConfirm}
                            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[11px] border-2 border-success/60 bg-card py-3 text-[17px] font-extrabold text-success"
                          >
                            <IconCheck size={19} color="currentColor" strokeWidth={3.2} />
                            Yahi Hai
                          </button>
                          <button
                            onClick={it.onChange}
                            className="flex flex-1 cursor-pointer items-center justify-center rounded-[11px] border-2 border-warm-border bg-card py-3 text-[17px] font-extrabold text-ink"
                          >
                            Badlein
                          </button>
                        </div>
                      </div>
                    )}
                    {it.isFixed && (
                      <div className="mt-1.5 flex items-center gap-2 text-base font-bold text-success">
                        <IconCheck size={18} color="currentColor" strokeWidth={3.2} />
                        {it.fixedText}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mx-4 mt-3.5 flex items-center justify-between rounded-xl bg-secondary p-3 px-3.5">
                <span className="text-[19px] font-bold">Total</span>
                <span className="text-[28px] font-extrabold tracking-tight">{o.totalText}</span>
              </div>

              <div className="flex gap-2.5 p-4">
                <a
                  href={o.telHref}
                  className="flex flex-none items-center justify-center gap-2 rounded-xl border-2 border-warm-border bg-card px-4 py-4 text-[18px] font-extrabold no-underline text-ink"
                >
                  <IconPhone size={20} color="currentColor" />
                  Phone
                </a>
                <button
                  onClick={o.onAccept}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-xl border-2 border-warm-border bg-success py-4 text-[20px] font-extrabold text-success-foreground"
                >
                  <IconCheck size={24} color="currentColor" strokeWidth={3.2} />
                  Order Pakka
                </button>
              </div>
            </div>
          ))}
          <div className="h-2" />
        </div>
      ) : (
        <div className="px-8 py-14 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-secondary">
            <IconBoxCheck size={52} color="var(--color-ink-subtle)" />
          </div>
          <div className="mt-5 text-[26px] font-extrabold">Abhi koi naya order nahi</div>
          <div className="mt-2.5 text-[19px] font-semibold leading-relaxed text-ink-subtle">
            Sab order dekh liye. Naya order aayega to yahin dikhega.
          </div>
          <button
            onClick={onGoHome}
            className="mt-6 cursor-pointer rounded-xl border-2 border-warm-border bg-card px-5 py-4 text-[19px] font-extrabold text-ink"
            style={{ boxShadow: "0 3px 10px rgba(72,55,32,.14)" }}
          >
            Ghar Wapas
          </button>
        </div>
      )}
    </div>
  );
}
