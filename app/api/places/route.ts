import { NextResponse } from "next/server";
import {
  formatPhotonAddress,
  isSouthAfricaPlace,
  matchLandmarks,
  mergePlaceSuggestions,
  type PlaceSuggestion,
} from "@/lib/places";

export const dynamic = "force-dynamic";

type PhotonResponse = {
  features?: { properties?: Parameters<typeof formatPhotonAddress>[0] }[];
};

function southAfricaQuery(query: string) {
  return /south africa/i.test(query) ? query : `${query}, South Africa`;
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return NextResponse.json({ suggestions: [] });

  const local = matchLandmarks(query);
  let remote: PlaceSuggestion[] = [];

  try {
    const url = new URL("https://photon.komoot.io/api/");
    url.searchParams.set("q", southAfricaQuery(query));
    url.searchParams.set("limit", "15");
    url.searchParams.set("lat", "-26.2041");
    url.searchParams.set("lon", "28.0473");
    url.searchParams.set("bbox", "16.3,-34.85,32.95,-22.1");
    url.searchParams.set("lang", "en");

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (response.ok) {
      const data = (await response.json()) as PhotonResponse;
      remote = (data.features ?? [])
        .map((feature) => {
          const properties = feature.properties ?? {};
          const label = formatPhotonAddress(properties);
          return isSouthAfricaPlace(properties, label) ? { label } : null;
        })
        .filter((place): place is PlaceSuggestion => Boolean(place?.label && place.label.length > 4));
    }
  } catch {
    remote = [];
  }

  return NextResponse.json({
    suggestions: mergePlaceSuggestions(local, remote).slice(0, 8),
  });
}
