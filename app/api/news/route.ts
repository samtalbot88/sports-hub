import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

export const runtime = "nodejs"; // Node runtime (not edge) for consistent XML parsing

type NewsItem = {
  title: string;
  link: string;
  source?: string;
  pubDate?: string;
};

function buildGoogleNewsRssUrl(query: string) {
  const q = encodeURIComponent(query);

  // ✅ UK edition (better relevance + fewer region issues for UK users)
  return `https://news.google.com/rss/search?q=${q}&hl=en-GB&gl=GB&ceid=GB:en`;
}

function safeText(v: unknown): string {
  if (typeof v === "string") return v;
  if (v == null) return "";
  return String(v);
}

function safeLink(v: unknown): string {
  // Google News RSS sometimes returns link as string, sometimes as { "@_href": "..." }
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && "@_href" in (v as any)) {
    return safeText((v as any)["@_href"]);
  }
  return safeText(v);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // ✅ Default query: FIFA World Cup 2026, with exclusions to avoid cricket/U19/etc
    const defaultQuery =
      `("FIFA World Cup 2026" OR "World Cup 2026" OR "WC 2026") ` +
      `-cricket -icc -u19 -"u-19" -"under-19" -"under 19" -rugby -t20 -ipl`;

    const q = (searchParams.get("q")?.trim() || defaultQuery).trim();

    const limit = Math.min(
      Math.max(Number(searchParams.get("limit") || "20"), 1),
      50
    );

    const rssUrl = buildGoogleNewsRssUrl(q);

    const res = await fetch(rssUrl, {
      // Cache on server for a short period to avoid hammering Google News
      next: { revalidate: 300 },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; WorldCupHub/1.0; +https://example.com)",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Google News RSS fetch failed`, status: res.status },
        { status: 500 }
      );
    }

    const xml = await res.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });

    const parsed = parser.parse(xml);

    const itemsRaw = parsed?.rss?.channel?.item ?? [];
    const itemsArray = Array.isArray(itemsRaw) ? itemsRaw : [itemsRaw];

    // ✅ Last-line filter to reduce off-topic World Cup (cricket/u19/etc)
    const badTitle = /(cricket|icc|u-?19|under\s*19|rugby|t20|ipl)/i;

    const items: NewsItem[] = itemsArray
      .map((it: any) => {
        const title = safeText(it?.title);
        const link = safeLink(it?.link);

        // Google News RSS often has source in "source" with text value
        const source =
          safeText(it?.source?.["#text"]) ||
          safeText(it?.source) ||
          safeText(it?.publisher) ||
          "";

        const pubDate =
          safeText(it?.pubDate) ||
          safeText(it?.published) ||
          safeText(it?.updated) ||
          "";

        return {
          title,
          link,
          source: source || undefined,
          pubDate: pubDate || undefined,
        };
      })
      .filter((x) => x.title && x.link)
      .filter((x) => !badTitle.test(x.title)) // ✅ remove obvious non-football World Cup noise
      .slice(0, limit);

    return NextResponse.json({
      query: q,
      items,
      fetchedAt: new Date().toISOString(),
      edition: "en-GB / GB",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
