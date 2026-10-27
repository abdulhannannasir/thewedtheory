import { SiteFooter } from "@/components/sites/twt/site-footer";

/** Shared frame of the inner pages: the page itself, then the footer. The front page has neither. */
export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
