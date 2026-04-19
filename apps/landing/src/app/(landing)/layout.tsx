import Navbar from "@/components/landing/Navbar";
import SiteFooter from "@/components/landing/SiteFooter";
import CookieConsentBanner from "@/components/landing/CookieConsentBanner";
import ScrollReveal from "@/components/landing/ScrollReveal";

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <ScrollReveal />
      {children}
      <SiteFooter />
      <CookieConsentBanner />
    </>
  );
}