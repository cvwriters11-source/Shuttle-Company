import Image from "next/image";
import Link from "next/link";
import { Baby, BriefcaseBusiness, Check, Luggage, MapPin, Plane, ShieldCheck, Users } from "lucide-react";
import { QuoteForm } from "@/components/QuoteForm";
import { destinations, reasons, services } from "@/lib/site-content";

const fleet = [
  { name: "10 Seater Minivan", image: "/images/minivan-10-professional.webp" },
  { name: "14 Seater Minivan", image: "/images/minivan-14-professional.webp" },
  { name: "SUV With Trailer", image: "/images/suv-trailer-professional.webp" },
  { name: "23 Seater Bus", image: "/images/bus-professional.webp" },
];

const attractions = [
  { name: "Apartheid Museum", image: "/images/apartheid-museum.webp" },
  { name: "Soweto", image: "/images/mandela-museum.webp" },
  { name: "Kruger National Park", image: "/images/kruger.webp" },
  { name: "Pilanesberg", image: "/images/pilanesberg.webp" },
];

export default function Home() {
  return (
    <main>
      <section className="home-hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">PREMIUM <b>• PRIVATE • BESPOKE</b></p>
            <h1><span>Lion&apos;s Route Shuttles SA</span><br />Your Premium Travel Partner in South Africa</h1>
            <p className="hero-intro">We don&apos;t just drive you — we welcome you to South Africa</p>
            <div className="award-mini brand-mini">
              <div>
                <strong>Premium • Private • Bespoke</strong>
                <span>LION&apos;S ROUTE SHUTTLES SA</span>
                <small>Safe, reliable and luxurious transport for tourists, corporates and local guests</small>
              </div>
            </div>
          </div>
          <QuoteForm compact />
        </div>
      </section>

      <section className="section intro-section">
        <div className="shell intro-grid">
          <div>
            <p className="kicker">ABOUT US</p>
            <h2>A Premium Shuttle and Tour Service from Johannesburg</h2>
            <p>Lion&apos;s Route Shuttles SA is a premium shuttle and tour service based in Orange Grove, Johannesburg. We specialise in providing safe, reliable and luxurious transport solutions for international tourists, corporate clients and local guests.</p>
            <p>Our philosophy is rooted in professional, warm and respectful service — taking the lion&apos;s route across South Africa with pride.</p>
            <Link href="/contact-us/" className="button button-orange">Plan Your Journey</Link>
          </div>
          <div className="intro-photo">
            <Image src="/images/destinations-intro.webp" alt="Private Lion’s Route transfer in South Africa" fill sizes="(max-width: 800px) 100vw, 50vw" />
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="shell">
          <div className="section-heading light">
            <p className="kicker">SAFE • RELIABLE • COMFORTABLE</p>
            <h2>A Vehicle for Every Journey</h2>
            <p>Individuals, families and groups travel comfortably with room for every suitcase.</p>
          </div>
          <div className="fleet-grid">
            {fleet.map((vehicle) => (
              <article key={vehicle.name}>
                <div className="fleet-image"><Image src={vehicle.image} alt={vehicle.name} fill sizes="25vw" /></div>
                <h3>{vehicle.name}</h3>
              </article>
            ))}
          </div>
          <div className="feature-row">
            <span><Baby /> Child car seats available</span>
            <span><Baby /> Booster seats available</span>
            <span><Luggage /> Luggage trailers available</span>
          </div>
        </div>
      </section>

      <section className="section section-pale" id="services">
        <div className="shell">
          <div className="section-heading">
            <p className="kicker">OUR SERVICES</p>
            <h2>Luxury Transport Across South Africa</h2>
          </div>
          <div className="service-grid">
            {services.map((service) => (
              <article key={service.title}>
                <h3>{service.title}</h3>
                <p>{service.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section meet-section">
        <div className="shell meet-grid">
          <Image src="/images/meet-greet-lions-route.webp" alt="Lion’s Route airport meet and greet service" width={650} height={650} />
          <div>
            <p className="kicker">WHY INTERNATIONAL CLIENTS CHOOSE US</p>
            <h2>Local Knowledge with International Standards</h2>
            <p>Professional, punctual and licensed drivers collect you in clean, air-conditioned executive vehicles. Rates are all-inclusive: fuel, driver and overtime, with no hidden costs.</p>
            <ul className="check-list">
              {reasons.map((reason) => (
                <li key={reason}><Check /> {reason}</li>
              ))}
            </ul>
            <Link className="text-link" href="/or-tambo-airport-shuttle/">Explore airport transfers →</Link>
          </div>
        </div>
      </section>

      <section className="section section-pale" id="destinations">
        <div className="shell">
          <div className="section-heading">
            <p className="kicker">FROM THE AIRPORT TO THE WILD</p>
            <h2>Popular Shuttle Destinations</h2>
          </div>
          <div className="destination-grid">
            {destinations.slice(0, 6).map((destination) => (
              <Link className="destination-card" href={`/${destination.slug}/`} key={destination.slug}>
                <Image src={destination.image} alt={destination.label} fill sizes="(max-width: 700px) 100vw, 33vw" />
                <span>{destination.label}</span>
              </Link>
            ))}
          </div>
          <div className="center"><Link className="button button-orange" href="/game-reserve-shuttle-south-africa/">View All Destinations</Link></div>
        </div>
      </section>

      <section className="award-section">
        <div className="shell award-grid">
          <div>
            <p className="eyebrow">PREMIUM • PRIVATE • BESPOKE</p>
            <h2>Your Premium Travel Partner in South Africa</h2>
            <p className="award-years">Johannesburg · Pretoria · Cape Town · Durban · Mpumalanga · Nationwide</p>
            <p>We don&apos;t just drive you — we welcome you to South Africa with professional, warm and respectful service.</p>
            <Link href="/contact-us/" className="button button-light">Plan Your Journey</Link>
          </div>
          <Image className="award-brand-logo" src="/images/lions-route-logo.jpg" alt="Lion’s Route Shuttles SA" width={320} height={240} />
        </div>
      </section>

      <section className="section">
        <div className="shell group-grid">
          <div className="group-photo"><Image src="/images/bus-professional.webp" alt="Lion’s Route group transport" fill sizes="50vw" /></div>
          <div>
            <p className="kicker">EXECUTIVE & EVENT TRANSFERS</p>
            <h2>Weddings, Conferences and Special Occasions</h2>
            <p>From airport collections to weddings, parties, funerals and conferences, we provide reliable executive transport tailored to your schedule.</p>
            <div className="service-icons">
              <span><Users /> Conferences</span>
              <span><BriefcaseBusiness /> Weddings & events</span>
              <span><MapPin /> Venue transfers</span>
              <span><ShieldCheck /> 24/7 airport collections</span>
              <span><Plane /> Inter-provincial travel</span>
            </div>
            <Link href="/event-transportation-conference-shuttles/" className="button button-orange">Group Transport</Link>
          </div>
        </div>
      </section>

      <section className="section attraction-section">
        <div className="shell">
          <div className="section-heading light">
            <p className="kicker">TOURISM & DAY TOURS</p>
            <h2>Signature Experiences Across South Africa</h2>
          </div>
          <div className="attraction-grid">
            {attractions.map((attraction) => (
              <div key={attraction.name}>
                <Image src={attraction.image} alt={attraction.name} fill sizes="25vw" />
                <span>{attraction.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="shell">
          <div>
            <p className="eyebrow">YOUR PREMIUM TRAVEL PARTNER</p>
            <h2>Tell Us Where You’re Going</h2>
          </div>
          <Link href="/contact-us/" className="button button-light">Get a Quick Quote</Link>
        </div>
      </section>
    </main>
  );
}
