export type FAQ = { question: string; answer: string };

export type SitePage = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  sections: { heading: string; body: string[] }[];
  faqs?: FAQ[];
};

export const destinations = [
  { label: "Hoedspruit", slug: "hoedspruit-shuttle-service", image: "/images/hoedspruit.webp" },
  { label: "Mabula", slug: "mabula-shuttle-service", image: "/images/mabula.webp" },
  { label: "Madikwe Game Reserve", slug: "madikwe-game-reserve", image: "/images/madikwe.webp" },
  { label: "Marataba", slug: "marataba-shuttle-service-transfers-transport", image: "/images/marataba.webp" },
  { label: "Marloth Park", slug: "marloth-park-shuttle", image: "/images/kruger.webp" },
  { label: "Nambiti", slug: "nambiti-game-reserve-shuttles-transport", image: "/images/nambiti.webp" },
  { label: "Pilanesberg", slug: "pilanesberg-game-reserve-shuttle-service", image: "/images/pilanesberg.webp" },
  { label: "Sabi Sands", slug: "sabi-sands-shuttle-service", image: "/images/sabi-sands.webp" },
  { label: "Welgevonden", slug: "welgevonden-game-reserve", image: "/images/welgevonden.webp" },
];

export const company = {
  name: "Lion's Route Shuttles SA",
  tagline: "Premium • Private • Bespoke",
  promise: "Your Premium Travel Partner in South Africa",
  welcome: "We don't just drive you — we welcome you to South Africa.",
};

export const services = [
  {
    title: "Tourism & Day Tours",
    body: "Soweto, Apartheid Museum, Table Mountain in Cape Town, uShaka Marine World in Durban, Gold Reef City, Lesedi Cultural Village, Pilanesberg, Kruger National Park and the Garden Route.",
  },
  {
    title: "Airport Transfers",
    body: "24/7 transfers from O.R. Tambo, Lanseria, Cape Town International and King Shaka International to hotels, lodges and private residences.",
  },
  {
    title: "Long Distance & Road Trips",
    body: "Johannesburg to Cape Town, Johannesburg to Durban, the Garden Route and inter-provincial travel in executive vehicles.",
  },
  {
    title: "Executive & Event Transfers",
    body: "Weddings, parties, funerals, conferences and corporate functions with punctual, professional drivers.",
  },
];

export const reasons = [
  "Professional, punctual and licensed drivers",
  "Clean, air-conditioned executive vehicles",
  "All-inclusive rates: fuel, driver and overtime included, with no hidden costs",
  "Long working hours: drivers available from 08:00 to 24:00",
  "24/7 availability and personalised service",
  "Local knowledge with international standards",
];

const standardFaqs = (destination: string): FAQ[] => [
  {
    question: `Where does the ${destination} shuttle collect passengers?`,
    answer:
      "We collect door-to-door from homes, hotels, guesthouses and offices throughout Johannesburg, Pretoria and Gauteng, as well as inside the arrivals hall at O.R. Tambo International Airport.",
  },
  {
    question: "Can we stop for comfort breaks?",
    answer:
      "Yes. Your journey is private and comfort breaks can be taken at suitable stops along the route whenever required.",
  },
  {
    question: "How do I request a quote?",
    answer:
      "Complete the quick quote form with your pick-up and drop-off. You will receive an order number made from your initials. Sign in with your email and that order number as the password to track the driver, share the route and send feedback. Admin sees the same booking for safety. You can also email Mazenoch@gmail.com or WhatsApp 076 826 9683.",
  },
];

const makeDestination = (
  slug: string,
  title: string,
  image: string,
  details: string,
): SitePage => ({
  slug,
  title: `${title} Shuttle Service`,
  eyebrow: "PRIVATE DOOR-TO-DOOR TRANSFERS",
  description: `Safe, comfortable private transfers from Johannesburg and O.R. Tambo Airport to ${title}.`,
  image,
  sections: [
    {
      heading: `Private Transfers to ${title}`,
      body: [
        `Lion's Route provides reliable private transport from Johannesburg, Sandton, Rosebank, Pretoria and O.R. Tambo International Airport to ${title}. ${details}`,
        "Our professional drivers collect you at a time and place that suits your itinerary. Every transfer is private, direct and planned around your party.",
      ],
    },
    {
      heading: "Travel in Comfort",
      body: [
        "Choose from comfortable sedans, SUVs, minibuses and larger group vehicles. Child seats, booster seats and luggage trailers are available by prior arrangement.",
        "We transport guests safely across South Africa and take pride in friendly service, punctual collections and a relaxed journey.",
      ],
    },
  ],
  faqs: standardFaqs(title),
});

export const pages: Record<string, SitePage> = {
  reviews: {
    slug: "reviews",
    title: "Client Reviews",
    eyebrow: "PREMIUM • PRIVATE • BESPOKE",
    description:
      "Discover the personal service and attention to detail behind every Lion’s Route journey.",
    image: "/images/hero.webp",
    sections: [
      {
        heading: "A Warm South African Welcome",
        body: [
          "We thank every guest who takes the time to travel with us and share their experience.",
          "Our team is committed to professional, friendly and dependable personal service on every journey.",
        ],
      },
      {
        heading: "Service That Goes the Extra Mile",
        body: [
          "From airport meet-and-greet collections to long-distance safari transfers, our drivers focus on safety, comfort and personal service.",
        ],
      },
    ],
  },
  "game-reserve-shuttle-south-africa": {
    slug: "game-reserve-shuttle-south-africa",
    title: "Game Reserve Shuttle Services Across South Africa",
    eyebrow: "YOUR SAFARI STARTS WITH THE JOURNEY",
    description:
      "Private game reserve transfers from Johannesburg and O.R. Tambo to South Africa’s leading safari destinations.",
    image: "/images/kruger.webp",
    sections: [
      {
        heading: "Safari Shuttles from Johannesburg",
        body: [
          "Lion's Route connects travellers from Johannesburg, O.R. Tambo, Lanseria, Pretoria, Sandton and Rosebank with lodges, gates and camps across South Africa.",
          "Whether you are travelling solo, as a family or with a group, we have a comfortable vehicle and private transfer to match your journey.",
        ],
      },
      {
        heading: "All Major Safari Destinations",
        body: [
          "Travel to Kruger National Park, Pilanesberg, Madikwe, Sabi Sands, Welgevonden, Hoedspruit, Marloth Park, Marataba, Nambiti and more.",
        ],
      },
    ],
    faqs: standardFaqs("game reserve"),
  },
  "hoedspruit-shuttle-service": makeDestination(
    "hoedspruit-shuttle-service",
    "Hoedspruit",
    "/images/hoedspruit.webp",
    "Travel in air-conditioned comfort directly to your lodge in one of South Africa’s most popular safari regions.",
  ),
  "mabula-shuttle-service": makeDestination(
    "mabula-shuttle-service",
    "Mabula Game Reserve",
    "/images/mabula.webp",
    "Enjoy a straightforward private transfer to this malaria-free Waterberg reserve.",
  ),
  "madikwe-game-reserve": makeDestination(
    "madikwe-game-reserve",
    "Madikwe Game Reserve",
    "/images/madikwe.webp",
    "Reach your lodge in this renowned malaria-free Big Five reserve without the stress of self-driving.",
  ),
  "marataba-shuttle-service-transfers-transport": makeDestination(
    "marataba-shuttle-service-transfers-transport",
    "Marataba",
    "/images/marataba.webp",
    "Our direct service takes you deep into the Waterberg to your Marataba lodge.",
  ),
  "marloth-park-shuttle": makeDestination(
    "marloth-park-shuttle",
    "Marloth Park",
    "/images/kruger.webp",
    "Travel from Gauteng to your accommodation on the southern boundary of Kruger National Park.",
  ),
  "nambiti-game-reserve-shuttles-transport": makeDestination(
    "nambiti-game-reserve-shuttles-transport",
    "Nambiti Game Reserve",
    "/images/nambiti.webp",
    "Relax on a private long-distance transfer to your Nambiti lodge in KwaZulu-Natal.",
  ),
  "pilanesberg-game-reserve-shuttle-service": makeDestination(
    "pilanesberg-game-reserve-shuttle-service",
    "Pilanesberg Game Reserve",
    "/images/pilanesberg.webp",
    "Door-to-door transport is available from airports, hotels, homes and guesthouses.",
  ),
  "sabi-sands-shuttle-service": makeDestination(
    "sabi-sands-shuttle-service",
    "Sabi Sands Game Reserve",
    "/images/sabi-sands.webp",
    "Arrive rested and ready for safari at your private Sabi Sands lodge.",
  ),
  "welgevonden-game-reserve": makeDestination(
    "welgevonden-game-reserve",
    "Welgevonden Game Reserve",
    "/images/welgevonden.webp",
    "Our service connects Gauteng with lodge pickup points in this remarkable Waterberg reserve.",
  ),
  "sun-city-shuttle": makeDestination(
    "sun-city-shuttle",
    "Sun City",
    "/images/sun-city.webp",
    "Private transfers make day trips, holidays, conferences and resort stays easy.",
  ),
  "kruger-park-shuttle": makeDestination(
    "kruger-park-shuttle",
    "Kruger National Park",
    "/images/kruger.webp",
    "We travel to Kruger gates, camps, hotels and private lodges throughout the region.",
  ),
  "or-tambo-airport-shuttle": {
    slug: "or-tambo-airport-shuttle",
    title: "O.R. Tambo Airport Shuttle",
    eyebrow: "JOHANNESBURG AIRPORT TRANSFERS",
    description:
      "Reliable door-to-door airport transfers across Johannesburg, Pretoria, Gauteng and beyond.",
    image: "/images/airport.webp",
    sections: [
      {
        heading: "24/7 Airport Transfers Across South Africa",
        body: [
          "Lion's Route provides private airport transfers from O.R. Tambo, Lanseria, Cape Town International and King Shaka International to hotels, lodges and private residences.",
          "Airport collections include meet-and-greet service inside the arrivals hall. Your driver will display your name, help with luggage and escort you to the vehicle.",
        ],
      },
      {
        heading: "All-Inclusive, On Time",
        body: [
          "Rates include fuel, driver and overtime, with no hidden costs. We monitor arriving flights, adjust collection times for delays, and remain available 24/7.",
        ],
      },
    ],
    faqs: [
      {
        question: "Does Lion’s Route monitor delayed flights?",
        answer: "Yes. We monitor incoming flights and adjust airport collection times accordingly.",
      },
      ...standardFaqs("O.R. Tambo airport"),
    ],
  },
  "event-transportation-conference-shuttles": {
    slug: "event-transportation-conference-shuttles",
    title: "Event & Conference Transportation",
    eyebrow: "EXECUTIVE & EVENT TRANSFERS",
    description:
      "Professional transport for weddings, parties, funerals, conferences and corporate functions.",
    image: "/images/drakensberg.webp",
    sections: [
      {
        heading: "Keep Your Guests Moving",
        body: [
          "Lion's Route provides executive event transfers for weddings, parties, funerals, conferences and corporate functions.",
          "Our clean, air-conditioned vehicles and licensed drivers keep every collection punctual, private and professionally presented.",
        ],
      },
      {
        heading: "Planned Around Your Event",
        body: [
          "Share your itinerary and we will coordinate pickup points, arrival windows and return transfers. All-inclusive rates cover fuel, driver and overtime, with no hidden costs.",
        ],
      },
    ],
  },
  "contact-us": {
    slug: "contact-us",
    title: "Contact Lion’s Route Shuttles SA",
    eyebrow: "WE’RE READY TO PLAN YOUR JOURNEY",
    description:
      "Contact us for private airport, safari, long-distance and group shuttle requirements.",
    image: "/images/hero.webp",
    sections: [
      {
        heading: "Your Premium Travel Partner in South Africa",
        body: [
          "Lion's Route Shuttles SA is a premium shuttle and tour service based at 86 8th Avenue, Orange Grove, Johannesburg, 2192.",
          "We serve Johannesburg, Pretoria, Cape Town, Durban, Mpumalanga and destinations nationwide. Email Mazenoch@gmail.com, call 076 826 9683, or send us a WhatsApp on the same number.",
        ],
      },
      {
        heading: "24/7 Availability",
        body: [
          "Tell us your collection point, destination, date and passenger count. Drivers are available from 08:00 to 24:00, with 24/7 airport and personalised service on request.",
        ],
      },
    ],
    faqs: standardFaqs("private shuttle"),
  },
};

export const mainNav = [
  { label: "HOME", href: "/" },
  { label: "CLIENT REVIEWS", href: "/reviews/" },
  { label: "GAME RESERVE DESTINATIONS", href: "/game-reserve-shuttle-south-africa/", dropdown: true },
  { label: "SUN CITY SHUTTLE", href: "/sun-city-shuttle/" },
  { label: "KRUGER PARK SHUTTLE", href: "/kruger-park-shuttle/" },
  { label: "OR TAMBO AIRPORT SHUTTLE", href: "/or-tambo-airport-shuttle/" },
  { label: "CONTACT US", href: "/contact-us/" },
];
