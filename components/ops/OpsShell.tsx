"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CarFront,
  ClipboardList,
  Banknote,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  ShieldAlert,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { logout } from "@/app/actions/auth";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/trips", label: "Orders", icon: ClipboardList },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/drivers", label: "Drivers", icon: CarFront },
  { href: "/admin/safety", label: "Safety", icon: ShieldAlert },
  { href: "/admin/payments", label: "Payments", icon: Banknote },
];

const driverLinks = [{ href: "/driver", label: "My trips", icon: ClipboardList }];

function isActive(pathname: string, href: string) {
  if (href === "/admin" || href === "/driver") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function OpsShell({
  role,
  name,
  email,
  children,
}: {
  role: "admin" | "driver";
  name: string;
  email?: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = role === "admin" ? adminLinks : driverLinks;
  const home = role === "admin" ? "/admin" : "/driver";
  const current = links.find((link) => isActive(pathname, link.href))?.label ?? (role === "admin" ? "Dashboard" : "My trips");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={open ? "ops-shell is-open" : "ops-shell"}>
      <header className="ops-topbar">
        <button type="button" className="ops-menu-btn" aria-expanded={open} aria-controls="ops-sidebar" onClick={() => setOpen(true)}>
          <Menu size={22} />
          <span>Menu</span>
        </button>
        <strong>{current}</strong>
      </header>

      <button type="button" className="ops-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />

      <aside id="ops-sidebar" className="ops-sidebar">
        <div className="ops-sidebar-head">
          <Link href={home} className="ops-brand" onClick={() => setOpen(false)}>
            <Image src="/images/lions-route-logo.jpg" alt="Lion’s Route Shuttles SA" width={48} height={36} />
            <span>
              <strong>Lion&apos;s Route</strong>
              <small>{role === "admin" ? "Admin" : "Driver"}</small>
            </span>
          </Link>
          <button type="button" className="ops-close-btn" aria-label="Close menu" onClick={() => setOpen(false)}>
            <X size={22} />
          </button>
        </div>

        <nav className="ops-nav" aria-label="Operations">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(pathname, link.href);
            return (
              <Link key={link.href} href={link.href} className={active ? "is-active" : undefined} onClick={() => setOpen(false)}>
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ops-sidebar-foot">
          <div className="ops-profile">
            <span className="ops-avatar" aria-hidden="true">
              <UserRound size={18} />
            </span>
            <span>
              <b>{email || name}</b>
              <small>{role === "admin" ? "Admin" : "Driver"}</small>
            </span>
          </div>
          <form action={logout}>
            <button type="submit" className="ops-logout">
              <LogOut size={16} />
              Logout
            </button>
          </form>
        </div>
      </aside>

      <div className="ops-body">
        <main className="ops-main">{children}</main>
      </div>

      <a className="ops-whatsapp" href="https://wa.me/27768269683" target="_blank" rel="noreferrer">
        <MessageCircle size={22} />
        <span>WhatsApp us</span>
      </a>
    </div>
  );
}
