import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-overlay">
        <div className="shell footer-grid">
          <div>
            <Image className="footer-logo" src="/images/lions-route-logo.jpg" alt="Lion’s Route Shuttles SA" width={280} height={210} />
            <p>
              Your premium travel partner in South Africa. Safe, reliable and luxurious
              transport for international tourists, corporate clients and local guests.
            </p>
            <p className="brand-promise">Premium • Private • Bespoke</p>
          </div>
          <div>
            <h2>Contact Us</h2>
            <a href="mailto:mazenoch@gmail.com"><Mail size={17} /> Mazenoch@gmail.com</a>
            <a href="tel:+27768269683"><Phone size={17} /> 076 826 9683</a>
            <a href="https://wa.me/27768269683"><MessageCircle size={17} /> WhatsApp us</a>
          </div>
          <div>
            <h2>Service Areas</h2>
            <p className="icon-copy"><MapPin size={19} /> Johannesburg, Pretoria, Cape Town, Durban, Mpumalanga and nationwide.</p>
            <p>86 8th Avenue, Orange Grove, Johannesburg, 2192</p>
            <Link className="button button-orange" href="/contact-us/">Get a Quote</Link>
          </div>
        </div>
        <div className="copyright">
          <div className="shell">© {new Date().getFullYear()} Lion&apos;s Route Shuttles SA. All rights reserved. <Link href="/account/login">Sign in</Link></div>
        </div>
      </div>
    </footer>
  );
}
