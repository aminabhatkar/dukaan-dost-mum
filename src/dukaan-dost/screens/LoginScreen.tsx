import { IconGoogle, IconShop } from "../components/icons";

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex min-h-screen flex-col justify-center px-7 py-9">
      <div className="mb-6 flex h-[88px] w-[88px] items-center justify-center rounded-[20px] bg-primary">
        <IconShop size={50} />
      </div>
      <h1 className="m-0 text-[42px] font-extrabold leading-[1.05] tracking-tight text-primary">
        DukaanDost
      </h1>
      <p className="mt-3.5 text-[21px] font-semibold leading-relaxed text-ink-muted">
        Namaste! Aapki dukaan ka
        <br />
        hisaab, ab phone mein.
      </p>
      <div className="h-11" />
      <button
        onClick={onLogin}
        className="flex w-full cursor-pointer items-center justify-center gap-3.5 rounded-2xl border-2 border-warm-border bg-card p-5 text-[22px] font-extrabold text-ink"
        style={{ boxShadow: "0 3px 10px rgba(72,55,32,.14)" }}
      >
        <IconGoogle size={28} />
        Google Se Login Karein
      </button>
      <p className="mt-5 text-base font-semibold leading-relaxed text-ink-subtle">
        Bas ek baar login. Password yaad rakhne ki zaroorat nahi.
      </p>
    </div>
  );
}
