# DukaanDost

**Bolo, aur bill ban gaya.** Speak, and the bill is made.

DukaanDost turns a customer's voice note into a priced, confirmed order and an automatic khata (credit ledger) entry for small Indian kirana and dairy shops. The customer keeps messaging their shop the way they already do. The shopkeeper stops writing orders into a notebook while serving the counter.

Live demo: https://dukaan-dost-mum.lovable.app

> Built as a capstone project for DIT - AI Fellowship, where the team finished **runner-up**.

---

## The problem

A typical neighbourhood shop takes 20 to 40 orders a day over WhatsApp voice notes and phone calls, many of them on running credit (udhaar) for 40 to 80 regular households. Orders get written into a paper notebook from memory, at speed, while the owner is also serving customers at the counter. Items get missed, rates get mixed up, and the month-end settlement turns into an argument.

Digital khata apps already exist and are free, but they only digitise the ledger *after* the sale. Nothing captures the order at the moment the customer speaks it. That is the gap DukaanDost targets: the ledger is a by-product of the order, not the product.

## How it works

```
Customer sends a voice note or text (Telegram today, WhatsApp-ready)
        |
Speech-to-text (Sarvam AI, Hindi / Hinglish)
        |
Split into item phrases, extract quantity and unit
        |
Match each item against the shop's own catalog
  - synonym map (milk -> doodh, Devanagari -> romanised)
  - Postgres trigram similarity (pg_trgm)
  - unclear items: guess from this customer's saved preferences,
    then from the shop's most-ordered item in that category
        |
Customer gets an itemised, priced confirmation card
  (guesses are labelled, unknown items are flagged, never silently substituted)
        |
Customer replies HAAN / NAHI, or sends a correction
        |
Order appears in the shopkeeper app -> Accept -> Delivered
        |
On delivery, a charge is posted to the customer's khata
and the customer is notified automatically
```

## Features

**Customer side (chat)**
- Voice notes and typed orders, in Hindi, English and Hinglish
- Confirmation card with per-line prices and a total before anything is committed
- Corrections by simply sending a new message; cancel with "nahi"
- Status messages when the order is accepted and delivered
- Phone-number identity via Telegram's contact share

**Shopkeeper app** (mobile-first web app, Hinglish UI)
- **Orders:** new orders as they arrive, with guessed items highlighted for a one-tap "Yahi Hai" or "Badlein"
- **Tracking:** accepted and delivered orders; marking Delivered posts the khata charge
- **Khata:** customer list with live balances, payment recording, full transaction history
- **Rate List:** the shop's catalog, with **photo upload** that reads a handwritten or printed rate list into catalog items (Gemini vision)
- **Iski Pasand:** per-customer preferences ("wahi wala sabun" resolves to this customer's usual soap)
- Undo on every action, including money actions

## Design decisions worth calling out

- **The ledger is append-only.** UPDATE and DELETE on `ledger_entries` are blocked at the database level. Every correction, including an undo, is written as a reversal row. A customer's balance is always `SUM(amount)` over their entries and is never stored, so it cannot drift.
- **Never silently guess.** A low-confidence match is never quietly swapped for an unrelated item at a real price. Uncertain lines are labelled as guesses on the confirmation card, and unrecognised ones are flagged for the shopkeeper.
- **Charge on delivery, not on confirmation.** Orders that are confirmed but never delivered never touch the khata.
- **Idempotent webhooks.** Each inbound message id is unique-indexed, so provider retries cannot create duplicate orders.
- **Channel-agnostic pipeline.** The ordering logic talks to a small `ChannelAdapter` interface (`send`, `downloadMedia`), so Telegram and WhatsApp share the same code path.
- **Status notifications from the database.** A Postgres trigger calls the notification endpoint through `pg_net` when an order's state changes, authenticated with a shared secret that is generated inside the database.

## Tech stack

| Layer | Tool |
|---|---|
| App framework | TanStack Start (React 19, TypeScript, Vite), built with Lovable |
| UI | Tailwind CSS, shadcn/ui |
| Database | Supabase Postgres, `pg_trgm`, `pg_net` |
| Speech-to-text | Sarvam AI (`saarika:v2.5`) |
| Rate-list photo reading | Google Gemini (vision) |
| Messaging | Telegram Bot API (working), Twilio WhatsApp (wired up) |

## Project structure

```
src/
  dukaan-dost/            shopkeeper app: screens, components, data helpers
  lib/whatsapp/
    pipeline.server.ts    channel-agnostic ordering pipeline
    sarvam.server.ts      speech-to-text
    telegram.server.ts    Telegram channel adapter
    twilio.server.ts      WhatsApp (Twilio) channel adapter
  routes/api/public/
    telegram-webhook.ts   inbound Telegram messages
    whatsapp-webhook.ts   inbound WhatsApp messages
    parse-rate-list.ts    rate-list photo to catalog items
    notify-order-status.ts  order status messages to customers
supabase/migrations/      schema changes, matching function, triggers
```

## Running it yourself

```bash
bun install
bun run dev
```

Server-side secrets (set in Lovable Cloud secrets or your environment):

| Variable | Used for |
|---|---|
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (and `VITE_` versions) | Database access |
| `SARVAM_API_KEY` | Voice note transcription |
| `TELEGRAM_BOT_TOKEN` | Telegram ordering channel |
| `GEMINI_API_KEY` | Rate-list photo parsing |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` | WhatsApp channel (optional) |

## Current status and known limitations

This is a working capstone prototype, not a production system. Being upfront about what is and isn't done:

- **Telegram is the live demo channel.** The WhatsApp path is fully wired through Twilio, but outbound messages are blocked by Twilio's trial-tier restrictions.
- **Login is a placeholder.** There is no real authentication yet.
- **Row-Level Security is not enabled** on the app tables. The app is single-tenant for now and was built for demo use.
- **Parsing is rule-based, not LLM-based.** Phrase splitting and quantity extraction use patterns, which keeps it fast and cheap but means unusual phrasing can be missed.
- **Single shop.** Multi-tenant support (a `shop_id` boundary) is planned but not built.

## Roadmap

- Real shopkeeper authentication and Row-Level Security
- WhatsApp Business Cloud API as the primary channel
- An evaluation set of real voice notes to measure order-level accuracy
- A starter catalog of common kirana items to cut setup time for new shops
- Multi-shop support
