import Link from "next/link";

type CardProps = {
  title: string;
  description: string;
  href?: string;
  badge?: string;
  disabled?: boolean;
};

function Card({ title, description, href, badge, disabled }: CardProps) {
  const base =
    "group block rounded-2xl border p-5 transition hover:bg-muted/40";
  const disabledCls = "opacity-60 cursor-not-allowed hover:bg-transparent";
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="text-lg font-semibold">{title}</div>
        {badge ? (
          <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 text-sm font-medium">
        {disabled ? (
          <span className="text-muted-foreground">Coming soon</span>
        ) : (
          <span className="underline underline-offset-4">
            View {title.toLowerCase()} →
          </span>
        )}
      </div>
    </>
  );

  if (disabled || !href) {
    return <div className={`${base} ${disabledCls}`}>{body}</div>;
  }

  return (
    <Link href={href} className={base}>
      {body}
    </Link>
  );
}

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Hero */}
      <section className="rounded-3xl border p-8 md:p-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
            Vibrant Art Group • Family-made artwork & commissions
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Art commissions with heart — built by a family of makers.
          </h1>

          <p className="mt-4 text-base text-muted-foreground">
            Browse featured work, request a custom commission, or explore the
            artists behind the craft. Every request is reviewed by an artist
            before any payment is requested.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/commission"
              className="rounded-lg bg-black px-4 py-2 text-white"
            >
              Request a commission
            </Link>
            <Link
              href="/gallery"
              className="rounded-lg border px-4 py-2"
            >
              Browse the gallery
            </Link>
            <Link
              href="/artists"
              className="rounded-lg border px-4 py-2"
            >
              Meet the artists
            </Link>
          </div>

          <div className="mt-6 text-xs text-muted-foreground">
            Note: Commission estimates are a starting point. Final quotes are
            confirmed by the artist after reviewing your request.
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-semibold">Explore</h2>
          <div className="text-sm text-muted-foreground">
            You’ve built the foundation — this page keeps everything discoverable.
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card
            title="Gallery"
            description="Featured pieces and placeholders for upcoming work. Click an item to view details and start a commission from it."
            href="/gallery"
            badge="Live"
          />
          <Card
            title="Artists"
            description="Artist bios, availability, and capabilities. This will expand over time as more family members join."
            href="/artists"
            badge="Live"
          />
          <Card
            title="Commission Request"
            description="Multi-step wizard with estimate preview, artist preference, and a structured request flow."
            href="/commission"
            badge="Live"
          />
          <Card
            title="Admin Queue"
            description="Internal request management: status, assignment, and admin notes. Protect before public launch."
            href="/admin/requests"
            badge="Internal"
          />
          <Card
            title="Community-Supported Commissions"
            description="Submit a request for consideration in monthly community-supported picks. Optional tips/donations later."
            disabled
            badge="Planned"
          />
          <Card
            title="Shop & Available Works"
            description="List completed works for sale, mark availability, and accept purchases once you’re ready."
            disabled
            badge="Planned"
          />
        </div>
      </section>

      {/* What to expect */}
      <section className="mt-10 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border p-6">
          <h3 className="text-lg font-semibold">How commissions work</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Submit your request, the artist reviews details, and a final quote is
            confirmed before any payment is requested.
          </p>
        </div>
        <div className="rounded-2xl border p-6">
          <h3 className="text-lg font-semibold">Deposits</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Large or time-intensive pieces may require a deposit after approval.
            The estimated deposit range is shown up front.
          </p>
        </div>
        <div className="rounded-2xl border p-6">
          <h3 className="text-lg font-semibold">Respectful timelines</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            We prioritize quality. Rush is sometimes possible, but it’s never
            guaranteed.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 border-t pt-6 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>© {new Date().getFullYear()} Vibrant Art Group</div>
          <div className="flex gap-4">
            <Link className="underline underline-offset-4" href="/gallery">
              Gallery
            </Link>
            <Link className="underline underline-offset-4" href="/commission">
              Commission
            </Link>
            <Link className="underline underline-offset-4" href="/artists">
              Artists
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
