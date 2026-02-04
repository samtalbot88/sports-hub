"use client";

import { useEffect, useMemo, useState } from "react";

type NewsItem = {
  title: string;
  link: string;
  source?: string;
  pubDate?: string;
};

function formatDate(pubDate?: string) {
  if (!pubDate) return "";
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return pubDate;

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export default function NewsShell() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((data) => {
        setItems((data?.items ?? []) as NewsItem[]);
      })
      .finally(() => setLoading(false));
  }, []);

  const sorted = useMemo(() => {
    const copy = [...items];
    copy.sort((a, b) => {
      const ad = new Date(a.pubDate ?? 0).getTime();
      const bd = new Date(b.pubDate ?? 0).getTime();
      return bd - ad;
    });
    return copy;
  }, [items]);

  if (loading) {
    return <div className="text-white/70 text-sm">Loading news…</div>;
  }

  if (sorted.length === 0) {
    return <div className="text-white/70 text-sm">No articles found.</div>;
  }

  return (
    <div className="space-y-3">
      {sorted.map((item) => {
        const source = item.source?.trim() || "News";
        const date = formatDate(item.pubDate);

        return (
          <a
            key={`${item.link}-${item.title}`}
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="block rounded-2xl border-2 border-white/20 bg-emerald-900/35 p-4 shadow-lg backdrop-blur-sm transition hover:bg-emerald-900/55 active:scale-[0.99]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] font-bold text-white/70 truncate">
                {source}
              </div>

              {date ? (
                <div className="text-[11px] font-bold text-white/60 shrink-0">
                  {date}
                </div>
              ) : null}
            </div>

            <div className="mt-2 text-sm sm:text-base font-extrabold text-white leading-snug">
              {item.title}
            </div>

            <div className="mt-2 text-xs font-bold text-emerald-200">
              Read →
            </div>
          </a>
        );
      })}
    </div>
  );
}
