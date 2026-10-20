import { NextResponse } from "next/server";
import { formatPhotonAddress, matchLandmarks, mergePlaceSuggestions, type PlaceSuggestion } from "@/lib/places";

export const dynamic = "force-dynamic";

type PhotonResponse = {
  features?: { properties?: Parameters<typeof formatPhotonAddress>[0] }[];
};

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return NextResponse.json({ suggestions: [] });

  const local = matchLandmarks(query);
  let remote: PlaceSuggestion[] = [];

  try {
    const url = new URL("https://photon.komoot.io/api/");
    url.searchParams.set("q", query);
    url.searchParams.set("limit", "8");
    url.searchParams.set("lat", "-26.2041");
    url.searchParams.set("lon", "28.0473");
    url.searchParams.set("lang", "en");

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (response.ok) {
      const data = (await response.json()) as PhotonResponse;
      remote = (data.features ?? [])
        .map((feature) => formatPhotonAddress(feature.properties ?? {}))
        .filter((label) => label.length > 4)
        .map((label) => ({ label }));
    }
  } catch {
    remote = [];
  }

  return NextResponse.json({
    suggestions: mergePlaceSuggestions(local, remote).slice(0, 8),
  });
}
