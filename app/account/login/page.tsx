import Image from "next/image";
import Link from "next/link";
import { ClientLoginForm } from "@/components/account/ClientLoginForm";

export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ClientLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; order?: string }>;
}) {
  const query = await searchParams;
  return (
    <div className="login-screen">
      <div className="ops-card login-card">
        <Image src="/images/lions-route-logo.jpg" alt="Lion’s Route Shuttles SA" width={160} height={120} />
        <p className="kicker">Premium • Private • Bespoke</p>
        <h1>My booking</h1>
        <p>Clients: user is your email, password is your order number. Admin: user and password.</p>
        <ClientLoginForm defaultIdentifier={query.email || query.order || ""} />
        <div className="login-links">
          <Link href="/">Back to website</Link>
          <Link href="/#quote-form">Request a quote</Link>
        </div>
      </div>
    </div>
  );
}
