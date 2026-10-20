import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      <div id="main-content">{children}</div>
      <Footer />
    </>
  );
}
