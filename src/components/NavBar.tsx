"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type NavItem = {
  label: string;
  href: string;
};

export default function NavBar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const lastY = useRef(0);

  const items: NavItem[] = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Gallery", href: "/gallery" },
      { label: "Artists", href: "/artists" },
      { label: "Commission", href: "/commission" },
    ],
    []
  );

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;

      // Shrink threshold
      setScrolled(y > 10);

      // Hide/show logic:
      // - don’t hide near the very top
      // - hide only when scrolling DOWN with enough delta
      // - show immediately when scrolling UP a little
      const delta = y - lastY.current;

      if (y < 40) {
        setHidden(false);
      } else if (delta > 8) {
        // scrolling down
        setHidden(true);
      } else if (delta < -6) {
        // scrolling up
        setHidden(false);
      }

      lastY.current = y;
    };

    // init
    lastY.current = window.scrollY;
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu on route change
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Logo shrink + title fade (subtle)
  const logoDotSize = scrolled ? "h-2 w-2" : "h-2.5 w-2.5";
  const brandTextClass = scrolled
    ? "max-w-[7.5rem] opacity-85"
    : "max-w-[14rem] opacity-95";

  return (
    <header className="nav-shell">
      <nav
        className={`nav-glass ${scrolled ? "is-scrolled" : ""} ${
          hidden ? "is-hidden" : ""
        }`}
        aria-label="Primary"
      >
        <div className="flex items-center justify-between gap-3">
          {/* Brand */}
          <Link
            href="/"
            className={[
              "group inline-flex items-center gap-2 rounded-full px-2 py-1",
              "text-sm font-semibold tracking-tight text-white/95",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20",
            ].join(" ")}
            aria-label="Vibrant Art Group, Home"
          >
            <span
              className={[
                "inline-block rounded-full bg-white/90 transition-all duration-200",
                logoDotSize,
              ].join(" ")}
              aria-hidden="true"
            />
            <span
              className={[
                "overflow-hidden whitespace-nowrap transition-all duration-200",
                brandTextClass,
              ].join(" ")}
              style={{
                // Subtle fade + compress rather than hard hide
                WebkitMaskImage:
                  "linear-gradient(to right, rgba(0,0,0,1) 70%, rgba(0,0,0,0))",
                maskImage:
                  "linear-gradient(to right, rgba(0,0,0,1) 70%, rgba(0,0,0,0))",
              }}
            >
              Vibrant Art Group
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "relative rounded-full px-3 py-2 text-sm font-medium",
                    "text-white/85 hover:text-white",
                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20",
                    active ? "text-white" : "opacity-90 hover:opacity-100",
                  ].join(" ")}
                >
                  {item.label}
                  <span
                    className={[
                      "pointer-events-none absolute left-1/2 top-full mt-1 h-[3px] w-6 -translate-x-1/2 rounded-full transition-opacity duration-200",
                      active ? "opacity-100" : "opacity-0",
                    ].join(" ")}
                    style={{ backgroundImage: "var(--brand-gradient)" }}
                  />
                </Link>
              );
            })}

            {/* Primary CTA */}
            <Link href="/commission" className="btn btn-primary ml-2">
              Request
            </Link>
          </div>

          {/* Mobile button */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white/90 shadow-sm backdrop-blur-md transition hover:bg-white/14 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20 md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? "Close" : "Menu"}
          </button>
        </div>

        {/* Mobile panel */}
        <div
          id="mobile-nav"
          className={[
            "md:hidden",
            mobileOpen ? "block" : "hidden",
            scrolled ? "mt-2" : "mt-3",
          ].join(" ")}
        >
          <div className="mt-3 grid gap-2 rounded-3xl border border-white/18 bg-white/10 p-3 backdrop-blur-md">
            {items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "flex items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium",
                    "text-white/85 hover:text-white hover:bg-white/10",
                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20",
                    active ? "bg-white/10 text-white" : "",
                  ].join(" ")}
                >
                  <span>{item.label}</span>
                  {active ? (
                    <span
                      className="h-[6px] w-[26px] rounded-full"
                      style={{ backgroundImage: "var(--brand-gradient)" }}
                      aria-hidden="true"
                    />
                  ) : null}
                </Link>
              );
            })}

            <Link href="/commission" className="btn btn-primary mt-1 w-full">
              Request a commission
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
