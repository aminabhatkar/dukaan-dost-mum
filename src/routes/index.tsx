import { createFileRoute } from "@tanstack/react-router";
import DukaanDostApp from "../dukaan-dost/DukaanDostApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DukaanDost — Aapki dukaan ka hisaab" },
      { name: "description", content: "Aapki dukaan ka hisaab, ab phone mein. Orders, delivery tracking, customer khata, and rate list." },
      { property: "og:title", content: "DukaanDost — Aapki dukaan ka hisaab" },
      { property: "og:description", content: "Aapki dukaan ka hisaab, ab phone mein. Orders, delivery tracking, customer khata, and rate list." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <DukaanDostApp />;
}
