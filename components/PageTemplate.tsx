import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { destinations, SitePage } from "@/lib/site-content";
import { QuoteForm } from "./QuoteForm";

export function PageTemplate({ page }: { page: SitePage }) {
  const showDestinations = page.slug === "game-reserve-shuttle-south-africa";

  return (
    <main>
      <section className="interior-hero">
        <Image src={page.image} alt="" fill sizes="100vw" priority />
        <div className="interior-hero-shade" />
        <div className="shell interior-hero-content">
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p>{page.description}</p>
          <Link href="#quote-form" className="button button-orange">Request a Quick Quote</Link>
        </div>
      </section>

      <section className="section">
        <div className="shell content-with-aside">
          <article className="rich-content">
            {page.sections.map((section) => (
              <section key={section.heading}>
                <p className="kicker">LION&apos;S ROUTE SHUTTLES SA</p>
                <h2>{section.heading}</h2>
                {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </section>
            ))}
            <div className="trust-list">
              {["All-inclusive rates", "Licensed professional drivers", "24/7 availability"].map((item) => (
                <span key={item}><CheckCircle2 size={19} /> {item}</span>
              ))}
            </div>
          </article>
          <aside>
            <QuoteForm compact />
          </aside>
        </div>
      </section>

      {showDestinations && (
        <section className="section section-pale">
          <div className="shell">
            <div className="section-heading">
              <p className="kicker">CHOOSE YOUR DESTINATION</p>
              <h2>South Africa’s Leading Safari Regions</h2>
            </div>
            <div className="destination-grid">
              {destinations.map((destination) => (
                <Link className="destination-card" href={`/${destination.slug}/`} key={destination.slug}>
                  <Image src={destination.image} alt={destination.label} fill sizes="(max-width: 700px) 100vw, 33vw" />
                  <span>{destination.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {page.faqs && (
        <section className="section faq-section">
          <div className="shell narrow">
            <div className="section-heading">
              <p className="kicker">HELPFUL INFORMATION</p>
              <h2>Frequently Asked Questions</h2>
            </div>
            {page.faqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <section className="cta-band">
        <div className="shell">
          <div>
            <p className="eyebrow">PREMIUM • PRIVATE • BESPOKE</p>
            <h2>Your Premium Travel Partner in South Africa</h2>
          </div>
          <Link href="/contact-us/" className="button button-light">Plan Your Transfer</Link>
        </div>
      </section>
    </main>
  );
}
