"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Mail, Menu, MessageCircle, Phone, X } from "lucide-react";
import { useState } from "react";
import { destinations, mainNav } from "@/lib/site-content";

export function Header() {
  const [open, setOpen] = useState(false);
  const [destinationsOpen, setDestinationsOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="contact-strip">
        <div className="shell contact-strip-inner">
          <a href="mailto:mazenoch@gmail.com"><Mail size={14} /> Mazenoch@gmail.com</a>
          <a href="https://wa.me/27768269683" target="_blank" rel="noreferrer"><MessageCircle size={14} /> 076 826 9683 WhatsApp</a>
          <a href="tel:+27768269683"><Phone size={14} /> 076 826 9683</a>
          <Link href="/account/login">My booking</Link>
          <Link className="top-quote" href="/#quote-form">Get a Quick Quote</Link>
        </div>
      </div>

      <div className="shell nav-shell">
        <Link href="/" className="logo-link" aria-label="Lion’s Route Shuttles SA home">
          <Image src="/images/lions-route-logo.jpg" alt="Lion’s Route Shuttles SA" width={200} height={150} priority />
        </Link>

        <button
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
          <span className="sr-only">Toggle navigation</span>
        </button>

        <nav id="main-navigation" className={open ? "main-nav is-open" : "main-nav"} aria-label="Main navigation">
          {mainNav.map((item) =>
            item.dropdown ? (
              <div className="nav-dropdown" key={item.href}>
                <div className="nav-parent-row">
                  <Link href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>
                  <button
                    aria-label="Toggle game reserve destinations"
                    aria-expanded={destinationsOpen}
                    onClick={() => setDestinationsOpen((value) => !value)}
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                <div className={destinationsOpen ? "dropdown-menu mobile-open" : "dropdown-menu"}>
                  {destinations.map((destination) => (
                    <Link
                      key={destination.slug}
                      href={`/${destination.slug}/`}
                      onClick={() => setOpen(false)}
                    >
                      {destination.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>
            ),
          )}
        </nav>
      </div>
    </header>
  );
}
