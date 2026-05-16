import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Justin Whalen | ClearPath WV",
  description:
    "Save Justin Whalen's ClearPath contact card, send a quick note, or see a short workflow example.",
};

export default function JustinBusinessCardPage() {
  return (
    <main className="min-h-screen bg-navy-950">
      <iframe
        src="/justin/card.html"
        title="Justin Whalen ClearPath business card"
        className="block min-h-screen w-full border-0"
        loading="eager"
      />
    </main>
  );
}
