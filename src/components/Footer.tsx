import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer-horizon" aria-label="Site footer">
      <div className="footer-inner">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand + short line */}
          <div className="max-w-md">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full bg-white/90"
                aria-hidden="true"
              />
              <span className="text-base font-semibold tracking-tight text-white/95">
                Vibrant Art Group
              </span>
            </div>

            <p className="mt-2 text-sm text-white/75">
              A family artist collective for commissions, originals, and custom work.
              Built with care for clarity and accessibility.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="footer-chip">Commissions</span>
              <span className="footer-chip">Original Art</span>
              <span className="footer-chip">Custom Requests</span>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-white/90">Explore</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link className="footer-link" href="/gallery">
                    Gallery
                  </Link>
                </li>
                <li>
                  <Link className="footer-link" href="/artists">
                    Artists
                  </Link>
                </li>
                <li>
                  <Link className="footer-link" href="/commission">
                    Request a commission
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white/90">Details</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link className="footer-link" href="/commission#process">
                    Process
                  </Link>
                </li>
                <li>
                  <Link className="footer-link" href="/commission#pricing">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link className="footer-link" href="/commission#faq">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white/90">Contact</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a className="footer-link" href="mailto:hello@vibrantart.group">
                    hello@vibrantart.group
                  </a>
                </li>
                <li>
                  <a className="footer-link" href="#" aria-disabled="true">
                    Instagram (soon)
                  </a>
                </li>
                <li>
                  <a className="footer-link" href="#" aria-disabled="true">
                    Facebook (soon)
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-10 flex flex-col gap-3 border-t border-white/12 pt-5 text-sm text-white/65 md:flex-row md:items-center md:justify-between">
          <span>© {year} Vibrant Art Group. All rights reserved.</span>
          <div className="flex flex-wrap gap-4">
            <Link className="footer-link" href="/privacy">
              Privacy
            </Link>
            <Link className="footer-link" href="/terms">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
