import { NextResponse } from "next/server";

const BASE_URL = "https://api.football-data.org/v4";

export async function GET() {
  const token = process.env.FOOTBALL_DATA_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "Missing FOOTBALL_DATA_TOKEN" },
      { status: 500 }
    );
  }

  try {
    // World Cup = competition code "WC"
    const res = await fetch(`${BASE_URL}/competitions/WC/matches`, {
      headers: {
        "X-Auth-Token": token,
      },
      next: { revalidate: 60 }, // cache for 1 min
    });

    if (!res.ok) {
      throw new Error(`Football API error ${res.status}`);
    }

    const data = await res.json();

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
