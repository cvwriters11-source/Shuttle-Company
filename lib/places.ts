export type PlaceSuggestion = { label: string };

type Landmark = { aliases: string[]; label: string };

const landmarks: Landmark[] = [
  {
    aliases: ["or tambo", "o.r. tambo", "ortambo", "jnb", "johannesburg airport"],
    label: "O.R. Tambo International Airport, Kempton Park, Gauteng, 1627, South Africa",
  },
  {
    aliases: ["lanseria", "hla"],
    label: "Lanseria International Airport, Lanseria, Gauteng, 1748, South Africa",
  },
  {
    aliases: ["cape town airport", "cpt"],
    label: "Cape Town International Airport, Matroosfontein, Western Cape, 7490, South Africa",
  },
  {
    aliases: ["king shaka", "durban airport", "dur"],
    label: "King Shaka International Airport, La Mercy, KwaZulu-Natal, 4407, South Africa",
  },
  {
    aliases: ["orange grove", "8th avenue", "lion"],
    label: "86 8th Avenue, Orange Grove, Johannesburg, 2192, South Africa",
  },
  {
    aliases: ["sandton"],
    label: "Sandton City, Rivonia Road, Sandton, Johannesburg, Gauteng, 2196, South Africa",
  },
  {
    aliases: ["sun city"],
    label: "Sun City Resort, Sun City, North West, 0316, South Africa",
  },
  {
    aliases: ["kruger"],
    label: "Kruger National Park, Mpumalanga, South Africa",
  },
  {
    aliases: ["hoedspruit"],
    label: "Hoedspruit, Limpopo, 1380, South Africa",
  },
  {
    aliases: ["madikwe"],
    label: "Madikwe Game Reserve, North West, South Africa",
  },
  {
    aliases: ["pilanesberg"],
    label: "Pilanesberg Game Reserve, North West, South Africa",
  },
  {
    aliases: ["sabi"],
    label: "Sabi Sand Game Reserve, Mpumalanga, South Africa",
  },
  {
    aliases: ["welgevonden"],
    label: "Welgevonden Game Reserve, Limpopo, South Africa",
  },
  {
    aliases: ["marataba"],
    label: "Marataba, Waterberg, Limpopo, South Africa",
  },
  {
    aliases: ["nambiti"],
    label: "Nambiti Private Game Reserve, Ladysmith, KwaZulu-Natal, South Africa",
  },
  {
    aliases: ["mabula"],
    label: "Mabula Game Lodge, Bela-Bela, Limpopo, South Africa",
  },
  {
    aliases: ["marloth"],
    label: "Marloth Park, Mpumalanga, 1341, South Africa",
  },
  {
    aliases: ["park station", "johannesburg station"],
    label: "Johannesburg Park Station, Rissik Street, Johannesburg, Gauteng, 2001, South Africa",
  },
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function matchLandmarks(query: string, limit = 6): PlaceSuggestion[] {
  const needle = normalize(query);
  if (needle.length < 2) return [];
  return landmarks
    .filter((place) => {
      const haystack = normalize(`${place.label} ${place.aliases.join(" ")}`);
      return haystack.includes(needle) || needle.split(" ").every((part) => haystack.includes(part));
    })
    .slice(0, limit)
    .map((place) => ({ label: place.label }));
}

type PhotonProperties = {
  name?: string;
  street?: string;
  housenumber?: string;
  district?: string;
  city?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
  countrycode?: string;
};

export function formatPhotonAddress(properties: PhotonProperties) {
  const street = [properties.housenumber, properties.street].filter(Boolean).join(" ");
  const parts = [
    street,
    properties.name && properties.name !== properties.street ? properties.name : "",
    properties.district,
    properties.city || properties.county,
    properties.state,
    properties.postcode,
    properties.country,
  ].filter(Boolean);
  return [...new Set(parts)].join(", ");
}

export function mergePlaceSuggestions(...lists: PlaceSuggestion[][]) {
  const seen = new Set<string>();
  const merged: PlaceSuggestion[] = [];
  for (const list of lists) {
    for (const place of list) {
      const key = normalize(place.label);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      merged.push(place);
    }
  }
  return merged;
}
